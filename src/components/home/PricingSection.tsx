"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Zap, Crown, Clock, Users, Flame, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { type PricingData, PRICING_DEFAULTS, LITE_FEATURES, PRO_FEATURES, calcDiscount, calcMonthly } from '@/config/pricing';
import { API } from '@/config/endpoints';

export function PricingSection() {
    const { user: globalUser, language } = useSettingsStore();
    const hi = language === 'hi';

    if ((globalUser as any)?.is_subscribed) return null;

    const [p, setP] = useState<PricingData>(PRICING_DEFAULTS);
    useEffect(() => {
        fetch(API.PRICING).then(r => r.json()).then(d => {
            if (d.pricing) setP(d.pricing);
        }).catch(() => {});
    }, []);

    const liteDiscount = calcDiscount(p.litePrice, p.liteOriginalPrice);
    const proDiscount = calcDiscount(p.proPrice, p.proOriginalPrice);
    const liteMonthly = calcMonthly(p.litePrice, p.liteMonths);
    const proMonthly = calcMonthly(p.proPrice, p.proMonths);

    return (
        <section id="pricing" className="py-12 sm:py-20 bg-slate-50 relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center tracking-tight mb-2">
                    {hi ? 'अपना प्लान चुनें' : 'Choose Your Plan'}
                </h2>
                <p className="text-sm text-slate-500 font-medium text-center mb-4">
                    {hi ? 'परीक्षा तक पूरी तैयारी' : 'Complete preparation until the exam'}
                </p>

                {/* FOMO badge - "first 100 students" with joined count */}
                <div className="flex justify-center mb-8">
                    <div className="relative inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
                        <Flame className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-xs font-semibold text-amber-800">
                            {hi ? p.urgencyTextHi : p.urgencyText}
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold px-1.5 py-0 h-5 hover:bg-emerald-100">
                            <Users className="w-2.5 h-2.5 mr-0.5" />
                            {p.studentsBought || PRICING_DEFAULTS.studentsBought} joined
                        </Badge>
                    </div>
                </div>

                {/* Pricing Cards — same as /pricing page */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                    {/* Lite Plan */}
                    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white h-full">
                        <CardContent className="p-6 md:p-8 flex flex-col h-full">
                            <div className="mb-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-xl font-bold text-slate-900">Lite</h3>
                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] font-black px-2 py-0.5">
                                        LIMITED
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-500 font-medium">
                                    {hi ? 'स्मार्ट शुरुआत — प्रीलिम्स तक' : 'Smart start — till Prelims'}
                                </p>
                            </div>
                            <div className="mb-5">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm text-slate-400 line-through">₹{p.liteOriginalPrice}</span>
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{p.litePrice}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                                        {liteDiscount}% OFF
                                    </Badge>
                                    <span className="relative inline-flex items-center">
                                        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-green-500 p-[1.5px]" />
                                        <span className="relative bg-black text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                            ₹{liteMonthly}/mo
                                        </span>
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {hi ? `एक बार भुगतान • ${p.liteValidityText}` : `One-time • ${p.liteValidityText}`}
                                </p>
                            </div>
                            <div className="w-full h-px bg-slate-100 mb-5" />
                            <ul className="space-y-3 mb-6 flex-1 text-left">
                                {LITE_FEATURES.map((f) => (
                                    <li key={f.en} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                        <span>{hi ? f.hi : f.en}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/pricing" className="w-full">
                                <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                                    {hi ? `₹${p.litePrice} में लाइट लें` : `Get Lite — ₹${p.litePrice}`}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Pro Plan */}
                    <div className="relative h-full">
                        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 opacity-15 blur-sm" />
                        <Card className="border-2 border-slate-800 shadow-xl h-full relative overflow-hidden bg-white">
                            <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-lg uppercase tracking-widest">
                                {hi ? 'सबसे लोकप्रिय' : 'MOST POPULAR'}
                            </div>
                            <CardContent className="p-6 md:p-8 flex flex-col h-full relative z-10">
                                <div className="mb-5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Crown className="w-5 h-5 text-amber-600" />
                                        <h3 className="text-xl font-bold text-slate-800">Pro</h3>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium">
                                        {hi ? 'पूरी ताकत — मेन्स तक' : 'Full power — till Mains'}
                                    </p>
                                </div>
                                <div className="mb-5">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm text-slate-400 line-through">₹{p.proOriginalPrice}</span>
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{p.proPrice}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                                            {proDiscount}% OFF
                                        </Badge>
                                        <span className="relative inline-flex items-center">
                                            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-green-500 p-[1.5px]" />
                                            <span className="relative bg-black text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                                ₹{proMonthly}/mo
                                            </span>
                                        </span>
                                    </div>
                                    <div className="mt-2">
                                        <span className="relative inline-flex items-center">
                                            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-green-500 p-[1.5px]" />
                                            <span className="relative bg-white text-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                                {hi ? `सिर्फ ₹${p.proPrice - p.litePrice} ज़्यादा` : `just ₹${p.proPrice - p.litePrice} more than Lite`}
                                            </span>
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {hi ? `एक बार भुगतान • ${p.proValidityText}` : `One-time • ${p.proValidityText}`}
                                    </p>
                                </div>
                                <div className="w-full h-px bg-slate-100 mb-5" />
                                <ul className="space-y-3 mb-6 flex-1 text-left">
                                    {PRO_FEATURES.map((f, i) => (
                                        <li key={f.en} className={`flex items-start gap-3 text-sm text-slate-900 ${i === 0 ? 'font-bold' : 'font-medium'}`}>
                                            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <span>{hi ? f.hi : f.en}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/pricing" className="w-full">
                                    <Button className="w-full h-12 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-lg shadow-slate-300">
                                        {hi ? `₹${p.proPrice} में प्रो लें` : `Get Pro — ₹${p.proPrice}`}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Trust signals */}
                <div className="flex items-center justify-center gap-2 mt-8">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-400 font-medium">
                        {hi ? 'सुरक्षित भुगतान • कोई ऑटो-रिन्यूअल नहीं • WhatsApp से एक्टिवेट' : 'Secure Payment • No Auto-Renewal • Activate via WhatsApp'}
                    </p>
                </div>
            </div>
        </section>
    );
}
