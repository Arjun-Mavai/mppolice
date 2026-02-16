import { getCachedPYQTests, getUserAttemptsByType } from '@/features/tests/actions/submission';
import PYQPageClient from './PYQPageClient';
import { verifyAuth } from '@/lib/auth';
import { getUserTier, hasAccessToContent } from '@/lib/access-control';
import { getCachedAttemptLimits } from '@/app/admin/test-access/actions';
import { Suspense } from 'react';
import { QuizListSkeleton } from '@/components/QuizListSkeleton';

export default async function PYQPage() {
  return (
    <div className="relative min-h-screen bg-[#fafbfc] pb-20 font-sans">
      <Suspense fallback={<QuizListFallback />}>
        <PYQPageData />
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

async function PYQPageData() {
  const [user, tests, attemptLimits] = await Promise.all([
    verifyAuth(),
    getCachedPYQTests(),
    getCachedAttemptLimits(),
  ]);

  const userId = user?.id;

  // Parallel fetch for attempts if user is logged in
  const attempts = userId ? await getUserAttemptsByType('PYQ', userId) : {};

  const tier = getUserTier(user);
  const maxRetries = attemptLimits['PYQ'] ?? null;

  const enrichedTests = tests.map((test) => {
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
    const attemptsCount = attempts[test.id] || 0;
    const attemptsLeft = maxRetries != null ? Math.max(0, maxRetries - attemptsCount) : null;

    return {
      ...test,
      isLocked: !hasAccess && !(test.isFreeAccess ?? false),
      isFree: (test.isFreeAccess ?? false) && !user,
      attemptsLeft: user ? attemptsLeft : null,
      maxRetries: user ? maxRetries : null,
    };
  });

  return <PYQPageClient initialTests={enrichedTests} />;
}
