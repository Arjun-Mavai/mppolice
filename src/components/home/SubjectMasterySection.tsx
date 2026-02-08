"use client";

/**
 * SubjectMasterySection — Analytics preview section bhai!
 * Yeh dikhata hai ki AI kaise subject-wise performance track karta hai.
 * Dark card mein progress bars — History, Polity, Geography sab dikhaate hain.
 */

import React from 'react';
import { BarChart3, BrainCircuit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSettingsStore } from '@/store/useSettingsStore';

export function SubjectMasterySection() {
    const { language } = useSettingsStore();

    return (
        <section className="py-32 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <Badge variant="outline" className="px-4 py-1 text-sm border-emerald-200 text-emerald-700 bg-emerald-50">
                            {language === 'hi' ? 'गहरी अंतर्दृष्टि' : 'Deep Insights'}
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            {language === 'hi' ? 'विषयवार प्रवीणता' : 'Subject-wise Mastery.'}
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed font-medium">
                            {language === 'hi'
                                ? 'सिर्फ मेहनत नहीं, स्मार्ट स्टडी करें। हमारा AI हर विषय में आपकी परफॉरमेंस को ट्रैक करता है, ताकि आप अपनी कमजोरियों को ताकत बना सकें।'
                                : "Don't just study hard, study smart. Our AI analyzes your performance in every subject to tell you exactly where to focus."}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {['History (इतिहास)', 'Polity (राजव्यवस्था)', 'Geography (भूगोल)', 'Science (विज्ञान)'].map(tag => (
                                <div key={tag} className="px-4 py-2 bg-slate-100 rounded-lg text-slate-600 font-semibold text-sm">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-lg">
                            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] opacity-20 blur-xl"></div>
                            <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl rounded-[2rem] p-8 space-y-8 relative z-10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-slate-400 font-medium mb-1">{language === 'hi' ? 'कुल स्कोर' : 'Overall Strength'}</div>
                                        <div className="text-4xl font-bold text-white flex items-center gap-2">
                                            74% <span className="text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2 py-1 rounded">+12%</span>
                                        </div>
                                    </div>
                                    <BarChart3 className="text-slate-600 w-8 h-8" />
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold text-slate-300">{language === 'hi' ? 'MP इतिहास' : 'MP History'}</span>
                                            <span className="text-emerald-400 font-bold">{language === 'hi' ? 'उत्कृष्ट (85%)' : 'Excellent (85%)'}</span>
                                        </div>
                                        <Progress value={85} className="h-3 bg-slate-800" indicatorClassName="bg-gradient-to-r from-emerald-500 to-emerald-400" />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold text-slate-300">{language === 'hi' ? 'भारतीय राजव्यवस्था' : 'Indian Polity'}</span>
                                            <span className="text-amber-400 font-bold">{language === 'hi' ? 'अच्छा (65%)' : 'Good (65%)'}</span>
                                        </div>
                                        <Progress value={65} className="h-3 bg-slate-800" indicatorClassName="bg-gradient-to-r from-amber-500 to-amber-400" />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold text-slate-300">{language === 'hi' ? 'भूगोल' : 'Geography'}</span>
                                            <span className="text-red-400 font-bold">{language === 'hi' ? 'कमजोर (42%)' : 'Weak (42%)'}</span>
                                        </div>
                                        <Progress value={42} className="h-3 bg-slate-800" indicatorClassName="bg-gradient-to-r from-red-500 to-red-400" />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-4 items-start">
                                    <BrainCircuit className="w-6 h-6 text-purple-400 shrink-0" />
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        <span className="text-purple-400 font-bold">AI Suggestion:</span> {language === 'hi' ? 'यूनिट 3 के  भूगोल' : 'Focus on Geography'} {language === 'hi' ? 'प्रश्नों पर ध्यान दें। "नदियां और पर्वत" में आपकी सटीकता औसत से कम है।' : 'questions. Your accuracy is below average in "Rivers & Mountains".'}
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
