'use client';

import { useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  CalendarDays,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  BookOpenText,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  MousePointer2,
  Hand,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AnimatePresence } from 'framer-motion';
import { RepeatedQuestion } from '@/actions/pyq-analytics';
import type {
  PyqAnalysisResult,
  PyqInsightsCoverageSummary,
  PyqInsightSubjectItem,
} from '@/features/tests/actions/pyq-insights';
import { useSettingsStore } from '@/store/useSettingsStore';

interface PYQAnalysisClientProps {
  subjects: PyqInsightSubjectItem[];
  selectedSubject: string;
  selectedYears: number;
  analysis: PyqAnalysisResult;
  coverage: PyqInsightsCoverageSummary;
  repeatedQuestions: RepeatedQuestion[];
  isAdmin?: boolean;
}

const YEAR_OPTIONS = [3, 4, 5, 6];

const VARIANTS = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-400',
    border: 'border-blue-100',
    shadow: 'shadow-blue-200/40',
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

export default function PYQAnalysisClient({
  subjects,
  selectedSubject,
  selectedYears,
  analysis,
  coverage,
  repeatedQuestions = [],
  isAdmin = false,
}: PYQAnalysisClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    distribution: true, // Default to true for better initial view
    rising: false,
    timeline: false,
    matrix: false,
  });
  const [topicLimit, setTopicLimit] = useState(10);
  const [isPending, startTransition] = useTransition();

  // Smooth toggle preventing scroll jump
  const toggleSection = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const totalQuestions = useMemo(
    () => analysis.yearMatrix.reduce((acc, item) => acc + item.questionCount, 0),
    [analysis.yearMatrix]
  );

  const applyFilters = (subject: string, years: number) => {
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('subject', subject);
      params.set('years', String(years));
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 pb-20">
      {/* Premium background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute right-[-5%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-amber-600/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] space-y-8 px-4 pt-4 sm:px-6 lg:px-8 transition-all duration-500"
        style={{ opacity: isPending ? 0.4 : 1, filter: isPending ? 'blur(4px)' : 'none', pointerEvents: isPending ? 'none' : 'auto' }}
      >
        {/* Transition Overlay */}
        <AnimatePresence>
          {isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/20 backdrop-blur-md"
            >
              <div className="relative">
                 <div className="h-20 w-20 animate-spin rounded-full border-b-2 border-t-2 border-amber-500"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 animate-pulse rounded-full bg-amber-500/20"></div>
                 </div>
              </div>
              <p className="mt-6 text-sm font-black tracking-[0.2em] text-amber-500 uppercase animate-pulse">
                {isHindi ? 'नया डेटा लोड हो रहा है...' : 'Syncing Analysis...'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Navigation & Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/syllabus/quiz/pyq/intelligence')}
            className="group rounded-xl border border-white/5 bg-white/5 px-4 font-bold text-slate-400 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {isHindi ? 'वापस जाएं' : 'Back to Intelligence'}
          </Button>

          <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 backdrop-blur-sm">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">
              {isHindi ? 'लाइव विश्लेषण सूट' : 'Live Analysis Suite'}
            </span>
          </div>
        </div>

        {/* ✨ Premium Intelligence Header Card with Amber/Gold Theme */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900/40 shadow-2xl backdrop-blur-xl">
          {/* grid texture */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.2]" />
          {/* glow spots */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl" />

          <div className="relative z-10 space-y-8 p-8 sm:p-10">
            {/* Header row */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-2">
                <p className="flex items-center gap-2 text-[10px] font-black tracking-[0.25em] text-amber-500/80 uppercase">
                  <span className="text-lg">🧠</span>
                  {isHindi
                    ? 'प्रीमियम इंटेलिजेंस · 2020-2025 · 6 वर्ष'
                    : 'Premium Analysis · 2020–2025 · 6 Years'}
                </p>
                <h1 className="flex items-center gap-2.5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  <span className="text-2xl leading-none">🔍</span>
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    {isHindi ? 'PYQ टॉपिक विश्लेषण' : 'PYQ Topic Analysis'}
                  </span>
                </h1>
                <p className="max-w-xl text-base leading-relaxed font-semibold text-slate-400">
                  {isHindi
                    ? '20% सिलेबस → 80% सवाल। High-weight topics और yearly pattern shifts पहचानें। 🎯'
                    : '20% syllabus → 80% questions. Identify high-weight topics and pattern shifts. 🎯'}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/syllabus/quiz/pyq/intelligence')}
                  className="inline-flex h-12 w-full items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-6 font-black text-amber-500 shadow-sm transition-all hover:bg-amber-500 hover:text-black sm:w-auto"
                >
                  <Zap className="h-4 w-4" />
                  {isHindi ? 'प्रीमियम ईंटेलिजेंस' : 'Expert Insights'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/syllabus/quiz/pyq/facts')}
                  className="inline-flex h-12 w-full items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-6 font-black text-slate-200 shadow-sm transition hover:border-amber-500/50 hover:bg-slate-800 hover:text-amber-400 sm:w-auto"
                >
                  <BookOpenText className="h-4 w-4" />
                  {isHindi ? 'फैक्ट लाइब्रेरी' : 'Facts Library'}
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/syllabus/quiz/pyq/analysis/guide')}
                    className="inline-flex h-12 w-full items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-6 font-black text-slate-200 shadow-sm transition hover:border-amber-500/50 hover:bg-slate-800 hover:text-amber-400 sm:w-auto"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isHindi ? 'गाइड' : 'Guide'}
                  </Button>
                )}
              </div>
            </div>

            {/* Selects */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 px-1 text-[11px] font-black tracking-widest text-amber-400 uppercase">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  {isHindi ? 'विषय चुनें' : 'Select Subject'}
                </label>
                <Select
                  value={selectedSubject}
                  onValueChange={(val) => applyFilters(val, selectedYears)}
                >
                  <SelectTrigger className="h-14 w-full rounded-2xl border-slate-800 bg-slate-900/60 font-black tracking-tight text-white shadow-sm backdrop-blur-md transition-all hover:border-amber-500/50 hover:bg-slate-900/80 focus:ring-amber-500/30 ring-offset-0">
                    <SelectValue placeholder={isHindi ? 'विषय चुनें' : 'Select Subject'} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={4}
                    className="z-[100] max-h-[350px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 shadow-2xl backdrop-blur-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-800"
                  >
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.subject}
                        value={subject.subject}
                        className="cursor-pointer py-3 font-bold text-slate-400 focus:bg-amber-500/10 focus:text-amber-400"
                      >
                        {subject.subject} ({subject.topicCount} {isHindi ? 'टॉपिक्स' : 'Topics'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 px-1 text-[11px] font-black tracking-widest text-amber-500/60 uppercase">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500/50" />
                  {isHindi ? 'वर्ष चुनें' : 'Select Years'}
                </label>
                <Select
                  value={selectedYears.toString()}
                  onValueChange={(val) => applyFilters(selectedSubject, Number(val))}
                >
                  <SelectTrigger className="h-14 w-full rounded-2xl border-slate-800 bg-slate-900/60 font-black tracking-tight text-white shadow-sm backdrop-blur-md transition-all hover:border-amber-500/40 hover:bg-slate-900/80 focus:ring-amber-500/30">
                    <SelectValue placeholder={isHindi ? 'वर्ष चुनें' : 'Select Years'} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={4}
                    className="z-[100] max-h-[350px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 shadow-2xl backdrop-blur-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-800"
                  >
                    {YEAR_OPTIONS.map((years) => (
                      <SelectItem
                        key={years}
                        value={years.toString()}
                        className="cursor-pointer py-3 font-bold text-slate-400 focus:bg-amber-500/10 focus:text-amber-400"
                      >
                        {isHindi ? `पिछले ${years} वर्ष` : `Last ${years} Years`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stat badges row */}
            <div className="flex flex-wrap gap-3 border-t border-white/5 pt-6">
              {[
                { emoji: '📅', label: isHindi ? 'डेटासेट' : 'Dataset', val: `${coverage.fromYear}–${coverage.toYear}` },
                { emoji: '📝', label: isHindi ? 'कुल PYQ' : 'Total PYQ', val: coverage.pyqQuestionCount },
                { emoji: '🎯', label: isHindi ? 'विश्लेषित' : 'Analyzed', val: coverage.mappedQuestionCount },
                { emoji: '📊', label: isHindi ? 'कवरेज' : 'Coverage', val: `${coverage.mappingCoveragePercent}%` },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 backdrop-blur-sm transition-colors hover:bg-slate-800/60">
                  <span className="text-base">{stat.emoji}</span>
                  <div>
                    <p className="text-[9px] font-black tracking-widest text-slate-500 uppercase">
                      {stat.label}
                    </p>
                    <p className="text-sm font-black text-slate-200">
                      {stat.val}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ✦ Dark Amber Intelligence Stats Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-900 bg-amber-950/20 p-7 shadow-2xl backdrop-blur-xl">
          {/* subtle grid */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.1]" />
          {/* corner glow */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-wrap gap-6 sm:grid sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-white/5">
            {[
              {
                emoji: '🔍',
                label: isHindi ? 'चयनित विषय' : 'Subject',
                val: analysis.subject,
                color: 'text-amber-400',
              },
              {
                emoji: '📝',
                label: isHindi ? 'कुल प्रश्न' : 'Total Questions',
                val: totalQuestions,
                color: 'text-amber-300',
              },
              {
                emoji: '🏷️',
                label: isHindi ? 'टॉपिक्स' : 'Topics Covered',
                val: analysis.topicDistribution.length,
                color: 'text-amber-200',
              },
              {
                emoji: '📅',
                label: isHindi ? 'अवधि' : 'Period',
                val: `${analysis.fromYear}–2025`,
                color: 'text-amber-100',
              },
            ].map((stat, i) => (
              <div key={i} className="flex-1 space-y-1 first:pl-0 last:pr-0 sm:px-6">
                <p className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.2em] text-amber-600/60 uppercase">
                  <span className="text-base">{stat.emoji}</span>
                  {stat.label}
                </p>
                <p className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Most Repeated Questions section temporarily hidden for now */}

        <div className="grid items-start gap-4 lg:grid-cols-12">
          <div className="h-fit overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/40 shadow-xl backdrop-blur-md lg:col-span-8">
            <CardHeader
              className="cursor-pointer border-b border-white/5 bg-white/5 transition-colors select-none hover:bg-white/10"
              onClick={() => toggleSection('distribution')}
            >
              <CardTitle className="flex items-center justify-between text-lg font-black text-amber-500">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500/80" />
                  {isHindi ? 'टॉपिक वितरण — हाई वेटेज' : 'Topic Distribution — High Weightage'}
                </div>
                {expanded.distribution ? (
                  <ChevronUp className="h-5 w-5 text-slate-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                )}
              </CardTitle>
            </CardHeader>
            <AnimatePresence>
              {expanded.distribution && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div>
                    <CardContent className="p-0">
                      {/* Mobile Card List */}
                      <div className="block divide-y divide-white/5 sm:hidden">
                        {analysis.topicDistribution.length > 0 ? (
                          analysis.topicDistribution.slice(0, topicLimit).map((item, idx) => (
                            <div
                              key={item.topicId}
                              onClick={() =>
                                router.push(`/syllabus/quiz/pyq/analysis/topic/${item.topicSlug}`)
                              }
                              className={cn(
                                'group cursor-pointer space-y-3 border-l-4 border-amber-500/30 bg-white/[0.02] p-4 transition-all active:scale-[0.98] hover:bg-white/[0.05]'
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <h4
                                  className={cn(
                                    'leading-tight text-[15px] font-black text-slate-200 group-hover:text-amber-400'
                                  )}
                                >
                                  {isHindi ? item.topicTitle : item.topicTitleEn || item.topicTitle}
                                </h4>
                                <div className="flex shrink-0 items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'border-none bg-amber-500/10 font-bold text-amber-500'
                                    )}
                                  >
                                    {item.trendDelta > 0
                                      ? `+${Math.round(item.trendDelta)} Qs`
                                      : `${Math.round(item.trendDelta)} Qs`}
                                  </Badge>
                                  <ChevronRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1" />
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-slate-500 uppercase">
                                <span>
                                  {item.totalQuestions} {isHindi ? 'प्रश्न' : 'Questions'}
                                </span>
                                <span>
                                  {item.overallWeightPercent.toFixed(1)}%{' '}
                                  {isHindi ? 'कुल वेटेज' : 'Overall Weight'}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  'h-2 w-full overflow-hidden rounded-full bg-slate-800'
                                )}
                              >
                                <div
                                  className={cn(
                                    'h-full rounded-full bg-gradient-to-r from-amber-600 to-orange-500 transition-all duration-700'
                                  )}
                                  style={{ width: `${Math.min(item.overallWeightPercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-500">
                            {isHindi ? 'इस विषय के लिए कोई टॉपिक डेटा नहीं मिला।' : 'No topic distribution data found for this subject.'}
                          </div>
                        )}
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden p-2 sm:block">
                        <div className="overflow-hidden rounded-xl border border-white/5">
                          <Table>
                            <TableHeader className="bg-white/5">
                              <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="px-6 py-4 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                  {isHindi ? 'टॉपिक' : 'Topic'}
                                </TableHead>
                                <TableHead className="px-4 py-4 text-right text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                  {isHindi ? 'प्रश्न' : 'Questions'}
                                </TableHead>
                                <TableHead className="px-4 py-4 text-right text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                  {isHindi ? 'वेट %' : 'Weight %'}
                                </TableHead>
                                <TableHead className="px-6 py-4 text-right text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                  {isHindi ? 'ट्रेंड' : 'Trend'}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {analysis.topicDistribution.slice(0, topicLimit).map((item, idx) => {
                                return (
                                  <TableRow
                                    key={item.topicId}
                                    onClick={() =>
                                      router.push(
                                        `/syllabus/quiz/pyq/analysis/topic/${item.topicSlug}`
                                      )
                                    }
                                    className={cn(
                                      'group border-white/5 transition-colors hover:bg-white/5 cursor-pointer'
                                    )}
                                  >
                                    <TableCell
                                      className={cn(
                                        'px-6 py-5 font-black text-slate-200 group-hover:text-amber-400'
                                      )}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>
                                          {isHindi
                                            ? item.topicTitle
                                            : item.topicTitleEn || item.topicTitle}
                                        </span>
                                        <ChevronRight className="h-3 w-3 text-amber-500/50 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-5 text-right font-black text-slate-400 group-hover:text-slate-200">
                                      {item.totalQuestions}
                                    </TableCell>
                                    <TableCell className="px-4 py-5 text-right">
                                      <div className="flex items-center justify-end gap-3">
                                        <span className="w-12 text-sm font-black text-slate-500 group-hover:text-slate-300">
                                          {item.overallWeightPercent.toFixed(1)}%
                                        </span>
                                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                                          <div
                                            className={cn(
                                              'h-full rounded-full bg-gradient-to-r from-amber-600 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all duration-700'
                                            )}
                                            style={{
                                              width: `${Math.min(item.overallWeightPercent, 100)}%`,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-right">
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          'border-none bg-amber-500/10 font-black text-amber-500'
                                        )}
                                      >
                                        {item.trendDelta > 0
                                          ? `+${Math.round(item.trendDelta)} Qs`
                                          : `${Math.round(item.trendDelta)} Qs`}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                    {analysis.topicDistribution.length > 10 && (
                      <div className="flex justify-center border-t border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setTopicLimit((prev) =>
                              prev >= analysis.topicDistribution.length ? 10 : prev + 20
                            )
                          }
                          className="flex items-center gap-1 text-xs font-black tracking-wider text-amber-500 uppercase transition-all hover:bg-amber-500/10 hover:text-amber-400 active:scale-95"
                        >
                          {topicLimit >= analysis.topicDistribution.length
                            ? isHindi
                              ? 'कम दिखाएं'
                              : 'Show Less'
                            : isHindi
                              ? 'और देखें'
                              : 'View More'}
                          <ChevronDown
                            className={cn(
                              'ml-1 h-4 w-4 transition-transform duration-300',
                              topicLimit >= analysis.topicDistribution.length && 'rotate-180'
                            )}
                          />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-fit overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/40 shadow-xl backdrop-blur-md lg:col-span-4">
            <CardHeader
              className="cursor-pointer border-b border-white/5 bg-white/5 transition-colors select-none hover:bg-white/10"
              onClick={() => toggleSection('rising')}
            >
              <CardTitle className="flex items-center justify-between text-lg font-black text-amber-500">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-500/80" />
                  {isHindi ? 'उभरते टॉपिक — Hot Trends' : 'Rising Topics — Hot Trends'}
                </div>
                {expanded.rising ? (
                  <ChevronUp className="h-5 w-5 text-slate-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                )}
              </CardTitle>
            </CardHeader>
            <AnimatePresence>
              {expanded.rising && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div>
                    <CardContent className="space-y-4 p-5 sm:p-8">
                      {analysis.risingTopics.length > 0 ? (
                        analysis.risingTopics.map((item, idx) => {
                          const style = VARIANTS['amber'];
                          return (
                            <div
                              key={item.topicId}
                              onClick={() =>
                                router.push(`/syllabus/quiz/pyq/analysis/topic/${item.topicSlug}`)
                              }
                              className={cn(
                                'group relative cursor-pointer space-y-4 rounded-3xl border border-white/10 bg-slate-900/40 p-5 shadow-xl backdrop-blur-md transition-all hover:bg-slate-800/60 active:scale-[0.98]'
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={cn(
                                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                                    )}
                                  >
                                    #{idx + 1}
                                  </div>
                                  <h4 className="text-base leading-tight font-black text-slate-100 group-hover:text-amber-400 transition-colors">
                                    {isHindi ? item.topicTitle : item.topicTitleEn || item.topicTitle}
                                  </h4>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="shrink-0 rounded-lg border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-black text-amber-500"
                                >
                                  +{Math.round(item.trendDelta)} {isHindi ? 'अधिक' : 'more'}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between px-1 text-[11px] font-black tracking-widest text-slate-500 uppercase">
                                <span>
                                  {item.totalQuestions} {isHindi ? 'प्रश्न' : 'Questions'}
                                </span>
                                <span className="text-amber-500/80">
                                  {item.latestWeightPercent.toFixed(1)}%{' '}
                                  {isHindi ? 'लेटेस्ट हिस्सा' : 'Latest Share'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between border-t border-white/5 pt-3 transition-colors group-hover:border-white/10">
                                <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-amber-500/60 uppercase group-hover:text-amber-400">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  {isHindi ? 'प्रमाण देखें' : 'View Proof'}
                                </span>
                                <ChevronRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-amber-500" />
                              </div>

                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950/50">
                                <div
                                  className={cn(
                                    'h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all duration-1000 ease-out'
                                  )}
                                  style={{ width: `${Math.min(item.latestWeightPercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-12 text-center text-slate-500">
                          {isHindi ? 'कोई उभरते टॉपिक (Rising Trends) नहीं मिले।' : 'No rising trends found for this subject.'}
                        </div>
                      )}
                    </CardContent>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Marketing-style Matrix Card (Synced with other sections) */}
        <div className="h-fit overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900/40 shadow-xl backdrop-blur-md">
          <CardHeader
            className="relative z-10 cursor-pointer border-b border-white/5 bg-white/5 transition-colors select-none hover:bg-white/10"
            onClick={() => toggleSection('matrix')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 flex items-center gap-2 text-[10px] font-black tracking-[0.25em] text-amber-500/60 uppercase">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  {isHindi ? 'कवरेज चेक' : 'Coverage Check'}
                </p>
                <CardTitle className="flex items-center gap-2 text-xl font-black text-amber-500">
                  {isHindi ? 'वर्ष-वार मैट्रिक्स' : 'Year-wise Matrix'}
                </CardTitle>
              </div>

              {expanded.matrix ? (
                <ChevronUp className="h-6 w-6 text-slate-500" />
              ) : (
                <ChevronDown className="h-6 w-6 text-slate-500" />
              )}
            </div>
          </CardHeader>
          <AnimatePresence>
            {expanded.matrix && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 bg-slate-900/40"
              >
                <CardContent className="space-y-4 p-6 sm:p-8">
                  {analysis.yearMatrix.map((item, idx) => {
                    // Standardize on More Vibrant / Colorful gradients for Matrix
                    const gradients = [
                      'from-amber-400 via-amber-500 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
                      'from-yellow-400 via-amber-500 to-amber-600 shadow-[0_0_12px_rgba(234,179,8,0.4)]',
                      'from-orange-400 via-orange-500 to-red-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]',
                      'from-rose-400 via-red-500 to-red-600 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
                    ];
                    const gradient = gradients[idx % gradients.length];

                    return (
                      <div
                        key={item.year}
                        onClick={() =>
                          router.push(
                            `/syllabus/quiz/pyq/analysis/year/${item.year}?subject=${selectedSubject}`
                          )
                        }
                        className="group flex cursor-pointer items-center gap-5 rounded-xl p-2 transition-all hover:bg-white/5 active:scale-[0.99]"
                      >
                        <div className="w-12 text-sm font-black tracking-tight text-slate-400 transition-colors group-hover:text-white">
                          {item.year}
                        </div>

                        <div className="flex flex-1 flex-col gap-2">
                          <div className="h-3 w-full overflow-hidden rounded-full border border-white/5 bg-slate-950/40">
                            <div
                              className={cn(
                                'h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out',
                                gradient
                              )}
                              style={{
                                width: `${Math.max(
                                  3,
                                  (item.questionCount /
                                    Math.max(
                                      ...analysis.yearMatrix.map((row) => row.questionCount),
                                      1
                                    )) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>

                          {/* Mobile Hand Pointer Animation - Only on first row */}
                          {idx === 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: [0.4, 1, 0.4], y: [0, 2, 0] }}
                              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                              className="flex items-center gap-1.5 px-1 sm:hidden"
                            >
                              <Hand className="h-3 w-3 text-amber-500/80" />
                              <span className="text-[9px] font-black tracking-[0.2em] text-amber-500/80 uppercase">
                                Tap
                              </span>
                            </motion.div>
                          )}
                        </div>

                        <div className="min-w-[60px] text-right">
                          <div className="text-lg font-black text-slate-300 transition-colors group-hover:text-white">
                            {item.questionCount}{' '}
                            <span className="ml-0.5 text-[10px] font-bold text-slate-600 uppercase">
                              Qs
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 -translate-x-2 text-slate-600 opacity-0 transition-colors group-hover:translate-x-0 group-hover:text-white group-hover:opacity-100" />
                      </div>
                    );
                  })}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/40 shadow-xl backdrop-blur-md">
          <CardHeader
            className="cursor-pointer border-b border-white/5 bg-white/5 transition-colors select-none hover:bg-white/10"
            onClick={() => toggleSection('timeline')}
          >
            <CardTitle className="flex items-center justify-between text-lg font-black text-amber-500">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-amber-500/80" />
                {isHindi
                  ? 'टॉपिक अनुसार विश्लेषण — Recency Tracker'
                  : 'Topic-wise Timeline — Recency Tracker'}
              </div>
              {expanded.timeline ? (
                <ChevronUp className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              )}
            </CardTitle>
          </CardHeader>

          {expanded.timeline && (
            <div>
              {/* Mobile Card List for Timeline */}
              <div className="block divide-y divide-white/5 sm:hidden">
                {analysis.topicYearBreakdown.slice(0, 20).map((row) => {
                  const totalForTopic = row.years.reduce((sum, y) => sum + y.questionCount, 0);
                  return (
                    <div key={row.topicId} className="space-y-4 bg-white/[0.02] p-5">
                      <div>
                        <h4 className="leading-tight font-black text-slate-200">
                          {isHindi ? row.topicTitle : row.topicTitleEn || row.topicTitle}
                        </h4>
                        <p className="mt-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                          {totalForTopic} {isHindi ? 'कुल प्रश्न' : 'Questions'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {row.years.map((y, idx) => {
                          return (
                            <div
                              key={`${row.topicId}-${y.year}`}
                              className="flex min-w-[60px] flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-2 shadow-sm"
                            >
                              <span className="text-[9px] font-black text-slate-500 uppercase">
                                {y.year}
                              </span>
                              <span className="text-sm font-black text-amber-500">
                                {y.questionCount} {isHindi ? 'प्र' : 'Q'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden border-t border-white/5 overflow-x-auto sm:block">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="w-[30%] min-w-[200px] px-6 py-4 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                        {isHindi ? 'टॉपिक' : 'Topic'}
                      </TableHead>
                      <TableHead className="min-w-[400px] px-6 py-4 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                        {isHindi ? 'वर्ष अनुसार विश्लेषण' : 'Yearly Trend'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.topicYearBreakdown.slice(0, 20).map((row) => {
                      const totalForTopic = row.years.reduce((sum, y) => sum + y.questionCount, 0);

                      return (
                        <TableRow
                          key={row.topicId}
                          className="border-white/5 transition-colors hover:bg-white/5"
                        >
                          <TableCell className="px-6 py-5 align-top">
                            <div className="font-black text-slate-200">
                              {isHindi ? row.topicTitle : row.topicTitleEn || row.topicTitle}
                            </div>
                            <div className="mt-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                              {totalForTopic} {isHindi ? 'कुल प्रश्न' : 'Questions'}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-5 align-middle">
                            <div className="flex flex-wrap items-center gap-2">
                              {row.years.map((y, idx) => {
                                return (
                                  <div
                                    key={`${row.topicId}-${y.year}`}
                                    className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 shadow-sm"
                                  >
                                    <span className="text-[10px] font-black text-slate-500 uppercase">
                                      {y.year}
                                    </span>
                                    <div className="h-3 w-[1px] bg-white/5"></div>
                                    <span className="flex items-center gap-0.5 text-xs font-black text-amber-500">
                                      {y.questionCount} {isHindi ? 'प्र' : 'Q'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
