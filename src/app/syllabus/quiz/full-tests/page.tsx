// 🎯 Test Hub - Full Length & Subject-wise Tests
// Bhai, ye page saare major tests ka central hub h.
// Performance ke liye humne parallel fetching aur caching use ki h.

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
      {/* 🎭 Skeleton Loader: Jab tak data fetch ho raha h, ye loader dikhega */}
      <Suspense fallback={<PYQFactsLoader label="Loading subject-wise tests…" theme="dark" />}>
        <FullTestsHubData />
      </Suspense>
    </div>
  );
}

async function FullTestsHubData() {
  // 🏎️ Step 1: Core data parallel fetch (Zero Waterfall)
  const [user, attemptLimits, miscTestsRaw] = await Promise.all([
    verifyAuth(),
    getCachedAttemptLimits(),
    getCachedSubjectWiseTests(),
  ]);

  // 🚫 Filter: Free tests yaha nahi dikhate (wo Daily Quiz section me hain)
  const miscTests = miscTestsRaw.filter(t => !t.isFreeAccess);
  const miscIds = miscTests.map((t) => t.id);

  // 🏎️ Step 2: User-specific attempts fetch (Parallel to main logic if user exists)
  const miscAttempts =
    user && miscIds.length > 0 ? await getUserAttempts(miscIds, user.id) : ({} as Record<string, number>);

  const maxRetriesMisc = (attemptLimits as Record<string, number | null>)['MISC'] ?? null;
  const isAdmin = (user as any)?.role === 'admin';
  const effectiveTier = getUserTier(user as any);

  // 🛠️ Data Enrichment: Client ko dene se pehle saari logic server pe hi solve kar lo.
  const enrichedMisc = miscTests.map((t) => {
    const attemptsCount = miscAttempts[t.id] || 0;
    const attemptsLeft = maxRetriesMisc != null ? Math.max(0, maxRetriesMisc - attemptsCount) : null;
    
    const isFree = !!t.isFreeAccess;
    // 🔒 Access Logic: Admin, Pro, Lite (specific), ya Free Access.
    const hasAccess =
      isAdmin ||
      effectiveTier === 'pro' ||
      (effectiveTier === 'lite' && (t.isLiteAccess || t.isFreeAccess)) ||
      isFree;

    return {
      id: t.id,
      title: t.title,
      titleEn: t.titleEn,
      slug: t.slug,
      totalQuestions: t.totalQuestions ?? 0,
      durationMinutes: Math.max(1, Math.ceil((t.totalQuestions ?? 0) * 1.2)), // 1.2 min per question approx
      isLocked: !hasAccess,
      isFree: isFree && !user,
      attemptsLeft: user ? attemptsLeft : null,
      maxRetries: user ? maxRetriesMisc : null,
      tags: t.tags,
    };
  });

  return <FullTestsHubClient miscTests={enrichedMisc} />;
}
