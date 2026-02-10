"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Apple, Smartphone, Share, PlusSquare, ArrowRight, Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { useSettingsStore } from "@/store/useSettingsStore";

export function AppInstallGuide() {
  const [activeTab, setActiveTab] = useState<"ios" | "android">("ios");
  const { language } = useSettingsStore();

  const content = {
    en: {
        title: <>Install <span className="text-blue-600">Mindful App</span></>,
        subtitle: "Get the full premium app experience. Works seamlessly on iPhone, iPad, and Android.",
        iosTab: "iPhone",
        androidTab: "Android",
        ios: [
            { text: "Open Safari Browser", subtext: "This feature works best in Safari on iOS." },
            { text: "Tap the Share Button", subtext: "Look for the square icon with an arrow at the bottom." },
            { text: "Select 'Add to Home Screen'", subtext: "Scroll down until you see this option." }
        ],
        android: [
            { text: "Open Chrome Browser", subtext: "Works best on Google Chrome." },
            { text: "Tap 'Install App' Prompt", subtext: "It usually appears at the bottom of the screen automatically." },
            { text: "Or use the Browser Menu", subtext: "Tap the 3 dots (⋮) top right > 'Install App'." }
        ]
    },
    hi: {
        title: <>Mindful App <span className="text-blue-600">इंस्टॉल करें</span></>,
        subtitle: "बिना App Store के पाएँ फुल ऐप एक्सपीरियंस। iPhone और Android दोनों पर उपलब्ध।",
        iosTab: "iPhone",
        androidTab: "Android",
        ios: [
            { text: "Safari ब्राउज़र खोलें", subtext: "यह फीचर Safari में सबसे अच्छा चलता है।" },
            { text: "Share बटन दबाएँ", subtext: "नीचे दिए गए शेयर आइकन (तीर वाला बॉक्स) पर क्लिक करें।" },
            { text: "'Add to Home Screen' चुनें", subtext: "लिस्ट में नीचे स्क्रॉल करके यह ऑप्शन चुनें।" }
        ],
        android: [
            { text: "Chrome ब्राउज़र खोलें", subtext: "यह Google Chrome पर सबसे अच्छा चलता है।" },
            { text: "'Install App' पर क्लिक करें", subtext: "यह स्क्रीन के नीचे अपने आप दिखाई देगा।" },
            { text: "या मेनू का उपयोग करें", subtext: "ऊपर राइट में 3 डॉट्स (⋮) दबाएँ और 'Install App' चुनें।" }
        ]
    }
  };

  const t = language === 'hi' ? content.hi : content.en;

  return (
    <section className="py-24 px-6 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-slate-900"
          >
            {t.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            {t.subtitle}
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Left: Controls & Instructions */}
          <div className="flex-1 w-full max-w-lg order-2 lg:order-1">
             {/* Tab Switcher */}
             <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 mb-8 w-fit mx-auto lg:mx-0">
                <button
                    onClick={() => setActiveTab("ios")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                        activeTab === "ios" 
                            ? "bg-slate-900 text-white shadow-md" 
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                >
                    <Apple size={18} className={activeTab === "ios" ? "fill-white" : ""} />
                    {t.iosTab}
                </button>
                <button
                    onClick={() => setActiveTab("android")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                        activeTab === "android" 
                            ? "bg-blue-600 text-white shadow-md" 
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                >
                    <Smartphone size={18} />
                    {t.androidTab}
                </button>
             </div>

             {/* Steps */}
             <div className="space-y-6">
                <AnimatePresence mode="wait">
                    {activeTab === "ios" ? (
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
          <div className="flex-1 w-full flex justify-center lg:justify-start order-1 lg:order-2">
             <AnimatePresence mode="wait">
                {activeTab === "ios" ? (
                    <motion.div
                         key="ios-mockup"
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 1.05 }}
                         className="relative w-[320px] h-[650px] bg-slate-900 rounded-[3.5rem] p-3 shadow-2xl border-[6px] border-slate-800 ring-1 ring-white/10"
                    >
                        {/* iPhone Dynamic Island */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-slate-800/50 ml-auto mr-3"></div>
                        </div>

                        {/* Screen Content */}
                        <div className="w-full h-full bg-slate-50 rounded-[3rem] overflow-hidden relative flex flex-col pt-10">
                            {/* App Header */}
                            <div className="h-12 flex items-center justify-between px-6">
                                <span className="text-sm font-bold text-slate-900">Mindful</span>
                                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                            </div>

                            {/* App Body */}
                            <div className="flex-1 p-6 space-y-4">
                                <div className="h-40 rounded-3xl bg-blue-600/5 animate-pulse w-full"></div>
                                <div className="space-y-3">
                                    <div className="h-4 w-3/4 bg-slate-200 rounded-full animate-pulse"></div>
                                    <div className="h-4 w-1/2 bg-slate-200 rounded-full animate-pulse"></div>
                                    <div className="h-4 w-5/6 bg-slate-200 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            
                            {/* Safari Bottom Bar Mockup */}
                            <div className="h-20 bg-white/90 backdrop-blur-md border-t border-slate-200 absolute bottom-0 left-0 right-0 flex items-center justify-around pb-6 px-6">
                                <div className="text-blue-500"><ArrowRight className="rotate-180" size={20} /></div>
                                <div className="text-slate-300"><ArrowRight size={20} /></div>
                                <div className="text-blue-500"><Share size={20} /></div>
                                <div className="text-blue-500"><PlusSquare size={20} /></div>
                                <div className="text-blue-500"><Download size={20} /></div>
                            </div>

                            {/* Share Sheet Overlay */}
                            <div className="absolute inset-0 bg-black/20 flex flex-col justify-end z-40">
                                <motion.div 
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    className="bg-slate-100 rounded-t-3xl p-4 pb-8 space-y-4"
                                >
                                     <div className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm items-center">
                                         <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-100 p-1 flex items-center justify-center">
                                            <img src="/icon.png" alt="App Icon" className="w-full h-full object-contain" />
                                         </div>
                                         <div className="flex-1">
                                             <h4 className="font-bold text-slate-900">Mindful MPPSC</h4>
                                             <p className="text-xs text-slate-500">mppsc.zenscroll.app</p>
                                         </div>
                                     </div>
                                     
                                     <div className="bg-white rounded-2xl p-2 space-y-0.5">
                                         <div className="p-3 flex items-center justify-between text-slate-900">
                                             <span className="text-sm font-medium">Add to Reading List</span>
                                         </div>
                                         <div className="h-px bg-slate-100 mx-3"></div>
                                         <div className="p-3 flex items-center justify-between text-slate-900 bg-slate-50 rounded-lg">
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
                         className="relative w-[310px] h-[660px] bg-slate-800 rounded-[2.5rem] p-2 shadow-2xl border-[4px] border-slate-700 ring-1 ring-white/10"
                    >
                        {/* Android Punch Hole */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 ring-1 ring-white/10"></div>

                        {/* Screen Content */}
                        <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative flex flex-col pt-8">
                            {/* App Header */}
                            <div className="h-14 flex items-center justify-between px-6 bg-white shadow-sm z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                         <img src="/icon.png" alt="Icon" className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">Mindful</span>
                                </div>
                            </div>

                            {/* App Body */}
                            <div className="flex-1 p-6 space-y-4 bg-slate-50">
                                <div className="h-48 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-pulse w-full"></div>
                                <div className="space-y-3">
                                    <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                                    <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse"></div>
                                </div>
                            </div>

                             {/* Android Install Prompt Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center z-40 h-full">
                                <motion.div 
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="w-full bg-white rounded-2xl p-4 shadow-xl border border-slate-100"
                                >
                                     <div className="flex items-start gap-4 mb-4">
                                         <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 p-1 flex items-center justify-center shrink-0">
                                            <img src="/icon.png" alt="App Icon" className="w-full h-full object-contain" />
                                         </div>
                                         <div className="flex-1">
                                             <h4 className="font-bold text-slate-900 text-sm">Install Mindful MPPSC</h4>
                                             <p className="text-xs text-slate-500 mt-0.5">Add to Home screen for quick access to quizzes and notes.</p>
                                         </div>
                                     </div>
                                     <div className="flex gap-3">
                                         <button className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                                         <button className="flex-1 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors">Install</button>
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

function InstructionStep({ number, text, subtext, icon }: { number: number, text: string, subtext: string, icon: React.ReactNode }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">
                {number}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900">{text}</h3>
                    <div className="text-slate-400">
                        {icon}
                    </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{subtext}</p>
            </div>
        </div>
    );
}
