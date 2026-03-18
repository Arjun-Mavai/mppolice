'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  BookOpenText,
  Brain,
  Lightbulb,
  ShieldAlert,
  BarChart3,
  Target,
  ListChecks,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  PyqFactItem,
  PyqInsightsCoverageSummary,
  PyqInsightSubjectItem,
  PyqInsightTopicItem,
  PyqTopicDeepLearning,
} from '@/features/tests/actions/pyq-insights';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

const VARIANTS = {
  blue: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    icon: 'text-slate-500',
    border: 'border-slate-200',
    shadow: 'shadow-slate-200/40',
  },
  pink: {
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    icon: 'text-pink-400',
    border: 'border-pink-100',
    shadow: 'shadow-pink-200/40',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    icon: 'text-emerald-400',
    border: 'border-emerald-100',
    shadow: 'shadow-emerald-200/40',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    icon: 'text-amber-400',
    border: 'border-amber-100',
    shadow: 'shadow-amber-200/40',
  },
};

interface PYQFactsClientProps {
  subjects: PyqInsightSubjectItem[];
  topics: PyqInsightTopicItem[];
  viewMode: 'subject' | 'year';
  selectedYear?: number;
  selectedSubject: string;
  selectedTopic?: string;
  limit: number;
  facts: PyqFactItem[];
  coverage: PyqInsightsCoverageSummary;
  yearOptions: number[];
}

const LIMIT_OPTIONS = [30, 50, 100, 200];

const formatTestTitle = (title: string, isHindi: boolean) => {
  if (!title) return '';
  const yearMatch = title.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : '';
  const titleLower = title.toLowerCase();

  if (
    titleLower.includes('प्रारंभिक') ||
    titleLower.includes('prelims') ||
    titleLower.includes('pre')
  ) {
    return isHindi ? `MPPSC Pre ${year}` : `MPPSC Pre ${year}`;
  }
  if (titleLower.includes('मुख्य') || titleLower.includes('mains')) {
    return isHindi ? `MPPSC Mains ${year}` : `MPPSC Mains ${year}`;
  }
  return title; // fallback
};

export default function PYQFactsClient({
  subjects,
  topics,
  viewMode,
  selectedYear,
  selectedSubject,
  selectedTopic,
  limit,
  facts,
  coverage,
  yearOptions,
}: PYQFactsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';

  const topicNameMap = useMemo(
    () =>
      new Map(
        topics.map((topic) => [
          topic.topicSlug,
          {
            title: topic.topicTitle,
            count: topic.factCount,
          },
        ])
      ),
    [topics]
  );

  const activeTopic = useMemo(() => {
    if (selectedTopic && selectedTopic !== 'all') {
      return topics.find((t) => t.topicSlug === selectedTopic);
    }
    return undefined;
  }, [selectedTopic, topics]);

  const deepLearning = activeTopic?.aiContent;

  const searchParams = useSearchParams();
  const applyFilters = (subject: string, topic?: string, year?: number, nextLimit = limit) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Always reset page on filter change
    params.delete('page');

    if (subject) params.set('subject', subject);
    
    if (topic && topic !== 'all') {
      params.set('topic', topic);
    } else {
      params.delete('topic');
    }
    
    if (year !== undefined && year !== 0) {
      params.set('year', String(year));
    } else {
      params.delete('year');
    }
    
    params.set('limit', String(nextLimit));
    
    // Optimize: Use replace instead of push for filter updates to avoid history pollution
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-8">
        
        {/* Info Banner */}
        <div className="mb-8 rounded-[1.5rem] bg-slate-50/50 border border-slate-200 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
            <ShieldAlert className="h-4 w-4" />
            {isHindi ? 'परीक्षा इंटेलिजेंस मोड' : 'Exam Intelligence Mode'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {isHindi
              ? 'यह curated PYQ data high-yield revision के लिए optimized है — पहले इन्हें याद करें, फिर practice करें।'
              : 'This curated PYQ data is optimized for high-yield revision — memorize first, then practice.'}
          </p>
        </div>

        {/* Header Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5 flex-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">PYQ Facts Library</h1>
              <p className="max-w-xl text-sm font-medium text-slate-500 leading-relaxed">
                {isHindi
                  ? 'MPPSC पैटर्न को high-yield facts, memory tricks और trap alerts के साथ master करें।'
                  : 'Master MPPSC patterns with high-yield facts, mnemonics, and trap alerts.'}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/syllabus/quiz/pyq/analysis')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 h-auto w-full sm:w-auto"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {isHindi ? 'टॉपिक विश्लेषण देखें' : 'View Topic Analysis'}
            </Button>
          </div>

          <div className="mt-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Subject Select */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-2 px-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                  {isHindi ? 'विषय' : 'Subject'}
                </label>
                <Select value={selectedSubject} onValueChange={(val) => applyFilters(val, undefined, selectedYear)}>
                  <SelectTrigger className="w-full bg-white border-slate-200 shadow-sm rounded-2xl h-14 font-bold text-slate-700 hover:border-indigo-200 transition-all">
                    <SelectValue placeholder={isHindi ? 'विषय चुनें' : 'Select Subject'} />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper" 
                    sideOffset={4}
                    className="z-[100] rounded-2xl max-h-[350px] overflow-y-auto bg-white border border-slate-200 shadow-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent"
                  >
                    {subjects.map((s) => (
                      <SelectItem key={s.subject} value={s.subject} className="font-semibold py-3 text-slate-700 cursor-pointer">
                        {s.subject} ({s.factCount} PYQ)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Topic Select */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-2 px-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  {isHindi ? 'टॉपिक' : 'Topic'}
                </label>
                <Select value={selectedTopic || 'all'} onValueChange={(val) => applyFilters(selectedSubject, val === 'all' ? undefined : val, selectedYear)}>
                  <SelectTrigger className="w-full bg-white border-slate-200 shadow-sm rounded-2xl h-14 font-bold text-slate-700 hover:border-emerald-200 transition-all">
                    <SelectValue placeholder={isHindi ? 'सभी टॉपिक' : 'All Topics'} />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper" 
                    sideOffset={4}
                    className="z-[100] rounded-2xl max-h-[350px] overflow-y-auto bg-white border border-slate-200 shadow-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent"
                  >
                    <SelectItem value="all" className="font-semibold py-3 cursor-pointer">{isHindi ? 'सभी टॉपिक' : 'All Topics'}</SelectItem>
                    {topics.map((t) => (
                      <SelectItem key={t.topicSlug} value={t.topicSlug} className="font-semibold py-3 cursor-pointer">
                        {isHindi ? t.topicTitle : t.topicTitleEn || t.topicTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Select */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-2 px-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500"></span>
                  {isHindi ? 'वर्ष' : 'Year'}
                </label>
                <Select value={selectedYear ? String(selectedYear) : 'all'} onValueChange={(val) => applyFilters(selectedSubject, selectedTopic, val === 'all' ? 0 : Number(val))}>
                  <SelectTrigger className="w-full bg-white border-slate-200 shadow-sm rounded-2xl h-14 font-bold text-slate-700 hover:border-pink-200 transition-all">
                    <SelectValue placeholder={isHindi ? 'सभी वर्ष' : 'All Years'} />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper" 
                    sideOffset={4}
                    className="z-[100] rounded-2xl max-h-[350px] overflow-y-auto bg-white border border-slate-200 shadow-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent"
                  >
                    <SelectItem value="all" className="font-semibold py-3 cursor-pointer">{isHindi ? 'सभी वर्ष' : 'All Years'}</SelectItem>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)} className="font-semibold py-3 cursor-pointer">
                        {y} Exam
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Limit Selector & Stats */}
          <div className="mt-8 flex flex-col gap-4 border-t border-slate-100/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-emerald-100 bg-emerald-50/50 px-2.5 py-1 font-semibold text-emerald-700"
              >
                {isHindi
                  ? `डेटासेट: ${coverage.fromYear}-${coverage.toYear}`
                  : `Dataset: ${coverage.fromYear}-${coverage.toYear}`}
              </Badge>
              <Badge
                variant="outline"
                className="border-amber-100 bg-amber-50/50 px-2.5 py-1 font-semibold text-amber-700"
              >
                {isHindi
                  ? `कुल PYQ: ${coverage.pyqQuestionCount}`
                  : `Total PYQ: ${coverage.pyqQuestionCount}`}
              </Badge>
              <Badge
                variant="outline"
                className="border-blue-100 bg-blue-50/50 px-2.5 py-1 font-semibold text-blue-700"
              >
                {isHindi
                  ? `कवर हुए प्रश्न: ${coverage.mappedQuestionCount} (${coverage.mappingCoveragePercent}%)`
                  : `Questions Mapped: ${coverage.mappedQuestionCount} (${coverage.mappingCoveragePercent}%)`}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                {isHindi ? `दिख रहे facts: ${facts.length}` : `Showing ${facts.length} facts`}
              </span>
              <div className="flex gap-1.5 rounded-lg border border-slate-100 bg-slate-50 p-1">
                {LIMIT_OPTIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => applyFilters(selectedSubject, selectedTopic, selectedYear, item)}
                    className={`rounded-md px-2.5 py-1 text-xs font-black transition-colors ${
                      limit === item
                        ? 'border border-slate-200/60 bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Deep Learning CTA (Empty State) */}
        {!deepLearning && topics.length > 0 && (
          <div className="animate-in fade-in zoom-in-95 mt-4 mb-8 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center duration-500">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-900 shadow-sm ring-4 ring-white">
              <Brain className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-lg font-black text-slate-900">
              {isHindi ? 'Deep Learning इनसाइट्स अनलॉक करें' : 'Unlock Deep Learning Insights'}
            </h3>
            <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed font-medium text-slate-500">
              {isHindi
                ? 'Concept Capsules, Must-Know Lists और Practice Prompts देखने के लिए ऊपर से कोई एक टॉपिक चुनें।'
                : 'Select a specific topic to access premium Concept Capsules, Must-Know Lists, and Practice Prompts.'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {topics.slice(0, 3).map((topic) => (
                <button
                  key={topic.topicSlug}
                  onClick={() => applyFilters(selectedSubject, topic.topicSlug, selectedYear)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-black"
                >
                  {isHindi ? topic.topicTitle : topic.topicTitleEn || topic.topicTitle}
                </button>
              ))}
              {topics.length > 3 && (
                <span className="inline-flex items-center justify-center px-2 text-xs font-bold text-slate-400">
                  +{topics.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Deep Learning Hero Section */}
        {deepLearning && (
          <div className="animate-in fade-in slide-in-from-bottom-4 mt-4 mb-8 space-y-6 duration-700">
            <div className="flex items-center gap-2 px-2">
              <div className="h-0.5 flex-1 rounded-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
              <span className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                {isHindi ? 'मुख्य इनसाइट्स' : 'Key Insights'}
              </span>
              <div className="h-0.5 flex-1 rounded-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-12">
              {/* Left Column: Concept Capsule & Practice Prompts */}
              <div className="flex flex-col gap-6 lg:col-span-5">
                {/* Concept Capsule - Elite Glass Style */}
                {(deepLearning.concept_capsule || deepLearning.concept_capsule_en) && (
                  <div
                    className={cn(
                      'group relative overflow-hidden rounded-[2.5rem] border p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl',
                      VARIANTS.blue.bg.replace('bg-', 'bg-opacity-50'),
                      VARIANTS.blue.border
                    )}
                  >
                    <div className="absolute top-0 left-0 h-1 w-full bg-blue-500 opacity-80" />
                    <h3 className="mb-4 flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase">
                      <Target className="h-4 w-4 text-blue-500" />{' '}
                      {isHindi ? 'कांसेप्ट कैप्सूल' : 'Concept Capsule'}
                    </h3>
                    <ul className="space-y-3.5 text-[15px] leading-relaxed font-bold tracking-wide text-slate-800 [text-shadow:1px_1px_2px_rgba(0,0,0,0.4)] sm:text-[17px] lg:text-[19px] 2xl:text-[21px]">
                      {(isHindi
                        ? deepLearning.concept_capsule
                        : deepLearning.concept_capsule_en || deepLearning.concept_capsule
                      )
                        ?.split(/\n+/)
                        ?.flatMap((text) => text.split(/(?<=[.|।])\s+/))
                        .filter((p) => p.trim().length > 5)
                        .map((point, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 rounded-2xl border border-blue-100/50 bg-white/60 p-3 shadow-sm"
                          >
                            <span className="mt-2.5 flex h-2 w-2 shrink-0 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                            <span className="flex-1">
                              {point.trim() + (point.trim().endsWith('.') ? '' : '.')}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Active Recall - Glassy Emerald */}
                {deepLearning.practice_prompts && deepLearning.practice_prompts.length > 0 && (
                  <div className="rounded-[2.5rem] border border-emerald-100 bg-emerald-50/50 p-5 shadow-xl backdrop-blur-md">
                    <h4 className="mb-4 flex items-center gap-2 text-xs font-black tracking-widest text-emerald-600 uppercase">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      </span>
                      {isHindi ? 'एक्टिव रीकॉल' : 'Active Recall'}
                    </h4>
                    <ul className="space-y-3">
                      {(isHindi
                        ? deepLearning.practice_prompts
                        : deepLearning.practice_prompts_en || deepLearning.practice_prompts
                      ).map((prompt, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-3.5 text-[14px] leading-relaxed font-bold text-emerald-900 shadow-sm sm:text-[16px]"
                        >
                          <span className="mt-1 shrink-0 text-emerald-500">❖</span>
                          <span>{prompt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: Must Know Lists */}
              <div className="lg:col-span-7">
                {deepLearning.must_know_lists && deepLearning.must_know_lists.length > 0 && (
                  <div className="grid h-full gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {deepLearning.must_know_lists.map((list, idx) => {
                      const variants = ['blue', 'pink', 'emerald', 'amber'] as const;
                      const color = VARIANTS[variants[idx % 4]];

                      return (
                        <div
                          key={idx}
                          className={cn(
                            'group relative flex flex-col overflow-hidden rounded-[2.5rem] border bg-white/70 p-5 shadow-xl backdrop-blur-md transition-all hover:bg-white hover:shadow-2xl',
                            color.border,
                            color.shadow
                          )}
                        >
                          <h4 className="mb-4 flex items-center gap-3 text-[15px] leading-tight font-black tracking-wide text-slate-800 [text-shadow:1px_1px_2px_rgba(0,0,0,0.4)] sm:text-[17px]">
                            <div
                              className={cn(
                                'rounded-xl border border-slate-100 bg-white p-2 shadow-sm transition-transform group-hover:scale-110',
                                color.text
                              )}
                            >
                              <ListChecks className="h-5 w-5" />
                            </div>
                            {isHindi ? list.list_title : list.list_title_en || list.list_title}
                          </h4>

                          <ul className="mb-5 flex-grow space-y-3">
                            {(isHindi ? list.items : list.items_en || list.items).map((item, i) => (
                              <li
                                key={i}
                                className={`flex items-start gap-3 text-[14px] leading-relaxed font-bold tracking-wide text-slate-700 [text-shadow:1px_1px_2px_rgba(0,0,0,0.1)] sm:text-[16px]`}
                              >
                                <span
                                  className={cn(
                                    `mt-2 flex h-2 w-2 shrink-0 rounded-full shadow-sm transition-colors`,
                                    color.bg.replace('50', '500')
                                  )}
                                ></span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>

                          {(list.memory_hook || list.memory_hook_en) && (
                            <div
                              className={cn(
                                'relative mt-auto overflow-hidden rounded-[1.25rem] border p-4 transition-all duration-500',
                                color.bg.replace('50', '50/70'),
                                color.border
                              )}
                            >
                              <span
                                className={cn(
                                  'mb-2 flex items-center gap-2 text-xs font-black tracking-widest uppercase',
                                  color.text
                                )}
                              >
                                <Lightbulb className="h-3.5 w-3.5" />{' '}
                                {isHindi ? 'याद रखने की ट्रिक' : 'Memory Hook'}
                              </span>
                              <span
                                className={cn(
                                  'block text-[14px] leading-relaxed font-bold tracking-wide sm:text-[15px]',
                                  color.text.replace('600', '900')
                                )}
                              >
                                {isHindi
                                  ? list.memory_hook
                                  : list.memory_hook_en || list.memory_hook}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Facts Feed */}
        <div className="space-y-6">
          {facts.map((fact, idx) => {
            const variants = ['blue', 'pink', 'emerald', 'amber'] as const;
            const color = VARIANTS[variants[idx % 4]];
            const dotColor = color.bg.replace('50', '500');

            return (
              <div
                key={fact.id}
                className={cn(
                  'group relative overflow-hidden rounded-[2rem] border bg-white/70 backdrop-blur-md transition-all duration-500 hover:bg-white hover:shadow-2xl',
                  color.border,
                  color.shadow
                )}
              >
                <div className={cn('absolute top-0 left-0 h-full w-1.5 opacity-40', dotColor)} />

                {/* Card Header: Metadata Badges */}
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-2 border-b px-6 py-4',
                    color.bg.replace('50', '50/30'),
                    color.border.replace('100', '100/20')
                  )}
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      'px-3 py-1 font-bold shadow-sm transition-colors',
                      color.border,
                      color.text,
                      color.bg
                    )}
                  >
                    {isHindi ? fact.topicTitle : fact.topicTitleEn || fact.topicTitle}
                  </Badge>
                  {fact.tags?.map((tag, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-slate-100/50 px-2.5 py-1 font-semibold text-slate-500"
                    >
                      #{tag}
                    </Badge>
                  ))}
                  {fact.importanceScore && fact.importanceScore > 8 && (
                    <Badge className="ml-auto border-rose-100 bg-rose-50 px-3 py-1 font-bold text-rose-600 shadow-sm hover:bg-rose-100">
                      🔥 {isHindi ? 'High Yield' : 'High Yield'}
                    </Badge>
                  )}
                  {!fact.importanceScore && (
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-slate-100 px-3 py-1 font-bold text-slate-600 shadow-sm"
                    >
                      {isHindi ? 'रीविजन' : 'Revision'}
                    </Badge>
                  )}
                </div>

                <div className="space-y-7 p-5 sm:p-8">
                  {/* Main Fact */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase">
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] shadow-inner',
                          color.bg,
                          color.border
                        )}
                      >
                        🎯
                      </div>
                      {isHindi ? 'महत्वपूर्ण तथ्य' : 'Core Fact'}
                    </h3>
                    <div className="text-[16px] leading-relaxed font-extrabold tracking-wide whitespace-pre-line text-slate-800 [text-shadow:1px_1px_2px_rgba(0,0,0,0.4)] sm:text-[18px] sm:leading-loose md:text-[20px] lg:text-[22px]">
                      {isHindi ? fact.factText : fact.factTextEn || fact.factText}
                    </div>
                  </div>

                  {/* Mnemonics / Memory Tips */}
                  {fact.memoryTip && (
                    <div
                      className={cn(
                        'relative overflow-hidden rounded-[1.5rem] border p-5 transition-all duration-500 sm:p-6',
                        color.bg.replace('50', '50/40'),
                        color.border
                      )}
                    >
                      <div
                        className={cn(
                          'absolute -top-6 -right-6 text-6xl opacity-10 select-none',
                          color.text
                        )}
                      >
                        🧠
                      </div>
                      <h4
                        className={cn(
                          'mb-3 flex items-center gap-2 text-xs font-black tracking-widest uppercase',
                          color.text
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] shadow-sm',
                            color.bg,
                            color.border
                          )}
                        >
                          🧠
                        </span>
                        {isHindi ? 'स्मृति युक्ति' : 'Memory Trick'}
                      </h4>
                      <p className="relative z-10 text-[15px] leading-relaxed font-bold tracking-wide whitespace-pre-line text-slate-900 sm:text-[17px] sm:leading-loose md:text-[19px]">
                        {isHindi ? fact.memoryTip : fact.memoryTipEn || fact.memoryTip}
                      </p>
                    </div>
                  )}

                  {/* Scam / Trap Alert */}
                  {fact.scamAlert && (
                    <div className="relative overflow-hidden rounded-[1.5rem] border border-rose-100/50 bg-rose-50/70 p-5 sm:p-6">
                      <div className="absolute -top-6 -right-6 text-6xl text-rose-500 opacity-10 select-none">
                        ⚠️
                      </div>
                      <h4 className="mb-3 flex items-center gap-2 text-xs font-black tracking-widest text-rose-600 uppercase">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[11px] shadow-sm">
                          ⚠️
                        </span>
                        {isHindi ? 'गलतियों से बचें' : 'Trap Alert'}
                      </h4>
                      <p className="relative z-10 text-[15px] leading-relaxed font-bold tracking-wide whitespace-pre-line text-rose-950 [text-shadow:1px_1px_2px_rgba(244,63,94,0.3)] sm:text-[17px] sm:leading-loose md:text-[19px]">
                        {isHindi ? fact.scamAlert : fact.scamAlertEn || fact.scamAlert}
                      </p>
                    </div>
                  )}

                  {/* References Footer */}
                  <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-50 pt-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      <Lightbulb className="h-3.5 w-3.5" /> {isHindi ? 'पूछा गया:' : 'Asked in:'}
                    </span>

                    {fact.enrichedRefs && fact.enrichedRefs.length > 0
                      ? fact.enrichedRefs.map((ref, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className={cn(
                              'border bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600 shadow-none transition-colors hover:bg-slate-50',
                              color.border
                            )}
                          >
                            {formatTestTitle(
                              isHindi ? ref.testTitle : ref.testTitleEn || ref.testTitle,
                              isHindi
                            )}
                            {ref.questionOrder && (
                              <span className="ml-1 opacity-70">Q.{ref.questionOrder}</span>
                            )}
                          </Badge>
                        ))
                      : fact.pyqRefs.map((ref, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className={cn(
                              'border bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600 shadow-none transition-colors hover:bg-slate-50',
                              color.border
                            )}
                          >
                            {ref.year ? `MPPSC ${ref.year}` : `PYQ ${ref.year ?? ''}`}
                          </Badge>
                        ))}
                  </div>
                </div>
              </div>
            );
          })}

          {facts.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
              <div className="mb-4 rounded-full border border-slate-100 bg-white p-4 shadow-sm">
                <BookOpenText className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {isHindi ? 'कोई तथ्य नहीं मिला' : 'No facts found'}
              </h3>
              <p className="mb-6 text-sm font-medium text-slate-500">
                {isHindi
                  ? 'कृपया कोई दूसरा विषय या टॉपिक चुनें।'
                  : 'Try selecting a different subject or topic.'}
              </p>
              <button
                onClick={() => applyFilters(selectedSubject, undefined)}
                className="text-sm font-black text-indigo-600 underline underline-offset-4 hover:text-indigo-700"
              >
                {isHindi ? 'फ़िल्टर हटाएं' : 'Clear Filters'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
