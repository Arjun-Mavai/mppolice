'use server';

import { db } from '@/db';
import { topicRevisions, mppscUsers } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';

import { verifyAuth } from '@/lib/auth';

async function getUserId() {
  const user = await verifyAuth();
  return user?.id;
}

export async function markTopicRevised(topicId: string, unitId: string) {
  const userId = await getUserId();
  logger.info('markTopicRevised called:', {
    category: 'system',
    metadata: { topicId, unitId, userId },
  }); // Debug log

  if (!userId) {
    logger.error('markTopicRevised: No user ID found', undefined, { category: 'system' });
    return { error: 'Unauthorized' };
  }

  if (!topicId || !unitId) {
    logger.error(
      'markTopicRevised: Missing topicId or unitId',
      undefined,
      { category: 'system', metadata: { topicId, unitId } }
    );
    return { error: 'Invalid data' };
  }

  try {
    // Check if entry exists
    const existing = await db
      .select()
      .from(topicRevisions)
      .where(and(eq(topicRevisions.userId, userId), eq(topicRevisions.topicId, topicId)))
      .limit(1);

    if (existing.length > 0) {
      // Increment
      await db
        .update(topicRevisions)
        .set({
          revisionCount: sql`${topicRevisions.revisionCount} + 1`,
          lastRevisedAt: new Date(),
        })
        .where(eq(topicRevisions.id, existing[0].id));

      revalidatePath('/dashboard');
      return { success: true, count: existing[0].revisionCount! + 1 };
    } else {
      // Insert
      await db.insert(topicRevisions).values({
        id: crypto.randomUUID(),
        userId,
        topicId,
        unitId,
        revisionCount: 1,
        lastRevisedAt: new Date(),
      });
      revalidatePath('/dashboard');
      return { success: true, count: 1 };
    }
  } catch (error) {
    logger.error('Error marking revision:', error);
    return { error: 'Failed to mark revision' };
  }
}

export async function getRevisionCount(topicId: string) {
  const userId = await getUserId();
  if (!userId) return 0;

  try {
    const record = await db
      .select({ count: topicRevisions.revisionCount })
      .from(topicRevisions)
      .where(and(eq(topicRevisions.userId, userId), eq(topicRevisions.topicId, topicId)));
    return record[0]?.count ?? 0;
  } catch (error) {
    return 0;
  }
}

export async function getRevisedTopics() {
  const userId = await getUserId();
  if (!userId) return [];

  try {
    return await db
      .select({
        topicId: topicRevisions.topicId,
        unitId: topicRevisions.unitId,
        revisionCount: topicRevisions.revisionCount,
        lastRevisedAt: topicRevisions.lastRevisedAt,
      })
      .from(topicRevisions)
      .where(eq(topicRevisions.userId, userId))
      .orderBy(sql`${topicRevisions.lastRevisedAt} DESC`);
  } catch (error) {
    logger.error('Error fetching revised topics:', error);
    return [];
  }
}

import { getUserOneLinerProgress } from '@/features/revision/actions/mppolice-one-liner-revisions';

export async function getUserSyllabusProgress() {
  const userId = await getUserId();
  if (!userId) return null;

  try {
    const [topicResult, oneLinerStats] = await Promise.all([
      db
        .select({
          count: sql<number>`count(distinct ${topicRevisions.topicId})`,
          totalRevisions: sql<number>`sum(${topicRevisions.revisionCount})`,
        })
        .from(topicRevisions)
        .where(eq(topicRevisions.userId, userId)),
      getUserOneLinerProgress()
    ]);

    const revisedTopicsCount = topicResult[0]?.count || 0;
    const totalTopicRevisions = topicResult[0]?.totalRevisions || 0;

    return { 
      revisedTopicsCount, 
      totalTopicRevisions,
      oneLinerStats // revisedFactsCount, totalRevisions, totalFacts
    };
  } catch (error) {
    logger.error('Error fetching progress:', error);
    return { 
      revisedTopicsCount: 0, 
      totalTopicRevisions: 0,
      oneLinerStats: { revisedFactsCount: 0, totalRevisions: 0, totalFacts: 0 }
    };
  }
}
