"use client";

// Home page ka pricing section — same style as /pricing page
// ₹ price strikethrough ke saath, monthly breakdown, "first 100 users" urgency
import { CheckCircle2, Star, Clock, Users, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

interface PremiumMarketingProps {
    onUnlock: (amount: number) => void;
}

export function PremiumMarketing({ onUnlock }: PremiumMarketingProps) {
    const { language, user } = useSettingsStore();
    const hi = language === 'hi';
    const isLiteUser = user?.plan_tier === 'lite';

    // Lite user ko Pro upgrade dikhao — seedha point pe aao
    if (isLiteUser) {
        return (
            <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 min-h-[500px] flex flex-col items-center text-center justify-center">
                <Badge className="bg-amber-100 text-amber-700 px-3 py-1 mb-6 hover:bg-amber-200 transition-colors cursor-default border-amber-200">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {hi ? 'अपग्रेड उपलब्ध है' : 'UPGRADE AVAILABLE'}
                </Badge>

                <h2 className="text-3xl md:text-4xl font-extrabold font-display text-slate-900 mb-2">
                    {hi ? 'अपनी तैयारी को' : 'Supercharge Your'} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">
                        {hi ? 'अगले स्तर पर ले जाएं' : 'Preparation'}
                    </span>
                </h2>

                <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                    {hi
                        ? 'प्रो प्लान पर अपग्रेड करें और अनलिमिटेड क्विज़, टेस्ट और स्मार्ट एनालिसिस अनलॉक करें। केवल ₹199 में।'
                        : 'Upgrade to Pro and unlock Unlimited Quizzes, Tests, and Smart Analytics. Just pay the difference.'}
                </p>

                <div className="relative group w-full max-w-md">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-1 rounded-full text-xs font-bold shadow-lg shadow-slate-500/20 z-20 whitespace-nowrap tracking-wide">
                        {hi ? 'खास आपके लिए ऑफर' : 'SPECIAL UPGRADE OFFER'}
                    </div>

                    <Card className="border-0 shadow-2xl relative overflow-hidden ring-4 ring-slate-500/10 hover:ring-slate-500/20 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white opacity-100" />
                        <CardContent className="p-8 flex flex-col relative z-10">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                <div className="text-left">
                                    <h3 className="text-xl font-bold text-slate-900">Pro Upgrade</h3>
                                    <p className="text-xs text-slate-500">From Lite Plan</p>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm text-slate-400 line-through">₹299</span>
                                    <span className="text-3xl font-black text-slate-800">₹199</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8 text-left">
                                {['Unlimited Topic Tests', 'Unlimited Unit Tests', 'Full Length Mock Tests (FLTs)'].map((t) => (
                                    <li key={t} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span>{t}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => onUnlock(199)}
                                className="w-full h-12 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-lg shadow-slate-300 transition-all"
                            >
                                Upgrade Now for ₹199
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Free users — same layout as /pricing page: strikethrough price, monthly breakdown, urgency
    const liteFeatures = [
        { en: 'Topic-wise Tests (5 per unit)', hi: 'टॉपिक वाइज़ टेस्ट (5 प्रति यूनिट)' },
        { en: 'Unit Tests with Explanations', hi: 'यूनिट टेस्ट और व्याख्या' },
        { en: 'AI-Powered Concept Explanations', hi: 'AI कांसेप्ट एक्सप्लेनेशन' },
        { en: 'Study Blogs Access', hi: 'स्टडी ब्लॉग्स एक्सेस' },
        { en: 'Valid till MPPSC 2026 Prelims', hi: 'MPPSC 2026 प्रीलिम्स तक वैध' },
    ];
    const proFeatures = [
        { en: 'Everything in Lite +', hi: 'लाइट की सभी सुविधाएँ +' },
        { en: 'Unlimited Topic & Unit Tests', hi: 'अनलिमिटेड टॉपिक और यूनिट टेस्ट' },
        { en: 'Full Length Mock Tests (100Q)', hi: 'फुल लेंथ मॉक टेस्ट (100 प्रश्न)' },
        { en: 'CSAT Mock Papers', hi: 'CSAT मॉक पेपर' },
        { en: 'PYQ Papers (2020-2024)', hi: 'PYQ पेपर (2020-2024)' },
        { en: 'Smart Analytics Dashboard', hi: 'स्मार्ट एनालिटिक्स डैशबोर्ड' },
        { en: 'Valid till MPPSC 2026 Mains', hi: 'MPPSC 2026 मेन्स तक वैध' },
    ];

    return (
        <div className="p-6 md:p-12 bg-slate-50 min-h-[500px] flex flex-col items-center text-center">
            {/* Header */}
            <h2 className="text-3xl md:text-4xl font-black font-display text-slate-900 mb-2 tracking-tight">
                MPPSC 2026 Test Series
            </h2>
            <p className="text-slate-500 mb-6 text-lg font-medium">
                {hi ? 'परीक्षा तक पूरी तैयारी' : 'Complete preparation until the exam'}
            </p>

            {/* Urgency banner — "first 100 users" */}
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-5 py-2 mb-10">
                <Users className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">
                    {hi ? 'पहले 100 छात्रों के लिए विशेष मूल्य' : 'Special pricing for first 100 students'}
                </span>
                <Clock className="w-4 h-4 text-amber-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
                {/* Lite Plan */}
                <div className="relative group h-full">
                    <Card className="border border-slate-200 shadow-sm h-full hover:shadow-md transition-all bg-white">
                        <CardContent className="p-8 flex flex-col h-full">
                            <div className="text-left mb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className="w-5 h-5 text-slate-600" />
                                    <h3 className="text-xl font-bold text-slate-900">Lite</h3>
                                </div>
                                <p className="text-sm text-slate-500 font-medium mb-4">
                                    {hi ? 'स्मार्ट शुरुआत' : 'Start Smart'}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm text-slate-400 line-through">₹299</span>
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">₹99</span>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                                        67% OFF
                                    </Badge>
                                    <span className="text-xs text-slate-400">
                                        {hi ? '~ ₹12/महीना • 8 महीने' : '~ ₹12/month • 8 months'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1.5">
                                    {hi ? 'एक बार भुगतान, प्रीलिम्स तक वैध' : 'One-time, valid till Prelims'}
                                </p>
                            </div>
                            <div className="w-full h-px bg-slate-100 mb-6" />

                            <ul className="space-y-4 mb-8 flex-1 text-left">
                                {liteFeatures.map((f) => (
                                    <li key={f.en} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>{hi ? f.hi : f.en}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => onUnlock(99)}
                                variant="outline"
                                className="w-full h-11 rounded-lg font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            >
                                {hi ? 'लाइट एक्सेस लें' : 'Get Lite Access'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Pro Plan — highlighted, pulse glow */}
                <div className="relative group h-full">
                    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 opacity-20 blur-sm animate-pulse" />

                    <Card className="border-2 border-slate-800 shadow-xl h-full relative overflow-hidden bg-white">
                        <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest">
                            {hi ? 'सबसे लोकप्रिय' : 'MOST POPULAR'}
                        </div>

                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="text-left mb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <Crown className="w-5 h-5 text-slate-800" />
                                    <h3 className="text-xl font-bold text-slate-800">Pro</h3>
                                </div>
                                <p className="text-sm text-slate-600 font-medium mb-4">
                                    {hi ? 'पूरी ताकत' : 'Full Power'}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm text-slate-400 line-through">₹999</span>
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">₹299</span>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                                        70% OFF
                                    </Badge>
                                    <span className="text-xs text-slate-400">
                                        {hi ? '~ ₹25/महीना • 12 महीने' : '~ ₹25/month • 12 months'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1.5">
                                    {hi ? 'एक बार भुगतान, मेन्स तक वैध' : 'One-time, valid till Mains'}
                                </p>
                            </div>
                            <div className="w-full h-px bg-slate-100 mb-6" />

                            <ul className="space-y-4 mb-8 flex-1 text-left">
                                {proFeatures.map((f, i) => (
                                    <li key={f.en} className={`flex items-center gap-3 text-sm text-slate-900 ${i === 0 ? 'font-bold' : 'font-medium'}`}>
                                        <CheckCircle2 className="w-5 h-5 text-slate-800 shrink-0" />
                                        <span>{hi ? f.hi : f.en}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => onUnlock(299)}
                                className="w-full h-11 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-md shadow-slate-300"
                            >
                                {hi ? 'प्रो एक्सेस लें' : 'Get Pro Access'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Trust signals */}
            <p className="text-xs text-slate-400 mt-8">
                Secure Payment • No Auto-Renewal • Instant Access
            </p>
        </div>
    );
}
