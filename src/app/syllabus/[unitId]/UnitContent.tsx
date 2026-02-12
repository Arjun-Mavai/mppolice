"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Sparkles, Brain, Lightbulb, Search, RotateCw, PlayCircle, Lock } from 'lucide-react';
import FlipCard from '@/components/FlipCard';
import { SyllabusTopicCard } from '@/components/SyllabusTopicCard';
import { cn } from '@/lib/utils';
import { SideDrawer } from '@/components/SideDrawer';
import { SyllabusSearch } from '@/features/syllabus/components/SyllabusSearch';
import { ViewToggle } from '@/components/ViewToggle';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { Button } from '@/components/ui/button';
import { SyllabusTopicSheet } from '@/features/syllabus/components/SyllabusTopicSheet';
import { isSyllabusTopicLocked } from '@/features/syllabus/utils/locks';

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
  // ── Access control flags (DB se aate hain) ──────────────────
  isLiteAccess?: boolean | null;
  isProAccess?: boolean | null;
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
  
  // Language from global Zustand store — same toggle as navbar
  // This replaces the old ?lang= URL param approach for consistency
  const globalLanguage = useSettingsStore((state) => state.language);
  const language = globalLanguage;
  
  // Language setter from global store
  const setLanguage = useSettingsStore((state) => state.setLanguage);

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

  const isTopicLocked = (topic: TopicData, _filteredIndex: number) => {
      // Use the original index in rawTopics (not the filtered index) so
      // search filtering doesn't accidentally unlock premium topics.
      const originalIndex = rawTopics.findIndex(t => t.id === topic.id);
      return isSyllabusTopicLocked(
          topic,
          originalIndex >= 0 ? originalIndex : _filteredIndex,
          { isSubscribed: !!isSubscribed, plan_tier: user?.plan_tier },
          unitId,
          rawTopics.length
      );
  };

  const handleQuizClick = (type: 'topic' | 'unit', topicId?: string | number) => {
      if (type === 'unit') {
           // Unit Test: Free users can only access first 5 topics in Unit 1, logged users get full access
           if (user || isSubscribed) {
               router.push(`/syllabus/quiz/play?mode=topic&unit=${unitId}`);
               return;
           }
           // Free non-logged users: Only Unit 1 allowed
           if (unitId === 'unit_1') {
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
    <div className="min-h-screen bg-slate-50/50 font-sans pb-24 ">
      {/* Sub-header: Unit title + Language toggle + Progress bar */}
      {/* 🧭 PREMIUM SUB-NAV: Unit Title + Progress */}
      <div className="sticky top-[72px] md:top-[88px] z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <button 
              onClick={() => router.push('/syllabus')}
              className="group p-2 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm hover:shadow-md transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                    {language === 'hi' ? 'यूनिट' : 'Unit'} {unitId.replace('unit_', '')}
                </span>
                <h1 className="text-lg md:text-xl font-black text-slate-900 truncate max-w-[180px] sm:max-w-md leading-tight">
                {currentTitle}
                </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
              {/* Desktop Progress Indicator */}
              <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                      <div className="text-sm font-black text-slate-900">{Math.round(progressPercent)}%</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{language === 'hi' ? 'पूर्ण' : 'Complete'}</div>
                  </div>
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-emerald-500"
                      />
                  </div>
              </div>

              {/* Action: Search Shortcut (Visual Only) */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/50 text-slate-400 text-[10px] font-bold">
                  <Search className="w-3.5 h-3.5" />
                  <span>CMD+K</span>
              </div>
          </div>
        </div>
        
        {/* Mobile Progress Bar (Slimmer) */}
        <div className="h-[2px] w-full bg-slate-100 md:hidden">
          <motion.div 
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <SyllabusSearch open={isSearchOpen} setOpen={setIsSearchOpen} />

      <main className="max-w-7xl mx-auto pt-8 px-6">
        {/* Animated Intro */}
        <div className="mb-12 flex flex-col items-center justify-center text-center space-y-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-slate-500/10 blur-3xl rounded-full" />
              <span className="relative inline-flex items-center px-6 py-2 rounded-full bg-slate-900 text-white text-xs font-black tracking-widest uppercase shadow-lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {currentTopics.length} TOPICS
              </span>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 w-full">
                 <Button 
                    size="lg"
                    onClick={() => handleQuizClick('unit')}
                    className="h-14 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl shadow-lg font-bold px-8 text-base group transition-all"
                 >
                     <PlayCircle className="w-5 h-5 mr-2 text-emerald-400 group-hover:scale-110 transition-transform" />
                     {language === 'hi' ? 'यूनिट टेस्ट शुरू करें' : 'Start Revision Test'}                 </Button>

                 <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
        </div>

        {viewMode === 'grid' ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16"
        >
          {currentTopics.map((topic, idx) => {
            const locked = isTopicLocked(topic, idx);
            const isFree = !locked && !isSubscribed && !user && topic.isFree;
            
            // Rotate color variants
            const variants: ('blue' | 'pink' | 'emerald' | 'amber')[] = ['blue', 'pink', 'emerald', 'amber'];
            const colorVariant = variants[idx % variants.length];

            return (
              <motion.div key={topic.id} variants={item}>
                <SyllabusTopicCard
                  id={topic.id}
                  title={topic.front}
                  impactEmoji={topic.impact_emoji}
                  imageUrl={topic.image_url}
                  colorVariant={colorVariant}
                  isLocked={locked}
                  isFree={isFree}
                  onClick={() => handleOpenDetails(topic, idx)}
                  labels={{
                    search: language === 'hi' ? 'सर्च' : 'Search',
                    topic: language === 'hi' ? 'विषय' : 'Topic',
                    unit: language === 'hi' ? 'यूनिट' : 'Unit'
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
        ) : viewMode === 'list' ? (
             <div className="max-w-4xl mx-auto space-y-4 mb-12">
                {currentTopics.map((topic, idx) => {
                    const locked = isTopicLocked(topic, idx);
                    const showFreeBadge = !locked && !isSubscribed && !user && topic.isFree;
                    
                    return (
                    <motion.div 
                        key={topic.id} 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "border-2 rounded-[2.5rem] p-8 hover:shadow-lg transition-all group flex items-start gap-8 cursor-pointer relative overflow-hidden",
                            locked ? "bg-slate-50/50 border-slate-100 opacity-75 grayscale-[0.5]" : "bg-white border-slate-100 hover:border-slate-300"
                        )}
                        onClick={() => handleOpenDetails(topic, idx)}
                    >
                         <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-40" />
                        
                        <div className={cn(
                            "flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl transition-transform group-hover:scale-110",
                            locked ? "bg-slate-200 text-slate-400" : "bg-emerald-100 text-slate-900 shadow-emerald-100/40"
                        )}>
                        </div>
                        <div className="flex-1 relative z-10">
                            <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-slate-700 transition-colors uppercase tracking-tight">{topic.front}</h3>
                            <p className="text-slate-500 leading-relaxed mb-4 text-base line-clamp-2 italic font-medium">"{topic.back}"</p>
                            
                            <div className="flex items-center gap-3">
                                {locked ? (
                                    <span className="inline-flex items-center text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 uppercase tracking-widest">
                                        <Lock className="w-3.5 h-3.5 mr-2" /> PREMIUM LOCKED
                                    </span>
                                ) : showFreeBadge ? (
                                    <span className="inline-flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest">
                                        <Sparkles className="w-3.5 h-3.5 mr-2" /> FREE
                                    </span>
                                ) : null}
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 group-hover:border-slate-200 group-hover:bg-slate-100 transition-colors">
                                    Click for Deep Dive
                                </span>
                            </div>
                        </div>
                        <ArrowRight className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-2 transition-all" size={24} />
                    </motion.div>
                    );
                })}
            </div>
        ) : (
            /* REVISION MODE: Single Swipeable Card */
            <div className="max-w-2xl mx-auto mb-12">
               {currentTopics.length > 0 ? (
                <div className="space-y-10">
                   <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          CARD {revisionIndex + 1} OF {currentTopics.length}
                       </span>
                       <div className="flex gap-2">
                          <button 
                            disabled={revisionIndex === 0}
                            onClick={() => setRevisionIndex(Math.max(0, revisionIndex - 1))}
                            className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-all shadow-sm"
                          >
                             <ArrowLeft className="w-5 h-5" />
                          </button>
                          <button 
                            disabled={revisionIndex === currentTopics.length - 1}
                            onClick={() => setRevisionIndex(Math.min(currentTopics.length - 1, revisionIndex + 1))}
                            className="p-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 transition-all shadow-lg"
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

