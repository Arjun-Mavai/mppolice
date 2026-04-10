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
import { eq, and, desc } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { logger } from '@/lib/logger';
import { sendTelegramNotification } from '@/lib/telegram';

/**
 * recordGuestAttempt — Saves guest score to DB and notifies admin
 */
export async function recordGuestAttempt(data: {
  testId: string;
  guestName: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  timeTaken: number;
}) {
  try {
    const attemptId = crypto.randomUUID();
    
    // 1. Save to DB
    await db.insert(freeQuizAttempts).values({
      id: attemptId,
      testId: data.testId,
      guestId: 'guest_session', // Placeholder
      score: data.score,
      completedAt: new Date(),
    });

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

    await sendTelegramNotification(
      `📊 <b>FREE QUIZ RESULT</b>\n\n` +
      `<b>👤 Student:</b> ${data.guestName}\n` +
      `<b>📝 Test:</b> ${test?.title || 'Practice Test'}\n\n` +
      `<b>🏆 Performance Card:</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `• <b>Score:</b> ${data.score} / ${data.totalQuestions * 3}\n` +
      `• <b>Accuracy:</b> ${accuracy}%\n` +
      `• <b>Correct:</b> ✅ ${data.correctCount}\n` +
      `• <b>Wrong:</b> ❌ ${data.wrongCount}\n` +
      `• <b>Time Taken:</b> ⏱️ ${timeStr}\n` +
      `━━━━━━━━━━━━━━━━\n\n` +
      `#FreeQuiz #LeadGenerated`
    );

    return { success: true, attemptId };
  } catch (error) {
    logger.error('Failed to record guest attempt:', error);
    return { success: false };
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
      return await db
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
        })
        .from(tests)
        .where(and(eq(tests.type, 'MISC'), eq(tests.isFreeAccess, true), eq(tests.isHidden, false)))
        .orderBy(desc(tests.createdAt));
    } catch (error) {
      console.error('CRITICAL DB ERROR in getCachedFreeQuizzes:', error);
      // Log more details if it's a Drizzle/LibSQL error
      if (error instanceof Error) {
        logger.error('Free Quiz Fetch Failed:', {
          message: error.message,
          stack: error.stack,
        });
      }
      return [];
    }
  },
  ['free-tests-list'],
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
    .where(and(eq(tests.id, testId), eq(tests.type, 'MISC'), eq(tests.isFreeAccess, true), eq(tests.isHidden, false)))
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
  ['free-quiz-with-questions'],
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
