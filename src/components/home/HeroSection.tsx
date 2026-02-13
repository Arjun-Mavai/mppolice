"use client";

import { Sparkles, Zap, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function HeroSection() {
    const router = useRouter();
    const { language, user: globalUser } = useSettingsStore();

    return (
      <section className="pt-24 md:pt-48 pb-12 md:pb-32 px-4 md:px-6 relative overflow-hidden bg-slate-50 border-b border-slate-200 min-h-[80vh] md:min-h-screen flex flex-col justify-center">
          {/* 🎭 PREMIUM BACKGROUND LAYERS */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-40"></div>
          </div>
          
          <div className="max-w-6xl mx-auto text-center relative z-10 space-y-8 md:space-y-14">
              {/* Top Badge */}
              <div 
                className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 rounded-full border text-xs md:text-sm font-black shadow-xl backdrop-blur-md transition-all",
                    (globalUser as any)?.is_pro 
                        ? "bg-amber-50/80 border-amber-200 text-amber-700 shadow-amber-200/20"
                        : "bg-white/80 border-slate-200 text-slate-800 shadow-slate-200/20"
                )}
              >
                 {(globalUser as any)?.is_pro ? (
                     <>
                        <Sparkles className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 fill-amber-500 text-amber-600" />
                        {language === 'hi' ? 'प्रीमियम मेंबर' : 'Special Premium Access Active'}
                     </>
                 ) : (
                     <>
                        <Zap className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 fill-slate-800 text-slate-800" />
                        {language === 'hi' ? 'महारत हासिल करें' : 'Master the MPPSC Exam Pattern'}
                     </>
                 )}
              </div>
              
              <div className="space-y-4 md:space-y-8">
                  <h1 className="text-4xl sm:text-5xl md:text-9xl font-black font-display tracking-tight text-slate-900 leading-[1.1] md:leading-[1.1] flex flex-col justify-center drop-shadow-sm">
                      <span className="mb-1 md:mb-4">{language === 'hi' ? 'आपकी MPPSC' : 'Your MPPSC'}</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-emerald-800 to-slate-900 bg-[length:200%_auto] animate-gradient-x pb-2 md:pb-4">
                          {language === 'hi' ? 'टेस्ट सीरीज़।' : 'Test Series.'}
                      </span>
                  </h1>
                  
                  <p className="text-lg md:text-3xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2 font-medium">
                      {language === 'hi' 
                        ? '100+ टॉपिक टेस्ट, PYQs और Mnemonics — अब सफलता आपकी मुट्ठी में।' 
                        : 'Level up with 100+ topic-wise tests, expert explanations, and mnemonics that stick.'}
                  </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-6 w-full max-w-[420px] mx-auto px-4">
                  {/* GOOGLE-STYLE HERO BUTTON (ID: 74) */}
                  {!globalUser ? (
                    <Link href="/syllabus/quiz/pyq" className="relative group w-full">
                         <div
                            className="relative h-14 md:h-24 w-full rounded-full overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:shadow-[0_30px_60px_rgba(79,70,229,0.25)] transition-all duration-500 flex items-center justify-center transform group-hover:scale-[1.02] group-hover:-translate-y-0.5 group-active:scale-[0.98]"
                        >
                            {/* 🌈 PREMIUM MOVING GRADIENT (ID: 75) */}
                            <div 
                                className="absolute inset-0 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 bg-[length:200%_auto] animate-gradient-x"
                            />
                            
                            <div className="relative z-10 flex items-center justify-center gap-3 md:gap-6 w-full h-full px-6 md:px-14">
                                <div className="p-1.5 md:p-3 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-indigo-500/20 transition-colors">
                                    <Zap className="w-4 h-4 md:w-8 md:h-8 fill-indigo-400 text-indigo-400" />
                                </div>
                                
                                <span className="text-base md:text-2xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-white drop-shadow-sm truncate">
                                    {language === 'hi' ? 'फ्री प्रैक्टिस' : 'Try Free Tests'}
                                </span>
                                
                                <ChevronRight className="w-4 h-4 md:w-8 md:h-8 text-indigo-400 group-hover:translate-x-1.5 transition-transform duration-500" strokeWidth={3} />
                            </div>

                            {/* Inner Polish */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                        </div>
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="relative group w-full">
                         <div
                            className="relative h-14 md:h-24 w-full rounded-full overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:shadow-[0_30px_60px_rgba(16,185,129,0.2)] transition-all duration-500 flex items-center justify-center transform group-hover:scale-[1.02] group-hover:-translate-y-0.5 group-active:scale-[0.98]"
                        >
                            <div 
                                className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 bg-[length:200%_auto] animate-gradient-x"
                            />
                            
                            <div className="relative z-10 flex items-center justify-center gap-3 md:gap-6 w-full h-full px-6 md:px-14">
                                <div className="p-1.5 md:p-3 rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-emerald-500/20 transition-colors">
                                    <Sparkles className="w-4 h-4 md:w-8 md:h-8 fill-emerald-400 text-emerald-400" />
                                </div>
                                <span className="text-base md:text-2xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-white truncate">
                                    {language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
                                </span>
                                <ArrowLeft className="w-4 h-4 md:w-8 md:h-8 rotate-180 text-emerald-400 group-hover:translate-x-1.5 transition-transform duration-500" strokeWidth={3} />
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                        </div>
                    </Link>
                  )}
              </div>
          </div>
          
          {/* Subtle Bottom Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      </section>
    );
}
