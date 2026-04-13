'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import FLTPageClient, { type TestWithAccess } from '@/app/syllabus/quiz/full-length/FLTPageClient';
import QuizUnitSelectionClient from '@/app/syllabus/quiz/units/QuizUnitSelectionClient';

type HubTab = 'mbt' | 'subject';

const TAB_KEYS: HubTab[] = ['mbt', 'subject'];

interface UnitRow {
  id: string;
  unitId: string | null;
  title: string;
  titleEn?: string | null;
  maxRetries: number | null;
  attempts: number;
  attemptsLeft: number | null;
  totalQuestions: number | null;
  isFree: boolean;
  isFreeAccess: boolean;
  isLiteAccess?: boolean;
}

interface FullTestsHubClientProps {
  fltTests: TestWithAccess[];
  unitTests: UnitRow[];
}

export default function FullTestsHubClient({ fltTests, unitTests }: FullTestsHubClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  const tabParam = searchParams.get('tab');
  const activeTab: HubTab = tabParam === 'subject' ? 'subject' : 'mbt';

  const setTab = useCallback(
    (next: HubTab) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set('tab', next);
      router.replace(`/syllabus/quiz/full-tests?${p.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (tabParam && !TAB_KEYS.includes(tabParam as HubTab)) {
      setTab('mbt');
    }
  }, [tabParam, setTab]);

  const tabDefs = useMemo(
    () => [
      {
        id: 'mbt' as const,
        labelHi: 'MBT · 100 प्रश्न',
        labelEn: 'MBT · 100 Q',
        hintHi: 'मेमोरी बेस्ड फुल मॉक — असली पैटर्न',
        hintEn: 'Memory-based full mocks — exam pattern',
      },
      {
        id: 'subject' as const,
        labelHi: 'विषयवार',
        labelEn: 'Subject-wise',
        hintHi: 'MP Police सेक्शन के बड़े सब्जेक्ट टेस्ट',
        hintEn: 'Large subject tests by MP Police sections',
      },
    ],
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafbfc] pb-28 font-sans md:pb-20">
      <div className="pointer-events-none absolute top-0 left-0 h-[500px] w-full bg-gradient-to-b from-slate-100/30 to-transparent" />
      <div className="pointer-events-none absolute top-[-100px] right-[-100px] h-[500px] w-[500px] rounded-full bg-amber-50/50 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[-150px] h-[400px] w-[400px] rounded-full bg-indigo-50/30 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-8 sm:px-6 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-3 text-center"
        >
          <p className="text-[10px] font-black tracking-[0.25em] text-amber-600 uppercase">
            {hi ? 'फुल टेस्ट' : 'Full tests'}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {hi ? 'PYQ · MBT हब' : 'PYQ · MBT hub'}
          </h1>
          <p className="mx-auto max-w-lg text-sm font-medium text-slate-500">
            {hi
              ? '100 प्रश्न के मेमोरी मॉक या विषयवार यूनिट टेस्ट — एक ही जगह से शुरू करो।'
              : 'Start a 100-Q memory mock or a subject-wise unit test from one place.'}
          </p>
        </motion.div>

        {/* Segmented control — mobile-first */}
        <div className="mx-auto mb-8 max-w-md">
          <div
            className="flex rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm"
            role="tablist"
            aria-label={hi ? 'फुल टेस्ट प्रकार' : 'Full test type'}
          >
            {tabDefs.map((t) => {
              const on = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'relative flex-1 rounded-xl px-3 py-2.5 text-center transition-all',
                    on ? 'text-slate-900' : 'text-slate-400'
                  )}
                >
                  {on && (
                    <motion.div
                      layoutId="full-tests-tab-pill"
                      className="absolute inset-0 rounded-xl bg-slate-900 shadow-md"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 block text-[11px] font-black tracking-wide uppercase">
                    {hi ? t.labelHi : t.labelEn}
                  </span>
                  <span
                    className={cn(
                      'relative z-10 mt-0.5 block text-[10px] font-medium leading-tight',
                      on ? 'text-white/85' : 'text-slate-400'
                    )}
                  >
                    {hi ? t.hintHi : t.hintEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'mbt' ? (
            <FLTPageClient tests={fltTests} embedded />
          ) : (
            <QuizUnitSelectionClient availableTests={unitTests} embedded />
          )}
        </motion.div>
      </div>
    </div>
  );
}
