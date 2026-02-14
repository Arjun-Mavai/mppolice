'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Mail, ArrowRight, BookOpen, Target, BarChart3, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get('plan') || 'pro';
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';
  const type = searchParams.get('type'); // 'upgrade' or null

  const firstName = name.split(' ')[0] || 'Student';
  const isPro = plan === 'pro' || plan === 'upgrade';
  const isUpgrade = type === 'upgrade';
  const planLabel = isPro ? 'Pro' : 'Lite';
  const planColor = isPro ? 'text-amber-600' : 'text-blue-600';
  const planBg = isPro ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200';

  // Auto-redirect for upgrades
  useEffect(() => {
    if (isUpgrade) {
      const timer = setTimeout(() => {
        router.push('/syllabus/quiz/topic');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isUpgrade, router]);

  const features = isPro ? [
    { icon: Target, text: 'Unlimited Topic & Unit Tests' },
    { icon: BookOpen, text: 'PYQ Papers (2020-2025)' },
    { icon: BarChart3, text: 'Smart Analytics Dashboard' },
    { icon: Sparkles, text: 'Full Length Mock Tests (100Q)' },
  ] : [
    { icon: Target, text: 'Topic Tests per Unit (Limited)' },
    { icon: BookOpen, text: 'PYQ Papers ×3' },
    { icon: BarChart3, text: 'Limited Analytics' },
    { icon: Sparkles, text: 'Smart Explanations of syllabus topics' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">

        {/* ── Main Card ── */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Green Success Header */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-10 text-center text-white relative overflow-hidden">
            {/* Subtle pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 h-16 w-16 rounded-full border-2 border-white" />
              <div className="absolute bottom-2 right-12 h-10 w-10 rounded-full border-2 border-white" />
              <div className="absolute top-8 right-6 h-6 w-6 rounded-full bg-white" />
            </div>
            
            <div className="relative">
              <div className="inline-flex items-center justify-center h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 ring-4 ring-white/30">
                <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {isUpgrade ? 'Upgrade Successful!' : 'Payment Successful!'}
              </h1>
              <p className="text-emerald-100 mt-1 text-sm">
                {isUpgrade ? 'Redirecting to your dashboard...' : 'Transaction verified & secured'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-5">

            {/* Greeting */}
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">
                {isUpgrade ? `Welcome to Pro, ${firstName}! 🚀` : `Thank you, ${firstName}! 🎉`}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Your <span className={`font-bold ${planColor}`}>{planLabel} Plan</span> is active.
              </p>
              {isUpgrade && (
                  <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full" />
                    Redirecting to Test Series...
                  </div>
              )}
            </div>

            {/* Email CTA - ONLY FOR NEW USERS */}
            {!isUpgrade && (
                <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="shrink-0 h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5" />
                    </div>
                    <div>
                    <p className="font-semibold text-sm">Check Your Email</p>
                    <p className="text-xs text-slate-300">Set your password to start your journey</p>
                    </div>
                </div>
                {email && (
                    <div className="bg-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Sent to:</span>
                    <span className="text-sm font-medium text-white truncate">{email}</span>
                    </div>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Shield className="h-3 w-3" />
                  <span>Link expires in 1 hour • Check spam folder too</span>
                </div>
                </div>
            )}

            {/* Steps - ONLY FOR NEW USERS */}
            {!isUpgrade && (
                <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Steps</p>
                <div className="space-y-2.5">
                    {[
                    { step: '1', text: 'Open the email we just sent', done: false },
                    { step: '2', text: 'Click "Set Your Password"', done: false },
                    { step: '3', text: 'Create a strong password', done: false },
                    { step: '4', text: 'Login & start practicing!', done: false },
                    ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                        <div className="shrink-0 h-6 w-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                        {item.step}
                        </div>
                        <span className="text-sm text-slate-600">{item.text}</span>
                    </div>
                    ))}
                </div>
                </div>
            )}

            {/* Plan Features */}
            <div className={`rounded-xl p-4 border ${planBg}`}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Your {planLabel} Features
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {features.map((f) => (
                  <div key={f.text} className="flex items-center gap-2">
                    <f.icon className={`h-3.5 w-3.5 ${planColor} shrink-0`} />
                    <span className="text-xs text-slate-700 leading-tight">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {isUpgrade ? (
               <Button asChild className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                <Link href="/syllabus/quiz/topic">
                    Start Practicing <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
                </Button>
          ) : (
            <>
                <Button asChild variant="outline" className="flex-1 h-11 border-slate-200 text-slate-700 hover:bg-slate-50">
                    <Link href="/">
                    Go to Home
                    </Link>
                </Button>
                <Button asChild className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                    <Link href="/login">
                    Login Now <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                </Button>
            </>
          )}
        </div>

        {/* Motivational note */}
        <p className="text-center text-xs text-slate-400 px-4">
          &ldquo;सफलता उन्हें मिलती है जो मेहनत करते हैं&rdquo; — Your MPPSC journey starts now! 🚀
        </p>

      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-slate-100 border-t-emerald-500 animate-spin" />
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
