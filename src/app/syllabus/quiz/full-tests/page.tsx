import { Suspense } from 'react';
import { getCachedFLTTests, getUserAttemptsByType } from '@/features/tests/actions/submission';
import { getAvailableUnitTests } from '@/features/tests/actions/quiz';
import { verifyAuth } from '@/lib/auth';
import { getUserTier, hasAccessToContent } from '@/lib/access-control';
import { getCachedAttemptLimits } from '@/app/admin/test-access/actions';
import { PYQFactsLoader } from '@/components/ui/PYQFactsLoader';
import FullTestsHubClient from './FullTestsHubClient';
import type { TestWithAccess } from '@/app/syllabus/quiz/full-length/FLTPageClient';

export default async function FullTestsHubPage() {
  return (
    <div className="relative min-h-screen bg-[#fafbfc] font-sans">
      <Suspense fallback={<PYQFactsLoader label="Loading full tests…" theme="dark" />}>
        <FullTestsHubData />
      </Suspense>
    </div>
  );
}

async function FullTestsHubData() {
  const userPromise = verifyAuth();
  const [user, tests, attemptLimits, attempts, unitRows] = await Promise.all([
    userPromise,
    getCachedFLTTests(),
    getCachedAttemptLimits(),
    (async () => {
      const resolvedUser = await userPromise;
      const userId = resolvedUser?.id;
      return userId ? getUserAttemptsByType('FLT', userId) : ({} as Record<string, number>);
    })(),
    getAvailableUnitTests(),
  ]);

  const tier = getUserTier(user);
  const maxRetries = attemptLimits['FLT'] ?? null;

  const enrichedFlt: TestWithAccess[] = tests.map((test) => {
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

  return <FullTestsHubClient fltTests={enrichedFlt} unitTests={unitRows} />;
}
