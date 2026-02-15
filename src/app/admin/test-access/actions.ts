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
import { tests, syllabusTopics, testAttemptLimits } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-admin';
import { logger } from '@/lib/logger';
import { cachedData, CACHE } from '@/lib/cache';

/**
 * getAllTestsForAdmin
 * ─────────────────────────────────────────────────────────
 * Bhai, admin ke liye sab tests fetch karo — access flags ke saath
 * No caching! Admin ko always fresh data chahiye
 */
export async function getAllTestsForAdmin() {
  await requireAdmin();

  const allTests = await db
    .select({
      id: tests.id,
      title: tests.title,
      titleEn: tests.titleEn,
      type: tests.type,
      unitId: tests.unitId,
      topicId: tests.topicId,
      slug: tests.slug,
      totalQuestions: tests.totalQuestions,
      isPro: tests.isPro,
      maxRetries: tests.maxRetries,
      isFreeAccess: tests.isFreeAccess,
      isLiteAccess: tests.isLiteAccess,
      isProAccess: tests.isProAccess,
      isHidden: tests.isHidden,
      displayOrder: tests.displayOrder,
      createdAt: tests.createdAt,
    })
    .from(tests)
    .orderBy(tests.type, tests.displayOrder);

  // TOPIC tests ke liye syllabusTopics se proper name fetch karo
  const topicTestIds = allTests
    .filter((t) => t.type === 'TOPIC' && t.topicId)
    .map((t) => t.topicId!);

  let topicNameMap: Record<string, { title: string; titleEn: string | null }> = {};
  if (topicTestIds.length > 0) {
    const topics = await db
      .select({
        id: syllabusTopics.id,
        title: syllabusTopics.title,
        titleEn: syllabusTopics.titleEn,
      })
      .from(syllabusTopics)
      .where(inArray(syllabusTopics.id, topicTestIds));

    topicNameMap = topics.reduce(
      (acc, t) => {
        acc[t.id] = { title: t.title, titleEn: t.titleEn };
        return acc;
      },
      {} as Record<string, { title: string; titleEn: string | null }>
    );
  }

  return allTests.map((t) => ({
    ...t,
    topicName: t.topicId ? (topicNameMap[t.topicId]?.title ?? null) : null,
    topicNameEn: t.topicId ? (topicNameMap[t.topicId]?.titleEn ?? null) : null,
  }));
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

  await db
    .update(tests)
    .set({ [field]: value })
    .where(eq(tests.id, testId));

  // Cache bust — sab test lists fresh ho jayenge
  revalidateTag('tests', { expire: 0 });
  revalidateTag('tests-list', { expire: 0 });
  revalidateTag('syllabus-topics', { expire: 0 });

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

  await db
    .update(tests)
    .set({ [field]: value })
    .where(eq(tests.type, testType));

  revalidateTag('tests', { expire: 0 });
  revalidateTag('tests-list', { expire: 0 });
  revalidateTag('syllabus-topics', { expire: 0 });

  logger.info(`Bulk access updated: ${testType} → ${field}=${value}`);

  return { success: true };
}

/**
 * toggleTestHidden — Test ko hide/unhide karo
 * Hidden tests user ko nahi dikhenge — admin ke liye visible rahenge
 */
export async function toggleTestHidden(testId: string, isHidden: boolean) {
  await requireAdmin();

  await db.update(tests).set({ isHidden }).where(eq(tests.id, testId));

  // yaha tests ka cache burst ho raha h

  revalidateTag('tests', { expire: 0 }); // ✅ 'tests' — FLT/PYQ/CSAT use karte h
  revalidateTag('tests-list', { expire: 0 }); // ✅ 'tests-list' — getCachedFLTTests use karta h
  revalidateTag('syllabus-topics', { expire: 0 }); // 🔥 FIX: TOPIC tests use this tag!

  logger.info(`Test hidden toggled: ${testId} → isHidden=${isHidden}`);
  return { success: true };
}

/**
 * updateTestTitle — Test ka title change karo (Bilingual)
 */
export async function updateTestTitle(testId: string, title: string, titleEn: string | null) {
  await requireAdmin();

  if (!title.trim()) return { success: false, error: 'Hindi Title cannot be empty' };

  await db
    .update(tests)
    .set({
      title: title.trim(),
      titleEn: titleEn ? titleEn.trim() : null,
      updatedAt: new Date(),
    })
    .where(eq(tests.id, testId));

  revalidateTag('tests', { expire: 0 });
  revalidateTag('tests-list', { expire: 0 });

  logger.info(`Test title updated: ${testId} → "${title}" / "${titleEn}"`);
  return { success: true };
}

/**
 * updateTestDisplayOrder — Test ka display order change karo
 */
export async function updateTestDisplayOrder(testId: string, displayOrder: number) {
  await requireAdmin();

  await db.update(tests).set({ displayOrder }).where(eq(tests.id, testId));

  revalidateTag('tests', { expire: 0 });
  revalidateTag('tests-list', { expire: 0 });

  logger.info(`Test displayOrder updated: ${testId} → ${displayOrder}`);
  return { success: true };
}

// ── Attempt Limits (Source of Truth) ─────────────────────────

/**
 * getCachedAttemptLimits — Cached fetch of attempt limits
 */
export const getCachedAttemptLimits = cachedData(
  async () => {
    const rows = await db.select().from(testAttemptLimits);
    return rows.reduce(
      (acc, r) => {
        acc[r.testType] = r.maxAttempts;
        return acc;
      },
      {} as Record<string, number | null>
    );
  },
  ['attempt-limits'],
  CACHE.ATTEMPT_LIMITS.GET_ALL.tags,
  CACHE.ATTEMPT_LIMITS.GET_ALL.revalidate
);

/**
 * getAttemptLimits — Admin ke liye fresh (no cache)
 */
export async function getAttemptLimits() {
  await requireAdmin();
  const rows = await db.select().from(testAttemptLimits);
  return rows.reduce(
    (acc, r) => {
      acc[r.testType] = r.maxAttempts;
      return acc;
    },
    {} as Record<string, number | null>
  );
}

/**
 * updateAttemptLimit — Ek test type ka max attempts set karo
 * null = unlimited
 */
export async function updateAttemptLimit(
  testType: 'FLT' | 'UNIT' | 'CSAT' | 'PYQ' | 'TOPIC',
  maxAttempts: number | null
) {
  await requireAdmin();

  await db
    .update(testAttemptLimits)
    .set({ maxAttempts })
    .where(eq(testAttemptLimits.testType, testType));

  revalidateTag('attempt-limits', { expire: 0 });
  revalidateTag('tests', { expire: 0 });
  revalidateTag('tests-list', { expire: 0 });

  logger.info(`Attempt limit updated: ${testType} → ${maxAttempts ?? 'unlimited'}`);
  return { success: true };
}

/**
 * bulkUpdateMaxRetries — Ek type ke sab tests ka maxRetries ek saath set karo
 * null = unlimited
 */
export async function bulkUpdateMaxRetries(
  testType: 'FLT' | 'UNIT' | 'CSAT' | 'PYQ' | 'TOPIC',
  maxRetries: number | null
) {
  await requireAdmin();

  await db.update(tests).set({ maxRetries }).where(eq(tests.type, testType));

  revalidateTag('tests', { expire: 0 });
  revalidateTag('tests-list', { expire: 0 });

  logger.info(`Bulk maxRetries updated: ${testType} → ${maxRetries ?? 'unlimited'}`);
  return { success: true };
}
