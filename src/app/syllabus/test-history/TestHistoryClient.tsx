"use client";

import React from 'react';
import {
  Clock,
  ChevronRight,
  History,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test History Page — Standalone, mobile-first
// Yeh page sirf test history dikhata hai, clean & focused
// Dashboard se alag — yaha full screen space milta hai
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Accuracy → color mapping
function accuracyColor(accuracy: number) {
  if (accuracy >= 80) return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", ring: "ring-emerald-100" };
  if (accuracy >= 60) return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", ring: "ring-amber-100" };
  return { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", ring: "ring-rose-100" };
}

// Tab labels
function tabLabel(tab: string) {
  if (tab === 'ALL') return 'All';
  if (tab === 'UNIT') return 'Unit';
  if (tab === 'TOPIC') return 'Topic';
  return tab;
}

function typeLabel(type: string) {
  if (type === 'UNIT') return 'Unit';
  if (type === 'TOPIC') return 'Topic';
  if (type === 'CSAT') return 'CSAT';
  if (type === 'PYQ') return 'PYQ';
  return 'Test';
}

interface TestHistoryClientProps {
  analytics: any;
}

export function TestHistoryClient({ analytics }: TestHistoryClientProps) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  const [activeTab, setActiveTab] = React.useState('ALL');

  if (!analytics) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-14">
        <div className="text-center space-y-4 px-6">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Sign in to view history</h2>
          <Button onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  const { overallScore, totalTests, recentActivity } = analytics;

  const filteredHistory = recentActivity.filter((item: any) => {
    if (activeTab === 'ALL') return true;
    return item.type === activeTab;
  });

  // Group by unit for TOPIC tab
  const grouped: Record<string, any[]> = {};
  if (activeTab === 'TOPIC') {
    filteredHistory.forEach((item: any) => {
      const key = item.unitId || 'other';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
  }

  const groupedKeys = Object.keys(grouped).sort((a, b) => {
    const na = parseInt(a.replace('unit_', '')) || 999;
    const nb = parseInt(b.replace('unit_', '')) || 999;
    return na - nb;
  });

  return (
    <div className="min-h-screen bg-white font-sans pb-20 pt-20">
      {/* Header — compact, sticky below navbar */}
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Test History</h1>
              <p className="text-xs text-slate-400">{totalTests} tests • {overallScore}% avg</p>
            </div>
            <Button
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-full px-4 h-8"
              onClick={() => router.push('/syllabus/quiz')}
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> New Test
            </Button>
          </div>

          {/* Filter tabs — pill style */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {['ALL', 'UNIT', 'TOPIC', 'CSAT', 'PYQ'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                  activeTab === tab
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {tabLabel(tab)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Test List */}
      <div className="max-w-2xl mx-auto">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3 px-6">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
              <History className="w-7 h-7 text-slate-300" />
            </div>
            <p className="font-medium text-sm">No tests found in this category</p>
            <Button variant="outline" size="sm" onClick={() => router.push('/syllabus/quiz')} className="rounded-full">
              Take a Test
            </Button>
          </div>
        ) : activeTab === 'TOPIC' ? (
          /* Grouped by unit */
          <div>
            {groupedKeys.map((unitKey) => {
              const items = grouped[unitKey];
              const unitName = items[0]?.unitName || unitKey;
              return (
                <div key={unitKey}>
                  <div className="sticky top-[7.5rem] z-20 bg-slate-50/95 backdrop-blur-sm px-4 py-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{unitName}</span>
                  </div>
                  {items.map((activity: any, idx: number) => (
                    <TestHistoryRow key={idx} activity={activity} onClick={() => router.push(`/syllabus/analytics/history/${activity.id}`)} hi={hi} />
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          /* Flat list */
          <div className="divide-y divide-slate-50">
            {filteredHistory.map((activity: any, idx: number) => (
              <TestHistoryRow key={idx} activity={activity} onClick={() => router.push(`/syllabus/analytics/history/${activity.id}`)} showType hi={hi} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Single test row — generous touch target, clear hierarchy
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TestHistoryRow({ activity, onClick, showType, hi }: { activity: any; onClick: () => void; showType?: boolean; hi?: boolean }) {
  const accuracy = Math.round((activity.score / (activity.totalMarks || 1)) * 100);
  const colors = accuracyColor(accuracy);
  const title = hi ? (activity.testTitleHi || activity.testTitle || "Practice Test") : (activity.testTitle || "Practice Test");

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3.5 px-4 py-4 active:bg-slate-50 transition-colors cursor-pointer group"
    >
      {/* Accuracy circle */}
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm border shrink-0 ring-2",
        colors.bg, colors.text, colors.border, colors.ring,
      )}>
        {accuracy}%
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="font-semibold text-slate-900 text-[15px] leading-snug truncate group-active:text-slate-600">
          {title}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          {showType && (
            <span className="font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {typeLabel(activity.type)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          {activity.timeTaken && (
            <span>⏱️ {activity.timeTaken}</span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-300 group-active:text-slate-500 shrink-0" />
    </div>
  );
}
