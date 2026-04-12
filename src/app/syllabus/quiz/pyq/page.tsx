import {
  getCachedPYQTests,
  getCachedMppoliceMockTests,
  getUserAttempts,
} from '@/features/tests/actions/submission';
import { getSubjectWisePYQStats } from '@/features/tests/actions/pyq-analytics'; // Back to original
import PYQPageClient from './PYQPageClient';
import { verifyAuth } from '@/lib/auth';
import { getUserTier, hasAccessToContent } from '@/lib/access-control';
import { getCachedAttemptLimits } from '@/app/admin/test-access/actions';
import { Suspense } from 'react';
import { QuizListSkeleton } from '@/components/QuizListSkeleton';

export default async function PYQPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string; tab?: string; bucket?: string; collection?: string }>;
}) {
  const params = searchParams ? await searchParams : {};

  return (
    <div className="relative min-h-screen bg-[#fafbfc] pb-20 font-sans">
      <Suspense fallback={<QuizListFallback />}>
        <PYQPageData
          mode={params.mode}
          initialTab={params.tab}
          initialBucket={params.bucket}
          initialCollection={params.collection}
        />
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

async function PYQPageData({
  mode,
  initialTab,
  initialBucket,
  initialCollection,
}: {
  mode?: string;
  initialTab?: string;
  initialBucket?: string;
  initialCollection?: string;
}) {
  const userPromise = verifyAuth();
  const [user, pyqTests, mockTests, attemptLimits, subjectStats] = await Promise.all([
    userPromise,
    getCachedPYQTests(),
    getCachedMppoliceMockTests(),
    getCachedAttemptLimits(),
    getSubjectWisePYQStats(),
  ]);

  const allIds = [...pyqTests.map((t) => t.id), ...mockTests.map((t) => t.id)];
  const attempts =
    user && allIds.length > 0
      ? await getUserAttempts(allIds, user.id)
      : ({} as Record<string, number>);

  const tier = getUserTier(user);
  const maxRetriesPyq = attemptLimits['PYQ'] ?? null;

  const enrichedTests = pyqTests.map((test) => {
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
    const attemptsLeft =
      maxRetriesPyq != null ? Math.max(0, maxRetriesPyq - attemptsCount) : null;

    return {
      ...test,
      questions: test.totalQuestions ?? 0,
      totalQuestions: test.totalQuestions ?? 0,
      isLocked: !hasAccess && !(test.isFreeAccess ?? false),
      isFree: (test.isFreeAccess ?? false) && !user,
      attemptsLeft: user && attemptsLeft != null ? attemptsLeft : undefined,
      maxRetries: user ? maxRetriesPyq : null,
      year: test.year ? parseInt(String(test.year), 10) : undefined,
    };
  });

  const enrichedMocks = mockTests.map((test) => {
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
    const lim =
      (attemptLimits as Record<string, number | null>)[test.type] ??
      attemptLimits['FLT'] ??
      null;
    const attemptsLeft = lim != null ? Math.max(0, lim - attemptsCount) : null;

    return {
      ...test,
      questions: test.totalQuestions ?? 0,
      totalQuestions: test.totalQuestions ?? 0,
      isLocked: !hasAccess && !(test.isFreeAccess ?? false),
      isFree: (test.isFreeAccess ?? false) && !user,
      attemptsLeft: user && attemptsLeft != null ? attemptsLeft : undefined,
      maxRetries: user ? lim : null,
      year: test.year ? parseInt(String(test.year), 10) : undefined,
    };
  });

  return (
    <PYQPageClient
      initialTests={enrichedTests}
      initialMockTests={enrichedMocks}
      subjectStats={subjectStats}
      isLoggedIn={!!user}
      mode={mode}
      initialTab={initialTab}
      initialBucket={initialBucket}
      initialCollection={initialCollection}
    />
  );
}
