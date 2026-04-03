'use client';

import React, { useState } from 'react';
import { Menu, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Question } from '@/types/quiz';

interface QuizPaletteProps {
  questions: Question[];
  answers: Record<string, number>;
  markedForReview: string[];
  currentIndex: number;
  totalQuestions: number;
  onJump: (index: number) => void;
  onSubmit: () => void;
  translations: {
    questionPalette: string;
    attempted: string;
    answered: string;
    notAnswered: string;
    review: string;
    current: string;
    submitTest: string;
  };
}

// Palette grid shared between mobile drawer and desktop sidebar
function PaletteGrid({
  questions,
  answers,
  markedForReview,
  currentIndex,
  onJump,
  onSubmit,
  translations: t,
  totalQuestions,
}: QuizPaletteProps & { onClose?: () => void }) {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Top Header Fixed */}
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <span className="text-base font-bold text-slate-900">{t.questionPalette}</span>
        <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
          {Object.keys(answers).length}/{totalQuestions} {t.attempted}
        </span>
      </div>

      {/* Middle Scrollable Questions Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-5 gap-2.5 pb-6">
          {questions.map((q, idx) => {
            const isAns = answers[q.id] !== undefined;
            const isMarked = markedForReview.includes(q.id);
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => onJump(idx)}
                className={cn(
                  'relative flex aspect-square items-center justify-center rounded-xl border-2 text-sm font-bold transition-all select-none',
                  isCurrent
                    ? 'z-10 scale-105 border-slate-800 bg-slate-800 text-white shadow-md'
                    : isAns
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : isMarked
                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                )}
              >
                {idx + 1}
                {isMarked && !isCurrent && (
                  <div className="absolute -top-1.5 -right-1.5 rounded-full border border-amber-200 bg-amber-100 p-0.5">
                    <Flag className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Fixed Area (Legend + Submit) */}
      <div className="mt-2 shrink-0 border-t border-slate-100 pt-4 bg-white/50 backdrop-blur-sm">
        {/* Legend */}
        <div className="mb-4 grid grid-cols-2 gap-3 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border border-emerald-500 bg-emerald-50" />{' '}
            {t.answered}
          </span>
          <span className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border border-slate-300 bg-white" /> {t.notAnswered}
          </span>
          <span className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border border-amber-300 bg-amber-50" /> {t.review}
          </span>
          <span className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-slate-800" /> {t.current}
          </span>
        </div>

        <Button
          className="h-12 w-full bg-slate-900 text-lg font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800"
          onClick={onSubmit}
        >
          {t.submitTest}
        </Button>
      </div>
    </div>
  );
}

// Mobile drawer trigger button
export function PaletteDrawerButton() {
  return (
    <Button variant="ghost" size="icon" className="relative text-slate-700 hover:bg-slate-100">
      <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="absolute top-1.5 right-1.5 h-2 w-2 animate-[pulse_3s_ease-in-out_infinite] rounded-full border-2 border-white bg-pink-400 opacity-70 shadow-sm sm:h-2.5 sm:w-2.5" />
    </Button>
  );
}

// Mobile: Sheet/Drawer palette
export function QuizPaletteMobile(props: QuizPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleJump = (idx: number) => {
    props.onJump(idx);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 animate-[pulse_3s_ease-in-out_infinite] rounded-full border-2 border-white bg-pink-400 opacity-70 shadow-sm sm:h-2.5 sm:w-2.5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="!z-[50] flex w-[85vw] flex-col p-0 sm:w-[400px]"
        overlayClassName="!z-[49]"
      >
        <SheetHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
          <SheetTitle className="sr-only">{props.translations.questionPalette}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden p-6">
          <PaletteGrid {...props} onJump={handleJump} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Desktop: Always-visible sidebar palette
export function QuizPaletteDesktop(props: QuizPaletteProps) {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col overflow-hidden border-l border-slate-200/80 bg-white/80 p-5 backdrop-blur-sm lg:flex xl:w-[320px]">
      <PaletteGrid {...props} />
    </aside>
  );
}
