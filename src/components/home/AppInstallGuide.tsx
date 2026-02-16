'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Smartphone, Share, PlusSquare, ArrowRight, Download, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useSettingsStore } from '@/store/useSettingsStore';
import Image from 'next/image';

export function AppInstallGuide() {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');
  const { language } = useSettingsStore();

  const content = {
    en: {
      title: (
        <>
          Install <span className="text-blue-600">Mindful App</span>
        </>
      ),
      subtitle:
        'Get the full premium app experience. Works seamlessly on iPhone, iPad, and Android.',
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
          Mindful App <span className="text-blue-600">इंस्टॉल करें</span>
        </>
      ),
      subtitle: 'बिना App Store के पाएँ फुल ऐप एक्सपीरियंस। iPhone और Android दोनों पर उपलब्ध।',
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
    <section className="overflow-hidden bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl font-bold text-slate-900 md:text-5xl"
          >
            {t.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-slate-600"
          >
            {t.subtitle}
          </motion.p>
        </div>

        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-24">
          {/* Left: Controls & Instructions */}
          <div className="order-2 w-full max-w-lg flex-1 lg:order-1">
            {/* Tab Switcher */}
            <div className="mx-auto mb-8 flex w-fit rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm lg:mx-0">
              <button
                onClick={() => setActiveTab('ios')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300',
                  activeTab === 'ios'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Apple size={18} className={activeTab === 'ios' ? 'fill-white' : ''} />
                {t.iosTab}
              </button>
              <button
                onClick={() => setActiveTab('android')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300',
                  activeTab === 'android'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Smartphone size={18} />
                {t.androidTab}
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {activeTab === 'ios' ? (
                  <motion.div
                    key="ios-steps"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <InstructionStep
                      number={1}
                      text={t.ios[0].text}
                      subtext={t.ios[0].subtext}
                      icon={<Apple size={20} />}
                    />
                    <InstructionStep
                      number={2}
                      text={t.ios[1].text}
                      subtext={t.ios[1].subtext}
                      icon={<Share size={20} />}
                    />
                    <InstructionStep
                      number={3}
                      text={t.ios[2].text}
                      subtext={t.ios[2].subtext}
                      icon={<PlusSquare size={20} />}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="android-steps"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <InstructionStep
                      number={1}
                      text={t.android[0].text}
                      subtext={t.android[0].subtext}
                      icon={<Smartphone size={20} />}
                    />
                    <InstructionStep
                      number={2}
                      text={t.android[1].text}
                      subtext={t.android[1].subtext}
                      icon={<Download size={20} />}
                    />
                    <InstructionStep
                      number={3}
                      text={t.android[2].text}
                      subtext={t.android[2].subtext}
                      icon={<ArrowRight size={20} />}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div className="order-1 flex w-full flex-1 justify-center lg:order-2 lg:justify-start">
            <AnimatePresence mode="wait">
              {activeTab === 'ios' ? (
                <motion.div
                  key="ios-mockup"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="relative h-[650px] w-[320px] rounded-[3.5rem] border-[6px] border-slate-800 bg-slate-900 p-3 shadow-2xl ring-1 ring-white/10"
                >
                  {/* iPhone Dynamic Island */}
                  <div className="absolute top-6 left-1/2 z-50 flex h-[28px] w-[100px] -translate-x-1/2 items-center justify-center rounded-full bg-black">
                    <div className="mr-3 ml-auto h-2 w-2 rounded-full bg-slate-800/50"></div>
                  </div>

                  {/* Screen Content */}
                  <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[3rem] bg-slate-50 pt-10">
                    {/* App Header */}
                    <div className="flex h-12 items-center justify-between px-6">
                      <span className="text-sm font-bold text-slate-900">Mindful</span>
                      <div className="h-8 w-8 rounded-full bg-slate-200"></div>
                    </div>

                    {/* App Body */}
                    <div className="flex-1 space-y-4 p-6">
                      <div className="h-40 w-full animate-pulse rounded-3xl bg-blue-600/5"></div>
                      <div className="space-y-3">
                        <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-200"></div>
                        <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-200"></div>
                        <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200"></div>
                      </div>
                    </div>

                    {/* Safari Bottom Bar Mockup */}
                    <div className="absolute right-0 bottom-0 left-0 flex h-20 items-center justify-around border-t border-slate-200 bg-white/90 px-6 pb-6 backdrop-blur-md">
                      <div className="text-blue-500">
                        <ArrowRight className="rotate-180" size={20} />
                      </div>
                      <div className="text-slate-300">
                        <ArrowRight size={20} />
                      </div>
                      <div className="text-blue-500">
                        <Share size={20} />
                      </div>
                      <div className="text-blue-500">
                        <PlusSquare size={20} />
                      </div>
                      <div className="text-blue-500">
                        <Download size={20} />
                      </div>
                    </div>

                    {/* Share Sheet Overlay */}
                    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/20">
                      <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        className="space-y-4 rounded-t-3xl bg-slate-100 p-4 pb-8"
                      >
                        <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
                            <img
                              src="/icon.png"
                              alt="App Icon"
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900">Mindful MPPSC</h4>
                            <p className="text-xs text-slate-500">mppsc.zenscroll.app</p>
                          </div>
                        </div>

                        <div className="space-y-0.5 rounded-2xl bg-white p-2">
                          <div className="flex items-center justify-between p-3 text-slate-900">
                            <span className="text-sm font-medium">Add to Reading List</span>
                          </div>
                          <div className="mx-3 h-px bg-slate-100"></div>
                          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-slate-900">
                            <span className="text-sm font-medium">Add to Home Screen</span>
                            <PlusSquare size={18} />
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="android-mockup"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="relative h-[660px] w-[310px] rounded-[2.5rem] border-[4px] border-slate-700 bg-slate-800 p-2 shadow-2xl ring-1 ring-white/10"
                >
                  {/* Android Punch Hole */}
                  <div className="absolute top-8 left-1/2 z-50 h-4 w-4 -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10"></div>

                  {/* Screen Content */}
                  <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-white pt-8">
                    {/* App Header */}
                    <div className="z-10 flex h-14 items-center justify-between bg-white px-6 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                          <Image
                            src="/icon.png"
                            alt="Icon"
                            width={20}
                            height={20}
                            className="h-5 w-5"
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-900">Mindful</span>
                      </div>
                    </div>

                    {/* App Body */}
                    <div className="flex-1 space-y-4 bg-slate-50 p-6">
                      <div className="h-48 w-full animate-pulse rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                      <div className="space-y-3">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200"></div>
                        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200"></div>
                      </div>
                    </div>

                    {/* Android Install Prompt Overlay */}
                    <div className="absolute right-0 bottom-0 left-0 z-40 flex h-full items-end justify-center bg-gradient-to-t from-black/50 to-transparent p-4 pb-8">
                      <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="w-full rounded-2xl border border-slate-100 bg-white p-4 shadow-xl"
                      >
                        <div className="mb-4 flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
                            <img
                              src="/icon.png"
                              alt="App Icon"
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-900">
                              Install Mindful MPPSC
                            </h4>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Add to Home screen for quick access to quizzes and notes.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button className="flex-1 rounded-lg py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50">
                            Cancel
                          </button>
                          <button className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-bold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700">
                            Install
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
}: {
  number: number;
  text: string;
  subtext: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white transition-transform group-hover:scale-110">
        {number}
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="font-bold text-slate-900">{text}</h3>
          <div className="text-slate-400">{icon}</div>
        </div>
        <p className="text-sm leading-relaxed text-slate-500">{subtext}</p>
      </div>
    </div>
  );
}
