"use client"

import React from 'react';
import { CheckCircle2, X, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Question } from '@/types/quiz';
import { FormattedQuestionText } from '../../utils/questionFormatter';

interface QuizQuestionProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | undefined;
  isAnswered: boolean;
  instantModeEnabled: boolean;
  isMarkedForReview: boolean;
  language: string;
  onOptionSelect: (idx: number) => void;
  onToggleReview: () => void;
  getParsedOptions: (options: any) => any[];
  translations: {
    question: string;
    markReview: string;
    unmark: string;
  };
}

export function QuizQuestion({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  isAnswered,
  instantModeEnabled,
  isMarkedForReview,
  language,
  onOptionSelect,
  onToggleReview,
  getParsedOptions,
  translations: t,
}: QuizQuestionProps) {
  const showFeedback = instantModeEnabled && isAnswered;

  const rawOptions = (language === 'hi' && (question as any).options_hi)
    ? (question as any).options_hi
    : question.options;
  const parsedOptions = getParsedOptions(rawOptions);

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5">
      {/* Question Header */}
      <div className="flex justify-between items-center">
        <div className="text-sm sm:text-base font-bold text-slate-400 uppercase tracking-wider">
          {t.question} {questionIndex + 1}/{totalQuestions}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleReview}
          className={cn(
            "gap-1.5 font-medium transition-colors hover:bg-transparent text-xs sm:text-sm h-8 px-2 sm:px-3",
            isMarkedForReview ? "text-amber-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Flag className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isMarkedForReview && "fill-current")} />
          <span className="hidden sm:inline">{isMarkedForReview ? t.unmark : t.markReview}</span>
        </Button>
      </div>

      {/* Question Text - Smart Formatted */}
      <FormattedQuestionText 
        text={language === 'en' && question.questionEn ? question.questionEn : question.question}
        className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900 leading-relaxed"
      />

      {/* Matching Questions */}
      {question.type === 'matching' && question.matchPairs && (
        <div className="mb-6 mt-4 pl-1">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-2xl">
            <div className="font-bold text-slate-800 border-b-2 border-slate-800 pb-1 mb-2">
              {language === 'hi' ? 'सूची-I' : 'List-I'}
            </div>
            <div className="font-bold text-slate-800 border-b-2 border-slate-800 pb-1 mb-2">
              {language === 'hi' ? 'सूची-II' : 'List-II'}
            </div>
            <div className="space-y-3">
              {question.matchPairs.map((pair, idx) => (
                <div key={`col1-${idx}`} className="flex gap-2 items-start text-base sm:text-lg">
                  <span className="font-semibold text-slate-900 min-w-[24px]">{pair.id}</span>
                  <span className="text-slate-800">
                    {language === 'en' && pair.labelEn ? pair.labelEn : pair.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {question.matchPairs.map((pair, idx) => (
                <div key={`col2-${idx}`} className="flex gap-2 items-start text-base sm:text-lg">
                  <span className="font-semibold text-slate-900 min-w-[24px]">{pair.matchId}</span>
                  <span className="text-slate-800">
                    {language === 'en' && pair.matchEn ? pair.matchEn : pair.match}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Options */}
      {/* Options — har option pe click karne pe instant feedback milta h (agar instant mode ON h) */}
      <div className="space-y-3">
        {parsedOptions.map((opt: any, idx: number) => {
          const isSelected = selectedAnswer === idx;
          // Bhai correctAnswer NaN ho sakta h agar DB me galat data h — safe check lagao
          const correctIdx = typeof question.correctAnswer === 'number' && !isNaN(question.correctAnswer)
            ? question.correctAnswer
            : -1; // -1 = koi bhi match nahi karega
          const isCorrect = correctIdx === idx;

          let optionText = opt;
          if (typeof opt === 'object' && opt !== null) {
            optionText = language === 'hi'
              ? (opt.text || opt.textEn || opt.text_en || JSON.stringify(opt))
              : (opt.textEn || opt.text_en || opt.text || JSON.stringify(opt));
          }

          return (
            <div
              key={idx}
              onClick={() => onOptionSelect(idx)}
              className={cn(
                "relative p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden group active:scale-[0.98]",
                // Before answering — normal hover
                !isAnswered && "hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm",
                !isAnswered && isSelected && "border-slate-800 bg-slate-50 font-semibold shadow-sm",
                // Instant mode feedback — green for correct, red for wrong selection
                showFeedback && isCorrect && "!border-emerald-500 !bg-emerald-50 font-semibold shadow-md",
                showFeedback && isSelected && !isCorrect && "!border-red-400 !bg-red-50 font-semibold shadow-md",
                // Normal mode (no instant feedback) — just show selected
                isAnswered && !showFeedback && isSelected && "border-slate-800 bg-slate-50",
                // Unselected options fade out after answering
                isAnswered && !isSelected && !(showFeedback && isCorrect) && "opacity-40 border-slate-200",
              )}
            >
              <div className="flex justify-between items-center relative z-10">
                <span className={cn(
                  "text-base sm:text-lg leading-relaxed pr-4",
                  // Text color bhi strong karo feedback me — green/red clearly dikhe
                  showFeedback && isCorrect && "text-emerald-800 font-bold",
                  showFeedback && isSelected && !isCorrect && "text-red-800 font-bold",
                  !showFeedback && isSelected && "text-slate-900 font-semibold",
                  !showFeedback && !isSelected && "text-slate-700",
                )}>
                  {optionText}
                </span>

                <div className="shrink-0">
                  {showFeedback ? (
                    isCorrect ? (
                      <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    ) : isSelected ? (
                      <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                        <X className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                    )
                  ) : (
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 transition-colors",
                      isSelected ? "border-slate-900 bg-slate-900" : "border-slate-200 group-hover:border-slate-300"
                    )}>
                      {isSelected && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Correct answer ke right side me green stripe */}
              {showFeedback && isCorrect && (
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
              )}
              {/* Wrong selected answer ke right side me red stripe */}
              {showFeedback && isSelected && !isCorrect && (
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-red-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
