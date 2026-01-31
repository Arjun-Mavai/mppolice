"use client"

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { syllabusData, Topic, UnitData } from "@/data/syllabusData";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Menu, 
  BookOpen, 
  Sparkles,
  Quote,
  User,
  LogOut,
  Lock,
  ArrowRight,
  BarChart3,
  RotateCw,
  Lightbulb,
  Target,
  Zap,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/useSettingsStore";
import { SyllabusSearch } from "@/components/SyllabusSearch";
import { ViewToggle } from "@/components/ViewToggle";
import { SyllabusLockModal } from "@/components/SyllabusLockModal";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function UnitFlipCard({ unit, unitKey, index, language, onClick, themeClass, iconColor }: any) {
    const [isFlipped, setIsFlipped] = useState(false);
    const router = useRouter();
    
    // Only for Unit 1
    if (unitKey !== 'unit_1') return null;

    const handleFlip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    const handleTestClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push('/syllabus/quiz?mode=topic&unit=1');
    };

    return (
        <div 
            className="group h-[340px] w-full bg-transparent cursor-pointer [perspective:1000px] relative select-none"
            onClick={handleFlip}
        >
            <motion.div 
                className="relative h-full w-full shadow-xl transition-all duration-700 [transform-style:preserve-3d] group-hover:shadow-indigo-500/10 rounded-3xl"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front */}
                <Card className={cn(
                    "absolute inset-0 h-full w-full bg-white/80 backdrop-blur-md rounded-3xl border border-white/40 flex flex-col overflow-hidden [backface-visibility:hidden]",
                    themeClass
                )}>
                    <CardContent className="p-0 h-full flex flex-col relative">
                        <div className="absolute top-6 right-6 font-display font-bold text-5xl text-slate-900/10 select-none z-0">
                            {index + 1}
                        </div>
                        
                        <div className="p-8 flex-1 flex flex-col z-10">
                            <div className={cn("w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6", iconColor)}>
                                <BookOpen size={28} strokeWidth={2} />
                            </div>

                            <div className="space-y-3 mb-auto">
                                <h3 className="font-bold text-2xl leading-tight text-slate-900 line-clamp-2">
                                    {language === 'en' && unit.title_en ? unit.title_en : (unit.unit_title || unit.title)}
                                </h3>
                                <div className="flex items-center text-sm font-medium text-slate-500">
                                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                    {(language === 'en' && unit.topics_en ? unit.topics_en : unit.topics).length} {language === 'hi' ? 'विषय' : 'Topics'}
                                </div>
                            </div>

                            <div className="pt-6 mt-4 border-t border-slate-200/50 flex justify-between items-center">
                                <span className="bg-slate-100/80 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                                    <RotateCw size={12} /> {language === 'hi' ? 'पलटें' : 'Tap to Flip'}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600">
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Back */}
                <Card className="absolute inset-0 h-full w-full bg-slate-900 rounded-3xl border border-slate-800 text-white [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden shadow-2xl">
                     {/* Texture */}
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                     <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

                     <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
                         <div>
                             <div className="flex justify-between items-center mb-4">
                                 <div className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest border border-indigo-400/30 px-2 py-0.5 rounded">
                                     {language === 'hi' ? 'विषय विश्लेषण' : 'TOPIC ANALYSIS'}
                                 </div>
                                 <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                     <Target size={12} className="text-white" />
                                 </div>
                             </div>
                             
                             <h4 className="text-xl font-bold text-white mb-4 leading-tight">
                                 {language === 'hi' ? 'राजवंश और राजधानियाँ' : 'Dynasties & Capitals'}
                             </h4>

                             <ul className="space-y-2.5">
                                 <li className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></div>
                                     <span className="text-sm font-medium text-slate-200">
                                         Holkar: <span className="text-white font-bold ml-1">{language === 'hi' ? 'इंदौर' : 'Indore'}</span>
                                     </span>
                                 </li>
                                 <li className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></div>
                                     <span className="text-sm font-medium text-slate-200">
                                         Scindia: <span className="text-white font-bold ml-1">{language === 'hi' ? 'ग्वालियर' : 'Gwalior'}</span>
                                     </span>
                                 </li>
                             </ul>
                         </div>

                         <div className="space-y-3">
                            <div className="p-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl">
                                <div className="text-[10px] text-amber-300 font-bold uppercase mb-1 flex items-center gap-1">
                                    <Lightbulb size={10} /> {language === 'hi' ? 'स्मरण सूत्र' : 'Mnemonic'}
                                </div>
                                <div className="text-xs font-semibold text-amber-100 italic">
                                    "Holkar In Doors" (Indore)
                                </div>
                            </div>

                            <Button 
                                onClick={handleTestClick}
                                className="w-full h-9 bg-white text-slate-900 hover:bg-indigo-50 font-bold text-xs rounded-lg shadow-lg flex items-center justify-center gap-2"
                            > 
                                {language === 'hi' ? 'टॉपिक टेस्ट लें' : 'Take Topic Test'} <Zap size={12} className="fill-slate-900" />
                            </Button>
                         </div>
                     </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

function SyllabusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMounted, setIsMounted] = useState(false);
  const { user, isSubscribed, setUser, language, setLanguage } = useSettingsStore();

  // Hydration fix for Persist middleware
  useEffect(() => {
    setIsMounted(true);
    // Optional: Sync from URL if present, otherwise store prevails
    const urlLang = searchParams.get('lang');
    if (urlLang === 'en' || urlLang === 'hi') {
        if (urlLang !== language) setLanguage(urlLang);
    }
  }, []);

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/mppsc-check');
            const data = await res.json();
            if (data.authenticated) {
                // Assuming the API returns is_subscribed in the user object or separately
                // I need to update the mppsc-check API to return is_subscribed if it doesn't already
                setUser(data.user, data.user.is_subscribed || false);
            } else {
                setUser(null, false);
            }
        } catch (e) {
            console.error("Auth check failed", e);
        }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
      await fetch('/api/auth/mppsc-logout', { method: 'POST' });
      setUser(null, false);
      router.refresh();
  };

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
      
      {/* --- Sticky Navigation with Glassmorphism --- */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            
            {/* Left: Brand & Search Trigger */}
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden text-slate-600"
                    onClick={() => setOpen(true)}
                >
                    <Menu className="w-5 h-5" />
                </Button>
                
                <Link href="/app" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                         <Quote size={18} fill="currentColor" className="text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900 hidden md:block">
                        Mindful
                    </span>
                </Link>

                {/* Desktop Search Button */}
                <Button 
                    variant="outline" 
                    onClick={() => setOpen(true)}
                    className="ml-4 h-9 w-64 justify-between bg-slate-50/50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white transition-all hidden md:flex shadow-sm"
                >
                    <span className="text-xs font-medium flex items-center gap-2">
                         <Search className="w-3.5 h-3.5" /> 
                         {language === 'hi' ? 'विषय खोजें...' : 'Search topics...'}
                    </span>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>
                
                {/* Analytics Quick Link */}
                <Link href="/syllabus/analytics">
                    <Button variant="ghost" size="icon" className="ml-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50" title="Analytics">
                         <BarChart3 className="w-5 h-5" />
                    </Button>
                </Link>
            </div>


            {/* Right: Actions */}
            <div className="flex items-center gap-3">
               {user ? (
                   <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleLogout}
                        className="font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden md:inline">Logout</span>
                   </Button>
               ) : (
                <Link href="/login">
                    <Button variant="ghost" size="sm" className="hidden md:flex font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100">
                        Sign In
                    </Button>
                    <Button variant="ghost" size="icon" className="md:hidden text-slate-600 hover:text-indigo-600">
                        <User className="w-5 h-5" />
                    </Button>
                </Link>
               )}

               <Tabs defaultValue={language} onValueChange={(val) => setLanguage(val as 'en' | 'hi')} className="w-[140px] md:w-[180px]">
                  <TabsList className="grid w-full grid-cols-2 h-9 bg-slate-100/80 p-1">
                    <TabsTrigger 
                        value="hi" 
                        className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
                    >
                        हिंदी
                    </TabsTrigger>
                    <TabsTrigger 
                        value="en" 
                        className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
                    >
                        ENGLISH
                    </TabsTrigger>
                  </TabsList>
               </Tabs>
            </div>
        </div>
      </nav>

      {/* --- Global Command Palette (Search) --- */}
      <SyllabusSearch open={open} setOpen={setOpen} />


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
                    {language === 'hi' ? 'आपकी उंगलियों पर।' : 'Mastered.'}
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-slate-600">
                 {syllabusData.subject}
              </p>

              <div className="pt-4 flex justify-center gap-6 items-center flex-col sm:flex-row">
                  <Link href="/syllabus/quiz">
                      <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all group">
                         <Sparkles className="w-5 h-5 mr-2 text-yellow-400 group-hover:rotate-12 transition-transform" />
                         {language === 'hi' ? 'क्विज़ खेलें' : 'Start Practice Quiz'}
                      </Button>
                  </Link>

                  <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
              </div>
          </motion.div>


          {/* Units Grid/List */}
          {viewMode === 'grid' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {Object.entries(syllabusData.units).map(([key, unit], index) => {
                    const title = language === 'en' && unit.title_en ? unit.title_en : (unit.unit_title || unit.title);
                    const topicsCount = (language === 'en' && unit.topics_en ? unit.topics_en : unit.topics).length;
                    
                    // Gradients for cards
                    const gradients = [
                      "from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border-blue-200/50",
                      "from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-200/50",
                      "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border-emerald-200/50",
                      "from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border-amber-200/50",
                      "from-rose-500/10 to-red-500/10 hover:from-rose-500/20 hover:to-red-500/20 border-rose-200/50",
                    ];
                    const themeClass = gradients[index % gradients.length];
                    const iconColor = ["text-blue-600", "text-purple-600", "text-emerald-600", "text-amber-600", "text-rose-600"][index % 5];
                    const isLocked = key !== "unit_1" && !isSubscribed;

                    // SPECIAL FLIP CARD RENDER FOR UNIT 1
                    if (key === 'unit_1') {
                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <UnitFlipCard 
                                    unit={unit} 
                                    unitKey={key} 
                                    index={index} 
                                    language={language} 
                                    themeClass={themeClass} 
                                    iconColor={iconColor}
                                    onClick={() => router.push(`/syllabus/${key}?lang=${language}`)} 
                                />
                            </motion.div>
                        )
                    }

                    return (
                       <motion.div
                          key={key}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
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
                              className="cursor-pointer h-full relative group min-h-[320px]"
                          >
                             <Card className={cn(
                                 "h-full overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 bg-white/50 backdrop-blur-sm border",
                                 themeClass,
                                 isLocked && "grayscale-[0.3]"
                             )}>
                                <CardContent className="p-0">
                                    {isLocked && (
                                        <div className="absolute inset-0 bg-slate-50/20 backdrop-blur-[2px] z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="relative overflow-hidden rounded-full p-[1px]">
                                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                                <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white backdrop-blur-3xl gap-2 relative z-10">
                                                    <Lock className="w-3.5 h-3.5 text-indigo-300" />
                                                    <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                                                        {language === 'hi' ? 'प्रीमियम' : 'PREMIUM'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-6 relative">
                                       {/* Unit Number Badge */}
                                       <div className="absolute top-6 right-6 font-display font-bold text-4xl text-slate-900/20 select-none z-0">
                                           {index + 1}
                                       </div>

                                       <div className="relative z-10 space-y-4">
                                           {/* Icon Placeholder or Badge */}
                                           <div className={cn("inline-flex p-3 rounded-2xl bg-white shadow-sm border border-slate-100 relative", iconColor)}>
                                               {isLocked ? <Lock size={24} strokeWidth={2} /> : <BookOpen size={24} strokeWidth={2} />}
                                                {!isLocked && (
                                                   <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                       FREE
                                                   </div>
                                                )}
                                           </div>

                                           <div className="space-y-2">
                                               <h3 className="font-bold text-xl leading-tight text-slate-900 line-clamp-2 min-h-[3.5rem]">
                                                   {title}
                                               </h3>
                                               <div className="flex items-center text-sm font-medium text-slate-500">
                                                   <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                                   {topicsCount} {language === 'hi' ? 'विषय' : 'Topics'}
                                               </div>
                                           </div>
                                       </div>
                                    </div>

                                    {/* Footer Action */}
                                    <div className="px-6 py-4 border-t border-slate-100/50 bg-white/50 flex items-center justify-between group/footer absolute bottom-0 w-full">
                                        <span className={cn(
                                            "text-xs font-bold uppercase tracking-wider transition-colors",
                                            isLocked ? "text-slate-400" : "text-slate-400 group-hover/footer:text-indigo-600"
                                        )}>
                                           {isLocked 
                                             ? (language === 'hi' ? 'अनलॉक करें' : 'Locked') 
                                             : (language === 'hi' ? 'खोजें' : 'Explore')
                                           }
                                        </span>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                            isLocked ? "bg-slate-100 text-slate-400" : "bg-slate-100 group-hover/footer:bg-indigo-600 group-hover/footer:text-white"
                                        )}>
                                            {isLocked ? <Lock size={14} /> : <ArrowRight size={14} />}
                                        </div>
                                    </div>
                                </CardContent>
                             </Card>
                          </div>
                       </motion.div>
                    );
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
                                 isLocked && "grayscale-[0.5]"
                             )}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className={cn(
                                    "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-xl z-10 transition-colors",
                                    isLocked ? "bg-slate-100 text-slate-400" : "bg-slate-100 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50"
                                )}>
                                    {isLocked ? <Lock size={20} /> : (index + 1)}
                                </div>
                                
                                <div className="flex-1 min-w-0 z-10">
                                    <div className="flex items-center gap-2">
                                        <h3 className={cn("font-bold text-lg transition-colors truncate", isLocked ? "text-slate-500" : "text-slate-900 group-hover:text-indigo-700")}>
                                            {title}
                                        </h3>
                                        {!isLocked && (
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">FREE</span>
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
                                    {isLocked ? <Lock className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
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

export default function SyllabusPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
            <SyllabusContent />
        </Suspense>
    )
}
