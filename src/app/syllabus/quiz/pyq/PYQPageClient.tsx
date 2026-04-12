'use client';

import React, { useEffect, useState, useTransition, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Calculator,
  FlaskConical,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { PYQCard } from './PYQCard';
import { SubjectSeriesDialog } from './SubjectSeriesDialog';
import { cn } from '@/lib/utils';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { QuizListItem } from '@/components/QuizListItem';
import { trackFbCustomEvent } from '@/lib/analytics/facebook-pixel';
import { Fragment } from 'react';
import { TransitionLink } from '@/components/ui/transition-link';
import { useQueryClient } from '@tanstack/react-query';
import { getSubjectPartAccess } from './actions';
import {
  extractCollectionsFromTests,
  testMatchesCollection,
  testMatchesUiBucket,
} from '@/lib/mppolice/pyq-hub-filters';
import type { UiBucket } from '@/lib/mppolice/syllabus-types';

// --- Types ---
interface Test {
  id: string;
  title: string;
  titleEn?: string | null;
  slug: string;
  description?: string | null;
  questions?: number;
  totalQuestions?: number;
  durationMinutes: number;
  isLocked: boolean;
  isFree?: boolean;
  attemptsLeft?: number;
  maxRetries?: number | null;
  year?: number;
  tags?: unknown;
}

interface PYQPageClientProps {
  initialTests: Test[];
  initialMockTests?: Test[];
  subjectStats: Record<string, number>;
  isLoggedIn?: boolean;
  mode?: string;
  initialTab?: string;
  initialBucket?: string;
  initialCollection?: string;
}

// --- Constants (MP Police 4-tab UI) ---
const SUBJECTS = [
  {
    name: 'General Knowledge',
    icon: BookOpen,
    color: 'amber' as const,
    description: 'Static GK, polity, economy, current affairs',
  },
  {
    name: 'General Science',
    icon: FlaskConical,
    color: 'emerald' as const,
    description: 'Physics, chemistry, biology',
  },
  {
    name: 'Logical Reasoning',
    icon: Brain,
    color: 'blue' as const,
    description: 'Verbal & non-verbal reasoning',
  },
  {
    name: 'Quantitative Aptitude',
    icon: Calculator,
    color: 'pink' as const,
    description: 'Mental ability & arithmetic',
  },
];

const BUCKET_PILLS: { id: UiBucket; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'general_knowledge', label: 'General Knowledge' },
  { id: 'general_science', label: 'General Science' },
  { id: 'logical_reasoning', label: 'Logical Reasoning' },
  { id: 'quantitative_aptitude', label: 'Quantitative Aptitude' },
];

export default function PYQPageClient({
  initialTests,
  initialMockTests = [],
  subjectStats,
  isLoggedIn,
  mode,
  initialTab,
  initialBucket,
  initialCollection,
}: PYQPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { language } = useSettingsStore();
  const [, startTransition] = useTransition();

  const [primaryTab, setPrimaryTab] = useState<'mock' | 'pyq'>(
    initialTab === 'mock' ? 'mock' : 'pyq'
  );
  const [uiBucket, setUiBucket] = useState<UiBucket>(() => {
    const b = initialBucket || searchParams?.get('bucket');
    const ok = BUCKET_PILLS.some((p) => p.id === b);
    return ok && b ? (b as UiBucket) : 'all';
  });
  const [collection, setCollection] = useState(
    initialCollection || searchParams?.get('collection') || 'all'
  );

  // --- State ---
  const [viewMode, setViewMode] = useState<'year' | 'subject' | 'all-subjects'>(
    mode === 'all-subjects' ? 'all-subjects' : 'year'
  );
  const [loadingTestId, setLoadingTestId] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Dialog State
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const collectionOptions = useMemo(() => {
    const src = primaryTab === 'mock' ? initialMockTests : initialTests;
    return ['all', ...extractCollectionsFromTests(src)];
  }, [primaryTab, initialMockTests, initialTests]);

  const filteredTests = useMemo(() => {
    const base = primaryTab === 'mock' ? initialMockTests : initialTests;
    return base.filter(
      (t) =>
        testMatchesUiBucket(t.tags, uiBucket) &&
        testMatchesCollection(t.tags, collection === 'all' ? null : collection)
    );
  }, [primaryTab, initialMockTests, initialTests, uiBucket, collection]);

  // --- Handlers ---
  const handleYearClick = (test: Test) => {
    if (test.isLocked) {
      setPaywallOpen(true);
    } else {
      setLoadingTestId(test.id);
      const playMode = primaryTab === 'mock' ? 'full' : 'pyq';
      trackFbCustomEvent('test_started', {
        test_type: primaryTab === 'mock' ? 'mock_series' : 'pyq_year',
        test_name: test.titleEn || test.title,
        test_id: test.id,
      });
      startTransition(() => {
        router.push(`/syllabus/quiz/play?mode=${playMode}&testId=${test.id}`);
      });
    }
  };

  const handleSubjectClick = (subject: string) => {
    setSelectedSubject(subject);
  };

  const handleSeriesSelect = (limit: number, offset: number) => {
    if (!selectedSubject) return;
    trackFbCustomEvent('test_started', {
      test_type: 'pyq_subject',
      test_name: `${selectedSubject} (Part ${offset / limit + 1})`,
      subject: selectedSubject,
    });
    startTransition(() => {
      router.push(
        `/syllabus/quiz/play?mode=pyq-subject&subject=${selectedSubject}&limit=${limit}&offset=${offset}`
      );
    });
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    router.prefetch('/syllabus/quiz/pyq/intelligence');
    router.prefetch('/syllabus/quiz/pyq/intelligence/questions?subject=All&source=subject');
    router.prefetch('/syllabus/quiz/pyq/analysis');

    // 🚀 Prefetch Subject Access Data for ALL subjects to make modals instant
    SUBJECTS.forEach((sub) => {
      if ((subjectStats[sub.name] || 0) > 0) {
        queryClient.prefetchQuery({
          queryKey: ['subject-access', sub.name],
          queryFn: () => getSubjectPartAccess(sub.name),
          staleTime: 10 * 60 * 1000,
        });
      }
    });
  }, [router, isLoggedIn, subjectStats, queryClient]);

  const syncHubQuery = useCallback(
    (next: Partial<{ tab: string; bucket: string; collection: string }>) => {
      const p = new URLSearchParams(searchParams?.toString() || '');
      if (next.tab !== undefined) {
        if (next.tab === 'pyq') p.delete('tab');
        else p.set('tab', next.tab);
      }
      if (next.bucket !== undefined) {
        if (next.bucket === 'all') p.delete('bucket');
        else p.set('bucket', next.bucket);
      }
      if (next.collection !== undefined) {
        if (next.collection === 'all') p.delete('collection');
        else p.set('collection', next.collection);
      }
      const qs = p.toString();
      const base = pathname || '/syllabus/quiz/pyq';
      router.replace(qs ? `${base}?${qs}` : base);
    },
    [router, searchParams, pathname]
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-36 md:pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md transition-all md:top-[89px]">
        <div className="mx-auto max-w-5xl px-4 pt-12 pb-4 sm:px-6 md:py-4 lg:px-8">
          <div className="flex flex-col gap-4">
            {/* Top Row: Back + Title */}
            <div className="flex items-center gap-3 pt-6 md:pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="-ml-2 h-9 w-9 rounded-full px-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
                  {language === 'hi'
                    ? 'MP Police — पेपर व टेस्ट सीरीज'
                    : 'MP Police — Papers & test series'}
                </h1>
                <p className="text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
                  {language === 'hi'
                    ? 'PYPs: आधिकारिक / मेमोरी बेस्ड 100 प्रश्न। मॉक: फुल लेंथ अभ्यास। नीचे विषय वाइज़ अभ्यास भी।'
                    : 'PYPs: official & memory-based 100-Q papers. Mocks: full-length practice. Subject-wise practice below.'}
                </p>
              </div>
            </div>

            {/* Mock vs PYP + collections + 4-tab buckets */}
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex w-full max-w-lg rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryTab('mock');
                    setUiBucket('all');
                    setCollection('all');
                    syncHubQuery({ tab: 'mock', bucket: 'all', collection: 'all' });
                  }}
                  className={cn(
                    'flex-1 rounded-lg py-2 text-sm font-semibold transition-all',
                    primaryTab === 'mock'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {language === 'hi' ? 'मॉक टेस्ट' : 'Mock Tests'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryTab('pyq');
                    setUiBucket('all');
                    setCollection('all');
                    syncHubQuery({ tab: 'pyq', bucket: 'all', collection: 'all' });
                  }}
                  className={cn(
                    'flex-1 rounded-lg py-2 text-sm font-semibold transition-all',
                    primaryTab === 'pyq'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {language === 'hi' ? 'पिछले वर्ष (PYP)' : 'PYPs'}
                </button>
              </div>

              {collectionOptions.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {collectionOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCollection(c);
                        syncHubQuery({
                          collection: c,
                        });
                      }}
                      className={cn(
                        'shrink-0 rounded-full border px-3 py-1 text-xs font-semibold',
                        collection === c
                          ? 'border-blue-500 bg-blue-50 text-blue-800'
                          : 'border-slate-200 bg-white text-slate-600'
                      )}
                    >
                      {c === 'all' ? (language === 'hi' ? 'सभी' : 'All collections') : c}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {BUCKET_PILLS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setUiBucket(b.id);
                      syncHubQuery({ bucket: b.id });
                    }}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                      uiBucket === b.id
                        ? 'border-slate-800 bg-slate-800 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {language === 'hi' && b.id === 'all'
                      ? 'सभी'
                      : b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex w-full justify-center">
              <div className="flex w-full max-w-md rounded-xl bg-slate-100 p-1">
                <button
                  onClick={() => setViewMode('year')}
                  className={cn(
                    'flex-1 rounded-lg py-2 text-sm font-semibold transition-all',
                    viewMode === 'year'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {language === 'hi' ? 'वर्ष-वार' : 'Year Wise'}
                </button>
                <button
                  onClick={() => setViewMode('subject')}
                  className={cn(
                    'flex-1 rounded-lg py-2 text-sm font-semibold transition-all',
                    viewMode === 'subject'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {language === 'hi' ? 'विषय-वार' : 'Topic Wise'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Optimized for Instant Switching */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* All Subjects View */}
        <div className={viewMode !== 'all-subjects' ? 'hidden' : 'block'}>
          <div className="space-y-8">
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {language === 'hi'
                  ? 'सभी विषय प्रश्न (2020-2025)'
                  : 'All Subject Questions (2020-2025)'}
              </h2>
              <p className="text-slate-600">
                {language === 'hi'
                  ? 'पिछले 6 वर्षों के सभी प्रश्न विषयवार व्यवस्थित'
                  : 'All questions from past 6 years organized by subject'}
              </p>
              <Button onClick={() => setViewMode('year')} variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === 'hi' ? 'वापस जाएं' : 'Go Back'}
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SUBJECTS.filter((sub) => (subjectStats[sub.name] || 0) > 0).map((sub) => (
                <div key={sub.name} className="group">
                  <PYQCard
                    title={sub.name}
                    count={subjectStats[sub.name] || 0}
                    icon={sub.icon}
                    color={sub.color}
                    onClick={() => handleSubjectClick(sub.name)}
                    delay={0}
                    description={sub.description}
                    subtitle={`${subjectStats[sub.name] || 0} ${language === 'hi' ? 'प्रश्न' : 'Questions'}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Year Wise View */}
        <div className={viewMode !== 'year' ? 'hidden' : 'space-y-4'}>
          {filteredTests.map((test, idx) => (
            <QuizListItem
              key={test.id}
              index={idx}
              title={language === 'hi' ? test.title : test.titleEn || test.title}
              subtitle={`${test.year}`}
              questions={test.totalQuestions || undefined}
              itemLabel={language === 'hi' ? 'प्रश्न' : 'Questions'}
              marks={(test.totalQuestions || 0) * QUIZ_CONSTANTS.MARKS_PER_QUESTION}
              duration={test.durationMinutes}
              isLocked={test.isLocked}
              isFree={test.isFree}
              attemptsLeft={test.attemptsLeft}
              maxAttempts={test.maxRetries}
              language={language}
              colorVariant={(['amber', 'emerald', 'pink', 'blue', 'indigo'] as const)[idx % 5]}
              isLoading={loadingTestId === test.id}
              onClick={() => handleYearClick(test)}
              onMouseEnter={() => {
                if (!test.isLocked) {
                  router.prefetch(`/syllabus/quiz/play?mode=pyq&testId=${test.id}`);
                }
              }}
              onTouchStart={() => {
                if (!test.isLocked) {
                  router.prefetch(`/syllabus/quiz/play?mode=pyq&testId=${test.id}`);
                }
              }}
            />
          ))}
          {filteredTests.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-medium text-slate-400">
                {language === 'hi'
                  ? 'इस फ़िल्टर के लिए कोई टेस्ट नहीं।'
                  : 'No tests for this filter.'}
              </p>
            </div>
          )}
        </div>

        {/* Topic Wise View */}
        <div className={viewMode !== 'subject' ? 'hidden' : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
          {SUBJECTS.map((sub) => (
            <PYQCard
              key={sub.name}
              title={sub.name}
              count={subjectStats[sub.name] || 0}
              icon={sub.icon}
              color={sub.color}
              onClick={() => handleSubjectClick(sub.name)}
              delay={0}
              description={sub.description}
              subtitle=""
            />
          ))}
        </div>
      </div>

      {/* Series Selection Dialog */}
      {selectedSubject && (
        <SubjectSeriesDialog
          isOpen={!!selectedSubject}
          onClose={() => setSelectedSubject(null)}
          subject={selectedSubject}
          totalQuestions={subjectStats[selectedSubject] || 0}
          onSelectSeries={handleSeriesSelect}
        />
      )}

      {/* Paywall Modal */}
      <SyllabusLockModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
