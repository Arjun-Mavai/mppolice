import { getCachedFLTTests, getUserAttemptsByType } from '@/features/tests/actions/submission';
import FLTPageClient, { TestWithAccess } from './FLTPageClient';
import { verifyAuth } from '@/lib/auth';
import { getUserTier, hasAccessToContent } from '@/lib/access-control';
import { getCachedAttemptLimits } from '@/app/admin/test-access/actions';
import { Suspense } from 'react';
import { QuizListSkeleton } from '@/components/QuizListSkeleton';

export default async function FLTPage() {
  return (
    <div className="relative min-h-screen bg-[#fafbfc] pb-20 font-sans">
      <Suspense fallback={<QuizListFallback />}>
        <FLTPageData />
      </Suspense>
    </div>
  );
}

function QuizListFallback() {
  return (
    <div className="relative z-10 mx-auto max-w-5xl px-6 pt-32">
      <div className="mb-12 space-y-2 text-center">
        <div className="mx-auto mb-4 h-12 w-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="mx-auto h-4 w-96 animate-pulse rounded-lg bg-slate-100" />
      </div>
      <QuizListSkeleton />
    </div>
  );
}

async function FLTPageData() {
  const userPromise = verifyAuth();
  const [user, tests, attemptLimits, attempts] = await Promise.all([
    userPromise,
    getCachedFLTTests(),
    getCachedAttemptLimits(),
    (async () => {
      const resolvedUser = await userPromise;
      const userId = resolvedUser?.id;
      return userId ? getUserAttemptsByType('FLT', userId) : ({} as Record<string, number>);
    })(),
  ]);

  const tier = getUserTier(user);
  const maxRetries = attemptLimits['FLT'] ?? null;

  const enrichedTests: TestWithAccess[] = tests.map((test) => {
    const hasAccess =
      user?.role === 'admin' ||
      hasAccessToContent(
        {
          isFreeAccess: test.isFreeAccess,
          isLiteAccess: test.isLiteAccess,
          isProAccess: test.isProAccess,
        },
        tier
      );
    const isLocked = !hasAccess;
    const attemptsCount = attempts[test.id] || 0;
    const attemptsLeft = maxRetries != null ? Math.max(0, maxRetries - attemptsCount) : null;

    return {
      ...test,
      totalQuestions: test.totalQuestions || 0,
      isLocked: isLocked && !(test.isFreeAccess ?? false),
      isCompleted: attemptsLeft === 0,
      attemptsCount,
      attemptsLeft: user ? (attemptsLeft ?? 9999) : null,
      maxRetries: user ? maxRetries : null,
      isFree: (test.isFreeAccess ?? false) && !user,
    };
  });

  return <FLTPageClient tests={enrichedTests} />;
}
