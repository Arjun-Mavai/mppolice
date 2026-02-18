'use client';

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
import {
  ChevronDown,
  Shield,
  Zap,
  Clock,
  Users,
  Sparkles,
  Target,
  BookOpen,
  BarChart3,
  FileText,
  Flame,
  History,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PRICING_DEFAULTS, LITE_FEATURES, PRO_FEATURES } from '@/config/pricing';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { PricingCard } from '@/components/PricingCard';
import { getPricingData } from '@/actions/pricing-actions';
import { useQuery } from '@tanstack/react-query';

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
const ICON_MAP: Record<string, any> = {
  Target,
  BookOpen,
  Sparkles,
  FileText,
  Clock,
  Zap,
  BarChart3,
  History,
};

// const liteFeatures = LITE_FEATURES.map((f) => ({ ...f, icon: ICON_MAP[f.icon || ''] || Target }));
const proFeatures = PRO_FEATURES.map((f) => ({ ...f, icon: ICON_MAP[f.icon || ''] || Target }));

// ── Pricing data from centralized config ────────────────

// ── FAQ Accordion Item ──────────────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full cursor-pointer items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-sm font-semibold text-slate-800 md:text-base">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-sm leading-relaxed text-slate-600">{answer}</p>
        </div>
      </div>
    </div>
  );
}

// ... (existing imports)

export default function PricingPage() {
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({
    planType: 'pro' as 'lite' | 'pro' | 'upgrade',
    name: '',
  });

  const { language, user } = useSettingsStore();
  const hi = language === 'hi';
  const router = useRouter();
  const planTier = user?.planTier ?? 'free';
  const isProUser = planTier === 'pro';
  const isLiteUser = planTier === 'lite';

  // 🔒 Fetch pricing with React Query + Server Action
  const { data: pricingData, isLoading } = useQuery({
    queryKey: ['pricing'],
    queryFn: async () => await getPricingData(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const p = pricingData?.pricing || PRICING_DEFAULTS;

  // Pro users ko pricing page bilkul na dikhao — redirect to quiz
  useEffect(() => {
    if (isProUser) {
      router.replace('/syllabus/quiz/pyq');
    }
  }, [isProUser, router]);

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

  // 🦴 SKELETON LOADING STATE (Correct Placement)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 space-y-4 text-center">
            <Skeleton className="mx-auto h-8 w-48 rounded-full" />
            <Skeleton className="mx-auto h-12 w-3/4 max-w-lg rounded-xl" />
            <Skeleton className="mx-auto h-6 w-1/2 max-w-md rounded-lg" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="h-[600px] w-full animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-[600px] w-full animate-pulse rounded-3xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-slate-100 selection:text-slate-900">
      {/* ── Hero Header ──────────────────────────────────── */}
      <section className="px-4 pt-24 pb-4 text-center md:pt-28 md:pb-6">
        <Badge className="mb-5 cursor-default border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-700 transition-colors hover:bg-slate-200">
          MPPSC 2026
        </Badge>
        <h1 className="font-display mb-3 text-3xl leading-tight font-black tracking-tight text-slate-900 md:text-5xl">
          {hi ? 'अपना MPPSC सफलता प्लान चुनें' : 'Choose Your MPPSC Success Plan'}
        </h1>
        <p className="mx-auto mb-1 max-w-lg text-base font-medium text-slate-500 md:text-lg">
          {hi ? 'छात्रों के साथ स्मार्ट तैयारी करें' : 'Join aspirants who are preparing smarter'}
        </p>
      </section>

      {/* ── Pro user gets redirected by useEffect above ────── */}

      {/* ── Lite user — upgrade to Pro card ──────────────── */}
      {isLiteUser && (
        <section className="px-4 pb-8">
          <div className="mx-auto max-w-lg">
            <PricingCard
              planType="upgrade"
              pricing={p}
              features={proFeatures.slice(1)}
              language={language}
              onBuy={() => handleBuy('upgrade')}
            />
          </div>
        </section>
      )}

      {/* ── Free users — both plans ──────────────────────── */}
      {!isProUser && !isLiteUser && (
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
          <div className="mb-8 flex justify-center">
            <div className="relative inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2">
              <Flame className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs font-semibold text-amber-800">
                {hi ? p.urgencyTextHi : p.urgencyText}
              </span>
              <Badge className="h-5 border-emerald-200 bg-emerald-100 px-1.5 py-0 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100">
                <Users className="mr-0.5 h-2.5 w-2.5" />
                {p.studentsBought || PRICING_DEFAULTS.studentsBought} joined
              </Badge>
              .
            </div>
          </div>

          {/* ── What You Get Section ─────────────────────── */}
          <div className="mx-auto mb-10 max-w-4xl">
            <h2 className="mb-6 text-center text-lg font-bold text-slate-800 md:text-xl">
              {hi ? 'आपको क्या मिलता है?' : 'What do you get?'}
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {[
                {
                  icon: Target,
                  label: hi ? '5000+ प्रश्न' : '5000+ Questions',
                  sub: hi ? 'सभी विषयों में' : 'Across all topics',
                },
                {
                  icon: FileText,
                  label: hi ? 'फुल मॉक टेस्ट' : 'Full Mock Tests',
                  sub: hi ? '100 प्रश्न प्रत्येक' : '100Q each',
                },
                {
                  icon: BarChart3,
                  label: hi ? 'स्मार्ट एनालिटिक्स' : 'Smart Analytics',
                  sub: hi ? 'कमज़ोर टॉपिक पहचानो' : 'Find weak areas',
                },
                {
                  icon: History,
                  label: hi ? '5+ साल के PYQ' : '5+ Years PYQs',
                  sub: hi ? 'विस्तृत उत्तर सहित' : 'With Explanations',
                },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center"
                >
                  <Icon className="mx-auto mb-2 h-6 w-6 text-slate-700" />
                  <p className="text-sm font-bold text-slate-800">{label}</p>
                  <p className="text-[11px] text-slate-500">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Pricing Cards ────────────────────────────── */}
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
            <PricingCard
              planType="lite"
              pricing={p}
              features={LITE_FEATURES}
              language={language}
              onBuy={() => handleBuy('lite')}
            />
            <PricingCard
              planType="pro"
              pricing={p}
              features={PRO_FEATURES}
              language={language}
              onBuy={() => handleBuy('pro')}
              isPopular
            />
          </div>

          {/* ── Comparison note ───────────────────────────── */}
          <div className="mx-auto mt-6 max-w-4xl">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-4 md:p-6">
              <div className="flex flex-col items-center gap-3 text-center md:flex-row md:gap-6 md:text-left">
                <div className="flex-1">
                  <p className="mb-1 text-sm font-bold text-slate-800">
                    {hi ? '💡 Pro में क्या extra मिलता है?' : '💡 What extra do you get in Pro?'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {hi
                      ? 'Unlimited tests, FLTs, CSAT, PYQ papers + Mains तक validity. Serious aspirants के लिए Pro best value है।'
                      : 'Unlimited tests, FLTs, CSAT, PYQ papers + validity till Mains. Best value for serious aspirants.'}
                  </p>
                </div>
                <div className="text-sm font-bold whitespace-nowrap text-slate-600">
                  {hi
                    ? `सिर्फ ₹${p.proPrice - p.litePrice} ज़्यादा`
                    : `Just ₹${p.proPrice - p.litePrice} more`}
                </div>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-slate-400" />
            <p className="text-xs font-medium text-slate-400">
              {hi
                ? 'सुरक्षित भुगतान • कोई ऑटो-रिन्यूअल नहीं • RazorPay से एक्टिवेट'
                : 'Secure Payment • No Auto-Renewal • Activate via RazorPay'}
            </p>
          </div>
        </section>
      )}

      {/* ── FAQ Section ──────────────────────────────────── */}
      <section className="px-4 pt-4 pb-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display mb-12 text-center text-2xl font-bold text-slate-900 md:text-3xl">
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
