'use client';

import React from 'react';
import {
  CheckCircle2,
  Zap,
  Crown,
  Clock,
  Star,
  BadgeCheck,
  LucideIcon,
  Sparkles,
  Target,
  BookOpen,
  BarChart3,
  FileText,
  History,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type PricingData, calcDiscount, calcMonthly, PlanFeatureWithIcon } from '@/config/pricing';
import Link from 'next/link';
import { motion } from 'framer-motion';

const ICON_MAP: Record<string, LucideIcon> = {
  Target,
  BookOpen,
  Sparkles,
  FileText,
  Clock,
  Zap,
  BarChart3,
  History,
  CheckCircle2,
  Star,
  BadgeCheck,
};

interface PricingCardProps {
  planType: 'lite' | 'pro' | 'upgrade';
  pricing: PricingData;
  features: PlanFeatureWithIcon[];
  language: 'en' | 'hi';
  onBuy: () => void;
  isPopular?: boolean;
  href?: string;
}

export function PricingCard({
  planType,
  pricing,
  features,
  language,
  onBuy,
  isPopular,
  href,
}: PricingCardProps) {
  const hi = language === 'hi';
  const p = pricing;

  // Calculate dynamic values
  const isLite = planType === 'lite';
  const isPro = planType === 'pro';
  const isUpgrade = planType === 'upgrade';

  const price = isLite ? p.litePrice : isPro ? p.proPrice : p.upgradePrice;
  const originalPrice = isLite
    ? p.liteOriginalPrice
    : isPro
      ? p.proOriginalPrice
      : p.upgradeOriginalPrice;
  const discount = calcDiscount(price, originalPrice);
  const months = isLite ? p.liteMonths : isPro ? p.proMonths : 1; // months only relevant for full plans
  const monthly = calcMonthly(price, months);
  const validityText = isLite ? p.liteValidityText : p.proValidityText;

  // Card Specific Styling
  const cardClasses = cn(
    'relative flex flex-col h-full transition-all duration-300',
    isPro || isUpgrade
      ? 'border-2 border-amber-500 shadow-[0_20px_50px_rgba(245,158,11,0.15)] overflow-hidden scale-[1.02] z-10'
      : 'border border-amber-100 shadow-sm hover:shadow-md'
  );

  const titleIcon = isLite ? (
    <Zap className="h-5 w-5 text-amber-500" />
  ) : isPro ? (
    <Crown className="h-5 w-5 text-amber-600" />
  ) : (
    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
  );
  const title = isLite ? 'Lite' : isPro ? 'MP Police 2026 — पूरा एक्सेस' : 'प्रो में अपग्रेड करें';
  const subtitle = isLite
    ? 'स्मार्ट शुरुआत — MP Police 2026'
    : isPro
      ? 'एक बार भुगतान • परीक्षा तक एक्सेस'
      : 'लाइट से प्रो — सिर्फ़ अंतर भरें';

  return (
    <div className="group relative h-full">
      {/* Pro/Upgrade Glow Effect */}
      {(isPro || isUpgrade) && (
        <div className="absolute -inset-0.5 animate-pulse rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 opacity-20 blur-md" />
      )}

      <Card className={cn(cardClasses, 'bg-white')}>
        {/* Most Popular Badge */}
        {isPopular && isPro && (
          <div className="absolute top-0 right-0 z-20 rounded-bl-lg bg-amber-600 px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase">
            सबसे लोकप्रिय
          </div>
        )}
        {isUpgrade && (
          <div className="absolute top-0 right-0 z-20 rounded-bl-lg bg-orange-600 px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase">
            खास ऑफर
          </div>
        )}

        <CardContent className="relative z-10 flex h-full flex-col p-6 md:p-8">
          {/* Header Block */}
          <div className="mb-5">
            <div className="mb-1 flex items-center gap-2">
              {titleIcon}
              <h3
                className={cn(
                  'text-xl font-bold',
                  isPro || isUpgrade ? 'text-amber-900' : 'text-slate-900'
                )}
              >
                {title}
              </h3>
              {isLite && (
                <Badge className="border-orange-200 bg-orange-100 px-2 py-0.5 text-[10px] font-black text-orange-700">
                  LIMITED
                </Badge>
              )}
            </div>
            <p
              className={cn(
                'text-sm font-medium',
                isPro || isUpgrade ? 'text-amber-700/80' : 'text-slate-500'
              )}
            >
              {subtitle}
            </p>
          </div>

          {/* Price Block */}
          <div className="mb-5">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-slate-400 line-through">₹{originalPrice}</span>
              <span className="text-4xl font-black tracking-tighter text-slate-900">₹{price}</span>
              {isUpgrade && (
                <Badge className="ml-2 border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700">
                  बचत ₹{originalPrice - price}
                </Badge>
              )}
            </div>

            {!isUpgrade && (
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge className="border-amber-200 bg-amber-50 text-xs font-bold text-amber-700">
                    🔥 एक बार भुगतान
                  </Badge>
                  <Badge className="border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700">
                    🕒 परीक्षा तक वैध
                  </Badge>
                </div>
                <span className="relative inline-flex items-center self-start mt-1">
                  <span className="absolute inset-[-2] rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-green-500 p-[1.5px]" />
                  <span className="relative rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-800">
                    ₹{Math.ceil(price / (months * 4.33))} से भी कम प्रति सप्ताह
                  </span>
                </span>
              </div>
            )}

            {/* {(isPro || isUpgrade) && !isUpgrade && (
                             <div className="mt-2">
                                <span className="relative inline-flex items-center">
                                    <span className="absolute inset-[-2] rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-green-500 p-[1.5px]" />
                                    <span className="relative bg-white text-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                        {hi ? `सिर्फ ₹${p.proPrice - p.litePrice} ज़्यादा` : `just ₹${p.proPrice - p.litePrice} more than Lite`}
                                    </span>
                                </span>
                            </div>
                        )} */}

            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="h-3 w-3" />
              एक बार भुगतान
            </p>
          </div>

          <div className="mb-5 h-px w-full bg-slate-100" />

          {/* Features List */}
          <ul className="mb-8 flex-1 space-y-3.5 text-left">
            {features.map((f, i) => {
              const IconComp = ICON_MAP[f.icon || ''] || CheckCircle2;
              return (
                <li
                  key={f.en}
                  className={cn(
                    'flex items-start gap-3 text-sm font-medium',
                    isPro || isUpgrade ? 'text-slate-900' : 'text-slate-700',
                    isPro && i === 0 && 'font-bold'
                  )}
                >
                  <IconComp
                    className={cn(
                      'mt-0.5 h-4.5 w-4.5 shrink-0',
                      isLite ? 'text-amber-500' : 'text-amber-600'
                    )}
                  />
                  <span>{f.hi}</span>
                </li>
              );
            })}
            {/* Validity Item if not in features already */}
            {!isUpgrade && (
              <li
                className={cn(
                  'flex items-start gap-3 text-sm font-medium',
                  isPro || isUpgrade ? 'text-slate-900' : 'text-slate-700'
                )}
              >
                <Clock
                  className={cn(
                    'mt-0.5 h-4.5 w-4.5 shrink-0',
                    isLite ? 'text-blue-500' : 'text-amber-600'
                  )}
                />
                <span>
                  MP Police 2026 परीक्षा तक वैध
                </span>
              </li>
            )}
          </ul>

          {/* Action Button */}
          {href ? (
            <motion.div whileTap={{ scale: 0.96 }} className="w-full">
              <Button
                asChild
                variant={isLite ? 'outline' : 'default'}
                className={cn(
                  'h-12 w-full rounded-xl font-bold transition-all',
                  isLite &&
                    'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900',
                  (isPro || isUpgrade) &&
                    'bg-slate-950 text-white shadow-lg shadow-amber-900/20 hover:bg-black border border-amber-500/30'
                )}
              >
                <Link href={href} prefetch={true}>
                  {isLite
                    ? `₹${price} में लाइट लें`
                    : isUpgrade
                      ? `⚡ ₹${price} में अपग्रेड करें`
                      : `⚡ ₹${price} में एक्सेस अनलॉक करें`}
                </Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div whileTap={{ scale: 0.96 }} className="w-full">
              <Button
                onClick={onBuy}
                variant={isLite ? 'outline' : 'default'}
                className={cn(
                  'h-12 w-full rounded-xl font-bold transition-all',
                  isLite &&
                    'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900',
                  (isPro || isUpgrade) &&
                    'bg-slate-950 text-white shadow-lg shadow-amber-900/20 hover:bg-black border border-amber-500/30'
                )}
              >
                {isLite
                    ? `₹${price} में लाइट लें`
                    : isUpgrade
                      ? `⚡ ₹${price} में अपग्रेड करें`
                      : `⚡ ₹${price} में एक्सेस अनलॉक करें`}
              </Button>
            </motion.div>
          )}

          {/* Kis Baat Ke info box */}
          {(isPro || isUpgrade) && (
            <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-100 text-left">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Exam Tak Yaad Rahe, Isi Liye.</h4>
              <p className="text-xs font-medium text-slate-500 mb-3">
                PDF के लिए नहीं। Notes के लिए नहीं। मोटिवेशन के लिए नहीं।<br/>इसके लिए:
              </p>
              <ul className="space-y-1.5 text-[11px] font-medium text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> तेज़ी से रिवीज़न</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> बेहतर याददाश्त</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> ज़्यादा अभ्यास</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> परीक्षा के लिए पूरी तैयारी</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
