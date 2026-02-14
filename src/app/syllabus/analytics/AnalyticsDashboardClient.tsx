"use client";

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
  if (accuracy >= 80) return "bg-emerald-50 text-emerald-600 border-emerald-100";
  if (accuracy >= 60) return "bg-amber-50 text-amber-600 border-amber-100";
  return "bg-rose-50 text-rose-600 border-rose-100";
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

function TestRow({ activity, onClick, showType }: { activity: any; onClick: () => void; showType?: boolean }) {
  const accuracy = Math.round((activity.score / (activity.totalMarks || 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="flex items-center justify-between px-6 py-5 hover:bg-slate-50/80 transition-all cursor-pointer group border-b border-slate-50 last:border-0"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border shrink-0 transition-transform group-hover:scale-105 group-hover:rotate-3 shadow-sm",
          accuracyStyle(accuracy),
        )}>
          {accuracy}%
        </div>

        <div className="min-w-0 space-y-1">
          {showType && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-2 py-0.5 rounded-lg border border-slate-800 shadow-sm">
                {typeLabel(activity.type)}
              </span>
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                <Clock size={10} strokeWidth={3} />
                {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}

          {!showType && (
            <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
              <Clock size={10} strokeWidth={3} />
              {new Date(activity.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
            </div>
          )}

          <div className="font-black text-slate-900 text-sm sm:text-base leading-snug group-hover:text-slate-700 transition-colors truncate pr-2">
            {activity.testTitle || "Practice Test"}
          </div>

          {activity.timeTaken && (
            <div className="text-[10px] text-slate-500 flex items-center gap-1 font-black uppercase tracking-widest">
              <span className="bg-white/80 border border-slate-100 px-2 py-0.5 rounded-lg shadow-sm">
                ⏱️ {activity.timeTaken} / {activity.totalDuration}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-300 group-hover:text-slate-900 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
      <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100 shadow-sm">
        <History className="w-7 h-7 text-slate-300" />
      </div>
      <p className="font-black text-sm uppercase tracking-widest">{message}</p>
    </div>
  );
}

export default function AnalyticsDashboardClient({ analytics }: AnalyticsDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('ALL');
  const [masteryTab, setMasteryTab] = React.useState<'strong' | 'weak'>('strong');

  if (!analytics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Sign in to view analytics</h2>
          <Button onClick={() => router.push('/login')} className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-black hover:scale-105 transition-transform">
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
      label: "Avg. Score",
      value: `${overallScore}%`,
      icon: <BarChart3 className="w-5 h-5 text-emerald-600" />,
      trend: "Overall Performance",
      accent: "bg-emerald-50/50 border-emerald-100/50 text-emerald-700",
      iconBg: "bg-emerald-100 shadow-sm shadow-emerald-100",
      trendStyle: "text-emerald-700 bg-emerald-100/50 border border-emerald-200/50",
    },
    {
      label: "Completion",
      value: `${syllabusCoverage}%`,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      trend: "Syllabus Covered",
      accent: "bg-amber-50/50 border-amber-100/50 text-amber-700",
      iconBg: "bg-amber-100 shadow-sm shadow-amber-100",
      trendStyle: "text-amber-700 bg-amber-100/50 border border-amber-200/50",
    },
    {
      label: "Tests Taken",
      value: totalTests.toString(),
      icon: <Target className="w-5 h-5 text-indigo-600" />,
      trend: "Total Attempts",
      accent: "bg-indigo-50/50 border-indigo-100/50 text-indigo-700",
      iconBg: "bg-indigo-100 shadow-sm shadow-indigo-100",
      trendStyle: "text-indigo-700 bg-indigo-100/50 border border-indigo-200/50",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">Performance Analytics</h2>
          <p className="text-slate-500 text-lg font-medium">Detailed breakdown of your test history and subject mastery.</p>
        </div>
        <Button
          size="lg"
          className="bg-slate-900 text-white px-8 py-7 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 border-4 border-white"
          onClick={() => router.push('/syllabus/quiz')}
        >
          <TrendingUp className="w-5 h-5" /> Take New Test
        </Button>
      </motion.div>

      {/* ===== Stats Grid ===== */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {overviewStats.map((stat, idx) => (
          <motion.div key={idx} variants={item}>
            <Card className={cn("border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white group", stat.accent)}>
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3", stat.iconBg)}>
                    {stat.icon}
                  </div>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md", stat.trendStyle)}>
                    {stat.trend}
                  </span>
                </div>
                <div className="text-4xl font-black text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ===== Main Content Split ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* mastery Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-900 border-0 shadow-2xl rounded-[3rem] overflow-hidden flex flex-col h-full ring-1 ring-slate-800">
            <CardHeader className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50 p-10 pb-6">
               <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-white uppercase tracking-tighter">Subject Mastery</CardTitle>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Across all attempts</p>
                </div>
                <div className="text-4xl font-black text-white bg-indigo-500/10 px-6 py-3 rounded-3xl border border-indigo-500/20">{overallScore}%</div>
              </div>
              {/* Strong / Weak Tabs */}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setMasteryTab('strong')}
                  className={cn(
                    "px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
                    masteryTab === 'strong'
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "bg-slate-800/50 text-slate-500 border-slate-700/50 hover:text-slate-300"
                  )}
                >
                  💪 Strong ({strongAreas.length})
                </button>
                <button
                  onClick={() => setMasteryTab('weak')}
                  className={cn(
                    "px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
                    masteryTab === 'weak'
                      ? "bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                      : "bg-slate-800/50 text-slate-500 border-slate-700/50 hover:text-slate-300"
                  )}
                >
                  🔥 Weak ({weakAreas.length})
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-[400px]">
                <div className="p-10 space-y-10">
                  {displayedMastery.map((m: any, i: number) => (
                    <div key={i} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <span className="text-slate-200 font-black text-lg leading-none">{m.name}</span>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mastery Level</div>
                        </div>
                        <span className={cn(
                          "font-black text-sm uppercase tracking-widest px-3 py-1 rounded-full border",
                          m.percentage >= 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                          m.percentage >= 60 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                        )}>
                          {m.percentage}%
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${m.percentage}%` }}
                          transition={{ duration: 1.5, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            m.percentage >= 80 ? "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]" :
                            m.percentage >= 60 ? "bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]" :
                            "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  {displayedMastery.length === 0 && mastery.length > 0 && (
                    <div className="text-center py-16 bg-slate-800/30 rounded-[2.5rem] border border-slate-800/50">
                       <p className="text-2xl mb-3">{masteryTab === 'strong' ? '🎯' : '🎉'}</p>
                       <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
                         {masteryTab === 'strong' ? 'Keep practicing to build strong areas!' : 'No weak areas — great job!'}
                       </p>
                    </div>
                  )}
                  {mastery.length === 0 && (
                    <div className="text-center py-20 bg-slate-800/30 rounded-[2.5rem] border border-slate-800/50">
                       <Lightbulb className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                       <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Unlock Mastery Insights</p>
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
          <Card className="border-0 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[3rem] overflow-hidden flex flex-col flex-1 ring-1 ring-slate-100">
             <CardHeader className="bg-white/50 backdrop-blur-md border-b border-slate-50 p-10 pb-6">
                <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
                  <History className="w-7 h-7 text-indigo-500" /> Recent Test History
                </CardTitle>
                <div className="flex gap-2 overflow-x-auto mt-6 pb-2 scrollbar-hide">
                  {['ALL', 'UNIT', 'TOPIC', 'CSAT', 'PYQ'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border shrink-0",
                        activeTab === tab
                          ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-800 hover:text-slate-800 hover:bg-slate-50"
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
                    <TopicGroupedList history={filteredHistory} onNavigate={(id) => router.push(`/syllabus/analytics/history/${id}`)} />
                  ) : (
                    <FlatTestList history={filteredHistory} onNavigate={(id) => router.push(`/syllabus/analytics/history/${id}`)} />
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
          <Card className="bg-slate-950 text-white rounded-[3.5rem] p-10 md:p-16 border-[6px] border-white shadow-[0_40px_80px_rgba(0,0,0,0.1)] relative overflow-hidden ring-1 ring-slate-900">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                  <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-inner group">
                      <Target className="w-10 h-10 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 space-y-6 text-center md:text-left">
                      <div className="space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400">Personalized Insights</span>
                        <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Smart Coach Recommendations</h3>
                      </div>
                      <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed italic max-w-4xl">
                        &quot;{aiSuggestion}&quot;
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                          <span className="text-xs font-black uppercase tracking-widest text-white">{weakAreas.length} Weak Areas Identified</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                          <History className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-black uppercase tracking-widest text-white">{totalTests} Tests Completed</span>
                        </div>
                      </div>
                  </div>
                  <Button
                    size="lg"
                    className="h-20 px-12 bg-white text-slate-950 hover:bg-slate-100 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-white/10 shadow-2xl transition-all hover:scale-105 active:scale-95"
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

function TopicGroupedList({ history, onNavigate }: { history: any[]; onNavigate: (id: string) => void }) {
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
            <div className="bg-slate-50/80 px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 sticky top-0 z-10 backdrop-blur-md border-b border-slate-100">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
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

function FlatTestList({ history, onNavigate }: { history: any[]; onNavigate: (id: string) => void }) {
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
