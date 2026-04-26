import { Suspense } from 'react';
import {
  getPublishedMppoliceOneLiners,
  getMppoliceOnelinerCountsBySubject,
} from '@/features/revision/actions/mppolice-one-liners';
import OneLinersModernClient from '../syllabus/quiz/revision/gk-one-liners/OneLinersModernClient';

export const revalidate = 3600; // Cache for 1 hour for guests

function OneLinersFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] text-sm text-[#86868B]">
      Loading…
    </div>
  );
}

export default async function FreeOneLinersPage() {
  // Fetch only 10 facts for the free demo
  const [facts, counts] = await Promise.all([
    getPublishedMppoliceOneLiners('All', 10),
    getMppoliceOnelinerCountsBySubject(),
  ]);

  return (
    <Suspense fallback={<OneLinersFallback />}>
      <OneLinersModernClient 
        facts={facts} 
        counts={counts} 
        initialSubject="All" 
        isFreeDemo={true} 
      />
    </Suspense>
  );
}
