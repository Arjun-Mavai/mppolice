import { getAttemptResult } from '@/data/tests';
import { notFound, redirect } from 'next/navigation';
import AnalysisView from './AnalysisView';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ attemptId?: string }>;
};

export default async function AnalysisPage(props: Props) {
  const searchParams = await props.searchParams;
  const attemptId = searchParams.attemptId;

  if (!attemptId) {
    redirect('/tests');
  }

  const result = await getAttemptResult(attemptId);
  if (!result) notFound();

  return <AnalysisView result={result} />;
}
