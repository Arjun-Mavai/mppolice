"use client";

/**
 * ContentSuiteSection — Numbers/Stats section bhai!
 * Yeh dikhata hai kitne Unit Tests, Topic Tests, FLTs, PYQs aur CSAT Mocks hain.
 * Dynamic topicCount server action se fetch hota hai.
 */

import React from 'react';
import { BookOpen, Target, Trophy, Brain, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getTopicTestStats } from '@/actions/getTopicTestStats';

export function ContentSuiteSection() {
    const { language } = useSettingsStore();
    const [topicCount, setTopicCount] = React.useState(0);

    React.useEffect(() => {
        getTopicTestStats().then(res => {
            if (res.success && res.data) {
                let total = 0;
                Object.values(res.data).forEach(topics => {
                    total += topics.filter(t => t.questionCount > 0).length;
                });
                setTopicCount(total);
            }
        });
    }, []);

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl -mr-40 -mt-40"></div>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                        {language === 'hi' ? 'सब कुछ एक जगह।' : 'Everything You Need.'}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        {language === 'hi'
                            ? 'यूनिट टेस्ट से लेकर फुल लेंथ मॉक तक, आपकी तैयारी का पूरा भंडार।'
                            : 'From Unit Tests to Full Length Mocks, we have structured content to take you from Zero to Hero.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {/* Unit Tests */}
                    <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-slate-200 bg-slate-50/50">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 mx-auto bg-slate-100 text-slate-700 rounded-full flex items-center justify-center">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-slate-900">10</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Units Covered</div>
                            </div>
                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 text-[10px] sm:text-xs">
                                {/* {language === 'hi' ? '5 प्रयास / टेस्ट' : '5 Attempts / Test'} */}
                                {language === 'hi' ? 'यूनिट वाइज' : 'Unit Wise'}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Topic Tests */}
                    <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-rose-200 bg-rose-50/30">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 mx-auto bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                                <Target size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-slate-900">
                                    {topicCount > 0 ? topicCount : '100+'}
                                </div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Topic Wise Tests</div>
                            </div>
                            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 text-[10px] sm:text-xs">
                                {language === 'hi' ? 'टॉपिक वार' : 'Topic Wise'}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* FLTs */}
                    <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-emerald-200 bg-emerald-50/30">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-slate-900">10</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Full Length Tests</div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] sm:text-xs">
                                {language === 'hi' ? '5 प्रयास / टेस्ट' : '5 Attempts / Test'}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* PYQ */}
                    <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-amber-200 bg-amber-50/30">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                                <History size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-slate-900">5+</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Years PYQ</div>
                            </div>
                            <p className="text-xs text-slate-500 font-medium pt-1">
                                {language === 'hi' ? '2020 से अब तक' : '2020 Onwards'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* CSAT */}
                    <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-purple-200 bg-purple-50/30 lg:col-span-1 md:col-span-2 lg:col-start-auto">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                <Brain size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-slate-900">5</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">CSAT Mocks</div>
                            </div>
                            <p className="text-xs text-slate-500 font-medium pt-1">
                                {language === 'hi' ? 'अभ्यास के लिए' : 'For Practice'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
