'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RotateCw, ChevronRight, Sparkles } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import Link from 'next/link';

interface SyllabusProgressWidgetProps {
  data: {
    revisedTopicsCount: number;
    totalTopicRevisions: number;
    oneLinerStats?: {
      revisedFactsCount: number;
      totalRevisions: number;
      totalFacts: number;
    };
  } | null;
  totalTopics: number;
}

export function SyllabusProgressWidget({ data, totalTopics }: SyllabusProgressWidgetProps) {
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';
  
  const revised = data?.revisedTopicsCount || 0;
  const topicPercent = Math.min(100, Math.round((revised / (totalTopics || 1)) * 100));

  const revisedFacts = data?.oneLinerStats?.revisedFactsCount || 0;
  const totalFacts = data?.oneLinerStats?.totalFacts || 0;
  const factsPercent = Math.min(100, Math.round((revisedFacts / (totalFacts || 1)) * 100));

  // Overall average for the main orb
  const overallPercent = Math.round((topicPercent + factsPercent) / 2);

  return (
    <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100">
      <div className="flex flex-col items-center">
        {/* 📊 PROGRESS ORB (Overall) */}
        <div className="relative flex h-64 w-64 items-center justify-center">
          <svg className="h-full w-full -rotate-90 transform overflow-visible">
              <circle
                cx="128"
                cy="128"
                r="110"
                fill="none"
                stroke="rgba(0,0,0,0.05)"
                strokeWidth="12"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="110"
                fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                style={{ pathLength: overallPercent / 100 }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: overallPercent / 100 }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="relative flex flex-col items-center">
                <div className="flex items-baseline scale-110">
                  <span className="text-6xl font-black tracking-tighter text-slate-900">
                    {overallPercent}
                  </span>
                  <span className="text-sm font-black text-indigo-500 ml-1">%</span>
                </div>
                <div className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 px-3 py-1 backdrop-blur-md">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <span className="text-[8px] font-black tracking-[0.2em] text-slate-500 uppercase">
                    {isHindi ? 'तैयारी की स्थिति' : 'Overall Progress'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Stats Grid */}
          <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Syllabus Topics */}
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 transition-all hover:border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-1 rounded-full bg-indigo-500" />
                <span className="text-[7px] font-black tracking-[0.2em] text-slate-500 uppercase">
                  {isHindi ? 'सिलेबस विषय' : 'Syllabus Topics'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900">{revised} / {totalTopics}</span>
                <span className="text-[10px] font-bold text-indigo-600">{topicPercent}%</span>
              </div>
              <div className="mt-2 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${topicPercent}%` }} />
              </div>
            </div>

            {/* GK One-Liners */}
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 transition-all hover:border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                <span className="text-[7px] font-black tracking-[0.2em] text-slate-500 uppercase">
                  {isHindi ? 'GK वन-लाइनर्स' : 'GK One-Liners'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900">{revisedFacts} / {totalFacts}</span>
                <span className="text-[10px] font-bold text-emerald-600">{factsPercent}%</span>
              </div>
              <div className="mt-2 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${factsPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Revision Hub Link */}
          <Link
            href="/syllabus/revision"
            className="group relative mt-6 w-full flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 transition-all hover:bg-white hover:border-indigo-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black tracking-[0.1em] text-slate-400 uppercase">
                  {isHindi ? 'विस्तृत रिपोर्ट' : 'Detailed Report'}
                </p>
                <p className="text-xs font-bold text-slate-900">
                  {isHindi ? 'रिवीजन हब देखें' : 'Visit Revision Hub'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
          </Link>

          {/* Refresh Action */}
          <button
            onClick={() => {
              window.location.reload();
            }}
          className="group relative mt-4 w-full overflow-hidden rounded-2xl p-[1px] transition-all active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-indigo-500/30 group-hover:opacity-100 opacity-60 transition-opacity" />
          <div className="relative flex items-center justify-center gap-3 bg-slate-900 rounded-[15px] py-4 text-[9px] font-black tracking-[0.3em] text-white uppercase transition-colors group-hover:bg-slate-800">
            <RotateCw className="h-3 w-3 text-emerald-400 group-hover:rotate-180 transition-transform duration-700" />
            {isHindi ? 'डेटा अपडेट करें' : 'Refresh Data'}
          </div>
        </button>
      </div>
    </div>
  );
}
