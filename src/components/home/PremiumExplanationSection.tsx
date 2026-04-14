'use client';

/**
 * PremiumExplanationSection — Step-by-step logic aur detailed analysis!
 * Ab yahan sirf static data nahi, real preparation feel hai bhai.
 */

import React from 'react';
import { CheckCircle2, Lightbulb, Brain, Target, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

export function PremiumExplanationSection() {
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  return (
    <section className="relative overflow-hidden border-t border-slate-200 bg-white py-24 md:py-32">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 h-96 w-96 bg-emerald-500/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-96 w-96 bg-amber-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <Badge
            variant="outline"
            className="mb-6 rounded-full border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-black tracking-widest text-emerald-700 uppercase"
          >
            {hi ? 'प्रीमियम कंटेंट' : 'Premium Content'}
          </Badge>
          <h2 className="mb-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
            {hi ? (
              <>
                सिर्फ जवाब नहीं, <span className="text-emerald-600">सटीक समाधान।</span>
              </>
            ) : (
              <>
                Not Just Answers, <span className="text-emerald-600">Precision Logic.</span>
              </>
            )}
          </h2>
          <p className="text-lg leading-relaxed font-medium text-slate-600 md:text-xl">
            {hi
              ? 'हर प्रश्न के पीछे की गहराई को समझें। हमने हर उत्तर के साथ स्टेप-बाय-स्टेप लॉजिक और याद रखने की ट्रिक्स जोड़ी हैं।'
              : 'Understand the depth behind every question. We provide step-by-step logic, pattern analysis, and memory tricks for every answer.'}
          </p>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Card: The Deep Dive Explanation */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 opacity-20 blur-2xl" />
            <Card className="relative z-10 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)]">
              {/* Question Header */}
              <div className="border-b border-slate-100 bg-slate-50/50 p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge className="mb-4 bg-emerald-600 text-white hover:bg-emerald-700">REASONING • Logical Path</Badge>
                    <h3 className="text-xl font-black leading-tight text-slate-900 md:text-2xl">
                      {hi
                        ? 'यदि "BOMBAY" को "CNNABX" के रूप में लिखा जाता है, तो "DELHI" को क्या लिखा जाएगा?'
                        : 'If "BOMBAY" is written as "CNNABX", what will "DELHI" be written as?'}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Answer & Steps */}
              <div className="space-y-8 p-6 md:p-10">
                {/* Correct Option Highlight */}
                <div className="flex items-center gap-4 rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-200">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      {hi ? 'सही विकल्प' : 'Correct Option'}
                    </div>
                    <div className="text-lg font-black text-slate-900 uppercase tracking-widest">EDMGI</div>
                  </div>
                </div>

                {/* Explanation Grid */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Zap className="h-4 w-4 text-emerald-500" />
                       <span className="text-xs font-black uppercase tracking-widest text-slate-400">{hi ? 'स्टेप-बाय-स्टेप समाधान' : 'Step-by-Step Logic'}</span>
                    </div>
                    
                    <div className="relative space-y-4 border-l-2 border-slate-100 pl-6">
                       <div className="relative">
                          <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-white ring-2 ring-emerald-500" />
                          <p className="text-sm font-bold text-slate-700">
                             {hi ? 'पैटर्न पहचानें: प्रत्येक अक्षर में +1 और -1 का एकांतर क्रम है।' : 'Identify Pattern: Alternating sequence of +1 and -1 for each letter.'}
                          </p>
                          <div className="mt-2 flex gap-4 text-xs font-mono font-bold text-slate-400">
                             <span>B → C (+1)</span>
                             <span>O → N (-1)</span>
                             <span>M → N (+1)</span>
                          </div>
                       </div>
                       
                       <div className="relative">
                          <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-white ring-2 ring-slate-200" />
                          <p className="text-sm font-bold text-slate-700">
                             {hi ? 'यही लॉजिक "DELHI" पर लागू करें:' : 'Apply same logic to "DELHI":'}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3">
                             <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">D+1 = E</div>
                             <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">E-1 = D</div>
                             <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">L+1 = M</div>
                             <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">H-1 = G</div>
                             <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">I+1 = J</div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Smart Insight */}
                  <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-100">
                    <div className="mb-3 flex items-center gap-2">
                       <Sparkles className="h-4 w-4 text-amber-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">{hi ? 'स्मरण सूत्र / ट्रिक' : 'Memory Tip / Trick'}</span>
                    </div>
                    <p className="text-sm font-bold italic leading-relaxed text-amber-900">
                       {hi ? '"EJOTY" का उपयोग करें अक्षरों की स्थिति तुरंत याद रखने के लिए। एग्जाम में समय बचाने का यही सबसे तेज़ तरीका है।' : 'Use "EJOTY" to quickly map letter positions. This is the fastest way to save time during the exam.'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side Description */}
          <div className="flex flex-col justify-center space-y-12 lg:pl-10">
            <div className="space-y-4">
               <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 shadow-sm">
                  <Brain className="h-7 w-7" />
               </div>
               <h3 className="text-2xl font-black text-slate-900">{hi ? 'तार्किक स्पष्टता' : 'Logical Clarity'}</h3>
               <p className="text-lg font-medium text-slate-500">
                  {hi ? 'हमने केवल उत्तर नहीं दिया है, बल्कि उस उत्तर तक पहुँचने का पूरा "रास्ता" दिखाया है। इससे आप रटते नहीं, समझते हैं।' : "We don't just give answers; we show the path to reach them. This ensures you understand the concepts instead of just memorizing."}
               </p>
            </div>

            <div className="space-y-4">
               <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
                  <Lightbulb className="h-7 w-7" />
               </div>
               <h3 className="text-2xl font-black text-slate-900">{hi ? 'एग्जामिनर की सोच' : 'Examiner\'s Trap'}</h3>
               <p className="text-lg font-medium text-slate-500">
                  {hi ? 'अक्सर एग्जामिनर ऑप्शंस में जाल बिछाते हैं। हम आपको उन "Traps" से बचने की विशेष टिप्स देते हैं।' : 'Examiners often set traps in the options. We provide specific tips to identify and avoid these common pitfalls.'}
               </p>
            </div>

            <div className="pt-4">
               <button className="group flex items-center gap-3 text-lg font-black text-emerald-600 transition-all hover:gap-5">
                  {hi ? 'सभी प्रीमियम व्याख्या देखें' : 'View All Premium Explanations'}
                  <ArrowRight className="h-5 w-5" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
