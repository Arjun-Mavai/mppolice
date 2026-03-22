'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Calendar, Layers, LayoutGrid, Sparkles } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { PYQCard } from './PYQCard';
import { SubjectSeriesDialog } from './SubjectSeriesDialog';
import { cn } from '@/lib/utils';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { QuizListItem } from '@/components/QuizListItem';
import { QuizSubNav } from '@/features/syllabus/components/QuizSubNav';
import { trackFbCustomEvent } from '@/lib/analytics/facebook-pixel';
import { ViewTransition } from 'react';
import { TransitionLink } from '@/components/ui/transition-link';

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
}

interface PYQPageClientProps {
  initialTests: Test[];
  subjectStats: Record<string, number>;
  isLoggedIn?: boolean;
  mode?: string;
}

// --- Constants ---
// Updated to match Syllabus Page Colors (Blue, Pink, Emerald, Amber)
const SUBJECTS = [
  {
    name: 'MP GK',
    icon: BookOpen,
    color: 'amber' as const, // Was Rose
    description: 'History, Geography, Polity & Culture of MP',
  },
  {
    name: 'History',
    icon: Calendar,
    color: 'pink' as const, // Was Amber (Rotate)
    description: 'Ancient, Medieval & Modern India',
  },
  {
    name: 'Geography',
    icon: LayoutGrid,
    color: 'emerald' as const,
    description: 'Physical, Indian & World Geography',
  },
  {
    name: 'Polity',
    icon: Layers,
    color: 'blue' as const,
    description: 'Constitution, Governance & Systems',
  },
  {
    name: 'Economy',
    icon: Layers,
    color: 'amber' as const, // Was Cyan
    description: 'Indian Economy & Planning',
  },
  {
    name: 'Science',
    icon: Layers,
    color: 'pink' as const, // Was Violet
    description: 'Physics, Chemistry, Biology & Tech',
  },
  {
    name: 'ICT',
    icon: Layers,
    color: 'emerald' as const, // Was Indigo
    description: 'Information & Communication Technology',
  },
  {
    name: 'Current Affairs',
    icon: Calendar,
    color: 'blue' as const, // Was Pink
    description: 'National & International Events',
  },
  {
    name: 'Misc',
    icon: Layers,
    color: 'amber' as const,
    description: 'Other topics and uncategorized questions',
  },
];

export default function PYQPageClient({
  initialTests,
  subjectStats,
  isLoggedIn,
  mode,
}: PYQPageClientProps) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const [, startTransition] = useTransition();

  // --- State ---
  const [viewMode, setViewMode] = useState<'year' | 'subject' | 'all-subjects'>(
    mode === 'all-subjects' ? 'all-subjects' : 'year'
  );
  const [loadingTestId, setLoadingTestId] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Dialog State
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // --- Handlers ---
  const handleYearClick = (test: Test) => {
    if (test.isLocked) {
      setPaywallOpen(true);
    } else {
      setLoadingTestId(test.id);
      trackFbCustomEvent('test_started', {
        test_type: 'pyq_year',
        test_name: test.titleEn || test.title,
        test_id: test.id,
      });
      startTransition(() => {
        router.push(`/syllabus/quiz/play?mode=pyq&testId=${test.id}`);
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
  }, [router, isLoggedIn]);

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md transition-all md:top-[89px]">
        <div className="mx-auto max-w-5xl px-4 pt-12 pb-4 sm:px-6 md:py-4 lg:px-8">
          <div className="flex flex-col gap-4">
            {/* Desktop Nav - Moved to Layout */}

            {/* Top Row: Back + Title */}
            <div className="flex items-center gap-3 pt-6 md:pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="-ml-2 h-9 w-9 rounded-full px-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                {/* <ArrowLeft className="h-5 w-5" /> */}
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {language === 'hi' ? 'पिछले वर्ष के प्रश्न' : 'Previous Year Questions'}
                </h1>
                <p className="text-xs font-medium text-slate-500">
                  {language === 'hi'
                    ? 'अपनी तैयारी को परखें पुराने प्रश्नों के साथ'
                    : 'Analyze trends & practice actual exam questions'}
                </p>
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

            {/* Insights Shortcuts */}
            {!isLoggedIn ? null : (
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {/* Premium Intelligence */}
                <div className="rounded-xl bg-gradient-to-r from-pink-500 via-red-500 via-yellow-500 to-green-500 p-[1.5px] shadow-sm transition-transform hover:scale-[1.02]">
                  <Button
                    asChild
                    className="inline-flex h-full w-full items-center gap-2 rounded-[10px] bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <TransitionLink
                      href="/syllabus/quiz/pyq/intelligence"
                      transitionTypes={['slide']}
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      {language === 'hi' ? 'विशेषज्ञ PYQ इनसाइट्स' : 'Expert PYQ Insights'}
                    </TransitionLink>
                  </Button>
                </div>

                {/* Most Repeated Questions */}
                {/* <div className="rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-[1.5px] shadow-sm transition-transform hover:scale-[1.02]">
                   <Button
                    onClick={() => router.push('/syllabus/quiz/pyq/repeated')}
                    className="inline-flex h-full w-full items-center gap-2 rounded-[10px] bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <span className="flex h-4 w-4 items-center justify-center text-base">🔥</span>
                    {language === 'hi' ? 'बार-बार पूछे गए प्रश्न' : 'Repeated Questions'}
                  </Button>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area - Added top padding for mobile to ensure title visibility if sticky header covers it */}
      <ViewTransition>
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {viewMode === 'all-subjects' ? (
              <motion.div
                key="all-subjects-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* All Subjects Header */}
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

                  {/* Back Button */}
                  <Button onClick={() => setViewMode('year')} variant="outline" className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {language === 'hi' ? 'वापस जाएं' : 'Go Back'}
                  </Button>
                </div>

                {/* All Subject Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {SUBJECTS.filter((sub) => (subjectStats[sub.name] || 0) > 0).map((sub, idx) => (
                    <div key={sub.name} className="group">
                      <PYQCard
                        title={sub.name}
                        count={subjectStats[sub.name] || 0}
                        icon={sub.icon}
                        color={sub.color}
                        onClick={() => handleSubjectClick(sub.name)}
                        delay={idx * 0.05}
                        description={sub.description}
                        subtitle={`${subjectStats[sub.name] || 0} ${language === 'hi' ? 'प्रश्न' : 'Questions'}`}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : viewMode === 'year' ? (
              <motion.div
                key="year-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {initialTests.map((test, idx) => (
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
                    colorVariant={
                      (['amber', 'emerald', 'pink', 'blue', 'indigo'] as const)[idx % 5]
                    }
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
                {initialTests.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="font-medium text-slate-400">
                      {language === 'hi'
                        ? 'कोई PYQ उपलब्ध नहीं।'
                        : 'No Previous Year Papers available.'}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="subject-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {SUBJECTS.map((sub, idx) => (
                  <PYQCard
                    key={sub.name}
                    title={sub.name}
                    count={subjectStats[sub.name] || 0}
                    icon={sub.icon}
                    color={sub.color}
                    onClick={() => handleSubjectClick(sub.name)}
                    delay={idx * 0.05}
                    description={sub.description}
                    subtitle=""
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ViewTransition>

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
