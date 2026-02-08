"use client"

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
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-slate-900 text-base">{t.questionPalette}</span>
        <span className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
          {Object.keys(answers).length}/{totalQuestions} {t.attempted}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2.5 mb-6">
        {questions.map((q, idx) => {
          const isAns = answers[q.id] !== undefined;
          const isMarked = markedForReview.includes(q.id);
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={q.id}
              onClick={() => onJump(idx)}
              className={cn(
                "aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition-all border-2 relative select-none",
                isCurrent
                  ? "border-slate-800 bg-slate-800 text-white shadow-md scale-105 z-10"
                  : isAns
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                    : isMarked
                      ? "bg-amber-50 border-amber-300 text-amber-700"
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50"
              )}
            >
              {idx + 1}
              {isMarked && !isCurrent && (
                <div className="absolute -top-1.5 -right-1.5 bg-amber-100 rounded-full p-0.5 border border-amber-200">
                  <Flag className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 font-medium mb-4">
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-50 border border-emerald-500" /> {t.answered}
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-slate-300 bg-white" /> {t.notAnswered}
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-50 border border-amber-300" /> {t.review}
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-800" /> {t.current}
        </span>
      </div>

      <Button
        className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/10"
        onClick={onSubmit}
      >
        {t.submitTest}
      </Button>
    </>
  );
}

// Mobile drawer trigger button
export function PaletteDrawerButton() {
  return (
    <Button variant="ghost" size="icon" className="hover:bg-slate-100 relative text-slate-700">
      <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
      <span className="absolute top-1.5 right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-pink-400 border-2 border-white rounded-full animate-[pulse_3s_ease-in-out_infinite] opacity-70 shadow-sm" />
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
        <PaletteDrawerButton />
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] sm:w-[400px] flex flex-col p-0">
        <SheetHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
          <SheetTitle className="sr-only">{props.translations.questionPalette}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <PaletteGrid {...props} onJump={handleJump} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Desktop: Always-visible sidebar palette
export function QuizPaletteDesktop(props: QuizPaletteProps) {
  return (
    <aside className="hidden lg:flex flex-col w-[280px] xl:w-[320px] shrink-0 border-l border-slate-200/80 bg-white/80 backdrop-blur-sm overflow-y-auto p-5">
      <PaletteGrid {...props} />
    </aside>
  );
}
