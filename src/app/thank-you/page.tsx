'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Mail,
  ArrowRight,
  BookOpen,
  Target,
  BarChart3,
  Sparkles,
  Shield,
  Zap,
  Phone,
  Download,
  ChevronDown,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRef } from 'react';

// ── FAQ Data ────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    en: {
      q: 'How long is my access valid?',
      a: 'Pro access is valid till MP Police 2026. If the exam is delayed, we will extend your access accordingly at no extra charge.',
    },
    hi: {
      q: 'मेरा एक्सेस कब तक वैध रहेगा?',
      a: 'प्रो एक्सेस MP Police 2026 तक वैध है। अगर परीक्षा में देरी हुई, तो हम आपका एक्सेस बिना किसी अतिरिक्त शुल्क के बढ़ा देंगे।',
    },
  },
  {
    en: {
      q: 'Is this available in Hindi & English?',
      a: 'Yes! All tests, one-liners, and explanations are available in both Hindi & English with a one-click toggle.',
    },
    hi: {
      q: 'क्या यह हिंदी और अंग्रेजी दोनों में उपलब्ध है?',
      a: 'हाँ! सभी टेस्ट, वन-लाइनर्स और एक्सप्लेनेशन हिंदी और अंग्रेजी दोनों में एक क्लिक से उपलब्ध हैं।',
    },
  },
  {
    en: {
      q: 'What if I face login issues?',
      a: 'Don’t worry! Check your email for the password setup link. If stuck, click the WhatsApp button below or use the floating chat.',
    },
    hi: {
      q: 'अगर लॉगिन में दिक्कत आए तो?',
      a: 'चिंता न करें! पासवर्ड सेट करने के लिंक के लिए अपना ईमेल चेक करें। यदि फिर भी समस्या हो, तो नीचे दिए गए व्हाट्सएप बटन पर क्लिक करें।',
    },
  },
];

function FaqAccordion({ hi }: { hi: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-6">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
        {hi ? 'अक्सर पूछे जाने वाले सवाल' : 'FREQUENTLY ASKED QUESTIONS'}
      </h3>
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIndex === idx;
        const t = hi ? item.hi : item.en;
        return (
          <div key={idx} className="overflow-hidden rounded-xl border border-slate-200/60 bg-white">
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="text-sm font-bold text-slate-700">{t.q}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-slate-400 transition-transform duration-300',
                  isOpen && 'rotate-180 text-amber-500'
                )}
              />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-4 text-xs leading-relaxed text-slate-500">{t.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useSettingsStore((state) => state.user);
  const authStatus = useSettingsStore((state) => state.authCheckStatus);

  const plan = searchParams.get('plan');
  const email = searchParams.get('email');
  const name = searchParams.get('name');
  const type = searchParams.get('type'); // 'upgrade' or null
  const langQuery = searchParams.get('lang'); // optional language override
  const isUpgrade = type === 'upgrade';

  const hasChecked = useRef(false);

  // 🛡️ Security: Redirect if accessed directly without payment context
  useEffect(() => {
    // Only run on client side and only once per mount (to survive React 18 Strict Mode remount)
    if (typeof window === 'undefined' || hasChecked.current) return;

    const isFreshSuccess = sessionStorage.getItem('payment_success_fresh');

    // 🚦 Mandatory Check: flag + email param
    if (!isFreshSuccess || !email) {
      router.replace('/');
      return;
    }

    // 🧹 Transient: Clear the flag so refresh redirects to home
    sessionStorage.removeItem('payment_success_fresh');
    hasChecked.current = true;
    
    // Auto-redirect for upgrades
    if (isUpgrade) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [email, router, isUpgrade]);

  if (!plan && (authStatus === 'checked' || authStatus === 'loading')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffdfa]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-amber-500" />
      </div>
    );
  }

  const firstName = (name || '').split(' ')[0] || 'Student';
  const isPro = plan === 'pro' || plan === 'upgrade';
  const planLabel = isPro ? 'Pro' : 'Lite';
  const planColor = isPro ? 'text-amber-600' : 'text-blue-600';
  const planBg = isPro ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200';

  // Detecting language preference (defaulting to Hindi for MP Police context)
  const hi = langQuery === 'hi' || true; 


  const features = isPro
    ? [
        { icon: Zap, text: hi ? '1000+ वन-लाइनर्स (रिवीज़न)' : '1000+ One-Liners (Revision)', highlight: true },
        { icon: Target, text: hi ? 'विषय-वार स्पेशल टेस्ट' : 'Subject-wise Special Tests' },
        { icon: BookOpen, text: hi ? 'लेटेस्ट PYQ पेपर्स' : 'Latest PYQ Papers' },
        { icon: BarChart3, text: hi ? 'स्मार्ट एनालिटिक्स डैशबोर्ड' : 'Smart Analytics Dashboard' },
        { icon: Sparkles, text: hi ? 'फुल मॉक टेस्ट (100 प्रश्न)' : 'Full Length Mock Tests (100Q)' },
        { icon: Brain, text: hi ? 'मेमोरी टिप्स और ट्रिक्स' : 'Memory Tips & Tricks' },
      ]
    : [
        { icon: Target, text: hi ? 'सीमित विषय-वार टेस्ट' : 'Limited Subject-wise Tests' },
        { icon: BookOpen, text: hi ? 'लेटेस्ट PYQ पेपर्स' : 'Latest PYQ Papers' },
        { icon: BarChart3, text: hi ? 'बेसिक एनालिटिक्स' : 'Basic Analytics' },
        { icon: Sparkles, text: hi ? 'स्मार्ट व्याख्या' : 'Smart Explanations' },
      ];

  const handleSupportClick = () => {
    const message = encodeURIComponent(`Hi, I just bought the Pro plan for Mindful MP Police and need help getting started! \nEmail: ${email}`);
    window.open(`https://wa.me/918766451748?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#fffdfa] font-sans selection:bg-amber-100 selection:text-amber-900 pb-20 overflow-x-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative mx-auto max-w-2xl px-4 py-12 md:py-20 lg:py-24">
        {/* ── Main Success Card ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-amber-900/5"
        >
          {/* Header Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-12 text-center text-white">
             {/* Dynamic background effect */}
             <div className="absolute inset-0 opacity-10">
               <div className="absolute top-4 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full border-4 border-white/20" />
               <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full border-4 border-white/20" />
             </div>

             <div className="relative z-10">
                <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 ring-4 ring-white/30 backdrop-blur-xl rotate-3">
                  <CheckCircle2 className="h-14 w-14 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  {isUpgrade ? (hi ? 'अपग्रेड सफल!' : 'Upgrade Successful!') : (hi ? 'भुगतान सफल!' : 'Payment Successful!')}
                </h1>
                <p className="mt-2 text-sm font-medium text-emerald-50 text-opacity-90">
                  {isUpgrade ? (hi ? 'डैशबोर्ड पर रीडायरेक्ट किया जा रहा है...' : 'Redirecting to your dashboard...') : (hi ? 'सफलता का सफर अब शुरू होता है' : 'Your journey to success starts now')}
                </p>
             </div>
          </div>

          <div className="space-y-8 px-6 py-8 md:px-10">
            {/* Greeting */}
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900">
                {isUpgrade ? (hi ? `बधाई हो, ${firstName}! 🚀` : `Congrats, ${firstName}! 🚀`) : (hi ? `धन्यवाद, ${firstName}! 🎉` : `Thank you, ${firstName}! 🎉`)}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {hi ? 'आपका' : 'Your'} <span className={cn("font-black uppercase tracking-tighter", planColor)}>{planLabel} Plan</span> {hi ? 'एक्टिव हो गया है।' : 'is now active.'}
              </p>
              
              {isUpgrade && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-amber-50 p-4 text-amber-700 border border-amber-100"
                >
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                  <span className="text-sm font-bold">{hi ? 'डैशबोर्ड लोड हो रहा है...' : 'Loading Dashboard...'}</span>
                </motion.div>
              )}
            </div>

            {/* Email & Next Steps - ONLY FOR NEW USERS */}
            {!isUpgrade && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Email Alert */}
                <div className="flex flex-col justify-between rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                     <Mail className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-black tracking-tight">{hi ? 'ईमेल चेक करें' : 'Check Your Email'}</h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{hi ? 'पासवर्ड सेट करने का लिंक भेजा गया है' : 'Password setup link sent'}</p>
                    {email && (
                      <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/5 py-2 px-3">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">To:</span>
                         <span className="truncate text-xs font-bold text-white">{email}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-slate-500">
                    <Shield className="h-3 w-3" />
                    <span>Expires in 1 hour • Check Spam folder</span>
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{hi ? 'अगले कदम' : 'NEXT STEPS'}</h3>
                  <div className="space-y-3">
                    {[
                      { s: '1', t: hi ? 'ईमेल खोलें' : 'Open the email' },
                      { s: '2', t: hi ? '"Set Password" पर क्लिक करें' : 'Click "Set Password"' },
                      { s: '3', t: hi ? 'नया पासवर्ड बनाएँ' : 'Create new password' },
                      { s: '4', t: hi ? 'लॉगिन करें और तैयारी शुरू करें' : 'Login & start practicing' },
                    ].map((item) => (
                      <div key={item.s} className="group flex items-center gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-700 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                          {item.s}
                        </div>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{item.t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Features Highlight Grid */}
            <div className={cn("rounded-[2rem] border p-6 sm:p-8", planBg)}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                  {hi ? `आपके ${planLabel} फीचर्स` : `Your ${planLabel} Features`}
                </h3>
                {isPro && (
                   <span className="rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-amber-500/20">Pro Active</span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {features.map((f, i) => (
                  <motion.div 
                    key={f.text} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl p-3 transition-colors",
                      f.highlight ? "bg-white shadow-sm ring-1 ring-amber-200" : "bg-white/40"
                    )}
                  >
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", f.highlight ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500")}>
                       <f.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className={cn("text-xs font-bold leading-tight", f.highlight ? "text-slate-900" : "text-slate-600")}>{f.text}</span>
                      {f.highlight && <p className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mt-0.5">{hi ? 'धमाका!' : 'Bestseller'}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Support CTA Section */}
            <div className="flex flex-col gap-4 rounded-3xl border-2 border-dashed border-slate-200 p-6 text-center">
               <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                  <Phone className="h-7 w-7" />
               </div>
               <h3 className="text-lg font-black tracking-tight text-slate-900">{hi ? 'मदद चाहिए?' : 'Need Help?'}</h3>
               <p className="text-sm font-medium text-slate-500">
                 {hi ? 'हमारे व्हाट्सएप सपोर्ट से जुड़ें और अपनी तैयारी शुरू करने में मदद लें।' : 'Join our WhatsApp support and get help starting your preparation.'}
               </p>
               <Button 
                onClick={handleSupportClick}
                className="mt-2 h-12 w-full rounded-2xl bg-green-600 font-bold text-white hover:bg-green-700 shadow-xl shadow-green-500/20"
               >
                 <Phone className="mr-2 h-4 w-4" />
                 {hi ? 'व्हाट्सएप पर बात करें' : 'Chat on WhatsApp'}
               </Button>
            </div>

            {/* FAQ Section */}
            <FaqAccordion hi={hi} />

            {/* App Promotion Section */}
            <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center text-white shadow-2xl">
               <div className="absolute top-0 right-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-amber-500/10 blur-3xl transition-transform group-hover:scale-150" />
               <div className="relative z-10">
                 <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-slate-900">
                    <Download className="h-6 w-6" strokeWidth={2.5} />
                 </div>
                 <h3 className="mb-2 text-xl font-black tracking-tight">{hi ? 'ऐप डाउनलोड करें' : 'Download the App'}</h3>
                 <p className="mx-auto mb-6 max-w-sm text-sm font-medium text-slate-400">
                    {hi ? 'बेहतर तैयारी और ऑफलाइन रिवीज़न के लिए माइंडफुल ऐप इंस्टॉल करें।' : 'Install the Mindful app for better preparation and offline revision.'}
                 </p>
                 <Button asChild className="h-11 rounded-full bg-white px-8 font-black text-slate-900 hover:bg-amber-100 transition-all hover:scale-105">
                    <Link href="/#install-guide">
                      {hi ? 'इंस्टॉल गाइड देखें' : 'View Install Guide'} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                 </Button>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Navigation */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            variant="ghost"
            className="h-12 flex-1 rounded-2xl font-bold text-slate-500 hover:bg-white hover:text-slate-900"
          >
            <Link href="/">{hi ? 'वापस होम' : 'Go to Home'}</Link>
          </Button>
          <Button
            asChild
            className="h-12 flex-1 rounded-2xl bg-slate-900 font-black text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10"
          >
            <Link href={isUpgrade ? "/dashboard" : "/login"}>
              {isUpgrade ? (hi ? 'डैशबोर्ड खोलें' : 'Open Dashboard') : (hi ? 'लॉगिन करें' : 'Login Now')} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Motivational Quote */}
        <p className="mt-12 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
          {hi ? 'सफलता का शिखर अब आपकी मेहनत की प्रतीक्षा कर रहा है' : 'The peak of success now awaits your hard work'} — MP Police 2026 👮
        </p>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fffdfa]">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-amber-500" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
            </div>
          </div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
