'use server';

import { db } from '@/db';
import { pyqQuestionTopics, pyqTopics, pyqTopicTrends } from '@/db/schema';
import { inArray, eq, and, desc } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export interface PYQWrongTopicInsight {
  topicId: string;
  topicTitle: string;
  topicTitleEn?: string | null;
  frequencyLast6Years: number;
  trend2024?: 'Rising' | 'Stable' | 'Falling';
  importanceScore: number; // Out of 10
  coreFact?: string; // Memory tip or core fact (mocked or fetched from fact bank)
  coreFactEn?: string;
  trapAlert?: string; // Scam alert or trap
  trapAlertEn?: string;
}

export async function getPYQIntelligenceForWrongQuestions(
  wrongQuestionIds: string[]
): Promise<PYQWrongTopicInsight[]> {
  if (!wrongQuestionIds || wrongQuestionIds.length === 0) {
    return [];
  }

  try {
    // 1. Get the Topics for the wrong questions
    const qtRows = await db
      .select({
        topicId: pyqQuestionTopics.topicId,
      })
      .from(pyqQuestionTopics)
      .where(inArray(pyqQuestionTopics.questionId, wrongQuestionIds));

    const topicIds = Array.from(new Set(qtRows.map((r) => r.topicId)));

    if (topicIds.length === 0) {
      return [];
    }

    // 2. Fetch Topic Details & Trends for these topics
    const topicsData = await db
      .select({
        id: pyqTopics.id,
        title: pyqTopics.topicTitle,
        titleEn: pyqTopics.topicTitleEn,
      })
      .from(pyqTopics)
      .where(inArray(pyqTopics.id, topicIds));

    const trendsData = await db
      .select({
        topicId: pyqTopicTrends.topicId,
        year: pyqTopicTrends.year,
        count: pyqTopicTrends.questionCount,
        delta: pyqTopicTrends.trendDelta,
      })
      .from(pyqTopicTrends)
      .where(inArray(pyqTopicTrends.topicId, topicIds))
      .orderBy(desc(pyqTopicTrends.year));

    // Calculate aggregated insights per topic
    const insights: PYQWrongTopicInsight[] = topicsData.map((topic) => {
      const topicTrends = trendsData.filter((t) => t.topicId === topic.id);
      
      // Calculate frequency in the last ~6 years
      // Just sum the counts for the latest 6 years available for this topic
      const recentTrends = topicTrends.slice(0, 6);
      const frequencyLast6Years = recentTrends.reduce((acc, t) => acc + t.count, 0);

      // Determine trend for the most recent year
      let trend2024: 'Rising' | 'Stable' | 'Falling' = 'Stable';
      const latestTrend = topicTrends[0];
      if (latestTrend) {
        if (latestTrend.delta && latestTrend.delta > 0) trend2024 = 'Rising';
        else if (latestTrend.delta && latestTrend.delta < 0) trend2024 = 'Falling';
      }

      // Calculate an importance score out of 10 (heuristic)
      // e.g. if frequency >= 5, 10/10. if 3-4, 8/10. if 1-2, 6/10.
      let importanceScore = 5;
      if (frequencyLast6Years >= 5) importanceScore = 10;
      else if (frequencyLast6Years >= 3) importanceScore = 8;
      else if (frequencyLast6Years >= 1) importanceScore = 6;

      return {
        topicId: topic.id,
        topicTitle: topic.title,
        topicTitleEn: topic.titleEn,
        frequencyLast6Years,
        trend2024,
        importanceScore,
        coreFact: 'Revise this topic well to avoid negative marking.', // Placeholder, ideally from pyqFactBank
        trapAlert: 'Often confused with similar sounding concepts in this subject.',
      };
    });

    // Sort by importance (highest first)
    return insights.sort((a, b) => b.importanceScore - a.importanceScore);

  } catch (error) {
    logger.error('Failed to fetch PYQ intelligence for wrong questions', error, {
      category: 'db',
    });
    return [];
  }
}
