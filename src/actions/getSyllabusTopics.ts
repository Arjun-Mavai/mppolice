'use server';

import { db } from '@/db';
import { tests, userAttempts as userAttemptsTable } from '@/db/schema';
import { eq, inArray, and, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { unstable_cache } from 'next/cache';
import { getCachedAttemptLimits } from '@/app/admin/test-access/actions';
import { verifyAuth } from '@/lib/auth';
import { getMppoliceFlattenedTopics } from '@/data/mppoliceSyllabus';

/**
 * Same pattern as getCachedFLTTests — 60s revalidate, tag 'tests'
 * Admin toggle → revalidateTag('tests') → busts this cache instantly
 */
const getCachedBaseSyllabusData = unstable_cache(
  async () => {
    try {
      // MP Police uses hardcoded picker topic IDs in admin uploads.
      // So chapter-wise mapping must use the same picker as source-of-truth.
      const pickerTopics = getMppoliceFlattenedTopics();
      if (pickerTopics.length === 0) return { topics: [], relatedTests: [] };

      const topics = pickerTopics.map((t, idx) => ({
        id: t.id,
        unitId: t.sectionId,
        order: idx + 1,
        title: t.front,
        titleEn: t.frontEn || null,
        description: null,
        descriptionEn: null,
      }));

      const topicIds = topics.map((t) => t.id);
      const relatedTests = await db
        .select({
          id: tests.id,
          topicId: tests.topicId,
          unitId: tests.unitId,
          type: tests.type,
          isFreeAccess: tests.isFreeAccess,
          isLiteAccess: tests.isLiteAccess,
          isProAccess: tests.isProAccess,
        })
        .from(tests)
        .where(
          and(
            eq(tests.type, 'TOPIC'),
            inArray(tests.topicId, topicIds),
            eq(tests.isHidden, false),
            eq(tests.examType, 'mppolice')
          )
        );

      return { topics, relatedTests };
    } catch (error) {
      logger.error('[getCachedBaseSyllabusData] Error:', error);
      throw error;
    }
  },
  ['syllabus-base-data-mppolice-v1'],
  { revalidate: 60, tags: ['tests'] }
);

/**
 * [DYNAMIC ACTION] Enriches static topics with user-specific data.
 */
export async function getSyllabusTopics() {
  try {
    const [baseData, attemptLimits, user] = await Promise.all([
      getCachedBaseSyllabusData(),
      getCachedAttemptLimits(),
      verifyAuth(),
    ]);

    const { topics, relatedTests } = baseData;
    if (!topics || topics.length === 0) {
      return { success: true, data: {} };
    }

    const maxRetries = attemptLimits['TOPIC'] ?? null;

    // 1. Create a map of topicId -> test info
    // If multiple tests exist for one topicId, we pick the first one (they are ordered by createdAt desc by default in base query usually, or we can just pick one)
    const topicTestMap = relatedTests.reduce(
      (acc, curr) => {
        if (curr.topicId && (!acc[curr.topicId] || curr.type === 'TOPIC')) {
          acc[curr.topicId] = {
            testId: curr.id,
            isFreeAccess: !!curr.isFreeAccess,
            isLiteAccess: !!curr.isLiteAccess,
            isProAccess: curr.isProAccess ?? true,
          };
        }
        return acc;
      },
      {} as Record<
        string,
        { testId: string; isFreeAccess: boolean; isLiteAccess: boolean; isProAccess: boolean }
      >
    );

    // 2. Fetch attempts ONLY if user exists
    let userAttemptsMap: Record<string, number> = {};
    if (user && relatedTests.length > 0) {
      const testIds = relatedTests.map((rt) => rt.id);
      const attempts = await db
        .select({
          testId: userAttemptsTable.testId,
          count: sql<number>`count(*)`,
        })
        .from(userAttemptsTable)
        .where(
          and(eq(userAttemptsTable.userId, user.id), inArray(userAttemptsTable.testId, testIds))
        )
        .groupBy(userAttemptsTable.testId);

      userAttemptsMap = attempts.reduce(
        (acc, curr) => {
          acc[curr.testId] = Number(curr.count);
          return acc;
        },
        {} as Record<string, number>
      );
    }

    // 3. Group and Enrich
    const grouped: Record<string, any[]> = {};

    topics.forEach((topic) => {
      if (!grouped[topic.unitId]) {
        grouped[topic.unitId] = [];
      }

      const testData = topicTestMap[topic.id];
      const attemptsDone = testData ? userAttemptsMap[testData.testId] || 0 : 0;
      const attemptsLeft = maxRetries != null ? Math.max(0, maxRetries - attemptsDone) : null;

      // LOGIC FIX: Strict Visibility
      // If a topic has NO test (or test is hidden), do not include it.
      // This mimics FLT behavior: Only show what is playable.
      if (!testData) return;

      const isFreeAccess = testData.isFreeAccess;

      grouped[topic.unitId].push({
        ...topic,
        testId: testData.testId,
        isFreeAccess: isFreeAccess,
        isLiteAccess: testData.isLiteAccess,
        isProAccess: testData.isProAccess,
        isFree: isFreeAccess && !user,
        attemptsLeft: user ? attemptsLeft : null,
        attemptsDone: user ? attemptsDone : 0,
        maxRetries: user ? maxRetries : null,
      });
    });

    return { success: true, data: grouped };
  } catch (error) {
    logger.error('[getSyllabusTopics] Error:', error);
    return { success: false, error: 'Failed to fetch topics' };
  }
}
