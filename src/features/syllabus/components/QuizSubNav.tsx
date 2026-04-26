'use client';

import { useEffect, useMemo, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

import { BookMarked, Clock, LayoutGrid, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'full-tests',
    label: { en: 'Full tests', hi: 'फुल टेस्ट' },
    shortLabel: { en: 'Sub-wise', hi: 'विषय-वार' },
    title: {
      en: '100-Q MBT mocks and subject-wise unit tests',
      hi: '100 प्रश्न MBT मॉक और विषयवार यूनिट टेस्ट',
    },
    icon: LayoutGrid,
    href: '/syllabus/quiz/full-tests',
    color: 'bg-amber-500 border-amber-500',
    activeText: 'text-amber-600',
  },
  
  {
    id: 'chapters',
    label: { en: 'Chapters', hi: 'अध्याय' },
    shortLabel: { en: 'Topics', hi: 'टॉपिक' },
    title: {
      en: 'Topic tests by Science, GK, Reasoning, Quant, MP GK',
      hi: 'विज्ञान, GK, तर्क, गणित, MP GK — अध्यायवार',
    },
    icon: BookMarked,
    href: '/syllabus/quiz/chapters',
    color: 'bg-violet-600 border-violet-600',
    activeText: 'text-violet-600',
  },
  {
    id: 'one-liners',
    label: { en: '1-line GK', hi: 'वन-लाइन' },
    shortLabel: { en: '1-line', hi: 'लाइन' },
    title: {
      en: 'High-yield one-liner facts — glance Q&A, expand for deep notes',
      hi: 'महत्वपूर्ण वन-लाइन तथ्य — तेज़ रिवीज़न',
    },
    icon: Sparkles,
    href: '/syllabus/quiz/revision/gk-one-liners',
    color: 'bg-emerald-600 border-emerald-600',
    activeText: 'text-emerald-600',
  },
  {
    id: 'pyq',
    label: { en: 'PYQ', hi: 'PYQ' },
    shortLabel: { en: 'PYQ', hi: 'PYQ' },
    title: {
      en: 'Previous-year papers, mocks & PYQ intelligence',
      hi: 'पिछले वर्ष के पेपर, मॉक और विश्लेषण',
    },
    icon: Clock,
    href: '/syllabus/quiz/pyq',
    color: 'bg-slate-900 border-slate-900',
    activeText: 'text-slate-900',
  }
];

import { getUserTier } from '@/lib/access-control';

// Pages where bottom nav should be hidden (PYQ sub-pages)
const HIDDEN_BOTTOM_NAV_PATHS = [
  '/syllabus/quiz/pyq/intelligence',
  '/syllabus/quiz/pyq/facts',
  '/syllabus/quiz/pyq/analysis',
  '/syllabus/quiz/pyq/repeated',
  '/syllabus/quiz/pyq/question',
];

export function QuizSubNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, user: globalUser } = useSettingsStore();
  const hi = language === 'hi';
  const [isPending] = useTransition();

  const tier = getUserTier(globalUser);
  const isPro = tier === 'pro';

  const activeHref = useMemo(() => {
    if (pathname.startsWith('/syllabus/quiz/revision') || pathname === '/free-one-liners') {
      return isPro ? '/syllabus/quiz/revision/gk-one-liners' : '/free-one-liners';
    }
    if (pathname.startsWith('/syllabus/quiz/pyq')) {
      return '/syllabus/quiz/pyq';
    }
    if (
      pathname.startsWith('/syllabus/quiz/full-tests') ||
      pathname.startsWith('/syllabus/quiz/full-length') ||
      pathname.startsWith('/syllabus/quiz/units')
    ) {
      return '/syllabus/quiz/full-tests';
    }
    if (pathname.startsWith('/syllabus/quiz/chapters') || pathname.startsWith('/syllabus/quiz/topic')) {
      return '/syllabus/quiz/chapters';
    }
    const direct = NAV_ITEMS.find((item) => pathname === item.href)?.href;
    if (direct) return direct;
    return pathname;
  }, [pathname]);

  const springConfig: any = { type: 'spring', stiffness: 400, damping: 40 };

  // Check if bottom nav should be hidden
  const shouldHideBottomNav = HIDDEN_BOTTOM_NAV_PATHS.some(path => pathname.startsWith(path));

  // ⚡ LIGHT SPEED PREFETCH: All categories on mount
  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      if (item.href !== pathname) {
        router.prefetch(item.href);
      }
    });
  }, [router, pathname]);

  return (
    <>
      {/* 🖥️ DESKTOP NAV */}
      {!shouldHideBottomNav && (
        <div className="mb-12 hidden w-full items-center justify-center md:flex">
          <div className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto rounded-[2rem] border border-slate-200 bg-white p-1.5 shadow-sm">
            {NAV_ITEMS.map((item) => {
              const finalHref = (item.id === 'one-liners' && !isPro) ? '/free-one-liners' : item.href;
              const isActive = activeHref === finalHref;
              return (
                <Link
                  key={item.id}
                  href={finalHref}
                  title={hi ? item.title.hi : item.title.en}
                  prefetch={true}
                  scroll={false}
                  onMouseEnter={() => router.prefetch(finalHref)}
                  onTouchStart={() => router.prefetch(finalHref)}
                  className={cn(
                    'relative rounded-full px-5 py-2.5 text-xs font-black tracking-widest whitespace-nowrap uppercase transition-all outline-none',
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600',
                    isPending && !isActive && 'opacity-70'
                  )}
                >
                  <span className="relative z-10">{hi ? item.label.hi : item.label.en}</span>
                  {isActive && (
                    <motion.div
                      layoutId="quiz-subnav-active-desktop"
                      className={cn(
                        'absolute inset-0 rounded-full shadow-md',
                        item.color
                      )}
                      transition={springConfig}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 📱 MOBILE BOTTOM NAV */}
      {!shouldHideBottomNav && (
        <div className="safe-area-bottom fixed right-0 bottom-0 left-0 z-[100] border-t border-slate-200/50 bg-white/80 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-md items-center justify-around gap-1 px-4 py-3">
            {NAV_ITEMS.map((item) => {
              const finalHref = (item.id === 'one-liners' && !isPro) ? '/free-one-liners' : item.href;
              const isActive = activeHref === finalHref;
              return (
                <Link
                  key={item.id}
                  href={finalHref}
                  title={hi ? item.title.hi : item.title.en}
                  prefetch={true}
                  scroll={false}
                  onMouseEnter={() => router.prefetch(item.href)}
                  onTouchStart={() => router.prefetch(item.href)}
                  className={cn(
                    'relative flex min-w-[56px] max-w-[88px] shrink flex-1 flex-col items-center gap-1 transition-all',
                    isActive ? item.activeText : 'text-slate-400',
                    isPending && !isActive && 'opacity-70'
                  )}
                >
                  <div className={cn('flex h-full w-full flex-col items-center justify-center')}>
                    <div
                      className={cn(
                        'mb-0.5 rounded-2xl p-1.5 transition-all duration-300',
                        isActive ? cn('bg-slate-100/50 shadow-sm', item.activeText) : 'text-slate-400'
                      )}
                    >
                      <item.icon className={cn('h-5 w-5', isActive && 'fill-current')} />
                    </div>

                    <span
                      className={cn(
                        'text-[9px] leading-tight font-bold tracking-tight uppercase transition-all',
                        isActive ? 'scale-105 text-slate-900' : 'text-slate-400'
                      )}
                    >
                      {hi ? item.shortLabel.hi : item.shortLabel.en}
                    </span>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="quiz-subnav-active-mobile"
                      className={cn(
                        'absolute -bottom-1 h-1 w-8 rounded-t-full opacity-50',
                        item.color.split(' ')[0]
                      )}
                      transition={springConfig}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
