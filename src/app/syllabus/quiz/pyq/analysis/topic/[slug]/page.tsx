import { getTopicTrendProof } from '@/features/tests/actions/pyq-insights';
import TopicTrendProofClient from './TopicTrendProofClient';
import { notFound } from 'next/navigation';

export default async function TopicTrendProofPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const proof = await getTopicTrendProof(slug);
  if (!proof) notFound();

  return <TopicTrendProofClient proof={proof} />;
}
