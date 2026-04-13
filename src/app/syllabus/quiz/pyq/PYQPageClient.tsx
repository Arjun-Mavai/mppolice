'use client';

import React, { useEffect, useState, useTransition, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Brain, Calculator, FlaskConical } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { PYQCard } from './PYQCard';
import { SubjectSeriesDialog } from './SubjectSeriesDialog';
import { cn } from '@/lib/utils';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { QuizListItem } from '@/components/QuizListItem';
import { trackFbCustomEvent } from '@/lib/analytics/facebook-pixel';
import Link from 'next/link';
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
    nameHi: 'सामान्य ज्ञान',
    icon: BookOpen,
    color: 'amber' as const,
    description: 'Static GK, polity, economy, current affairs',
    descriptionHi: 'स्थिर GK, राजव्यवस्था, अर्थव्यवस्था, करंट',
  },
  {
    name: 'General Science',
    nameHi: 'सामान्य विज्ञान',
    icon: FlaskConical,
    color: 'emerald' as const,
    description: 'Physics, chemistry, biology',
    descriptionHi: 'भौतिकी, रसायन, जीव विज्ञान',
  },
  {
    name: 'Logical Reasoning',
    nameHi: 'तार्किक तर्कशक्ति',
    icon: Brain,
    color: 'blue' as const,
    description: 'Verbal & non-verbal reasoning',
    descriptionHi: 'मौखिक व अमौखिक तर्क',
  },
  {
    name: 'Quantitative Aptitude',
    nameHi: 'गणितीय व मानसिक योग्यता',
    icon: Calculator,
    color: 'pink' as const,
    description: 'Mental ability & arithmetic',
    descriptionHi: 'मानसिक क्षमता व अंकगणित',
  },
];

const BUCKET_PILLS: { id: UiBucket; labelEn: string; labelHi: string }[] = [
  { id: 'all', labelEn: 'All', labelHi: 'सभी' },
  { id: 'general_knowledge', labelEn: 'General Knowledge', labelHi: 'सामान्य ज्ञान' },
  { id: 'general_science', labelEn: 'General Science', labelHi: 'सामान्य विज्ञान' },
  { id: 'logical_reasoning', labelEn: 'Logical Reasoning', labelHi: 'तार्किक तर्क' },
  { id: 'quantitative_aptitude', labelEn: 'Quantitative Aptitude', labelHi: 'गणित / मानसिक' },
];

export default function PYQPageClient({
  initialTests,
  initialMockTests = [],
  subjectStats,
  isLoggedIn,
  mode: _mode,
  initialTab: _initialTab,
  initialBucket,
  initialCollection,
}: PYQPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  const [, startTransition] = useTransition();

  const [uiBucket, setUiBucket] = useState<UiBucket>(() => {
    const b = initialBucket || searchParams?.get('bucket');
    const ok = BUCKET_PILLS.some((p) => p.id === b);
    return ok && b ? (b as UiBucket) : 'all';
  });
  const [collection, setCollection] = useState(
    initialCollection || searchParams?.get('collection') || 'all'
  );

  const [loadingTestId, setLoadingTestId] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const collectionOptions = useMemo(() => {
    const merged = new Set<string>();
    extractCollectionsFromTests(initialTests).forEach((c) => merged.add(c));
    extractCollectionsFromTests(initialMockTests).forEach((c) => merged.add(c));
    return ['all', ...Array.from(merged)];
  }, [initialMockTests, initialTests]);

  const filteredPyqTests = useMemo(
    () =>
      initialTests.filter(
        (t) =>
          testMatchesUiBucket(t.tags, uiBucket) &&
          testMatchesCollection(t.tags, collection === 'all' ? null : collection)
      ),
    [initialTests, uiBucket, collection]
  );

  const filteredMockTests = useMemo(
    () =>
      initialMockTests.filter(
        (t) =>
          testMatchesUiBucket(t.tags, uiBucket) &&
          testMatchesCollection(t.tags, collection === 'all' ? null : collection)
      ),
    [initialMockTests, uiBucket, collection]
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
    (next: Partial<{ bucket: string; collection: string }>) => {
      const p = new URLSearchParams(searchParams?.toString() || '');
      p.delete('tab');
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
                  {hi ? 'MP Police — पेपर व टेस्ट सीरीज' : 'MP Police — Papers & test series'}
                </h1>
                <p className="text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
                  {hi
                    ? 'नीचे तीन अलग हिस्से: (1) पिछले वर्ष के 100 प्रश्न वाले पेपर, (2) फुल मॉक / सिलेबस टेस्ट, (3) विषय वाइज़ PYQ बैंक से मिश्रित अभ्यास।'
                    : 'Three blocks below: (1) previous-year 100-Q papers, (2) full mocks & syllabus-linked tests, (3) subject-wise mixed practice from the PYQ bank.'}
                </p>
              </div>
            </div>

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
                    ? 'फ़िल्टर: टैग में uiBucket / collection — एडमिन टेस्ट टैग से मैच।'
                    : 'Filters: uiBucket + collection tags on each test row from admin tagging.'}
                </li>
              </ul>
            </details>

            {/* Collections + 4-tab buckets */}
            <div className="mt-4 flex flex-col gap-3">
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
                      {c === 'all' ? (hi ? 'सभी' : 'All collections') : c}
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
                    {hi ? b.labelHi : b.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-6 sm:px-6 lg:px-8">
        {/* ── 1) Previous year papers (PYQ tests) ── */}
        <section className="space-y-3">
          <div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {hi ? 'पिछले वर्ष के पेपर (PYP)' : 'Previous year papers (PYP)'}
              </h2>
              <p className="text-xs text-slate-500 sm:text-sm">
                {hi
                  ? 'हर पंक्ति एक पूरा 100-प्रश्न वाला टेस्ट है; साल / मेमोरी टैग टाइटल से पता चलता है।'
                  : 'Each row is one full ~100-Q test in the database (type PYQ). Year / memory-style tags come from the title & admin tags.'}
              </p>
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              {filteredPyqTests.length}{' '}
              {hi ? 'पेपर' : 'papers'}
            </span>
          </div>
          <div className="space-y-4">
            {filteredPyqTests.map((test, idx) => {
              const pyqPrimary = hi ? test.title : test.titleEn || test.title;
              const pyqAlt = (hi ? test.titleEn?.trim() : test.title?.trim()) || '';
              const pyqSubtitle = [
                test.year != null ? String(test.year) : '',
                pyqAlt && pyqAlt !== pyqPrimary ? pyqAlt : '',
              ]
                .filter(Boolean)
                .join(' · ');
              return (
              <QuizListItem
                key={test.id}
                index={idx}
                title={pyqPrimary}
                subtitle={pyqSubtitle}
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
                onClick={() => handleTestLaunch(test, 'pyq', 'pyq_year')}
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
            );
            })}
            {filteredPyqTests.length === 0 && (
              <p className="py-10 text-center text-sm font-medium text-slate-400">
                {hi
                  ? 'इस फ़िल्टर पर कोई PYP टेस्ट नहीं।'
                  : 'No PYP tests for this filter.'}
              </p>
            )}
          </div>
        </section>

        {/* ── 2) Full mocks & syllabus tests ── */}
        <section className="space-y-3">
          <div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {hi ? 'फुल मॉक व सिलेबस टेस्ट' : 'Full mocks & syllabus tests'}
              </h2>
              <p className="text-xs text-slate-500 sm:text-sm">
                {hi
                  ? 'FLT / यूनिट / टॉपिक आदि — नवीनतम ऊपर; यहाँ साल ज़रूरी नहीं।'
                  : 'FLT, unit, topic, etc. — sorted by latest. Year is optional metadata, not the main label.'}
              </p>
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              {filteredMockTests.length} {hi ? 'टेस्ट' : 'tests'}
            </span>
          </div>
          <div className="space-y-4">
            {filteredMockTests.map((test, idx) => {
              const mockPrimary = hi ? test.title : test.titleEn || test.title;
              const mockAlt = (hi ? test.titleEn?.trim() : test.title?.trim()) || '';
              const mockMeta = hi
                ? `${test.totalQuestions ?? 0} प्रश्न · फुल / सिलेबस`
                : `${test.totalQuestions ?? 0} Q · Full / syllabus`;
              const mockSubtitle = [mockMeta, mockAlt && mockAlt !== mockPrimary ? mockAlt : '']
                .filter(Boolean)
                .join(' · ');
              return (
              <QuizListItem
                key={test.id}
                index={idx}
                title={mockPrimary}
                subtitle={mockSubtitle}
                questions={test.totalQuestions || undefined}
                itemLabel={hi ? 'प्रश्न' : 'Questions'}
                marks={(test.totalQuestions || 0) * QUIZ_CONSTANTS.MARKS_PER_QUESTION}
                duration={test.durationMinutes}
                isLocked={test.isLocked}
                isFree={test.isFree}
                attemptsLeft={test.attemptsLeft}
                maxAttempts={test.maxRetries}
                language={language}
                colorVariant={(['indigo', 'blue', 'emerald', 'amber', 'pink'] as const)[idx % 5]}
                isLoading={loadingTestId === test.id}
                onClick={() => handleTestLaunch(test, 'full', 'mock_series')}
                onMouseEnter={() => {
                  if (!test.isLocked) {
                    router.prefetch(`/syllabus/quiz/play?mode=full&testId=${test.id}`);
                  }
                }}
                onTouchStart={() => {
                  if (!test.isLocked) {
                    router.prefetch(`/syllabus/quiz/play?mode=full&testId=${test.id}`);
                  }
                }}
              />
            );
            })}
            {filteredMockTests.length === 0 && (
              <p className="py-10 text-center text-sm font-medium text-slate-400">
                {hi
                  ? 'इस फ़िल्टर पर कोई मॉक / सिलेबस टेस्ट नहीं।'
                  : 'No mock / syllabus tests for this filter.'}
              </p>
            )}
          </div>
        </section>

        {/* ── 3) Subject-wise PYQ bank practice ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {hi
                  ? 'विषय वाइज़ अभ्यास (PYQ बैंक)'
                  : 'Subject-wise practice (PYQ bank)'}
              </h2>
              <p className="max-w-2xl text-xs text-slate-600 sm:text-sm">
                {hi
                  ? 'कार्ड पर टैप → पार्ट चुनें। प्रश्न पुराने पेपरों से विषय टैग के हिसाब से मिलते हैं; टॉपिक-वार सूची के लिए इंटेलिजेंस हब खोलें।'
                  : 'Tap a card → pick a part. Questions are mixed from past papers by subject tag. For topic-level lists open the intelligence hub.'}
              </p>
            </div>
            {isLoggedIn && (
              <Link
                href="/syllabus/quiz/pyq/intelligence"
                className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 sm:text-sm"
              >
                {hi ? 'PYQ इंटेलिजेंस हब →' : 'PYQ intelligence hub →'}
              </Link>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECTS.map((sub) => (
              <div key={sub.name} className="flex flex-col gap-2">
                <PYQCard
                  title={hi ? sub.nameHi : sub.name}
                  count={subjectStats[sub.name] || 0}
                  icon={sub.icon}
                  color={sub.color}
                  onClick={() => handleSubjectClick(sub.name)}
                  delay={0}
                  description={hi ? sub.descriptionHi : sub.description}
                  subtitle={
                    (subjectStats[sub.name] || 0) > 0
                      ? `${subjectStats[sub.name]} ${hi ? 'प्रश्न' : 'questions'}`
                      : hi
                        ? 'जल्द आएगा'
                        : 'Coming soon'
                  }
                />
                {isLoggedIn && (subjectStats[sub.name] || 0) > 0 && (
                  <Link
                    href={`/syllabus/quiz/pyq/intelligence/questions?subject=${encodeURIComponent(sub.name)}&source=subject`}
                    className="text-center text-[11px] font-semibold text-slate-500 hover:text-indigo-600"
                  >
                    {hi ? 'इस विषय के प्रश्न ब्राउज़ करें' : 'Browse questions for this subject'}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Series Selection Dialog */}
      {selectedSubject && (
        <SubjectSeriesDialog
          isOpen={!!selectedSubject}
          onClose={() => setSelectedSubject(null)}
          subject={selectedSubject}
          titleOverride={(() => {
            const m = SUBJECTS.find((s) => s.name === selectedSubject);
            return m ? (hi ? m.nameHi : m.name) : selectedSubject;
          })()}
          totalQuestions={subjectStats[selectedSubject] || 0}
          onSelectSeries={handleSeriesSelect}
        />
      )}

      {/* Paywall Modal */}
      <SyllabusLockModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
