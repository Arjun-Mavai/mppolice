"use client"

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
    <div className="flex-shrink-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-3 sm:px-6 py-3 sm:py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl font-semibold disabled:opacity-50 text-sm sm:text-base transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {t.prev}
        </Button>

        <div className="text-sm sm:text-base font-bold text-slate-900 bg-slate-100 px-4 py-2 rounded-full">
          {currentIndex + 1} / {totalQuestions}
        </div>

        {isLast ? (
          <Button
            onClick={onSubmit}
            className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200/50 text-sm sm:text-base transition-all active:scale-95"
          >
            {t.submit}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-white shadow-md text-sm sm:text-base transition-all active:scale-95"
          >
            {t.next}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
