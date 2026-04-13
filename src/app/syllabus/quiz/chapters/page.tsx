import { Suspense } from 'react';
import { getSyllabusTopics } from '@/actions/getSyllabusTopics';
import { PYQFactsLoader } from '@/components/ui/PYQFactsLoader';
import ChapterTopicHubClient from './ChapterTopicHubClient';

export default async function ChapterTestsPage() {
  return (
    <div className="relative min-h-screen bg-[#fafbfc] font-sans">
      <Suspense fallback={<PYQFactsLoader label="Loading chapter tests…" theme="dark" />}>
        <ChapterTestsData />
      </Suspense>
    </div>
  );
}

async function ChapterTestsData() {
  const res = await getSyllabusTopics();
  const initialData = res.success ? (res.data as Record<string, unknown[]>) : {};
  return <ChapterTopicHubClient initialDbData={initialData as any} />;
}
