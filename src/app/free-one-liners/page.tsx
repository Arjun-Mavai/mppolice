// 📚 Free GK One-Liners Demo Page
// Bhai, ye page guests ke liye h taaki wo quality check kar sakein.
// SSG caching use ki h (1 hour) taaki server pe baar baar load na pade.

import { Suspense } from 'react';
import {
  getPublishedMppoliceOneLiners,
  getMppoliceOnelinerCountsBySubject,
} from '@/features/revision/actions/mppolice-one-liners';
import OneLinersModernClient from '../syllabus/quiz/revision/gk-one-liners/OneLinersModernClient';

// ⏱️ Cache for 1 hour for guests: Bhai baar baar database hit karne ki zaroorat nahi h.
export const revalidate = 3600; 

function OneLinersFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] text-sm text-[#86868B]">
      Loading Facts…
    </div>
  );
}

export default async function FreeOneLinersPage() {
  // 🏎️ Parallel Fetching: Dono data ek saath fetch ho rahe h (Zero Waterfall)
  const [facts, counts] = await Promise.all([
    getPublishedMppoliceOneLiners('All', 10, 0), // Demo ke liye sirf top 10 facts
    getMppoliceOnelinerCountsBySubject(),
  ]);

  return (
    <Suspense fallback={<OneLinersFallback />}>
      {/* 💻 Client component saara interaction handle karega */}
      <OneLinersModernClient 
        facts={facts} 
        counts={counts} 
        initialSubject="All" 
        isFreeDemo={true} 
      />
    </Suspense>
  );
}
