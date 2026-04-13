'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const QuizInterface = dynamic(
  () => import('@/features/tests/components/QuizInterface').then((mod) => mod.QuizInterface),
  {
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
          <p className="font-medium text-slate-500">Loading Quiz...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);
const GuestQuizInterface = dynamic(
  () =>
    import('@/features/tests/components/GuestQuizInterface').then((mod) => mod.GuestQuizInterface),
  { ssr: false }
);
import { Question } from '@/types/quiz';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';

interface QuizPlayClientProps {
  questions: Question[];
  mode: 'topic' | 'full' | 'pyq';
  testId: string;
  title?: string;
  userId: string | null;
  userName?: string;
  maxRetries?: number | null;
  userAttempts?: number;
  isPro?: boolean;
  shouldShowPaywall?: boolean;
}

export function QuizPlayClient({
  questions,
  mode,
  testId,
  title,
  userId,
  userName,
  maxRetries = null,
  userAttempts = 0,
  isPro = false,
  shouldShowPaywall = false,
}: QuizPlayClientProps) {
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [paywallOpen, setPaywallOpen] = useState(shouldShowPaywall);

  // If premium content and user is not subscribed, show paywall modal
  if (shouldShowPaywall) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-600">
              <Lock size={32} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">Premium Content</h2>

            <p className="leading-relaxed text-slate-600">
              {mode === 'full'
                ? 'Full Length Tests are available for Premium members only. Upgrade to access complete mock tests with detailed analysis.'
                : 'Previous Year Questions are available for Premium members only. Upgrade to practice with actual exam questions.'}
            </p>

            <div className="space-y-3 pt-4">
              <Button
                onClick={() => setPaywallOpen(true)}
                className="h-12 w-full rounded-xl bg-slate-800 font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-700"
              >
                Upgrade to Premium
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/syllabus/quiz/full-tests')}
                className="h-12 w-full rounded-xl"
              >
                Back to Tests
              </Button>
            </div>
          </div>
        </div>
        <SyllabusLockModal open={paywallOpen} onOpenChange={setPaywallOpen} />
      </>
    );
  }

  // Retry Logic Check
  const effectiveAttempts = userAttempts + retryCount;
  const hasAttemptsLeft = maxRetries === null || effectiveAttempts < maxRetries;

  // Logic:
  // Free User: 1 Attempt only (if maxRetries is set, assuming free limit is 1)
  // But the seed script sets maxRetries: 5 (Unit) or 2 (FLT).
  // User Requirement: "Retry quiz ka option only pro ke liye rakho".
  // Interpretation:
  // - Free users: Can take it ONCE. After that, "result view" only.
  // - Pro users: Can take up to maxRetries.

  // Implementation:
  // If !isPro and userAttempts > 0 -> Block (Free users get 1 attempt)
  // If isPro and userAttempts >= maxRetries -> Block (unless maxRetries is null/unlimited)

  const isBlocked = !isPro && userAttempts > 0 
    ? true 
    : maxRetries !== null && effectiveAttempts >= maxRetries;

  if (!questions || questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 pt-[80px]">
        <div className="text-xl font-bold text-slate-900">No questions found.</div>
        <p className="text-slate-500">Please try another unit or check back later.</p>
        <button onClick={() => router.back()} className="text-slate-700 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  // Block Screen
  if (isBlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Lock size={32} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            {!isPro ? 'Unlock Unlimited Practice' : 'Maximum Attempts Reached'}
          </h2>

          <p className="leading-relaxed text-slate-600">
            {!isPro
              ? 'Free users can only attempt this quiz once. Upgrade to Pro to unlock regular retries and detailed analysis.'
              : `You have used all ${maxRetries} attempts for this test. Review your previous performance to improve.`}
          </p>

          <div className="space-y-3 pt-4">
            {!isPro && (
              <Button className="h-12 w-full rounded-xl bg-slate-800 font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-700">
                Upgrade to Pro
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push('/syllabus')}
              className="h-12 w-full rounded-xl"
            >
              Back to Syllabus
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <GuestQuizInterface
        key={retryCount}
        questions={questions}
        mode={mode}
        testId={testId}
        title={title}
        timeLimitInMinutes={Math.ceil(questions.length * QUIZ_CONSTANTS.TIME_PER_QUESTION_MINUTES)}
        onExit={() => router.push('/syllabus/quiz/full-tests')}
      />
    );
  }

  return (
    <QuizInterface
      key={retryCount}
      questions={questions}
      mode={mode}
      testId={testId}
      title={title}
      userId={userId}
      userName={userName}
      timeLimitInMinutes={Math.ceil(questions.length * QUIZ_CONSTANTS.TIME_PER_QUESTION_MINUTES)}
      onExit={() => router.push('/syllabus/quiz/full-tests')}
      onRetry={() => {
        // Optimistic update, server should re-validate
        setRetryCount((r) => r + 1);
      }}
      isInstantMode
    />
  );
}
