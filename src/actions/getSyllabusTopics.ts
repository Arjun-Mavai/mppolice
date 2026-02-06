"use server";

import { db } from "@/db";
import { syllabusTopics, tests } from "@/db/schema";
import { asc, eq, inArray } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { cachedData, CACHE_TAGS } from "@/lib/cache";

export const getSyllabusTopics = cachedData(async () => {
  try {
    const topics = await db.query.syllabusTopics.findMany({
      orderBy: [asc(syllabusTopics.order)],
    });

    // Fetch related tests
    const topicIds = topics.map(t => t.id);
    const relatedTests = await db.select({
      id: tests.id,
      topicId: tests.topicId
    })
    .from(tests)
    .where(
      inArray(tests.topicId, topicIds)
    );

    const topicTestMap = relatedTests.reduce((acc, curr) => {
      if(curr.topicId) acc[curr.topicId] = curr.id;
      return acc;
    }, {} as Record<string, string>);

    // Group by Unit
    const grouped: Record<string, (typeof topics[0] & { testId?: string })[]> = {};
    
    // Sort logic handled by DB order, but if we need unit sorting we can do it client side or here.
    // Let's return the raw list or grouped list. Grouping is easier for UI.
    
    topics.forEach(topic => {
      if (!grouped[topic.unitId]) {
        grouped[topic.unitId] = [];
      }
      grouped[topic.unitId].push({
        ...topic,
        testId: topicTestMap[topic.id]
      });
    });

    return { success: true, data: grouped };

  } catch (error) {
    logger.error("Error fetching syllabus topics:", error);
    return { success: false, error: "Failed to fetch topics" };
  }
}, ['syllabus-topics-grouped'], [CACHE_TAGS.SYLLABUS]);
