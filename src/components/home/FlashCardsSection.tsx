"use client";

/**
 * FlashCardsSection — Yeh section flash card flip demo dikhata hai bhai!
 * Active Recall technique ka demo — tap to flip, swipe to next wala feel.
 * Dynasties, Capitals, Mnemonics sab ek card mein packed hai.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, RotateCw, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

export function FlashCardsSection() {
    const { language } = useSettingsStore();

    const [isFlipped, setIsFlipped] = React.useState(false);
    const [hasInteracted, setHasInteracted] = React.useState(false);

    React.useEffect(() => {
        // Auto-flip demo sequence
        const timer1 = setTimeout(() => setIsFlipped(true), 1500);
        const timer2 = setTimeout(() => setIsFlipped(false), 4500);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const handleCardClick = () => {
        setHasInteracted(true);
        setIsFlipped(!isFlipped);
    };

    return (
        <section className="py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8 order-2 lg:order-1">
                        <Badge variant="outline" className="px-4 py-1 text-sm border-slate-200 text-slate-700 bg-slate-50">
                            {language === 'hi' ? 'सक्रिय शिक्षण' : 'Active Learning'}
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            {language === 'hi' ? 'इंटरैक्टिव फ्लैशकार्ड्स।' : 'Interactive Flash Cards.'}
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed font-medium">
                            {language === 'hi'
                                ? 'रटने की जरूरत नहीं। हमारे फ्लैशकार्ड्स "Active Recall" तकनीक का उपयोग करते हैं, जिससे आप तारीखें, वंश और अनुच्छेद चुटकियों में याद कर लेंगे।'
                                : 'Never forget a fact again. Our curated flashcards use active recall to help you memorize Dates, Dynasties, and Articles effortlessly.'}
                        </p>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <RotateCw className="w-5 h-5 text-slate-700" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">{language === 'hi' ? 'स्मार्ट रोटेशन' : 'Smart Rotation'}</h4>
                                    <p className="text-slate-600">{language === 'hi' ? 'जवाब देखने के लिए टैप करें। अगले कार्ड के लिए स्वाइप करें।' : 'Tap to reveal key facts. Swipe to next.'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <Lightbulb className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">{language === 'hi' ? 'निमोनिक्स (स्मरण सूत्र)' : 'Mnemonics Included'}</h4>
                                    <p className="text-slate-600">{language === 'hi' ? 'जटिल विषयों को याद रखने के लिए आसान ट्रिक्स।' : 'Complex topics broken down into easy memory tricks.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="order-1 lg:order-2 perspective-1000 flex justify-center lg:justify-end">
                        <div
                            className="group h-80 w-full max-w-md bg-transparent cursor-pointer [perspective:1000px] select-none"
                            onClick={handleCardClick}
                        >
                            <motion.div
                                className="relative h-full w-full shadow-2xl transition-all duration-700 [transform-style:preserve-3d] hover:shadow-slate-500/20 rounded-3xl"
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                {/* Front */}
                                <div className="absolute inset-0 bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center justify-center [backface-visibility:hidden]">
                                    <div className="absolute top-0 right-0 p-6 opacity-10">
                                        <Target size={120} />
                                    </div>
                                    <span className="text-7xl text-slate-100 font-serif absolute top-6 left-6 font-bold">01</span>

                                    {/* Icon */}
                                    <div className="w-20 h-20 bg-gradient-to-tr from-slate-700 to-purple-500 rounded-2xl shadow-lg flex items-center justify-center mb-8 rotate-3 transform group-hover:rotate-6 transition-transform">
                                        <Sparkles className="w-10 h-10 text-white" />
                                    </div>

                                    <h3 className="text-3xl font-extrabold text-slate-900 text-center">
                                        {language === 'hi' ? 'मध्य प्रदेश का इतिहास' : 'History of MP'}
                                    </h3>
                                    <span className="mt-4 px-4 py-1.5 bg-slate-100 rounded-full text-slate-500 text-sm font-semibold flex items-center gap-2">
                                        <RotateCw size={14} /> {language === 'hi' ? 'पलटने के लिए टैप करें' : 'Tap to Flip'}
                                    </span>
                                </div>

                                {/* Back */}
                                <div className="absolute inset-0 h-full w-full bg-slate-900 rounded-3xl border border-slate-800 p-8 text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between overflow-hidden">
                                    {/* Texture */}
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 text-white"></div>
                                    <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-slate-500 rounded-full blur-3xl opacity-30"></div>

                                    <div className="relative">
                                        <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                                            {language === 'hi' ? 'विषय विश्लेषण' : 'Topic Analysis'}
                                        </div>
                                        <h4 className="text-2xl font-bold text-white">
                                            {language === 'hi' ? 'राजवंश और राजधानियाँ' : 'Dynasties & Capitals'}
                                        </h4>
                                    </div>

                                    <ul className="space-y-3 relative">
                                        <li className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                            <span className="text-sm font-medium">Holkar: <span className="text-slate-300">{language === 'hi' ? 'इंदौर (मालवा)' : 'Indore (Malwa)'}</span></span>
                                        </li>
                                        <li className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                            <span className="text-sm font-medium">Scindia: <span className="text-slate-300">{language === 'hi' ? 'ग्वालियर' : 'Gwalior'}</span></span>
                                        </li>
                                        <li className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                            <span className="text-sm font-medium">Bundela: <span className="text-slate-300">{language === 'hi' ? 'ओरछा' : 'Orchha'}</span></span>
                                        </li>
                                    </ul>

                                    <div className="relative mt-2 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl">
                                        <div className="text-xs text-amber-300 font-bold uppercase mb-1 flex items-center gap-1">
                                            <Lightbulb size={12} /> {language === 'hi' ? 'स्मरण सूत्र' : 'Mnemonic'}
                                        </div>
                                        <div className="text-sm font-medium text-amber-100">
                                            "Holkar In Doors" (Indore)
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
