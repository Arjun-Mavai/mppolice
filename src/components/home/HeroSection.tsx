"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter } from 'next/navigation';

export function HeroSection() {
    const router = useRouter();
    const { language, setLanguage, user: globalUser } = useSettingsStore();

    return (
      <section className="pt-40 pb-20 px-6 relative overflow-hidden bg-slate-50 border-b border-slate-200 min-h-[90vh] flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-3xl -mr-60 -mt-60 opacity-60 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-3xl -ml-40 -mb-40 opacity-60"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "inline-flex items-center gap-2 px-6 py-2 rounded-full border text-sm font-bold shadow-lg min-h-[40px] justify-center",
                    (globalUser as any)?.is_pro 
                        ? "bg-amber-50 border-amber-200 text-amber-700 shadow-amber-100/50"
                        : "bg-white border-indigo-100 text-indigo-600 shadow-indigo-100/50"
                )}
              >
                 {(globalUser as any)?.is_pro ? (
                     <>
                        <Sparkles className="w-4 h-4 fill-amber-500 text-amber-600" />
                        {language === 'hi' ? 'प्रीमियम मेंबर' : 'Premium Member Active'}
                     </>
                 ) : (
                     <>
                        <Zap className="w-4 h-4 fill-indigo-600" />
                        {language === 'hi' ? 'संपूर्ण MPPSC तैयारी सूट' : 'Complete MPPSC Preparation Suite'}
                     </>
                 )}
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-extrabold font-display tracking-tight text-slate-900 leading-[1.1] min-h-[3.5ch] flex flex-col justify-center"
              >
                  {language === 'hi' ? 'सिलेबस से' : 'From Syllabus to'} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">
                      {language === 'hi' ? 'चयन तक।' : 'Selection.'}
                  </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
              >
                  {language === 'hi' ? 'MPPSC के लिए सबसे उन्नत अध्ययन मंच।' : 'The most advanced study platform built for MPPSC.'}
                  <br className="hidden md:block"/>
                  <strong>
                    {language === 'hi' ? 'प्रीमियम टेस्ट सीरीज़। स्मार्ट फ्लैशकार्ड्स। सटीक विश्लेषण।' : 'Premium Test Series. Smart Flashcards. Precise Analytics.'}
                  </strong>
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center gap-6 pt-8"
              >
                  {/* LANGUAGE TOGGLE - Centered and Intuitive */}
                  <div className="flex items-center gap-4 bg-slate-100/50 p-2 pr-4 rounded-full border border-slate-200 backdrop-blur-sm">
                      <div className="flex bg-white rounded-full shadow-sm p-1 border border-slate-100">
                        <button 
                             onClick={() => setLanguage('en')}
                             className={cn("px-4 py-2 rounded-full text-sm font-bold transition-all duration-300", language === 'en' ? "bg-slate-900 text-white shadow-md relative z-10" : "text-slate-500 hover:text-slate-900")}
                         >
                            English
                        </button>
                        <button 
                             onClick={() => setLanguage('hi')}
                             className={cn("px-4 py-2 rounded-full text-sm font-bold transition-all duration-300", language === 'hi' ? "bg-indigo-600 text-white shadow-md relative z-10" : "text-slate-500 hover:text-indigo-600")}
                         >
                            हिंदी
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 animate-pulse">
                          <Languages className="w-3.5 h-3.5" />
                          {language === 'hi' ? 'भाषा चुनें' : 'Choose Language'}
                      </span>
                  </div>

                  {!globalUser && (
                      <Button 
                          onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                          className="h-16 px-12 rounded-full text-xl font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-2xl shadow-slate-900/30 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto ring-4 ring-slate-100"
                      >
                          {language === 'hi' ? 'प्रीमियम एक्सेस प्राप्त करें' : 'Get Premium Access'}
                      </Button>
                  )}

                  {globalUser && (
                      <div className="flex gap-4">
                          <Button 
                              onClick={() => router.push('/dashboard')}
                              className="h-16 px-8 rounded-full text-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 hover:scale-105 transition-all"
                          >
                             {language === 'hi' ? 'डैशबोर्ड पर जाएँ' : 'Go to Dashboard'}
                          </Button>
                      </div>
                  )}
              </motion.div>
          </div>
      </section>
    );
}
