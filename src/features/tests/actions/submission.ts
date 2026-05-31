'use server';

import { db } from '@/db';
import { tests, userAttempts, questions, attemptAnswers, syllabusTopics } from '@/db/schema';
import { eq, asc, desc, and, inArray, sql, or } from 'drizzle-orm';
import { unstable_cache, revalidateTag } from 'next/cache';
import { verifyAuth } from '@/lib/auth';
import { SCORING_CONFIG } from '@/lib/quiz-scoring';
import { logger } from '@/lib/logger';
import { insertUserToLeaderboard } from '@/actions/leaderboard-actions';
import { sendTelegramNotification, escapeHTML } from '@/lib/telegram';

// --- Generic Cached Fetchers ---

export const getCachedPYQTests = unstable_cache(
  async () => {
    const pyqTests = await db
      .select({
        id: tests.id,
        title: tests.title,
        titleEn: tests.titleEn,
        description: tests.description,
        slug: tests.slug,
        durationMinutes: tests.durationMinutes,
        totalQuestions: tests.totalQuestions,
        totalMarks: tests.totalMarks,
        type: tests.type,
        isPro: tests.isPro,
        isFreeAccess: tests.isFreeAccess,
        isLiteAccess: tests.isLiteAccess,
        isProAccess: tests.isProAccess,
        displayOrder: tests.displayOrder,
        isHidden: tests.isHidden,
        createdAt: tests.createdAt,
        tags: tests.tags,
        examType: tests.examType,
      })
      .from(tests)
      .where(
        and(
          eq(tests.type, 'PYQ'),
          eq(tests.isHidden, false),
          or(eq(tests.examType, 'mppolice'), eq(tests.examType, 'all'))
        )
      )
      .orderBy(asc(tests.displayOrder), desc(tests.createdAt));

    return pyqTests.map((test) => ({
      ...test,
      year: test.title.match(/\d{4}/)?.[0] || new Date(test.createdAt!).getFullYear().toString(),
    }));
  },
  ['pyq-tests-list-v7'],
  { revalidate: 60, tags: ['tests'] }
);

/** Mock / full-length style tests (non-PYQ) for MP Police hub */
export const getCachedMppoliceMockTests = unstable_cache(
  async () => {
    const rows = await db
      .select({
        id: tests.id,
        title: tests.title,
        titleEn: tests.titleEn,
        description: tests.description,
        slug: tests.slug,
        durationMinutes: tests.durationMinutes,
        totalQuestions: tests.totalQuestions,
        totalMarks: tests.totalMarks,
        type: tests.type,
        isPro: tests.isPro,
        isFreeAccess: tests.isFreeAccess,
        isLiteAccess: tests.isLiteAccess,
        isProAccess: tests.isProAccess,
        displayOrder: tests.displayOrder,
        createdAt: tests.createdAt,
        tags: tests.tags,
        examType: tests.examType,
      })
      .from(tests)
      .where(
        and(
          eq(tests.isHidden, false),
          or(eq(tests.examType, 'mppolice'), eq(tests.examType, 'all')),
          inArray(tests.type, ['FLT', 'POLICE_CONSTABLE', 'POLICE_SI', 'UNIT', 'TOPIC', 'CSAT'])
        )
      )
      .orderBy(asc(tests.displayOrder), desc(tests.createdAt));

    return rows.map((test) => ({
      ...test,
      year: test.title.match(/\d{4}/)?.[0] || new Date(test.createdAt!).getFullYear().toString(),
    }));
  },
  ['mppolice-mock-tests-v4'],
  { revalidate: 60, tags: ['tests'] }
);

export const getCachedFLTTests = unstable_cache(
  async () => {
    return await db
      .select()
      .from(tests)
      .where(
        and(
          eq(tests.type, 'FLT'),
          eq(tests.isHidden, false),
          or(eq(tests.examType, 'mppolice'), eq(tests.examType, 'all'))
        )
      )
      .orderBy(asc(tests.displayOrder));
  },
  ['flt-tests-list-v2'],
  { revalidate: 60, tags: ['tests'] }
);

export const getCachedCSATTests = unstable_cache(
  async () => {
    return await db
      .select()
      .from(tests)
      .where(
        and(eq(tests.type, 'CSAT'), eq(tests.isHidden, false), eq(tests.examType, 'mppolice'))
      )
      .orderBy(asc(tests.displayOrder), desc(tests.createdAt));
  },
  ['csat-tests-list'],
  { revalidate: 60, tags: ['tests'] }
);

// --- Dynamic User Data Fetchers ---

export async function getUserAttempts(testIds: string[], userId?: string) {
  let finalUserId = userId;

  if (!finalUserId) {
    const user = await verifyAuth();
    if (!user) return {};
    finalUserId = user.id;
  }

  if (testIds.length === 0) return {};

  const attempts = await db
    .select({
      testId: userAttempts.testId,
      count: sql<number>`count(*)`,
    })
    .from(userAttempts)
    .where(and(eq(userAttempts.userId, finalUserId), inArray(userAttempts.testId, testIds)))
    // 🛡️ CRITICAL FIX: Removed .limit(100) because it was truncating attempts if user took > 100 tests
    .groupBy(userAttempts.testId);

  // Return as a Record<string, number> for easy client-side mapping
  return attempts.reduce(
    (acc, curr) => {
      acc[curr.testId] = Number(curr.count);
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * getUserAttemptsByType
 * Faster way to get all attempts for a specific type (FLT, PYQ, etc)
 */
export async function getUserAttemptsByType(
  type: 'FLT' | 'UNIT' | 'CSAT' | 'PYQ' | 'TOPIC',
  userId: string
) {
  const attempts = await db
    .select({
      testId: userAttempts.testId,
      count: sql<number>`count(*)`,
    })
    .from(userAttempts)
    .innerJoin(tests, eq(userAttempts.testId, tests.id))
    .where(and(eq(userAttempts.userId, userId), eq(tests.type, type)))
    // 🛡️ CRITICAL FIX: Removed .limit(1000) as users might have more attempts across many topic tests
    .groupBy(userAttempts.testId);

  return attempts.reduce(
    (acc, curr) => {
      acc[curr.testId] = Number(curr.count);
      return acc;
    },
    {} as Record<string, number>
  );
}

import { z } from 'zod';

const testIdSchema = z.string().uuid().or(z.string().min(1)); // Allow non-UUID IDs if legacy support needed, but prefer UUID
const unitIdSchema = z.string().min(1);

export async function getTestByUnitId(unitId: string) {
  const validatedUnitId = unitIdSchema.parse(unitId);

  const test = await db.query.tests.findFirst({
    where: and(
      eq(tests.unitId, validatedUnitId),
      // We look for 'UNIT' type tests specifically.
      // If multiple exist, we take the first one (usually there's only one "Unit Test" per unit).
      eq(tests.type, 'UNIT'),
      eq(tests.examType, 'mppolice')
    ),
    with: {
      questions: {
        orderBy: asc(questions.order),
      },
    },
  });

  return test || null;
}

// --- Cached Test with Questions ---
// Heavy function called on every quiz start - MUST be cached

const fetchTestWithQuestionsData = async (testId: string) => {
  const validatedId = testIdSchema.parse(testId);

  // Fetch Test with questions in single query
  const test = await db.query.tests.findFirst({
    where: and(
      eq(tests.id, validatedId),
      or(eq(tests.examType, 'mppolice'), eq(tests.examType, 'all'))
    ),
    with: {
      questions: {
        orderBy: asc(questions.order),
      },
    },
  });

  if (!test) return null;

  // Enriched Logic: If it's a Topic Test, fetch the topic title
  if (test.topicId) {
    const topic = await db.query.syllabusTopics.findFirst({
      where: eq(syllabusTopics.id, test.topicId),
      columns: {
        title: true,
        titleEn: true,
      },
    });

    if (topic) {
      const cleanTitle = topic.titleEn || topic.title;
      if (cleanTitle) {
        test.title = `${cleanTitle} Practice Test`;
      }
    }
  }

  return test;
};

// Cached version - revalidates every 5 minutes, invalidates on test update
export const getCachedTestWithQuestions = unstable_cache(
  fetchTestWithQuestionsData,
  ['test-with-questions'],
  { revalidate: 300, tags: ['tests'] }
);

export async function getTestWithQuestions(testId: string) {
  try {
    return await getCachedTestWithQuestions(testId);
  } catch (error) {
    logger.error('Invalid Test ID or DB Error:', error);
    return null;
  }
}

import { canAttemptTest } from '@/lib/access-control';
import { checkRateLimit, genApiLimiter } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function submitTestAttempt(
  testId: string,
  userId: string,
  answers: Record<string, string>,
  durationSeconds: number,
  questionTimes: Record<string, number>,
  testTitle?: string
) {
  try {
    // 🚦 1. Rate Limiting (API Protection)
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') ?? '127.0.0.1';
    const { success: rateOk } = await checkRateLimit(genApiLimiter, `submit-${userId}-${ip}`);
    if (!rateOk) return { error: 'Too many submissions. Relax, take a breath!' };

    // 🔒 2. IDOR Prevention: Verify userId from JWT matches parameter
    const session = await verifyAuth();
    if (!session) {
      return { error: 'Unauthorized — please login to submit test' };
    }
    if (session.id !== userId) {
      logger.warn('IDOR attempt blocked', { category: 'system', metadata: { jwtUserId: session.id, paramUserId: userId } });
      return { error: 'Unauthorized — userId mismatch' };
    }

    // 🛡️ 3. Fetch Test & Enforce Access Control (Gatekeeper)
    const test = await db.query.tests.findFirst({ where: eq(tests.id, testId) });
    if (!test) return { error: 'Test not found' };

    // Check if user is actually allowed to attempt this (Plan Limits)
    const currentAttemptsRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(userAttempts)
      .where(and(eq(userAttempts.userId, userId), eq(userAttempts.testId, testId), eq(userAttempts.isCompleted, true)));
    
    const attemptsCount = Number(currentAttemptsRows[0]?.count || 0);
    const access = canAttemptTest(test, session, attemptsCount);
    
    if (!access.allowed) {
      logger.warn('Plan limit bypass attempt blocked', { category: 'auth', metadata: { userId, testId, attemptsCount } });
      return { error: access.reason || 'Plan limit reached' };
    }

    // 🛡️ 4. Prevent Double Submit (Race Condition Soft-Check)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const recentAttempt = await db.query.userAttempts.findFirst({
      where: and(
        eq(userAttempts.userId, userId),
        eq(userAttempts.testId, testId),
        eq(userAttempts.isCompleted, true),
        sql`${userAttempts.endTime} > ${thirtySecondsAgo}`
      ),
    });

    if (recentAttempt) return { error: 'Test already submitted recently.' };

    // 1. Fetch Correct Answers from DB (Secure)
    const testQuestions = await db
      .select({
        id: questions.id,
        correctAnswer: questions.correctAnswer,
        marks: questions.marks,
        negativeMarks: questions.negativeMarks,
      })
      .from(questions)
      .where(eq(questions.testId, testId));

    if (testQuestions.length === 0) return { error: 'Test questions missing' };

    // 2. Calculate Score
    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    const answersList: {
      questionId: string;
      userAnswer: string;
      isCorrect: boolean;
      timeTaken: number;
    }[] = [];

    testQuestions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer !== undefined) {
        const isCorrect = String(userAnswer) === String(q.correctAnswer);

        // 🛡️ Production-Ready Scoring: Use question marks with global fallback
        const marks = q.marks ?? SCORING_CONFIG.MARKS_PER_QUESTION;
        const negativeMarking = q.negativeMarks ?? SCORING_CONFIG.NEGATIVE_MARKING;

        if (isCorrect) {
          totalScore += marks;
          correctCount++;
        } else {
          totalScore -= negativeMarking;
          incorrectCount++;
        }

        answersList.push({
          questionId: q.id,
          userAnswer: String(userAnswer),
          isCorrect,
          timeTaken: Math.round(questionTimes[q.id] || 0),
        });
      }
    });

    // 🛡️ Server-Side Timer Validation (Prevent Time Manipulation)
    // Bhai, test already fetched above (line 306) — reuse karo, dobara DB call nahi!
    const maxDuration = (test?.durationMinutes || 60) * 60; // Convert to seconds
    const validDuration = Math.min(Math.max(durationSeconds, 0), maxDuration);

    if (validDuration !== durationSeconds) {
      logger.warn('Invalid test duration detected', {
        category: 'system',
        metadata: {
          userId,
          testId,
          submittedDuration: durationSeconds,
          validatedDuration: validDuration,
        },
      });
    }

    const finalScore = parseFloat(totalScore.toFixed(2));

    // 3. Create Attempt Record
    const attemptId = crypto.randomUUID();

    // Transaction to ensure data consistency
    await db.transaction(async (tx) => {
      // Create Attempt
      await tx.insert(userAttempts).values({
        id: attemptId,
        userId,
        testId,
        startTime: new Date(Date.now() - validDuration * 1000), // Use validated duration
        endTime: new Date(),
        score: finalScore,
        isCompleted: true,
      });

      // Bulk Insert Answers
      if (answersList.length > 0) {
        await tx.insert(attemptAnswers).values(
          answersList.map((a) => ({
            id: crypto.randomUUID(),
            attemptId,
            questionId: a.questionId,
            userAnswer: a.userAnswer,
            isCorrect: a.isCorrect,
            timeTakenSeconds: a.timeTaken,
          }))
        );
      }
    });

    // 4. Parallelize post-submission tasks (Leaderboard, Analytics, Revalidation)
    const postSubmissionTasks: Promise<any>[] = [];

    const totalTestMarks = testQuestions.reduce(
      (sum, q) => sum + (q.marks ?? SCORING_CONFIG.MARKS_PER_QUESTION),
      0
    );

    if (session && session.name) {
      postSubmissionTasks.push(
        insertUserToLeaderboard({
          testId,
          userId,
          displayName: session.name,
          score: finalScore,
          timeTaken: validDuration,
          totalMarks: totalTestMarks,
        })
      );
    }

    // Invalidate User Analytics Cache
    try {
      revalidateTag(`analytics-${userId}`,{expire: 0});
    } catch (err) {
      // Ignore cache errors
    }

    // 🚀 Prepare Telegram Notification data
    const totalAttempted = correctCount + incorrectCount;
    const accuracy = totalAttempted > 0 ? ((correctCount / totalAttempted) * 100).toFixed(0) : '0';
    
    const telegramMessage = `🏆 <b>Test Completed</b>\n\n` +
      `<b>Test:</b> ${escapeHTML(testTitle || test?.title || 'N/A')}\n` +
      `<b>User:</b> ${escapeHTML(session?.name || 'Student')}\n` +
      `<b>Score:</b> ${finalScore}/${totalTestMarks} (${accuracy}% accuracy)\n` +
      `<b>Stats:</b> ✅${correctCount} | ❌${incorrectCount} | ⏱️${Math.floor(validDuration / 60)}m`;

    postSubmissionTasks.push(sendTelegramNotification(telegramMessage));

    // Run all tasks in parallel
    await Promise.allSettled(postSubmissionTasks);

    return { success: true, attemptId, score: finalScore };
  } catch (error) {
    logger.error('Error submitting test:', error);
    return { error: 'Failed to submit test' };
  }
}
