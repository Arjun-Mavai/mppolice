'use client';

import { useState } from 'react';
import { Zap, ChevronRight, ArrowLeft, Loader2, Target, Shield, Trophy, BookOpen, CheckCircle2 } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trackFbCustomEvent } from '@/lib/analytics/facebook-pixel';
import { getUserTier } from '@/lib/access-control';

export function HeroSection() {
  const router = useRouter();
  const [isPendingFreeTest, setIsPendingFreeTest] = useState(false);
  const [isPendingOneLiners, setIsPendingOneLiners] = useState(false);
  const { language, user: globalUser } = useSettingsStore();
  const tier = getUserTier(globalUser);
  const isPro = tier === 'pro';
  const oneLinersHref = isPro ? '/syllabus/quiz/revision/gk-one-liners' : '/free-one-liners';

  return (
    <section className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden bg-[#020617] px-4 pt-24 pb-14 md:min-h-screen md:px-6 md:pt-48 md:pb-32">
      {/* 🎭 PREMIUM BACKGROUND LAYERS */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-orange-600/5 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-12 text-center md:space-y-20">
        <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-amber-500/30 bg-amber-950/30 px-5 py-2 text-[10px] font-black tracking-widest text-amber-400 backdrop-blur-xl transition-all hover:border-amber-500/50 md:text-xs">
                <Shield className="h-4 w-4 fill-amber-500/20" />
                {language === 'hi' ? 'MP POLICE EXAM 2026' : 'MP POLICE EXAM 2026'}
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
        </div>

        <div className="space-y-6 md:space-y-10">
          <div className="font-display flex flex-col items-center justify-center text-5xl leading-[1.05] font-black tracking-tight sm:text-7xl md:text-[8rem] lg:text-[10rem]">
            <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                {language === 'hi' ? 'तैयारी जीत की।' : 'Master the'}
            </span>
            <span className="animate-gradient-x bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-[length:200%_auto] bg-clip-text pb-2 text-transparent drop-shadow-[0_0_40px_rgba(245,158,11,0.3)]">
              {language === 'hi' ? 'आपका भविष्य।' : 'Future.'}
            </span>
          </div>

          <p className="mx-auto max-w-4xl px-2 text-lg leading-relaxed font-bold text-slate-400 md:text-3xl">
            {language === 'hi'
              ? 'MP Police के नए पैटर्न पर आधारित 100+ प्रीमियम टेस्ट्स, PYQs और 1000+ One-Liners (व्याख्या सहित) के साथ सफलता सुनिश्चित करें।'
              : 'Ensure success with 100+ premium tests, PYQs and 1000+ One-Liners (with explanations) based on the new MP Police pattern.'}
          </p>

          <div className="mx-auto -mt-2 flex w-full max-w-[620px] flex-col items-center justify-center gap-8 px-4 md:mt-0">
          {!globalUser ? (
            <div className="flex w-full flex-col gap-3 md:flex-row md:gap-4">
              {/* 🟠 PRIMARY: GK One-Liners (Top/Primary) */}
              <button
                onClick={() => {
                  trackFbCustomEvent('hero_one_liners_clicked', {
                    location: 'home_page_hero_section',
                    user_status: 'guest',
                  });
                  setIsPendingOneLiners(true);
                  router.push(oneLinersHref);
                }}
                onMouseEnter={() => router.prefetch(oneLinersHref)}
                className="group relative w-full focus:outline-none"
              >
                <div className="relative flex h-16 w-full transform items-center justify-center overflow-hidden rounded-2xl bg-amber-600 transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-amber-500 group-hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] group-active:scale-[0.98] md:h-24 md:rounded-[2.5rem]">
                  <div className="relative z-10 flex h-full w-full items-center justify-center gap-4 px-6 md:gap-8 md:px-10">
                    {isPendingOneLiners ? (
                      <Loader2 className="h-6 w-6 animate-spin text-white md:h-8 md:w-8" />
                    ) : (
                      <Target className="h-6 w-6 fill-white text-white md:h-8 md:w-8" />
                    )}
                    <span className="text-xs font-black tracking-[0.15em] whitespace-nowrap text-white uppercase md:text-xl md:tracking-[0.2em]">
                      {language === 'hi' ? 'GK वन-लाइनर्स प्रैक्टिस' : 'Practice GK One-Liners'}
                    </span>
                    <ChevronRight
                      className="h-6 w-6 text-white transition-transform duration-500 group-hover:translate-x-2 md:h-8 md:w-8"
                      strokeWidth={4}
                    />
                  </div>
                </div>
              </button>

              {/* ⚪️ SECONDARY: Practice Free (Below/Secondary) */}
              <button
                onClick={() => {
                  trackFbCustomEvent('hero_free_test_clicked', {
                    location: 'home_page_hero_section',
                    user_status: 'guest',
                  });
                  setIsPendingFreeTest(true);
                  router.push('/free-quiz');
                }}
                onMouseEnter={() => router.prefetch('/free-quiz')}
                className="group relative w-full focus:outline-none"
              >
                <div className="relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-0.5 group-hover:border-amber-500/40 group-hover:bg-amber-500/10 group-hover:shadow-[0_0_40px_rgba(245,158,11,0.12)] group-active:scale-[0.99] md:h-24 md:rounded-[2.5rem]">
                  <div className="relative z-10 flex h-full w-full items-center justify-center gap-3 px-6 md:gap-6 md:px-10">
                    {isPendingFreeTest ? (
                      <Loader2 className="h-5 w-5 animate-spin text-amber-400 md:h-7 md:w-7" />
                    ) : (
                      <Zap className="h-5 w-5 text-amber-400 md:h-7 md:w-7" />
                    )}
                    <span className="text-[11px] font-black tracking-[0.15em] whitespace-nowrap text-white/90 uppercase md:text-lg md:tracking-[0.2em]">
                      {language === 'hi' ? 'फ्री प्रैक्टिस टेस्ट' : 'Practice Free'}
                    </span>
                    <ChevronRight
                      className="h-5 w-5 text-amber-400 transition-transform duration-500 group-hover:translate-x-1.5 md:h-7 md:w-7"
                      strokeWidth={4}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                </div>
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3 md:flex-row md:gap-4">
              {/* 🟠 PRIMARY: GK One-Liners (For Logged In Users) */}
              <Link
                href={oneLinersHref}
                className="group relative w-full focus:outline-none"
                onMouseEnter={() => router.prefetch(oneLinersHref)}
                onClick={() => {
                  trackFbCustomEvent('hero_one_liners_clicked', {
                    location: 'home_page_hero_section',
                    user_status: 'logged_in',
                  });
                  setIsPendingOneLiners(true);
                }}
              >
                <div className="relative flex h-16 w-full transform items-center justify-center overflow-hidden rounded-2xl bg-amber-600 transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-amber-500 group-hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] group-active:scale-[0.98] md:h-24 md:rounded-[2.5rem]">
                  <div className="relative z-10 flex h-full w-full items-center justify-center gap-4 px-6 md:gap-8 md:px-10">
                    {isPendingOneLiners ? (
                      <Loader2 className="h-6 w-6 animate-spin text-white md:h-8 md:w-8" />
                    ) : (
                      <Target className="h-6 w-6 fill-white text-white md:h-8 md:w-8" />
                    )}
                    <span className="text-xs font-black tracking-[0.15em] whitespace-nowrap text-white uppercase md:text-xl md:tracking-[0.2em]">
                      {language === 'hi' ? 'GK वन-लाइनर्स प्रैक्टिस' : 'Practice One-Liners'}
                    </span>
                    <ChevronRight
                      className="h-6 w-6 text-white transition-transform duration-500 group-hover:translate-x-2 md:h-8 md:w-8"
                      strokeWidth={4}
                    />
                  </div>
                </div>
              </Link>

              {/* ⚪️ SECONDARY: Test Dashboard */}
              <Link href="/syllabus/quiz/full-tests" className="group relative w-full">
                <div className="relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-0.5 group-hover:border-amber-500/40 group-hover:bg-amber-500/10 group-hover:shadow-[0_0_40px_rgba(245,158,11,0.12)] group-active:scale-[0.99] md:h-24 md:rounded-[2.5rem]">
                  <div className="relative z-10 flex h-full w-full items-center justify-center gap-3 px-6 md:gap-6 md:px-10">
                    <Trophy className="h-5 w-5 text-amber-500 md:h-7 md:w-7" />
                    <span className="text-[11px] font-black tracking-[0.15em] whitespace-nowrap text-white/90 uppercase md:text-lg md:tracking-[0.2em]">
                      {language === 'hi' ? 'टेस्ट डैशबोर्ड' : 'Test Dashboard'}
                    </span>
                    <ArrowLeft
                      className="h-5 w-5 rotate-180 text-amber-500 transition-transform duration-500 group-hover:translate-x-1.5 md:h-7 md:w-7"
                      strokeWidth={3}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                </div>
              </Link>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
             <div className="flex items-center gap-6 text-slate-500">
                <div className="flex items-center gap-2">
                   <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                   <span className="text-[10px] font-black tracking-widest uppercase md:text-xs">
                      {language === 'hi' ? 'चैप्टर-वाइज टेस्ट्स' : 'Chapter-wise Tests'}
                   </span>
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-700" />
                <div className="flex items-center gap-2">
                   <BookOpen className="h-4 w-4 text-amber-500" />
                   <span className="text-[10px] font-black tracking-widest uppercase md:text-xs">
                      {language === 'hi' ? 'विषयवार व्याख्या' : 'Subject Explanations'}
                   </span>
                </div>
             </div>
             <p className="text-[9px] font-bold tracking-[0.2em] text-slate-600 uppercase">
                {language === 'hi' ? 'MP Police के लिए सर्वश्रेष्ठ तैयारी का मंच' : 'THE BEST PREPARATION PLATFORM FOR MP POLICE'}
             </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-amber-500/5 to-transparent" />
    </section>
  );
}
