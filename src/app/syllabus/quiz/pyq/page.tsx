import {
  getCachedPYQTests,
  getCachedMppoliceMockTests,
  getCachedFLTTests,
  getUserAttempts,
} from '@/features/tests/actions/submission';
import PYQPageClient from './PYQPageClient';
import { verifyAuth } from '@/lib/auth';
import { getUserTier, hasAccessToContent } from '@/lib/access-control';
import { getCachedAttemptLimits } from '@/app/admin/test-access/actions';
import { Suspense } from 'react';
import { QuizListSkeleton } from '@/components/QuizListSkeleton';
import {
  isMbtByCollectionTags,
  isFltFamilyHubType,
} from '@/lib/mppolice/pyq-hub-filters';

export default async function PYQPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string; tab?: string; collection?: string }>;
}) {
  const params = searchParams ? await searchParams : {};

  return (
    <div className="relative min-h-screen bg-[#fafbfc] pb-20 font-sans">
      <Suspense fallback={<QuizListFallback />}>
        <PYQPageData
          mode={params.mode}
          initialTab={params.tab}
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
  initialCollection,
}: {
  mode?: string;
  initialTab?: string;
  initialCollection?: string;
}) {
  const userPromise = verifyAuth();
  const [user, pyqTests, mockTests, fltOnlyRows, attemptLimits] = await Promise.all([
    userPromise,
    getCachedPYQTests(),
    getCachedMppoliceMockTests(),
    getCachedFLTTests(),
    getCachedAttemptLimits(),
  ]);

  /** Ensure every FLT row is in the hub list (tags + MBT routing stay in sync with DB). */
  const mockTestsMerged = (() => {
    const byId = new Map(mockTests.map((t) => [t.id, t]));
    for (const f of fltOnlyRows) {
      if (byId.has(f.id)) continue;
      byId.set(f.id, {
        id: f.id,
        title: f.title,
        titleEn: f.titleEn,
        description: f.description,
        slug: f.slug,
        durationMinutes: f.durationMinutes,
        totalQuestions: f.totalQuestions,
        totalMarks: f.totalMarks,
        type: f.type,
        isPro: f.isPro,
        isFreeAccess: f.isFreeAccess,
        isLiteAccess: f.isLiteAccess,
        isProAccess: f.isProAccess,
        displayOrder: f.displayOrder,
        createdAt: f.createdAt,
        tags: f.tags,
        examType: f.examType,
        year:
          f.title?.match(/\d{4}/)?.[0] ||
          (f.createdAt ? new Date(f.createdAt).getFullYear().toString() : ''),
      });
    }
    return Array.from(byId.values());
  })();

  const allIds = [...pyqTests.map((t) => t.id), ...mockTestsMerged.map((t) => t.id)];
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
      type: test.type,
      tags: test.tags,
      examType: test.examType ?? 'mppolice',
      questions: test.totalQuestions ?? 0,
      totalQuestions: test.totalQuestions ?? 0,
      isLocked: !hasAccess && !(test.isFreeAccess ?? false),
      isFree: (test.isFreeAccess ?? false) && !user,
      attemptsLeft: user && attemptsLeft != null ? attemptsLeft : undefined,
      maxRetries: user ? maxRetriesPyq : null,
      year: test.year ? parseInt(String(test.year), 10) : undefined,
    };
  });

  const enrichedMocks = mockTestsMerged.map((test) => {
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
      type: test.type,
      tags: test.tags,
      examType: test.examType ?? 'mppolice',
      isHidden: false,
      questions: test.totalQuestions ?? 0,
      totalQuestions: test.totalQuestions ?? 0,
      isLocked: !hasAccess && !(test.isFreeAccess ?? false),
      isFree: (test.isFreeAccess ?? false) && !user,
      attemptsLeft: user && attemptsLeft != null ? attemptsLeft : undefined,
      maxRetries: user ? lim : null,
      year: test.year ? parseInt(String(test.year), 10) : undefined,
    };
  });

  /** MBT list built on server from DB `tags` + `type` (same rules as hub; avoids client-only drops). */
  const initialMbtTests = (() => {
    const fromPyq = enrichedTests.filter((t) => isMbtByCollectionTags(t.tags));
    const fromFlt = enrichedMocks.filter(
      (t) => isMbtByCollectionTags(t.tags) && isFltFamilyHubType(t.type)
    );
    const map = new Map<string, (typeof enrichedTests)[number]>();
    for (const t of fromPyq) map.set(t.id, t);
    for (const t of fromFlt) map.set(t.id, t);
    return Array.from(map.values());
  })();

  return (
    <PYQPageClient
      initialTests={enrichedTests}
      initialMockTests={enrichedMocks}
      initialMbtTests={initialMbtTests}
      isLoggedIn={!!user}
      mode={mode}
      initialTab={initialTab}
      initialCollection={initialCollection}
    />
  );
}
