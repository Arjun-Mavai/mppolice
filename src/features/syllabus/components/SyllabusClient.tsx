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
import { Button } from "@/components/ui/button";
import { SyllabusData } from "@/types/syllabus";

function UnitCard({ unit, unitKey, index, language, onClick, themeClass, iconColor, isLocked, onLockClick }: any) {
    const title = language === 'en' && unit.title_en ? unit.title_en : (unit.unit_title || unit.title);
    const topics = language === 'en' && unit.topics_en ? unit.topics_en : unit.topics;
    
    // Handle card click
    const handleClick = (e: React.MouseEvent) => {
        if (isLocked) {
             e.preventDefault();
             onLockClick();
        } else {
            onClick();
        }
    };

    return (
        <motion.div 
            className="group relative h-[280px] w-full cursor-pointer select-none"
            onClick={handleClick}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className={cn(
                "absolute inset-0 h-full w-full bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:border-indigo-200/50",
                isLocked && "grayscale-[0.8] opacity-90"
            )}>
                 {/* Decorative background gradients */}
                <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br", themeClass)} />
                
                {isLocked && (
                    <div className="absolute top-4 right-4 z-20">
                         <div className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                             <Lock className="w-3 h-3" />
                             PREMIUM
                         </div>
                    </div>
                )}
                
                {/* Free Badge for Unit 1 */}
                {!isLocked && unitKey === 'unit_1' && (
                     <div className="absolute top-4 right-4 z-20 animate-pulse">
                        <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                            NEW / FREE
                        </div>
                   </div>
                )}

                <div className="p-6 h-full flex flex-col relative z-10">
                    {/* Unit Number - Darker & Visible */}
                    <div className="flex justify-between items-start mb-6">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-2xl shadow-sm border border-slate-100 transition-colors",
                            isLocked ? "bg-slate-100 text-slate-400" : "bg-white text-slate-900 group-hover:bg-indigo-600 group-hover:text-white"
                        )}>
                            {index + 1}
                        </div>
                        
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                             isLocked ? "bg-slate-50 text-slate-300" : "bg-indigo-50 text-indigo-600 group-hover:bg-white group-hover:text-indigo-600"
                        )}>
                            {isLocked ? <Lock size={16} /> : <ArrowRight size={18} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />}
                        </div>
                    </div>

                    <div className="space-y-4 mb-auto">
                        <h3 className={cn(
                            "font-bold text-xl leading-tight line-clamp-2 transition-colors",
                            isLocked ? "text-slate-500" : "text-slate-900"
                        )}>
                            {title}
                        </h3>
                        
                        <div className="flex items-center text-sm font-medium text-slate-500 mb-4">
                            <BookOpen className="w-4 h-4 mr-2 opacity-70" />
                            {topics.length} {language === 'hi' ? 'टॉपिक्स' : 'Topics'}
                        </div>
                    </div>
                    
                    {/* Visual Progress Bar (Fake for now, creates engagement) */}
                    {!isLocked && (
                        <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
                            <div className="absolute top-0 left-0 h-full w-[0%] bg-indigo-500 group-hover:w-[15%] transition-all duration-1000 ease-out" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

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
    <div className="min-h-screen bg-slate-50 font-sans pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* --- Main Content --- */}
      <div className="pt-32 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-xs font-bold text-indigo-600 shadow-sm mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                {syllabusData.exam_name}
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold font-display tracking-tight text-slate-900 leading-[1.1]">
                {language === 'hi' ? 'आपका सिलेबस,' : 'Your Syllabus,'} <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                    {language === 'hi' ? 'स्मार्ट और सरल।' : 'Reimagined.'}
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-slate-600">
                 {syllabusData.subject}
              </p>

              <div className="pt-4 flex justify-center gap-6 items-center flex-col sm:flex-row">
                  <Link href="/syllabus/quiz">
                      <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all group">
                         <Sparkles className="w-5 h-5 mr-2 text-yellow-400 group-hover:rotate-12 transition-transform" />
                         {language === 'hi' ? 'टेस्ट सीरीज शुरू करें' : 'Start MPPSC Prelims Test'}
                      </Button>
                  </Link>
              </div>
          </motion.div>


          {/* Units Grid/List */}
          {viewMode === 'grid' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {Object.entries(syllabusData.units).map(([key, unit], index) => {
                    // Gradients for cards (hover states mostly now)
                    const gradients = [
                      "from-blue-500/10 to-indigo-500/10",
                      "from-purple-500/10 to-pink-500/10",
                      "from-emerald-500/10 to-teal-500/10",
                      "from-amber-500/10 to-orange-500/10",
                      "from-rose-500/10 to-red-500/10",
                    ];
                    const themeClass = gradients[index % gradients.length];
                    const iconColor = ["text-blue-600", "text-purple-600", "text-emerald-600", "text-amber-600", "text-rose-600"][index % 5];
                    
                    // Logic: Unit 1 is always unlocked. Others depend on subscription.
                    const isLocked = key !== "unit_1" && !isSubscribed;

                    return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <UnitCard 
                                unit={unit} 
                                unitKey={key} 
                                index={index} 
                                language={language} 
                                themeClass={themeClass} 
                                iconColor={iconColor}
                                isLocked={isLocked}
                                onLockClick={() => setUnlockModalOpen(true)}
                                onClick={() => router.push(`/syllabus/${key}?lang=${language}`)}
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
                                      router.push(`/syllabus/${key}?lang=${language}`);
                                  }
                              }}
                              className="cursor-pointer"
                          >
                             <div className={cn(
                                 "group bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-md transition-all flex items-center gap-6 relative overflow-hidden",
                                 isLocked && "grayscale-[0.8]"
                             )}>
                                
                                <div className={cn(
                                    "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-xl z-10 transition-colors border",
                                    isLocked ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-white text-slate-900 border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600"
                                )}>
                                    {isLocked ? <Lock size={18} /> : (index + 1)}
                                </div>
                                
                                <div className="flex-1 min-w-0 z-10">
                                    <div className="flex items-center gap-2">
                                        <h3 className={cn("font-bold text-lg transition-colors truncate", isLocked ? "text-slate-500" : "text-slate-900 group-hover:text-indigo-700")}>
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
                                    isLocked ? "text-slate-300" : "text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1"
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

          <SyllabusLockModal open={unlockModalOpen} onOpenChange={setUnlockModalOpen} />
      </div>

    </div>
  );
}
