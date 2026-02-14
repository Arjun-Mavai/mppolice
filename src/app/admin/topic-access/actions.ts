'use server';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎛️ TOPIC ACCESS ACTIONS — Admin se topic access flags toggle karo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Same pattern as test-access — toggle DB flags → cache bust → fresh data
// isFree = free users bhi dekh sakte
// isLiteAccess = lite users dekh sakte
// isProAccess = pro users dekh sakte (default true)
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { db } from '@/db';
import { syllabusTopics } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-admin';
import { logger } from '@/lib/logger';

/**
 * getAllTopicsForAdmin — Sab topics fetch, grouped by unit
 * Admin ko fresh data chahiye — no cache
 */
export async function getAllTopicsForAdmin() {
  await requireAdmin();

  const allTopics = await db
    .select({
      id: syllabusTopics.id,
      unitId: syllabusTopics.unitId,
      title: syllabusTopics.title,
      titleEn: syllabusTopics.titleEn,
      order: syllabusTopics.order,
      isFree: syllabusTopics.isFree,
      isLiteAccess: syllabusTopics.isLiteAccess,
      isProAccess: syllabusTopics.isProAccess,
    })
    .from(syllabusTopics)
    .orderBy(syllabusTopics.unitId, syllabusTopics.order);

  return allTopics;
}

/**
 * toggleTopicAccess — Single topic ka ek flag toggle karo
 *
 * NOTE: isFree toggle karne par isFreeAccess jaisa kaam karega
 * (backward compatible — purana field hai)
 */
export async function toggleTopicAccess(
  topicId: string,
  field: 'isFree' | 'isLiteAccess' | 'isProAccess',
  value: boolean
) {
  await requireAdmin();

  await db
    .update(syllabusTopics)
    .set({ [field]: value })
    .where(eq(syllabusTopics.id, topicId));

  // Cache bust — syllabus pages re-fetch honge
  revalidateTag('syllabus', { expire: 0 });
  revalidateTag('topics', { expire: 0 });

  logger.info(`Topic access updated: ${topicId} → ${field}=${value}`);

  return { success: true };
}

/**
 * bulkUpdateTopicAccess — Ek unit ke sab topics ka access set karo
 * Example: "Unit 1 ke sab topics Lite ko de do"
 */
export async function bulkUpdateTopicAccess(
  unitId: string,
  field: 'isFree' | 'isLiteAccess' | 'isProAccess',
  value: boolean
) {
  await requireAdmin();

  await db
    .update(syllabusTopics)
    .set({ [field]: value })
    .where(eq(syllabusTopics.unitId, unitId));

  revalidateTag('syllabus', { expire: 0 });
  revalidateTag('topics', { expire: 0 });

  logger.info(`Bulk topic access: ${unitId} → ${field}=${value}`);

  return { success: true };
}
