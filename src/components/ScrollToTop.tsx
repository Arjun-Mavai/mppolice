'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  if (pathname === '/tests') return null;

  useEffect(() => {
    setIsMounted(true);
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isMounted) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed right-6 bottom-24 z-[99]', // Positioned above the Support Button (bottom-6)
        'rounded-full p-3 shadow-xl shadow-indigo-500/20',
        'border border-slate-100 bg-white text-slate-600',
        'hover:border-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-indigo-600/30',
        'group transform transition-all duration-300 ease-out',
        isVisible
          ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none translate-y-4 scale-95 opacity-0'
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp
        size={20}
        strokeWidth={2.5}
        className="transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </button>
  );
}
