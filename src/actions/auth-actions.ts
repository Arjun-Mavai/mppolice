'use server';

import { verifyAuth } from '@/lib/auth';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';
import { hasActiveAuthSession, touchAuthLoginMetadata } from '@/lib/auth-session-metadata';
import { v4 as uuidv4 } from 'uuid';

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
  const { user, _mismatch } = await verifyAuthWithMismatch();

  if (_mismatch) {
    return { user: null, reason: 'multi_device' };
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
      planTier: (user.planTier as any) || 'free',
      role: user.role ?? undefined,
      accessExpiresAt: user.accessExpiresAt ?? undefined,
    },
  };
}

interface LoginParams {
  email?: string;
  password?: string;
  force?: boolean;
}

/**
 * 🔑 Login User (Server Action)
 *
 * Bhai, ye function email aur password leke user ko login karata hai.
 * API route se move kiya gaya taaki security aur consistency bani rahe.
 */
export async function loginUserAction(formData: LoginParams) {
  const { email, password, force } = formData;

  try {
    // ── Rate Limiting ───────────────────────────────────────────
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1';
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
      .select()
      .from(mppscUsers)
      .where(
        and(
          eq(mppscUsers.email, email.toLowerCase().trim()),
          sql`(${mppscUsers.examType} = 'mppolice' OR ${mppscUsers.examType} = 'all')`
        )
      )
      .limit(1);
    const user = dbUsers[0];

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
    let currentPlanTier = (user.planTier as any) || 'free';
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

    // ── Sign JWT Token ──────────────────────────────────────────
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionVersion: newSessionVersion,
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
