'use server';

import { db } from '@/db';
import { topicRevisions, mppscUsers } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

async function getUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('mppsc_token')?.value;
  return userId;
}

export async function markTopicRevised(topicId: string, unitId: string) {
  const userId = await getUser();
  logger.info('markTopicRevised called:', { topicId, unitId, userId }); // Debug log

  if (!userId) {
      logger.error('markTopicRevised: No user ID found');
      return { error: 'Unauthorized' };
  }
  
  if (!topicId || !unitId) {
      logger.error('markTopicRevised: Missing topicId or unitId', { topicId, unitId });
      return { error: 'Invalid data' };
  }

  try {
      // Check if entry exists
      const existing = await db.select()
          .from(topicRevisions)
          .where(and(
              eq(topicRevisions.userId, userId),
              eq(topicRevisions.topicId, topicId)
          ))
          .limit(1);

      if (existing.length > 0) {
          // Increment
          await db.update(topicRevisions)
              .set({
                  revisionCount: sql`${topicRevisions.revisionCount} + 1`,
                  lastRevisedAt: new Date()
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
              lastRevisedAt: new Date()
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
    const userId = await getUser();
    if (!userId) return 0;

    try {
        const record = await db.select({ count: topicRevisions.revisionCount })
            .from(topicRevisions)
            .where(and(
                eq(topicRevisions.userId, userId),
                eq(topicRevisions.topicId, topicId)
            ))
    } catch (error) {
        return 0;
    }
}

export async function getUserSyllabusProgress() {
    const userId = await getUser();
    if (!userId) return null;

    try {
        const result = await db.select({ 
            count: sql<number>`count(distinct ${topicRevisions.topicId})`,
            totalRevisions: sql<number>`sum(${topicRevisions.revisionCount})`
        })
        .from(topicRevisions)
        .where(eq(topicRevisions.userId, userId));

        const revisedTopicsCount = result[0]?.count || 0;
        const totalRevisions = result[0]?.totalRevisions || 0;

        return { revisedTopicsCount, totalRevisions };
    } catch (error) {
        logger.error('Error fetching progress:', error);
        return { revisedTopicsCount: 0, totalRevisions: 0 };
    }
}
