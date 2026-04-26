'use client';

import React, { useState, useEffect, memo } from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Brain,
  AlertTriangle,
  Zap,
  TrendingUp,
  BookOpen,
  FlaskConical,
  ChevronDown,
  X,
  Sparkles,
  Cpu,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ── DATA FOR VISUALIZATIONS (Moved outside for performance) ───────────────────

const ONE_LINER_PREVIEW = [
  {
    id: 1,
    subjectEn: 'MP GK',
    subjectHi: 'म.प्र. सामान्य ज्ञान',
    textEn: 'Panna district is known as the "Diamond City" of India.',
    textHi: 'पन्ना जिले को भारत की "हीरा नगरी" के रूप में जाना जाता है।',
  },
  {
    id: 2,
    subjectEn: 'Science',
    subjectHi: 'विज्ञान',
    textEn: 'Vitamin C is also known as Ascorbic Acid.',
    textHi: 'विटामिन C को एस्कॉर्बिक एसिड के नाम से भी जाना जाता है।',
  },
  {
    id: 3,
    subjectEn: 'History',
    subjectHi: 'इतिहास',
    textEn: 'The Battle of Panipat (First) was fought in 1526.',
    textHi: 'पानीपत का प्रथम युद्ध 1526 में लड़ा गया था।',
  },
];

/* 
const PREVIEW_QUESTIONS = [
  ... (commented out)
]
*/

const WEIGHTAGE_BARS = [
  {
    nameEn: 'GK & Reasoning (40 marks)',
    nameHi: 'सामान्य ज्ञान एवं तर्कशक्ति (40 अंक)',
    pct: 40,
    color: 'from-amber-400 to-orange-500',
  },
  {
    nameEn: 'Mental Ability (30 marks)',
    nameHi: 'बौद्धिक क्षमता (30 अंक)',
    pct: 30,
    color: 'from-emerald-400 to-teal-500',
  },
  {
    nameEn: 'Science & Arithmetic (30 marks)',
    nameHi: 'विज्ञान एवं सरल अंकगणित (30 अंक)',
    pct: 30,
    color: 'from-blue-400 to-indigo-500',
  },
];

const SUBJECT_LIST_DETAILED = [
  {
    nameEn: 'General Knowledge & Reasoning',
    nameHi: 'सामान्य ज्ञान एवं तर्कशक्ति',
    marks: 40,
    pct: 40,
    icon: BookOpen,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    nameEn: 'Intellectual & Mental Ability',
    nameHi: 'बौद्धिक क्षमता एवं मानसिक क्षमता',
    marks: 30,
    pct: 30,
    icon: Cpu,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    nameEn: 'Science & Simple Arithmetic',
    nameHi: 'विज्ञान एवं सरल अंकगणित',
    marks: 30,
    pct: 30,
    icon: FlaskConical,
    color: 'text-sky-500',
    bg: 'bg-sky-500/10 border-sky-500/20',
  },
];

/** Mirrors `extendedData.explanation` for stream `gk_science` (AI upload JSON) */
const GK_SCIENCE_EXPLANATION_PREVIEW = [
  {
    id: 'facts',
    icon: CheckCircle2,
    labelEn: 'Detailed Facts',
    labelHi: 'महत्वपूर्ण तथ्य',
    color: 'emerald',
    contentEn: 'Pollution profile similar to the Ganges → Betwa is called the “Ganga of MP”.',
    contentHi: 'गंगा जैसे प्रदूषण संदर्भ में बेतवा को “म.प्र. की गंगा” कहा जाता है।',
  },
  {
    id: 'mnemonics',
    icon: Brain,
    labelEn: 'Memory Trick',
    labelHi: 'याद करने की ट्रिक',
    color: 'blue',
    contentEn: '“Betwa = Beta (son) of Raisen” → origin cue Kumra Gaon.',
    contentHi: '“Betwa = रायसेन का बेटा” → उद्गम संकेत कुमरा गाँव।',
  },
  {
    id: 'related',
    icon: Lightbulb,
    labelEn: 'Related Info',
    labelHi: 'संबंधित जानकारी',
    color: 'amber',
    contentEn: 'Revise Narmada = lifeline of MP; don’t swap “Ganga of MP” vs lifeline.',
    contentHi: 'नर्मदा = म.प्र. की जीवन रेखा; “गंगा वाला” टैग बेतवा से मिलान करें।',
  },
  {
    id: 'memoryTip',
    icon: AlertTriangle,
    labelEn: 'Expert Tip',
    labelHi: 'विशेष टिप',
    color: 'rose',
    contentEn: 'Trap: options often pair Betwa with Narmada — tag the question: pollution vs drainage.',
    contentHi: 'जाल: विकल्प में बेतवा-नर्मदा मिला देते हैं — प्रश्न देखकर प्रदूषण बनाम जलधारा अलग करें।',
  },
];

const TABS = [
  { labelEn: 'One-Liners', labelHi: 'वन-लाइनर्स', id: 0 },
  { labelEn: 'Sections', labelHi: 'पेपर I खंड', id: 2 },
  { labelEn: 'Explanations', labelHi: 'विस्तृत व्याख्या', id: 4, badge: 'Premium' },
  { labelEn: 'Weightage', labelHi: 'अंक बंटन', id: 1 },
  { labelEn: 'Instant', labelHi: 'इंस्टेंट', id: 3 },
];

// Memoized Sub-components for "Light Speed" performance
const OneLinerItem = memo(({ item, isHindi }: { item: (typeof ONE_LINER_PREVIEW)[0]; isHindi: boolean }) => (
  <div className="relative rounded-2xl bg-white/[0.03] border border-white/5 p-4 space-y-3 group/ol hover:bg-white/[0.06] transition-all overflow-hidden text-left">
    <div className="flex items-center justify-between">
      <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-2 py-0.5 text-[8px] font-black uppercase tracking-wider">
        {isHindi ? item.subjectHi : item.subjectEn}
      </Badge>
      <Sparkles className="h-3 w-3 text-amber-400 opacity-50" />
    </div>
    <p className="text-[12px] sm:text-sm font-bold leading-relaxed text-slate-100 opacity-90">
      {isHindi ? item.textHi : item.textEn}
    </p>
  </div>
));
OneLinerItem.displayName = 'OneLinerItem';

/*
const QuestionItem = ... (commented out)
*/

const SubjectItem = memo(({ sub, isHindi }: { sub: (typeof SUBJECT_LIST_DETAILED)[0]; isHindi: boolean }) => {
  const Icon = sub.icon;
  return (
    <div className="flex items-center justify-between rounded-2xl sm:rounded-3xl border border-white/5 bg-white/[0.03] p-3 sm:p-5 hover:bg-white/5 transition-all will-change-transform text-left">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={cn('h-9 w-9 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border flex items-center justify-center', sub.bg)}>
          <Icon size={16} className={cn('sm:scale-110', sub.color)} />
        </div>
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] sm:text-sm font-black text-white">
              {isHindi ? sub.nameHi : sub.nameEn}
            </span>
            <span className="text-[9px] sm:text-[10px] font-black text-emerald-500">
              {sub.marks} {isHindi ? 'अंक' : 'marks'}
            </span>
          </div>
          <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {sub.pct}% {isHindi ? 'पेपर वेटेज' : 'of paper'}
          </p>
        </div>
      </div>
      <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-600">
        <ChevronDown size={12} className="sm:w-[14px] sm:h-[14px]" />
      </div>
    </div>
  );
});
SubjectItem.displayName = 'SubjectItem';

export function PYQShowcaseSection() {
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';
  const [activeCard, setActiveCard] = useState(0); 
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveCard((prev) => {
        const currentIndex = TABS.findIndex(t => t.id === prev);
        const nextIndex = (currentIndex + 1) % TABS.length;
        return TABS[nextIndex].id;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handleManualSwitch = (id: number) => {
    setActiveCard(id);
  };

  return (
    <LazyMotion features={domAnimation}>
      <section id="analysis" className="relative overflow-hidden py-16 sm:py-32 contain-layout">
        {/* Background glow effects - hardware accelerated */}
        <div className="pointer-events-none absolute top-1/2 left-[-10%] h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[80px] sm:blur-[120px] will-change-transform" />
        <div className="pointer-events-none absolute right-[-5%] bottom-0 h-[250px] w-[250px] sm:h-[400px] sm:w-[400px] rounded-full bg-pink-500/5 blur-[70px] sm:blur-[100px] will-change-transform" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-12 lg:gap-20">
            
            {/* STRATEGIC HEADER: Fully Centered */}
            <div className="relative z-10 w-full max-w-4xl space-y-8 sm:space-y-10 text-center">
              <div className="space-y-6 sm:space-y-8">
                {/* Premium Floating Badge */}
                <m.div
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group relative inline-flex items-center gap-3 rounded-2xl border border-pink-200/40 bg-white/90 backdrop-blur-xl px-5 py-2.5 text-[10px] sm:text-[11px] font-black tracking-[0.15em] text-pink-600 uppercase shadow-[0_20px_40px_rgba(219,39,119,0.08)] ring-4 ring-pink-50/20"
                >
                  <div className="relative flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                  <span className="relative z-10">
                    {isHindi ? 'पेपर I · 100 प्रश्न · 120 मिनट' : 'Paper I · 100Q · 120 min'}
                  </span>
                </m.div>

                <m.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="py-1 text-3xl font-black tracking-tighter text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl text-balance"
                  style={{ 
                    filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.1))'
                  }}
                >
                  <div className="flex flex-col leading-[1.1] sm:leading-[1.15]">
                    <span className="text-slate-800">
                      {isHindi
                        ? 'तीन खंड, एक प्रश्नपत्र — संपूर्ण पाठ्यक्रम'
                        : 'Three sections. One paper. Full syllabus.'}
                    </span>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                      <span
                        className="bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 bg-clip-text px-2 text-xl font-black tracking-tight text-transparent sm:text-2xl md:text-3xl lg:text-4xl"
                        style={{ WebkitBackgroundClip: 'text' }}
                      >
                        {isHindi
                          ? 'GK+तर्क · बौद्धिक · विज्ञान+अंकगणित'
                          : 'GK+Reasoning · Mental · Science+Math'}
                      </span>
                    </div>
                  </div>
                </m.h2>

                <m.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="mx-auto max-w-2xl text-center text-base sm:text-xl font-medium leading-relaxed text-slate-500"
                >
                  {isHindi
                    ? 'आधिकारिक 40+30+30 अंक वाले खंडों के साथ PYQ, टॉपिक-टैग और विस्तृत व्याख्या (GK, Reasoning, Maths) — जो हर कॉन्सेप्ट को आसान बना दे।'
                    : 'Practice matches the official 40+30+30 mark split: GK & reasoning, mental ability, science & arithmetic — with PYQs, topic tags, and structured explanations.'}
                </m.p>
              </div>

              {/* TAB SELECTORS: Centered */}
              <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center"
              >
                <div className="relative w-full max-w-2xl overflow-hidden">
                  <div className="flex justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-2">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleManualSwitch(tab.id)}
                        className={cn(
                          "group relative flex shrink-0 items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-[9px] sm:text-[10px] font-black tracking-widest uppercase transition-all active:scale-95",
                          activeCard === tab.id 
                            ? "bg-slate-900 text-white shadow-xl" 
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        )}
                      >
                        <span className="relative z-10">{isHindi ? tab.labelHi : tab.labelEn}</span>
                        {activeCard === tab.id && (
                          <m.div 
                            layoutId="nav-bg"
                            className="absolute inset-0 bg-slate-900 rounded-lg sm:rounded-xl" 
                            transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </m.div>
            </div>

            {/* VISUAL SHOWCASE: Below Header, Centered */}
            <div 
              className="group relative flex w-full flex-col items-center justify-center"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Ambient Background Blur */}
              <div className="absolute -inset-4 sm:-inset-10 rounded-full bg-gradient-to-br from-pink-600/10 via-emerald-500/10 to-rose-600/10 opacity-40 blur-[60px] sm:blur-[100px] group-hover:opacity-60 transition-opacity duration-1000" />

              <div className="relative aspect-[4/5.5] sm:aspect-[3.5/5.4] w-full max-w-[340px] sm:max-w-md">
                <Card className="relative h-full w-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border-slate-800 bg-[#06080F] p-0 text-white shadow-2xl ring-1 ring-white/5">
                  {/* Visual Header */}
                  <div className="relative border-b border-white/[0.05] bg-white/[0.02] p-4 sm:p-7 space-y-3 sm:space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                          <span className="text-[8px] sm:text-[9px] font-black tracking-[0.25em] text-[#5E6278] uppercase">MP Police PRELIMS · INSIGHT</span>
                      </div>
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/30">
                          <TrendingUp size={14} className="sm:w-4 sm:h-4" />
                      </div>
                    </div>
                    
                    <AnimatePresence mode="wait">
                        <m.h3 
                          key={activeCard}
                          initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "text-xl sm:text-3xl font-black tracking-tighter bg-clip-text text-transparent",
                            activeCard === 0 ? "bg-gradient-to-r from-emerald-400 to-teal-500" :
                            activeCard === 2 ? "bg-gradient-to-r from-blue-400 to-indigo-500" :
                            activeCard === 4 ? "bg-gradient-to-r from-pink-400 to-rose-500" :
                            activeCard === 1 ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                            "bg-gradient-to-r from-emerald-400 to-teal-500"
                          )}
                        >
                          {activeCard === 0 ? (isHindi ? '1000+ वन-लाइनर्स' : '1000+ One-Liners') : 
                          activeCard === 2 ? (isHindi ? 'पेपर I के तीन खंड' : 'Paper I — 3 sections') :
                          activeCard === 4 ? (isHindi ? 'GK और विज्ञान व्याख्या' : 'GK & Science Explanation') :
                          activeCard === 1 ? (isHindi ? 'अंक बंटन (40-30-30)' : 'Mark split (40-30-30)') : (isHindi ? 'इंस्टेंट अभ्यास' : 'Instant practice')}
                        </m.h3>
                    </AnimatePresence>
                  </div>

                  {/* CONTENT AREA */}
                  <div className="h-[calc(100%-120px)] sm:h-[calc(100%-140px)] overflow-y-auto p-4 sm:p-7 no-scrollbar">
                    <AnimatePresence mode="wait">
                      
                      {/* SLIDE 0: ONE-LINERS SHOWCASE */}
                      {activeCard === 0 && (
                        <m.div key="c0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-4 text-left">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span>High-Yield Points</span>
                            <span className="text-emerald-500">Daily Updates</span>
                          </div>
                          
                          <div className="space-y-3 pt-2">
                              {ONE_LINER_PREVIEW.map((item) => (
                                <OneLinerItem key={item.id} item={item} isHindi={isHindi} />
                              ))}
                          </div>

                          <div className="mt-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 p-4 text-center">
                            <p className="text-[10px] font-bold text-amber-500/80">
                              {isHindi ? 'सभी विषयों के महत्वपूर्ण तथ्य एक जगह।' : 'All subject vital facts in one place.'}
                            </p>
                          </div>
                        </m.div>
                      )}

                      {/* CARD 1: OVERALL WEIGHTAGE (BARS) */}
                      {activeCard === 1 && (
                        <m.div key="c1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-5 sm:space-y-6 text-left">
                          {WEIGHTAGE_BARS.map((sub) => (
                              <div key={sub.nameEn} className="space-y-2.5 sm:space-y-3">
                                <div className="flex justify-between items-end">
                                  <span className="text-[11px] sm:text-xs font-black text-slate-200">{isHindi ? sub.nameHi : sub.nameEn}</span>
                                  <span className="text-[9px] sm:text-[10px] font-black text-amber-500">{sub.pct}%</span>
                                </div>
                                <div className="h-2.5 sm:h-3 w-full rounded-full bg-white/5 overflow-hidden ring-1 ring-white/5">
                                  <m.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${sub.pct}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className={cn('h-full rounded-full bg-gradient-to-r', sub.color)}
                                  />
                                </div>
                              </div>
                          ))}
                          <div className="border-t border-white/5 pt-4">
                            <Badge className="border-none bg-amber-500/10 px-3 py-1 font-black text-[8px] uppercase tracking-widest text-amber-500 sm:text-[9px]">
                              {isHindi
                                ? 'कुल 100 प्रश्न · कोई नेगेटिव नहीं'
                                : '100 questions · No negative marking'}
                            </Badge>
                          </div>
                        </m.div>
                      )}

                      {/* CARD 2: SUBJECT ANALYSIS (CARDS) */}
                      {activeCard === 2 && (
                        <m.div key="c2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-5 text-left">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span>{isHindi ? 'आधिकारिक सिलेबस मैप' : 'Official syllabus map'}</span>
                            <span className="text-blue-500">3</span>
                          </div>
                          <div className="space-y-3 sm:space-y-4">
                            {SUBJECT_LIST_DETAILED.map((sub) => (
                              <SubjectItem key={sub.nameEn} sub={sub} isHindi={isHindi} />
                            ))}
                          </div>
                        </m.div>
                      )}

                      {/* CARD 3: SMART INSTANT MODE */}
                      {activeCard === 3 && (
                        <m.div key="c3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4 sm:space-y-6 text-left">
                          <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-white p-4 sm:p-7 text-slate-900 shadow-2xl space-y-4 sm:space-y-6 min-h-[320px] sm:min-h-[400px] border border-slate-100 relative overflow-hidden">
                              {/* Background Pattern */}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl" />
                              
                              <div className="relative z-10 flex items-start justify-between">
                                <div className="space-y-0.5">
                                  <p className="text-[8px] font-black uppercase leading-none tracking-widest text-emerald-600 sm:text-[9px]">
                                    {isHindi ? 'खंड 1 · तर्कशक्ति' : 'Section 1 · Reasoning'}
                                  </p>
                                  <h4 className="text-[14px] font-black tracking-tight sm:text-base">
                                    {isHindi ? 'तुरंत जवाब + व्याख्या' : 'Instant answer + breakdown'}
                                  </h4>
                                </div>
                                <Badge className="flex items-center gap-1 rounded-full border-none bg-emerald-500 px-2 py-1 font-black text-[8px] text-white shadow-lg shadow-emerald-500/20 sm:px-3 sm:py-1.5 sm:text-[9px]">
                                  <Zap size={10} className="fill-white" />{' '}
                                  {isHindi ? 'लाइव फीडबैक' : 'Live feedback'}
                                </Badge>
                              </div>

                              <div className="relative z-10 space-y-2">
                                <p className="text-[12px] font-bold leading-relaxed text-slate-800 sm:text-sm">
                                  {isHindi
                                    ? 'असंगत चुनें: तांबा, लोहा, चाँदी, पीतल'
                                    : 'Odd one out: Copper, Iron, Silver, Brass'}
                                </p>
                              </div>

                              <div className="relative z-10 space-y-2.5 sm:space-y-3">
                                <div className="group/opt flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50/30 p-3 text-slate-400 sm:rounded-xl sm:p-4">
                                  <span className="text-[11px] font-semibold sm:text-xs">
                                    {isHindi ? 'तांबा (Copper)' : 'Copper'}
                                  </span>
                                  <X size={14} className="text-rose-400 sm:h-4 sm:w-4" />
                                </div>
                                <div className="group/opt flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50/30 p-3 text-slate-400 sm:rounded-xl sm:p-4">
                                  <span className="text-[11px] font-semibold sm:text-xs">
                                    {isHindi ? 'लोहा (Iron)' : 'Iron'}
                                  </span>
                                  <X size={14} className="text-rose-400 sm:h-4 sm:w-4" />
                                </div>
                                <m.div
                                  initial={{ x: 0 }}
                                  animate={{ x: [0, 2, 0] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="flex items-center justify-between rounded-lg border-2 border-emerald-500 bg-emerald-50/50 p-3 text-slate-900 shadow-xl shadow-emerald-500/10 sm:rounded-xl sm:p-4"
                                >
                                  <span className="text-[12px] font-black sm:text-sm">
                                    {isHindi ? 'पीतल (Brass — मिश्र धातु)' : 'Brass (alloy)'}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-600">
                                      {isHindi ? 'सही' : 'Correct'}
                                    </span>
                                    <CheckCircle2 size={18} className="text-emerald-600 sm:h-5 sm:w-5" />
                                  </div>
                                </m.div>
                              </div>

                              <div className="relative z-10 space-y-2.5 rounded-xl border border-white/10 bg-slate-900 p-4 sm:rounded-2xl sm:p-5">
                                <div className="flex items-center justify-between">
                                  <Badge className="rounded-md border-none bg-emerald-500 px-2 py-0.5 font-black text-[8px] uppercase tracking-widest text-white">
                                    विषय: तर्कशक्ति
                                  </Badge>
                                  <Brain size={14} className="text-emerald-400" />
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[10px] font-bold leading-relaxed text-emerald-50 sm:text-[11px]">
                                    {isHindi
                                      ? 'तर्क: तांबा, लोहा, चाँदी धातु हैं; पीतल तांबा+जस्ता की मिश्र धातु है।'
                                      : 'Logic: Cu, Fe, Ag are elements; brass is Cu+Zn — the outlier.'}
                                  </p>
                                  <p className="border-t border-white/5 pt-2 text-[9px] font-medium italic leading-relaxed text-slate-400 sm:text-[10px]">
                                    {isHindi
                                      ? 'हटाने की विधि: धातु बनाम मिश्र धातु की पहचान करें।'
                                      : 'elimination: scan for “alloy vs pure metal” in one glance.'}
                                  </p>
                                </div>
                              </div>
                          </div>
                        </m.div>
                      )}

                      {/* CARD 4: BEST EXPLANATIONS */}
                      {activeCard === 4 && (
                        <m.div key="c4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-4 text-left">
                          <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                विस्तृत व्याख्या (Explanation)
                              </span>
                              <h4 className="text-xs font-bold text-white">
                                {isHindi ? 'उदाहरण: gk_science' : 'Sample: gk_science'}
                              </h4>
                            </div>
                            <Badge className="bg-pink-500 px-2 py-1 font-black text-[8px] text-black">PREMIUM</Badge>
                          </div>
                          <div className="space-y-3">
                            {GK_SCIENCE_EXPLANATION_PREVIEW.map((block) => (
                              <div
                                key={block.id}
                                className={cn(
                                  'space-y-1.5 rounded-xl border-l-[3px] border bg-[#1C1C28]/50 p-3 ring-1 ring-white/5 sm:rounded-2xl sm:p-4',
                                  {
                                    'border-emerald-500/50 bg-emerald-500/5': block.color === 'emerald',
                                    'border-amber-500/50 bg-amber-500/5': block.color === 'amber',
                                    'border-blue-500/50 bg-blue-500/5': block.color === 'blue',
                                    'border-rose-500/50 bg-rose-500/5': block.color === 'rose',
                                  }
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <block.icon
                                    size={12}
                                    className={cn({
                                      'text-emerald-400': block.color === 'emerald',
                                      'text-amber-400': block.color === 'amber',
                                      'text-blue-400': block.color === 'blue',
                                      'text-rose-400': block.color === 'rose',
                                    })}
                                  />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    {isHindi ? block.labelHi : block.labelEn}
                                  </span>
                                </div>
                                <p className="text-[11px] font-bold leading-relaxed text-slate-100">
                                  {isHindi ? block.contentHi : block.contentEn}
                                </p>
                              </div>
                            ))}
                          </div>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="absolute bottom-5 sm:bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2">
                    {TABS.map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleManualSwitch(TABS[i].id)} 
                          aria-label={`Go to slide ${i + 1}`} 
                          aria-current={activeCard === TABS[i].id ? 'step' : undefined}
                          className={cn("h-1 transition-all duration-300 rounded-full", activeCard === TABS[i].id ? "w-6 sm:w-8 bg-pink-600" : "w-1 sm:w-1.5 bg-white/10")} 
                        />
                    ))}
                  </div>
                </Card>
              </div>

              {/* MOBILE CTA BUTTON */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-8 flex justify-center lg:hidden w-full px-4"
              >
                <Link 
                  href="/pricing"
                  className="group relative inline-flex w-full items-center justify-center gap-4 rounded-2xl sm:rounded-3xl bg-[#0F172A] px-6 py-4 sm:px-10 sm:py-5 text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-white uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(15,23,42,0.3)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-500" />
                  <span className="relative z-10">{isHindi ? 'प्रीमियम अनलॉक करें' : 'Unlock Premium'}</span>
                  <Sparkles className="relative z-10 h-3.5 w-3.5 text-emerald-400" />
                  <ArrowRight className="relative z-10 h-3.5 w-3.5" />
                </Link>
              </m.div>
            </div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
