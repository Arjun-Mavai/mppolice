"use client";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 PRICING PAGE — Dynamic prices from backend, marketing-optimized
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// All prices fetched from /api/pricing → admin changes reflect instantly.
// Designed as a lead-gen conversion page:
//   - Urgency banner (FOMO)
//   - Clear "what you get" breakdown
//   - Validity tied to exam dates (Prelims/Mains)
//   - Bilingual (EN/HI)
//   - Trust signals + FAQ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Star, ChevronDown, Shield, Zap, Crown, ArrowLeft, Clock, Users, Sparkles, Target, BookOpen, BarChart3, FileText, Flame, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { type PricingData, PRICING_DEFAULTS, LITE_FEATURES, PRO_FEATURES, calcDiscount, calcMonthly } from '@/config/pricing';
import { API } from '@/config/endpoints';
import { PaymentModal } from '@/components/payment/PaymentModal';

import { AppNavbar } from '@/components/layout/AppNavbar';

// ── FAQ data — bilingual ────────────────────────────────────
const faqData = [
  {
    q: { en: 'What happens after I pay?', hi: 'पेमेंट के बाद क्या होगा?' },
    a: {
      en: 'Send payment screenshot on WhatsApp and your plan gets activated within minutes. Simple and quick!',
      hi: 'WhatsApp पर पेमेंट स्क्रीनशॉट भेजें और आपका प्लान मिनटों में एक्टिव हो जाएगा। सरल और तेज़!',
    },
  },
  {
    q: { en: 'Is there a refund policy?', hi: 'क्या रिफंड मिलेगा?' },
    a: {
      en: 'Since this is digital content with instant access, refunds are not available once access is granted.',
      hi: 'यह डिजिटल कंटेंट है और एक्सेस तुरंत मिलता है, इसलिए एक्सेस मिलने के बाद रिफंड उपलब्ध नहीं है।',
    },
  },
  {
    q: { en: 'Can I upgrade from Lite to Pro?', hi: 'क्या लाइट से प्रो में अपग्रेड कर सकते हैं?' },
    a: {
      en: 'Yes! Pay just the difference to upgrade from Lite to Pro anytime.',
      hi: 'हाँ! सिर्फ़ अंतर भरें और कभी भी लाइट से प्रो में अपग्रेड करें।',
    },
  },
  {
    q: { en: 'How long is my access valid?', hi: 'मेरा एक्सेस कब तक वैध रहेगा?' },
    a: {
      en: 'Lite is valid till MPPSC 2026 Prelims. Pro is valid till MPPSC 2026 Mains.',
      hi: 'लाइट MPPSC 2026 प्रीलिम्स तक और प्रो MPPSC 2026 मेन्स तक वैध है।',
    },
  },
  {
    q: { en: 'What if the exam is delayed?', hi: 'अगर परीक्षा में देरी हुई तो?' },
    a: {
      en: 'If MPPSC delays the exam, we will extend your access accordingly. No extra charge.',
      hi: 'अगर MPPSC परीक्षा में देरी करता है, तो हम आपका एक्सेस उसी हिसाब से बढ़ा देंगे। कोई अतिरिक्त शुल्क नहीं।',
    },
  },
];

// ── Feature lists from centralized config ───────────────
// Icon mapping for pricing page
const ICON_MAP: Record<string, any> = { Target, BookOpen, Sparkles, FileText, Clock, Zap, BarChart3, History };

const liteFeatures = LITE_FEATURES.map(f => ({ ...f, icon: ICON_MAP[f.icon || ''] || Target }));
const proFeatures = PRO_FEATURES.map(f => ({ ...f, icon: ICON_MAP[f.icon || ''] || Target }));

// ── Pricing data from centralized config ────────────────

// ── FAQ Accordion Item ──────────────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group cursor-pointer"
      >
        <span className="text-sm md:text-base font-semibold text-slate-800 pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-200 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="text-sm text-slate-600 pb-5 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}


// ... (existing imports)

export default function PricingPage() {
  const { language, user } = useSettingsStore();
  const hi = language === 'hi';
  const router = useRouter();
  const planTier = user?.plan_tier ?? 'free';
  const isProUser = planTier === 'pro';
  const isLiteUser = planTier === 'lite';
  const isLoggedIn = !!user;

  // Logged-in users ko pricing nahi dikhana — redirect to quiz
  useEffect(() => {
    if (isLoggedIn && !isLiteUser) {
      router.replace('/syllabus/quiz');
    }
  }, [isLoggedIn, isLiteUser, router]);

  // ── Fetch dynamic pricing from API ────────────────────────
  const [p, setP] = useState<PricingData>(PRICING_DEFAULTS);
  useEffect(() => {
    fetch(API.PRICING).then(r => r.json()).then(d => {
      if (d.pricing) setP(d.pricing);
    }).catch(() => {/* defaults stay */});
  }, []);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ planType: 'pro' as 'lite' | 'pro' | 'upgrade', name: '' });

  const handleBuy = (plan: 'lite' | 'pro' | 'upgrade') => {
    if (plan === 'lite') {
      setSelectedPlan({ planType: 'lite', name: `Lite Plan — ₹${p.litePrice}` });
    } else if (plan === 'pro') {
      setSelectedPlan({ planType: 'pro', name: `Pro Plan — ₹${p.proPrice}` });
    } else if (plan === 'upgrade') {
      setSelectedPlan({ planType: 'upgrade', name: `Pro Upgrade — ₹${p.upgradePrice}` });
    }
    setShowPaymentModal(true);
  };

  // Calculated values
  const liteDiscount = calcDiscount(p.litePrice, p.liteOriginalPrice);
  const proDiscount = calcDiscount(p.proPrice, p.proOriginalPrice);
  const liteMonthly = calcMonthly(p.litePrice, p.liteMonths);
  const proMonthly = calcMonthly(p.proPrice, p.proMonths);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-slate-100 selection:text-slate-900">

      {/* Common header — same navbar as rest of the app */}
      <AppNavbar user={null} />

      {/* ── Hero Header ──────────────────────────────────── */}
      <section className="pt-24 pb-4 md:pt-28 md:pb-6 text-center px-4">
        <Badge className="bg-slate-100 text-slate-700 border-slate-200 px-4 py-1.5 mb-5 hover:bg-slate-200 transition-colors cursor-default text-xs font-semibold tracking-wide">
          MPPSC 2026
        </Badge>
        <h1 className="text-3xl md:text-5xl font-black font-display text-slate-900 tracking-tight mb-3 leading-tight">
          {hi ? 'अपना MPPSC सफलता प्लान चुनें' : 'Choose Your MPPSC Success Plan'}
        </h1>
        <p className="text-base md:text-lg text-slate-500 font-medium max-w-lg mx-auto mb-1">
          {hi ? '500+ छात्रों के साथ स्मार्ट तैयारी करें' : 'Join 500+ aspirants preparing smarter'}
        </p>
      </section>

      {/* ── Pro user gets redirected by useEffect above ────── */}

      {/* ── Lite user — upgrade to Pro card ──────────────── */}
      {isLiteUser && (
        <section className="px-4 pb-8">
          <div className="max-w-lg mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 opacity-20 blur-sm animate-pulse" />
              <Card className="border-2 border-slate-800 shadow-2xl relative overflow-hidden bg-white">
                <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-lg uppercase tracking-widest">
                  {hi ? 'खास ऑफर' : 'SPECIAL OFFER'}
                </div>
                <CardContent className="p-6 md:p-8 flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <h3 className="text-xl font-bold text-slate-900">
                      {hi ? 'प्रो में अपग्रेड करें' : 'Upgrade to Pro'}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    {hi ? 'लाइट से प्रो — सिर्फ़ अंतर भरें' : 'Lite → Pro — Just pay the difference'}
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-black text-slate-900">₹{p.upgradePrice}</span>
                    <span className="text-sm text-slate-400 line-through">₹{p.upgradeOriginalPrice}</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold ml-2">
                      {hi ? `बचत ₹${p.upgradeOriginalPrice - p.upgradePrice}` : `SAVE ₹${p.upgradeOriginalPrice - p.upgradePrice}`}
                    </Badge>
                  </div>
                  <div className="w-full h-px bg-slate-100 mb-4" />
                  <ul className="space-y-3 mb-6 text-left">
                    {proFeatures.slice(1).map((f) => (
                      <li key={f.en} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                        <CheckCircle2 className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
                        <span>{hi ? f.hi : f.en}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => handleBuy('upgrade')}
                    className="w-full h-12 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-lg shadow-slate-300 transition-all">
                    {hi ? `₹${p.upgradePrice} में प्रो लें` : `Upgrade to Pro — ₹${p.upgradePrice}`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* ── Free users — both plans ──────────────────────── */}
      {!isProUser && (
        <section className="px-4 pb-16">

          {/* Urgency banner — FOMO with dynamic student count */}
          {/* <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 md:px-5 md:py-2.5 animate-pulse">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="text-xs md:text-sm font-semibold text-amber-800">
                {hi
                  ? `🔥 ${p.studentsBought || PRICING_DEFAULTS.studentsBought} छात्रों ने पहले ही ले लिया • सीमित सीटें`
                  : `🔥 ${p.studentsBought || PRICING_DEFAULTS.studentsBought} students already joined • Limited seats`}
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            
          </div> */}


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
                                  </Badge>.   
                              </div>
                          </div>

          {/* ── What You Get Section ─────────────────────── */}
          <div className="max-w-4xl mx-auto mb-10">
            <h2 className="text-center text-lg md:text-xl font-bold text-slate-800 mb-6">
              {hi ? 'आपको क्या मिलता है?' : 'What do you get?'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { icon: Target, label: hi ? '1000+ प्रश्न' : '1000+ Questions', sub: hi ? 'टॉपिक वाइज़' : 'Topic-wise' },
                { icon: FileText, label: hi ? 'फुल मॉक टेस्ट' : 'Full Mock Tests', sub: hi ? '100 प्रश्न प्रत्येक' : '100Q each' },
                { icon: BarChart3, label: hi ? 'स्मार्ट एनालिटिक्स' : 'Smart Analytics', sub: hi ? 'कमज़ोर टॉपिक पहचानो' : 'Find weak areas' },
                { icon: Sparkles, label: hi ? 'AI एक्सप्लेनेशन' : 'AI Explanations', sub: hi ? 'हर प्रश्न का' : 'Every question' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <Icon className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">{label}</p>
                  <p className="text-[11px] text-slate-500">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Pricing Cards ────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 w-full max-w-4xl mx-auto">

            {/* ── Lite Plan Card ─────────────────────────── */}
            <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white h-full">
              <CardContent className="p-6 md:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-slate-900">Lite</h3>
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] font-black px-2 py-0.5 animate-pulse">
                      LIMITED
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    {hi ? 'स्मार्ट शुरुआत — प्रीलिम्स तक' : 'Smart start — till Prelims'}
                  </p>
                </div>

                {/* Price block */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-slate-400 line-through">₹{p.liteOriginalPrice}</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{p.litePrice}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                      {liteDiscount}% OFF
                    </Badge>
                    {/* Monthly breakdown badge — red/pink/green gradient border */}
                    <span className="relative inline-flex items-center">
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-green-500 p-[1.5px]" />
                      <span className="relative bg-black text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        ₹{liteMonthly}/mo
                      </span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {hi ? `एक बार भुगतान • ${p.liteValidityText}` : `One-time payment • ${p.liteValidityText}`}
                  </p>
                </div>

                <div className="w-full h-px bg-slate-100 mb-5" />

                <ul className="space-y-3.5 mb-6 flex-1 text-left">
                  {liteFeatures.map((f) => {
                    const Icon = f.icon;
                    return (
                      <li key={f.en} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                        <Icon className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                        <span>{hi ? f.hi : f.en}</span>
                      </li>
                    );
                  })}
                  <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                    <Clock className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{hi ? 'MPPSC 2026 प्रीलिम्स तक वैध' : p.liteValidityText}</span>
                  </li>
                </ul>

                <Button 
                  onClick={() => handleBuy('lite')}
                  variant="outline" className="w-full h-12 rounded-xl font-bold border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 transition-all">
                  {hi ? `₹${p.litePrice} में लाइट लें` : `Get Lite — ₹${p.litePrice}`}
                </Button>
              </CardContent>
            </Card>

            {/* ── Pro Plan Card — highlighted ─────────────── */}
            <div className="relative h-full">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 opacity-15 blur-sm animate-pulse" />
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

                  {/* Price block */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-slate-400 line-through">₹{p.proOriginalPrice}</span>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{p.proPrice}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                        {proDiscount}% OFF
                      </Badge>
                      {/* Monthly breakdown badge — gradient border */}
                      <span className="relative inline-flex items-center">
                        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-green-500 p-[1.5px]" />
                        <span className="relative bg-black text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          ₹{proMonthly}/mo
                        </span>
                      </span>
                    </div>
                    {/* "Just ₹X more" badge below Pro price */}
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
                      {hi ? `एक बार भुगतान • ${p.proValidityText}` : `One-time payment • ${p.proValidityText}`}
                    </p>
                  </div>

                  <div className="w-full h-px bg-slate-100 mb-5" />

                  <ul className="space-y-3.5 mb-6 flex-1 text-left">
                    {proFeatures.map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <li key={f.en} className={`flex items-start gap-3 text-sm text-slate-900 ${i === 0 ? 'font-bold' : 'font-medium'}`}>
                          <Icon className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{hi ? f.hi : f.en}</span>
                        </li>
                      );
                    })}
                    <li className="flex items-start gap-3 text-sm text-slate-900 font-medium">
                      <Clock className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{hi ? 'MPPSC 2026 मेन्स तक वैध' : p.proValidityText}</span>
                    </li>
                  </ul>

                  <Button 
                    onClick={() => handleBuy('pro')}
                    className="w-full h-12 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-lg shadow-slate-300 transition-all">
                    {hi ? `₹${p.proPrice} में प्रो लें` : `Get Pro — ₹${p.proPrice}`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Comparison note ───────────────────────────── */}
          <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 md:p-6 border border-slate-200">
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-center md:text-left">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 mb-1">
                    {hi ? '💡 Pro में क्या extra मिलता है?' : '💡 What extra do you get in Pro?'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {hi
                      ? 'Unlimited tests, FLTs, CSAT, PYQ papers + Mains तक validity. Serious aspirants के लिए Pro best value है।'
                      : 'Unlimited tests, FLTs, CSAT, PYQ papers + validity till Mains. Best value for serious aspirants.'}
                  </p>
                </div>
                <div className="text-sm font-bold text-slate-600 whitespace-nowrap">
                  {hi ? `सिर्फ ₹${p.proPrice - p.litePrice} ज़्यादा` : `Just ₹${p.proPrice - p.litePrice} more`}
                </div>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <Shield className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-400 font-medium">
              {hi
                ? 'सुरक्षित भुगतान • कोई ऑटो-रिन्यूअल नहीं • WhatsApp से एक्टिवेट'
                : 'Secure Payment • No Auto-Renewal • Activate via WhatsApp'}
            </p>
          </div>
        </section>
      )}

      {/* ── FAQ Section ──────────────────────────────────── */}
      <section className="px-4 pb-20 pt-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-slate-900 text-center mb-12">
            {hi ? 'अक्सर पूछे जाने वाले सवाल' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {faqData.map((item, i) => (
              <FaqItem
                key={i}
                question={hi ? item.q.hi : item.q.en}
                answer={hi ? item.a.hi : item.a.en}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Payment Modal Integration */}
      <PaymentModal 
        open={showPaymentModal} 
        onOpenChange={setShowPaymentModal}
        planType={selectedPlan.planType}
        planName={selectedPlan.name}
      />
    </div>
  );
} 
