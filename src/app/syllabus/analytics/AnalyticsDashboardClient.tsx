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

// -- Apun ka analytics dashboard, bhai. Sab kuch yahan dikhta hai --

interface AnalyticsDashboardClientProps {
  analytics: any;
}

// Accuracy ka color decide karta hai — green = mast, amber = theek, red = danger zone
function accuracyStyle(accuracy: number) {
  if (accuracy >= 80) return "bg-emerald-50 text-emerald-600 border-emerald-200";
  if (accuracy >= 60) return "bg-amber-50 text-amber-600 border-amber-200";
  return "bg-rose-50 text-rose-600 border-rose-200";
}

// Tab ka label friendly banata hai — "UNIT" bolega toh "Unit Wise" dikhayega
function tabLabel(tab: string) {
  if (tab === 'ALL') return 'All Tests';
  if (tab === 'UNIT') return 'Unit Wise';
  if (tab === 'TOPIC') return 'Topic Wise';
  return tab;
}

// Test type ka chhota label — "UNIT" → "Unit Test", "PYQ" → "PYQ"
function typeLabel(type: string) {
  if (type === 'UNIT') return 'Unit Test';
  if (type === 'TOPIC') return 'Topic Test';
  if (type === 'CSAT') return 'CSAT';
  if (type === 'PYQ') return 'PYQ';
  return 'Test';
}

// ========== Chhote reusable pieces — card ke andar jo cheezein repeat hoti hai ==========

// Ek test row — history list mein har test ka ek line item
function TestRow({ activity, onClick, showType }: { activity: any; onClick: () => void; showType?: boolean }) {
  const accuracy = Math.round((activity.score / (activity.totalMarks || 1)) * 100);

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        {/* Accuracy badge — rang se pata chalta hai kaisa gaya */}
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs border shrink-0",
          accuracyStyle(accuracy),
        )}>
          {accuracy}%
        </div>

        <div className="min-w-0">
          {/* Type label + date — test ka type aur kab diya */}
          {showType && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                {typeLabel(activity.type)}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}

          {!showType && (
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock size={10} />
              {new Date(activity.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
            </div>
          )}

          <div className="font-bold text-slate-900 text-sm group-hover:text-slate-700 transition-colors truncate pr-4">
            {activity.testTitle || "Practice Test"}
          </div>

          {/* Time liya kitna — agar data hai toh dikhao */}
          {activity.timeTaken && (
            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
              <span className="bg-slate-100 px-1.5 rounded-sm flex items-center gap-1 border border-slate-200">
                ⏱️ {activity.timeTaken} / {activity.totalDuration}
              </span>
            </div>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all shrink-0" />
    </div>
  );
}

// Jab koi test nahi milta — empty state ka placeholder
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
        <History className="w-6 h-6 text-slate-300" />
      </div>
      <p className="font-medium text-sm">{message}</p>
    </div>
  );
}

// ========== Main Dashboard Component — poora page yahan se render hota hai ==========

export default function AnalyticsDashboardClient({ analytics }: AnalyticsDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('ALL');

  // Login nahi kiya toh seedha login page pe bhejo
  if (!analytics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Sign in to view analytics</h2>
          <Button onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  const { overallScore, totalTests, mastery, recentActivity, aiSuggestion } = analytics;

  // Syllabus ka kitna cover hua — har test se 5% maan ke chalte hai, max 100
  const syllabusCoverage = Math.min(totalTests * 5, 100);

  const filteredHistory = recentActivity.filter((item: any) => {
    if (activeTab === 'ALL') return true;
    return item.type === activeTab;
  });

  // Kamzor subjects — 50% se neeche waale top 3
  const weakAreas = mastery.filter((m: any) => m.percentage < 50).slice(0, 3);

  // Stat cards ka config — har card ko alag rang diya for visual hierarchy
  const overviewStats = [
    {
      label: "Avg. Score",
      value: `${overallScore}%`,
      icon: <BarChart3 className="w-4 h-4 text-emerald-600" />,
      trend: "Overall Performance",
      accent: "bg-emerald-50 border-emerald-200 text-emerald-700",
      iconBg: "bg-emerald-100",
      trendStyle: "text-emerald-700 bg-emerald-100",
    },
    {
      label: "Completion",
      value: `${syllabusCoverage}%`,
      icon: <Clock className="w-4 h-4 text-amber-600" />,
      trend: "Syllabus Covered",
      accent: "bg-amber-50 border-amber-200 text-amber-700",
      iconBg: "bg-amber-100",
      trendStyle: "text-amber-700 bg-amber-100",
    },
    {
      label: "Tests Taken",
      value: totalTests.toString(),
      icon: <Target className="w-4 h-4 text-slate-600" />,
      trend: "Total Attempts",
      accent: "bg-slate-50 border-slate-200 text-slate-700",
      iconBg: "bg-slate-100",
      trendStyle: "text-slate-600 bg-slate-100",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto space-y-8">

        {/* ===== Header + Take New Test button ===== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-display">Performance Analytics</h1>
            <p className="text-slate-500">Track your progress and identify areas for improvement.</p>
          </div>
          <Button
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold shadow-lg shadow-slate-200"
            onClick={() => router.push('/syllabus/quiz')}
          >
            <TrendingUp className="w-4 h-4 mr-2" /> Take New Test
          </Button>
        </div>

        {/* ===== Subject Mastery + Critical Focus — side by side at the top ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Subject Mastery — dark card, har subject ka progress bar with glow */}
          <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-800 pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Subject Mastery</CardTitle>
                  <p className="text-xs text-slate-400 mt-1">Overall Strength</p>
                </div>
                <div className="text-2xl font-black text-white">{overallScore}%</div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                <div className="p-6 space-y-6">
                  {mastery.map((m: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-300">{m.name}</span>
                        <span className={cn(
                          "font-bold text-xs uppercase tracking-wider",
                          m.percentage >= 80 ? "text-emerald-400" :
                          m.percentage >= 60 ? "text-amber-400" : "text-rose-400"
                        )}>
                          {m.percentage >= 80 ? 'Mastered' : m.percentage >= 60 ? 'Strong' : 'Needs Focus'} ({m.percentage}%)
                        </span>
                      </div>
                      {/* Animated progress bar — glow effect with mastery level color */}
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${m.percentage}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={cn(
                            "h-full rounded-full",
                            m.percentage >= 80 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" :
                            m.percentage >= 60 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" :
                            "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  {mastery.length === 0 && (
                    <div className="text-center py-10 text-slate-600 italic text-sm">
                      Start taking tests to unlock mastery insights!
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Critical Focus — kamzor areas, red accents se urgent feel */}
          {weakAreas.length > 0 ? (
            <Card className="border-rose-200 shadow-sm bg-gradient-to-br from-rose-50/60 to-slate-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  Critical Focus
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full ml-auto">
                    {weakAreas.length} weak
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {weakAreas.map((area: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-white p-3 rounded-lg border border-rose-100 shadow-sm">
                    <span className="font-medium text-slate-700">{area.name}</span>
                    {/* Plain span instead of Badge — Turbopack cache issue fix */}
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                      {area.percentage}%
                    </span>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full mt-1 bg-white hover:bg-rose-50 text-rose-700 border-rose-200 font-semibold"
                  onClick={() => router.push('/syllabus/quiz/units')}
                >
                  Improve Weak Areas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-50/60 to-slate-50 flex items-center justify-center">
              <CardContent className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">All Areas Strong!</h3>
                <p className="text-sm text-slate-500">No weak subjects detected. Keep up the great work! 🎉</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ===== Stats Grid — score, completion, tests taken — warm accent colors ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {overviewStats.map((stat, idx) => (
            <Card key={idx} className={cn("border shadow-sm hover:shadow-md transition-shadow", stat.accent)}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className={cn("p-2 rounded-xl", stat.iconBg)}>{stat.icon}</div>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full", stat.trendStyle)}>
                    {stat.trend}
                  </span>
                </div>
                <div className="text-3xl font-bold mb-0.5">{stat.value}</div>
                <div className="text-sm font-medium opacity-70">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ===== Bottom section — Test History + AI Coach & Study Tip sidebar ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ===== Recent Test History — sab tests ka record, filter tabs ke saath ===== */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-slate-600" /> Recent Test History
                </CardTitle>

                {/* Category tabs — filter karo test type se */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['ALL', 'UNIT', 'TOPIC', 'CSAT', 'PYQ'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                        activeTab === tab
                          ? "bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-200"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      {tabLabel(tab)}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  {activeTab === 'TOPIC' ? (
                    <TopicGroupedList history={filteredHistory} onNavigate={(id) => router.push(`/syllabus/analytics/history/${id}`)} />
                  ) : (
                    <FlatTestList history={filteredHistory} onNavigate={(id) => router.push(`/syllabus/analytics/history/${id}`)} />
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* ===== Right Sidebar — AI Coach + Study Tip ===== */}
          <div className="space-y-6">

            {/* AI Coach — dark card, motivational gyaan */}
            <Card className="bg-slate-950 text-white border-2 border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <CardContent className="p-8 text-center space-y-6 relative z-10">
                <div className="w-16 h-16 bg-slate-800/20 rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-slate-500/20">
                  <Target className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-black text-xl tracking-tight">AI Coach Says:</h3>
                  <p className="text-slate-400 text-sm leading-relaxed italic">&ldquo;{aiSuggestion}&rdquo;</p>
                </div>
                <Button
                  className="w-full h-12 bg-slate-800 text-white hover:bg-slate-700 font-black uppercase tracking-widest text-[11px] rounded-xl shadow-lg shadow-slate-800/20"
                  onClick={() => router.push('/syllabus/quiz')}
                >
                  START TEST SERIES
                </Button>
              </CardContent>
            </Card>

            {/* Study Tip — quick contextual advice */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Quick Study Tip</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {totalTests < 5
                    ? "Start with topic-wise tests to build fundamentals before attempting unit tests."
                    : overallScore < 60
                    ? "Focus on your weak subjects first. Revise concepts, then attempt more tests."
                    : "Great progress! Try full-length mock tests to build exam stamina."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== Topic tests grouped by unit — unit ke andar topics dikhata hai ==========

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
    <div className="divide-y divide-slate-100">
      {sortedKeys.map((unitKey) => {
        const groupItems = grouped[unitKey];
        const unitName = groupItems[0]?.unitName || unitKey;

        return (
          <div key={unitKey} className="border-b border-slate-100 last:border-0">
            {/* Unit ka header — sticky rehta hai scroll pe */}
            <div className="bg-slate-50/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-100">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              {unitName}
            </div>
            <div className="divide-y divide-slate-50">
              {groupItems.map((activity: any, idx: number) => (
                <div key={idx} className="pl-4">
                  <TestRow activity={activity} onClick={() => onNavigate(activity.id)} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== Flat test list — simple list, no grouping, ALL/UNIT/CSAT/PYQ ke liye ==========

function FlatTestList({ history, onNavigate }: { history: any[]; onNavigate: (id: string) => void }) {
  if (history.length === 0) {
    return <EmptyState message="No tests found in this category." />;
  }

  return (
    <div className="divide-y divide-slate-100">
      {history.map((activity: any, idx: number) => (
        <TestRow key={idx} activity={activity} onClick={() => onNavigate(activity.id)} showType />
      ))}
    </div>
  );
}
