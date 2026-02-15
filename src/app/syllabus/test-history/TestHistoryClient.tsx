'use client';

import React from 'react';
import { Clock, ChevronRight, History, TrendingUp, Trophy } from 'lucide-react';
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
  if (accuracy >= 80)
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      ring: 'ring-emerald-100',
    };
  if (accuracy >= 60)
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
      ring: 'ring-amber-100',
    };
  return {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-200',
    ring: 'ring-rose-100',
  };
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
      <div className="flex min-h-screen items-center justify-center bg-white pt-14">
        <div className="space-y-4 px-6 text-center">
          <History className="mx-auto h-12 w-12 text-slate-300" />
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
    <div className="min-h-screen bg-white pt-20 pb-20 font-sans">
      {/* Header — compact, sticky below navbar */}
      <div className="sticky top-14 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Test History</h1>
              <p className="text-xs text-slate-400">
                {totalTests} tests • {overallScore}% avg
              </p>
            </div>
            <Button
              size="sm"
              className="h-8 rounded-full bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800"
              onClick={() => router.push('/syllabus/quiz')}
            >
              <TrendingUp className="mr-1.5 h-3.5 w-3.5" /> New Test
            </Button>
          </div>

          {/* Filter tabs — pill style */}
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
            {['ALL', 'UNIT', 'TOPIC', 'CSAT', 'PYQ'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all',
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                )}
              >
                {tabLabel(tab)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Test List */}
      <div className="mx-auto max-w-2xl">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-3 px-6 py-20 text-slate-400">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <History className="h-7 w-7 text-slate-300" />
            </div>
            <p className="text-sm font-medium">No tests found in this category</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/syllabus/quiz')}
              className="rounded-full"
            >
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
                  <div className="sticky top-[7.5rem] z-20 border-b border-slate-100 bg-slate-50/95 px-4 py-2 backdrop-blur-sm">
                    <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                      {unitName}
                    </span>
                  </div>
                  {items.map((activity: any, idx: number) => (
                    <TestHistoryRow
                      key={idx}
                      activity={activity}
                      onClick={() => router.push(`/syllabus/analytics/history/${activity.id}`)}
                      hi={hi}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          /* Flat list */
          <div className="divide-y divide-slate-50">
            {filteredHistory.map((activity: any, idx: number) => (
              <TestHistoryRow
                key={idx}
                activity={activity}
                onClick={() => router.push(`/syllabus/analytics/history/${activity.id}`)}
                showType
                hi={hi}
              />
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
function TestHistoryRow({
  activity,
  onClick,
  showType,
  hi,
}: {
  activity: any;
  onClick: () => void;
  showType?: boolean;
  hi?: boolean;
}) {
  const accuracy = Math.round((activity.score / (activity.totalMarks || 1)) * 100);
  const colors = accuracyColor(accuracy);
  const title = hi
    ? activity.testTitleHi || activity.testTitle || 'Practice Test'
    : activity.testTitle || 'Practice Test';

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-3.5 px-4 py-4 transition-colors active:bg-slate-50"
    >
      {/* Accuracy circle */}
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold ring-2',
          colors.bg,
          colors.text,
          colors.border,
          colors.ring
        )}
      >
        {accuracy}%
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="truncate text-[15px] leading-snug font-semibold text-slate-900 group-active:text-slate-600">
          {title}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          {showType && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold tracking-wider text-slate-500 uppercase">
              {typeLabel(activity.type)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {new Date(activity.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {activity.timeTaken && <span>⏱️ {activity.timeTaken}</span>}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-active:text-slate-500" />
    </div>
  );
}
