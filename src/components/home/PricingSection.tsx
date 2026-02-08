"use client";

/**
 * PricingSection — Pricing wrapper bhai!
 * Yeh section sirf non-subscribed users ko dikhta hai.
 * PremiumMarketing component ko wrap karta hai with proper styling.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { PremiumMarketing } from '@/components/PremiumMarketing';
import { useSettingsStore } from '@/store/useSettingsStore';

export function PricingSection() {
    const router = useRouter();
    const { user: globalUser } = useSettingsStore();

   const handleUnlock = (amount: number) => {
      router.push(`/payment?amount=${amount}`);
  };

    if ((globalUser as any)?.is_subscribed) return null;

    return (
        <section id="pricing" className="py-24 bg-slate-50 relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            <div className="max-w-5xl mx-auto px-4">
                <PremiumMarketing onUnlock={handleUnlock} />
            </div>
        </section>
    );
}
