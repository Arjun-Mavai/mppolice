"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Zap, Crown, Clock, Users, Flame, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { type PricingData, PRICING_DEFAULTS, LITE_FEATURES, PRO_FEATURES, calcDiscount, calcMonthly } from '@/config/pricing';
import { API } from '@/config/endpoints';
import { PricingCard } from '@/components/PricingCard';

export function PricingSection() {
    const { user: globalUser, language } = useSettingsStore();
    const router = useRouter();
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
                    <PricingCard 
                        planType="lite"
                        pricing={p}
                        features={LITE_FEATURES}
                        language={language}
                        onBuy={() => router.push('/pricing')}
                    />
                    <PricingCard 
                        planType="pro"
                        pricing={p}
                        features={PRO_FEATURES}
                        language={language}
                        onBuy={() => router.push('/pricing')}
                        isPopular
                    />
                </div>

                {/* Trust signals */}
                <div className="flex items-center justify-center gap-2 mt-8">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-400 font-medium">
                        {hi ? 'सुरक्षित भुगतान • कोई ऑटो-रिन्यूअल नहीं • RazorPay से एक्टिवेट' : 'Secure Payment • No Auto-Renewal • Activate via RazorPay'}
                    </p>
                </div>
            </div>
        </section>
    );
}
