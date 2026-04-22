'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { UiBucket } from '@/lib/mppolice/syllabus-types';
import { parseUiBucketFromTags } from '@/data/mppoliceSyllabus';
import { QuizListItem } from '@/components/QuizListItem';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { Button } from '@/components/ui/button';

const BUCKET_PILLS: { id: UiBucket; labelEn: string; labelHi: string }[] = [
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
  const [, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const bucketQuery = searchParams.get('bucket');
  const [uiBucket, setUiBucket] = useState<UiBucket>(() => {
    const ok = BUCKET_PILLS.some((p) => p.id === bucketQuery);
    return ok && bucketQuery ? (bucketQuery as UiBucket) : 'all';
  });

  const handleBucketChange = useCallback(
    (next: UiBucket) => {
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

  const filteredMisc = useMemo(() => {
    if (uiBucket === 'all') return miscTests;
    return miscTests.filter((t) => {
      const tags = Array.isArray(t.tags) ? (t.tags as unknown[]) : [];
      return tags.some((x) => String(x) === `ui_bucket:${uiBucket}`);
    });
  }, [miscTests, uiBucket]);

  const pillLabel = (id: UiBucket) => BUCKET_PILLS.find((p) => p.id === id)?.[hi ? 'labelHi' : 'labelEn'] ?? id;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafbfc] pb-28 font-sans md:pb-20">
      <div className="pointer-events-none absolute top-0 left-0 h-[500px] w-full bg-gradient-to-b from-slate-100/30 to-transparent" />
      <div className="pointer-events-none absolute top-[-100px] right-[-100px] h-[500px] w-[500px] rounded-full bg-violet-50/40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[-150px] h-[400px] w-[400px] rounded-full bg-teal-50/25 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-8 sm:px-6 md:pt-8">
        <div className="mb-6 flex items-start gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="-ml-2 h-9 w-9 shrink-0 rounded-full px-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
            {hi ? 'विषयवार अभ्यास' : 'Subject-wise practice'}
          </h1>
          <p className="mx-auto max-w-lg text-sm font-medium text-slate-500">
            {hi
              ? 'नीचे की सूची अध्याय वाले पेज जैसी है — स्ट्रिप से विषय चुनो। टाइप MISC (एडमिन अपलोड)।'
              : 'Same list layout as chapter-wise topic tests — pick a subject strip. Tests are type MISC from Admin.'}
          </p>
        </motion.div>

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
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                )}
              >
                {hi ? pill.labelHi : pill.labelEn}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {hi ? 'विषयवार क्विज़' : 'Subject-wise quizzes'}
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm">
              {hi
                ? `स्ट्रिप: ${pillLabel(uiBucket)} · \`ui_bucket:\` टैग से मैच`
                : `Strip: ${pillLabel(uiBucket)} · matches \`ui_bucket:\` tags`}
            </p>
          </div>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            {filteredMisc.length} {hi ? 'क्विज़' : 'quizzes'}
          </span>
        </div>

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
                const bucket = parseUiBucketFromTags(t.tags);
                const bucketLine =
                  bucket && bucket !== 'all'
                    ? hi
                      ? BUCKET_PILLS.find((p) => p.id === bucket)?.labelHi
                      : BUCKET_PILLS.find((p) => p.id === bucket)?.labelEn
                    : null;
                const subtitle = [
                  bucketLine,
                  hi ? `${t.totalQuestions} प्रश्न` : `${t.totalQuestions} Q`,
                  alt && alt !== primary ? alt : '',
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <QuizListItem
                    key={t.id}
                    index={idx}
                    title={primary}
                    subtitle={subtitle}
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
                      if (t.isLocked) return;
                      setLoadingId(t.id);
                      startTransition(() => {
                        router.push(`/syllabus/quiz/play?mode=full&testId=${t.id}`);
                      });
                    }}
                    onMouseEnter={() => {
                      if (!t.isLocked) {
                        router.prefetch(`/syllabus/quiz/play?mode=full&testId=${t.id}`);
                      }
                    }}
                    onTouchStart={() => {
                      if (!t.isLocked) {
                        router.prefetch(`/syllabus/quiz/play?mode=full&testId=${t.id}`);
                      }
                    }}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>

          {filteredMisc.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
              <p className="font-semibold text-slate-700">
                {hi ? 'इस स्ट्रिप में कोई क्विज़ नहीं' : 'No quizzes for this strip'}
              </p>
              <p className="mt-1 px-4 text-xs text-slate-500">
                {hi
                  ? 'एडमिन में MISC अपलोड करें और Subject strip / `ui_bucket:` टैग सेट करें।'
                  : 'Upload MISC tests in Admin and set the subject strip / `ui_bucket:` tag.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
