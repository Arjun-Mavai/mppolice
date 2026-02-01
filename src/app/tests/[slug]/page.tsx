
import { getTestBySlug, getTestQuestions } from '@/data/tests';
import { notFound } from 'next/navigation';
import TestInterface from '@/components/test-interface';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function TestPage(props: Props) {
  const params = await props.params;
  const test = await getTestBySlug(params.slug);
  
  if (!test) {
    notFound();
  }

  const questions = await getTestQuestions(test.id);

  return <TestInterface test={test} questions={questions} />;
}
