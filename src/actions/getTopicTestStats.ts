'use server';

import { db } from '@/db';
import { tests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { getMppoliceFlattenedTopics, MPPOLICE_SECTION_IDS } from '@/data/mppoliceSyllabus';
import { cachedData, CACHE } from '@/lib/cache';

export interface TopicStat {
  topicId: string;
  unitId: string;
  topicTitle: string;
  testId: string | null;
  questionCount: number;
  lastUpdated: Date | null;
  uiBucket?: string;
}

export interface ExamCoverageStats {
  sections: Record<string, TopicStat[]>;
  pypCount: number;
  memoryCount: number;
  subjectWiseCount: number;
}

export const getTopicTestStats = cachedData(
  async () => {
    try {
      // 1. Get official MP Police Syllabus (Hardcoded source of truth)
      const allTopics = getMppoliceFlattenedTopics();

      // 2. Fetch all MP Police tests
      const mppTests = await db
        .select({
          id: tests.id,
          type: tests.type,
          topicId: tests.topicId,
          unitId: tests.unitId,
          totalQuestions: tests.totalQuestions,
          updatedAt: tests.updatedAt,
          tags: tests.tags,
        })
        .from(tests)
        .where(eq(tests.examType, 'mppolice'));

      // 3. Pre-process tests for efficient lookup and robust aggregation
      // We group tests by topicId and sum their totalQuestions
      const topicTestData: Record<string, { totalQ: number; testId: string; updatedAt: Date }> = {};
      
      mppTests.forEach((t) => {
        const type = t.type?.toUpperCase();
        if (type === 'TOPIC' && t.topicId) {
          const tid = t.topicId.trim();
          if (!topicTestData[tid]) {
            topicTestData[tid] = { totalQ: 0, testId: t.id, updatedAt: t.updatedAt || new Date() };
          }
          topicTestData[tid].totalQ += t.totalQuestions || 0;
          // Keep the latest test ID for the "Start Test" link
          if (t.updatedAt && t.updatedAt > topicTestData[tid].updatedAt) {
            topicTestData[tid].testId = t.id;
            topicTestData[tid].updatedAt = t.updatedAt;
          }
        }
      });

      const stats: Record<string, TopicStat[]> = {};
      let pypCount = 0;
      let memoryCount = 0;
      let subjectWiseCount = 0;

      // 4. Map stats to official syllabus chapters
      for (const topic of allTopics) {
        const match = topicTestData[topic.id.trim()];

        const stat: TopicStat = {
          topicId: topic.id,
          unitId: topic.sectionId,
          topicTitle: topic.front,
          testId: match?.testId || null,
          questionCount: match?.totalQ || 0,
          lastUpdated: match?.updatedAt || null,
          uiBucket: topic.uiBucket,
        };

        if (!stats[topic.sectionId]) {
          stats[topic.sectionId] = [];
        }
        stats[topic.sectionId].push(stat);
      }

      // Count Specialized tests
      mppTests.forEach((t) => {
        const tags = Array.isArray(t.tags) ? (t.tags as string[]) : [];
        if (t.type === 'PYQ') pypCount++;
        // Memory based counts FLT or if specifically tagged
        if (t.type === 'FLT' || tags.some(tag => tag.toLowerCase().includes('memory'))) memoryCount++;
        if (t.type === 'MISC' || t.type === 'UNIT') subjectWiseCount++;
      });

      return { 
        success: true, 
        data: {
          sections: stats,
          pypCount,
          memoryCount,
          subjectWiseCount
        } 
      };
    } catch (error) {
      logger.error('Error fetching MP Police topic stats:', error);
      return { success: false, error: 'Failed to load stats' };
    }
  },
  ['mpp-topic-test-stats'],
  [CACHE.TESTS.TAGS.ALL]
);
