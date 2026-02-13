"use client";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏠 HOME PAGE PRICING — Dynamic from /api/pricing, same DB as /pricing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Admin changes prices in dashboard → reflects here instantly.
// All ₹ amounts are dynamic — no hardcoded prices.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useState, useEffect } from 'react';
import { Star, Users, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { type PricingData, LITE_FEATURES, PRO_FEATURES, PRICING_DEFAULTS } from '@/config/pricing';
import { PricingCard } from '@/components/PricingCard';
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface PremiumMarketingProps {
    onUnlock: (amount: number) => void;
}

export function PremiumMarketing({ onUnlock }: PremiumMarketingProps) {
    const { language, user } = useSettingsStore();
    const hi = language === 'hi';
    const isLiteUser = user?.plan_tier === 'lite';

    // Dynamic pricing — fetch from backend, fallback to defaults
    const [p, setP] = useState<PricingData>(PRICING_DEFAULTS);
    useEffect(() => {
        fetch('/api/pricing').then(r => r.json()).then(d => {
            if (d.pricing) setP(d.pricing);
        }).catch(() => {/* defaults stay */});
    }, []);

    // Lite user ko Pro upgrade dikhao — dynamic price
    if (isLiteUser) {
        return (
            <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 min-h-[500px] flex flex-col items-center text-center justify-center">
                <Badge className="bg-amber-100 text-amber-700 px-3 py-1 mb-4 md:mb-6 hover:bg-amber-200 transition-colors cursor-default border-amber-200">
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
                        ? `प्रो प्लान पर अपग्रेड करें और अनलिमिटेड क्विज़, टेस्ट और स्मार्ट एनालिसिस अनलॉक करें। केवल ₹${p.upgradePrice} में।`
                        : `Upgrade to Pro and unlock Unlimited Quizzes, Tests, and Smart Analytics. Just pay the difference.`}
                </p>

                <div className="relative group w-full max-w-md">
                    <PricingCard
                        planType="upgrade"
                        pricing={p}
                        features={PRO_FEATURES.slice(1)}
                        language={language}
                        onBuy={() => onUnlock(p.upgradePrice)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-8 md:p-10 bg-slate-50 flex flex-col items-center text-center">
            {/* Header */}
            {/* Header */}
            <h2 className="text-2xl md:text-5xl font-black font-display text-slate-900 mb-3 tracking-tighter leading-tight uppercase">
                {hi ? 'अपना MPPSC सफलता प्लान चुनें' : 'Choose Your MPPSC Success Plan'}
            </h2>
            <p className="text-sm md:text-lg text-slate-500 font-medium max-w-lg mx-auto mb-6 px-4">
                 {hi ? 'छात्रों के साथ स्मार्ट तैयारी करें' : 'Join aspirants who are preparing smarter'}
            </p>

            {/* FOMO — first 100 students with joined count badge */}
            <div className="flex justify-center mb-8">
                <div className="relative inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
                    <Flame className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs font-semibold text-amber-800">
                        {hi ? p.urgencyTextHi : p.urgencyText}
                    </span>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold px-1.5 py-0 h-5 hover:bg-emerald-100">
                        <Users className="w-2.5 h-2.5 mr-0.5" />
                        {p.studentsBought} joined
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl mx-auto px-0 md:px-4">
                <PricingCard
                    planType="lite"
                    pricing={p}
                    features={LITE_FEATURES}
                    language={language}
                    onBuy={() => onUnlock(p.litePrice)}
                />
                <PricingCard
                    planType="pro"
                    pricing={p}
                    features={PRO_FEATURES}
                    language={language}
                    onBuy={() => onUnlock(p.proPrice)}
                    isPopular
                />
            </div>

            {/* Trust signals */}
            <p className="text-xs text-slate-400 mt-8">
                {hi ? 'सुरक्षित भुगतान • कोई ऑटो-रिन्यूअल नहीं • RazorPay से एक्टिवेट' : 'Secure Payment • No Auto-Renewal • Activate via RazorPay'}
            </p>

            {/* Manual Dismiss */}
            <DialogPrimitive.Close className=" md:hidden mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer pb-4">
                {hi ? 'बंद करें' : 'Close'}
            </DialogPrimitive.Close>
        </div>
    );
}
