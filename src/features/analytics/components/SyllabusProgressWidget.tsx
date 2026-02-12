'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCw, CheckCircle2, Circle, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { logger } from "@/lib/logger";
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
      <Card className="border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white rounded-[3rem] overflow-hidden ring-1 ring-slate-100">
        <CardHeader className="border-b border-slate-50 bg-white/50 backdrop-blur-md p-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
                   <RotateCw className="w-7 h-7 text-emerald-500" />
                   Syllabus Revision
               </CardTitle>
               <div className="bg-emerald-50 text-emerald-700 px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   {totalRevisions} Total Revisions
               </div>
          </div>
        </CardHeader>
        <CardContent className="p-10">
           <div className="flex flex-col lg:flex-row gap-12 items-center">
               
               {/* Circular Progress */}
               <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                   <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                       <circle 
                          cx="50" cy="50" r="42" 
                          fill="none" 
                          stroke="#f1f5f9" 
                          strokeWidth="8" 
                       />
                       <motion.circle 
                          cx="50" cy="50" r="42" 
                          fill="none" 
                          stroke="url(#grad1)" 
                          strokeWidth="8"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: percent / 100 }}
                          transition={{ duration: 2, ease: "easeOut" }}
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
                       <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mt-1">Mastery</span>
                   </div>
               </div>

               {/* Stats */}
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                   <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100/50 shadow-inner group transition-all"
                   >
                       <div className="flex items-center gap-3 mb-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                           <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-4 h-4" />
                           </div>
                           Revised
                       </div>
                       <div className="text-4xl font-black text-slate-900 flex items-baseline gap-2">
                           {revised} 
                           <span className="text-sm font-black text-slate-300">/ {totalTopics}</span>
                       </div>
                       <p className="text-xs text-slate-500 font-bold mt-2 leading-relaxed">
                        Topics covered in your revision schedule.
                       </p>
                   </motion.div>

                   <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100/50 shadow-inner group transition-all"
                   >
                       <div className="flex items-center gap-3 mb-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 group-hover:rotate-12 transition-transform">
                                <Layers className="w-4 h-4" />
                            </div>
                            Remaining
                       </div>
                       <div className="text-4xl font-black text-slate-900">
                           {untouched}
                       </div>
                       <p className="text-xs text-slate-500 font-bold mt-2 leading-relaxed">
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
