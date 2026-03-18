import { redirect } from 'next/navigation';
import {
  getPyqInsightSubjects,
  getPyqInsightsCoverageSummary,
  getPyqTopicAnalysis,
} from '@/features/tests/actions/pyq-insights';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import PYQAnalysisClient from './PYQAnalysisClient';

interface PageProps {
  searchParams: Promise<{
    subject?: string;
    years?: string;
  }>;
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

  const params = await searchParams;
  const [subjects, coverage] = await Promise.all([
    getPyqInsightSubjects(),
    getPyqInsightsCoverageSummary(2020, 2025),
  ]);

  const fallbackSubject = subjects[0]?.subject ?? 'History';
  const selectedSubject = params.subject?.trim() || fallbackSubject;

  const rawYears = Number(params.years);
  const defaultYears = 6;
  const selectedYears = Number.isFinite(rawYears) && rawYears > 0 ? Math.min(Math.max(rawYears, 1), 15) : defaultYears;

  const analysis = await getPyqTopicAnalysis(selectedSubject, selectedYears);

  return (
    <PYQAnalysisClient
      subjects={subjects}
      selectedSubject={selectedSubject}
      selectedYears={selectedYears}
      analysis={analysis}
      coverage={coverage}
    />
  );
}
