'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Search,
  BookOpen,
  Layers,
  Info,
  ChevronUp,
  ChevronDown,
  Eye,
  Loader2,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
import { markOneLinerRevised, getOneLinerRevisionMap } from '@/features/revision/actions/mppolice-one-liner-revisions';
import { toast } from 'sonner';

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PAGE_SIZE = 50;

interface OneLinerFact {
  id: string;
  stemHi: string;
  stemEn: string | null;
  answerHi: string;
  answerEn: string | null;
  subjectTag: string;
  extendedData?: any;
}

interface RevisionHubClientProps {
  allFacts: OneLinerFact[];
  initialRevisionMap: Record<string, number>;
  stats: {
    revisedFactsCount: number;
    totalFacts: number;
    totalRevisions: number;
  };
}

const colorVariants = [
  { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: 'text-blue-400', shadow: 'shadow-blue-200/30' },
  { bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-700', icon: 'text-pink-400', shadow: 'shadow-pink-200/30' },
  { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-400', shadow: 'shadow-emerald-200/30' },
  { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-400', shadow: 'shadow-amber-200/30' },
];

export function RevisionHubClient({ allFacts, initialRevisionMap, stats }: RevisionHubClientProps) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';
  
  const [batchIndex, setBatchIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [revisionMap, setRevisionMap] = useState<Record<string, number>>(initialRevisionMap);
  const [loadingBatch, setLoadingBatch] = useState(false);

  // 1. Progress Stats
  const progressPercent = Math.min(100, Math.round((stats.revisedFactsCount / (stats.totalFacts || 1)) * 100));

  // 2. Batching & Search
  const filteredAll = useMemo(() => {
    if (!searchQuery) return allFacts;
    return allFacts.filter(f => 
      f.stemHi.includes(searchQuery) || 
      (f.stemEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answerHi.includes(searchQuery) ||
      f.subjectTag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allFacts, searchQuery]);

  const totalBatches = Math.ceil(filteredAll.length / PAGE_SIZE);
  const currentBatch = useMemo(() => {
    return filteredAll.slice(batchIndex * PAGE_SIZE, (batchIndex + 1) * PAGE_SIZE);
  }, [filteredAll, batchIndex]);

  // Load Revision Map for current batch
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
    loadRevisionData(currentBatch.map(f => f.id));
  }, [currentBatch, loadRevisionData]);

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const handleMarkRevised = async (id: string) => {
    const res = await markOneLinerRevised(id);
    if (res.success) {
      setRevisionMap(prev => ({
        ...prev,
        [id]: (prev[id] || 0) + 1
      }));
      toast.success(isHindi ? 'रिवीजन अपडेट हुआ' : 'Revision marked');
    }
  };

  const handleBatchChange = (idx: number) => {
    setLoadingBatch(true);
    setBatchIndex(idx);
    setExpanded(new Set());
    setTimeout(() => setLoadingBatch(false), 300);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      {/* 🟢 PREMIUM HEADER */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-16 items-center gap-4 sm:h-20">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                {isHindi ? 'रिवीजन सेंटर' : 'Revision Center'}
              </h1>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  {isHindi ? `${stats.totalFacts} महत्वपूर्ण तथ्य` : `${stats.totalFacts} Key Facts`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* 📊 PROGRESS CARD */}
        <div className="rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl relative overflow-hidden mb-12">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap className="h-32 w-32 text-white" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white">{isHindi ? 'कुल रिवीज़न प्रोग्रेस' : 'Overall Revision Progress'}</h2>
                    <p className="text-slate-400 font-medium">{isHindi ? `${stats.revisedFactsCount} तथ्य पूरे हुए` : `${stats.revisedFactsCount} facts mastered so far`}</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative h-20 w-20 flex items-center justify-center group" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                        <svg className="h-full w-full rotate-[-90deg]">
                            <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                            <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={213.6} strokeDashoffset={213.6 - (213.6 * progressPercent) / 100} strokeLinecap="round" className="text-emerald-500 transition-all duration-1000" />
                        </svg>
                        <span className="absolute text-lg font-black text-white">{progressPercent}%</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{isHindi ? 'टोटल रिवीज़न' : 'Total Revisions'}</p>
                        <p className="text-3xl font-black text-white">{stats.totalRevisions}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* 🔍 SEARCH & BATCHING */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-10">
           <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-[240px]">
                <Select
                  value={String(batchIndex)}
                  onValueChange={(v) => handleBatchChange(Number(v))}
                >
                  <SelectTrigger 
                    className="h-12 w-full rounded-full border-slate-200 bg-white px-5 text-[12px] font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    aria-label={isHindi ? 'बैच बदलें' : 'Change batch'}
                  >
                    <div className="flex items-center gap-2">
                       <Layers size={14} className="text-slate-400" />
                       <SelectValue placeholder={isHindi ? 'बैच चुनें' : 'Select Batch'} />
                    </div>
                  </SelectTrigger>
                  <SelectContent position="popper" className="rounded-2xl border-slate-200 shadow-2xl max-h-[300px] overflow-y-auto">
                    {Array.from({ length: totalBatches }).map((_, i) => (
                      <SelectItem 
                        key={i} 
                        value={String(i)}
                        className="py-3 text-[12px] font-bold text-slate-700 focus:bg-indigo-50 focus:text-indigo-700"
                      >
                        {isHindi ? `बैच` : `Batch`} {i + 1} ({i * PAGE_SIZE + 1} - {Math.min((i + 1) * PAGE_SIZE, filteredAll.length)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
           </div>

           <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={isHindi ? 'तथ्य या विषय खोजें...' : 'Search facts or subjects...'}
                aria-label={isHindi ? 'खोजें' : 'Search'}
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setBatchIndex(0);
                }}
                className="h-12 w-full pl-12 pr-4 bg-white border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
              />
           </div>
        </div>

        {/* 🔵 TILES LIST */}
        <div className="space-y-6">
           {loadingBatch ? (
             <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{isHindi ? 'लोकप्रिय तथ्य लोड हो रहे हैं...' : 'Loading Revision Data...'}</p>
             </div>
           ) : currentBatch.length > 0 ? (
             currentBatch.map((f, idx) => {
               const globalIdx = batchIndex * PAGE_SIZE + idx + 1;
               const isExpanded = expanded.has(f.id);
               const revCount = revisionMap[f.id] || 0;
               const color = colorVariants[idx % 4];

               return (
                 <motion.div 
                   key={f.id} 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className={cn(
                     "overflow-hidden rounded-[2.5rem] border transition-all duration-300",
                     color.bg,
                     color.border,
                     "shadow-sm hover:shadow-xl",
                     color.shadow
                   )}
                 >
                   <button
                     onClick={() => toggleExpand(f.id)}
                     className="flex w-full items-start gap-5 p-6 text-left sm:p-8"
                   >
                     <span className={cn(
                       "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-inner rotate-3",
                       "bg-white",
                       color.text
                     )}>
                       {globalIdx}
                     </span>
                     <div className="min-w-0 flex-1">
                       <p className="text-lg font-bold leading-relaxed text-slate-900 sm:text-xl">
                         {isHindi ? f.stemHi : f.stemEn || f.stemHi}
                       </p>
                       
                       {!isExpanded ? (
                          <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <Eye size={12} />
                             {isHindi ? 'जवाब देखने के लिए क्लिक करें' : 'Click to see answer'}
                          </div>
                       ) : (
                          <motion.p 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn("mt-4 text-xl font-black sm:text-2xl", color.text)}
                          >
                            {isHindi ? f.answerHi : f.answerEn || f.answerHi}
                          </motion.p>
                       )}

                       <div className="flex flex-wrap items-center gap-3 mt-5">
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/60 px-3 py-1 rounded-md">{f.subjectTag}</span>
                         {revCount > 0 ? (
                           <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-white px-3 py-1 rounded-full shadow-sm border border-emerald-50">
                             <CheckCircle2 size={10} />
                             {revCount} {isHindi ? 'रिवीजन' : 'Revised'}
                           </span>
                         ) : (
                           <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/30 px-3 py-1 rounded-full">
                             <Clock size={10} />
                             {isHindi ? 'अभी शुरू करें' : 'Pending'}
                           </span>
                         )}
                       </div>
                     </div>
                     <span className="shrink-0 text-slate-300 mt-2">
                       {isExpanded ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
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
                          <div className="p-6 sm:p-10 pt-0 space-y-6">
                             {f.extendedData ? (
                               <div className="space-y-4">
                                 {(f.extendedData.explanationHi || f.extendedData.explanationEn) && (
                                   <div className="relative rounded-3xl bg-white/80 p-6 border border-white mt-4">
                                      <Info className="absolute -top-3 -left-3 h-8 w-8 text-indigo-100" />
                                      <p className="text-[15px] leading-relaxed font-semibold text-slate-600">
                                        {isHindi ? f.extendedData.explanationHi : f.extendedData.explanationEn || f.extendedData.explanationHi}
                                      </p>
                                   </div>
                                 )}
                                 {f.extendedData.facts && f.extendedData.facts.length > 0 && (
                                   <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                     {(isHindi ? f.extendedData.facts : f.extendedData.factsEn || f.extendedData.facts).map((line: string, i: number) => (
                                       <li key={i} className="flex items-start gap-3 text-[13px] font-bold text-slate-600 bg-white/40 p-3 rounded-2xl">
                                          <Sparkles className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                                          {line}
                                       </li>
                                     ))}
                                   </ul>
                                 )}
                                 {f.extendedData.memoryTip && (
                                   <div className="group rounded-[2rem] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 shadow-inner">
                                     <div className="flex items-center gap-2 mb-3">
                                        <div className="h-6 w-6 rounded-full bg-amber-200 flex items-center justify-center">
                                            <Zap className="h-3.5 w-3.5 text-amber-700" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">{isHindi ? 'सुपर ट्रिक' : 'Memory Trick'}</span>
                                     </div>
                                     <p className="text-[15px] font-black text-amber-900 leading-relaxed italic">
                                       {isHindi ? f.extendedData.memoryTip : f.extendedData.memoryTipEn || f.extendedData.memoryTip}
                                     </p>
                                   </div>
                                 )}
                               </div>
                             ) : (
                               <div className="text-center py-6">
                                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">{isHindi ? 'अतिरिक्त विवरण उपलब्ध नहीं है' : 'No extra details available'}</p>
                               </div>
                             )}

                             <div className="flex justify-end pt-4">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMarkRevised(f.id); }}
                                  className="group flex items-center gap-3 rounded-full bg-slate-950 px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:bg-emerald-600 active:scale-95"
                                >
                                  <CheckCircle2 size={18} />
                                  {isHindi ? 'रिवीजन मार्क करें' : 'Mark as Mastered'}
                                </button>
                             </div>
                          </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </motion.div>
               );
             })
           ) : (
             <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="mx-auto h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                   <Zap size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">{isHindi ? 'कोई तथ्य नहीं मिला' : 'No facts found'}</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-3 font-medium">
                   {isHindi ? 'आपकी वर्तमान खोज के लिए कोई तथ्य उपलब्ध नहीं है।' : 'No facts matching your criteria were found.'}
                </p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-8 inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
                >
                   {isHindi ? 'खोज साफ़ करें' : 'Clear Search'}
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
