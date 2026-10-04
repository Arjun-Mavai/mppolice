import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { verifyAdminAuth } from '@/lib/auth';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎁 GRANT PLAN — Admin gives Lite/Pro without payment
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Use case: Referrals, test accounts, support cases, giveaways.
// Creates user if email doesn't exist, upgrades if it does.
// No payment record created — metadata tracks admin grant.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLAN_MONTHS: Record<string, number> = { lite: 8, pro: 6 };

const grantSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  phone: z
    .union([z.string().min(10).max(15), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  planTier: z.enum(['pro']),
  password: z
    .string()
    .min(8, 'Min 8 characters')
    .regex(/[a-z]/, 'Need lowercase')
    .regex(/[A-Z]/, 'Need uppercase')
    .regex(/\d/, 'Need digit'),
  accessMonths: z.number().min(1).max(24).optional(),
  reason: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  let decoded: any;
  let targetEmail: string | undefined;
  try {
    // Admin Auth
    const adminUser = await verifyAdminAuth();
    if (!adminUser) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    decoded = { userId: adminUser.id };

    const body = await request.json();
    const { email, name, phone, planTier, password, accessMonths, reason } =
      grantSchema.parse(body);
    targetEmail = email;

    const normalizedEmail = email.toLowerCase().trim();
    const months = accessMonths || PLAN_MONTHS[planTier] || 7;
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔍 1. Check existing user (Case-insensitive)
    const existing = await db.query.mppscUsers.findFirst({
      where: sql`LOWER(${mppscUsers.email}) = ${normalizedEmail}`,
    });

    // 📅 2. Calculate Expiry (Extend if already active)
    let accessExpiresAt = new Date();
    if (existing && existing.accessExpiresAt && existing.isActive) {
      // If user is already active, ADD months to existing expiry
      accessExpiresAt = new Date(existing.accessExpiresAt);
      accessExpiresAt.setMonth(accessExpiresAt.getMonth() + months);
    } else {
      // New user or inactive user: Start from now
      accessExpiresAt.setMonth(accessExpiresAt.getMonth() + months);
    }

    const grantMeta = {
      grantedBy: decoded.userId,
      grantedAt: new Date().toISOString(),
      grantReason: reason || 'Admin grant (no payment)',
      previousTier: existing?.planTier || null,
      examType: 'mppolice'
    };

    if (existing) {
      // 🔄 3. Upgrade/Extend existing user
      await db
        .update(mppscUsers)
        .set({
          name: name.trim(),
          phone: phone?.trim() || existing.phone,
          // Only update password if strictly needed, but here we follow schema
          password: hashedPassword, 
          planTier,
          isSubscribed: true,
          isActive: true,
          accessExpiresAt,
          examType: 'mppolice', // Ensure they are mapped to mppolice
          deletedAt: null,
          metadata: {
            ...(existing.metadata as any || {}),
            ...grantMeta,
          },
        })
        .where(eq(mppscUsers.id, existing.id));

      // ── Log Activity ──────────────────────────────────────────────
      const { logUserActivity } = await import('@/app/actions/user-activity');
      await logUserActivity({
        userId: existing.id,
        userEmail: existing.email,
        userName: name,
        adminId: adminUser.id,
        action: 'GRANT',
        details: {
          plan: planTier,
          months,
          reason: grantMeta.grantReason,
          isUpgrade: true,
          newExpiry: accessExpiresAt.toISOString(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Plan granted! ${name}'s access extended by ${months} months (Valid till: ${accessExpiresAt.toLocaleDateString()})`,
        userId: existing.id,
        isNew: false,
      });
    }

    // ✨ 4. Create new user
    const { v4: uuidv4 } = await import('uuid');
    const userId = uuidv4();

    await db.insert(mppscUsers).values({
      id: userId,
      email: normalizedEmail,
      name: name.trim(),
      phone: phone?.trim() || null,
      password: hashedPassword,
      planTier,
      isSubscribed: true,
      isActive: true,
      role: 'guest',
      examType: 'mppolice',
      accessExpiresAt,
      metadata: grantMeta,
    });

    // ── Log Activity ──────────────────────────────────────────────
    const { logUserActivity } = await import('@/app/actions/user-activity');
    await logUserActivity({
      userId,
      userEmail: normalizedEmail,
      userName: name,
      adminId: adminUser.id,
      action: 'GRANT',
      details: {
        plan: planTier,
        months,
        reason: grantMeta.grantReason,
        isNewUser: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${name} created with ${planTier} plan (${months} months) — no payment required`,
      userId,
      isNew: true,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }
    logger.error('Grant plan error:', error, {
      category: 'system',
      userId: decoded?.userId,
      metadata: { targetEmail },
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
