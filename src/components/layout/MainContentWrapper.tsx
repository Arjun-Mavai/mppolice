'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { useDisableSelection } from '@/hooks/useDisableSelection';

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Quiz play pages pe padding hatao — navbar waha dikhta hi nahi
  const isQuizPlay = pathname?.includes('/quiz/play') || pathname?.includes('/free-quiz/play');
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply anti-copy globally EXCEPT for login and admin pages
  // Admins need to copy-paste for content generation, users need it for login.
  const isLoginPage = pathname === '/login';
  const isAdminPage = pathname?.startsWith('/admin');
  const shouldDisableSelection = !isLoginPage && !isAdminPage;
  
  useDisableSelection(containerRef, shouldDisableSelection);

  return <div ref={containerRef} className={cn(isQuizPlay ? '' : 'min-h-screen pt-14')}>{children}</div>;
}
