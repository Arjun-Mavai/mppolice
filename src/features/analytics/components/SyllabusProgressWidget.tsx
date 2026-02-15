'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCw, CheckCircle2, Circle, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

interface SyllabusProgressWidgetProps {
  data: {
    revisedTopicsCount: number;
    totalRevisions: number;
  } | null;
  totalTopics: number;
}

export function SyllabusProgressWidget({ data, totalTopics }: SyllabusProgressWidgetProps) {
  const revised = data?.revisedTopicsCount || 0;
  const totalRevisions = data?.totalRevisions || 0;

  const percent = Math.min(100, Math.round((revised / (totalTopics || 1)) * 100));
  const untouched = Math.max(0, totalTopics - revised);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="overflow-hidden rounded-[3rem] border-0 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
        <CardHeader className="border-b border-slate-50 bg-white/50 p-10 pb-6 backdrop-blur-md">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <CardTitle className="flex items-center gap-4 text-2xl font-black tracking-tighter text-slate-900 uppercase">
              <RotateCw className="h-7 w-7 text-emerald-500" />
              Syllabus Revision
            </CardTitle>
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-2 text-[11px] font-black tracking-widest text-emerald-700 uppercase shadow-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              {totalRevisions} Total Revisions
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-10">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            {/* Circular Progress */}
            <div className="relative flex h-48 w-48 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#grad1)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: percent / 100 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                />
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-900">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="text-5xl font-black tracking-tighter"
                >
                  {percent}%
                </motion.span>
                <span className="mt-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  Mastery
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid w-full flex-1 grid-cols-1 gap-6 md:grid-cols-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="group rounded-[2.5rem] border border-slate-100/50 bg-slate-50 p-8 shadow-inner transition-all"
              >
                <div className="mb-4 flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  Revised
                </div>
                <div className="flex items-baseline gap-2 text-4xl font-black text-slate-900">
                  {revised}
                  <span className="text-sm font-black text-slate-300">/ {totalTopics}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed font-bold text-slate-500">
                  Topics covered in your revision schedule.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="group rounded-[2.5rem] border border-slate-100/50 bg-slate-50 p-8 shadow-inner transition-all"
              >
                <div className="mb-4 flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 text-slate-400 transition-transform group-hover:rotate-12">
                    <Layers className="h-4 w-4" />
                  </div>
                  Remaining
                </div>
                <div className="text-4xl font-black text-slate-900">{untouched}</div>
                <p className="mt-2 text-xs leading-relaxed font-bold text-slate-500">
                  Topics yet to be touched in focus mode.
                </p>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
