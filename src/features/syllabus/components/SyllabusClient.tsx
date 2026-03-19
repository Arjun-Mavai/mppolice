'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Lock, ArrowRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { SyllabusTopicCard } from '@/components/SyllabusTopicCard';
import { Button } from '@/components/ui/button';
import { SyllabusData } from '@/types/syllabus';

interface SyllabusClientProps {
  syllabusData: SyllabusData;
}

export function SyllabusClient({ syllabusData }: SyllabusClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMounted, setIsMounted] = useState(false);
  const { user, isSubscribed, setUser, language, setLanguage } = useSettingsStore();

  // Hydration fix for Persist middleware
  useEffect(() => {
    setIsMounted(true);
    const urlLang = searchParams.get('lang');
    if (urlLang === 'en' || urlLang === 'hi') {
      if (urlLang !== language) setLanguage(urlLang);
    }
  }, []);

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!isMounted) return null; // Prevent hydration mismatch

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafbfc] pb-20 font-sans selection:bg-slate-900 selection:text-white">
      {/* 🎭 PREMIUM BACKGROUND BLURS */}
      <div className="pointer-events-none absolute top-0 left-0 h-[600px] w-full bg-gradient-to-b from-slate-100/50 to-transparent" />
      <div className="pointer-events-none absolute top-[-100px] right-[-100px] h-[600px] w-[600px] rounded-full bg-indigo-50/40 blur-[120px]" />
      <div className="pointer-events-none absolute top-[20%] left-[-150px] h-[500px] w-[500px] rounded-full bg-emerald-50/30 blur-[100px]" />

      {/* --- Main Content --- */}
      <div className="relative z-10 mx-auto max-w-7xl space-y-16 px-6 pt-32 md:pt-48">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center space-y-8 text-center"
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-5 py-2 text-[10px] font-black tracking-widest text-slate-500 uppercase shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            {syllabusData.exam_name}
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-5xl leading-[0.95] font-black tracking-tighter text-slate-900 md:text-8xl md:leading-[0.9]">
              {language === 'hi' ? 'तैयारी का ' : 'Master your'} <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
                {language === 'hi' ? 'नया दौर।' : 'Syllabus.'}
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-lg leading-relaxed font-medium text-slate-500 md:text-xl">
              {language === 'hi'
                ? 'एमपीपीएससी प्रीलिम्स 2026 के लिए आधुनिक रणनीति। 100+ टॉपिक्स, नेमोनिक्स और टेस्ट सीरीज।'
                : 'The most comprehensive roadmap for MPPSC 2026. 100+ topics, smart mnemonics, and real-time assessments.'}
            </p>
          </div>

          {/* <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/syllabus/quiz">
                      <Button className="h-16 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl px-10 text-lg font-black shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)] transition-all group flex items-center gap-3">
                         <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400 group-hover:rotate-12 transition-transform" />
                         {language === 'hi' ? 'टेस्ट सीरीज' : 'Practice Tests'}
                      </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="h-16 px-10 text-lg font-black text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                    onClick={() => {
                        const target = document.getElementById('units-grid');
                        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                      {language === 'hi' ? 'यूनिट्स देखें' : 'View Units'}
                  </Button>
              </div> */}
        </motion.div>

        {/* Units Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* ✦ PYQ Intelligence Section */}
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {language === 'hi' ? 'PYQ इंटेलिजेंस' : 'PYQ Intelligence'}
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {language === 'hi' ? '2020-2025 · MPPSC Prelims ट्रेंड्स' : '2020-2025 · MPPSC Prelims Trends'}
                  </p>
                </div>
              </div>
              <Link
                href="/syllabus/quiz/pyq/analysis"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                {language === 'hi' ? 'सब देखें' : 'View All'}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Card 1: Year-wise Trend */}
              <Link href="/syllabus/quiz/pyq/analysis" className="group block">
                <div className="relative h-full rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5 transition-all hover:shadow-lg hover:shadow-blue-200/40 hover:-translate-y-0.5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-2xl">📅</span>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-blue-600">
                      {language === 'hi' ? 'ट्रेंड' : 'Trend'}
                    </span>
                  </div>
                  <h3 className="mb-1 text-sm font-black text-slate-800">
                    {language === 'hi' ? 'Year-wise Matrix' : 'Year-wise Matrix'}
                  </h3>
                  {/* Mini bar chart */}
                  <div className="mt-3 space-y-1.5">
                    {[
                      { year: '2025', pct: 90, color: 'bg-blue-500' },
                      { year: '2024', pct: 72, color: 'bg-blue-400' },
                      { year: '2023', pct: 58, color: 'bg-blue-300' },
                    ].map((row) => (
                      <div key={row.year} className="flex items-center gap-2">
                        <span className="w-9 text-[10px] font-black text-slate-500">{row.year}</span>
                        <div className="flex-1 h-2.5 rounded-full bg-blue-100 overflow-hidden">
                          <div className={`h-full rounded-full ${row.color} transition-all`} style={{ width: `${row.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] font-semibold text-blue-600 group-hover:underline">
                    {language === 'hi' ? 'पूरा देखें →' : 'Explore →'}
                  </p>
                </div>
              </Link>

              {/* Card 2: Hot Topics */}
              <Link href="/syllabus/quiz/pyq/analysis" className="group block">
                <div className="relative h-full rounded-[1.5rem] border border-pink-100 bg-pink-50 p-5 transition-all hover:shadow-lg hover:shadow-pink-200/40 hover:-translate-y-0.5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-2xl">🔥</span>
                    <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-pink-600">
                      {language === 'hi' ? 'राइज़िंग' : 'Rising'}
                    </span>
                  </div>
                  <h3 className="mb-1 text-sm font-black text-slate-800">
                    {language === 'hi' ? 'हॉट टॉपिक्स' : 'Hot Topics'}
                  </h3>
                  <div className="mt-3 space-y-2">
                    {[
                      { topic: language === 'hi' ? 'पर्यावरण' : 'Environment', delta: '+12', color: 'text-pink-700' },
                      { topic: language === 'hi' ? 'मध्यप्रदेश GK' : 'MP GK', delta: '+9', color: 'text-pink-600' },
                      { topic: language === 'hi' ? 'अर्थव्यवस्था' : 'Economy', delta: '+7', color: 'text-pink-500' },
                    ].map((row) => (
                      <div key={row.topic} className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-slate-700">{row.topic}</span>
                        <span className={`text-[11px] font-black ${row.color}`}>{row.delta} ▲</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] font-semibold text-pink-600 group-hover:underline">
                    {language === 'hi' ? 'ट्रेंड देखो →' : 'See Trends →'}
                  </p>
                </div>
              </Link>

              {/* Card 3: Quick Fact Flashcard */}
              <Link href="/syllabus/quiz/pyq/facts" className="group block">
                <div className="relative h-full rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-5 transition-all hover:shadow-lg hover:shadow-emerald-200/40 hover:-translate-y-0.5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-2xl">⚡</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                      {language === 'hi' ? 'फैक्ट' : 'Fact'}
                    </span>
                  </div>
                  <h3 className="mb-1 text-sm font-black text-slate-800">
                    {language === 'hi' ? 'क्विक PYQ फैक्ट' : 'Quick PYQ Fact'}
                  </h3>
                  <p className="mt-2 text-[13px] font-bold leading-relaxed text-slate-700 [text-shadow:1px_1px_1px_rgba(0,0,0,0.04)]">
                    {language === 'hi'
                      ? '"MP की ताप विद्युत क्षमता लगभग 12,000 MW है — यह 2025 prelims में पूछा गया था" 🎯'
                      : '"MP\'s thermal power capacity is ~12,000 MW — directly asked in 2025 Prelims" 🎯'}
                  </p>
                  <p className="mt-3 text-[11px] font-semibold text-emerald-600 group-hover:underline">
                    {language === 'hi' ? 'फैक्ट्स देखें →' : 'View Facts →'}
                  </p>
                </div>
              </Link>

            </div>
          </div>
        </motion.div>

        {/* Units Grid/List */}
        <div id="units-grid" className="scroll-mt-32">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-8 pb-32 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(syllabusData.units).map(([key, unit], index) => {
                const title =
                  language === 'en' && unit.title_en
                    ? unit.title_en
                    : unit.unit_title || unit.title;
                const topics = language === 'en' && unit.topics_en ? unit.topics_en : unit.topics;
                const isLocked = key !== 'unit_1' && !isSubscribed;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 + 0.4 }}
                  >
                    <SyllabusTopicCard
                      id={key}
                      title={title ?? ''}
                      subtitle={`${topics?.length || 0} ${language === 'hi' ? 'टॉपिक्स' : 'Topics'}`}
                      impactEmoji="📚"
                      colorVariant={(['blue', 'pink', 'emerald', 'amber'] as const)[index % 4]}
                      variant="unit"
                      isLocked={isLocked}
                      onClick={() =>
                        isLocked ? setUnlockModalOpen(true) : router.push(`/syllabus/${key}`)
                      }
                      labels={{
                        search: language === 'hi' ? 'सर्च' : 'Search',
                        topic: language === 'hi' ? 'विषय' : 'Topic',
                        unit: language === 'hi' ? 'यूनिट' : 'Unit',
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-4 pb-20">
              {Object.entries(syllabusData.units).map(([key, unit], index) => {
                const title =
                  language === 'en' && unit.title_en
                    ? unit.title_en
                    : unit.unit_title || unit.title;
                const topicsCount = (
                  language === 'en' && unit.topics_en ? unit.topics_en : unit.topics
                ).length;
                const isLocked = key !== 'unit_1' && !isSubscribed;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    <div
                      onClick={() => {
                        if (isLocked) {
                          setUnlockModalOpen(true);
                        } else {
                          router.push(`/syllabus/${key}`);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          'group relative flex items-center gap-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md',
                          isLocked && 'grayscale-[0.8]'
                        )}
                      >
                        <div
                          className={cn(
                            'font-display z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border text-xl font-bold transition-colors',
                            isLocked
                              ? 'border-slate-200 bg-slate-100 text-slate-400'
                              : 'border-slate-200 bg-white text-slate-900 group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white'
                          )}
                        >
                          {isLocked ? <Lock size={18} /> : index + 1}
                        </div>

                        <div className="z-10 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3
                              className={cn(
                                'truncate text-lg font-bold transition-colors',
                                isLocked
                                  ? 'text-slate-500'
                                  : 'text-slate-900 group-hover:text-slate-700'
                              )}
                            >
                              {title}
                            </h3>
                            {!isLocked && key === 'unit_1' && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                FREE
                              </span>
                            )}
                            {isLocked && (
                              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                <Lock size={10} /> PREMIUM
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-500">
                            {topicsCount} {language === 'hi' ? 'विषय' : 'Topics'}
                          </p>
                        </div>

                        <div
                          className={cn(
                            'z-10 transition-all',
                            isLocked
                              ? 'text-slate-300'
                              : 'text-slate-300 group-hover:translate-x-1 group-hover:text-slate-600'
                          )}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <SyllabusLockModal open={unlockModalOpen} onOpenChange={setUnlockModalOpen} />
      </div>
    </div>
  );
}
