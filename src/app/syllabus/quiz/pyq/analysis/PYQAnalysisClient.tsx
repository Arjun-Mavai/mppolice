'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                {isHindi ? 'PYQ टॉपिक विश्लेषण' : 'PYQ Topic Analysis'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {isHindi
                  ? 'High-weight topics और yearly pattern shifts पहचानें, ताकि revision तेज़ हो।'
                  : 'Identify high-weight topics and yearly pattern shifts for faster revision.'}
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/syllabus/quiz/pyq/facts')}>
              {isHindi ? 'फैक्ट लाइब्रेरी खोलें' : 'Open Facts Library'}
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {/* Subject Select */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                {isHindi ? 'विषय चुनें' : 'Select Subject'}
              </label>
              <Select
                value={selectedSubject}
                onValueChange={(val) => applyFilters(val, selectedYears)}
              >
                <SelectTrigger className="h-12 w-full rounded-xl border-slate-200 bg-white font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                  <SelectValue placeholder={isHindi ? 'विषय चुनें' : 'Select Subject'} />
                </SelectTrigger>
                <SelectContent className="max-h-[350px] overflow-y-auto rounded-xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
                  {subjects.map((subject) => (
                    <SelectItem
                      key={subject.subject}
                      value={subject.subject}
                      className="cursor-pointer font-semibold text-slate-700"
                    >
                      {subject.subject} ({subject.topicCount} {isHindi ? 'टॉपिक्स' : 'Topics'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Select */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                {isHindi ? 'वर्ष चुनें' : 'Select Years'}
              </label>
              <Select
                value={selectedYears.toString()}
                onValueChange={(val) => applyFilters(selectedSubject, Number(val))}
              >
                <SelectTrigger className="h-12 w-full rounded-xl border-slate-200 bg-white font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                  <SelectValue placeholder={isHindi ? 'वर्ष चुनें' : 'Select Years'} />
                </SelectTrigger>
                <SelectContent className="max-h-[350px] overflow-y-auto rounded-xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
                  {YEAR_OPTIONS.map((years) => (
                    <SelectItem
                      key={years}
                      value={years.toString()}
                      className="cursor-pointer font-semibold text-slate-700"
                    >
                      {isHindi ? `पिछले ${years} वर्ष` : `Last ${years} Years`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">
              {isHindi
                ? `डेटासेट: ${coverage.fromYear}-${coverage.toYear}`
                : `Dataset: ${coverage.fromYear}-${coverage.toYear}`}
            </Badge>
            <Badge variant="secondary">
              {isHindi
                ? `कुल PYQ प्रश्न: ${coverage.pyqQuestionCount}`
                : `Total PYQ Questions: ${coverage.pyqQuestionCount}`}
            </Badge>
            <Badge variant="secondary">
              {isHindi
                ? `Analysis mapped: ${coverage.mappedQuestionCount} (${coverage.mappingCoveragePercent}%)`
                : `Analysis mapped: ${coverage.mappedQuestionCount} (${coverage.mappingCoveragePercent}%)`}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: isHindi ? 'चयनित विषय' : 'Selected Subject',
              val: analysis.subject,
              variant: 'blue' as const,
            },
            {
              label: isHindi ? 'कुल टॉपिक प्रश्न' : 'Total Topic Questions',
              val: totalQuestions,
              variant: 'pink' as const,
            },
            {
              label: isHindi ? 'कवर टॉपिक' : 'Topics Covered',
              val: analysis.topicDistribution.length,
              variant: 'emerald' as const,
            },
            {
              label: isHindi ? 'अवधि' : 'Period',
              val: `${analysis.fromYear} - 2025`,
              variant: 'amber' as const,
            },
          ].map((stat, i) => {
            const style = VARIANTS[stat.variant];
            return (
              <Card
                key={i}
                className={cn(
                  'group relative overflow-hidden border-l-4 shadow-sm transition-all hover:shadow-md',
                  style.border.replace('border-', 'border-l-'),
                  style.bg
                )}
              >
                <div
                  className={cn(
                    'absolute -top-4 -right-4 h-16 w-16 rounded-full opacity-20 blur-xl transition-all group-hover:opacity-40',
                    style.bg.replace('50', '500')
                  )}
                ></div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black tracking-[0.15em] text-slate-400 uppercase">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className={cn(
                    'relative z-10 text-3xl font-black tracking-tighter',
                    style.text.replace('600', '800')
                  )}
                >
                  {stat.val}
                </CardContent>
              </Card>
            );
          })}
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
                  {isHindi ? 'टॉपिक वितरण' : 'Topic Distribution'}
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
                          className={cn(
                            'space-y-3 border-l-2 bg-white/30 p-4',
                            style.border.replace('border-', 'border-l-')
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4
                              className={cn(
                                'leading-tight font-bold',
                                style.text.replace('600', '900')
                              )}
                            >
                              {isHindi ? item.topicTitle : item.topicTitleEn || item.topicTitle}
                            </h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                'shrink-0 font-bold',
                                item.trendDelta > 0
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : 'border-pink-200 bg-pink-50 text-pink-700'
                              )}
                            >
                              {item.trendDelta > 0 ? `+${item.trendDelta}%` : `${item.trendDelta}%`}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            <span>
                              {item.totalQuestions} {isHindi ? 'प्रश्न' : 'Questions'}
                            </span>
                            <span>
                              {item.latestWeightPercent.toFixed(1)}% {isHindi ? 'वेटेज' : 'Weight'}
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
                              style={{ width: `${Math.min(item.latestWeightPercent, 100)}%` }}
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
                              className={cn(
                                'hover:bg-opacity-40 border-slate-100 transition-colors',
                                style.bg.replace('bg-', 'hover:bg-')
                              )}
                            >
                              <TableCell
                                className={cn(
                                  'px-6 py-4 font-bold',
                                  style.text.replace('600', '900')
                                )}
                              >
                                {isHindi ? item.topicTitle : item.topicTitleEn || item.topicTitle}
                              </TableCell>
                              <TableCell className="px-4 py-4 text-right font-black text-slate-700">
                                {item.totalQuestions}
                              </TableCell>
                              <TableCell className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="w-12 text-sm font-bold text-slate-600">
                                    {item.latestWeightPercent.toFixed(1)}%
                                  </span>
                                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className={cn(
                                        'h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.05)] transition-all duration-500',
                                        style.bg.replace('50', '400')
                                      )}
                                      style={{
                                        width: `${Math.min(item.latestWeightPercent, 100)}%`,
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
                  {isHindi ? 'उभरते टॉपिक' : 'Rising Topics'}
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
                <CardContent className="space-y-3 p-6">
                  {analysis.risingTopics.map((item, idx) => {
                    const style = VARIANTS['emerald'];
                    return (
                      <div
                        key={item.topicId}
                        className={cn(
                          'group relative flex items-center justify-between rounded-2xl border bg-white/60 p-4 shadow-sm transition hover:shadow-md',
                          style.border
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black',
                              style.bg,
                              style.text
                            )}
                          >
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="line-clamp-1 text-sm font-black text-slate-800">
                              {isHindi ? item.topicTitle : item.topicTitleEn || item.topicTitle}
                            </p>
                            <p className="mt-0.5 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                              {item.latestWeightPercent.toFixed(1)}% {isHindi ? 'वेटेज' : 'Weight'}
                            </p>
                          </div>
                        </div>
                        <div
                          className={cn(
                            'shrink-0 rounded-full border px-2.5 py-1 text-xs font-black shadow-sm',
                            style.bg,
                            style.text,
                            style.border
                          )}
                        >
                          +{item.trendDelta}%
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </div>
            )}
          </div>
        </div>

        <Card className="overflow-hidden rounded-[2rem] border-pink-100 bg-pink-50/10 shadow-xl backdrop-blur-md">
          <CardHeader
            className="cursor-pointer border-b border-pink-100 bg-pink-50/40 transition-colors hover:bg-pink-50/60"
            onClick={() => toggleSection('matrix')}
          >
            <CardTitle className="flex items-center justify-between text-lg font-black text-pink-900">
              {isHindi ? 'वर्ष-वार मैट्रिक्स' : 'Year-wise Matrix'}
              {expanded.matrix ? (
                <ChevronUp className="h-5 w-5 text-pink-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-pink-400" />
              )}
            </CardTitle>
          </CardHeader>
          {expanded.matrix && (
            <div>
              <CardContent className="space-y-4 p-6">
                {analysis.yearMatrix.map((item, idx) => {
                  const variants = ['blue', 'pink', 'emerald', 'amber'] as const;
                  const style = VARIANTS[variants[idx % 4]];
                  const barColor = style.bg.replace('50', '500');

                  return (
                    <div key={item.year} className="group flex items-center gap-4">
                      <div
                        className={cn(
                          'w-12 text-sm font-black tracking-tight text-slate-500 transition-colors',
                          style.text
                        )}
                      >
                        {item.year}
                      </div>
                      <div
                        className={cn(
                          'h-4 flex-1 overflow-hidden rounded-full border bg-white shadow-inner',
                          style.border
                        )}
                      >
                        <div
                          className={cn(
                            'h-full rounded-full bg-green-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-1000 ease-out'
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
                      <div className="w-8 shrink-0 text-right text-sm font-black text-slate-700">
                        {item.questionCount}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </div>
          )}
        </Card>

        <Card className="overflow-hidden rounded-[2rem] border-amber-100 bg-amber-50/10 shadow-xl backdrop-blur-md">
          <CardHeader
            className="cursor-pointer border-b border-amber-100 bg-amber-50/40 transition-colors hover:bg-amber-50/60"
            onClick={() => toggleSection('timeline')}
          >
            <CardTitle className="flex items-center justify-between text-lg font-black text-amber-900">
              {isHindi ? 'टॉपिक अनुसार विश्लेषण' : 'Topic-wise Timeline'}
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
