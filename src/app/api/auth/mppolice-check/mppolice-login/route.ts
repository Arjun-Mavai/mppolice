import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

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
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
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

    // ── Sign JWT Token ──────────────────────────────────────────
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { signToken } = await import('@/lib/jwt');
    const token = signToken(payload);

    if (!token) {
      throw new Error('Token generation failed');
    }

    // ── Set HTTP-Only Cookie (30 days) ──────────────────────────
    const cookieStore = await cookies();
    cookieStore.set('mppolice_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

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
