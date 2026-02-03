"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Sparkles, Brain, Lightbulb, Search, RotateCw, PlayCircle, Lock } from 'lucide-react';
import FlipCard from '@/components/FlipCard';
import { cn } from '@/lib/utils';
import { SideDrawer } from '@/components/SideDrawer';
import { SyllabusSearch } from '@/components/SyllabusSearch';
import { ViewToggle } from '@/components/ViewToggle';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/components/SyllabusLockModal';
import { Button } from '@/components/ui/button';
import { SyllabusTopicSheet } from '@/components/syllabus/SyllabusTopicSheet';
import { isSyllabusTopicLocked } from '@/lib/syllabus-locks';

// Type definition matching the DB Schema / Fallback Data
export interface TopicData {
  id: string | number;
  unitId: string;
  front: string;
  back: string;
  details?: string;
  mnemonic?: string;
  pro_tip?: string;
  impact_emoji?: string;
  important_facts?: string[];
  pyq?: { year: number | string; question: string; strategy?: string; type?: string }[];
  isFree?: boolean;
  image_url?: string;
}

interface UnitContentProps {
    unitId: string;
    unitTitle: string;
    unitTitleEn: string;
    topics: TopicData[];  // Hindi (Default)
    topicsEn: TopicData[]; // English
}

export default function UnitContent({ unitId, unitTitle, unitTitleEn, topics, topicsEn }: UnitContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get language from URL param, default to Hindi
  const langParam = searchParams.get('lang');
  const [language, setLanguage] = useState<'hi' | 'en'>(langParam === 'en' ? 'en' : 'hi');
  
  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'revision'>('grid');

  // Revision Mode State
  const [revisionIndex, setRevisionIndex] = useState(0);

  // New Flip State: Only one card flipped at a time
  const [activeFlippedId, setActiveFlippedId] = useState<string | number | null>(null);

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // SideDrawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null);
  const [isTopicSheetOpen, setIsTopicSheetOpen] = useState(false);
  
  // Premium/Lock State
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const { isSubscribed, user } = useSettingsStore();

  const isTopicLocked = (topic: TopicData, index: number) => {
      // Use the centralized logic
      return isSyllabusTopicLocked(
          topic,
          index,
          { isSubscribed: !!isSubscribed, plan_tier: user?.plan_tier },
          unitId,
          currentTopics.length // Pass the total count of filtered/current topics
      );
  };

  const handleQuizClick = (type: 'topic' | 'unit', topicId?: string | number) => {
      if (type === 'unit') {
           // Unit Test: Allowed for Unit 1 OR Subscribed Users
           if (unitId === 'unit_1' || isSubscribed) {
               router.push(`/syllabus/quiz/play?mode=topic&unit=${unitId}`);
               return;
           }
           setIsUnlockModalOpen(true);
           return;
      }

      if (type === 'topic' && topicId) {
          const index = currentTopics.findIndex(t => t.id === topicId);
          if (!isTopicLocked(currentTopics[index], index)) {
               router.push(`/syllabus/quiz/play?mode=topic&unit=${unitId}&topic=${topicId}`);
          } else {
               setIsUnlockModalOpen(true);
          }
      }
  };

  useEffect(() => {
     if (langParam === 'en' || langParam === 'hi') {
         setLanguage(langParam as 'hi' | 'en');
     }
  }, [langParam]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  // Select topics based on language
  const currentTitle = language === 'en' ? unitTitleEn : unitTitle;
  const rawTopics = language === 'en' ? topicsEn : topics;

  // Filter topics based on search
  const currentTopics = rawTopics.filter(t => 
    t.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.mnemonic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.pro_tip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.id.toString() === searchTerm)
  );

  const handleOpenDetails = (topic: TopicData, index: number) => {
    if (isTopicLocked(topic, index)) {
        setIsUnlockModalOpen(true);
        return;
    }
    setSelectedTopic(topic);
    setIsTopicSheetOpen(true); 
  };

    // Progress Calculation
    const freeTopicsCount = rawTopics.filter(t => t.isFree).length;
    // If subscribed, user has access to all topics, so 'unlocked' progress is 100%
    // If not subscribed, user has access only to free topics
    const progressPercent = isSubscribed 
        ? 100 
        : (freeTopicsCount / (rawTopics.length || 1)) * 100;

  // Helper to render markdown-like bold text
  const renderText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => (
      <span key={i} className="block mb-2">
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-slate-900 dark:text-white font-bold">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-24">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 transition-all duration-300">
        <div className="bg-white/70 backdrop-blur-2xl border-b border-indigo-100/50 shadow-[0_2px_20px_-10px_rgba(79,70,229,0.1)]">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
             <div className="flex items-center gap-4">
               <button 
                 onClick={() => router.back()}
                 className="p-3 rounded-2xl bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100 hover:scale-105 transition-all active:scale-95 group"
               >
                 <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
               </button>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80 mb-0.5">MPPSC PRELIMS 2026</span>
                  <h1 className="text-lg sm:text-2xl font-black text-slate-900 truncate max-w-[160px] sm:max-w-xl font-display leading-tight italic">
                    {currentTitle}
                  </h1>
               </div>
             </div>

             <div className="flex items-center gap-3">
                {/* <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="p-3 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all group hidden md:block"
                >
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button> */}

                <div className="flex bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200/40">
                  <button
                    onClick={() => setLanguage('hi')}
                    className={cn(
                      "px-4 py-1.5 text-xs font-black rounded-xl transition-all duration-300",
                      language === 'hi' 
                        ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 scale-105" 
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    हिन्दी
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                      "px-4 py-1.5 text-xs font-black rounded-xl transition-all duration-300",
                      language === 'en' 
                        ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 scale-105" 
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    ENG
                  </button>
                </div>
             </div>
          </div>
          
          {/* Progress Bar (Study Engagement) */}
          <div className="h-1 w-full bg-slate-100 overflow-hidden">
             <motion.div 
               className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
               initial={{ width: 0 }}
               animate={{ width: `${progressPercent}%` }}
               transition={{ duration: 1.5, ease: "easeOut" }}
             />
          </div>
        </div>
      </header>

      <SyllabusSearch open={isSearchOpen} setOpen={setIsSearchOpen} />

      <main className="max-w-7xl mx-auto pt-8 px-6">
        {/* Animated Intro */}
        <div className="mb-12 flex flex-col items-center justify-center text-center space-y-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
              <span className="relative inline-flex items-center px-6 py-2 rounded-full bg-indigo-600 text-white text-xs font-black tracking-widest uppercase shadow-2xl shadow-indigo-600/40">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {currentTopics.length} TOPICS UNLOCKED
              </span>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 w-full">
                 <Button 
                    size="lg"
                    onClick={() => handleQuizClick('unit')}
                    className="h-16 bg-slate-900 text-white hover:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-900/20 font-black px-10 text-lg group transition-all"
                 >
                     <PlayCircle className="w-6 h-6 mr-3 text-indigo-400 group-hover:scale-110 transition-transform" />
                     {language === 'hi' ? 'यूनिट टेस्ट शुरू करें' : 'START REVISION TEST'}                 </Button>

                 <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
        </div>

        {viewMode === 'grid' ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          key={`grid-${language}`} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 mb-16"
        >
          {currentTopics.map((topic) => (
            <motion.div key={topic.id} variants={item}>
              <FlipCard
                id={topic.id}
                className="h-[520px] w-full"
                isLocked={isTopicLocked(topic, currentTopics.indexOf(topic))}
                isFlipped={activeFlippedId === topic.id}
                image={topic.image_url}
                
                // Content
                title={topic.front}
                subtitle={topic.id.toString().split('_').pop()?.replace('t', '') || topic.id.toString()}
                impactEmoji={topic.impact_emoji}
                
                // Back Side
                backMainContent={topic.back}
                facts={topic.important_facts}
                mnemonic={topic.mnemonic}
                
                // Logic
                onPracticeTest={() => handleQuizClick('unit')}
                onReadMore={() => {
                    handleOpenDetails(topic, currentTopics.indexOf(topic));
                }}
                onFlip={(id) => {
                   if (activeFlippedId === id) {
                      setActiveFlippedId(null);
                   } else {
                      setActiveFlippedId(id);
                   }
                }}
                
                labels={{
                    tapToFlip: language === 'hi' ? 'पलटने के लिए टैप करें' : 'Tap to Flip',
                    topicAnalysis: language === 'hi' ? 'विषय विश्लेषण' : 'TOPIC ANALYSIS',
                    mnemonicLabel: language === 'hi' ? 'स्मरण सूत्र' : 'MNEMONIC',
                    practiceTest: language === 'hi' ? 'यूनिट टेस्ट दें' : 'Start Unit Test',
                    closeAnalysis: language === 'hi' ? 'बंद करें' : 'Close Analysis'
                }}
              />
            </motion.div>
          ))}
        </motion.div>
        ) : viewMode === 'list' ? (
             <div className="max-w-4xl mx-auto space-y-4 mb-12">
                {currentTopics.map((topic) => (
                    <motion.div 
                        key={topic.id} 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "border-2 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group flex items-start gap-8 cursor-pointer relative overflow-hidden",
                            isTopicLocked(topic, currentTopics.indexOf(topic)) ? "bg-slate-50/50 border-slate-100 opacity-75 grayscale-[0.5]" : "bg-white border-slate-100 hover:border-indigo-200"
                        )}
                        onClick={() => handleOpenDetails(topic, currentTopics.indexOf(topic))}
                    >
                         <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-40" />
                        
                        <div className={cn(
                            "flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl transition-transform group-hover:scale-110",
                            isTopicLocked(topic, currentTopics.indexOf(topic)) ? "bg-slate-200 text-slate-400" : "bg-slate-900 text-white shadow-slate-900/20"
                        )}>
                            {/* {topic.id.toString().split('_').pop()?.replace('t', '') || topic.id} */}
                        </div>
                        <div className="flex-1 relative z-10">
                            <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{topic.front}</h3>
                            <p className="text-slate-500 leading-relaxed mb-4 text-base line-clamp-2 italic font-medium">"{topic.back}"</p>
                            
                            <div className="flex items-center gap-3">
                                {isTopicLocked(topic, currentTopics.indexOf(topic)) ? (
                                    <span className="inline-flex items-center text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 uppercase tracking-widest">
                                        <Lock className="w-3.5 h-3.5 mr-2" /> PREMIUM LOCKED
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-widest">
                                        <Sparkles className="w-3.5 h-3.5 mr-2" /> UNLOCKED
                                    </span>
                                )}
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-colors">
                                    Click for Deep Dive
                                </span>
                            </div>
                        </div>
                        <ArrowRight className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-2 transition-all" size={24} />
                    </motion.div>
                ))}
            </div>
        ) : (
            /* REVISION MODE: Single Swipeable Card */
            <div className="max-w-2xl mx-auto mb-12">
               {currentTopics.length > 0 ? (
                <div className="space-y-10">
                   <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                          CARD {revisionIndex + 1} OF {currentTopics.length}
                       </span>
                       <div className="flex gap-2">
                          <button 
                            disabled={revisionIndex === 0}
                            onClick={() => setRevisionIndex(Math.max(0, revisionIndex - 1))}
                            className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
                          >
                             <ArrowLeft className="w-5 h-5" />
                          </button>
                          <button 
                            disabled={revisionIndex === currentTopics.length - 1}
                            onClick={() => setRevisionIndex(Math.min(currentTopics.length - 1, revisionIndex + 1))}
                            className="p-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-xl shadow-indigo-600/20"
                          >
                             <ArrowRight className="w-5 h-5" />
                          </button>
                       </div>
                   </div>

                   <motion.div
                     key={revisionIndex}
                     initial={{ x: 100, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     exit={{ x: -100, opacity: 0 }}
                     className="relative"
                   >
                     <FlipCard
                        id={currentTopics[revisionIndex].id}
                        className="h-[500px] w-full"
                        isLocked={isTopicLocked(currentTopics[revisionIndex], revisionIndex)}
                        isFlipped={activeFlippedId === currentTopics[revisionIndex].id}
                        onFlip={(id) => {
                           if (activeFlippedId === id) {
                              setActiveFlippedId(null);
                           } else {
                              setActiveFlippedId(id);
                           }
                        }}
                        onPracticeTest={() => handleQuizClick('unit')}
                        onReadMore={() => {
                            handleOpenDetails(currentTopics[revisionIndex], revisionIndex);
                        }}
                        
                        // Content
                        title={currentTopics[revisionIndex].front}
                        // subtitle={currentTopics[revisionIndex].id.toString().split('_').pop()?.replace('t', '') || currentTopics[revisionIndex].id.toString()}
                        impactEmoji={currentTopics[revisionIndex].impact_emoji}
                        
                        // Back Side
                        backMainContent={currentTopics[revisionIndex].back}
                        facts={currentTopics[revisionIndex].important_facts}
                        mnemonic={currentTopics[revisionIndex].mnemonic}
                        
                        labels={{
                            tapToFlip: language === 'hi' ? 'पलटने के लिए टैप करें' : 'Tap to Flip',
                            topicAnalysis: language === 'hi' ? 'विषय विश्लेषण' : 'TOPIC ANALYSIS',
                            mnemonicLabel: language === 'hi' ? 'स्मरण सूत्र' : 'MNEMONIC',
                            practiceTest: language === 'hi' ? 'यूनिट टेस्ट दें' : 'Start Unit Test',
                            closeAnalysis: language === 'hi' ? 'बंद करें' : 'Close Analysis'
                        }}
                     />
                   </motion.div>
                </div>
               ) : (
                 <div className="py-20 text-center text-slate-400 italic font-medium">
                    No topics found for the current search/filter.
                 </div>
               )}
            </div>
        )}

      </main>

      {/* Deep Dive Sidebar - Replaced by AI Sheet */}
      {/* 
      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={selectedTopic?.front}
      >
         ... (Existing SideDrawer Content) ...
      </SideDrawer> 
      */}

      <SyllabusTopicSheet 
         open={isTopicSheetOpen} 
         onOpenChange={setIsTopicSheetOpen}
         topic={selectedTopic}
         unitTitle={language === 'hi' ? unitTitle : unitTitleEn}
         unitId={unitId}
         language={language}
      />

      <SyllabusLockModal open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen} />
    </div>
  );
}

