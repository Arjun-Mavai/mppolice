'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Smartphone, Share, PlusSquare, ArrowRight, Download, Check, Sparkles, Zap, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useSettingsStore } from '@/store/useSettingsStore';
import Image from 'next/image';

export function AppInstallGuide() {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  const content = {
    en: {
      title: (
        <>
          Get the <span className="text-emerald-500">MP Police App</span>
        </>
      ),
      subtitle:
        'Fastest way to access 1000+ One-Liners, Mock Tests, and Flashcards on your home screen.',
      iosTab: 'iPhone',
      androidTab: 'Android',
      ios: [
        { text: 'Open Safari Browser', subtext: 'This feature works best in Safari on iOS.' },
        {
          text: 'Tap the Share Button',
          subtext: 'Look for the square icon with an arrow at the bottom.',
        },
        { text: "Select 'Add to Home Screen'", subtext: 'Scroll down until you see this option.' },
      ],
      android: [
        { text: 'Open Chrome Browser', subtext: 'Works best on Google Chrome.' },
        {
          text: "Tap 'Install App' Prompt",
          subtext: 'It usually appears at the bottom of the screen automatically.',
        },
        {
          text: 'Or use the Browser Menu',
          subtext: "Tap the 3 dots (⋮) top right > 'Install App'.",
        },
      ],
    },
    hi: {
      title: (
        <>
          MP Police App <span className="text-emerald-500">इंस्टॉल करें</span>
        </>
      ),
      subtitle: '1000+ वन-लाइनर्स, मॉक टेस्ट और फ्लैशकार्ड्स तक तुरंत पहुँचने का सबसे तेज़ तरीका।',
      iosTab: 'iPhone',
      androidTab: 'Android',
      ios: [
        { text: 'Safari ब्राउज़र खोलें', subtext: 'यह फीचर Safari में सबसे अच्छा चलता है।' },
        {
          text: 'Share बटन दबाएँ',
          subtext: 'नीचे दिए गए शेयर आइकन (तीर वाला बॉक्स) पर क्लिक करें।',
        },
        {
          text: "'Add to Home Screen' चुनें",
          subtext: 'लिस्ट में नीचे स्क्रॉल करके यह ऑप्शन चुनें।',
        },
      ],
      android: [
        { text: 'Chrome ब्राउज़र खोलें', subtext: 'यह Google Chrome पर सबसे अच्छा चलता है।' },
        { text: "'Install App' पर क्लिक करें", subtext: 'यह स्क्रीन के नीचे अपने आप दिखाई देगा।' },
        {
          text: 'या मेनू का उपयोग करें',
          subtext: "ऊपर राइट में 3 डॉट्स (⋮) दबाएँ और 'Install App' चुनें।",
        },
      ],
    },
  };

  const t = language === 'hi' ? content.hi : content.en;

  return (
    <section id="install-guide" className="overflow-hidden bg-[#020617] px-6 py-24 relative border-t border-white/5">
       {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="mb-20 space-y-6 text-center">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="mx-auto w-24 h-24 mb-8 relative"
          >
             <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
             <Image 
                src="/mp-police-logo.png" 
                alt="MP Police Logo" 
                width={96} 
                height={96} 
                className="relative z-10 drop-shadow-2xl"
             />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl font-black text-white md:text-6xl tracking-tight"
          >
            {t.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-slate-400 font-bold leading-relaxed"
          >
            {t.subtitle}
          </motion.p>
        </div>

        <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-24">
          {/* Left: Controls & Instructions */}
          <div className="order-2 w-full max-w-lg flex-1 lg:order-1">
            {/* Tab Switcher */}
            <div className="mx-auto mb-12 flex w-fit rounded-3xl border border-white/5 bg-white/5 p-2 backdrop-blur-xl lg:mx-0 shadow-2xl">
              <button
                onClick={() => setActiveTab('ios')}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-10 py-4 text-sm font-black uppercase tracking-widest transition-all duration-500',
                  activeTab === 'ios'
                    ? 'bg-white text-slate-900 shadow-xl'
                    : 'text-slate-500 hover:text-white'
                )}
              >
                <Apple size={18} />
                {t.iosTab}
              </button>
              <button
                onClick={() => setActiveTab('android')}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-10 py-4 text-sm font-black uppercase tracking-widest transition-all duration-500',
                  activeTab === 'android'
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20'
                    : 'text-slate-500 hover:text-white'
                )}
              >
                <Smartphone size={18} />
                {t.androidTab}
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-5"
                >
                  {(activeTab === 'ios' ? t.ios : t.android).map((step, idx) => (
                    <InstructionStep
                      key={idx}
                      number={idx + 1}
                      text={step.text}
                      subtext={step.subtext}
                      icon={idx === 0 ? (activeTab === 'ios' ? <Apple size={20} /> : <Smartphone size={20} />) : idx === 1 ? (activeTab === 'ios' ? <Share size={20} /> : <Download size={20} />) : (activeTab === 'ios' ? <PlusSquare size={20} /> : <ArrowRight size={20} />)}
                      variant={activeTab === 'ios' ? 'white' : 'emerald'}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div className="order-1 flex w-full flex-1 justify-center lg:order-2 lg:justify-start">
             <div className="relative h-[680px] w-[330px] rounded-[4rem] border-[12px] border-slate-900 bg-[#020617] p-4 shadow-[0_60px_120px_-20px_rgba(0,0,0,1)] ring-1 ring-white/10">
                {/* Dynamic Island / Notch */}
                <div className="absolute top-8 left-1/2 z-50 h-[30px] w-[110px] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" />

                {/* Content */}
                <div className="relative h-full w-full overflow-hidden rounded-[3rem] bg-[#020617]">
                   <div className="flex h-16 items-center justify-between px-6 pt-4">
                      <Image src="/mp-police-logo.png" alt="Logo" width={32} height={32} />
                      <div className="flex gap-2">
                         <div className="h-2 w-2 rounded-full bg-emerald-500" />
                         <div className="h-2 w-2 rounded-full bg-blue-500" />
                      </div>
                   </div>

                   <div className="p-6 space-y-6">
                      <div className="space-y-2">
                         <div className="h-2 w-24 rounded-full bg-white/10" />
                         <div className="h-6 w-48 rounded-full bg-white/5" />
                      </div>
                      
                      {/* Mock Revision Cards */}
                      <div className="grid grid-cols-2 gap-3">
                         {[1,2,3,4].map(i => (
                            <div key={i} className="h-28 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center gap-2">
                               <RotateCw className="h-6 w-6 text-emerald-500/40" />
                               <div className="h-2 w-12 rounded-full bg-white/5" />
                            </div>
                         ))}
                      </div>

                      <div className="h-32 rounded-3xl bg-gradient-to-br from-emerald-600/20 to-transparent border border-emerald-500/10 p-4 flex flex-col justify-end">
                         <div className="h-2 w-32 rounded-full bg-white/20 mb-2" />
                         <div className="h-4 w-48 rounded-full bg-white/10" />
                      </div>
                   </div>

                   {/* Browser/System UI Overlay based on Tab */}
                   <div className="absolute inset-0 z-40 bg-black/60 flex flex-col justify-end p-4 pb-10">
                      <motion.div 
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        key={activeTab}
                        className="rounded-[2.5rem] bg-[#1a1c1e] p-6 shadow-2xl border border-white/10"
                      >
                         <div className="flex items-center gap-4 mb-6">
                            <Image src="/mp-police-logo.png" alt="Logo" width={56} height={56} className="rounded-2xl shadow-xl" />
                            <div>
                               <h4 className="font-black text-white text-lg">MP Police 2026</h4>
                               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Revision & Mock Tests</p>
                            </div>
                         </div>
                         
                         <div className="space-y-3">
                            {activeTab === 'ios' ? (
                               <div className="flex items-center justify-between rounded-2xl bg-emerald-600 p-4 text-white shadow-lg shadow-emerald-600/20">
                                  <span className="text-sm font-black uppercase tracking-widest">Add to Home Screen</span>
                                  <PlusSquare size={20} />
                               </div>
                            ) : (
                               <div className="flex gap-3">
                                  <button className="flex-1 rounded-xl bg-white/5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Cancel</button>
                                  <button className="flex-1 rounded-xl bg-emerald-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20">Install</button>
                               </div>
                            )}
                         </div>
                      </motion.div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InstructionStep({
  number,
  text,
  subtext,
  icon,
  variant,
}: {
  number: number;
  text: string;
  subtext: string;
  icon: React.ReactNode;
  variant: 'white' | 'emerald';
}) {
  return (
    <div className="group flex items-start gap-5 rounded-[2.5rem] border border-white/[0.03] bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04] hover:border-white/[0.08]">
      <div className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black transition-all duration-500 shadow-lg",
        variant === 'white' ? "bg-white text-slate-900" : "bg-emerald-600 text-white"
      )}>
        {number}
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-3">
          <h3 className="font-black text-white tracking-tight text-lg">{text}</h3>
          <div className={cn(
             "transition-colors",
             variant === 'white' ? "text-slate-500 group-hover:text-white" : "text-emerald-500/50 group-hover:text-emerald-500"
          )}>{icon}</div>
        </div>
        <p className="text-sm leading-relaxed text-slate-500 font-bold">{subtext}</p>
      </div>
    </div>
  );
}
