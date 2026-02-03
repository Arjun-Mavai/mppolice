'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCw, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SyllabusProgressWidgetProps {
  data: {
    revisedTopicsCount: number;
    totalRevisions: number;
  } | null;
  totalTopics: number;
}

export function SyllabusProgressWidget({ data, totalTopics }: SyllabusProgressWidgetProps) {
    console.log("revise count" , data)
  const revised = data?.revisedTopicsCount || 0;
  const totalRevisions = data?.totalRevisions || 0;
  
  // Calculate percentage
  const percent = Math.min(100, Math.round((revised / (totalTopics || 1)) * 100));
  const untouched = Math.max(0, totalTopics - revised);

  return (
    <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-50 bg-slate-50/30 pb-4">
        <div className="flex items-center justify-between">
             <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                 <RotateCw className="w-5 h-5 text-indigo-500" />
                 Syllabus Revision
             </CardTitle>
             <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                 {totalRevisions} Total Revisions
             </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
         <div className="flex flex-col md:flex-row gap-8 items-center">
             
             {/* Circular Progress */}
             <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                 <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                     {/* Background Circle */}
                     <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="#e2e8f0" 
                        strokeWidth="10" 
                     />
                     {/* Progress Circle */}
                     <motion.circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="#6366f1" 
                        strokeWidth="10"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: percent / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="drop-shadow-sm"
                     />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-900">
                     <span className="text-3xl font-black">{percent}%</span>
                     <span className="text-[10px] uppercase font-bold text-slate-400">Complete</span>
                 </div>
             </div>

             {/* Stats */}
             <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                 <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                     <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                         <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Touched
                     </div>
                     <div className="text-2xl font-black text-slate-900">
                         {revised} <span className="text-sm font-medium text-slate-400">/ {totalTopics}</span>
                     </div>
                     <div className="text-xs text-slate-400 mt-1">Topics revised at least once</div>
                 </div>

                 <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                     <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                         <Circle className="w-4 h-4 text-slate-400" /> Untouched
                     </div>
                     <div className="text-2xl font-black text-slate-900">
                         {untouched}
                     </div>
                     <div className="text-xs text-slate-400 mt-1">Topics pending revision</div>
                 </div>
             </div>
         </div>
      </CardContent>
    </Card>
  );
}
