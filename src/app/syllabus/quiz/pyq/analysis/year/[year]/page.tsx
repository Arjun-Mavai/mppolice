import { getYearlySubjectQuestions } from '@/features/tests/actions/pyq-insights';
import YearlyProofClient from './YearlyProofClient';
import { notFound } from 'next/navigation';

export default async function YearlyProofPage({
  params,
  searchParams,
}: {
  params: { year: string };
  searchParams: { subject?: string };
}) {
  const { year } = await params;
  const { subject } = await searchParams;
  
  if (!subject) return notFound();

  const data = await getYearlySubjectQuestions(subject, parseInt(year));
  if (!data) notFound();

  return <YearlyProofClient data={data} />;
}
