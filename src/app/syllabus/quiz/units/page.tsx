import { getAvailableUnitTests } from '@/features/tests/actions/quiz';
import QuizUnitSelectionClient from './QuizUnitSelectionClient';
import { Suspense } from 'react';
import { QuizListSkeleton } from '@/components/QuizListSkeleton';

export default async function QuizUnitSelectionPage() {
  return (
    <div className="relative min-h-screen bg-[#fafbfc] pb-20 font-sans">
      <Suspense fallback={<QuizListFallback />}>
        <UnitSelectionData />
      </Suspense>
    </div>
  );
}

function QuizListFallback() {
  return (
    <div className="relative z-10 mx-auto max-w-5xl px-6 pt-32">
      <div className="mb-12 space-y-2 text-center">
        <div className="mx-auto mb-4 h-10 w-48 animate-pulse rounded-xl bg-slate-200" />
        <div className="mx-auto h-4 w-80 animate-pulse rounded-lg bg-slate-100" />
      </div>
      <QuizListSkeleton />
    </div>
  );
}

async function UnitSelectionData() {
  const availableTests = await getAvailableUnitTests();
  return <QuizUnitSelectionClient availableTests={availableTests} />;
}
