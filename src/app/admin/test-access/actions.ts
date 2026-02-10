'use server';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎛️ TEST ACCESS ACTIONS — Admin panel se test access flags toggle karo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Ye server actions hain bhai — admin panel ka remote control!
// Toggle karo DB flags → turant frontend pe reflect hoga
// Cache invalidation bhi automatic hai (revalidateTag)
//
// Flow:
// Admin UI → toggleTestAccess() → DB update → cache bust → fresh data serve
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { db } from '@/db';
import { tests } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-admin';
import { logger } from '@/lib/logger';

/**
 * getAllTestsForAdmin
 * ─────────────────────────────────────────────────────────
 * Bhai, admin ke liye sab tests fetch karo — access flags ke saath
 * No caching! Admin ko always fresh data chahiye
 */
export async function getAllTestsForAdmin() {
    await requireAdmin();

    const allTests = await db.select({
        id: tests.id,
        title: tests.title,
        titleEn: tests.titleEn,
        type: tests.type,
        unitId: tests.unitId,
        slug: tests.slug,
        totalQuestions: tests.totalQuestions,
        isPro: tests.isPro,
        isFreeAccess: tests.isFreeAccess,
        isLiteAccess: tests.isLiteAccess,
        isProAccess: tests.isProAccess,
        displayOrder: tests.displayOrder,
        createdAt: tests.createdAt,
    })
    .from(tests)
    .orderBy(tests.type, tests.displayOrder);

    return allTests;
}

/**
 * toggleTestAccess
 * ─────────────────────────────────────────────────────────
 * Single flag toggle karo — ek click me free/lite/pro access on/off
 * 
 * Kya hota hai toggle ke baad?
 * 1. DB me flag update
 * 2. 'tests' cache tag bust → getCachedFLTTests/PYQ/CSAT sab re-fetch honge
 * 3. Next request pe fresh data milega — no stale access!
 */
export async function toggleTestAccess(
    testId: string, 
    field: 'isFreeAccess' | 'isLiteAccess' | 'isProAccess', 
    value: boolean
) {
    await requireAdmin();

    await db.update(tests)
        .set({ [field]: value })
        .where(eq(tests.id, testId));

    // Cache bust — sab test lists fresh ho jayenge
    revalidateTag('tests', { expire: 0 });
    revalidateTag('tests-list', { expire: 0 });

    logger.info(`Test access updated: ${testId} → ${field}=${value}`);

    return { success: true };
}

/**
 * bulkUpdateTestAccess
 * ─────────────────────────────────────────────────────────
 * Ek type ke sab tests ka access ek saath set karo
 * Example: "Sab FLT tests ko Lite access de do"
 */
export async function bulkUpdateTestAccess(
    testType: 'FLT' | 'UNIT' | 'CSAT' | 'PYQ' | 'TOPIC',
    field: 'isFreeAccess' | 'isLiteAccess' | 'isProAccess',
    value: boolean
) {
    await requireAdmin();

    await db.update(tests)
        .set({ [field]: value })
        .where(eq(tests.type, testType));

    revalidateTag('tests', { expire: 0 });
    revalidateTag('tests-list', { expire: 0 });

    logger.info(`Bulk access updated: ${testType} → ${field}=${value}`);

    return { success: true };
}
