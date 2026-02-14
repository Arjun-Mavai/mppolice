'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  translations: {
    prev: string;
    next: string;
    submit: string;
  };
}

export function QuizNavigation({
  currentIndex,
  totalQuestions,
  onPrev,
  onNext,
  onSubmit,
  translations: t,
}: QuizNavigationProps) {
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="flex-shrink-0 border-t border-slate-200/80 bg-white/95 px-3 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] backdrop-blur-lg sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="h-11 rounded-xl px-5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 sm:h-12 sm:px-6 sm:text-base"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t.prev}
        </Button>

        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-900 sm:text-base">
          {currentIndex + 1} / {totalQuestions}
        </div>

        {isLast ? (
          <Button
            onClick={onSubmit}
            className="h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-200/50 transition-all hover:from-emerald-700 hover:to-teal-700 active:scale-95 sm:h-12 sm:px-6 sm:text-base"
          >
            {t.submit}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="h-11 rounded-xl bg-slate-800 px-5 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-700 active:scale-95 sm:h-12 sm:px-6 sm:text-base"
          >
            {t.next}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
