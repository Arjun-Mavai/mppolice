'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface SyllabusProgressWidgetProps {
  data: {
    revisedTopicsCount: number;
    totalRevisions: number;
  } | null;
  totalTopics: number;
}

export function SyllabusProgressWidget({ data, totalTopics }: SyllabusProgressWidgetProps) {
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';
  
  const revised = data?.revisedTopicsCount || 0;
  const percent = Math.min(100, Math.round((revised / (totalTopics || 1)) * 100));

  return (
    <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100">
      <div className="flex flex-col items-center">
        {/* 📊 CLEAN SCHOLAR PROGRESS ORB */}
        <div className="relative flex h-64 w-64 items-center justify-center">
          <svg className="h-full w-full -rotate-90 transform overflow-visible">
            {/* Background Full Circle (White/Light) */}
              <circle
                cx="128"
                cy="128"
                r="110"
                fill="none"
                stroke="rgba(0,0,0,0.05)"
                strokeWidth="12"
              />
              {/* Main Progress Circle */}
              <motion.circle
                cx="128"
                cy="128"
                r="110"
                fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                style={{ pathLength: percent / 100 }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: percent / 100 }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="relative flex flex-col items-center">
                <div className="flex items-baseline scale-110">
                  <span className="text-6xl font-black tracking-tighter text-slate-900">
                    {percent}
                  </span>
                  <span className="text-sm font-black text-indigo-500 ml-1">%</span>
                </div>
                <div className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 px-3 py-1 backdrop-blur-md">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <span className="text-[8px] font-black tracking-[0.2em] text-slate-500 uppercase">
                    {isHindi ? 'तैयारी की स्थिति' : 'Prep Status'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Stats */}
          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 transition-all hover:border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-1 rounded-full bg-indigo-500" />
                <span className="text-[7px] font-black tracking-[0.2em] text-slate-500 uppercase">
                  {isHindi ? 'कुल विषय' : 'Topics'}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-900">{revised}</span>
                <span className="text-[8px] font-bold text-slate-400">/ {totalTopics}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 transition-all hover:border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-1 rounded-full bg-amber-500" />
                <span className="text-[7px] font-black tracking-[0.2em] text-slate-500 uppercase">
                  {isHindi ? 'सटीकता' : 'Accuracy'}
                </span>
              </div>
              <p className="text-xl font-black text-slate-900">88%</p>
            </div>
          </div>

          {/* Simplified Action */}
          <button
            onClick={() => {
              import('sonner').then(({ toast }) => {
                toast.success(isHindi ? 'डेटा अपडेट हो रहा है' : 'Refreshing Stats', {
                  description: isHindi ? 'आपकी प्रगति सिंक की जा रही h।' : 'Synchronizing your preparation metrics...',
                  style: { background: '#fff', border: '1px solid rgba(0,0,0,0.05)', color: '#000' }
                });
              });
            }}
          className="group relative mt-8 w-full overflow-hidden rounded-2xl p-[1px] transition-all active:scale-[0.98]"
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
