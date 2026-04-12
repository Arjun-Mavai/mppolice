import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import {
  getUnitDistributionStats,
  getRepeatedQuestions,
  getMostRepeatedTopics,
  getSubjectDistributionStats,
  getOverallWeightageSubjectData,
} from '@/actions/pyq-analytics';
import { getSubjectWisePYQStats } from '@/features/tests/actions/pyq-analytics';
import PYQIntelligenceClient from './PYQIntelligenceClient';
import { unstable_cache } from 'next/cache';
import { Suspense } from 'react';
import LoadingSkeleton from './loading';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert PYQ Intelligence | MP Police Analytics',
  description: 'Deep analysis of MP Police Previous Year Questions — unit distribution, repeated questions & topic trends from 2020 to 2025.',
};

// ISR: Revalidate every 6 hours — data is fixed for 2020–2025 period
export const revalidate = 21600;

// ── Cached analytics functions (unique stable keys) ─────────────────────────
// Note: getRepeatedQuestions is already wrapped with unstable_cache internally,
// but we use a page-level wrapper for an extra stable route-scoped layer.
const getCachedSubjectStats = unstable_cache(
  getSubjectDistributionStats,
  ['intelligence-subject-stats-v6'],
  { revalidate: 21600 }
);
const getCachedUnitStats = unstable_cache(
  getUnitDistributionStats,
  ['intelligence-unit-stats-v6'],
  { revalidate: 21600 }
);
const getCachedTopicStats = unstable_cache(
  getMostRepeatedTopics,
  ['intelligence-topics-v6'],
  { revalidate: 21600 }
);
const getCachedSubjectQuestionsData = unstable_cache(
  getOverallWeightageSubjectData,
  ['intelligence-subject-questions-v6'],
  { revalidate: 21600 }
);

async function IntelligenceDataFetcher() {
  // 🚀 All 5 heavy queries run in parallel — Promise.all for max speed
  const [subjectStats, unitStats, repeatedQuestions, topicStats, simpleSubjectStats, subjectQuestionsData] =
    await Promise.all([
      getCachedSubjectStats(),
      getCachedUnitStats(),
      getRepeatedQuestions(),          // Already has its own unstable_cache internally
      getCachedTopicStats(),
      getSubjectWisePYQStats(),        // Already has its own unstable_cache internally
      getCachedSubjectQuestionsData(),
    ]);

  return (
    <PYQIntelligenceClient
      subjectStats={subjectStats}
      stats={unitStats}
      repeatedQuestions={repeatedQuestions}
      topicStats={topicStats}
      simpleSubjectStats={simpleSubjectStats}
      subjectQuestionsData={subjectQuestionsData}
    />
  );
}

export default async function PYQIntelligencePage() {
  const user = await verifyAuth();
  if (!user) redirect('/pricing');

  const tier = getUserTier(user);
  if (tier === 'free') redirect('/pricing');

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <IntelligenceDataFetcher />
    </Suspense>
  );
}
