'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, ChevronRight, Trophy, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

interface RevisionHeroCardProps {
  stats: {
    revisedFactsCount: number;
    totalFacts: number;
    totalRevisions: number;
  } | null;
}

export function RevisionHeroCard({ stats }: RevisionHeroCardProps) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  const revised = stats?.revisedFactsCount || 0;
  const total = stats?.totalFacts || 1100; // Fallback to 1100 if null during load
  
  const progressPercentRaw = (revised / (total || 1)) * 100;
  const progressPercent = Math.min(100, Math.round(progressPercentRaw));
  const progressPercentDisplay = progressPercentRaw > 0 && progressPercentRaw < 1 
    ? progressPercentRaw.toFixed(1) 
    : progressPercent.toString();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[3rem] bg-slate-900 p-8 shadow-2xl transition-all hover:shadow-indigo-500/20"
    >
      {/* 🌌 Animated Background Elements */}
      <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-700">
          <Zap className="h-40 w-40 text-white" />
      </div>
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    {hi ? 'डेली रिवीजन' : 'Next Revision Goal'}
                 </span>
              </div>

              <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white leading-tight">
                    {hi ? 'GK वन-लाइनर्स' : 'GK One-Liners'} <br/>
                    <span className="text-slate-400">
                      {hi ? 'तैयारी की प्रोग्रेस' : 'Mastery Tracker'}
                    </span>
                  </h2>
                  <p className="max-w-xs text-sm font-medium text-slate-500 leading-relaxed">
                    {hi 
                      ? `${revised} तथ्य पूरे हुए। अपनी सरकारी नौकरी की तैयारी को और मजबूत करें।` 
                      : `${revised} facts mastered. Push further to complete your MP Police preparation.`}
                  </p>
              </div>

              <button 
                onClick={() => router.push('/syllabus/revision')}
                className="flex items-center gap-3 rounded-full bg-white px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-900 shadow-xl transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95"
              >
                {hi ? 'रिवीजन जारी रखें' : 'Continue Revision'}
                <ChevronRight size={16} />
              </button>
          </div>

          {/* 📊 PROGRESS ORB (Premium Glassmorphism Style) */}
          <div className="flex items-center gap-8 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-inner">
              <div className="relative h-28 w-28 flex items-center justify-center group" role="progressbar">
                  <svg className="h-full w-full rotate-[-90deg]">
                      <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                      <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={314} strokeDashoffset={314 - (314 * progressPercentRaw) / 100} strokeLinecap="round" className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-white leading-none">{progressPercentDisplay}%</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">{hi ? 'पूर्ण' : 'Done'}</span>
                  </div>
              </div>
              
              <div className="space-y-4">
                  <div className="text-center md:text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{hi ? 'तथ्य पूरे हुए' : 'Facts Revised'}</p>
                      <p className="text-3xl font-black text-white leading-tight">
                        {revised}<span className="text-base text-slate-600 ml-1">/{total}</span>
                      </p>
                  </div>
                  <div className="h-px w-full bg-white/10" />
                  <div className="flex items-center justify-end gap-2 text-indigo-400">
                    <Trophy size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{hi ? 'बेस्ट स्कोर' : 'Performance'}</span>
                  </div>
              </div>
          </div>
      </div>
    </motion.div>
  );
}
