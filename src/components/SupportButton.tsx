'use client';

import { usePathname } from 'next/navigation';
import { SupportChat } from './SupportChat';

export function SupportButton() {
  const pathname = usePathname();
  const isAllowedPage =
    pathname === '/' ||
    pathname === '/profile' ||
    pathname === '/contact';

  if (!isAllowedPage) return null;

  return <SupportChat />;
}
