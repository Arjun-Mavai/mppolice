import React from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Play, Sparkles, BookOpen } from 'lucide-react';

interface DashboardActionCardProps {
  totalTests?: number;
}

export function DashboardActionCard({ totalTests = 0 }: DashboardActionCardProps) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 p-8 shadow-sm transition-all hover:shadow-md">
      {/* Soft Light Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-transparent group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
          <Sparkles className="h-7 w-7 text-indigo-500" />
        </div>

        <h4 className="text-2xl font-black leading-tight tracking-tight text-slate-900">
          {hi ? 'अगली तैयारी!' : "Next Goal?"}
        </h4>

        <div className="mt-3 flex items-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm border border-slate-100">
          <BookOpen size={12} strokeWidth={3} />
          <span>
            {totalTests} {hi ? 'टेस्ट पूरे किए' : 'Tests Done'}
          </span>
        </div>

        <button 
          onMouseEnter={() => router.prefetch('/syllabus/quiz/full-tests?tab=subject')}
          onClick={() => router.push('/syllabus/quiz/full-tests?tab=subject')}
          className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95"
        >
          <Play size={16} className="fill-current" />
          {hi ? 'शुरू करें' : 'Start Now'}
        </button>
      </div>
    </div>
  );
}
