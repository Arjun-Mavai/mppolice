'use server';

import { db } from '@/db';
import { mppoliceOneLinerRevisions, mppoliceOneLinerFacts } from '@/db/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { verifyAuth } from '@/lib/auth';
import { nanoid } from 'nanoid';
import { logger } from '@/lib/logger';

async function getUserId() {
  const user = await verifyAuth();
  return user?.id;
}

export async function markOneLinerRevised(factId: string) {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const existing = await db
      .select()
      .from(mppoliceOneLinerRevisions)
      .where(and(eq(mppoliceOneLinerRevisions.userId, userId), eq(mppoliceOneLinerRevisions.factId, factId)))
      .limit(1)
      .then(res => res[0]);

    if (existing) {
      await db
        .update(mppoliceOneLinerRevisions)
        .set({
          revisionCount: sql`${mppoliceOneLinerRevisions.revisionCount} + 1`,
          lastRevisedAt: new Date(),
        })
        .where(eq(mppoliceOneLinerRevisions.id, existing.id));
    } else {
      await db.insert(mppoliceOneLinerRevisions).values({
        id: nanoid(),
        userId,
        factId,
        revisionCount: 1,
        lastRevisedAt: new Date(),
      });
    }

    revalidateTag('mppolice-one-liner-revision-stats',{expire:0});
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    logger.error('Error marking one-liner revision:', error);
    return { success: false, error: 'Server Error' };
  }
}

export async function getUserOneLinerProgress() {
  const userId = await getUserId();
  if (!userId) return { revisedFactsCount: 0, totalRevisions: 0, totalFacts: 0 };

  try {
    const [stats, counts] = await Promise.all([
      db
        .select({
          revisedFactsCount: sql<number>`count(distinct ${mppoliceOneLinerRevisions.factId})`,
          totalRevisions: sql<number>`sum(${mppoliceOneLinerRevisions.revisionCount})`,
        })
        .from(mppoliceOneLinerRevisions)
        .where(eq(mppoliceOneLinerRevisions.userId, userId))
        .then(res => res[0]),
      db
        .select({ count: sql<number>`count(*)` })
        .from(mppoliceOneLinerFacts)
        .where(eq(mppoliceOneLinerFacts.status, 'published'))
        .then(res => res[0])
    ]);

    return {
      revisedFactsCount: Number(stats?.revisedFactsCount || 0),
      totalRevisions: Number(stats?.totalRevisions || 0),
      totalFacts: Number(counts?.count || 0)
    };
  } catch (error) {
    logger.error('Error fetching one-liner progress:', error);
    return { revisedFactsCount: 0, totalRevisions: 0, totalFacts: 0 };
  }
}

export async function getRevisedOneLiners(status: 'revised' | 'remaining' = 'revised') {
  const userId = await getUserId();
  if (!userId) return [];

  try {
    if (status === 'revised') {
      // Fetch facts that exist in revisions table for this user
      return await db
        .select({
          id: mppoliceOneLinerFacts.id,
          stemHi: mppoliceOneLinerFacts.stemHi,
          stemEn: mppoliceOneLinerFacts.stemEn,
          answerHi: mppoliceOneLinerFacts.answerHi,
          answerEn: mppoliceOneLinerFacts.answerEn,
          subjectTag: mppoliceOneLinerFacts.subjectTag,
          revisionCount: mppoliceOneLinerRevisions.revisionCount,
        })
        .from(mppoliceOneLinerFacts)
        .innerJoin(
          mppoliceOneLinerRevisions,
          and(
            eq(mppoliceOneLinerFacts.id, mppoliceOneLinerRevisions.factId),
            eq(mppoliceOneLinerRevisions.userId, userId)
          )
        )
        .where(eq(mppoliceOneLinerFacts.status, 'published'))
        .orderBy(sql`${mppoliceOneLinerRevisions.lastRevisedAt} DESC`);
    } else {
      // Fetch facts that do NOT exist in revisions table for this user
      // Subquery for revised IDs
      const revisedIds = db
        .select({ factId: mppoliceOneLinerRevisions.factId })
        .from(mppoliceOneLinerRevisions)
        .where(eq(mppoliceOneLinerRevisions.userId, userId));

      return await db
        .select({
          id: mppoliceOneLinerFacts.id,
          stemHi: mppoliceOneLinerFacts.stemHi,
          stemEn: mppoliceOneLinerFacts.stemEn,
          answerHi: mppoliceOneLinerFacts.answerHi,
          answerEn: mppoliceOneLinerFacts.answerEn,
          subjectTag: mppoliceOneLinerFacts.subjectTag,
        })
        .from(mppoliceOneLinerFacts)
        .where(
          and(
            eq(mppoliceOneLinerFacts.status, 'published'),
            sql`${mppoliceOneLinerFacts.id} NOT IN (${revisedIds})`
          )
        )
        .limit(200); // Limit remaining to 200 for performance
    }
  } catch (error) {
    logger.error('Error fetching revised one-liners:', error);
    return [];
  }
}

export async function getOneLinerRevisionMap(factIds: string[]) {
  const userId = await getUserId();
  if (!userId || factIds.length === 0) return {};

  try {
    const records = await db
      .select({
        factId: mppoliceOneLinerRevisions.factId,
        count: mppoliceOneLinerRevisions.revisionCount,
      })
      .from(mppoliceOneLinerRevisions)
      .where(and(eq(mppoliceOneLinerRevisions.userId, userId), inArray(mppoliceOneLinerRevisions.factId, factIds)));

    const map: Record<string, number> = {};
    records.forEach(r => {
      map[r.factId] = r.count || 0;
    });
    return map;
  } catch (error) {
    return {};
  }
}
