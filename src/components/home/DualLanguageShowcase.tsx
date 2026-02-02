"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, ArrowRightLeft, Check, Sparkles, Globe, RefreshCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function DualLanguageShowcase() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Auto-switch language every 4 seconds to demonstrate
  useEffect(() => {
    const timer = setInterval(() => {
      setLang(prev => prev === 'en' ? 'hi' : 'en');
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const content = {
    en: {
        badge: "Question 8: MP Geography",
        q: "The 'Dhuandhar Falls' is located on which river of Madhya Pradesh?",
        options: [
            "Chambal",
            "Narmada", 
            "Betwa",
            "Tapti"
        ],
        explanation: "Dhuandhar Falls is located on the Narmada River in Bhedaghat, Jabalpur. The marble rocks here are famous worldwide.",
        action: "View Explanation"
    },
    hi: {
        badge: "प्रश्न 8: म.प्र. भूगोल",
        q: "'धुआँधार जलप्रपात' मध्य प्रदेश की किस नदी पर स्थित है?",
        options: [
            "चंबल",
            "नर्मदा",
            "बेतवा",
            "ताप्ती"
        ],
        explanation: "धुआँधार जलप्रपात जबलपुर के भेड़ाघाट में नर्मदा नदी पर स्थित है। यहाँ की संगमरमर की चट्टानें विश्व प्रसिद्ध हैं।",
        action: "व्याख्या देखें"
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white overflow-hidden relative">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1 space-y-8">
                <Badge variant="outline" className="px-4 py-1 border-indigo-400/30 bg-indigo-500/10 text-indigo-300">
                    <Globe size={12} className="mr-2" /> 
                    {lang === 'en' ? 'Seamlessly Inclusive' : 'सभी के लिए समावेशी'}
                </Badge>
                
                <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                    {lang === 'en' ? (
                        <>
                            Language is no <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Barrier.</span>
                        </>
                    ) : (
                        <>
                            भाषा अब कोई <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">बाधा नहीं।</span>
                        </>
                    )}
                </h2>
                
                <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
                    {lang === 'en' ? (
                        <>
                            Experience the <span className="text-white font-bold">First-in-Class</span> seamless language toggle. 
                            Unlike simple translations, our content is <span className="text-indigo-300">curated natively for both Hindi and English mediums</span>. 
                            Switch instantly without losing context or progress.
                        </>
                    ) : (
                        <>
                            <span className="text-white font-bold">फर्स्ट-इन-क्लास</span> सीमलेस भाषा टॉगल का अनुभव करें।
                            साधारण अनुवादों के विपरीत, हमारी सामग्री <span className="text-indigo-300">हिंदी और अंग्रेजी दोनों माध्यमों के लिए</span> मूल रूप से तैयार की गई है।
                            संदर्भ या प्रगति खोए बिना तुरंत स्विच करें।
                        </>
                    )}
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <RefreshCcw className="w-8 h-8 text-indigo-400 mb-3" />
                        <h4 className="font-bold text-white mb-1">{lang === 'en' ? 'Zero Latency' : 'शून्य विलंबता'}</h4>
                        <p className="text-sm text-slate-400">{lang === 'en' ? 'Instant toggle between mediums.' : 'माध्यमों के बीच तुरंत टॉगल।'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <Check className="w-8 h-8 text-emerald-400 mb-3" />
                        <h4 className="font-bold text-white mb-1">{lang === 'en' ? '100% Inclusive' : '100% समावेशी'}</h4>
                        <p className="text-sm text-slate-400">{lang === 'en' ? 'Equal quality for both English & Hindi.' : 'अंग्रेजी और हिंदी दोनों के लिए समान गुणवत्ता।'}</p>
                    </div>
                </div>
            </div>

            <div className="order-1 lg:order-2 flex justify-center perspective-1000">
                <div className="relative w-full max-w-md group">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-50 blur-lg group-hover:opacity-75 transition-opacity duration-1000"></div>

                    <Card className="relative bg-slate-900 border-0 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/10">
                        {/* Header */}
                        <div className="bg-slate-950/50 p-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                    <Languages size={14} className="text-indigo-400" />
                                </div>
                                <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                                    {lang === 'en' ? 'Mode: English' : 'मोड: हिंदी'}
                                </span>
                            </div>
                            
                            {/* Toggle Switch Visual */}
                            <div className="flex bg-slate-800 rounded-full p-1 relative w-24 h-8 items-center cursor-pointer" onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}>
                                <motion.div 
                                    className="absolute h-6 w-10 bg-indigo-500 rounded-full shadow-lg"
                                    layout
                                    initial={false}
                                    animate={{ left: lang === 'en' ? '4px' : 'calc(100% - 44px)' }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                                <span className={cn("relative z-10 w-1/2 text-center text-[10px] font-bold transition-colors", lang === 'en' ? "text-white" : "text-slate-500")}>EN</span>
                                <span className={cn("relative z-10 w-1/2 text-center text-[10px] font-bold transition-colors", lang === 'hi' ? "text-white" : "text-slate-500")}>HI</span>
                            </div>
                        </div>

                        <div className="p-8">
                             <AnimatePresence mode="wait">
                                <motion.div
                                    key={lang}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-0">
                                            {content[lang].badge}
                                        </Badge>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-white leading-snug">
                                        {content[lang].q}
                                    </h3>

                                    <div className="space-y-3">
                                        {content[lang].options.map((opt, idx) => (
                                            <div 
                                                key={idx}
                                                className={cn(
                                                    "p-3 rounded-xl border transition-all flex items-center justify-between",
                                                    idx === 0 // Making the first option "Correct"
                                                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-200"
                                                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                                )}
                                            >
                                                <span className="text-sm font-medium">{opt}</span>
                                                {idx === 0 && <CheckCircle size={16} className="text-emerald-400" />}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                         <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                             <div className="flex items-center gap-2 mb-2">
                                                 <Sparkles size={14} className="text-indigo-400" />
                                                 <span className="text-xs font-bold text-indigo-300 uppercase">
                                                     {lang === 'en' ? 'Smart Explanation' : 'स्मार्ट व्याख्या'}
                                                 </span>
                                             </div>
                                             <p className="text-xs text-slate-300 leading-relaxed">
                                                 {content[lang].explanation}
                                             </p>
                                         </div>
                                    </div>
                                </motion.div>
                             </AnimatePresence>
                        </div>
                    </Card>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
}

function CheckCircle({ size, className }: { size: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    );
}
