"use server";

import { db } from "@/db";
import { syllabusTopics, tests, userAttempts as userAttemptsTable } from "@/db/schema";
import { asc, eq, inArray, and, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { CACHE, cachedData } from "@/lib/cache";
import { getCachedAttemptLimits } from "@/app/admin/test-access/actions";
import { verifyAuth } from "@/lib/auth";

/**
 * [STATIC CACHE] Fetches and groups topics by unit.
 * This does NOT include any user-specific data (attempts, access).
 */
const getCachedBaseSyllabusData = cachedData(
  async () => {
    try {
      // 1. Fetch all topics
      const topics = await db.query.syllabusTopics.findMany({
        orderBy: [asc(syllabusTopics.order)],
      });

      if (topics.length === 0) return { topics: [], relatedTests: [] };

      // 2. Fetch all related tests for THESE topics
      const topicIds = topics.map(t => t.id);
      const relatedTests = await db.select({
        id: tests.id,
        topicId: tests.topicId,
        isFreeAccess: tests.isFreeAccess
      })
      .from(tests)
      .where(inArray(tests.topicId, topicIds));

      return { topics, relatedTests };
    } catch (error) {
      logger.error("[getCachedBaseSyllabusData] Error:", error);
      throw error;
    }
  },
  ["syllabus-base-data-v1"], // New key to force fresh start
  CACHE.SYLLABUS.GET_ALL.tags,
  CACHE.SYLLABUS.GET_ALL.revalidate
);

/**
 * [DYNAMIC ACTION] Enriches static topics with user-specific data.
 */
export async function getSyllabusTopics() {
  try {
    const [baseData, attemptLimits, user] = await Promise.all([
      getCachedBaseSyllabusData(),
      getCachedAttemptLimits(),
      verifyAuth()
    ]);

    const { topics, relatedTests } = baseData;
    if (!topics || topics.length === 0) {
      return { success: true, data: {} };
    }

    const maxRetries = attemptLimits['TOPIC'] ?? null;

    // 1. Create a map of topicId -> test info
    const topicTestMap = relatedTests.reduce((acc, curr) => {
      if (curr.topicId) {
        acc[curr.topicId] = {
          testId: curr.id,
          isFreeAccess: !!curr.isFreeAccess
        };
      }
      return acc;
    }, {} as Record<string, { testId: string, isFreeAccess: boolean }>);

    // 2. Fetch attempts ONLY if user exists
    let userAttemptsMap: Record<string, number> = {};
    if (user && relatedTests.length > 0) {
      const testIds = relatedTests.map(rt => rt.id);
      const attempts = await db.select({
        testId: userAttemptsTable.testId,
        count: sql<number>`count(*)`
      })
      .from(userAttemptsTable)
      .where(
        and(
          eq(userAttemptsTable.userId, user.id),
          inArray(userAttemptsTable.testId, testIds)
        )
      )
      .groupBy(userAttemptsTable.testId);

      userAttemptsMap = attempts.reduce((acc, curr) => {
        acc[curr.testId] = Number(curr.count);
        return acc;
      }, {} as Record<string, number>);
    }

    // 3. Group and Enrich
    const grouped: Record<string, any[]> = {};
    
    topics.forEach(topic => {
      if (!grouped[topic.unitId]) {
        grouped[topic.unitId] = [];
      }

      const testData = topicTestMap[topic.id];
      const attemptsDone = testData ? (userAttemptsMap[testData.testId] || 0) : 0;
      const attemptsLeft = maxRetries != null ? Math.max(0, maxRetries - attemptsDone) : null;
      
      // LOGIC FIX: If a test exists, use *only* the test's access flag.
      // If no test exists, use topic.isFree (legacy).
      // This prevents topic.isFree=true from overriding test.isFreeAccess=false.
      const isFreeAccess = testData 
        ? testData.isFreeAccess 
        : topic.isFree;

      grouped[topic.unitId].push({
        ...topic,
        testId: testData?.testId,
        isFreeAccess: isFreeAccess,
        isFree: isFreeAccess && !user,
        attemptsLeft: user ? attemptsLeft : null,
        attemptsDone: user ? attemptsDone : 0,
        maxRetries: user ? maxRetries : null
      });
    });

    return { success: true, data: grouped };

  } catch (error) {
    logger.error("[getSyllabusTopics] Error:", error);
    return { success: false, error: "Failed to fetch topics" };
  }
}
