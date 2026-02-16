import { Suspense } from 'react';
import { getSyllabusTopics } from '@/actions/getSyllabusTopics';
import TopicSelectionClient from './TopicSelectionClient';
import { TopicGridSkeleton } from '@/components/QuizListSkeleton';

export default async function TopicPage() {
  return (
    <div className="relative min-h-screen bg-[#fafbfc] pb-20 font-sans">
      <Suspense fallback={<TopicSelectionFallback />}>
        <TopicPageData />
      </Suspense>
    </div>
  );
}

function TopicSelectionFallback() {
  return (
    <div className="relative z-10 mx-auto max-w-5xl px-6 pt-32">
      <div className="mb-12 space-y-2 text-center">
        <div className="mx-auto mb-4 h-12 w-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="mx-auto h-4 w-96 animate-pulse rounded-lg bg-slate-100" />
      </div>
      <TopicGridSkeleton />
    </div>
  );
}

async function TopicPageData() {
  const res = await getSyllabusTopics();
  const initialData = res.success ? (res.data as any) : {};

  return <TopicSelectionClient initialDbData={initialData} />;
}
