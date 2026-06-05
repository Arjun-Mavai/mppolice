'use server';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🆓 FREE QUIZ ACTIONS — Lead generation ke liye free tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Public actions — koi bhi access kar sakta h (no auth needed)
// MISC type ke tests jo isFreeAccess=true hain wahi dikhenge
// unstable_cache se cached — same pattern as FLT/PYQ/CSAT
// Tag 'tests' se admin upload/edit pe auto-invalidate hota h
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { db } from '@/db';
import { tests, questions, freeQuizAttempts } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { logger } from '@/lib/logger';
import { sendTelegramNotification } from '@/lib/telegram';
import { getTelegramStatsSummary } from '@/lib/telegram-stats-loader';
import { SCORING_CONFIG } from '@/lib/quiz-scoring';

/**
 * recordGuestAttempt — Saves guest score to DB and notifies admin
 */
export async function recordGuestAttempt(data: {
  testId: string;
  guestName: string;
  testTitle?: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  timeTaken: number;
}) {
  try {
    const attemptId = crypto.randomUUID();
    
    // 1. Save to DB (Commented out per request)
    // await db.insert(freeQuizAttempts).values({
    //   id: attemptId,
    //   testId: data.testId,
    //   guestId: 'guest_session', // Placeholder
    //   score: data.score,
    //   completedAt: new Date(),
    // });

    // 2. Fetch Test Title for better notification
    const test = await db.query.tests.findFirst({
      where: eq(tests.id, data.testId),
      columns: { title: true }
    });

    // 3. Send Telegram Notification
    const accuracy = ((data.correctCount / data.totalQuestions) * 100).toFixed(0);
    const timeStr = data.timeTaken > 60 
      ? `${Math.floor(data.timeTaken / 60)}m ${data.timeTaken % 60}s` 
      : `${data.timeTaken}s`;

    // 🔥 NEW: Fetch global stats summary
    const statsSummary = await getTelegramStatsSummary();

    await sendTelegramNotification(
      `📊 <b>FREE QUIZ RESULT</b>\n\n` +
      `<b>👤 Student:</b> ${data.guestName}\n` +
      `<b>📝 Test:</b> ${data.testTitle || test?.title || 'Practice Test'}\n\n` +
      `<b>🏆 Performance Card:</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `• <b>Score:</b> ${data.score} / ${data.totalQuestions * SCORING_CONFIG.MARKS_PER_QUESTION}\n` +
      `• <b>Accuracy:</b> ${accuracy}%\n` +
      `• <b>Correct:</b> ✅ ${data.correctCount}\n` +
      `• <b>Wrong:</b> ❌ ${data.wrongCount}\n` +
      `• <b>Time Taken:</b> ⏱️ ${timeStr}\n` +
      `━━━━━━━━━━━━━━━━\n\n` +
      (statsSummary ? statsSummary + '\n\n' : '') +
      `#FreeQuiz #LeadGenerated`
    );

    return { success: true, attemptId };
  } catch (error) {
    logger.error('Failed to record guest attempt:', error);
    return { success: false };
  }
}

export async function notifyInstantModeGuideClick() {
  try {
    await sendTelegramNotification(
      `⚡ <b>INSTANT MODE GUIDE CLICKED</b>\n\n` +
      `Someone opened the "How to use Instant Mode" guide on the Free Quiz page.\n\n` +
      `#FeatureEngagement #InstantMode`
    );
  } catch (error) {
    logger.error('Failed to notify instant mode guide click:', error);
  }
}

/**
 * getCachedFreeQuizzes — unstable_cache se cached MISC tests
 * 60s revalidate + 'tests' tag — admin se test add/edit hone pe bust hota h
 * Same pattern as getCachedFLTTests, getCachedPYQTests
 */
export const getCachedFreeQuizzes = unstable_cache(
  async () => {
    try {
      logger.info('--- Fetching Free Quizzes from DB ---');
      const result = await db
        .select({
          id: tests.id,
          title: tests.title,
          titleEn: tests.titleEn,
          slug: tests.slug,
          description: tests.description,
          totalQuestions: tests.totalQuestions,
          unitId: tests.unitId,
          tags: tests.tags,
          createdAt: tests.createdAt,
          isInstantMode: tests.isInstantMode,
        })
        .from(tests)
        .where(
          and(
            eq(tests.type, 'MISC'),
            eq(tests.isFreeAccess, true),
            eq(tests.isHidden, false),
            eq(tests.examType, 'mppolice')
          )
        )
        .orderBy(desc(tests.createdAt));
      
      logger.info(`--- Successfully fetched ${result.length} quizzes ---`);
      return result;
    } catch (error) {
      logger.error('--- CRITICAL DB ERROR in getCachedFreeQuizzes ---', error);
      
      return [];
    }
  },
  ['free-tests-list-v4'],
  { revalidate: 60, tags: ['tests'] }
);

/**
 * getCachedSubjectWiseTests — unstable_cache se cached MISC tests (ALL)
 * This fetches ALL MISC tests regardless of whether they are free or premium.
 * Used for the Subject-wise practice hub.
 */
export const getCachedSubjectWiseTests = unstable_cache(
  async () => {
    try {
      const result = await db
        .select({
          id: tests.id,
          title: tests.title,
          titleEn: tests.titleEn,
          slug: tests.slug,
          description: tests.description,
          totalQuestions: tests.totalQuestions,
          unitId: tests.unitId,
          tags: tests.tags,
          createdAt: tests.createdAt,
          isFreeAccess: tests.isFreeAccess,
          isLiteAccess: tests.isLiteAccess,
          isProAccess: tests.isProAccess,
        })
        .from(tests)
        .where(
          and(
            eq(tests.type, 'MISC'),
            eq(tests.isHidden, false),
            eq(tests.examType, 'mppolice')
          )
        )
        .orderBy(asc(tests.createdAt));
      
      return result;
    } catch (error) {
      logger.error('CRITICAL DB ERROR in getCachedSubjectWiseTests', error);
      return [];
    }
  },
  ['subject-wise-tests-list-v2'],
  { revalidate: 60, tags: ['tests'] }
);

/**
 * getFreeQuizWithQuestions — Ek specific free test + uske questions
 * Quiz play page pe use hoga — questions load karne ke liye
 * NOW CACHED for performance - revalidates every 5 minutes
 */
const fetchFreeQuizData = async (testId: string) => {
  const test = await db
    .select()
    .from(tests)
    .where(
      and(
        eq(tests.id, testId),
        eq(tests.type, 'MISC'),
        eq(tests.isFreeAccess, true),
        eq(tests.isHidden, false),
        eq(tests.examType, 'mppolice')
      )
    )
    .get();

  if (!test) return null;

  const testQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.testId, testId))
    .orderBy(questions.order);

  return { ...test, questions: testQuestions };
};

export const getCachedFreeQuizWithQuestions = unstable_cache(
  fetchFreeQuizData,
  ['free-quiz-with-questions-v4'],
  { revalidate: 300, tags: ['tests'] }
);

export async function getFreeQuizWithQuestions(testId: string) {
  try {
    return await getCachedFreeQuizWithQuestions(testId);
  } catch (error) {
    logger.error('getFreeQuizWithQuestions Error:', error);
    return null;
  }
}
