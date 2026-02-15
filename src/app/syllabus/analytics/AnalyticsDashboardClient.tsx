'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  ChevronRight,
  AlertCircle,
  History,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface AnalyticsDashboardClientProps {
  analytics: any;
}

function accuracyStyle(accuracy: number) {
  if (accuracy >= 80) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  if (accuracy >= 60) return 'bg-amber-50 text-amber-600 border-amber-100';
  return 'bg-rose-50 text-rose-600 border-rose-100';
}

function tabLabel(tab: string) {
  if (tab === 'ALL') return 'All Tests';
  if (tab === 'UNIT') return 'Unit Wise';
  if (tab === 'TOPIC') return 'Topic Wise';
  return tab;
}

function typeLabel(type: string) {
  if (type === 'UNIT') return 'Unit Test';
  if (type === 'TOPIC') return 'Topic Test';
  if (type === 'CSAT') return 'CSAT';
  if (type === 'PYQ') return 'PYQ';
  return 'Test';
}

function TestRow({
  activity,
  onClick,
  showType,
}: {
  activity: any;
  onClick: () => void;
  showType?: boolean;
}) {
  const accuracy = Math.round((activity.score / (activity.totalMarks || 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="group flex cursor-pointer items-center justify-between border-b border-slate-50 px-6 py-5 transition-all last:border-0 hover:bg-slate-50/80"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-black shadow-sm transition-transform group-hover:scale-105 group-hover:rotate-3',
            accuracyStyle(accuracy)
          )}
        >
          {accuracy}%
        </div>

        <div className="min-w-0 space-y-1">
          {showType && (
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-black tracking-widest text-white uppercase shadow-sm">
                {typeLabel(activity.type)}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold tracking-tighter text-slate-400 uppercase">
                <Clock size={10} strokeWidth={3} />
                {new Date(activity.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          {!showType && (
            <div className="flex items-center gap-1 text-[11px] font-bold tracking-tighter text-slate-400 uppercase">
              <Clock size={10} strokeWidth={3} />
              {new Date(activity.createdAt).toLocaleDateString('en-GB', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          )}

          <div className="truncate pr-2 text-sm leading-snug font-black text-slate-900 transition-colors group-hover:text-slate-700 sm:text-base">
            {activity.testTitle || 'Practice Test'}
          </div>

          {activity.timeTaken && (
            <div className="flex items-center gap-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
              <span className="rounded-lg border border-slate-100 bg-white/80 px-2 py-0.5 shadow-sm">
                ⏱️ {activity.timeTaken} / {activity.totalDuration}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-300 transition-all duration-300 group-hover:bg-white group-hover:text-slate-900 group-hover:shadow-md">
        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-20 text-slate-400">
      <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] border border-slate-100 bg-slate-50 shadow-sm">
        <History className="h-7 w-7 text-slate-300" />
      </div>
      <p className="text-sm font-black tracking-widest uppercase">{message}</p>
    </div>
  );
}

export default function AnalyticsDashboardClient({ analytics }: AnalyticsDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('ALL');
  const [masteryTab, setMasteryTab] = React.useState<'strong' | 'weak'>('strong');

  if (!analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
            Sign in to view analytics
          </h2>
          <Button
            onClick={() => router.push('/login')}
            className="h-12 rounded-2xl bg-slate-900 px-8 font-black text-white transition-transform hover:scale-105"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const { overallScore, totalTests, mastery, recentActivity, aiSuggestion } = analytics;
  const syllabusCoverage = Math.min(totalTests * 5, 100);

  const filteredHistory = recentActivity.filter((item: any) => {
    if (activeTab === 'ALL') return true;
    return item.type === activeTab;
  });

  const weakAreas = mastery.filter((m: any) => m.percentage < 50);
  const strongAreas = mastery.filter((m: any) => m.percentage >= 50);
  const displayedMastery = masteryTab === 'weak' ? weakAreas : strongAreas;

  const overviewStats = [
    {
      label: 'Avg. Score',
      value: `${overallScore}%`,
      icon: <BarChart3 className="h-5 w-5 text-emerald-600" />,
      trend: 'Overall Performance',
      accent: 'bg-emerald-50/50 border-emerald-100/50 text-emerald-700',
      iconBg: 'bg-emerald-100 shadow-sm shadow-emerald-100',
      trendStyle: 'text-emerald-700 bg-emerald-100/50 border border-emerald-200/50',
    },
    {
      label: 'Completion',
      value: `${syllabusCoverage}%`,
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      trend: 'Syllabus Covered',
      accent: 'bg-amber-50/50 border-amber-100/50 text-amber-700',
      iconBg: 'bg-amber-100 shadow-sm shadow-amber-100',
      trendStyle: 'text-amber-700 bg-amber-100/50 border border-amber-200/50',
    },
    {
      label: 'Tests Taken',
      value: totalTests.toString(),
      icon: <Target className="h-5 w-5 text-indigo-600" />,
      trend: 'Total Attempts',
      accent: 'bg-indigo-50/50 border-indigo-100/50 text-indigo-700',
      iconBg: 'bg-indigo-100 shadow-sm shadow-indigo-100',
      trendStyle: 'text-indigo-700 bg-indigo-100/50 border border-indigo-200/50',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-10">
      {/* ===== Header Area ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <h2 className="mb-3 text-3xl leading-none font-black tracking-tight text-slate-900">
            Performance Analytics
          </h2>
          <p className="text-lg font-medium text-slate-500">
            Detailed breakdown of your test history and subject mastery.
          </p>
        </div>
        <Button
          size="lg"
          className="flex items-center gap-3 rounded-[2rem] border-4 border-white bg-slate-900 px-8 py-7 text-sm font-black tracking-widest text-white uppercase shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => router.push('/syllabus/quiz')}
        >
          <TrendingUp className="h-5 w-5" /> Take New Test
        </Button>
      </motion.div>

      {/* ===== Stats Grid ===== */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {overviewStats.map((stat, idx) => (
          <motion.div key={idx} variants={item}>
            <Card
              className={cn(
                'group overflow-hidden rounded-[2.5rem] border-0 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]',
                stat.accent
              )}
            >
              <CardContent className="p-8">
                <div className="mb-6 flex items-start justify-between">
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-3',
                      stat.iconBg
                    )}
                  >
                    {stat.icon}
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-3 py-1.5 text-[10px] font-black tracking-widest uppercase backdrop-blur-md',
                      stat.trendStyle
                    )}
                  >
                    {stat.trend}
                  </span>
                </div>
                <div className="mb-1 text-4xl font-black text-slate-900">{stat.value}</div>
                <div className="text-sm font-black tracking-widest text-slate-400 uppercase">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ===== Main Content Split ===== */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* mastery Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="flex h-full flex-col overflow-hidden rounded-[3rem] border-0 bg-slate-900 shadow-2xl ring-1 ring-slate-800">
            <CardHeader className="border-b border-slate-800/50 bg-slate-900/50 p-10 pb-6 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black tracking-tighter text-white uppercase">
                    Subject Mastery
                  </CardTitle>
                  <p className="mt-1 text-sm font-bold tracking-widest text-slate-500 uppercase">
                    Across all attempts
                  </p>
                </div>
                <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/10 px-6 py-3 text-4xl font-black text-white">
                  {overallScore}%
                </div>
              </div>
              {/* Strong / Weak Tabs */}
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setMasteryTab('strong')}
                  className={cn(
                    'rounded-2xl border px-5 py-2 text-[11px] font-black tracking-widest uppercase transition-all',
                    masteryTab === 'strong'
                      ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'border-slate-700/50 bg-slate-800/50 text-slate-500 hover:text-slate-300'
                  )}
                >
                  💪 Strong ({strongAreas.length})
                </button>
                <button
                  onClick={() => setMasteryTab('weak')}
                  className={cn(
                    'rounded-2xl border px-5 py-2 text-[11px] font-black tracking-widest uppercase transition-all',
                    masteryTab === 'weak'
                      ? 'border-rose-500/30 bg-rose-500/15 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                      : 'border-slate-700/50 bg-slate-800/50 text-slate-500 hover:text-slate-300'
                  )}
                >
                  🔥 Weak ({weakAreas.length})
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-10 p-10">
                  {displayedMastery.map((m: any, i: number) => (
                    <div key={i} className="space-y-4">
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <span className="text-lg leading-none font-black text-slate-200">
                            {m.name}
                          </span>
                          <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                            Mastery Level
                          </div>
                        </div>
                        <span
                          className={cn(
                            'rounded-full border px-3 py-1 text-sm font-black tracking-widest uppercase',
                            m.percentage >= 80
                              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                              : m.percentage >= 60
                                ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                                : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                          )}
                        >
                          {m.percentage}%
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800 p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${m.percentage}%` }}
                          transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                          className={cn(
                            'h-full rounded-full transition-all duration-1000',
                            m.percentage >= 80
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                              : m.percentage >= 60
                                ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                                : 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  {displayedMastery.length === 0 && mastery.length > 0 && (
                    <div className="rounded-[2.5rem] border border-slate-800/50 bg-slate-800/30 py-16 text-center">
                      <p className="mb-3 text-2xl">{masteryTab === 'strong' ? '🎯' : '🎉'}</p>
                      <p className="text-xs font-black tracking-widest text-slate-400 uppercase">
                        {masteryTab === 'strong'
                          ? 'Keep practicing to build strong areas!'
                          : 'No weak areas — great job!'}
                      </p>
                    </div>
                  )}
                  {mastery.length === 0 && (
                    <div className="rounded-[2.5rem] border border-slate-800/50 bg-slate-800/30 py-20 text-center">
                      <Lightbulb className="mx-auto mb-4 h-10 w-10 text-slate-600" />
                      <p className="text-xs font-black tracking-widest text-slate-400 uppercase">
                        Unlock Mastery Insights
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-8"
        >
          {/* Recent Activity Card */}
          <Card className="flex flex-1 flex-col overflow-hidden rounded-[3rem] border-0 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
            <CardHeader className="border-b border-slate-50 bg-white/50 p-10 pb-6 backdrop-blur-md">
              <CardTitle className="flex items-center gap-4 text-2xl font-black tracking-tighter text-slate-900 uppercase">
                <History className="h-7 w-7 text-indigo-500" /> Recent Test History
              </CardTitle>
              <div className="scrollbar-hide mt-6 flex gap-2 overflow-x-auto pb-2">
                {['ALL', 'UNIT', 'TOPIC', 'CSAT', 'PYQ'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'shrink-0 rounded-2xl border px-6 py-2 text-[11px] font-black tracking-widest uppercase transition-all',
                      activeTab === tab
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-800 hover:bg-slate-50 hover:text-slate-800'
                    )}
                  >
                    {tabLabel(tab)}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[430px]">
                {activeTab === 'TOPIC' ? (
                  <TopicGroupedList
                    history={filteredHistory}
                    onNavigate={(id) => router.push(`/syllabus/analytics/history/${id}`)}
                  />
                ) : (
                  <FlatTestList
                    history={filteredHistory}
                    onNavigate={(id) => router.push(`/syllabus/analytics/history/${id}`)}
                  />
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== AI Coach Section ===== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="relative overflow-hidden rounded-[3.5rem] border-[6px] border-white bg-slate-950 p-10 text-white shadow-[0_40px_80px_rgba(0,0,0,0.1)] ring-1 ring-slate-900 md:p-16">
          <div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.1),transparent)]" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />

          <div className="relative z-10 flex flex-col items-center gap-12 md:flex-row">
            <div className="group flex h-24 w-24 items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/5 shadow-inner">
              <Target className="h-10 w-10 text-indigo-400 transition-transform group-hover:scale-110" />
            </div>
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="space-y-2">
                <span className="text-[11px] font-black tracking-[0.3em] text-indigo-400 uppercase">
                  Personalized Insights
                </span>
                <h3 className="text-3xl leading-tight font-black tracking-tight md:text-4xl">
                  Smart Coach Recommendations
                </h3>
              </div>
              <p className="max-w-4xl text-lg leading-relaxed font-medium text-slate-400 italic md:text-xl">
                &quot;{aiSuggestion}&quot;
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  <span className="text-xs font-black tracking-widest text-white uppercase">
                    {weakAreas.length} Weak Areas Identified
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                  <History className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-black tracking-widest text-white uppercase">
                    {totalTests} Tests Completed
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              className="h-20 rounded-[2.5rem] bg-white px-12 text-xs font-black tracking-[0.2em] text-slate-950 uppercase shadow-2xl shadow-white/10 transition-all hover:scale-105 hover:bg-slate-100 active:scale-95"
              onClick={() => router.push('/syllabus/quiz/units')}
            >
              Action Center
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function TopicGroupedList({
  history,
  onNavigate,
}: {
  history: any[];
  onNavigate: (id: string) => void;
}) {
  const grouped: Record<string, any[]> = {};
  history.forEach((item: any) => {
    const unitKey = item.unitId || 'unknown';
    if (!grouped[unitKey]) grouped[unitKey] = [];
    grouped[unitKey].push(item);
  });

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const numA = parseInt(a.replace('unit_', '')) || 999;
    const numB = parseInt(b.replace('unit_', '')) || 999;
    return numA - numB;
  });

  if (sortedKeys.length === 0) {
    return <EmptyState message="No Topic Tests found." />;
  }

  return (
    <div className="divide-y divide-slate-50">
      {sortedKeys.map((unitKey) => {
        const groupItems = grouped[unitKey];
        const unitName = groupItems[0]?.unitName || unitKey;

        return (
          <div key={unitKey} className="group/unit">
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-10 py-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase backdrop-blur-md">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              {unitName}
            </div>
            <div className="divide-y divide-slate-50">
              {groupItems.map((activity: any, idx: number) => (
                <TestRow key={idx} activity={activity} onClick={() => onNavigate(activity.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FlatTestList({
  history,
  onNavigate,
}: {
  history: any[];
  onNavigate: (id: string) => void;
}) {
  if (history.length === 0) {
    return <EmptyState message="No tests found in this category." />;
  }

  return (
    <div className="divide-y divide-slate-50">
      {history.map((activity: any, idx: number) => (
        <TestRow key={idx} activity={activity} onClick={() => onNavigate(activity.id)} showType />
      ))}
    </div>
  );
}
