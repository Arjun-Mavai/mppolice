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
  Info,
  ChevronRight,
  Puzzle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getPublishedMppoliceOneLiners, type MppoliceOneLinerRow } from '@/features/revision/actions/mppolice-one-liners';
import { markOneLinerRevised, getOneLinerRevisionMap, getUserOneLinerProgress } from '@/features/revision/actions/mppolice-one-liner-revisions';
import { MPPOLICE_ONELINER_SUBJECTS } from '@/features/revision/constants/mppolice-one-liners';
import { toast } from 'sonner';
import { QuickFeedback } from '@/components/QuickFeedback';
import { Languages } from 'lucide-react';

const renderWithLineBreaks = (text: string | undefined) => {
  if (!text) return null;
  const lines = text.replace(/([\|।])\s*/g, '$1\n').replace(/(\.)\s+/g, '$1\n').split('\n');
  return (
    <>
      {lines.map((line, i) => line.trim() ? (
        <span key={i} className={i > 0 ? "block mt-1.5" : ""}>
          {line.trim()}
        </span>
      ) : null)}
    </>
  );
};

const formatBilingual = (text: string | undefined, isHindi: boolean) => {
  if (!text) return text;
  
  let result = text;
  const match = text.match(/^([\s\S]*?)[ \t]*[\(\/][ \t]*([\s\S]*?)[ \t]*[\)]?$/);
  
  if (match) {
    const part1 = match[1].trim();
    const part2 = match[2].trim();
    const isPart1Hindi = /[\u0900-\u097F]/.test(part1);
    const isPart2Hindi = /[\u0900-\u097F]/.test(part2);
    
    if (isPart1Hindi && !isPart2Hindi) {
      result = isHindi ? `${part1}\n/ ${part2}` : `${part2}\n/ ${part1}`;
    } else if (!isPart1Hindi && isPart2Hindi) {
      result = isHindi ? `${part2}\n/ ${part1}` : `${part1}\n/ ${part2}`;
    }
  } else if (text.includes(' / ')) {
    const parts = text.split(' / ');
    if (parts.length === 2) {
      const part1 = parts[0].trim();
      const part2 = parts[1].trim();
      const isPart1Hindi = /[\u0900-\u097F]/.test(part1);
      const isPart2Hindi = /[\u0900-\u097F]/.test(part2);
      
      if (isPart1Hindi && !isPart2Hindi) {
        result = isHindi ? `${part1}\n/ ${part2}` : `${part2}\n/ ${part1}`;
      } else if (!isPart1Hindi && isPart2Hindi) {
        result = isHindi ? `${part2}\n/ ${part1}` : `${part1}\n/ ${part2}`;
      }
    }
  }
  
  result = result.replace(/^\[.*?\]\s*/, '');
  result = result.replace(/^(Explanation in Hindi|Explanation in English|Hindi|English|Hinglish|In Hindi|In English)[):\]\s]*\s*/i, '');
  
  return result;
};

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
  isFreeDemo?: boolean;
}

const colorVariants = [
  { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: 'text-blue-400', shadow: 'shadow-blue-200/30' },
  { bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-700', icon: 'text-pink-400', shadow: 'shadow-pink-200/30' },
  { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-400', shadow: 'shadow-emerald-200/30' },
  { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-400', shadow: 'shadow-amber-200/30' },
];

export default function OneLinersModernClient({ facts: initialFacts, counts, initialSubject, isFreeDemo = false }: Props) {
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
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
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
      setExpandedIds({});
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
      if (isFreeDemo) {
        const el = document.getElementById('pricing-upsell');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }
      const p = new URLSearchParams(searchParams.toString());
      p.set('subject', s);
      router.push(`/syllabus/quiz/revision/gk-one-liners?${p.toString()}`, { scroll: false });
    },
    [router, searchParams, isFreeDemo]
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
    setExpandedIds((prev) => {
      const isExpanded =
        Object.prototype.hasOwnProperty.call(prev, id) && prev[id] === true;

      if (isExpanded) {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [id]: true };
    });
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
              {!isFreeDemo && (
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 sm:text-xs">
                  {totalPossible} {hi ? 'तथ्य' : 'facts'}
                </p>
              )}
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
                   {!isFreeDemo && (
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
                   )}

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
                 
                 {!isFreeDemo && (
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
                 )}
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
                     const isExpanded = !!expandedIds[f.id];
                     const revCount = revisionMap[f.id] || 0;
                     const color = colorVariants[idx % 4];

                     return (
                       <motion.div 
                         key={f.id} 
                         
                         className={cn(
                           "overflow-hidden rounded-[2rem] border transition-shadow duration-300",
                           color.bg,
                           color.border,
                           "shadow-sm hover:shadow-xl",
                           color.shadow
                         )}
    
                       >
                         <button
                           onClick={() => toggleExpand(f.id)}
                           className="flex flex-col w-full items-start gap-2 px-3 py-3.5 sm:p-4 text-left relative"
                         >
                           <span className={cn(
                             "inline-flex items-center justify-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
                             color.text
                           )}>
                             Q{globalIdx}
                           </span>
                           <div className="min-w-0 flex-1 w-full mt-1">
                             <div className="text-[15px] font-bold leading-relaxed text-slate-900 sm:text-[16px]">
                               {renderWithLineBreaks(formatBilingual(hi ? f.stemHi : f.stemEn || f.stemHi, hi))}
                             </div>
                             
                             <div 
                               className={cn("mt-1.5 text-[16px] font-black sm:text-[17px]", color.text)}
                             >
                               {renderWithLineBreaks(formatBilingual(hi ? f.answerHi : f.answerEn || f.answerHi, hi))}
                             </div>

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
                           <span className="absolute top-4 right-4 shrink-0 text-slate-400/50 group-hover:text-slate-400 transition-colors">
                             {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                           </span>
                         </button>

                         <AnimatePresence>
                           {isExpanded && (
                             <motion.div
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: 'auto', opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }} className="border-t border-white/50 bg-white/30 overflow-hidden"
                             >
                                <div className="p-2.5 sm:p-4 space-y-3.5">
                                   {f.extendedData ? (
                                     <div className="space-y-4">
                                       {f.extendedData.memoryTip && (
                                         <div className="group rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 px-3 py-3 shadow-inner">
                                           <div className="flex items-center gap-2 mb-2">
                                              <Sparkles className="h-4 w-4 text-amber-500" />
                                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">{hi ? 'ट्रिक' : 'Trick'}</span>
                                           </div>
                                           <div className="text-[14px] font-bold text-amber-900 leading-relaxed italic">
                                             {renderWithLineBreaks(formatBilingual((hi ? f.extendedData.memoryTip : f.extendedData.memoryTipEn || f.extendedData.memoryTip)?.replace(/^🧠\s*मेमोरी ट्रिक.*?:?\s*/i, ''), hi))}
                                           </div>
                                         </div>
                                       )}
                                       {(f.extendedData.explanationHi || f.extendedData.explanationEn) && (
                                         <div className="rounded-xl bg-rose-50/50 px-3 py-3 border border-rose-100">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Info className="h-4 w-4 text-rose-500" />
                                              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Examiner Trap</span>
                                            </div>
                                            <div className="text-[14px] leading-relaxed font-bold text-rose-900/80">
                                              {renderWithLineBreaks(formatBilingual((hi ? f.extendedData.explanationHi : f.extendedData.explanationEn || f.extendedData.explanationHi)?.replace(/^⚠️\s*एग्जामिनर ट्रैप.*?:?\s*/i, ''), hi))}
                                            </div>
                                         </div>
                                       )}
                                       {f.extendedData.facts && f.extendedData.facts.length > 0 && (
                                         <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                           {(hi ? f.extendedData.facts : f.extendedData.factsEn || f.extendedData.facts).map((line: string, i: number) => (
                                             <li key={i} className="flex items-start gap-2 text-sm font-semibold text-slate-600">
                                                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                                                {formatBilingual(line, hi)}
                                             </li>
                                           ))}
                                         </ul>
                                       )}

                                       {f.extendedData.analogy && (
                                          <div className="rounded-xl bg-sky-50/50 px-3 py-3 border border-sky-100">
                                             <div className="flex items-center gap-2 mb-2">
                                               <Puzzle className="h-4 w-4 text-sky-500" />
                                               <span className="text-[10px] font-black uppercase tracking-widest text-sky-600">{hi ? 'एनालॉजी (Analogy)' : 'Analogy'}</span>
                                             </div>
                                             <div className="text-[14px] leading-relaxed font-bold text-sky-900/80">
                                               {renderWithLineBreaks(formatBilingual(hi ? f.extendedData.analogy : f.extendedData.analogyEn || f.extendedData.analogy, hi))}
                                             </div>
                                          </div>
                                        )}
                                       {f.extendedData.patternConnections && f.extendedData.patternConnections.length > 0 && (
                                         <div className="rounded-xl bg-indigo-50/50 border border-indigo-100/50 px-3 py-3">
                                           <div className="flex items-center gap-2 mb-3">
                                              <Layers className="h-4 w-4 text-indigo-500" />
                                              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Pattern Connections</span>
                                           </div>
                                           <ul className="space-y-3">
                                             {f.extendedData.patternConnections.map((pc: string, i: number) => (
                                               <li key={i} className="flex items-start gap-3 text-[13px] font-semibold text-indigo-900/80 leading-relaxed">
                                                 <span className="mt-0.5 opacity-60">🔗</span>
                                                 <span>{renderWithLineBreaks(formatBilingual(pc, hi))}</span>
                                               </li>
                                             ))}
                                           </ul>
                                         </div>
                                       )}
                                       {f.extendedData.pyqs && f.extendedData.pyqs.length > 0 && (
                                         <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-3">
                                           <div className="flex items-center gap-2 mb-4">
                                              <LayoutList className="h-4 w-4 text-slate-500" />
                                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Previous Year Questions (PYQ)</span>
                                           </div>
                                           <div className="space-y-4">
                                             {f.extendedData.pyqs.map((pyq: any, i: number) => (
                                               <details key={i} className="group space-y-2 bg-white px-3 py-3 rounded-xl border border-slate-100 shadow-sm cursor-pointer [&_summary::-webkit-details-marker]:hidden">
                                                  <summary className="text-xs font-semibold text-slate-700 leading-relaxed outline-none">
                                                    <div className="flex items-start gap-2">
                                                      <span className="text-slate-400 mt-0.5">•</span>
                                                      <span className="flex-1">{renderWithLineBreaks(formatBilingual(pyq.question, hi))}</span>
                                                    </div>
                                                    <div className="mt-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest group-open:hidden">
                                                      Tap to view answer
                                                    </div>
                                                  </summary>
                                                  {pyq.answer && (
                                                    <div className="mt-3 pl-4 border-l-2 border-emerald-300 animate-in fade-in slide-in-from-top-2 duration-300">
                                                      <div className="text-[12px] font-bold text-emerald-700">{renderWithLineBreaks(formatBilingual(pyq.answer, hi))}</div>
                                                    </div>
                                                  )}
                                               </details>
                                             ))}
                                           </div>
                                         </div>
                                       )}
                                     </div>
                                   ) : (
                                     <div className="text-center py-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">{hi ? 'कोई अतिरिक्त विवरण नहीं' : 'No extra details'}</p>
                                     </div>
                                   )}

                                   {!isFreeDemo && (
                                     <div className="flex justify-end pt-2">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleMarkRevised(f.id); }}
                                          className="group flex items-center gap-2 rounded-full bg-slate-950 px-7 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-emerald-600 active:scale-95"
                                        >
                                          <CheckCircle2 size={16} />
                                          {hi ? 'रिवाइज्ड मार्क करें' : 'Mark as Revised'}
                                        </button>
                                     </div>
                                   )}
                                   <QuickFeedback 
                                     questionId={f.id} 
                                     questionText={f.stemHi} 
                                     source="one_liner_list" 
                                     unitInfo={f.subjectTag} 
                                   />
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
                                  {!isFreeDemo && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleMarkRevised(f.id); }}
                                      className="flex items-center gap-3 rounded-full bg-slate-950 px-8 py-4 text-[12px] font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-105 active:scale-95 hover:bg-emerald-600"
                                    >
                                      <CheckCircle2 size={18} />
                                      {hi ? 'रिवाइज्ड मार्क करें' : 'Mark Revised'}
                                    </button>
                                  )}
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
                                  <QuickFeedback 
                                    questionId={f.id} 
                                    questionText={f.stemHi} 
                                    source="one_liner_card" 
                                    unitInfo={f.subjectTag} 
                                  />
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

            {/* 💎 CTA FOR FREE USERS - Premium Dark/Amber Theme */}
            {isFreeDemo && (
              <motion.div 
                id="pricing-upsell"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 flex flex-col items-center justify-center p-8 text-center rounded-[3rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-slate-700/50 shadow-2xl shadow-slate-900/40 relative overflow-hidden group"
              >
                {/* Decorative Background Elements */}
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/10 blur-[60px]" />
                <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-[60px]" />

                <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-inner">
                  <Sparkles size={32} className="text-amber-400" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white sm:text-3xl">
                  परीक्षा हॉल में याद रहे। <br className="hidden sm:block" /> इसीलिए बनाया गया।
                </h3>
                <p className="mb-8 max-w-md text-sm font-bold text-indigo-100/80 leading-relaxed tracking-wide">
                  फ्री PDF सेव करने से चयन नहीं होता।<br/>नियमित रिवीज़न और अभ्यास से होता है।<br/><br/>MP Police 2026 के लिए structured तैयारी अनलॉक करें।
                </p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="group relative flex items-center gap-3 rounded-full bg-amber-500 px-10 py-5 text-[14px] font-black uppercase tracking-[0.2em] text-slate-900 shadow-[0_20px_50px_rgba(245,158,11,0.2)] transition-all hover:bg-amber-400 hover:scale-105 active:scale-95"
                >
                  <Zap size={18} className="fill-slate-900" />
                  ⚡ एक्सेस अनलॉक करें
                  <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" strokeWidth={3} />
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
