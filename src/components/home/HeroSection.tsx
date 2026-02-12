"use client";

import { motion } from 'framer-motion';
import { Sparkles, Zap, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function HeroSection() {
    const router = useRouter();
    const { language, user: globalUser } = useSettingsStore();

    return (
      <section className="pt-24 md:pt-48 pb-16 md:pb-32 px-6 relative overflow-hidden bg-slate-50 border-b border-slate-200 min-h-[85vh] md:min-h-screen flex flex-col justify-center">
          {/* 🎭 PREMIUM BACKGROUND LAYERS */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {/* Dynamic Mesh Gradients */}
              <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, -30, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-indigo-100/40 rounded-full blur-[120px] opacity-60"
              />
              <motion.div 
                animate={{ 
                    scale: [1, 1.3, 1],
                    x: [0, -40, 0],
                    y: [0, 60, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-100/30 rounded-full blur-[100px] opacity-50"
              />
              
              {/* Floating Glassmorphism Elements */}
              <motion.div 
                className="hidden lg:block absolute top-1/4 right-1/4 w-32 h-32 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl rotate-12 z-0"
                animate={{ y: [0, -20, 0], rotate: [12, 15, 12] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="hidden lg:block absolute bottom-1/3 left-20 w-24 h-24 bg-indigo-50/50 backdrop-blur-sm rounded-full border border-white/30 shadow-lg -rotate-12 z-0"
                animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-40"></div>
          </div>
          
          <div className="max-w-6xl mx-auto text-center relative z-10 space-y-10 md:space-y-14">
              {/* Top Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "hidden md:inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border text-sm font-black shadow-xl backdrop-blur-md transition-all",
                    (globalUser as any)?.is_pro 
                        ? "bg-amber-50/80 border-amber-200 text-amber-700 shadow-amber-200/20"
                        : "bg-white/80 border-slate-200 text-slate-800 shadow-slate-200/20"
                )}
              >
                 {(globalUser as any)?.is_pro ? (
                     <>
                        <Sparkles className="w-4.5 h-4.5 fill-amber-500 text-amber-600" />
                        {language === 'hi' ? 'प्रीमियम मेंबर' : 'Special Premium Access Active'}
                     </>
                 ) : (
                     <>
                        <Zap className="w-4.5 h-4.5 fill-slate-800 text-slate-800" />
                        {language === 'hi' ? 'महारत हासिल करें' : 'Master the MPPSC Exam Pattern'}
                     </>
                 )}
              </motion.div>
              
              <div className="space-y-6 md:space-y-8">
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-6xl md:text-9xl font-black font-display tracking-tight text-slate-900 leading-[0.95] md:leading-[1.1] flex flex-col justify-center drop-shadow-sm"
                  >
                      <span className="mb-2 md:mb-4">{language === 'hi' ? 'आपकी MPPSC' : 'Your MPPSC'}</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-emerald-800 to-slate-900 bg-[length:200%_auto] animate-gradient-x pb-4">
                          {language === 'hi' ? 'टेस्ट सीरीज़।' : 'Test Series.'}
                      </span>
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-xl md:text-3xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2 font-medium"
                  >
                      {language === 'hi' 
                        ? '100+ टॉपिक टेस्ट, PYQs और Mnemonics — अब सफलता आपकी मुट्ठी में।' 
                        : 'Level up with 100+ topic-wise tests, expert explanations, and mnemonics that stick.'}
                  </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                className="flex flex-col items-center justify-center gap-6 w-full max-w-[420px] mx-auto px-4"
              >
                  {/* GOOGLE-STYLE HERO BUTTON (ID: 74) */}
                  {!globalUser ? (
                    <Link href="/syllabus/quiz/pyq" className="relative group w-full">
                         <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative h-16 md:h-24 w-full rounded-full overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:shadow-[0_30px_60px_rgba(79,70,229,0.25)] transition-all duration-500 flex items-center justify-center"
                        >
                            {/* 🌈 PREMIUM MOVING GRADIENT (ID: 75) */}
                            <motion.div 
                                className="absolute inset-0 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 bg-[length:200%_auto]"
                                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            />
                            
                            <div className="relative z-10 flex items-center justify-center gap-3 md:gap-6 w-full h-full px-6 md:px-14">
                                <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-indigo-500/20 transition-colors">
                                    <Zap className="w-5 h-5 md:w-8 md:h-8 fill-indigo-400 text-indigo-400" />
                                </div>
                                
                                <span className="text-lg md:text-2xl font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-white drop-shadow-sm truncate">
                                    {language === 'hi' ? 'फ्री प्रैक्टिस' : 'Try Free Tests'}
                                </span>
                                
                                <ChevronRight className="w-5 h-5 md:w-8 md:h-8 text-indigo-400 group-hover:translate-x-1.5 transition-transform duration-500" strokeWidth={3} />
                            </div>

                            {/* Inner Polish */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                        </motion.div>
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="relative group w-full">
                         <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative h-16 md:h-24 w-full rounded-full overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:shadow-[0_30px_60px_rgba(16,185,129,0.2)] transition-all duration-500 flex items-center justify-center"
                        >
                            <motion.div 
                                className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 bg-[length:200%_auto]"
                                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            />
                            
                            <div className="relative z-10 flex items-center justify-center gap-3 md:gap-6 w-full h-full px-6 md:px-14">
                                <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-emerald-500/20 transition-colors">
                                    <Sparkles className="w-5 h-5 md:w-8 md:h-8 fill-emerald-400 text-emerald-400" />
                                </div>
                                <span className="text-lg md:text-2xl font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-white truncate">
                                    {language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
                                </span>
                                <ArrowLeft className="w-5 h-5 md:w-8 md:h-8 rotate-180 text-emerald-400 group-hover:translate-x-1.5 transition-transform duration-500" strokeWidth={3} />
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                        </motion.div>
                    </Link>
                  )}
              </motion.div>
          </div>
          
          {/* Subtle Bottom Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      </section>
    );
}
