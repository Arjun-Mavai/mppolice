'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, ChevronDown, ChevronUp, BookOpenText, ShieldAlert, Sparkles, ChevronRight, ShieldCheck, MousePointer2, Hand } from 'lucide-react';
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
  isAdmin?: boolean;
}

const YEAR_OPTIONS = [3, 4, 5, 6, 7, 10, 15];

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

  const toggleSection = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const totalQuestions = useMemo(
    () => analysis.topicDistribution.reduce((acc, item) => acc + item.totalQuestions, 0),
    [analysis.topicDistribution]
  );

  const applyFilters = (subject: string, years: number) => {
    const params = new URLSearchParams();
    params.set('subject', subject);
    params.set('years', String(years));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]/50 pb-20 relative overflow-hidden">
      {/* Apple-style background glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-200/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] h-[400px] w-[400px] rounded-full bg-pink-100/20 blur-[100px] pointer-events-none" />
      
      <div className="mx-auto max-w-[1400px] space-y-8 px-4 pt-10 sm:px-6 lg:px-8 relative z-10">
        
        {/* ✨ Light Intelligence Header Card with Colorful Text */}
        <div className="relative rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden shadow-xl">
          {/* grid texture */}
          <div className="absolute inset-0 opacity-[0.4] bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          {/* glow spots */}
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />

          <div className="relative z-10 p-8 sm:p-10 space-y-8">

            {/* Header row */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 flex items-center gap-2">
                  <span className="text-lg">🧠</span>
                  {isHindi ? 'परीक्षा इंटेलिजेंस · 2020-2025 · 6 वर्ष' : 'Smart PYQ Intelligence · 2020–2025 · 6 Years'}
                </p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl flex items-center gap-2.5">
                  <span className="text-2xl leading-none">🔍</span>
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    {isHindi ? 'PYQ टॉपिक विश्लेषण' : 'PYQ Topic Analysis'}
                  </span>
                </h1>
                <p className="max-w-xl text-sm font-medium text-slate-500 leading-relaxed">
                  {isHindi
                    ? '20% सिलेबस → 80% सवाल। High-weight topics और yearly pattern shifts पहचानें। 🎯'
                    : '20% syllabus → 80% questions. Identify high-weight topics and pattern shifts. 🎯'}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center shrink-0">
                <Button
                  variant="outline"
                  onClick={() => router.push('/syllabus/quiz/pyq/facts')}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-emerald-600 h-auto w-full sm:w-auto"
                >
                  <BookOpenText className="h-4 w-4" />
                  {isHindi ? 'फैक्ट लाइब्रेरी' : 'Facts Library'}
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/syllabus/quiz/pyq/analysis/guide')}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-emerald-600 h-auto w-full sm:w-auto"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isHindi ? 'गाइड' : 'Guide'}
                  </Button>
                )}
              </div>
            </div>

            {/* Selects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black tracking-widest text-emerald-700 uppercase flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  {isHindi ? 'विषय चुनें' : 'Select Subject'}
                </label>
                <Select
                  value={selectedSubject}
                  onValueChange={(val) => applyFilters(val, selectedYears)}
                >
                  <SelectTrigger className="w-full bg-emerald-50/50 border-emerald-200 text-emerald-900 rounded-2xl h-14 font-bold hover:border-emerald-400 hover:bg-emerald-50 transition-all focus:ring-emerald-500/30">
                    <SelectValue placeholder={isHindi ? 'विषय चुनें' : 'Select Subject'} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={4}
                    className="z-[100] rounded-2xl max-h-[350px] overflow-y-auto bg-white border border-emerald-100 shadow-xl text-emerald-900 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-200 [&::-webkit-scrollbar-track]:bg-transparent"
                  >
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.subject}
                        value={subject.subject}
                        className="cursor-pointer font-semibold py-3 text-emerald-900 focus:bg-emerald-50 focus:text-emerald-700"
                      >
                        {subject.subject} ({subject.topicCount} {isHindi ? 'टॉपिक्स' : 'Topics'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black tracking-widest text-emerald-700 uppercase flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                  {isHindi ? 'वर्ष चुनें' : 'Select Years'}
                </label>
                <Select
                  value={selectedYears.toString()}
                  onValueChange={(val) => applyFilters(selectedSubject, Number(val))}
                >
                  <SelectTrigger className="w-full bg-emerald-50/50 border-emerald-200 text-emerald-900 rounded-2xl h-14 font-bold hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                    <SelectValue placeholder={isHindi ? 'वर्ष चुनें' : 'Select Years'} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={4}
                    className="z-[100] rounded-2xl max-h-[350px] overflow-y-auto bg-white border border-emerald-100 shadow-xl text-emerald-900 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-200 [&::-webkit-scrollbar-track]:bg-transparent"
                  >
                    {YEAR_OPTIONS.map((years) => (
                      <SelectItem
                        key={years}
                        value={years.toString()}
                        className="cursor-pointer font-semibold py-3 text-emerald-900 focus:bg-emerald-50 focus:text-emerald-700"
                      >
                        {isHindi ? `पिछले ${years} वर्ष` : `Last ${years} Years`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stat badges row */}
            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2.5">
                <span className="text-base">📅</span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">{isHindi ? 'डेटासेट' : 'Dataset'}</p>
                  <p className="text-sm font-black text-emerald-600">{coverage.fromYear}–{coverage.toYear}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2.5">
                <span className="text-base">📝</span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">{isHindi ? 'कुल PYQ' : 'Total PYQ'}</p>
                  <p className="text-sm font-black text-amber-600">{coverage.pyqQuestionCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-blue-50 border border-blue-200 px-4 py-2.5">
                <span className="text-base">🎯</span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-700">{isHindi ? 'विश्लेषित' : 'Analyzed'}</p>
                  <p className="text-sm font-black text-blue-600">{coverage.mappedQuestionCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-pink-50 border border-pink-200 px-4 py-2.5">
                <span className="text-base">📊</span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-pink-700">{isHindi ? 'कवरेज' : 'Coverage'}</p>
                  <p className="text-sm font-black text-pink-600">{coverage.mappingCoveragePercent}%</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ✦ Dark Intelligence Stats Card */}
        <div className="relative rounded-[2rem] bg-emerald-950 border border-emerald-900 p-7 shadow-2xl overflow-hidden">
          {/* subtle grid */}
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          {/* corner glow */}
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-wrap gap-6 sm:gap-0 sm:grid sm:grid-cols-4 sm:divide-x sm:divide-emerald-800/50">
            {[
              { emoji: '🔍', label: isHindi ? 'चयनित विषय' : 'Subject', val: analysis.subject, color: 'text-emerald-400' },
              { emoji: '📝', label: isHindi ? 'कुल प्रश्न' : 'Total Questions', val: totalQuestions, color: 'text-emerald-300' },
              { emoji: '🏷️', label: isHindi ? 'टॉपिक्स' : 'Topics Covered', val: analysis.topicDistribution.length, color: 'text-emerald-200' },
              { emoji: '📅', label: isHindi ? 'अवधि' : 'Period', val: `${analysis.fromYear}–2025`, color: 'text-emerald-100' },
            ].map((stat, i) => (
              <div key={i} className="flex-1 sm:px-6 first:pl-0 last:pr-0 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-1.5">
                  <span className="text-base">{stat.emoji}</span>
                  {stat.label}
                </p>
                <p className={`text-2xl font-black tracking-tight ${stat.color}`}>
                  {stat.val}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-12">
          <div className="h-fit overflow-hidden rounded-[2rem] border-blue-100 bg-blue-50/10 shadow-xl backdrop-blur-md lg:col-span-8">
            <CardHeader
              className="cursor-pointer border-b border-blue-100 bg-blue-50/40 transition-colors hover:bg-blue-50/60 select-none"
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
            {expanded.distribution && (
              <div>
                <CardContent className="p-0">
                  {/* Mobile Card List */}
                  <div className="block divide-y divide-blue-100/30 sm:hidden">
                    {analysis.topicDistribution.slice(0, 20).map((item, idx) => {
                      const style = VARIANTS['blue'];
                      const barColor = style.bg.replace('50', '500');

                      return (
                        <div
                          key={item.topicId}
                          onClick={() => router.push(`/syllabus/quiz/pyq/analysis/topic/${item.topicSlug}`)}
                          className={cn(
                            'group cursor-pointer space-y-3 border-l-2 bg-white/30 p-4 transition-all active:scale-[0.98]',
                            style.border.replace('border-', 'border-l-')
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4
                              className={cn(
                                'leading-tight font-bold group-hover:underline decoration-1 underline-offset-4',
                                style.text.replace('600', '900')
                              )}
                            >
                              {isHindi ? item.topicTitle : item.topicTitleEn || item.topicTitle}
                            </h4>
                            <div className="flex items-center gap-2 shrink-0">
                               <Badge
                                variant="outline"
                                className={cn(
                                  'font-bold',
                                  item.trendDelta > 0
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-pink-200 bg-pink-50 text-pink-700'
                                )}
                              >
                                {item.trendDelta > 0 ? `+${item.trendDelta}` : `${item.trendDelta}`}
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            <span>
                              {item.totalQuestions} {isHindi ? 'प्रश्न' : 'Questions'}
                            </span>
                            <span>
                              {item.overallWeightPercent.toFixed(1)}% {isHindi ? 'कुल वेटेज' : 'Overall Weight'}
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
                  <div className="hidden sm:block p-2">
                    <div className="rounded-xl border border-blue-100/50 overflow-hidden">
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
                        {analysis.topicDistribution.slice(0, 25).map((item, idx) => {
                          const style = VARIANTS['blue'];
                          const barColor = style.bg.replace('50', '500');

                          return (
                             <TableRow
                               key={item.topicId}
                               onClick={() => router.push(`/syllabus/quiz/pyq/analysis/topic/${item.topicSlug}`)}
                               className={cn(
                                 'group cursor-pointer hover:bg-opacity-40 border-slate-100 transition-colors',
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
                                  <span>{isHindi ? item.topicTitle : item.topicTitleEn || item.topicTitle}</span>
                                  <ChevronRight className="h-3 w-3 text-slate-300 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
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
                                    ? `+${item.trendDelta}%`
                                    : `${item.trendDelta}%`}
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
              </div>
            )}
          </div>

          <div className="h-fit overflow-hidden rounded-[2rem] border-emerald-100 bg-emerald-50/10 shadow-xl backdrop-blur-md lg:col-span-4">
            <CardHeader
              className="cursor-pointer border-b border-emerald-100 bg-emerald-50/40 transition-colors hover:bg-emerald-50/60 select-none"
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
            {expanded.rising && (
              <div>
                <CardContent className="space-y-4 p-5 sm:p-8">
                  {analysis.risingTopics.map((item, idx) => {
                    const style = VARIANTS['emerald'];
                    return (
                        <div
                          key={item.topicId}
                          onClick={() => router.push(`/syllabus/quiz/pyq/analysis/topic/${item.topicSlug}`)}
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
                            <h4 className="text-base font-black text-slate-800 leading-tight">
                              {isHindi ? item.topicTitle : item.topicTitleEn || item.topicTitle}
                            </h4>
                          </div>
                          <Badge
                            variant="outline"
                            className="shrink-0 font-black border-emerald-200 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg"
                          >
                            +{item.trendDelta} {isHindi ? 'अधिक' : 'more'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-[11px] font-black tracking-widest text-slate-400 uppercase px-1">
                          <span>
                            {item.totalQuestions} {isHindi ? 'प्रश्न' : 'Questions'}
                          </span>
                          <span>
                            {item.latestWeightPercent.toFixed(1)}% {isHindi ? 'लेटेस्ट हिस्सा' : 'Latest Share'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 transition-colors group-hover:border-slate-200">
                          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            {isHindi ? 'प्रमाण देखें' : 'View Proof'}
                          </span>
                          <ChevronRight className="h-3 w-3 text-slate-300 transition-transform group-hover:translate-x-0.5" />
                        </div>
                        
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100/70 border border-slate-50">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-1000 ease-out shadow-sm',
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
            )}
          </div>
        </div>

        {/* Marketing-style Matrix Card */}
        <div className="relative">
           {/* Glow ring */}
           <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-pink-500 to-rose-400 opacity-20 blur-xl pointer-events-none" />
           
          <Card className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900 shadow-2xl">
             {/* grid texture */}
             <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
             
            <CardHeader
              className="cursor-pointer border-b border-slate-800 bg-slate-800/50 transition-colors hover:bg-slate-800/80 relative z-10"
              onClick={() => toggleSection('matrix')}
            >
              <div className="flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">
                      {isHindi ? 'कवरेज चेक' : 'Coverage Check'}
                   </p>
                  <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                    {isHindi ? 'वर्ष-वार मैट्रिक्स' : 'Year-wise Matrix'}
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </CardTitle>
                </div>
                
                {expanded.matrix ? (
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-800 border border-slate-700">
                     <ChevronUp className="h-5 w-5 text-slate-400" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-800 border border-slate-700">
                     <ChevronDown className="h-5 w-5 text-slate-400" />
                  </div>
                )}
              </div>
            </CardHeader>
            {expanded.matrix && (
              <div className="relative z-10">
                <CardContent className="space-y-4 p-6 sm:p-8">
                  {analysis.yearMatrix.map((item, idx) => {
                    const variants = ['blue', 'pink', 'emerald', 'amber'] as const;
                    // Use gradients like the marketing card
                    const gradients = {
                        blue: 'from-cyan-500 to-blue-500',
                        pink: 'from-pink-500 to-rose-500',
                        emerald: 'from-emerald-500 to-teal-500',
                        amber: 'from-amber-500 to-orange-500'
                    };
                    const gradient = gradients[variants[idx % 4]];

                    return (
                      <div
                        key={item.year}
                        onClick={() => router.push(`/syllabus/quiz/pyq/analysis/year/${item.year}?subject=${selectedSubject}`)}
                        className="group flex cursor-pointer items-center gap-5 rounded-xl p-2 transition-all hover:bg-white/5 active:scale-[0.99]"
                      >
                        <div className="w-12 text-sm font-black tracking-tight text-slate-400 group-hover:text-white transition-colors">
                          {item.year}
                        </div>

                        <div className="flex-1 flex flex-col gap-2">
                          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800 border border-slate-700/50">
                            <div
                              className={cn(
                                'h-full rounded-full shadow-lg transition-all duration-1000 ease-out bg-gradient-to-r',
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
                              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                              className="sm:hidden flex items-center gap-1.5 px-1"
                            >
                               <Hand className="h-3 w-3 text-pink-400/80" />
                               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-pink-400/80">Tap</span>
                            </motion.div>
                          )}
                        </div>
                        
                        <div className="min-w-[60px] text-right">
                           <div className="text-lg font-black text-slate-300 group-hover:text-white transition-colors">
                            {item.questionCount} <span className="text-[10px] text-slate-600 font-bold uppercase ml-0.5">Qs</span>
                          </div>
                        </div>
                        
                        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
                      </div>
                    );
                  })}
                </CardContent>
              </div>
            )}
          </Card>
        </div>

        <Card className="overflow-hidden rounded-[2rem] border-amber-100 bg-amber-50/10 shadow-xl backdrop-blur-md">
          <CardHeader
            className="cursor-pointer border-b border-amber-100 bg-amber-50/40 transition-colors hover:bg-amber-50/60"
            onClick={() => toggleSection('timeline')}
          >
            <CardTitle className="flex items-center justify-between text-lg font-black text-amber-900">
              {isHindi ? 'टॉपिक अनुसार विश्लेषण — Recency Tracker' : 'Topic-wise Timeline — Recency Tracker'}
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
