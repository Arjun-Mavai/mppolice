import { getTestBySlug, getTestQuestions, getTests } from '@/data/tests';
import { notFound } from 'next/navigation';
import TestInterface from '@/components/test-interface';

// ISR: Revalidate every week
export const revalidate = 604800;

// Enable on-demand ISR for new tests
export const dynamicParams = true;

// Pre-generate static pages for all tests
export async function generateStaticParams() {
  const allTests = await getTests();
  return allTests.map((test) => ({
    slug: test.slug,
  }));
}

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
