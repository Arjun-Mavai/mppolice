'use server';

import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';
import { hasActiveAuthSession, touchAuthLoginMetadata } from '@/lib/auth-session-metadata';
import { after } from 'next/server';
import { setAuthCookies } from '@/lib/auth-constants';
import { getClientIp, getClientLocation } from '@/lib/ip';
import { escapeHTML, sendTelegramNotification } from '@/lib/telegram';

/**
 * 🔐 Get Current User (Server Action)
 *
 * Bhai, ye function JWT se user data nikalta hai.
 * Frontend ko userId bhejne ki zaroorat nahi — sab server pe hota hai!
 *
 * Benefits:
 * - No API endpoint visible in Network tab
 * - userId never exposed to client
 * - Automatic cookie handling
 */
export async function getCurrentUser() {
  const { verifyAuthWithMismatch } = await import('@/lib/auth');
  const { user, _mismatch, _deviceMismatch } = await verifyAuthWithMismatch();
  logger.debug('SERVER ACTION getCurrentUser result', {
    category: 'auth',
    userId: user?.id,
    metadata: {
      authenticated: Boolean(user),
      mismatch: Boolean(_mismatch),
      deviceMismatch: Boolean(_deviceMismatch),
    },
  });

  if (_mismatch) {
    return { user: null, reason: 'multi_device' };
  }

  // 🛡️ Device mismatch — cookie was copied to another browser/device
  if (_deviceMismatch) {
    return { user: null, reason: 'device_mismatch' };
  }

  if (!user) {
    return { user: null };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isSubscribed: !!user.isSubscribed,
      planTier: user.planTier || 'free',
      role: user.role ?? undefined,
      accessExpiresAt: user.accessExpiresAt ?? undefined,
    },
  };
}

interface LoginParams {
  email?: string;
  password?: string;
  force?: boolean;
  deviceId?: string;
}

/**
 * 🔑 Login User (Server Action)
 *
 * Bhai, ye function email aur password leke user ko login karata hai.
 * API route se move kiya gaya taaki security aur consistency bani rahe.
 */
export async function loginUserAction(formData: LoginParams) {
  const { email, password, force, deviceId } = formData;
  const normalizedDeviceId = deviceId?.trim() || null;

  try {
    // ── Rate Limiting ───────────────────────────────────────────
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const { loginLimiter, checkRateLimit } = await import('@/lib/rate-limit');

    const { success } = await checkRateLimit(loginLimiter, ip);

    if (!success) {
      return {
        error: 'Too many login attempts. Please try again after 15 minutes.',
      };
    }

    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    // ── Find User by Email ──────────────────────────────────────
    const dbUsers = await db
      .select({
        id: mppscUsers.id,
        createdAt: mppscUsers.createdAt,
        email: mppscUsers.email,
        password: mppscUsers.password,
        name: mppscUsers.name,
        isSubscribed: mppscUsers.isSubscribed,
        planTier: mppscUsers.planTier,
        role: mppscUsers.role,
        deletedAt: mppscUsers.deletedAt,
        isActive: mppscUsers.isActive,
        sessionVersion: mppscUsers.sessionVersion,
        accessExpiresAt: mppscUsers.accessExpiresAt,
        phone: mppscUsers.phone,
        examType: mppscUsers.examType,
        // Read JSONB as text so postgres-js does not try to JSON.parse an
        // already-decoded driver object before the auth action can normalize it.
        metadataText: sql<string>`(${mppscUsers.metadata})::text`,
      })
      .from(mppscUsers)
      .where(
        and(
          eq(mppscUsers.email, email.toLowerCase().trim()),
          sql`(${mppscUsers.examType} = 'mppolice' OR ${mppscUsers.examType} = 'all')`
        )
      )
      .limit(1);
    const rawUser = dbUsers[0];
    const user = rawUser
      ? {
          ...rawUser,
          metadata:
            rawUser.metadataText && typeof rawUser.metadataText === 'string'
              ? (() => {
                try {
                  return JSON.parse(rawUser.metadataText) as Record<string, unknown>;
                } catch {
                  logger.warn('Invalid user metadata ignored during login', {
                    category: 'auth',
                    userId: rawUser.id,
                  });
                  return {};
                }
                })()
              : rawUser.metadataText ?? {},
        }
      : undefined;

    if (!user) {
      return { error: 'Invalid credentials' };
    }

    // ── Soft Delete Check ──────────────────────────────────────
    if (user.deletedAt) {
      return {
        error: 'Account deactivated. Contact admin for reactivation.',
      };
    }

    // ── Active Check ──────────────────────────────────────────
    if (user.isActive === false) {
      return {
        error: 'Account is currently inactive. Contact admin to reactivate.',
        code: 'ACCOUNT_INACTIVE',
      };
    }

    // ── Access Expiry Check ────────────────────────────────────
    let currentPlanTier = user.planTier || 'free';
    let currentIsSubscribed = !!user.isSubscribed;

    if (user.accessExpiresAt && user.planTier !== 'free') {
      const now = new Date();
      const expiryDate = new Date(user.accessExpiresAt);
      if (expiryDate < now) {
        // Downgrade to free instead of blocking login
        await db
          .update(mppscUsers)
          .set({ planTier: 'free', isSubscribed: false })
          .where(eq(mppscUsers.id, user.id));

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
        return {
          error: 'Too many failed login attempts. Please try again after 15 minutes.',
        };
      }

      return { error: 'Invalid credentials' };
    }

    // ── Active Session Detection ────────────────────────────────
    if (!force) {
      if (hasActiveAuthSession(user.metadata)) {
        return {
          requiresConfirmation: true,
          message:
            'An active session was detected. Logging in here will disconnect your other devices. Continue?',
        };
      }
    }

    // ── Session Version Handling ────────────────────────────────
    const newSessionVersion = (user.sessionVersion || 0) + 1;
    await db
      .update(mppscUsers)
      .set({ 
        sessionVersion: newSessionVersion,
        metadata: touchAuthLoginMetadata(user.metadata),
      })
      .where(eq(mppscUsers.id, user.id));

    if (newSessionVersion > 1) {
      // Collect metadata for Telegram Notification
      const userAgent = headersList.get('user-agent') || 'Unknown Device';
      
      // Async fire-and-forget telegram notification
      import('@/lib/admin-notify')
        .then(({ notifyAdminOnMultiDeviceLogin }) => notifyAdminOnMultiDeviceLogin({
          email: user.email,
          name: user.name || 'Anonymous',
          phone: user.phone || 'Not Provided',
          planTier: user.planTier || 'FREE',
          isSubscribed: !!user.isSubscribed,
          ip: ip,
          userAgent: userAgent,
          sessionVersion: newSessionVersion,
          forced: !!force
        }))
        .catch(() => {});
    }

    // ── Telegram Login Notification (Backgrounded) ───────────────
    after(async () => {
      try {
        const userAgent = headersList.get('user-agent') || 'Unknown Device';
        const location = await getClientLocation(headersList, ip);
        const telegramMessage =
          `🔑 <b>New Login — MP Police Elite</b>\n\n` +
          `👤 <b>User:</b> ${escapeHTML(user.name || 'Anonymous')}\n` +
          `📧 <b>Email:</b> ${escapeHTML(user.email)}\n` +
          `🏆 <b>Plan:</b> ${escapeHTML(currentPlanTier.toUpperCase())}\n` +
          `📱 <b>Device:</b> ${escapeHTML(userAgent.slice(0, 100))}\n` +
          `🌐 <b>Real IP:</b> ${escapeHTML(ip)}\n` +
          `📍 <b>Location:</b> ${escapeHTML(location)}\n` +
          (normalizedDeviceId
            ? `🔐 <b>Device ID:</b> <code>${escapeHTML(normalizedDeviceId.slice(0, 20))}...</code>\n`
            : '') +
          `🔁 <b>Session:</b> ${force ? 'Forced login (other sessions logged out)' : 'Normal login'}\n` +
          `⏱️ <b>Time:</b> ${new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })} IST`;

        await sendTelegramNotification(telegramMessage);
      } catch (error) {
        logger.error('Telegram login notification failed (non-blocking)', error, {
          category: 'admin',
        });
      }
    });

    // ── Sign JWT Token (embed deviceId for hardware binding) ────
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionVersion: newSessionVersion,
      ...(normalizedDeviceId ? { deviceId: normalizedDeviceId } : {}),
    };

    const { signToken } = await import('@/lib/jwt');
    const token = signToken(payload);

    if (!token) {
      throw new Error('Token generation failed');
    }

    // ── Set Standardized Auth & Device Cookies (stealth names) ──
    const cookieStore = await cookies();
    setAuthCookies(cookieStore, token, normalizedDeviceId);

    return {
      success: true,
      message: force
        ? 'Login forced. All other sessions have been logged out.' 
        : 'Logged in successfully.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSubscribed: currentIsSubscribed,
        planTier: currentPlanTier,
        role: user.role ?? undefined,
        accessExpiresAt: user.accessExpiresAt ?? undefined,
      },
    };
  } catch (error) {
    logger.error('Login action error:', error, {
      category: 'auth',
      metadata: { email },
    });
    return { error: 'Internal Server Error' };
  }
}
