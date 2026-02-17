import { redirect } from 'next/navigation';
import { getTestWithQuestions, getUserAttempts } from '@/features/tests/actions/submission';
import { getQuestionsBySubject } from '@/features/tests/actions/pyq-analytics'; // NEW
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
    subject?: string;
    limit?: string;
    offset?: string;
  }>;
}

export default async function QuizPlayPage({ searchParams }: PageProps) {
  const params = await searchParams;
  logger.debug('params', { params, category: 'system' });
  const { testId, mode, subject } = params;

  // 1. Handle Subject Practice Mode (Mixed PYQ)
  if (mode === 'pyq-subject' && subject) {
    const rawQuestions = await getQuestionsBySubject(subject);

    // Pagination Params
    const limit = Number(params.limit) || 1000;
    const offset = Number(params.offset) || 0;

    // Slice questions for pagination (Chunking)
    const questionsSlice = rawQuestions.slice(offset, offset + limit);

    if (!questionsSlice || questionsSlice.length === 0) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-[80px]">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900">No Questions Found</h1>
            <p className="text-slate-500">No questions available for this selection.</p>
          </div>
        </div>
      );
    }

    const questions: Question[] = questionsSlice.map((q) => {
      const parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      return {
        id: q.id,
        question: q.questionText,
        questionEn: q.questionTextEn || undefined,
        correctAnswer: Number(q.correctAnswer),
        options: parsedOptions as string[],
        explanation: q.explanation || undefined,
        explanationEn: q.explanationEn || undefined,
        // 🏷️ INJECT YEAR INTO SUBJECT FIELD FOR DISPLAY
        subject: `PYQ ${q.year}`,
        type: q.type || 'standard',
        matchPairs: q.matchPairs,
        negativeMarks: SCORING_CONFIG.NEGATIVE_MARKING,
        marks: SCORING_CONFIG.MARKS_PER_QUESTION,
      };
    });

    const user = await verifyAuth();
    // No attempt limits for practice mode
    const hasPaidPlan = user ? getUserTier(user) !== 'free' : false;

    // Determine Part Number for Title
    const partNum = Math.floor(offset / limit) + 1;
    const seriesTitle = limit < 1000 ? `${subject} Part ${partNum}` : `${subject} Practice`;

    return (
      <QuizPlayClient
        questions={questions}
        mode="pyq" // Reuse 'pyq' mode for UI styling
        testId={`practice-${subject}-${offset}`}
        title={seriesTitle}
        userId={user?.id || null}
        maxRetries={null} // Unlimited
        userAttempts={0}
        isPro={hasPaidPlan}
        shouldShowPaywall={false}
      />
    );
  }

  // 2. Standard Test Mode
  if (!testId) {
    redirect('/syllabus/quiz/pyq');
  }

  // Fetch Initial Data in Parallel (Reduces waterfall)
  const [testData, user, attemptLimits] = await Promise.all([
    getTestWithQuestions(testId),
    verifyAuth(),
    getCachedAttemptLimits(),
  ]);

  // Only fetch attempts if user exists to avoid redundant DB call for guests
  const attemptsMap = user
    ? await getUserAttempts([testId], user.id)
    : ({} as Record<string, number>);

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

  // 🛡️ Access Control
  const guestDenied = !user && !testData.isFreeAccess;
  const loggedInDenied = user && !canAccessTest(testData, user);
  if (guestDenied || loggedInDenied) {
    redirect('/pricing');
  }

  const userId = user?.id;

  // Map Questions
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
      title={testData.title}
      userId={user?.id || null}
      maxRetries={maxRetries}
      userAttempts={userAttemptsCount}
      isPro={hasPaidPlan}
      shouldShowPaywall={shouldShowPaywall}
    />
  );
}
