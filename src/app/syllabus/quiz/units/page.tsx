import { getAvailableUnitTests } from '@/features/tests/actions/quiz';
import QuizUnitSelectionClient from './QuizUnitSelectionClient';
import { Suspense } from 'react';
import { PYQFactsLoader } from '@/components/ui/PYQFactsLoader';

export default async function QuizUnitSelectionPage() {
  return (
    <div className="relative min-h-screen bg-[#fafbfc] pb-20 font-sans">
      <Suspense fallback={<PYQFactsLoader label="Loading Unit Tests..." theme="dark" />}>
        <UnitSelectionData />
      </Suspense>
    </div>
  );
}

async function UnitSelectionData() {
  const availableTests = await getAvailableUnitTests();
  return <QuizUnitSelectionClient availableTests={availableTests} />;
}
