'use client';

import React, { useEffect, useState, useTransition, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { cn } from '@/lib/utils';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { QuizListItem } from '@/components/QuizListItem';
import { trackFbCustomEvent } from '@/lib/analytics/facebook-pixel';
import { motion, AnimatePresence } from 'framer-motion';
import {
  isMbtByCollectionTags,
  isFltFamilyHubType,
} from '@/lib/mppolice/pyq-hub-filters';

// --- Types ---
interface Test {
  id: string;
  /** DB row type — MBT uses PYQ + FLT family with `collection:memory` */
  type?: string;
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
  examType?: string | null;
}

interface PYQPageClientProps {
  initialTests: Test[];
  initialMockTests?: Test[];
  /** Server-built MBT list; optional so HMR / partial renders never crash. */
  initialMbtTests?: Test[];
  isLoggedIn?: boolean;
  mode?: string;
  initialTab?: string;
  initialCollection?: string;
}

type HubTab = 'pyp' | 'mbt' | 'flt';
const HUB_TABS: HubTab[] = ['pyp', 'mbt', 'flt'];

export default function PYQPageClient({
  initialTests,
  initialMockTests = [],
  initialMbtTests = [],
  isLoggedIn: _isLoggedIn,
  mode: _mode,
  initialTab: _initialTab,
  initialCollection,
}: PYQPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  const [, startTransition] = useTransition();

  const tabQuery = searchParams?.get('tab') as HubTab | null;
  const initialTab: HubTab =
    (typeof _initialTab === 'string' && HUB_TABS.includes(_initialTab as HubTab)
      ? (_initialTab as HubTab)
      : tabQuery && HUB_TABS.includes(tabQuery)
        ? tabQuery
        : 'pyp');
  const [activeTab, setActiveTab] = useState<HubTab>(initialTab);

  const [loadingTestId, setLoadingTestId] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useSettingsStore();

  useEffect(() => {
    setIsAdmin((user as any)?.role === 'admin');
  }, [user]);

  useEffect(() => {
    if (tabQuery && HUB_TABS.includes(tabQuery) && tabQuery !== activeTab) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery, activeTab]);

  // PYP: PYQ + no `collection:memory` (SQL already limits to MP Police hub exams).
  const filteredPyqTests = useMemo(
    () => initialTests.filter((t) => !isMbtByCollectionTags(t.tags)),
    [initialTests]
  );

  const onlyMockLike = useMemo(
    () => initialMockTests.filter((t) => isFltFamilyHubType(t.type)),
    [initialMockTests]
  );

  // MBT: authoritative list from server (`initialMbtTests`); same rules as DB rows.
  const mbtTabRows = Array.isArray(initialMbtTests) ? initialMbtTests : [];

  // FLT: FLT family + no memory tag (mis-tagged memory mocks stay off this tab).
  const filteredFltTests = useMemo(
    () => onlyMockLike.filter((t) => !isMbtByCollectionTags(t.tags)),
    [onlyMockLike]
  );

  const handleTestLaunch = (test: Test, playMode: 'pyq' | 'full', analyticsType: string) => {
    if (test.isLocked) {
      setPaywallOpen(true);
    } else {
      setLoadingTestId(test.id);
      trackFbCustomEvent('test_started', {
        test_type: analyticsType,
        test_name: test.titleEn || test.title,
        test_id: test.id,
      });
      startTransition(() => {
        router.push(`/syllabus/quiz/play?mode=${playMode}&testId=${test.id}`);
      });
    }
  };

  const syncHubQuery = useCallback(
    (next: Partial<{ tab: HubTab }>) => {   const p = new URLSearchParams(window.location.search);
      if (next.tab !== undefined) {
        p.set('tab', next.tab);
      }
      const qs = p.toString();
      const base = window.location.pathname;
      const newUrl = qs ? `${base}?${qs}` : base;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    },
    []
  );

  const tabDefs = useMemo(
    () => [
      {
        id: 'pyp' as const,
        labelHi: 'PYP',
        labelEn: 'PYP',
        hintHi: 'पिछले वर्ष',
        hintEn: 'Previous years',
      },
      {
        id: 'mbt' as const,
        labelHi: 'MBT',
        labelEn: 'MBT',
        hintHi: 'मेमोरी बेस्ड',
        hintEn: 'Memory based',
      },
      {
        id: 'flt' as const,
        labelHi: 'FLT',
        labelEn: 'FLT',
        hintHi: 'फुल मॉक',
        hintEn: 'Full mocks',
      },
    ],
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafbfc] pb-28 font-sans md:pb-20">
      <div className="pointer-events-none absolute top-0 left-0 h-[500px] w-full bg-gradient-to-b from-slate-100/30 to-transparent" />
      <div className="pointer-events-none absolute top-[-100px] right-[-100px] h-[500px] w-[500px] rounded-full bg-violet-50/40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[-150px] h-[400px] w-[400px] rounded-full bg-teal-50/25 blur-[100px]" />

      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-md md:top-[89px]">
        <div className="mx-auto max-w-5xl px-4 pt-10 pb-4 sm:px-6 md:py-4 lg:px-8">
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
              {/* <div>
                <h1 className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
                  {hi ? 'MP Police — पेपर व टेस्ट सीरीज' : 'MP Police — Papers & test series'}
                </h1>
                <p className="text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
                  {hi
                    ? 'PYP = PYQ + `collection:memory` नहीं। MBT = `collection:memory`। FLT = FLT टाइप + memory नहीं।'
                    : 'PYP = PYQ without `collection:memory`. MBT = `collection:memory`. FLT = FLT-type mock without `collection:memory`.'}
                </p>
              </div> */}
            </div>

            {isAdmin && (
              <details className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-600 sm:text-sm">
                <summary className="cursor-pointer font-semibold text-slate-800">
                  {hi ? 'ये पेज बैकएंड से कैसे जुड़ा है? (क्लिक करें)' : 'How this page maps to data (tap to expand)'}
                </summary>
                <ul className="mt-2 list-inside list-disc space-y-1 pl-1">
                  <li>
                    {hi
                      ? 'पिछले वर्ष की सूची: डेटाबेस में टाइप PYQ वाले टेस्ट — एडमिन / कंटेंट मैनेजर से JSON अपलोड।'
                      : 'PYP list: tests with type PYQ in the DB — uploaded via Admin → Content manager (JSON).'}
                  </li>
                  <li>
                    {hi
                      ? 'मॉक / फुल टेस्ट: FLT, UNIT, TOPIC आदि — साल ज़रूरी नहीं; नवीनतम ऊपर।'
                      : 'Mocks block: FLT / UNIT / TOPIC / etc. — ordered by latest; year is not the main idea here.'}
                  </li>
                  <li>
                    {hi
                      ? 'विषय वाइज़: पुराने पेपरों के प्रश्नों को विषय टैग से मिलाकर पार्ट-वाइज़ क्विज़ (अलग मोड)।'
                      : 'Subject-wise: mixes PYQ-bank questions by subject tag; opens chunked quizzes (play URL mode pyq-subject).'}
                  </li>
                  <li>
                    {hi
                      ? 'DB: `exam_type` mppolice या all। Memory टैग = MBT; बिना memory का PYQ = PYP; बिना memory का FLT = FLT टैब।'
                      : 'DB: `exam_type` mppolice or `all`. `collection:memory` → MBT; PYQ without memory → PYP; FLT family without memory → FLT tab.'}
                  </li>
                </ul>
              </details>
            )}

            {/* Tabs */}
            <div className="mt-4 flex flex-col gap-3">
              <div className="mx-auto w-full max-w-md">
                <div
                  className="flex gap-1 rounded-2xl border border-slate-200/60 bg-white/80 p-1 shadow-sm backdrop-blur-md"
                  role="tablist"
                >
                  {tabDefs.map((t) => {
                    const on = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => {
                          setActiveTab(t.id);
                          syncHubQuery({ tab: t.id });
                        }}
                        className={cn(
                          'relative flex-1 rounded-xl px-2 py-2.5 text-center transition-all duration-300 active:scale-95',
                          on ? 'text-white' : 'text-slate-500 hover:bg-slate-50'
                        )}
                      >
                        {on && (
                          <motion.div
                            layoutId="pyq-hub-tab-pill-active"
                            className="absolute inset-0 rounded-xl bg-slate-950 shadow-md"
                            transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                          />
                        )}
                        <div className="relative z-10">
                          <span className="block text-[11px] font-black tracking-wide uppercase">
                            {hi ? t.labelHi : t.labelEn}
                          </span>
                          <span
                            className={cn(
                              'mt-0.5 block text-[10px] font-medium leading-tight transition-opacity duration-300',
                              on ? 'opacity-90' : 'opacity-60'
                            )}
                          >
                            {hi ? t.hintHi : t.hintEn}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* ── Hub content (3 tabs) — list layout matches /syllabus/quiz/chapters ── */}
        <section className="space-y-4">
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                      {activeTab === 'pyp'
                        ? hi
                          ? 'पिछले वर्ष के पेपर (PYP)'
                          : 'Previous year papers (PYP)'
                        : activeTab === 'mbt'
                          ? hi
                            ? 'मेमोरी बेस्ड टेस्ट (MBT)'
                            : 'Memory based tests (MBT)'
                          : hi
                            ? 'फुल मॉक टेस्ट (FLT)'
                            : 'Full mock tests (FLT)'}
                    </h2>
                    <p className="text-xs text-slate-500 sm:text-sm">
                      {activeTab === 'pyp'
                        ? hi
                          ? 'PYP पेपर — टाइप PYQ, बिना `collection:memory`।'
                          : 'PYP papers — type PYQ, no `collection:memory` tag.'
                        : activeTab === 'mbt'
                          ? hi
                            ? 'एडमिन में Collection tag `memory` रखो → DB में `collection:memory` (PYQ या FLT दोनों दिख सकते हैं)।'
                            : 'Admin: set Collection tag to `memory` → stored as `collection:memory` (shows for PYQ or FLT uploads).'
                          : hi
                            ? 'फुल सिलेबस FLT मॉक — बिना `collection:memory`।'
                            : 'Full-syllabus FLT mocks — no `collection:memory` tag.'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    {activeTab === 'pyp'
                      ? `${filteredPyqTests.length} ${hi ? 'पेपर' : 'papers'}`
                      : activeTab === 'mbt'
                        ? `${mbtTabRows.length} ${hi ? 'टेस्ट' : 'tests'}`
                        : `${filteredFltTests.length} ${hi ? 'टेस्ट' : 'tests'}`}
                  </span>
                </div>

                <div className="space-y-3 pb-4">
                  {(activeTab === 'pyp'
                    ? filteredPyqTests
                    : activeTab === 'mbt'
                      ? mbtTabRows
                      : filteredFltTests
                  ).map((test, idx) => {
                  const primary = hi ? test.title : test.titleEn || test.title;
                  const alt = (hi ? test.titleEn?.trim() : test.title?.trim()) || '';
                  const subtitle =
                    activeTab === 'pyp'
                      ? [test.year != null ? String(test.year) : '', alt && alt !== primary ? alt : '']
                          .filter(Boolean)
                          .join(' · ')
                      : [
                          hi
                            ? `${test.totalQuestions ?? 0} प्रश्न`
                            : `${test.totalQuestions ?? 0} Q`,
                          alt && alt !== primary ? alt : '',
                        ]
                          .filter(Boolean)
                          .join(' · ');

                  const playMode = activeTab === 'pyp' ? 'pyq' : 'full';
                  const analyticsType =
                    activeTab === 'pyp' ? 'pyq_year' : activeTab === 'mbt' ? 'mbt' : 'flt';

                  return (
                    <QuizListItem
                      key={test.id}
                      index={idx}
                      title={primary}
                      subtitle={subtitle}
                      questions={test.totalQuestions || undefined}
                      itemLabel={hi ? 'प्रश्न' : 'Questions'}
                      marks={(test.totalQuestions || 0) * QUIZ_CONSTANTS.MARKS_PER_QUESTION}
                      duration={test.durationMinutes}
                      isLocked={test.isLocked}
                      isFree={test.isFree}
                      attemptsLeft={test.attemptsLeft}
                      maxAttempts={test.maxRetries}
                      language={language}
                      colorVariant={(['amber', 'emerald', 'pink', 'blue', 'indigo'] as const)[idx % 5]}
                      isLoading={loadingTestId === test.id}
                      onClick={() => handleTestLaunch(test, playMode, analyticsType)}
                      onMouseEnter={() => {
                        if (!test.isLocked) {
                          router.prefetch(`/syllabus/quiz/play?mode=${playMode}&testId=${test.id}`);
                        }
                      }}
                      onTouchStart={() => {
                        if (!test.isLocked) {
                          router.prefetch(`/syllabus/quiz/play?mode=${playMode}&testId=${test.id}`);
                        }
                      }}
                    />
                  );
                })}

                {activeTab === 'pyp' && filteredPyqTests.length === 0 && (
                  <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
                    <p className="font-semibold text-slate-700">
                      {hi ? 'कोई PYP पेपर नहीं' : 'No PYP papers'}
                    </p>
                    <p className="mt-1 px-4 text-xs text-slate-500">
                      {hi
                        ? 'Admin: PYQ + MP Police exam; PYP के लिए `collection:memory` मत लगाओ (वो MBT में जाता है)।'
                        : 'Admin: PYQ + MP Police exam; skip `collection:memory` for PYP (that tag sends the row to MBT).'}
                    </p>
                  </div>
                )}
                {activeTab === 'mbt' && mbtTabRows.length === 0 && (
                  <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
                    <p className="font-semibold text-slate-700">
                      {hi ? 'कोई MBT नहीं' : 'No MBT tests'}
                    </p>
                    <p className="mt-1 px-4 text-xs text-slate-500">
                      {hi
                        ? 'Admin में Collection tag में `memory` लिखो → DB में `collection:memory` बनेगा।'
                        : 'Admin → Collection tag: type `memory` → saves as `collection:memory` on the test.'}
                    </p>
                  </div>
                )}
                {activeTab === 'flt' && filteredFltTests.length === 0 && (
                  <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
                    <p className="font-semibold text-slate-700">
                      {hi ? 'कोई FLT नहीं' : 'No FLT tests'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {hi ? 'Admin: type FLT, exam MP Police।' : 'Admin: type FLT, MP Police exam.'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>

      {/* Paywall Modal */}
      <SyllabusLockModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
