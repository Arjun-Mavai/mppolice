"use client";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏠 HOME PAGE PRICING — Dynamic from /api/pricing, same DB as /pricing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Admin changes prices in dashboard → reflects here instantly.
// All ₹ amounts are dynamic — no hardcoded prices.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { Star, Users, Flame, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from "@/components/ui/skeleton";
import { useSettingsStore } from '@/store/useSettingsStore';
import { type PricingData, LITE_FEATURES, PRO_FEATURES, PRICING_DEFAULTS } from '@/config/pricing';
import { PricingCard } from '@/components/PricingCard';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQuery } from '@tanstack/react-query';

interface PremiumMarketingProps {
    onUnlock: (amount: number) => void;
}

export function PremiumMarketing({ onUnlock }: PremiumMarketingProps) {
    const { language, user } = useSettingsStore();
    const hi = language === 'hi';
    const isLiteUser = user?.planTier === 'lite';

    // Dynamic pricing — fetch from backend, fallback to defaults
    const { data: p = PRICING_DEFAULTS, isLoading } = useQuery({
        queryKey: ['pricing'],
        queryFn: async () => {
            const res = await fetch('/api/pricing');
            if (!res.ok) throw new Error('Failed to fetch pricing');
            const data = await res.json();
            return data.pricing || PRICING_DEFAULTS;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });

    // Loading Skeleton State
    if (isLoading) {
        if (isLiteUser) {
            return (
                <div className="relative p-4 md:p-8 bg-slate-50 min-h-[500px] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                    <Skeleton className="h-6 w-32 mb-6 rounded-full" />
                    <Skeleton className="h-10 w-3/4 max-w-sm mb-4" />
                    <Skeleton className="h-4 w-full max-w-md mb-8" />
                    <Skeleton className="h-[200px] w-full max-w-md rounded-xl" />
                    <DialogPrimitive.Close className="absolute top-2 right-2 p-2">
                        <X className="w-6 h-6 text-slate-300" />
                    </DialogPrimitive.Close>
                </div>
            );
        }

        return (
            <div className="relative px-4 py-6 md:p-8 bg-slate-50 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                <Skeleton className="h-10 w-3/4 max-w-lg mb-4" />
                <Skeleton className="h-4 w-1/2 max-w-md mb-8" />
                
                <div className="flex justify-center mb-8">
                     <Skeleton className="h-8 w-48 rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl mx-auto">
                    <Skeleton className="h-[450px] w-full rounded-2xl" />
                    <Skeleton className="h-[450px] w-full rounded-2xl" />
                </div>
                
                 <DialogPrimitive.Close className="absolute top-0 right-0 p-2">
                    <X className="w-6 h-6 text-slate-300" />
                </DialogPrimitive.Close>
            </div>
        );
    }

    // Lite user ko Pro upgrade dikhao — dynamic price
    if (isLiteUser) {
        return (
            <div className="relative p-4 md:p-8 bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 min-h-[500px] flex flex-col items-center text-center justify-center">
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

                {/* Manual Dismiss - Top Right Icon */}
                <DialogPrimitive.Close className="absolute top-2 right-2 p-2 text-slate-900 border border-black bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm rounded-full transition-all hover:scale-110 z-50">
                    <X className="w-6 h-6" />
                </DialogPrimitive.Close>
            </div>
        );
    }

    return (
        <div className="relative px-4 py-6 md:p-8 bg-slate-50 flex flex-col items-center text-center">
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

            {/* Manual Dismiss - Top Right Icon */}
            <DialogPrimitive.Close className="absolute top-0 right-0 p-2 text-slate-900 border border-black bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm rounded-full transition-all hover:scale-110 z-50">
                <X className="w-6 h-6"  />
            </DialogPrimitive.Close>
        </div>
    );
}