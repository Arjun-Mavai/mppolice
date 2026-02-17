'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isQuizPlay = pathname?.includes('/quiz/play');

  // If we are on the quiz play page, we don't want the global padding
  // because that page handles its own layout/spacing.
  return <div className={cn('min-h-screen', !isQuizPlay && 'pt-14')}>{children}</div>;
}
