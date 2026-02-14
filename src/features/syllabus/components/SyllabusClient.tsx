"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Sparkles,
  Lock,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/useSettingsStore";
import { SyllabusLockModal } from "@/features/syllabus/components/SyllabusLockModal";
import { SyllabusTopicCard } from "@/components/SyllabusTopicCard";
import { Button } from "@/components/ui/button";
import { SyllabusData } from "@/types/syllabus";


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
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!isMounted) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans pb-20 relative overflow-hidden selection:bg-slate-900 selection:text-white">
       {/* 🎭 PREMIUM BACKGROUND BLURS */}
       <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-slate-100/50 to-transparent pointer-events-none" />
       <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-[120px] pointer-events-none" />
       <div className="absolute top-[20%] left-[-150px] w-[500px] h-[500px] bg-emerald-50/30 rounded-full blur-[100px] pointer-events-none" />

       {/* --- Main Content --- */}
       <div className="pt-32 md:pt-48 px-6 max-w-7xl mx-auto relative z-10 space-y-16">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center text-center space-y-8"
          >
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white border border-slate-200 text-[10px] font-black tracking-widest text-slate-500 shadow-sm uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {syllabusData.exam_name}
              </div>
 
              <div className="space-y-4 max-w-4xl">
                  <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.95] md:leading-[0.9]">
                    {language === 'hi' ? 'तैयारी का ' : 'Master your'} <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
                        {language === 'hi' ? 'नया दौर।' : 'Syllabus.'}
                    </span>
                  </h1>
                  <p className="max-w-xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
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
          <div id="units-grid" className="scroll-mt-32">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                    {Object.entries(syllabusData.units).map(([key, unit], index) => {
                        const title = language === 'en' && unit.title_en ? unit.title_en : (unit.unit_title || unit.title);
                        const topics = language === 'en' && unit.topics_en ? unit.topics_en : unit.topics;
                        const isLocked = key !== "unit_1" && !isSubscribed;

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
                                    onClick={() => isLocked ? setUnlockModalOpen(true) : router.push(`/syllabus/${key}`)}
                                    labels={{
                                        search: language === 'hi' ? 'सर्च' : 'Search',
                                        topic: language === 'hi' ? 'विषय' : 'Topic',
                                        unit: language === 'hi' ? 'यूनिट' : 'Unit'
                                    }}
                                />
                            </motion.div>
                        )
                    })}
                </div>
              ) : (
             <div className="max-w-4xl mx-auto space-y-4 pb-20">
                {Object.entries(syllabusData.units).map(([key, unit], index) => {
                    const title = language === 'en' && unit.title_en ? unit.title_en : (unit.unit_title || unit.title);
                    const topicsCount = (language === 'en' && unit.topics_en ? unit.topics_en : unit.topics).length;
                    const isLocked = key !== "unit_1" && !isSubscribed;
                    
                    return (
                       <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
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
                             <div className={cn(
                                 "group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-md transition-all flex items-center gap-6 relative overflow-hidden",
                                 isLocked && "grayscale-[0.8]"
                             )}>
                                
                                <div className={cn(
                                    "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-xl z-10 transition-colors border",
                                    isLocked ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-white text-slate-900 border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900"
                                )}>
                                    {isLocked ? <Lock size={18} /> : (index + 1)}
                                </div>
                                
                                <div className="flex-1 min-w-0 z-10">
                                    <div className="flex items-center gap-2">
                                        <h3 className={cn("font-bold text-lg transition-colors truncate", isLocked ? "text-slate-500" : "text-slate-900 group-hover:text-slate-700")}>
                                            {title}
                                        </h3>
                                        {!isLocked && key === 'unit_1' && (
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">FREE</span>
                                        )}
                                        {isLocked && (
                                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Lock size={10} /> PREMIUM
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {topicsCount} {language === 'hi' ? 'विषय' : 'Topics'}
                                    </p>
                                </div>

                                <div className={cn(
                                    "transition-all z-10",
                                    isLocked ? "text-slate-300" : "text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1"
                                )}>
                                    <ArrowRight className="w-5 h-5" />
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
