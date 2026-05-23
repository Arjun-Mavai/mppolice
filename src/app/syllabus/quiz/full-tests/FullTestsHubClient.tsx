'use client';

// 🚀 Full Tests Hub Client - Subject-wise Tests Explorer
// Bhai, ye component saare tests ki filtering aur navigation handle karta h.
// Lightning fast feel ke liye humne prefetching aur transition states use ki h.

import { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { QuizListItem } from '@/components/QuizListItem';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { Button } from '@/components/ui/button';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';

// 💊 Bucket Pills: Subject filter ke liye buttons
const BUCKET_PILLS: { id: string; labelEn: string; labelHi: string }[] = [
  { id: 'all', labelEn: 'All', labelHi: 'सभी' },
  { id: 'general_knowledge', labelEn: 'GK', labelHi: 'GK' },
  { id: 'general_science', labelEn: 'GS', labelHi: 'GS' },
  { id: 'logical_reasoning', labelEn: 'Reasoning', labelHi: 'तर्क' },
  { id: 'quantitative_aptitude', labelEn: 'Quant', labelHi: 'गणित' },
  { id: 'mp_general_knowledge', labelEn: 'MP GK', labelHi: 'MP GK' },
];

interface MiscTestRow {
  id: string;
  title: string;
  titleEn?: string | null;
  slug: string;
  totalQuestions: number;
  durationMinutes: number;
  isLocked: boolean;
  isFree: boolean;
  attemptsLeft: number | null;
  maxRetries: number | null;
  tags?: unknown;
}

interface FullTestsHubClientProps {
  miscTests: MiscTestRow[];
}

export default function FullTestsHubClient({ miscTests }: FullTestsHubClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  
  // 🏎️ useTransition: Navigation ke waqt UI ko responsive rakhne ke liye
  const [, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Filter state directly from URL for shareability
  const bucketQuery = searchParams.get('bucket') || 'all';
  const [uiBucket, setUiBucket] = useState<string>(bucketQuery);

  const handleBucketChange = useCallback(
    (next: string) => {
      setUiBucket(next);
      const p = new URLSearchParams(searchParams.toString());
      if (next === 'all') p.delete('bucket');
      else p.set('bucket', next);
      
      const qs = p.toString();
      router.replace(qs ? `/syllabus/quiz/full-tests?${qs}` : '/syllabus/quiz/full-tests', {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  // 🏎️ useMemo: Filtering logic heavy na ho, isliye memoize kiya h.
  const filteredMisc = useMemo(() => {
    if (uiBucket === 'all') return miscTests;
    return miscTests.filter((t) => {
      const tags = Array.isArray(t.tags) ? (t.tags as unknown[]) : [];
      return tags.some((x) => String(x) === `ui_bucket:${uiBucket}`);
    });
  }, [miscTests, uiBucket]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafbfc] pb-28 font-sans md:pb-20">
      {/* 🎭 Decorative Backgrounds */}
      <div className="pointer-events-none absolute top-0 left-0 h-[500px] w-full bg-gradient-to-b from-slate-100/30 to-transparent" />
      <div className="pointer-events-none absolute top-[-100px] right-[-100px] h-[500px] w-[500px] rounded-full bg-violet-50/40 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-8 sm:px-6 md:pt-8">
        <div className="mb-6 flex items-start gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="-ml-2 h-9 w-9 shrink-0 rounded-full px-0 text-slate-500 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-2 text-center"
        >
          <p className="text-[10px] font-black tracking-[0.25em] text-violet-600 uppercase">
            {hi ? 'विषयवार' : 'Subject-wise'}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {hi ? 'विषयवार अभ्यास' : 'Subject-wise Practice'}
          </h1>
        </motion.div>

        {/* 💊 Horizontal Scrollable Filters */}
        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
          {BUCKET_PILLS.map((pill) => {
            const on = uiBucket === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handleBucketChange(pill.id)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-[11px] font-black tracking-wide uppercase transition-all',
                  on
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                )}
              >
                {hi ? pill.labelHi : pill.labelEn}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            {filteredMisc.length} {hi ? 'क्विज़' : 'Quizzes'} Available
          </span>
        </div>

        {/* 📋 Test List: Bhai yaha se navigation lightning fast h prefetch ki wajah se */}
        <div className="space-y-3 pb-4 pt-4">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={uiBucket}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {filteredMisc.map((t, idx) => {
                const primary = hi ? t.title : t.titleEn || t.title;
                const alt = (hi ? t.titleEn?.trim() : t.title?.trim()) || '';
                
                return (
                  <QuizListItem
                    key={t.id}
                    index={idx}
                    title={primary}
                    subtitle={[
                      hi ? `${t.totalQuestions} प्रश्न` : `${t.totalQuestions} Questions`,
                      alt && alt !== primary ? alt : '',
                    ].filter(Boolean).join(' · ')}
                    questions={t.totalQuestions}
                    itemLabel={hi ? 'प्रश्न' : 'Questions'}
                    marks={t.totalQuestions * QUIZ_CONSTANTS.MARKS_PER_QUESTION}
                    duration={t.durationMinutes}
                    isLocked={t.isLocked}
                    isFree={t.isFree}
                    attemptsLeft={t.attemptsLeft ?? undefined}
                    maxAttempts={t.maxRetries ?? undefined}
                    language={language}
                    colorVariant={(['amber', 'emerald', 'pink', 'blue', 'indigo'] as const)[idx % 5]}
                    isLoading={loadingId === t.id}
                    onClick={() => {
                      if (t.isLocked) {
                        setPaywallOpen(true);
                        return;
                      }
                      setLoadingId(t.id);
                      // 🏎️ startTransition: Screen change ke waqt UI freeze nahi hogi.
                      startTransition(() => {
                        router.push(`/syllabus/quiz/play?mode=full&testId=${t.id}`);
                      });
                    }}
                    // 🏎️ PREFETCH: Hover karte hi Next.js page data download kar lega!
                    onMouseEnter={() => {
                      if (!t.isLocked) router.prefetch(`/syllabus/quiz/play?mode=full&testId=${t.id}`);
                    }}
                    onTouchStart={() => {
                      if (!t.isLocked) router.prefetch(`/syllabus/quiz/play?mode=full&testId=${t.id}`);
                    }}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>

          {filteredMisc.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
              <p className="font-semibold text-slate-700">
                {hi ? 'इस कैटेगरी में कोई टेस्ट नहीं है' : 'No tests in this category'}
              </p>
            </div>
          )}
        </div>
      </div>

      <SyllabusLockModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
