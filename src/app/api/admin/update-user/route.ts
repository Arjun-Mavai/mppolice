import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { touchAuthLogoutMetadata } from '@/lib/auth-session-metadata';
import { verifyAdminAuth } from '@/lib/auth';

const updateUserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(255).optional(),
  password: z.string().min(6).optional(),
  planTier: z.enum(['free', 'pro']).optional(),
  isActive: z.boolean().optional(),
  isSubscribed: z.boolean().optional(),
  accessMonths: z.number().min(1).max(24).optional(),
  forceLogout: z.boolean().optional(),
});

const PLAN_MONTHS: Record<string, number> = { lite: 8, pro: 6 };

export async function POST(request: Request) {
  let decoded: any;
  let targetUserId: string | undefined;
  try {
    // Admin Auth
    const adminUser = await verifyAdminAuth();
    if (!adminUser) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    decoded = { userId: adminUser.id };

    const body = await request.json();
    const parsed = updateUserSchema.parse(body);
    targetUserId = parsed.userId;
    const { userId, name, email, password, planTier, isActive, isSubscribed, accessMonths, forceLogout } =
      parsed;

    // Check target user exists
    const targetUser = await db.query.mppscUsers.findFirst({
      where: eq(mppscUsers.id, userId),
    });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Build update object — only include changed fields
    const updates: Record<string, any> = {};
    const changes: string[] = [];
    let shouldInvalidateSessions = false;

    if (forceLogout) {
      shouldInvalidateSessions = true;
      changes.push('forced logout');
    }

    if (name !== undefined && name !== targetUser.name) {
      updates.name = name.trim();
      changes.push('name');
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== targetUser.email) {
        // Only check uniqueness when email actually changes
        const emailExists = await db.query.mppscUsers.findFirst({
          where: and(eq(mppscUsers.email, normalizedEmail), ne(mppscUsers.id, userId)),
        });
        if (emailExists) {
          return NextResponse.json(
            { error: 'Email already in use by another user' },
            { status: 409 }
          );
        }
        updates.email = normalizedEmail;
        changes.push('email');
      }
    }

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
      changes.push('password');
      shouldInvalidateSessions = true;
    }

    if (planTier !== undefined && planTier !== targetUser.planTier) {
      updates.planTier = planTier;
      updates.isSubscribed = planTier !== 'free';
      changes.push(`plan→${planTier}`);

      // Auto-set expiry when upgrading to paid plan
      if (planTier !== 'free' && !accessMonths) {
        const months = PLAN_MONTHS[planTier] || 7;
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + months);
        updates.accessExpiresAt = expiry;
        changes.push(`expiry +${months}mo`);
      }
    }

    if (isActive !== undefined && isActive !== targetUser.isActive) {
      updates.isActive = isActive;
      changes.push(isActive ? 'activated' : 'deactivated');
      if (!isActive) {
        shouldInvalidateSessions = true;
      }
    }

    if (isSubscribed !== undefined) {
      updates.isSubscribed = isSubscribed;
    }

    if (accessMonths) {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + accessMonths);
      updates.accessExpiresAt = expiry;
      changes.push(`expiry +${accessMonths}mo`);
    }

    if (shouldInvalidateSessions) {
      updates.sessionVersion = (targetUser.sessionVersion || 0) + 1;
      updates.metadata = touchAuthLogoutMetadata(targetUser.metadata);
    }

    if (changes.length === 0) {
      return NextResponse.json({ error: 'No changes detected' }, { status: 400 });
    }

    await db.update(mppscUsers).set(updates).where(eq(mppscUsers.id, userId));

    // ── Log Activity ──────────────────────────────────────────────
    if (Object.keys(updates).length > 0) {
      const { logUserActivity } = await import('@/app/actions/user-activity');
      await logUserActivity({
        userId: targetUser.id,
        userEmail: targetUser.email,
        userName: targetUser.name,
        adminId: adminUser.id,
        action: updates.planTier ? 'PLAN_CHANGE' : 'UPDATE',
        details: {
          changes: updates,
          reason: 'Admin manual update',
        },
      });
      if (shouldInvalidateSessions) {
        await logUserActivity({
          userId: targetUser.id,
          userEmail: targetUser.email,
          userName: targetUser.name,
          adminId: adminUser.id,
          action: 'LOGOUT',
          details: {
            reason: forceLogout ? 'forced_logout' : isActive === false ? 'deactivated' : 'password_reset',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated: ${changes.join(', ')}`,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }
    logger.error('Admin update user error:', error, {
      category: 'system',
      userId: decoded?.userId,
      metadata: { targetUserId },
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
