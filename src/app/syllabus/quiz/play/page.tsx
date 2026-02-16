import { redirect } from 'next/navigation';
import { getTestWithQuestions, getUserAttempts } from '@/features/tests/actions/submission';
import { QuizPlayClient } from './QuizPlayClient';
import { verifyAuth } from '@/lib/auth';
import { Question } from '@/types/quiz';
import { logger } from '@/lib/logger';
import { SCORING_CONFIG } from '@/lib/quiz-scoring';
import { getCachedAttemptLimits } from '@/app/admin/test-access/actions';
import { canAccessTest, getUserTier } from '@/lib/access-control';

interface PageProps {
  searchParams: Promise<{
    testId?: string;
    mode?: string;
  }>;
}

export default async function QuizPlayPage({ searchParams }: PageProps) {
  const params = await searchParams;
  logger.debug('params', { params, category: 'system' });
  const { testId, mode } = params;

  if (!testId) {
    redirect('/syllabus/quiz/pyq');
  }

  // 1. Fetch Initial Data in Parallel (Reduces waterfall)
  const [testData, user, attemptLimits, attemptsMap] = await Promise.all([
    getTestWithQuestions(testId),
    verifyAuth(),
    getCachedAttemptLimits(),
    verifyAuth().then((u) =>
      u ? getUserAttempts([testId], u.id) : ({} as Record<string, number>)
    ),
  ]);

  if (!testData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-[80px]">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Test Not Found</h1>
          <p className="text-slate-500">The requested test could not be found.</p>
        </div>
      </div>
    );
  }

  // 🛡️ [PR FIX]: Access check as early as possible before any processing
  const guestDenied = !user && !testData.isFreeAccess;
  const loggedInDenied = user && !canAccessTest(testData, user);
  if (guestDenied || loggedInDenied) {
    redirect('/pricing');
  }

  const userId = user?.id;

  // 3. Map Questions to correct type

  const questions: Question[] = testData.questions.map((q) => {
    // Ensure options are parsed if they come as a stringified array
    const parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;

    return {
      ...q,
      question: q.questionText,
      questionEn:
        testData.type === 'CSAT' &&
        (!q.questionTextEn ||
          q.questionTextEn.trim().toLowerCase() === 'n/a' ||
          q.questionTextEn.trim().toLowerCase() === 'na')
          ? q.questionText
          : q.questionTextEn || undefined,
      correctAnswer: Number(q.correctAnswer),
      options: parsedOptions as string[], // Cast assumes standard string[] options for now
      explanation: q.explanation || undefined,
      explanationEn: q.explanationEn || undefined,
      subject: q.subject || undefined,
      type: (q.type as 'standard' | 'matching') || 'standard',
      matchPairs: (q.matchPairs as any) || undefined,
      negativeMarks: SCORING_CONFIG.NEGATIVE_MARKING, // Force Global Config (1)
      marks: SCORING_CONFIG.MARKS_PER_QUESTION, // Force Global Config (3)
    };
  });

  const userAttemptsCount = (attemptsMap as Record<string, number>)[testId] || 0;
  const maxRetries = attemptLimits[testData.type] ?? null;

  const tier = getUserTier(user);
  const hasPaidPlan = tier === 'pro' || tier === 'lite';
  const shouldShowPaywall = false;

  return (
    <QuizPlayClient
      questions={questions}
      mode={(mode as 'topic' | 'full' | 'pyq') || 'topic'}
      testId={testId}
      userId={user?.id || null}
      maxRetries={maxRetries}
      userAttempts={userAttemptsCount}
      isPro={hasPaidPlan}
      shouldShowPaywall={shouldShowPaywall}
    />
  );
}
