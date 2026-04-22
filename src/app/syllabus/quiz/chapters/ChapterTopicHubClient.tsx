'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSettingsStore } from '@/store/useSettingsStore';
import { toast } from 'sonner';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { getUserTier } from '@/lib/access-control';
import { trackFbCustomEvent } from '@/lib/analytics/facebook-pixel';
import { QuizListItem } from '@/components/QuizListItem';
import { cn } from '@/lib/utils';
import {
  CHAPTER_CATEGORY_PILLS,
  topicMatchesChapterFilter,
  type ChapterCategoryId,
} from '@/lib/mppolice/chapter-topic-category';
import { getSectionLabel } from '@/data/mppoliceSyllabus';

interface Topic {
  id: string;
  unitId: string;
  order: number;
  title: string;
  titleEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  testId?: string;
  isFree: boolean;
  isFreeAccess: boolean;
  isLiteAccess?: boolean;
  attemptsLeft: number | null;
  maxRetries: number | null;
}

interface ChapterTopicHubClientProps {
  initialDbData: Record<string, Topic[]>;
}

export default function ChapterTopicHubClient({ initialDbData }: ChapterTopicHubClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, user } = useSettingsStore();
  const hi = language === 'hi';

  const [paywallOpen, setPaywallOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const catParam = searchParams.get('cat') as ChapterCategoryId | null;
  const initialCat: ChapterCategoryId =
    catParam && CHAPTER_CATEGORY_PILLS.some((p) => p.id === catParam) ? catParam : 'all';

  const [chapterFilter, setChapterFilter] = useState<ChapterCategoryId>(initialCat);

  const setFilter = useCallback(
    (next: ChapterCategoryId) => {
      setChapterFilter(next);
      const p = new URLSearchParams(searchParams.toString());
      if (next === 'all') p.delete('cat');
      else p.set('cat', next);
      const q = p.toString();
      router.replace(q ? `/syllabus/quiz/chapters?${q}` : '/syllabus/quiz/chapters', {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (catParam && CHAPTER_CATEGORY_PILLS.some((p) => p.id === catParam)) {
      setChapterFilter(catParam);
    }
  }, [catParam]);

  const flatTopics = useMemo(() => {
    const rows: (Topic & { sectionOrder: number })[] = [];
    if (!initialDbData) return rows;
    for (const [unitId, topics] of Object.entries(initialDbData)) {
      const sectionOrder =
        unitId === 'sec_gk_reasoning' ? 1 : unitId === 'sec_mental_ability' ? 2 : unitId === 'sec_science_arithmetic' ? 3 : 9;
      for (const t of topics) {
        rows.push({ ...t, sectionOrder });
      }
    }
    return rows.sort((a, b) => {
      if (a.sectionOrder !== b.sectionOrder) return a.sectionOrder - b.sectionOrder;
      return a.order - b.order;
    });
  }, [initialDbData]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return flatTopics.filter((t) => {
      if (!topicMatchesChapterFilter(t, chapterFilter)) return false;
      if (!q) return true;
      const hay = `${t.title} ${t.titleEn || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [flatTopics, chapterFilter, searchQuery]);

  useEffect(() => {
    filtered.slice(0, 8).forEach((t) => {
      if (t.testId) {
        router.prefetch(`/syllabus/quiz/play?unitId=${t.unitId}&testId=${t.testId}`);
      }
    });
  }, [filtered, router]);

  const handleTopicClick = (topic: Topic & { sectionOrder: number }) => {
    const isAdmin = (user as { role?: string })?.role === 'admin';
    const effectiveTier = getUserTier(user);

    const hasAccess =
      isAdmin ||
      effectiveTier === 'pro' ||
      (effectiveTier === 'lite' && (topic.isLiteAccess || topic.isFreeAccess)) ||
      topic.isFreeAccess;

    if (!hasAccess) {
      setPaywallOpen(true);
      return;
    }

    if (topic.testId) {
      trackFbCustomEvent('test_started', {
        test_type: 'topic',
        test_name: topic.titleEn || topic.title,
        unit_id: topic.unitId,
        test_id: topic.testId,
      });
      router.push(`/syllabus/quiz/play?unitId=${topic.unitId}&testId=${topic.testId}`);
    } else {
      toast.error(hi ? 'टेस्ट जल्द आ रहा है' : 'Test coming soon!');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafbfc] pb-28 font-sans md:pb-20">
      <div className="pointer-events-none absolute top-0 left-0 h-[500px] w-full bg-gradient-to-b from-slate-100/30 to-transparent" />
      <div className="pointer-events-none absolute top-[-100px] right-[-100px] h-[500px] w-[500px] rounded-full bg-violet-50/40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[-150px] h-[400px] w-[400px] rounded-full bg-teal-50/25 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-8 sm:px-6 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-2 text-center"
        >
          <p className="text-[10px] font-black tracking-[0.25em] text-violet-600 uppercase">
            {hi ? 'अध्याय' : 'Chapters'}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {hi ? 'अध्यायवार टॉपिक टेस्ट' : 'Chapter-wise topic tests'}
          </h1>
          <p className="mx-auto max-w-lg text-sm font-medium text-slate-500">
            {hi
              ? 'साइंस, GK, तर्क, गणित, MP GK — जैसा फ्रंट पर दिखता है, वैसे ही फ़िल्टर।'
              : 'Same buckets as the app: Science, GK, Reasoning, Quant, MP GK — pick a strip, then a topic.'}
          </p>
        </motion.div>

        {/* Category pills — horizontal scroll on mobile */}
        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
          {CHAPTER_CATEGORY_PILLS.map((pill) => {
            const on = chapterFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setFilter(pill.id)}
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

        <div className="relative mx-auto mb-8 w-full max-w-md">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={hi ? 'टॉपिक खोजें…' : 'Search topics…'}
            className="h-12 rounded-2xl border-slate-200 bg-white/80 pl-12 text-xs font-semibold shadow-sm backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-3 pb-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((topic, index) => {
              const isAdmin = (user as { role?: string })?.role === 'admin';
              const effectiveTier = getUserTier(user);
              const hasAccess =
                isAdmin ||
                effectiveTier === 'pro' ||
                (effectiveTier === 'lite' && (topic.isLiteAccess || topic.isFreeAccess)) ||
                topic.isFreeAccess;
              const isLocked = !hasAccess;

              const unitLabel = getSectionLabel(topic.unitId, hi ? 'hi' : 'en');
              const primaryTitle = hi ? topic.title : topic.titleEn || topic.title;
              const altLine = (hi ? topic.titleEn?.trim() : topic.title?.trim()) || '';
              const cardSubtitle = [unitLabel, altLine && altLine !== primaryTitle ? altLine : '']
                .filter(Boolean)
                .join(' · ');

              return (
                <QuizListItem
                  key={`${topic.unitId}-${topic.id}`}
                  index={index}
                  title={primaryTitle}
                  subtitle={cardSubtitle}
                  questions={10}
                  itemLabel={hi ? 'प्रश्न' : 'Questions'}
                  isLocked={isLocked}
                  isFree={topic.isFree}
                  attemptsLeft={topic.attemptsLeft}
                  maxAttempts={topic.maxRetries}
                  language={language}
                  colorVariant={
                    (['amber', 'emerald', 'pink', 'blue', 'indigo'] as const)[index % 5]
                  }
                  isLoading={loadingId === topic.id}
                  onClick={() => {
                    if (!isLocked) setLoadingId(topic.id);
                    handleTopicClick(topic);
                  }}
                  onMouseEnter={() => {
                    if (!isLocked && topic.testId) {
                      router.prefetch(
                        `/syllabus/quiz/play?unitId=${topic.unitId}&testId=${topic.testId}`
                      );
                    }
                  }}
                  onTouchStart={() => {
                    if (!isLocked && topic.testId) {
                      router.prefetch(
                        `/syllabus/quiz/play?unitId=${topic.unitId}&testId=${topic.testId}`
                      );
                    }
                  }}
                />
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
              <p className="font-semibold text-slate-700">
                {hi ? 'इस फ़िल्टर में कोई टॉपिक नहीं' : 'No topics in this filter'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {hi ? '“सभी” पर जाओ या सर्च बदलो।' : 'Try “All” or adjust search.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <SyllabusLockModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
