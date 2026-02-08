"use client";

// Apun ka standalone pricing page — seedha maal, no toggle
// ₹ price kaat ke discounted dikhao, monthly breakdown side me, "first 100 users" urgency
// Bilingual support, FAQ section — sab kuch ek jagah

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Star, ChevronDown, Shield, Zap, Crown, ArrowLeft, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

// --- FAQ data — har sawaal ka seedha jawaab ---
const faqData = [
  {
    q: { en: 'What happens after I pay?', hi: 'पेमेंट के बाद क्या होगा?' },
    a: {
      en: 'Instant access! Your plan activates immediately after payment. No waiting, no approval needed.',
      hi: 'तुरंत एक्सेस! पेमेंट के बाद आपका प्लान तुरंत एक्टिव हो जाएगा। कोई इंतज़ार नहीं।',
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
      en: 'Yes! Pay just the difference — ₹199 to upgrade from Lite to Pro anytime.',
      hi: 'हाँ! सिर्फ़ ₹199 का अंतर भरें और कभी भी लाइट से प्रो में अपग्रेड करें।',
    },
  },
  {
    q: { en: 'How long is my access valid?', hi: 'मेरा एक्सेस कब तक वैध रहेगा?' },
    a: {
      en: 'Lite is valid till MPPSC 2026 Prelims (~8 months). Pro is valid till MPPSC 2026 Mains (~12 months).',
      hi: 'लाइट MPPSC 2026 प्रीलिम्स तक (~8 महीने) और प्रो MPPSC 2026 मेन्स तक (~12 महीने) वैध है।',
    },
  },
];

// --- Feature lists — bilingual ---
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

// --- FAQ Accordion Item ---
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group cursor-pointer"
      >
        <span className="text-sm md:text-base font-semibold text-slate-800 pr-4">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-slate-600 pb-5 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { language, user } = useSettingsStore();
  const hi = language === 'hi';

  const planTier = user?.plan_tier ?? 'free';
  const isProUser = planTier === 'pro';
  const isLiteUser = planTier === 'lite';

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-slate-100 selection:text-slate-900">

      {/* --- Back button --- */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {hi ? 'होम पर वापस' : 'Back to Home'}
        </Link>
      </div>

      {/* --- Hero Header --- */}
      <section className="pt-12 pb-4 md:pt-16 md:pb-6 text-center px-4">
        <Badge className="bg-slate-100 text-slate-700 border-slate-200 px-4 py-1.5 mb-6 hover:bg-slate-200 transition-colors cursor-default text-xs font-semibold tracking-wide">
          MPPSC 2026
        </Badge>

        <h1 className="text-3xl md:text-5xl font-black font-display text-slate-900 tracking-tight mb-3 leading-tight">
          {hi ? 'अपना MPPSC सफलता प्लान चुनें' : 'Choose Your MPPSC Success Plan'}
        </h1>
        <p className="text-base md:text-lg text-slate-500 font-medium max-w-lg mx-auto mb-2">
          {hi
            ? '500+ छात्रों के साथ स्मार्ट तैयारी करें'
            : 'Join 500+ aspirants preparing smarter'}
        </p>
      </section>

      {/* --- Pro user — already subscribed message --- */}
      {isProUser && (
        <section className="px-4 pb-16">
          <div className="max-w-lg mx-auto text-center">
            <Card className="border-2 border-slate-800 shadow-lg">
              <CardContent className="p-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                  <Crown className="w-8 h-8 text-slate-800" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {hi ? 'आप Pro पर हैं!' : "You're on Pro!"}
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  {hi
                    ? 'सभी फीचर्स अनलॉक हैं। बस तैयारी पर फोकस करें!'
                    : 'All features unlocked. Focus on your preparation!'}
                </p>
                <Link href="/syllabus">
                  <Button className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8">
                    {hi ? 'तैयारी शुरू करें' : 'Start Preparing'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* --- Lite user — upgrade to Pro card --- */}
      {isLiteUser && (
        <section className="px-4 pb-8">
          <div className="max-w-lg mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 opacity-20 blur-sm animate-pulse" />
              <Card className="border-2 border-slate-800 shadow-2xl relative overflow-hidden bg-white">
                <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-lg uppercase tracking-widest">
                  {hi ? 'खास ऑफर' : 'SPECIAL OFFER'}
                </div>
                <CardContent className="p-8 flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <h3 className="text-xl font-bold text-slate-900">
                      {hi ? 'प्रो में अपग्रेड करें' : 'Upgrade to Pro'}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-6">
                    {hi ? 'लाइट से प्रो — सिर्फ़ अंतर भरें' : 'Lite → Pro — Just pay the difference'}
                  </p>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-black text-slate-900">₹199</span>
                    <span className="text-sm text-slate-400 line-through">₹299</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold ml-2">
                      {hi ? 'बचत ₹100' : 'SAVE ₹100'}
                    </Badge>
                  </div>
                  <div className="w-full h-px bg-slate-100 mb-6" />
                  <ul className="space-y-3 mb-8 text-left">
                    {proFeatures.slice(1).map((f) => (
                      <li key={f.en} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                        <CheckCircle2 className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
                        <span>{hi ? f.hi : f.en}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/">
                    <Button className="w-full h-12 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-lg shadow-slate-300 transition-all">
                      {hi ? '₹199 में प्रो लें' : 'Upgrade to Pro — ₹199'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* --- Free users — both plans, no toggle, main price with strikethrough + monthly breakdown --- */}
      {!isProUser && (
        <section className="px-4 pb-16">

          {/* Urgency banner — "first 100 users" FOMO */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-5 py-2.5">
              <Users className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                {hi ? 'पहले 100 छात्रों के लिए विशेष मूल्य' : 'Special pricing for first 100 students'}
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl mx-auto">

            {/* --- Lite Plan Card --- */}
            <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white h-full">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">Lite</h3>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    {hi ? 'स्मार्ट शुरुआत' : 'Start Smart'}
                  </p>
                </div>

                {/* Main price — ₹299 kaat ke ₹99, monthly breakdown side me */}
                <div className="mb-6">
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
                    {hi ? 'एक बार भुगतान, MPPSC 2026 प्रीलिम्स तक वैध' : 'One-time payment, valid till MPPSC 2026 Prelims'}
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

                <Link href="/" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl font-bold border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 transition-all"
                  >
                    {hi ? 'लाइट एक्सेस लें' : 'Get Lite Access'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* --- Pro Plan Card — highlighted, "MOST POPULAR" badge --- */}
            <div className="relative h-full">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 opacity-15 blur-sm animate-pulse" />

              <Card className="border-2 border-slate-800 shadow-xl h-full relative overflow-hidden bg-white">
                <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-lg uppercase tracking-widest">
                  {hi ? 'सबसे लोकप्रिय' : 'MOST POPULAR'}
                </div>

                <CardContent className="p-8 flex flex-col h-full relative z-10">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-5 h-5 text-slate-800" />
                      <h3 className="text-xl font-bold text-slate-800">Pro</h3>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                      {hi ? 'पूरी ताकत' : 'Full Power'}
                    </p>
                  </div>

                  {/* Main price — ₹999 kaat ke ₹299, monthly breakdown side me */}
                  <div className="mb-6">
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
                      {hi ? 'एक बार भुगतान, MPPSC 2026 मेन्स तक वैध' : 'One-time payment, valid till MPPSC 2026 Mains'}
                    </p>
                  </div>

                  <div className="w-full h-px bg-slate-100 mb-6" />

                  <ul className="space-y-4 mb-8 flex-1 text-left">
                    {proFeatures.map((f, i) => (
                      <li
                        key={f.en}
                        className={`flex items-start gap-3 text-sm text-slate-900 ${i === 0 ? 'font-bold' : 'font-medium'}`}
                      >
                        <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 text-slate-800`} />
                        <span>{hi ? f.hi : f.en}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/" className="w-full">
                    <Button className="w-full h-12 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-lg shadow-slate-300 transition-all">
                      {hi ? 'प्रो एक्सेस लें' : 'Get Pro Access'}
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
              {hi
                ? 'सुरक्षित भुगतान • कोई ऑटो-रिन्यूअल नहीं • तुरंत एक्सेस'
                : 'Secure Payment • No Auto-Renewal • Instant Access'}
            </p>
          </div>
        </section>
      )}

      {/* --- FAQ Section --- */}
      <section className="px-4 pb-20 pt-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-slate-900 text-center mb-2">
            {hi ? 'अक्सर पूछे जाने वाले सवाल' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            {hi ? 'कोई भी सवाल? यहाँ जवाब मिलेगा।' : 'Got questions? We have answers.'}
          </p>

          <div className="border border-slate-200 rounded-xl divide-y-0 overflow-hidden bg-white shadow-sm px-6">
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
    </div>
  );
}
