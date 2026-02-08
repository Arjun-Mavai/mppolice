"use client";

/**
 * InstantFeedbackSection — Instant Mode ka demo bhai!
 * Yeh section dikhata hai ki Instant Mode ON karo toh har question ke baad
 * turant correct answer aur explanation mil jaata hai. No waiting!
 */

import React from 'react';
import { Zap, CheckCircle2, BookOpen, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

export function InstantFeedbackSection() {
    const { language } = useSettingsStore();

    return (
        <section className="py-32 bg-slate-50 border-y border-slate-200 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Visual First on Desktop */}
                    <div className="order-2 lg:order-1 relative flex justify-center lg:justify-start">
                        <div className="relative w-full max-w-lg mx-auto lg:mx-0">
                            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2rem] opacity-20 blur-xl animate-pulse-slow"></div>
                            <Card className="rounded-[2rem] shadow-2xl border-0 overflow-hidden relative z-10">
                                <div className="bg-white p-6 md:p-8 space-y-6">
                                    {/* Header */}
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase">{language === 'hi' ? 'यूनिट 1 टेस्ट' : 'Unit 1 Test'}</div>
                                            <h3 className="font-bold text-slate-900">{language === 'hi' ? 'MP इतिहास क्विज़' : 'MP History Quiz'}</h3>
                                        </div>
                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1 pl-1 pr-2">
                                            <Zap size={12} className="fill-amber-700" /> {language === 'hi' ? 'इंस्टेंट मोड' : 'Instant Mode'}
                                        </Badge>
                                    </div>

                                    {/* Question */}
                                    <div className="space-y-4">
                                        <p className="font-bold text-lg text-slate-900">
                                            {language === 'hi' ? 'चेदी साम्राज्य का सबसे पहला उल्लेख किस ग्रंथ में मिलता है?' : 'Which text provides the earliest mention of the Chedi Kingdom?'}
                                        </p>

                                        <div className="space-y-3">
                                            {/* Wrong Option */}
                                            <div className="p-4 rounded-xl border-2 border-red-100 bg-red-50/50 flex justify-between items-center cursor-not-allowed opacity-80">
                                                <span className="font-medium text-slate-700">{language === 'hi' ? 'महाभारत' : 'Mahabharata'}</span>
                                                <X className="w-5 h-5 text-red-500" />
                                            </div>

                                            {/* Correct Option */}
                                            <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 relative shadow-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-slate-900">{language === 'hi' ? 'ऋग्वेद' : 'Rigveda'}</span>
                                                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Explanation */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 animate-in slide-in-from-top-4 fade-in duration-700">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{language === 'hi' ? 'व्याख्या' : 'Explanation'}</div>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {language === 'hi'
                                                ? <span><strong>ऋग्वेद</strong> में चेदी साम्राज्य का सबसे पहला संदर्भ (दानस्तुति सूक्ति) मिलता है।</span>
                                                : <span>The **Rigveda** contains the earliest reference to the Chedi kingdom (Danastuti hymn).</span>}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="space-y-8 order-1 lg:order-2 lg:pl-10">
                        <Badge variant="outline" className="px-4 py-1 text-sm border-amber-200 text-amber-700 bg-amber-50">
                            {language === 'hi' ? 'अभ्यास मोड' : 'Practice Mode'}
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            {language === 'hi' ? 'तुरंत फीडबैक।' : 'Instant Feedback.'}
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed font-medium">
                            {language === 'hi'
                                ? <span>रिजल्ट का इंतजार क्यों? <strong>इंस्टेंट मोड</strong> ऑन करें और हर सवाल के तुरंत बाद सही जवाब और व्याख्या देखें।</span>
                                : <span>Why wait for the results? Turn on <strong>Instant Mode</strong> to see the correct answer and detailed explanation immediately after every question.</span>}
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-slate-700 font-medium text-lg">
                                    {language === 'hi' ? 'गलतियों का तुरंत सुधार' : 'Real-time correction'}
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-slate-600" />
                                </div>
                                <span className="text-slate-700 font-medium text-lg">
                                    {language === 'hi' ? 'प्रमाणिक स्रोतों से संदर्भ' : 'Detailed Source References'}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
