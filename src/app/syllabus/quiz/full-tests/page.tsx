import { Suspense } from 'react';
import { verifyAuth } from '@/lib/auth';
import { getCachedAttemptLimits } from '@/app/admin/test-access/actions';
import { PYQFactsLoader } from '@/components/ui/PYQFactsLoader';
import FullTestsHubClient from './FullTestsHubClient';
import { getCachedFreeQuizzes } from '@/app/free-quiz/actions';
import { getUserAttempts } from '@/features/tests/actions/submission';

export default async function FullTestsHubPage() {
  return (
    <div className="relative min-h-screen bg-[#fafbfc] font-sans">
      <Suspense fallback={<PYQFactsLoader label="Loading subject-wise tests…" theme="dark" />}>
        <FullTestsHubData />
      </Suspense>
    </div>
  );
}

async function FullTestsHubData() {
  const userPromise = verifyAuth();
  const [user, attemptLimits, miscTestsRaw] = await Promise.all([
    userPromise,
    getCachedAttemptLimits(),
    getCachedFreeQuizzes(),
  ]);

  const miscIds = miscTestsRaw.map((t) => t.id);
  const miscAttempts =
    user && miscIds.length > 0 ? await getUserAttempts(miscIds, user.id) : ({} as Record<string, number>);
  const maxRetriesMisc = (attemptLimits as Record<string, number | null>)['MISC'] ?? null;

  const enrichedMisc = miscTestsRaw.map((t) => {
    const attemptsCount = miscAttempts[t.id] || 0;
    const attemptsLeft = maxRetriesMisc != null ? Math.max(0, maxRetriesMisc - attemptsCount) : null;
    return {
      id: t.id,
      title: t.title,
      titleEn: t.titleEn,
      slug: t.slug,
      totalQuestions: t.totalQuestions ?? 0,
      durationMinutes: Math.max(1, Math.ceil((t.totalQuestions ?? 0) * 1.2)),
      isLocked: false,
      isFree: true,
      attemptsLeft: user ? attemptsLeft : null,
      maxRetries: user ? maxRetriesMisc : null,
      tags: t.tags,
    };
  });

  return <FullTestsHubClient miscTests={enrichedMisc} />;
}
