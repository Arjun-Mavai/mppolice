"use server";

import { db } from "@/db";
import { tests, syllabusTopics } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

export interface TopicStat {
    topicId: string; // the string ID from syllabus_topics
    unitId: string;
    topicTitle: string;
    testId: string | null;
    questionCount: number;
    lastUpdated: Date | null;
}

export async function getTopicTestStats() {
    try {
        // 1. Fetch all Syllabus Topics (Source of Truth)
        // We want to see coverage for ALL topics, not just those with tests.
        const allTopics = await db.select().from(syllabusTopics);

        // 2. Fetch all Topic Tests
        const allTests = await db.select({
            id: tests.id,
            topicId: tests.topicId,
            unitId: tests.unitId,
            totalQuestions: tests.totalQuestions,
            updatedAt: tests.updatedAt
        })
        .from(tests)
        .where(eq(tests.type, 'TOPIC'));

        // 3. Merge Data
        // Map: Unit -> Topic[]
        const stats: Record<string, TopicStat[]> = {};

        // Sort topics by DB order first
        allTopics.sort((a,b) => a.order - b.order);

        for (const topic of allTopics) {
            // Find matching test
            // Note: tests.topicId is stored as string in Upload Action. 
            // Ideally it matches syllabusTopics.id (which is also text/string in schema now?)
            // Let's assume schema consistency from previous steps. 
            const linkedTest = allTests.find(t => t.topicId === topic.id && t.unitId === topic.unitId);

            const stat: TopicStat = {
                topicId: topic.id,
                unitId: topic.unitId,
                topicTitle: topic.title,
                testId: linkedTest?.id || null,
                questionCount: linkedTest?.totalQuestions || 0,
                lastUpdated: linkedTest?.updatedAt || null
            };

            if (!stats[topic.unitId]) {
                stats[topic.unitId] = [];
            }
            stats[topic.unitId].push(stat);
        }

        return { success: true, data: stats };

    } catch (error) {
        logger.error("Error fetching topic stats:", error);
        return { success: false, error: "Failed to load stats" };
    }
}
