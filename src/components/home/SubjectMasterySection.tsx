'use client';

/**
 * RevisionCenterSection — Flashcards aur Revision History ka jalwa bhai!
 * Yeh section users ko batata hai ki kaise wo apne weak points ko revise kar sakte hain.
 */

import React from 'react';
import { History, Zap, RotateCw, CheckCircle2, Layout, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SubjectMasterySection() {
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Side: Content */}
          <div className="order-2 space-y-8 lg:order-1">
            <Badge
              variant="outline"
              className="border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-black tracking-widest text-indigo-700 uppercase"
            >
              {hi ? 'स्मार्ट रिवीजन' : 'Smart Revision'}
            </Badge>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
              {hi ? (
                <>
                  भूलना अब <span className="text-indigo-600">मुमकिन नहीं।</span>
                </>
              ) : (
                <>
                  Forgetting is <span className="text-indigo-600">Impossible.</span>
                </>
              )}
            </h2>
            <p className="text-lg leading-relaxed font-medium text-slate-600 md:text-xl">
              {hi
                ? 'सिर्फ पढ़ना काफी नहीं, याद रखना असली चुनौती है। हमारा रिवीजन सेंटर और इंटरैक्टिव फ्लैशकार्ड्स आपको हर तथ्य को लंबे समय तक याद रखने में मदद करते हैं।'
                : 'Studying is easy, remembering is the challenge. Our Revision Center and Interactive Flashcards help you retain every fact for the long run.'}
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
               <div className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                     <History className="h-5 w-5 text-indigo-500" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">{hi ? 'रिवीजन हिस्ट्री' : 'Revision History'}</h4>
                  <p className="text-sm font-medium text-slate-500">
                     {hi ? 'आपने क्या पढ़ा, कब पढ़ा और क्या भूल रहे हैं - सब एक जगह।' : 'Track what you studied, when you studied, and what you might be forgetting.'}
                  </p>
               </div>
               <div className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                     <RotateCw className="h-5 w-5 text-emerald-500" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">{hi ? 'एक्टिव रिकॉल' : 'Active Recall'}</h4>
                  <p className="text-sm font-medium text-slate-500">
                     {hi ? 'फ्लैशकार्ड्स के साथ दिमाग पर जोर दें और याददाश्त तेज करें।' : 'Challenge your brain with flashcards to build rock-solid memory.'}
                  </p>
               </div>
            </div>
          </div>

          {/* Right Side: Interactive UI Preview */}
          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative w-full max-w-lg">
              <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10 blur-2xl animate-pulse" />
              
              <Card className="relative z-10 space-y-6 overflow-hidden rounded-[2.5rem] border-0 bg-white p-6 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)]">
                {/* Mock Dashboard Header */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs">MP</div>
                      <div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{hi ? 'डैशबोर्ड' : 'Dashboard'}</div>
                         <div className="text-sm font-black text-slate-900">{hi ? 'प्रगति रिपोर्ट' : 'Progress Report'}</div>
                      </div>
                   </div>
                   <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                </div>

                {/* Revision Card Preview */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">{hi ? 'हालिया रिवीजन' : 'Recent Revisions'}</span>
                      <span className="text-[10px] font-bold text-indigo-600">{hi ? 'सभी देखें' : 'View All'}</span>
                   </div>
                   
                   {[
                     { title: hi ? 'सिंधु घाटी सभ्यता' : 'Indus Valley Civilization', date: '2 min ago', color: 'bg-emerald-50 text-emerald-700' },
                     { title: hi ? 'म.प्र. की नदियां' : 'Rivers of MP', date: '1 hour ago', color: 'bg-blue-50 text-blue-700' },
                     { title: hi ? 'कोडिंग-डिकोडिंग' : 'Coding-Decoding', date: 'Yesterday', color: 'bg-purple-50 text-purple-700' }
                   ].map((item, i) => (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, x: 20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.1 }}
                       className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100"
                     >
                        <div className="flex items-center gap-3">
                           <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-black", item.color)}>
                              <CheckCircle2 className="h-4 w-4" />
                           </div>
                           <span className="text-sm font-bold text-slate-700">{item.title}</span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">{item.date}</span>
                     </motion.div>
                   ))}
                </div>

                {/* Floating Flashcard Demo Overlay */}
                <div className="absolute bottom-4 right-4 left-4">
                   <Card className="flex items-center justify-between bg-slate-900 p-4 text-white shadow-2xl rounded-2xl border-slate-800">
                      <div className="flex items-center gap-3">
                         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                            <RotateCw className="h-5 w-5 text-emerald-400" />
                         </div>
                         <div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{hi ? 'फ्लैशकार्ड' : 'Flashcard'}</div>
                            <div className="text-xs font-bold">{hi ? 'अगले कार्ड के लिए स्वाइप करें' : 'Swipe for next card'}</div>
                         </div>
                      </div>
                      <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                   </Card>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
