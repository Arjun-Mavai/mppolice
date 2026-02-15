'use client';

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
      setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const content = {
    en: {
      badge: 'Question 8: MP Geography',
      q: "The 'Dhuandhar Falls' is located on which river of Madhya Pradesh?",
      options: ['Chambal', 'Narmada', 'Betwa', 'Tapti'],
      explanation:
        'Dhuandhar Falls is located on the Narmada River in Bhedaghat, Jabalpur. The marble rocks here are famous worldwide.',
      action: 'View Explanation',
    },
    hi: {
      badge: 'प्रश्न 8: म.प्र. भूगोल',
      q: "'धुआँधार जलप्रपात' मध्य प्रदेश की किस नदी पर स्थित है?",
      options: ['चंबल', 'नर्मदा', 'बेतवा', 'ताप्ती'],
      explanation:
        'धुआँधार जलप्रपात जबलपुर के भेड़ाघाट में नर्मदा नदी पर स्थित है। यहाँ की संगमरमर की चट्टानें विश्व प्रसिद्ध हैं।',
      action: 'व्याख्या देखें',
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 py-24 text-white">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      <div className="pointer-events-none absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-slate-500/10 blur-[100px]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="order-2 space-y-8 lg:order-1">
            <Badge
              variant="outline"
              className="border-slate-400/30 bg-slate-500/10 px-4 py-1 text-slate-300"
            >
              <Globe size={12} className="mr-2" />
              {lang === 'en' ? 'Seamlessly Inclusive' : 'सभी के लिए समावेशी'}
            </Badge>

            <h2 className="text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
              {lang === 'en' ? (
                <>
                  Language is no <br />
                  <span className="bg-gradient-to-r from-slate-400 to-purple-400 bg-clip-text text-transparent">
                    Barrier.
                  </span>
                </>
              ) : (
                <>
                  भाषा अब कोई <br />
                  <span className="bg-gradient-to-r from-slate-400 to-purple-400 bg-clip-text text-transparent">
                    बाधा नहीं।
                  </span>
                </>
              )}
            </h2>

            <p className="max-w-xl text-lg leading-relaxed font-medium text-slate-300">
              {lang === 'en' ? (
                <>
                  Experience the <span className="font-bold text-white">First-in-Class</span>{' '}
                  seamless language toggle. Unlike simple translations, our content is{' '}
                  <span className="text-slate-300">
                    curated natively for both Hindi and English mediums
                  </span>
                  . Switch instantly without losing context or progress.
                </>
              ) : (
                <>
                  <span className="font-bold text-white">फर्स्ट-इन-क्लास</span> सीमलेस भाषा टॉगल का
                  अनुभव करें। साधारण अनुवादों के विपरीत, हमारी सामग्री{' '}
                  <span className="text-slate-300">हिंदी और अंग्रेजी दोनों माध्यमों के लिए</span>{' '}
                  मूल रूप से तैयार की गई है। संदर्भ या प्रगति खोए बिना तुरंत स्विच करें।
                </>
              )}
            </p>

            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <RefreshCcw className="mb-3 h-8 w-8 text-slate-400" />
                <h4 className="mb-1 font-bold text-white">
                  {lang === 'en' ? 'Zero Latency' : 'शून्य विलंबता'}
                </h4>
                <p className="text-sm text-slate-400">
                  {lang === 'en'
                    ? 'Instant toggle between mediums.'
                    : 'माध्यमों के बीच तुरंत टॉगल।'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <Check className="mb-3 h-8 w-8 text-emerald-400" />
                <h4 className="mb-1 font-bold text-white">
                  {lang === 'en' ? '100% Inclusive' : '100% समावेशी'}
                </h4>
                <p className="text-sm text-slate-400">
                  {lang === 'en'
                    ? 'Equal quality for both English & Hindi.'
                    : 'अंग्रेजी और हिंदी दोनों के लिए समान गुणवत्ता।'}
                </p>
              </div>
            </div>
          </div>

          <div className="perspective-1000 order-1 flex justify-center lg:order-2">
            <div className="group relative w-full max-w-md">
              {/* Glow Effect */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-slate-500 to-purple-600 opacity-50 blur-lg transition-opacity duration-1000 group-hover:opacity-75"></div>

              <Card className="relative overflow-hidden rounded-3xl border-0 bg-slate-900 shadow-2xl ring-1 ring-white/10">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 bg-slate-950/50 p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-500/20">
                      <Languages size={14} className="text-slate-400" />
                    </div>
                    <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">
                      {lang === 'en' ? 'Mode: English' : 'मोड: हिंदी'}
                    </span>
                  </div>

                  {/* Toggle Switch Visual */}
                  <div
                    className="relative flex h-8 w-24 cursor-pointer items-center rounded-full bg-slate-800 p-1"
                    onClick={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))}
                  >
                    <motion.div
                      className="absolute h-6 w-10 rounded-full bg-slate-500 shadow-lg"
                      layout
                      initial={false}
                      animate={{ left: lang === 'en' ? '4px' : 'calc(100% - 44px)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                    <span
                      className={cn(
                        'relative z-10 w-1/2 text-center text-[10px] font-bold transition-colors',
                        lang === 'en' ? 'text-white' : 'text-slate-500'
                      )}
                    >
                      EN
                    </span>
                    <span
                      className={cn(
                        'relative z-10 w-1/2 text-center text-[10px] font-bold transition-colors',
                        lang === 'hi' ? 'text-white' : 'text-slate-500'
                      )}
                    >
                      HI
                    </span>
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
                      <div className="flex items-start justify-between">
                        <Badge
                          variant="secondary"
                          className="border-0 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                        >
                          {content[lang].badge}
                        </Badge>
                      </div>

                      <h3 className="text-xl leading-snug font-bold text-white">
                        {content[lang].q}
                      </h3>

                      <div className="space-y-3">
                        {content[lang].options.map((opt, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'flex items-center justify-between rounded-xl border p-3 transition-all',
                              idx === 0 // Making the first option "Correct"
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                                : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                            )}
                          >
                            <span className="text-sm font-medium">{opt}</span>
                            {idx === 0 && <CheckCircle size={16} className="text-emerald-400" />}
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-white/10 pt-4">
                        <div className="rounded-xl border border-slate-500/20 bg-slate-500/10 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <Sparkles size={14} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-300 uppercase">
                              {lang === 'en' ? 'Smart Explanation' : 'स्मार्ट व्याख्या'}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-slate-300">
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

function CheckCircle({ size, className }: { size: number; className?: string }) {
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
