'use client';

import { usePathname } from 'next/navigation';
import { QuizSubNav } from '@/features/syllabus/components/QuizSubNav';

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPlayPage = pathname?.includes('/play');

  if (isPlayPage) {
    return <div className="relative min-h-screen bg-[#fafbfc]">{children}</div>;
  }

  return (
    <div className="relative min-h-screen bg-[#fafbfc]">
      {/* 
        Shared Sticky Header for Desktop
      */}
      <div className="sticky top-0 z-40 hidden w-full border-b border-slate-200 bg-white/80 backdrop-blur-md md:block">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 md:pt-24 lg:px-8">
          <QuizSubNav />
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden">
        <QuizSubNav />
      </div>

      {children}
    </div>
  );
}
