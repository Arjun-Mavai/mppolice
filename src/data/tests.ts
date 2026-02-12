
import { db } from '@/db';
import { tests, questions, userAttempts, attemptAnswers } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { CACHE } from '@/lib/cache';
import { logger } from '@/lib/logger';

export const getTests = async (filters: { unitId?: string; type?: 'FLT' | 'UNIT' | 'CSAT' } = {}) => {
  return await unstable_cache(
    async () => {
      try {
        const conditions = [eq(tests.isHidden, false)];
        if (filters.unitId) conditions.push(eq(tests.unitId, filters.unitId));
        if (filters.type) conditions.push(eq(tests.type, filters.type));

        return await db.select()
          .from(tests)
          .where(and(...conditions))
          .orderBy(desc(tests.createdAt));
      } catch (error) {
        logger.error("Failed to fetch tests:", error);
        return [];
      }
    },
    [`tests-${filters.unitId || 'all'}-${filters.type || 'all'}`],
    {
      revalidate: CACHE.TESTS.GET_ALL.revalidate,
      tags: CACHE.TESTS.GET_ALL.tags
    }
  )();
};

export const getTestBySlug = async (slug: string) => {
  return await unstable_cache(
    async () => {
      try {
        const result = await db.select().from(tests).where(eq(tests.slug, slug)).limit(1);
        return result[0] || null;
      } catch (error) {
        logger.error(`Failed to fetch test ${slug}:`, error);
        return null;
      }
    },
    [`test-${slug}`],
    {
      revalidate: CACHE.TESTS.GET_ALL.revalidate,
      tags: [CACHE.TESTS.TAGS.DETAIL(slug)]
    }
  )();
};

export const getTestQuestions = async (testId: string) => {
  return await unstable_cache(
    async () => {
      try {
        return await db.select().from(questions).where(eq(questions.testId, testId)).orderBy(questions.order);
      } catch (error) {
        logger.error(`Failed to fetch questions for ${testId}:`, error);
        return [];
      }
    },
    [`test-questions-${testId}`],
    {
      revalidate: CACHE.TESTS.GET_ALL.revalidate,
      tags: [CACHE.TESTS.TAGS.DETAIL(testId)]
    }
  )();
};

export const getAttemptResult = async (attemptId: string) => {
  return await unstable_cache(
    async () => {
      try {
        const attemptResult = await db.select().from(userAttempts).where(eq(userAttempts.id, attemptId)).limit(1);
        const attempt = attemptResult[0];
        
        if (!attempt) return null;

        // Fetch granular answers with question details using join
        const answers = await db.select({
            userAnswer: attemptAnswers.userAnswer,
            isCorrect: attemptAnswers.isCorrect,
            timeTaken: attemptAnswers.timeTakenSeconds,
            questionId: questions.id,
            questionText: questions.questionText,
            questionTextEn: questions.questionTextEn,
            options: questions.options,
            correctAnswer: questions.correctAnswer,
            explanation: questions.explanation,
            explanationEn: questions.explanationEn,
            marks: questions.marks,
            negativeMarks: questions.negativeMarks,
            idealTime: questions.idealTime,
            order: questions.order
        })
        .from(attemptAnswers)
        .leftJoin(questions, eq(attemptAnswers.questionId, questions.id))
        .where(eq(attemptAnswers.attemptId, attemptId))
        .orderBy(questions.order);

        return { ...attempt, details: answers };
      } catch (error) {
        logger.error(`Failed to fetch attempt ${attemptId}:`, error);
        return null;
      }
    },
    [`attempt-${attemptId}`],
    {
      revalidate: 0, // User-specific data, no caching
      tags: [`attempt-${attemptId}`]
    }
  )();
};
