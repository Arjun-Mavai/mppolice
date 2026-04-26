import { Suspense } from 'react';
import { verifyAuth } from '@/lib/auth';
import { getCachedAttemptLimits } from '@/app/admin/test-access/actions';
import { PYQFactsLoader } from '@/components/ui/PYQFactsLoader';
import FullTestsHubClient from './FullTestsHubClient';
import { getCachedSubjectWiseTests } from '@/app/free-quiz/actions';
import { getUserAttempts } from '@/features/tests/actions/submission';
import { getUserTier } from '@/lib/access-control';

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
    getCachedSubjectWiseTests(),
  ]);

  // 🚫 Filter out Free Tests: They belong in the 'Free Daily Quiz' section only.
  const miscTests = miscTestsRaw.filter(t => !t.isFreeAccess);

  const miscIds = miscTests.map((t) => t.id);
  const miscAttempts =
    user && miscIds.length > 0 ? await getUserAttempts(miscIds, user.id) : ({} as Record<string, number>);
  const maxRetriesMisc = (attemptLimits as Record<string, number | null>)['MISC'] ?? null;

  const isAdmin = (user as any)?.role === 'admin';
  const effectiveTier = getUserTier(user as any);

  const enrichedMisc = miscTests.map((t) => {
    const attemptsCount = miscAttempts[t.id] || 0;
    const attemptsLeft = maxRetriesMisc != null ? Math.max(0, maxRetriesMisc - attemptsCount) : null;
    
    const isFree = !!t.isFreeAccess;
    const hasAccess =
      isAdmin ||
      effectiveTier === 'pro' ||
      (effectiveTier === 'lite' && (t.isLiteAccess || t.isFreeAccess)) ||
      isFree;

    const isLocked = !hasAccess;

    return {
      id: t.id,
      title: t.title,
      titleEn: t.titleEn,
      slug: t.slug,
      totalQuestions: t.totalQuestions ?? 0,
      durationMinutes: Math.max(1, Math.ceil((t.totalQuestions ?? 0) * 1.2)),
      isLocked: isLocked,
      isFree: isFree && !user, // Display "Free" pill only if free and user not logged in or maybe always if free
      attemptsLeft: user ? attemptsLeft : null,
      maxRetries: user ? maxRetriesMisc : null,
      tags: t.tags,
    };
  });

  return <FullTestsHubClient miscTests={enrichedMisc} />;
}
