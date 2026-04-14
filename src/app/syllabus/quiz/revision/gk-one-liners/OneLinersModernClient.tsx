'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2,
  Layers,
  LayoutList,
  RotateCw,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getPublishedMppoliceOneLiners, type MppoliceOneLinerRow } from '@/features/revision/actions/mppolice-one-liners';
import { markOneLinerRevised, getOneLinerRevisionMap, getUserOneLinerProgress } from '@/features/revision/actions/mppolice-one-liner-revisions';
import { MPPOLICE_ONELINER_SUBJECTS } from '@/features/revision/constants/mppolice-one-liners';
import { toast } from 'sonner';

// 🚀 PERFORMANCE: Lazy load heavy components
const FlipCard = dynamic(() => import('@/components/FlipCard'), { 
  ssr: false,
  loading: () => <div className="h-[450px] w-full animate-pulse rounded-[3rem] bg-slate-100" />
});

const Select = dynamic(() => import('@/components/ui/select').then(m => m.Select), { ssr: false });
const SelectContent = dynamic(() => import('@/components/ui/select').then(m => m.SelectContent), { ssr: false });
const SelectItem = dynamic(() => import('@/components/ui/select').then(m => m.SelectItem), { ssr: false });
const SelectTrigger = dynamic(() => import('@/components/ui/select').then(m => m.SelectTrigger), { ssr: false });
const SelectValue = dynamic(() => import('@/components/ui/select').then(m => m.SelectValue), { ssr: false });

const PAGE_SIZE = 50;

interface Props {
  facts: MppoliceOneLinerRow[];
  counts: Record<string, number>;
  initialSubject: string;
}

const colorVariants = [
  { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: 'text-blue-400', shadow: 'shadow-blue-200/30' },
  { bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-700', icon: 'text-pink-400', shadow: 'shadow-pink-200/30' },
  { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-400', shadow: 'shadow-emerald-200/30' },
  { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-400', shadow: 'shadow-amber-200/30' },
];

export default function OneLinersModernClient({ facts: initialFacts, counts, initialSubject }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  const subjectParam = searchParams.get('subject') || initialSubject;
  const isKnown = subjectParam === 'All' || MPPOLICE_ONELINER_SUBJECTS.includes(subjectParam as any);
  const activeSubject = isKnown ? subjectParam : 'All';

  // States
  const [facts, setFacts] = useState<MppoliceOneLinerRow[]>(() => initialFacts.slice(0, PAGE_SIZE));
  const [batchIndex, setBatchIndex] = useState(0);
  // 🏷️ UI DEFAULT: Set to 'list' view by default
  const [viewMode, setViewMode] = useState<'list' | 'flip'>('list');
  const [revisionMap, setRevisionMap] = useState<Record<string, number>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [stats, setStats] = useState({ revisedFactsCount: 0, totalFacts: 0 });
  const [isFocusMode, setIsFocusMode] = useState(false);

  // 1. Progress Stats
  const refreshStats = useCallback(async () => {
    try {
      const res = await getUserOneLinerProgress();
      setStats({ revisedFactsCount: res.revisedFactsCount, totalFacts: res.totalFacts });
    } catch (e) {
      console.error('Failed to fetch stats');
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const progressPercentRaw = (stats.revisedFactsCount / (stats.totalFacts || 1)) * 100;
  const progressPercent = Math.min(100, Math.round(progressPercentRaw));
  const progressPercentDisplay = progressPercentRaw > 0 && progressPercentRaw < 1 
    ? progressPercentRaw.toFixed(1) 
    : progressPercent.toString();

  const totalPossible = useMemo(() => {
    if (activeSubject === 'All') {
      return MPPOLICE_ONELINER_SUBJECTS.reduce((a, s) => a + (counts[s] ?? 0), 0);
    }
    return counts[activeSubject] ?? 0;
  }, [activeSubject, counts]);

  const totalBatches = Math.ceil(totalPossible / PAGE_SIZE);

  const loadRevisionData = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      const map = await getOneLinerRevisionMap(ids);
      setRevisionMap(prev => ({ ...prev, ...map }));
    } catch (e) {
      console.error('Failed to load revisions');
    }
  }, []);

  useEffect(() => {
    if (initialFacts.length > 0) {
      loadRevisionData(initialFacts.slice(0, PAGE_SIZE).map(f => f.id));
    }
  }, [initialFacts, loadRevisionData]);

  const handleBatchChange = useCallback(async (newIndex: number) => {
    setLoadingBatch(true);
    setBatchIndex(newIndex);
    try {
      const offset = newIndex * PAGE_SIZE;
      const nextBatch = await getPublishedMppoliceOneLiners(activeSubject, PAGE_SIZE, offset);
      setFacts(nextBatch);
      setExpandedId(null);
      await loadRevisionData(nextBatch.map(f => f.id));
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      toast.error('Failed to load batch');
    } finally {
      setLoadingBatch(false);
    }
  }, [activeSubject, loadRevisionData]);

  const handleSetSubject = useCallback(
    (s: string) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set('subject', s);
      router.push(`/syllabus/quiz/revision/gk-one-liners?${p.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleMarkRevised = useCallback(async (factId: string) => {
    setRevisionMap(prev => ({ ...prev, [factId]: (prev[factId] || 0) + 1 }));
    const res = await markOneLinerRevised(factId);
    if (!res.success) {
      toast.error('Failed to update revision');
      setRevisionMap(prev => ({ ...prev, [factId]: Math.max(0, (prev[factId] || 1) - 1) }));
    } else {
      toast.success(hi ? 'रिवीजन अपडेट!' : 'Revised!');
      refreshStats();
    }
  }, [hi, refreshStats]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const title = activeSubject === 'All' 
    ? (hi ? 'वन-लाइनर (सभी)' : 'One-Liners (All)')
    : (hi ? `${activeSubject}` : activeSubject);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-[#1D1D1F] antialiased selection:bg-indigo-500 selection:text-white">
      {/* 🔴 HEADER */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-16 items-center gap-3 sm:h-[72px]">
            <button
              onClick={() => router.back()}
              className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all hover:bg-slate-100 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-black tracking-tight sm:text-xl">{title}</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 sm:text-xs">
                {totalPossible} {hi ? 'तथ्य' : 'facts'}
              </p>
            </div>
            
            {/* 🎯 Focus Mode Toggle (HIDE/SHOW LABEL) */}
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={cn(
                "flex h-10 px-4 items-center gap-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                isFocusMode ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              {isFocusMode ? <Eye size={16} /> : <EyeOff size={16} />}
              <span className="inline">{isFocusMode ? (hi ? 'दिखाएं' : 'Show Header') : (hi ? 'छिपाएं' : 'Hide Header')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🟠 NAVIGATION & FILTERS - Optimized for Focus Mode */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sticky top-16 z-40 border-b border-slate-200 bg-white/95 pt-3 pb-3 backdrop-blur-md sm:top-[72px] overflow-hidden"
          >
            <div className="mx-auto max-w-5xl space-y-4 px-4 sm:px-6">
              {/* Subject Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar snap-x">
                <button
                  onClick={() => handleSetSubject('All')}
                  className={cn(
                    'shrink-0 snap-start whitespace-nowrap rounded-full px-5 py-2 text-[12px] font-black uppercase tracking-widest transition-all active:scale-95',
                    activeSubject === 'All' ? 'bg-slate-900 text-white shadow-lg' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {hi ? 'सभी' : 'All'}
                </button>
                {MPPOLICE_ONELINER_SUBJECTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSetSubject(s)}
                    className={cn(
                      'shrink-0 snap-start whitespace-nowrap rounded-full px-5 py-2 text-[12px] font-black uppercase tracking-widest transition-all active:scale-95',
                      activeSubject === s ? 'bg-slate-900 text-white shadow-lg' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                 <div className="flex items-center gap-2 w-full sm:w-auto">
                   <div className="w-full sm:w-[260px]">
                     <Select
                       value={String(batchIndex)}
                       onValueChange={(v) => handleBatchChange(Number(v))}
                     >
                       <SelectTrigger className="h-12 w-full rounded-full border-slate-200 bg-white px-5 text-[12px] font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all">
                         <div className="flex items-center gap-2">
                            <Layers size={14} className="text-slate-400" />
                            <SelectValue placeholder={hi ? 'बैच चुनें' : 'Select Batch'} />
                         </div>
                       </SelectTrigger>
                       <SelectContent position="popper" className="rounded-2xl border-slate-200 bg-white shadow-2xl max-h-[300px] overflow-y-auto">
                         {Array.from({ length: totalBatches }).map((_, i) => (
                           <SelectItem 
                             key={i} 
                             value={String(i)}
                             className="py-3 text-[12px] font-bold text-slate-700 focus:bg-indigo-50 focus:text-indigo-700"
                           >
                             {hi ? `बैच` : `Batch`} {i + 1} ({i * PAGE_SIZE + 1} - {Math.min((i + 1) * PAGE_SIZE, totalPossible)})
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                      <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                          'flex h-9 px-4 items-center gap-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all',
                          viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        )}
                      >
                        <LayoutList size={16} />
                        <span>{hi ? 'लिस्ट' : 'List'}</span>
                      </button>
                      <button
                        onClick={() => setViewMode('flip')}
                        className={cn(
                          'flex h-9 px-4 items-center gap-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all',
                          viewMode === 'flip' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        )}
                      >
                        <RotateCw size={16} />
                        <span>{hi ? 'कार्ड्स' : 'Cards'}</span>
                      </button>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 rounded-full bg-slate-900 px-5 py-2 border border-slate-800 shadow-lg">
                        <div className="relative h-7 w-7 flex items-center justify-center">
                            <svg className="h-full w-full rotate-[-90deg]">
                                <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-slate-800" />
                                <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray={75.4} strokeDashoffset={75.4 - (75.4 * progressPercent) / 100} strokeLinecap="round" className="text-emerald-500 transition-all duration-1000" />
                            </svg>
                            <span className="absolute text-[8px] font-black text-white">{progressPercentDisplay}%</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-[12px] font-black text-white leading-tight">{stats.revisedFactsCount}/{stats.totalFacts}</p>
                            <p className="text-[7px] font-black uppercase tracking-widest text-slate-400">{hi ? 'पूर्ण' : 'Done'}</p>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔵 CONTENT */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {loadingBatch ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{hi ? 'तथ्य लोड हो रहे हैं...' : 'Loading Facts...'}</p>
          </div>
        ) : (
          <div className="will-change-transform">
            <AnimatePresence mode="wait">
               {viewMode === 'list' ? (
                 <motion.div 
                    key="list-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn("space-y-6 transition-all duration-500", isFocusMode && "pt-4")}
                 >
                   {facts.map((f, idx) => {
                     const globalIdx = batchIndex * PAGE_SIZE + idx + 1;
                     const isExpanded = expandedId === f.id;
                     const revCount = revisionMap[f.id] || 0;
                     const color = colorVariants[idx % 4];

                     return (
                       <motion.div 
                         key={f.id} 
                         layout
                         className={cn(
                           "overflow-hidden rounded-[2rem] border transition-all duration-300",
                           color.bg,
                           color.border,
                           "shadow-sm hover:shadow-xl",
                           color.shadow
                         )}
                       >
                         <button
                           onClick={() => toggleExpand(f.id)}
                           className="flex w-full items-start gap-4 p-5 text-left sm:p-7"
                         >
                           <span className={cn(
                             "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black shadow-inner",
                             "bg-white",
                             color.text
                           )}>
                             {globalIdx}
                           </span>
                           <div className="min-w-0 flex-1">
                             <p className="text-[17px] font-bold leading-relaxed text-slate-900 sm:text-lg">
                               {hi ? f.stemHi : f.stemEn || f.stemHi}
                             </p>
                             
                             <motion.p 
                               className={cn("mt-2 text-lg font-black sm:text-xl", color.text)}
                             >
                               {hi ? f.answerHi : f.answerEn || f.answerHi}
                             </motion.p>

                             <div className="flex flex-wrap items-center gap-3 mt-4">
                               {activeSubject === 'All' && (
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/60 px-2 py-0.5 rounded-md">{f.subjectTag}</span>
                               )}
                               {revCount > 0 && (
                                 <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-white px-3 py-1 rounded-full shadow-sm">
                                   <CheckCircle2 size={10} />
                                   {revCount} {hi ? 'रिवीजन' : 'Revised'}
                                 </span>
                               )}
                               <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/60 px-2 py-0.5 rounded-md">
                                 {isExpanded ? (hi ? 'कम विवरण' : 'Less') : (hi ? 'विवरण' : 'Details')}
                               </span>
                             </div>
                           </div>
                           <span className="shrink-0 text-slate-300 mt-2">
                             {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                           </span>
                         </button>

                         <AnimatePresence>
                           {isExpanded && (
                             <motion.div
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: 'auto', opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               className="border-t border-white/50 bg-white/30"
                             >
                                <div className="p-5 sm:p-8 space-y-6">
                                   {f.extendedData ? (
                                     <div className="space-y-4">
                                       {(f.extendedData.explanationHi || f.extendedData.explanationEn) && (
                                         <div className="relative rounded-2xl bg-white/80 p-5 border border-white">
                                            <Info className="absolute -top-2 -left-2 h-6 w-6 text-slate-200" />
                                            <p className="text-[15px] leading-relaxed font-medium text-slate-700">
                                              {hi ? f.extendedData.explanationHi : f.extendedData.explanationEn || f.extendedData.explanationHi}
                                            </p>
                                         </div>
                                       )}
                                       {f.extendedData.facts && f.extendedData.facts.length > 0 && (
                                         <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                           {(hi ? f.extendedData.facts : f.extendedData.factsEn || f.extendedData.facts).map((line: string, i: number) => (
                                             <li key={i} className="flex items-start gap-2 text-sm font-semibold text-slate-600">
                                                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                                                {line}
                                             </li>
                                           ))}
                                         </ul>
                                       )}
                                       {f.extendedData.memoryTip && (
                                         <div className="group rounded-[1.5rem] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-5 shadow-inner">
                                           <div className="flex items-center gap-2 mb-2">
                                              <Sparkles className="h-4 w-4 text-amber-500" />
                                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">{hi ? 'ट्रिक' : 'Trick'}</span>
                                           </div>
                                           <p className="text-[14px] font-bold text-amber-900 leading-relaxed italic">
                                             {hi ? f.extendedData.memoryTip : f.extendedData.memoryTipEn || f.extendedData.memoryTip}
                                           </p>
                                         </div>
                                       )}
                                     </div>
                                   ) : (
                                     <div className="text-center py-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">{hi ? 'कोई अतिरिक्त विवरण नहीं' : 'No extra details'}</p>
                                     </div>
                                   )}

                                   <div className="flex justify-end pt-2">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleMarkRevised(f.id); }}
                                        className="group flex items-center gap-2 rounded-full bg-slate-950 px-7 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-emerald-600 active:scale-95"
                                      >
                                        <CheckCircle2 size={16} />
                                        {hi ? 'रिवाइज्ड मार्क करें' : 'Mark as Revised'}
                                      </button>
                                   </div>
                                </div>
                             </motion.div>
                           )}
                         </AnimatePresence>
                       </motion.div>
                     );
                   })}
                 </motion.div>
               ) : (
                 /* 🎴 CARDS VIEW */
                 <motion.div 
                    key="cards-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className={cn("grid grid-cols-1 md:grid-cols-2 gap-8 pb-24", isFocusMode && "pt-4")}
                 >
                   {facts.map((f, idx) => {
                      const revCount = revisionMap[f.id] || 0;
                      const globalIdx = batchIndex * PAGE_SIZE + idx + 1;
                      const color = colorVariants[idx % 4];

                      return (
                        <div key={f.id} className="relative">
                           <FlipCard
                             id={f.id}
                             stemHi={f.stemHi}
                             stemEn={f.stemEn || ''}
                             answerHi={f.answerHi}
                             answerEn={f.answerEn || ''}
                             extendedData={f.extendedData}
                             showFooter={false}
                             language={language as 'hi' | 'en'}
                             frontClassName={cn("border-2", color.bg, color.border)}
                             className={cn("h-[480px] shadow-2xl rounded-[3rem] border-2", color.border)}
                             frontActions={(
                               <div className="flex flex-col items-center gap-3 w-full">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleMarkRevised(f.id); }}
                                    className="flex items-center gap-3 rounded-full bg-slate-950 px-8 py-4 text-[12px] font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-105 active:scale-95 hover:bg-emerald-600"
                                  >
                                    <CheckCircle2 size={18} />
                                    {hi ? 'रिवाइज्ड मार्क करें' : 'Mark Revised'}
                                  </button>
                                  <div className="flex items-center gap-2">
                                     {revCount > 0 && (
                                       <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-white border border-indigo-100 px-3 py-1 rounded-full shadow-lg">
                                         <Zap size={10} className="fill-indigo-500" />
                                         {revCount} {hi ? 'रिवीजन' : 'Revised'}
                                       </span>
                                     )}
                                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-lg">
                                        {f.subjectTag}
                                     </span>
                                  </div>
                               </div>
                             )}
                             labels={{
                               tapToFlip: hi ? 'जवाब के लिए पलटें' : 'Tap to Flip for Answer',
                               topicAnalysis: hi ? 'तथ्य' : 'Analysis',
                               mnemonicLabel: hi ? 'ट्रिक' : 'Trick',
                               practiceTest: hi ? 'टेस्ट' : 'Test',
                               closeAnalysis: hi ? 'बंद करें' : 'Close'
                             }}
                           />
                           <div className="absolute -top-4 -left-4 z-20 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 font-black text-white shadow-xl ring-4 ring-white">
                              {globalIdx}
                           </div>
                        </div>
                      );
                   })}
                 </motion.div>
               )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
