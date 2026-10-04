import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';
import { setAuthCookies } from '@/lib/auth-constants';
import { getClientIp, getClientLocation } from '@/lib/ip';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔑 LOGIN API — Email + Password → JWT cookie set karo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Flow: Rate limit → Find user → Check soft-delete → Check expiry
//       → Compare password → Sign JWT → Set cookie → Return user
//
// Blocks login if:
//   1. User soft-deleted (deletedAt != null) → "Account deactivated"
//   2. Access expired (accessExpiresAt < now) → "Access expired" with date
//
// Scalability: Rate limited (15 min window), bcrypt compare, indexed email lookup
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function POST(request: Request) {
  let email: string | undefined;

  try {
    // ── Rate Limiting ───────────────────────────────────────────
    const ip = getClientIp(request.headers);
    const { loginLimiter, checkRateLimit } = await import('@/lib/rate-limit');

    const { success, limit, remaining, reset } = await checkRateLimit(loginLimiter, ip);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again after 15 minutes.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    const body = await request.json();
    email = body.email;
    const password = body.password;
    // 🛡️ Device ID from client's IndexedDB WebCrypto vault (sent at login time)
    const deviceId = typeof body.deviceId === 'string' ? body.deviceId.trim() : undefined;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // ── Find User by Email ──────────────────────────────────────
    const dbUsers = await db
      .select()
      .from(mppscUsers)
      .where(eq(mppscUsers.email, email.toLowerCase().trim()))
      .limit(1);
    const user = dbUsers[0];

    // 🛡️ SECURITY: Timing Attack Protection
    // We run a dummy comparison even if user doesn't exist to prevent email enumeration
    const dummyHash = '$2a$10$ZyP8.Yf1A0Xl6U8K5N9Z.O1X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1'; // Valid format but wrong salt/pass
    
    if (!user) {
      await bcrypt.compare(password, dummyHash);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // ── Soft Delete Check ─────
    if (user.deletedAt) {
      await bcrypt.compare(password, dummyHash); // Maintain timing
      return NextResponse.json(
        { error: 'Account deactivated. Contact admin for reactivation.' },
        { status: 403 }
      );
    }

    // ── Active Check — admin can toggle this off to block login ──
    if (user.isActive === false) {
      return NextResponse.json(
        {
          error: 'Account is currently inactive. Contact admin to reactivate.',
          code: 'ACCOUNT_INACTIVE',
        },
        { status: 403 }
      );
    }

    // ── Access Expiry Check — only for paid plans with expiry set ──
    // Free users have no expiry (null) → always allowed
    let currentPlanTier = user.planTier;
    let currentIsSubscribed = user.isSubscribed;

    if (user.accessExpiresAt && user.planTier !== 'free') {
      const now = new Date();
      const expiryDate = new Date(user.accessExpiresAt);
      if (expiryDate < now) {
        // Downgrade to free instead of blocking login
        await db
          .update(mppscUsers)
          .set({ planTier: 'free', isSubscribed: false })
          .where(eq(mppscUsers.id, user.id));
        // Still allow login — user sees free tier content
        currentPlanTier = 'free';
        currentIsSubscribed = false;
      }
    }

    // ── Password Verification ───────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // 🚨 Robust Rate Limiting: Count failure against a stricter limiter and ENFORCE it
      const { loginFailureLimiter, checkRateLimit } = await import('@/lib/rate-limit');
      const { success } = await checkRateLimit(loginFailureLimiter, ip);

      if (!success) {
        return NextResponse.json(
          { error: 'Too many failed login attempts. Please try again after 15 minutes.' },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // ── Sign JWT Token (embed deviceId for hardware binding) ────
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      ...(deviceId ? { deviceId } : {}),
    };

    const { signToken } = await import('@/lib/jwt');
    const token = signToken(payload);

    if (!token) {
      throw new Error('Token generation failed');
    }

    // ── Telegram Login Notification (Backgrounded) ───────────────
    try {
      const { sendTelegramNotification, escapeHTML } = await import('@/lib/telegram');
      const userAgent = request.headers.get('user-agent') || 'Unknown Device';
      const location = await getClientLocation(request.headers, ip);
      const telegramMessage =
        `🔑 <b>New Login — MP Police Elite</b>\n\n` +
        `👤 <b>User:</b> ${escapeHTML(user.name || 'Anonymous')}\n` +
        `📧 <b>Email:</b> ${escapeHTML(user.email)}\n` +
        `🏆 <b>Plan:</b> ${escapeHTML((user.planTier as string)?.toUpperCase() || 'FREE')}\n` +
        `📱 <b>Device:</b> ${escapeHTML(userAgent.slice(0, 100))}\n` +
        `🌐 <b>Real IP:</b> ${escapeHTML(ip)}\n` +
        `📍 <b>Location:</b> ${escapeHTML(location)}\n` +
        (deviceId ? `🔐 <b>Device ID:</b> <code>${escapeHTML(deviceId.slice(0, 20))}...</code>\n` : '') +
        `⏱️ <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} IST`;

      sendTelegramNotification(telegramMessage).catch((e) => {
        logger.error('Telegram login notification failed (non-blocking)', e, { category: 'admin' });
      });
    } catch {
      // Construction failed — non-blocking
    }

    // ── Set Standardized Auth & Device Cookies (stealth names) ──
    const cookieStore = await cookies();
    setAuthCookies(cookieStore, token, deviceId);

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        is_subscribed: currentIsSubscribed,
        plan_tier: currentPlanTier,
        role: user.role,
        access_expires_at: user.accessExpiresAt,
      },
    });
  } catch (error) {
    logger.error('Login error:', error, {
      category: 'auth',
      metadata: { email },
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
