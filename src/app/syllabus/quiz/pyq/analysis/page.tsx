import { redirect } from 'next/navigation';
import {
  getPyqInsightSubjects,
  getPyqInsightsCoverageSummary,
  getPyqTopicAnalysis,
} from '@/features/tests/actions/pyq-insights';
import { getRepeatedQuestions } from '@/actions/pyq-analytics';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import PYQAnalysisClient from './PYQAnalysisClient';
import { Suspense } from 'react';
import Loading from './loading';

// ISR: Revalidate every hour - analysis data is mostly static
export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{
    subject?: string;
    years?: string;
  }>;
}

async function AnalysisDataFetcher({ searchParams, user }: { searchParams: Promise<{ subject?: string; years?: string }>, user: any }) {
  const params = await searchParams;
  const rawYears = Number(params.years);
  const defaultYears = 6;
  const selectedYears = Number.isFinite(rawYears) && rawYears > 0 ? Math.min(Math.max(rawYears, 1), 15) : defaultYears;

  // Fetch all analysis data in parallel
  const [subjects, coverage, repeatedQuestions] = await Promise.all([
    getPyqInsightSubjects(),
    getPyqInsightsCoverageSummary(2020, 2025),
    getRepeatedQuestions(),
  ]);

  const fallbackSubject = subjects[0]?.subject ?? 'History';
  const selectedSubject = params.subject?.trim() || fallbackSubject;

  // Now fetch the subject-specific analysis
  const analysis = await getPyqTopicAnalysis(selectedSubject, selectedYears);
  const isAdmin = user.role === 'admin';

  return (
    <PYQAnalysisClient
      subjects={subjects}
      selectedSubject={selectedSubject}
      selectedYears={selectedYears}
      analysis={analysis}
      coverage={coverage}
      repeatedQuestions={repeatedQuestions}
      isAdmin={isAdmin}
    />
  );
}

export default async function PYQAnalysisPage({ searchParams }: PageProps) {
  const user = await verifyAuth();
  if (!user) {
    redirect('/pricing');
  }
  
  const tier = getUserTier(user);
  if (tier === 'free') {
    redirect('/pricing');
  }

  return (
    <Suspense fallback={<Loading />}>
      <AnalysisDataFetcher searchParams={searchParams} user={user} />
    </Suspense>
  );
}
