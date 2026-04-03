import { Suspense } from 'react';
import { getSyllabusTopics } from '@/actions/getSyllabusTopics';
import TopicSelectionClient from './TopicSelectionClient';
import { PYQFactsLoader } from '@/components/ui/PYQFactsLoader';

export default async function TopicPage() {
  return (
    <div className="relative min-h-screen bg-[#fafbfc] pb-20 font-sans">
      <Suspense fallback={<PYQFactsLoader label="Loading Topics..." theme="dark" />}>
        <TopicPageData />
      </Suspense>
    </div>
  );
}

async function TopicPageData() {
  const res = await getSyllabusTopics();
  const initialData = res.success ? (res.data as any) : {};

  return <TopicSelectionClient initialDbData={initialData} />;
}
