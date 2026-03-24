'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, ChevronUp, Repeat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { YearBadge } from './shared/UnitBadge';

export interface QuestionData {
  id: string;
  text: string;
  textEn?: string | null;
  year: number;
  qNo?: number;
  options?: string[];
  optionsEn?: string[];
  correctAnswer?: number;
}

interface QuestionItemProps {
  question: QuestionData;
  index: number;
  isHindi: boolean;
  repeatCount?: number;
  showYear?: boolean;
  variant?: 'compact' | 'full';
  defaultExpanded?: boolean;
}

export function QuestionItem({
  question,
  index,
  isHindi,
  repeatCount = 0,
  showYear = true,
  variant = 'compact',
  defaultExpanded = false,
}: QuestionItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const displayText = isHindi ? question.text : question.textEn || question.text;
  const altText = isHindi ? question.textEn : question.text;

  if (variant === 'compact') {
    return (
      <div className="group/question relative">
        <div
          className="flex cursor-pointer items-start gap-3 p-4 transition-all hover:bg-slate-800/40 sm:p-5"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px] text-slate-500">
            {index + 1}
          </span>

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'text-sm leading-relaxed text-slate-300 transition-colors',
                isExpanded ? 'text-white' : 'line-clamp-2'
              )}
            >
              {displayText}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {question.qNo && (
              <span className="font-mono text-[10px] text-slate-500">
                Q{question.qNo}
              </span>
            )}
            {showYear && <YearBadge year={question.year} variant="pink" />}
            {repeatCount > 1 && (
              <Badge className="h-5 border-none bg-amber-500/20 px-1.5 text-[10px] text-amber-400">
                <Repeat className="mr-0.5 h-3 w-3" />
                {isHindi ? `${repeatCount}x रिपीट` : `Repeated ${repeatCount}x`}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-indigo-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-600" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 border-t border-slate-800/50 bg-slate-900/50 px-4 py-4 sm:px-5">
                {/* Full question text */}
                <p className="text-sm leading-relaxed text-slate-200">{displayText}</p>

                {/* Alternate language */}
                {altText && altText !== displayText && (
                  <p className="text-xs leading-relaxed text-slate-500 italic">{altText}</p>
                )}

                {/* Options if available */}
                {question.options && question.options.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {question.options.map((opt, i) => {
                      const optEn = question.optionsEn?.[i];
                      const isCorrect = question.correctAnswer === i;
                      return (
                        <div
                          key={i}
                          className={cn(
                            'rounded-lg border px-3 py-2 text-sm',
                            isCorrect
                              ? 'border-green-500/30 bg-green-500/10 text-green-300'
                              : 'border-slate-700/50 bg-slate-800/30 text-slate-400'
                          )}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + i)}.</span>{' '}
                          {isHindi ? opt : optEn || opt}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* View full question link */}
                <Link
                  href={`/syllabus/quiz/pyq/question/${question.id}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  {isHindi ? 'पूरा प्रश्न देखें' : 'View full question'}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full variant - used in detailed views
  return (
    <Link href={`/syllabus/quiz/pyq/question/${question.id}`} className="block">
      <div className="group/question relative cursor-pointer overflow-hidden bg-slate-950/20 p-5 transition-all hover:bg-slate-900/40 sm:p-6">
        <div className="flex items-start gap-4">
          {showYear && (
            <div className="mt-1 flex items-center gap-1.5">
              {question.qNo && (
                <span className="font-mono text-[10px] text-slate-500">
                  Q{question.qNo}
                </span>
              )}
              <YearBadge year={question.year} variant="pink" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed font-medium break-words whitespace-normal text-slate-300 transition-colors group-hover/question:text-white sm:text-base">
              {displayText}
            </p>
            {altText && altText !== displayText && (
              <p className="mt-2 text-xs leading-relaxed break-words whitespace-normal text-slate-500 italic sm:text-sm">
                {altText}
              </p>
            )}
          </div>
          {repeatCount > 1 && (
            <Badge className="shrink-0 border-none bg-amber-500/20 px-2 py-1 text-xs text-amber-400">
              <Repeat className="mr-1 h-3 w-3" />
              {repeatCount}x
            </Badge>
          )}
          <ArrowRight className="h-4 w-4 shrink-0 -translate-x-1 text-slate-800 opacity-0 transition-all group-hover/question:translate-x-0 group-hover/question:text-pink-500 group-hover/question:opacity-100" />
        </div>
      </div>
    </Link>
  );
}

interface QuestionListProps {
  questions: QuestionData[];
  isHindi: boolean;
  getRepeatCount?: (questionId: string) => number;
  showYears?: boolean;
  groupByYear?: boolean;
  maxVisible?: number;
  variant?: 'compact' | 'full';
  showAllExpanded?: boolean;
}

export function QuestionList({
  questions,
  isHindi,
  getRepeatCount,
  showYears = true,
  groupByYear = false,
  maxVisible,
  variant = 'compact',
  showAllExpanded = false,
}: QuestionListProps) {
  const [showAll, setShowAll] = useState(false);

  if (groupByYear) {
    // Group questions by year
    const byYear = questions.reduce(
      (acc, q) => {
        if (!acc[q.year]) acc[q.year] = [];
        acc[q.year].push(q);
        return acc;
      },
      {} as Record<number, QuestionData[]>
    );

    const sortedYears = Object.keys(byYear)
      .map(Number)
      .sort((a, b) => b - a);

    return (
      <div className="divide-y divide-slate-800/30">
        {sortedYears.map((year) => (
          <div key={year}>
            <div className="sticky top-0 z-10 flex items-center gap-2 bg-slate-900/95 px-4 py-2 backdrop-blur-sm">
              <YearBadge year={year} variant="indigo" />
              <span className="text-xs text-slate-500">
                ({byYear[year].length} {isHindi ? 'प्रश्न' : 'questions'})
              </span>
            </div>
            <div className="divide-y divide-slate-800/20">
              {byYear[year].map((q, idx) => (
                <QuestionItem
                  key={q.id}
                  question={q}
                  index={idx}
                  isHindi={isHindi}
                  repeatCount={getRepeatCount?.(q.id) || 0}
                  showYear={false}
                  variant={variant}
                  defaultExpanded={showAllExpanded}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const visibleQuestions = maxVisible && !showAll ? questions.slice(0, maxVisible) : questions;
  const hasMore = maxVisible && questions.length > maxVisible;

  return (
    <div>
      <div className="divide-y divide-slate-800/30">
        {visibleQuestions.map((q, idx) => (
          <QuestionItem
            key={q.id}
            question={q}
            index={idx}
            isHindi={isHindi}
            repeatCount={getRepeatCount?.(q.id) || 0}
            showYear={showYears}
            variant={variant}
            defaultExpanded={showAllExpanded}
          />
        ))}
      </div>

      {hasMore && !showAll && (
        <div className="border-t border-slate-800/30 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(true)}
            className="w-full text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
          >
            {isHindi ? `सभी ${questions.length} प्रश्न देखें` : `Show all ${questions.length} questions`}
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
