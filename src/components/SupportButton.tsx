'use client';

import { usePathname } from 'next/navigation';
import { SupportChat } from './SupportChat';

export function SupportButton() {
  const pathname = usePathname();
  const isQuizPlay =
    pathname?.includes('/quiz/play') || pathname?.includes('/free-quiz/play');

  if (isQuizPlay) return null;

  return <SupportChat />;
}
