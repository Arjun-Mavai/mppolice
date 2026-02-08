"use client";

/**
 * PremiumExplanationSection — "More Than Just Answers" wala section bhai!
 * Yeh dikhata hai ki hamari explanations mein kya-kya aata hai:
 * Core Logic, Exam Fact, Memory Tip, aur Scam Alert — full package!
 */

import React from 'react';
import { CheckCircle2, Lightbulb, Brain, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

export function PremiumExplanationSection() {
    const { language } = useSettingsStore();

    return (
        <section className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <Badge variant="outline" className="px-4 py-1 text-sm border-purple-200 text-purple-700 bg-purple-50 mb-6 rounded-full">
                        {language === 'hi' ? 'प्रीमियम व्याख्या' : 'Premium Explanations'}
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                        {language === 'hi' ? 'सिर्फ उत्तर नहीं,' : 'More Than Just Answers.'} <br />
                        <span className="text-slate-700">{language === 'hi' ? 'संपूर्ण कांसेप्ट सीखें।' : 'Master The Concept.'}</span>
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        {language === 'hi'
                            ? 'हर प्रश्न के साथ मिलती है एक विस्तृत, संरक्षित व्याख्या जो आपको रटने की जगह समझने में मदद करती है।'
                            : 'Every question comes with a structured breakdown designed to help you learn, retain, and eliminate wrong options.'}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* The Card Visualization */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-br from-slate-700 to-purple-600 rounded-[2rem] opacity-10 blur-xl"></div>
                        <Card className="border-0 shadow-2xl rounded-[2rem] overflow-hidden relative z-10 bg-white">
                            {/* Question Header */}
                            <div className="bg-slate-50 p-6 border-b border-slate-100">
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                                        Which river is known as the "Ganga of Madhya Pradesh"?
                                        <br />
                                        <span className="text-slate-500 font-medium text-base mt-1 block">
                                            मध्य प्रदेश की गंगा किस नदी को कहा जाता है?
                                        </span>
                                    </h3>
                                    <Badge className="bg-slate-200 text-slate-600 hover:bg-slate-200 shrink-0">MP Geo</Badge>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 space-y-6">
                                {/* Answer Status */}
                                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Correct Answer</div>
                                        <div className="font-bold text-slate-900">Betwa (बेतवा)</div>
                                    </div>
                                </div>

                                {/* The 4 Gimmick Sections */}
                                <div className="space-y-4">
                                    {/* 1. Logic */}
                                    <div className="flex gap-4">
                                        <div className="w-1 bg-emerald-500 rounded-full shrink-0"></div>
                                        <div className="flex-1">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-700 mb-1">
                                                <CheckCircle2 size={16} /> ✅ Core Logic
                                            </h4>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                Based on <span className="font-bold">pollution levels</span> like the Ganges, Betwa is called the Ganga of MP.
                                                <br/>
                                                <span className="text-slate-500 text-xs">(प्रदूषण के आधार पर इसे म.प्र. की गंगा कहा जाता है।)</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* 2. Exam Fact */}
                                    <div className="flex gap-4">
                                        <div className="w-1 bg-slate-500 rounded-full shrink-0"></div>
                                        <div className="flex-1">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                                                <Lightbulb size={16} /> 💡 Exam Fact
                                            </h4>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                Origin: <span className="font-bold">Kumra Gaon (Raisen)</span>. <br/>
                                                Total Length: <span className="font-bold">480 km</span>.
                                            </p>
                                        </div>
                                    </div>

                                    {/* 3. Memory Tip */}
                                    <div className="flex gap-4">
                                        <div className="w-1 bg-amber-500 rounded-full shrink-0"></div>
                                        <div className="flex-1">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-amber-700 mb-1">
                                                <Brain size={16} /> 🧠 Memory Tip
                                            </h4>
                                            <p className="text-sm text-slate-700 leading-relaxed italic bg-amber-50 p-2 rounded-lg border border-amber-100">
                                                "Betwa = Beta (Son) of Raisen" → Kumra Gaon.
                                            </p>
                                        </div>
                                    </div>

                                    {/* 4. Scam Alert */}
                                    <div className="flex gap-4">
                                        <div className="w-1 bg-red-500 rounded-full shrink-0"></div>
                                        <div className="flex-1">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-1">
                                                <AlertTriangle size={16} /> 🚫 Scam Alert
                                            </h4>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                Don't confuse with <span className="font-bold text-red-600">Narmada</span>. Narmada is the <span className="underline">Lifeline</span> of MP, not the Ganga (based on sanctity/pollution distinction).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Features List */}
                    <div className="space-y-10 lg:pt-10">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                                <Brain size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{language === 'hi' ? 'स्मृति तकनीक (Mnemonics)' : 'Built-in Mnemonics'}</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {language === 'hi' ? 'कठिन तथ्यों को याद रखने के लिए विशेष ट्रिक्स और सूत्र।' : 'Every explanation includes catchy mnemonics to help you retain dry facts forever.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{language === 'hi' ? 'ट्रैप अलर्ट' : 'Trap Alerts'}</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {language === 'hi' ? 'जानें कि परीक्षार्थी अक्सर कहाँ गलती करते हैं और उन "जाल" से कैसे बचें।' : 'We highlight commonly confused options and historical "scams" so you never fall for them in the exam.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{language === 'hi' ? 'टू-द-पॉइंट लॉजिक' : 'To-The-Point Logic'}</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {language === 'hi' ? 'सीधा और सटीक उत्तर। कोई अनावश्यक जानकारी नहीं।' : 'Direct reasoning without the fluff. Save time and absorb only what matters.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
