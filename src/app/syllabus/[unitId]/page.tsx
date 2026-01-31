"use client"

import React, { use, useState, useEffect } from 'react';
import { useRouter, notFound, useSearchParams } from 'next/navigation';
import FlipCard from '@/components/FlipCard';
import { syllabusData, Topic } from '@/data/syllabusData';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Sparkles, Brain, Lightbulb, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SideDrawer } from '@/components/SideDrawer';
import { SyllabusSearch } from '@/components/SyllabusSearch';
import { ViewToggle } from '@/components/ViewToggle';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Lock, PlayCircle } from 'lucide-react';
import { SyllabusLockModal } from '@/components/SyllabusLockModal';
import { Button } from '@/components/ui/button';

// Types for the params
type Props = {
  params: Promise<{ unitId: string }>
}

export default function UnitPage({ params }: Props) {
  const resolvedParams = use(params);
  const { unitId } = resolvedParams;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get language from URL param, default to Hindi
  const langParam = searchParams.get('lang');
  const [language, setLanguage] = useState<'hi' | 'en'>(langParam === 'en' ? 'en' : 'hi');
  
  // Search State (Viral Factor)
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  // Single Active Flip State (Viral Factor)
  const [flippedCardId, setFlippedCardId] = useState<number | null>(null);
  
  // SideDrawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  // Premium/Lock State
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const { isSubscribed } = useSettingsStore();

  const handleQuizClick = (type: 'topic' | 'unit', topicId?: number) => {
      // Locking Logic
      // Unit Test: Always locked for free users (Premium Feature)
      if (type === 'unit' && !isSubscribed) {
          setIsUnlockModalOpen(true);
          return;
      }

      // Topic Quiz:
      // Unit 1, Topics 1-5 (IDs usually 1-5 or 0-4 index) are FREE.
      // Assuming topicId corresponds to index+1. 
      // If unitId is 'unit_1' and topicId <= 5 -> FREE.
      // Else -> Locked.
      if (type === 'topic') {
          if (isSubscribed) {
               // Allowed
          } else {
              if (unitId === 'unit_1' && topicId && topicId <= 8) {
                 // Allowed
             } else {
                 setIsUnlockModalOpen(true);
                 return;
             }
          }
      }

      // If allowed, navigate to quiz
      // router.push(`/syllabus/quiz/${unitId}/${type === 'topic' ? topicId : 'full'}`);
      // alert("Quiz Feature Coming Soon! (This would open the quiz page)");
      router.push(`/syllabus/quiz/play?mode=topic&unit=${unitId}&topic=${topicId}`);
  };

  const unit = syllabusData.units[unitId];

  if (!unit) {
    notFound();
  }

  // Effect to sync URL param change if needed
  useEffect(() => {
     if (langParam === 'en' || langParam === 'hi') {
         setLanguage(langParam as 'hi' | 'en');
     }
  }, [langParam]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  // Select topics based on language
  // Fallback to empty array if specific language topics not found to prevent crash
  const rawTopics = (language === 'en' && unit.topics_en) ? unit.topics_en : (unit.topics || []);
  const currentTitle = (language === 'en' && unit.title_en) ? unit.title_en : unit.title;

  // Filter topics based on search (Viral Factor)
  const currentTopics = rawTopics.filter(t => 
    t.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.mnemonic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.pro_tip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.id.toString() === searchTerm)
  );

  const handleOpenDetails = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsDrawerOpen(true);
  };

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
    <div className="min-h-screen bg-white font-sans pb-20">
      {/* Sticky Premium Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => router.back()}
               className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors flex items-center text-slate-600 group"
             >
               <ArrowLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
               <span className="font-medium hidden sm:inline">Back</span>
             </button>
             <h1 className="text-sm sm:text-lg font-bold truncate max-w-[150px] sm:max-w-xs text-slate-900 font-display">
               {currentTitle}
              </h1>
           </div>

           <div className="flex items-center gap-2">
              {/* Search Trigger */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden md:block"
                title="Search (Cmd+K)"
              >
                <Search className="w-5 h-5" />
              </button>

              <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
               <button
                 onClick={() => setLanguage('hi')}
                 className={cn(
                   "px-3 py-1 text-xs font-bold rounded-full transition-all duration-200",
                   language === 'hi' 
                     ? "bg-white text-indigo-600 shadow-sm" 
                     : "text-slate-500 hover:text-slate-700"
                 )}
               >
                 हिंदी
               </button>
               <button
                 onClick={() => setLanguage('en')}
                 className={cn(
                   "px-3 py-1 text-xs font-bold rounded-full transition-all duration-200",
                   language === 'en' 
                     ? "bg-white text-indigo-600 shadow-sm" 
                     : "text-slate-500 hover:text-slate-700"
                 )}
               >
                 ENG
               </button>
             </div>
           </div>
        </div>
      </div>

      <SyllabusSearch open={isSearchOpen} setOpen={setIsSearchOpen} />

      <main className="max-w-7xl mx-auto py-10 px-6">
        <div className="mb-10 text-center space-y-6">
            <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold">
                <BookOpen className="w-4 h-4 mr-2" />
                {currentTopics.length} Topics
            </span>
            
            {/* Search Bar (Viral Factor) */}
            {/* <div className="max-w-md mx-auto relative group">
                <input 
                  type="text" 
                  placeholder={language === 'hi' ? "Search mnemonics, topics..." : "Search 'Trick', 'Veda'..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:outline-none transition-all shadow-sm group-hover:shadow-md text-lg"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Sparkles className="w-5 h-5" />
                </div>
            </div> */}

            {/* <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed text-lg">
               {language === 'hi' 
                 ? "फ्लैशकार्ड पर टैप करके विस्तार से पढ़ें। 'ट्रिक्स' खोजने के लिए सर्च करें।" 
                 : "Tap to flip. Search 'Trick' to find mnemonics instantly."}
            </p> */}

            {/* View Toggle */}
            <div className="flex justify-center mt-6">
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
        </div>

        {viewMode === 'grid' ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          key={`grid-${language}`} 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {currentTopics.map((topic) => (
            <motion.div key={topic.id} variants={item}>
              <FlipCard
                className="h-[400px] w-full"
                isFlipped={flippedCardId === topic.id}
                onFlip={() => setFlippedCardId(flippedCardId === topic.id ? null : topic.id)}
                frontContent={
                  <div className="flex flex-col items-center justify-center p-2 h-full relative z-10 w-full">
                    <span className="text-8xl mb-6 opacity-5 font-serif absolute top-4 right-4 text-slate-900 pointer-events-none">
                      {topic.id.toString().padStart(2, '0')}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 font-display leading-[1.2] text-center drop-shadow-sm px-4">
                      {topic.front}
                    </h3>
                  </div>
                }
                backContent={
                  <div className="flex flex-col h-full w-full">
                    <div className="flex items-center mb-4 pb-4 border-b border-white/10 w-full shrink-0">
                        <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded text-white mr-3 tracking-wider">
                             #{topic.id}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate flex-1 opacity-90">{topic.front}</h4>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto w-full pr-1 custom-scrollbar mb-4">
                        <p className="text-white/90 text-lg leading-relaxed font-normal">
                           {topic.back}
                        </p>
                    </div>

                    <div className="mt-auto pt-2">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetails(topic);
                            }}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 group border border-white/5"
                        >
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                            {language === 'hi' ? 'स्मरण ट्रिक्स देखें' : 'View Mnemonics & Details'}
                        </button>
                    </div>
                  </div>
                }
              />
            </motion.div>
          ))}
        </motion.div>
        ) : (
             <div className="max-w-4xl mx-auto space-y-4">
                {currentTopics.map((topic) => (
                    <motion.div 
                        key={topic.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all group flex items-start gap-6 cursor-pointer"
                        onClick={() => handleOpenDetails(topic)}
                    >
                        <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                            {topic.id}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{topic.front}</h3>
                            <p className="text-slate-600 leading-relaxed mb-3">{topic.back}</p>
                            <div className="flex items-center gap-3">
                                {topic.mnemonic && (
                                    <span className="inline-flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                        <Lightbulb className="w-3 h-3 mr-1" /> Mnemonic
                                    </span>
                                )}
                                {topic.pro_tip && (
                                    <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                        <Sparkles className="w-3 h-3 mr-1" /> Pro Tip
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="self-center">
                            <button className="p-2 text-slate-400 group-hover:text-indigo-600 transition-colors">
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
      </main>

      {/* Dynamic Sidebar */}
      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={selectedTopic?.front}
      >
         <div className="space-y-8">
            {/* Concept Mastery */}
            <section>
                <h3 className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs mb-3">
                    <Brain className="w-4 h-4" /> Concept Mastery
                </h3>
                <div className="text-slate-600 leading-relaxed text-lg">
                    {selectedTopic?.impact_emoji && (
                        <div className="text-4xl mb-4 animate-bounce">
                            {selectedTopic.impact_emoji}
                        </div>
                    )}
                    {selectedTopic?.details ? renderText(selectedTopic.details) : (
                        <p className="italic text-slate-400">
                             {language === 'hi' ? 'विस्तृत जानकारी शीघ्र उपलब्ध होगी।' : 'Detailed analysis coming soon.'}
                        </p>
                    )}
                </div>
            </section>

             {/* PRO TIP (Light Green - Viral Factor) */}
             {selectedTopic?.pro_tip && (
                <section className="animate-in slide-in-from-right-10 duration-500 delay-100">
                     <h3 className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-xs mb-3">
                        <Sparkles className="w-4 h-4" /> Pro Tip
                    </h3>
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900 shadow-sm relative overflow-hidden">
                         <div className="relative z-10 font-medium">
                            {selectedTopic.pro_tip}
                         </div>
                    </div>
                </section>
             )}

            {/* MNEMONIC (Yellowish - Viral Factor) */}
            <section className="animate-in slide-in-from-right-10 duration-500 delay-200">
                <h3 className="flex items-center gap-2 text-amber-600 font-bold uppercase tracking-wider text-xs mb-3">
                    <Lightbulb className="w-4 h-4" /> Mnemonics & Tricks
                </h3>
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200 rounded-full blur-2xl opacity-20 -mr-10 -mt-10"></div>
                     <div className="relative z-10 text-amber-900 font-medium text-lg">
                        {selectedTopic?.mnemonic ? (
                            <>
                                <span className="block text-xs uppercase text-amber-600/70 mb-2 font-bold tracking-widest">Memory Hook</span>
                                "{selectedTopic.mnemonic}"
                            </>
                        ) : (
                            <p className="italic text-amber-800/60 text-sm">
                                {language === 'hi' ? 'कोई ट्रिक उपलब्ध नहीं है।' : 'No specific mnemonic needed for this topic.'}
                            </p>
                        )}
                     </div>
                </div>
            </section>

            {/* Important Facts */}
            {selectedTopic?.important_facts && selectedTopic.important_facts.length > 0 && (
                <section>
                    <h3 className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-xs mb-3">
                        Important Facts
                    </h3>
                    <ul className="space-y-2">
                        {selectedTopic.important_facts.map((fact: string, idx: number) => (
                             <li key={idx} className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg text-sm text-slate-700">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                {fact}
                             </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Quiz Section */}
            <section className="pt-4 border-t border-slate-100">
                <Button
                    onClick={() => handleQuizClick('topic', selectedTopic?.id)}
                    className="w-full h-12 text-base font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center gap-2"
                >
                    {(unitId !== 'unit_1' || (selectedTopic?.id || 99) > 8) && !isSubscribed ? <Lock className="w-4 h-4" /> : <PlayCircle className="w-5 h-5" />}
                    {language === 'hi' ? 'इस टॉपिक का टेस्ट दें' : 'Take Topic Test'}
                </Button>
            </section>

         </div>
      </SideDrawer>

      <SyllabusLockModal open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen} />
    </div>
  );
}
