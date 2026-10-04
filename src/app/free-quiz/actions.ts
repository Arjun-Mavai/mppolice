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
import { headers } from 'next/headers';

/**
 * recordGuestAttempt — Notifies admin of a guest score (DB storage disabled)
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
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'Unknown IP';
    const city = headersList.get('x-vercel-ip-city') || 'Unknown City';
    const region = headersList.get('x-vercel-ip-region') || 'Unknown Region';
    const country = headersList.get('x-vercel-ip-country') || 'Unknown Country';
    const userAgent = headersList.get('user-agent') || 'Unknown Browser';

    // Parse User Agent for Device OS and Browser
    const ua = userAgent.toLowerCase();
    let browser = 'Unknown';
    let os = 'Unknown';
    if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('edg/') || ua.includes('edge')) browser = 'Edge';
    else if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('safari')) browser = 'Safari';
    if (ua.includes('iphone')) os = 'iPhone';
    else if (ua.includes('ipad')) os = 'iPad';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
    else if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('linux')) os = 'Linux';
    const browserOs = `${browser} on ${os}`;

    const dateObj = new Date();
    const dayName = dateObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short' });
    const dateStr = dateObj.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
    });
    const timeStr = dateObj.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    });
    const timestamp = `${dayName}, ${dateStr} | ${timeStr} IST`;

    const location = (city !== 'Unknown City' || region !== 'Unknown Region') 
      ? `${city}, ${region}, ${country}` 
      : 'Location Unavailable';

    await sendTelegramNotification(
      `⚡ <b>INSTANT MODE GUIDE CLICKED</b>\n\n` +
      `Someone opened the "How to use Instant Mode" guide on the Free Quiz page.\n\n` +
      `👤 <b>Guest User</b>\n` +
      `📱 <b>Device:</b> ${browserOs}\n` +
      `🌐 <b>IP Address:</b> ${ip}\n` +
      `📍 <b>Location:</b> ${location}\n` +
      `📅 <b>Date & Time:</b> ${timestamp}\n\n` +
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
          isFreeAccess: tests.isFreeAccess,
          isHidden: tests.isHidden,
          examType: tests.examType,
        })
        .from(tests)
        .where(eq(tests.type, 'MISC'))
        .orderBy(desc(tests.createdAt));

      const eligible = result.filter(
        (test) =>
          test.isFreeAccess === true &&
          test.isHidden !== true &&
          test.examType === 'mppolice'
      );
      
      logger.info(`--- Successfully fetched ${eligible.length} quizzes ---`);
      return eligible;
    } catch (error) {
      logger.error('--- CRITICAL DB ERROR in getCachedFreeQuizzes ---', error);
      
      return [];
    }
  },
  ['free-tests-list-v5'],
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
  const testRows = await db
    .select()
    .from(tests)
    .where(and(eq(tests.id, testId), eq(tests.type, 'MISC')))
    .limit(1);
  const test = testRows[0];

  if (
    !test ||
    test.isFreeAccess !== true ||
    test.isHidden === true ||
    test.examType !== 'mppolice'
  ) {
    return null;
  }

  const testQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.testId, testId))
    .orderBy(questions.order);

  return { ...test, questions: testQuestions };
};

export const getCachedFreeQuizWithQuestions = unstable_cache(
  fetchFreeQuizData,
  ['free-quiz-with-questions-v5'],
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
