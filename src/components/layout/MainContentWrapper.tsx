'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Quiz play pages pe padding hatao — navbar waha dikhta hi nahi
  // Fixed navbar h-14 ke liye pt-14 lagta h, but play pages pe navbar return null karta h
  // Agar pt-14 rahega to 56px ka blank space dikhega top pe — isliye yaha hatate h
  const isQuizPlay = pathname?.includes('/quiz/play') || pathname?.includes('/free-quiz/play');

  // If we are on the quiz play page, we don't want the global padding
  // because that page handles its own layout/spacing.
  // Note: we do NOT apply overflow-hidden here — the quiz container div
  // (h-[100dvh] overflow-hidden) handles scroll locking internally.
  // Applying it on the wrapper breaks the result page which renders at the same URL.
  return <div className={cn(isQuizPlay ? '' : 'min-h-screen pt-14')}>{children}</div>;
}
