"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function HeroSection() {
    const router = useRouter();
    const { language, setLanguage, user: globalUser } = useSettingsStore();

    return (
      <section className="pt-24 sm:pt-40 pb-12 sm:pb-20 px-5 sm:px-6 relative overflow-hidden bg-slate-50 border-b border-slate-200 min-h-[70vh] sm:min-h-[90vh] flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-100/50 rounded-full blur-3xl -mr-60 -mt-60 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-3xl -ml-40 -mb-40 opacity-60"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6 sm:space-y-10">
              {/* Badge - hidden on mobile */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "hidden sm:inline-flex items-center gap-2 px-6 py-2 rounded-full border text-sm font-bold shadow-lg min-h-[40px] justify-center",
                    (globalUser as any)?.is_pro 
                        ? "bg-amber-50 border-amber-200 text-amber-700 shadow-amber-100/50"
                        : "bg-white border-slate-100 text-slate-700 shadow-slate-100/50"
                )}
              >
                 {(globalUser as any)?.is_pro ? (
                     <>
                        <Sparkles className="w-4 h-4 fill-amber-500 text-amber-600" />
                        {language === 'hi' ? 'प्रीमियम मेंबर' : 'Premium Member Active'}
                     </>
                 ) : (
                     <>
                        <Zap className="w-4 h-4 fill-slate-700" />
                        {language === 'hi' ? 'संपूर्ण MPPSC तैयारी सूट' : 'Complete MPPSC Preparation Suite'}
                     </>
                 )}
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-6xl md:text-8xl font-extrabold font-display tracking-tight text-slate-900 leading-[1.1]"
              >
                  {language === 'hi' ? 'आपकी MPPSC' : 'Your MPPSC'} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800">
                      {language === 'hi' ? 'टेस्ट सीरीज़।' : 'Test Series.'}
                  </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
              >
                  {language === 'hi' 
                    ? '100+ टॉपिक वाइज़ टेस्ट, फुल लेंथ मॉक, PYQ पेपर, और व्याख्या — हिंदी और अंग्रेजी दोनों में।' 
                    : 'Practice with 100+ topic-wise tests, full-length mocks, PYQ papers, and instant explanations — all in Hindi & English.'}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center gap-4 sm:gap-6 pt-4 sm:pt-8"
              >
                  {/* Start Free Test — always on top, prominent */}
                  {!globalUser && (
                  <Link href="/syllabus/quiz">
                      <Button 
                          className="h-14 sm:h-16 px-10 sm:px-12 rounded-full text-lg sm:text-xl font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-2xl shadow-slate-900/30 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto ring-4 ring-slate-100"
                      >
                          {language === 'hi' ? 'फ्री टेस्ट शुरू करें' : 'Start Free Test'}
                      </Button>
                  </Link>
                  )}

                  {globalUser && (
                      <Button 
                          onClick={() => router.push('/dashboard')}
                          className="h-14 sm:h-16 px-8 sm:px-10 rounded-full text-lg font-bold bg-slate-800 text-white hover:bg-slate-700 shadow-xl shadow-slate-200 hover:scale-105 transition-all"
                      >
                         {language === 'hi' ? 'डैशबोर्ड पर जाएँ' : 'Go to Dashboard'}
                      </Button>
                  )}

                  {/* Language Toggle — below CTA, compact */}
                  <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 pr-3 rounded-full border border-slate-200 backdrop-blur-sm">
                      <div className="flex bg-white rounded-full shadow-sm p-0.5 border border-slate-100">
                        <button 
                             onClick={() => setLanguage('en')}
                             className={cn("px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-bold transition-all duration-300", language === 'en' ? "bg-slate-900 text-white shadow-md relative z-10" : "text-slate-500 hover:text-slate-900")}
                         >
                            English
                        </button>
                        <button 
                             onClick={() => setLanguage('hi')}
                             className={cn("px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-bold transition-all duration-300", language === 'hi' ? "bg-slate-800 text-white shadow-md relative z-10" : "text-slate-500 hover:text-slate-800")}
                         >
                            हिंदी
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                          <Languages className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{language === 'hi' ? 'भाषा चुनें' : 'Choose Language'}</span>
                      </span>
                  </div>
              </motion.div>
          </div>
      </section>
    );
}
