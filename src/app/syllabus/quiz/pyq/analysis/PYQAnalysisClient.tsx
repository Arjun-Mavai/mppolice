'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
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
    distribution: false,
    rising: false,
    timeline: false,
    matrix: false,
  });
  const [topicLimit, setTopicLimit] = useState(10);

  // Smooth toggle preventing scroll jump
  const toggleSection = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const totalQuestions = useMemo(
    () => analysis.yearMatrix.reduce((acc, item) => acc + item.questionCount, 0),
    [analysis.yearMatrix]
  );

  const applyFilters = (subject: string, years: number) => {
    const params = new URLSearchParams();
    params.set('subject', subject);
    params.set('years', String(years));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC]/50 pb-20">
      {/* Apple-style background glows */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-200/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-5%] bottom-[20%] h-[400px] w-[400px] rounded-full bg-pink-100/20 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-[1400px] space-y-8 px-4 pt-10 sm:px-6 lg:px-8">
        {/* ✨ Light Intelligence Header Card with Colorful Text */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900 shadow-2xl">
          {/* grid texture */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.2]" />
          {/* glow spots */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10 space-y-8 p-8 sm:p-10">
            {/* Header row */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-2">
                <p className="flex items-center gap-2 text-[10px] font-black tracking-[0.25em] text-emerald-400 uppercase">
                  <span className="text-lg">🧠</span>
                  {isHindi
                    ? 'परीक्षा इंटेलिजेंस · 2020-2025 · 6 वर्ष'
                    : 'Smart PYQ Intelligence · 2020–2025 · 6 Years'}
                </p>
                <h1 className="flex items-center gap-2.5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  <span className="text-2xl leading-none">🔍</span>
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    {isHindi ? 'PYQ टॉपिक विश्लेषण' : 'PYQ Topic Analysis'}
                  </span>
                </h1>
                <p className="max-w-xl text-sm leading-relaxed font-medium text-slate-400">
                  {isHindi
                    ? '20% सिलेबस → 80% सवाल। High-weight topics और yearly pattern shifts पहचानें। 🎯'
                    : '20% syllabus → 80% questions. Identify high-weight topics and pattern shifts. 🎯'}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/syllabus/quiz/pyq/intelligence')}
                  className="inline-flex h-auto w-full items-center gap-2 rounded-xl border border-indigo-500/50 bg-indigo-500/10 px-5 py-2.5 text-sm font-bold text-indigo-300 shadow-sm ring-1 ring-indigo-500/30 transition hover:bg-indigo-500/20 hover:text-indigo-200 sm:w-auto"
                >
                  <Zap className="h-4 w-4" />
                  {isHindi ? 'Exam DNA' : 'Exam DNA'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/syllabus/quiz/pyq/facts')}
                  className="inline-flex h-auto w-full items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-2.5 text-sm font-bold text-slate-200 shadow-sm transition hover:border-emerald-500/50 hover:bg-slate-800 hover:text-emerald-400 sm:w-auto"
                >
                  <BookOpenText className="h-4 w-4" />
                  {isHindi ? 'फैक्ट लाइब्रेरी' : 'Facts Library'}
                </Button>
                {/* <Button
                  variant="outline"
                  onClick={() => router.push('/syllabus/quiz/pyq/repeated')}
                  className="inline-flex h-auto w-full items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-2.5 text-sm font-bold text-slate-200 shadow-sm transition hover:border-amber-500/50 hover:bg-slate-800 hover:text-amber-400 sm:w-auto"
                >
                  <span className="text-base">🔥</span>
                  {isHindi ? 'रिपीटेड प्रश्न' : 'Repeated Qs'}
                </Button> */}
                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/syllabus/quiz/pyq/analysis/guide')}
                    className="inline-flex h-auto w-full items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-2.5 text-sm font-bold text-slate-200 shadow-sm transition hover:border-emerald-500/50 hover:bg-slate-800 hover:text-emerald-400 sm:w-auto"
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
                <label className="flex items-center gap-2 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  {isHindi ? 'विषय चुनें' : 'Select Subject'}
                </label>
                <Select
                  value={selectedSubject}
                  onValueChange={(val) => applyFilters(val, selectedYears)}
                >
                  <SelectTrigger className="h-14 w-full rounded-2xl border-slate-700 bg-slate-800/50 font-bold text-slate-200 transition-all hover:border-emerald-500/50 hover:bg-slate-800 focus:ring-emerald-500/30">
                    <SelectValue placeholder={isHindi ? 'विषय चुनें' : 'Select Subject'} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={4}
                    className="z-[100] max-h-[350px] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 text-slate-200 shadow-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent"
                  >
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.subject}
                        value={subject.subject}
                        className="cursor-pointer py-3 font-semibold text-slate-200 focus:bg-slate-800 focus:text-emerald-400"
                      >
                        {subject.subject} ({subject.topicCount} {isHindi ? 'टॉपिक्स' : 'Topics'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                  {isHindi ? 'वर्ष चुनें' : 'Select Years'}
                </label>
                <Select
                  value={selectedYears.toString()}
                  onValueChange={(val) => applyFilters(selectedSubject, Number(val))}
                >
                  <SelectTrigger className="h-14 w-full rounded-2xl border-slate-700 bg-slate-800/50 font-bold text-slate-200 transition-all hover:border-emerald-500/50 hover:bg-slate-800">
                    <SelectValue placeholder={isHindi ? 'वर्ष चुनें' : 'Select Years'} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={4}
                    className="z-[100] max-h-[350px] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 text-slate-200 shadow-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent"
                  >
                    {YEAR_OPTIONS.map((years) => (
                      <SelectItem
                        key={years}
                        value={years.toString()}
                        className="cursor-pointer py-3 font-semibold text-slate-200 focus:bg-slate-800 focus:text-emerald-400"
                      >
                        {isHindi ? `पिछले ${years} वर्ष` : `Last ${years} Years`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stat badges row */}
            <div className="flex flex-wrap gap-3 border-t border-slate-800 pt-6">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/50 px-4 py-2.5">
                <span className="text-base">📅</span>
                <div>
                  <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                    {isHindi ? 'डेटासेट' : 'Dataset'}
                  </p>
                  <p className="text-sm font-black text-slate-200">
                    {coverage.fromYear}–{coverage.toYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/50 px-4 py-2.5">
                <span className="text-base">📝</span>
                <div>
                  <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                    {isHindi ? 'कुल PYQ' : 'Total PYQ'}
                  </p>
                  <p className="text-sm font-black text-slate-200">{coverage.pyqQuestionCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/50 px-4 py-2.5">
                <span className="text-base">🎯</span>
                <div>
                  <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                    {isHindi ? 'विश्लेषित' : 'Analyzed'}
                  </p>
                  <p className="text-sm font-black text-slate-200">
                    {coverage.mappedQuestionCount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/50 px-4 py-2.5">
                <span className="text-base">📊</span>
                <div>
                  <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                    {isHindi ? 'कवरेज' : 'Coverage'}
                  </p>
                  <p className="text-sm font-black text-slate-200">
                    {coverage.mappingCoveragePercent}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✦ Dark Intelligence Stats Card */}
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-900 bg-emerald-950 p-7 shadow-2xl">
          {/* subtle grid */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.05]" />
          {/* corner glow */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative z-10 flex flex-wrap gap-6 sm:grid sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-emerald-800/50">
            {[
              {
                emoji: '🔍',
                label: isHindi ? 'चयनित विषय' : 'Subject',
                val: analysis.subject,
                color: 'text-emerald-400',
              },
              {
                emoji: '📝',
                label: isHindi ? 'कुल प्रश्न' : 'Total Questions',
                val: totalQuestions,
                color: 'text-emerald-300',
              },
              {
                emoji: '🏷️',
                label: isHindi ? 'टॉपिक्स' : 'Topics Covered',
                val: analysis.topicDistribution.length,
                color: 'text-emerald-200',
              },
              {
                emoji: '📅',
                label: isHindi ? 'अवधि' : 'Period',
                val: `${analysis.fromYear}–2025`,
                color: 'text-emerald-100',
              },
            ].map((stat, i) => (
              <div key={i} className="flex-1 space-y-1 first:pl-0 last:pr-0 sm:px-6">
                <p className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.2em] text-emerald-600 uppercase">
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
          <div className="h-fit overflow-hidden rounded-[2rem] border-blue-100 bg-blue-50/10 shadow-xl backdrop-blur-md lg:col-span-8">
            <CardHeader
              className="cursor-pointer border-b border-blue-100 bg-blue-50/40 transition-colors select-none hover:bg-blue-50/60"
              onClick={() => toggleSection('distribution')}
            >
              <CardTitle className="flex items-center justify-between text-lg font-black text-blue-900">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  {isHindi ? 'टॉपिक वितरण — High Weightage' : 'Topic Distribution — High Weightage'}
                </div>
                {expanded.distribution ? (
                  <ChevronUp className="h-5 w-5 text-blue-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-blue-400" />
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
                      <div className="block divide-y divide-blue-100/30 sm:hidden">
                        {analysis.topicDistribution.slice(0, topicLimit).map((item, idx) => {
                          const style = VARIANTS['blue'];
                          const barColor = style.bg.replace('50', '500');

                          return (
                            <div
                              key={item.topicId}
                              onClick={() =>
                                router.push(`/syllabus/quiz/pyq/analysis/topic/${item.topicSlug}`)
                              }
                              className={cn(
                                'group cursor-pointer space-y-3 border-l-2 bg-white/30 p-4 transition-all active:scale-[0.98]',
                                style.border.replace('border-', 'border-l-')
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <h4
                                  className={cn(
                                    'leading-tight font-bold decoration-1 underline-offset-4 group-hover:underline',
                                    style.text.replace('600', '900')
                                  )}
                                >
                                  {isHindi ? item.topicTitle : item.topicTitleEn || item.topicTitle}
                                </h4>
                                <div className="flex shrink-0 items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'font-bold',
                                      item.trendDelta > 0
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'border-pink-200 bg-pink-50 text-pink-700'
                                    )}
                                  >
                                    {item.trendDelta > 0
                                      ? `+${Math.round(item.trendDelta)}`
                                      : `${Math.round(item.trendDelta)}`}
                                  </Badge>
                                  <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase">
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
                                  'h-2 w-full overflow-hidden rounded-full bg-slate-100/50'
                                )}
                              >
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all duration-700',
                                    style.bg.replace('50', '400')
                                  )}
                                  style={{ width: `${Math.min(item.overallWeightPercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden p-2 sm:block">
                        <div className="overflow-hidden rounded-xl border border-blue-100/50">
                          <Table>
                            <TableHeader className="bg-blue-50/30">
                              <TableRow className="border-blue-100/10 hover:bg-transparent">
                                <TableHead className="px-6 py-4 text-[11px] font-bold tracking-tight text-blue-800 uppercase">
                                  {isHindi ? 'टॉपिक' : 'Topic'}
                                </TableHead>
                                <TableHead className="px-4 py-4 text-right text-[11px] font-bold tracking-tight text-blue-800 uppercase">
                                  {isHindi ? 'प्रश्न' : 'Questions'}
                                </TableHead>
                                <TableHead className="px-4 py-4 text-right text-[11px] font-bold tracking-tight text-blue-800 uppercase">
                                  {isHindi ? 'वेट %' : 'Weight %'}
                                </TableHead>
                                <TableHead className="px-6 py-4 text-right text-[11px] font-bold tracking-tight text-blue-800 uppercase">
                                  {isHindi ? 'ट्रेंड' : 'Trend'}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {analysis.topicDistribution.slice(0, topicLimit).map((item, idx) => {
                                const style = VARIANTS['blue'];
                                const barColor = style.bg.replace('50', '500');

                                return (
                                  <TableRow
                                    key={item.topicId}
                                    onClick={() =>
                                      router.push(
                                        `/syllabus/quiz/pyq/analysis/topic/${item.topicSlug}`
                                      )
                                    }
                                    className={cn(
                                      'group hover:bg-opacity-40 cursor-pointer border-slate-100 transition-colors',
                                      style.bg.replace('bg-', 'hover:bg-')
                                    )}
                                  >
                                    <TableCell
                                      className={cn(
                                        'px-6 py-4 font-bold',
                                        style.text.replace('600', '900')
                                      )}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>
                                          {isHindi
                                            ? item.topicTitle
                                            : item.topicTitleEn || item.topicTitle}
                                        </span>
                                        <ChevronRight className="h-3 w-3 text-slate-300 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-right font-black text-slate-700">
                                      {item.totalQuestions}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <span className="w-12 text-sm font-bold text-slate-600">
                                          {item.overallWeightPercent.toFixed(1)}%
                                        </span>
                                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                                          <div
                                            className={cn(
                                              'h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.05)] transition-all duration-500',
                                              style.bg.replace('50', '400')
                                            )}
                                            style={{
                                              width: `${Math.min(item.overallWeightPercent, 100)}%`,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-right">
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          'font-bold',
                                          item.trendDelta > 0
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                            : 'border-pink-200 bg-pink-50 text-pink-700'
                                        )}
                                      >
                                        {item.trendDelta > 0
                                          ? `+${Math.round(item.trendDelta)}`
                                          : `${Math.round(item.trendDelta)}`}
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
                      <div className="flex justify-center border-t border-blue-50/50 bg-white/40 p-4 backdrop-blur-sm">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setTopicLimit((prev) =>
                              prev >= analysis.topicDistribution.length ? 10 : prev + 20
                            )
                          }
                          className="flex items-center gap-1 text-xs font-bold tracking-wider text-blue-600 uppercase transition-all hover:bg-blue-50 hover:text-blue-800 active:scale-95"
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

          <div className="h-fit overflow-hidden rounded-[2rem] border-emerald-100 bg-emerald-50/10 shadow-xl backdrop-blur-md lg:col-span-4">
            <CardHeader
              className="cursor-pointer border-b border-emerald-100 bg-emerald-50/40 transition-colors select-none hover:bg-emerald-50/60"
              onClick={() => toggleSection('rising')}
            >
              <CardTitle className="flex items-center justify-between text-lg font-black text-emerald-900">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  {isHindi ? 'उभरते टॉपिक — Hot Trends' : 'Rising Topics — Hot Trends'}
                </div>
                {expanded.rising ? (
                  <ChevronUp className="h-5 w-5 text-emerald-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-emerald-400" />
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
                      {analysis.risingTopics.map((item, idx) => {
                        const style = VARIANTS['emerald'];
                        return (
                          <div
                            key={item.topicId}
                            onClick={() =>
                              router.push(`/syllabus/quiz/pyq/analysis/topic/${item.topicSlug}`)
                            }
                            className={cn(
                              'group relative cursor-pointer space-y-4 rounded-3xl border bg-white/70 p-5 shadow-sm transition hover:shadow-md active:scale-[0.98]',
                              style.border
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className={cn(
                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black',
                                    style.bg,
                                    style.text
                                  )}
                                >
                                  #{idx + 1}
                                </div>
                                <h4 className="text-base leading-tight font-black text-slate-800">
                                  {isHindi ? item.topicTitle : item.topicTitleEn || item.topicTitle}
                                </h4>
                              </div>
                              <Badge
                                variant="outline"
                                className="shrink-0 rounded-lg border-emerald-200 bg-emerald-50 px-2 py-0.5 font-black text-emerald-700"
                              >
                                +{Math.round(item.trendDelta)} {isHindi ? 'अधिक' : 'more'}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between px-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                              <span>
                                {item.totalQuestions} {isHindi ? 'प्रश्न' : 'Questions'}
                              </span>
                              <span>
                                {item.latestWeightPercent.toFixed(1)}%{' '}
                                {isHindi ? 'लेटेस्ट हिस्सा' : 'Latest Share'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-2 transition-colors group-hover:border-slate-200">
                              <span className="flex items-center gap-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                {isHindi ? 'प्रमाण देखें' : 'View Proof'}
                              </span>
                              <ChevronRight className="h-3 w-3 text-slate-300 transition-transform group-hover:translate-x-0.5" />
                            </div>

                            <div className="h-2 w-full overflow-hidden rounded-full border border-slate-50 bg-slate-100/70">
                              <div
                                className={cn(
                                  'h-full rounded-full shadow-sm transition-all duration-1000 ease-out',
                                  style.bg.replace('50', '500')
                                )}
                                style={{ width: `${Math.min(item.latestWeightPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Marketing-style Matrix Card (Synced with other sections) */}
        <div className="h-fit overflow-hidden rounded-[2rem] border-emerald-100 bg-emerald-50/10 shadow-xl backdrop-blur-md">
          <CardHeader
            className="relative z-10 cursor-pointer border-b border-emerald-100 bg-emerald-50/40 transition-colors select-none hover:bg-emerald-50/60"
            onClick={() => toggleSection('matrix')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 flex items-center gap-2 text-[10px] font-black tracking-[0.25em] text-emerald-600/60 uppercase">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {isHindi ? 'कवरेज चेक' : 'Coverage Check'}
                </p>
                <CardTitle className="flex items-center gap-2 text-xl font-black text-emerald-900">
                  {isHindi ? 'वर्ष-वार मैट्रिक्स' : 'Year-wise Matrix'}
                </CardTitle>
              </div>

              {expanded.matrix ? (
                <ChevronUp className="h-6 w-6 text-emerald-400" />
              ) : (
                <ChevronDown className="h-6 w-6 text-emerald-400" />
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
                className="relative z-10 bg-slate-900"
              >
                <CardContent className="space-y-4 p-6 sm:p-8">
                  {analysis.yearMatrix.map((item, idx) => {
                    const variants = ['blue', 'pink', 'emerald', 'amber'] as const;
                    // Use gradients like the marketing card
                    const gradients = {
                      blue: 'from-cyan-500 to-blue-500',
                      pink: 'from-pink-500 to-rose-500',
                      emerald: 'from-emerald-500 to-teal-500',
                      amber: 'from-amber-500 to-orange-500',
                    };
                    const gradient = gradients[variants[idx % 4]];

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
                          <div className="h-3 w-full overflow-hidden rounded-full border border-slate-700/50 bg-slate-800">
                            <div
                              className={cn(
                                'h-full rounded-full bg-gradient-to-r shadow-lg transition-all duration-1000 ease-out',
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
                              <Hand className="h-3 w-3 text-pink-400/80" />
                              <span className="text-[9px] font-black tracking-[0.2em] text-pink-400/80 uppercase">
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

        <Card className="overflow-hidden rounded-[2rem] border-amber-100 bg-amber-50/10 shadow-xl backdrop-blur-md">
          <CardHeader
            className="cursor-pointer border-b border-amber-100 bg-amber-50/40 transition-colors hover:bg-amber-50/60"
            onClick={() => toggleSection('timeline')}
          >
            <CardTitle className="flex items-center justify-between text-lg font-black text-amber-900">
              {isHindi
                ? 'टॉपिक अनुसार विश्लेषण — Recency Tracker'
                : 'Topic-wise Timeline — Recency Tracker'}
              {expanded.timeline ? (
                <ChevronUp className="h-5 w-5 text-amber-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-amber-400" />
              )}
            </CardTitle>
          </CardHeader>

          {expanded.timeline && (
            <div>
              {/* Mobile Card List for Timeline */}
              <div className="block divide-y divide-amber-100/30 sm:hidden">
                {analysis.topicYearBreakdown.slice(0, 20).map((row) => {
                  const totalForTopic = row.years.reduce((sum, y) => sum + y.questionCount, 0);
                  return (
                    <div key={row.topicId} className="space-y-4 bg-white/30 p-5">
                      <div>
                        <h4 className="leading-tight font-black text-slate-900">
                          {isHindi ? row.topicTitle : row.topicTitleEn || row.topicTitle}
                        </h4>
                        <p className="mt-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                          {totalForTopic} {isHindi ? 'कुल प्रश्न' : 'Questions'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {row.years.map((y, idx) => {
                          const style = VARIANTS['amber'];
                          return (
                            <div
                              key={`${row.topicId}-${y.year}`}
                              className={cn(
                                'flex min-w-[60px] flex-col items-center justify-center rounded-xl border bg-white p-2 shadow-sm',
                                style.border
                              )}
                            >
                              <span className="text-[9px] font-black text-slate-400 uppercase">
                                {y.year}
                              </span>
                              <span className={cn('text-sm font-black', style.text)}>
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

              <div className="hidden overflow-x-auto sm:block">
                <Table>
                  <TableHeader className="bg-amber-50/20">
                    <TableRow className="border-amber-100/10 hover:bg-transparent">
                      <TableHead className="w-[30%] min-w-[200px] px-4 py-3 text-[10px] font-bold tracking-tight text-amber-800 uppercase">
                        {isHindi ? 'टॉपिक' : 'Topic'}
                      </TableHead>
                      <TableHead className="min-w-[400px] px-4 py-3 text-[10px] font-bold tracking-tight text-amber-800 uppercase">
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
                          className="border-amber-50/10 transition-colors hover:bg-amber-50/30"
                        >
                          <TableCell className="px-4 py-3 align-top font-bold text-slate-800">
                            <div>
                              {isHindi ? row.topicTitle : row.topicTitleEn || row.topicTitle}
                            </div>
                            <div className="mt-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                              {totalForTopic} {isHindi ? 'कुल प्रश्न' : 'Questions'}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-middle">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {row.years.map((y, idx) => {
                                const style = VARIANTS['amber'];
                                return (
                                  <div
                                    key={`${row.topicId}-${y.year}`}
                                    className={cn(
                                      'flex items-center gap-2 rounded-lg border bg-white px-2.5 py-1.5 shadow-sm',
                                      style.border
                                    )}
                                  >
                                    <span className="text-[10px] font-black text-slate-400 uppercase">
                                      {y.year}
                                    </span>
                                    <div className="h-3 w-[1px] bg-slate-100"></div>
                                    <span
                                      className={cn(
                                        'flex items-center gap-0.5 text-xs font-black',
                                        style.text
                                      )}
                                    >
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
        </Card>
      </div>
    </div>
  );
}
