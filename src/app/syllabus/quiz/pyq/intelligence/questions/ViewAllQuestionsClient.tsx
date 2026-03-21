'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, Filter, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PremiumExplanation } from '@/features/tests/components/PremiumExplanation';
import { RenderTableQuestion } from '@/features/tests/utils/questionFormatter';
import { YearBadge } from '../components/shared/UnitBadge';
import { formatUnitTitle, getUnitColor } from '../components/shared/constants';

interface QuestionData {
  id: string;
  text: string;
  textEn?: string | null;
  year?: number;
  qNo?: number;
  type?: string;
  options?: any[];
  matchPairs?: any[];
  correctAnswer?: number;
  explanation?: string | null;
  explanationEn?: string | null;
}

interface ViewAllQuestionsClientProps {
  unitId: string;
  unitTitle: string;
  questions: QuestionData[];
  source: 'paper' | 'overall' | 'topic';
  topicTitle?: string;
  year?: number;
}

export default function ViewAllQuestionsClient({
  unitId,
  unitTitle,
  questions,
  source,
  topicTitle,
  year,
}: ViewAllQuestionsClientProps) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAllExpanded, setShowAllExpanded] = useState(false);
  const [filterYear, setFilterYear] = useState<number | null>(null);

  // Get unique years for filtering
  const uniqueYears = useMemo(() => {
    return Array.from(new Set(questions.map((q) => q.year).filter((y): y is number => y !== undefined))).sort((a, b) => b - a);
  }, [questions]);

  // Filter questions by year
  const filteredQuestions = useMemo(() => {
    if (!filterYear) return questions;
    return questions.filter((q) => q.year === filterYear);
  }, [questions, filterYear]);

  const toggleQuestion = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (showAllExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredQuestions.map((q) => q.id)));
    }
    setShowAllExpanded(!showAllExpanded);
  }, [showAllExpanded, filteredQuestions]);

  const colorClass = getUnitColor(unitId);

  // Title based on source
  const pageTitle = useMemo(() => {
    if (source === 'topic' && topicTitle) {
      return topicTitle;
    }
    if (source === 'paper' && year) {
      return `MPPSC Prelims ${year} - ${formatUnitTitle(unitId)}`;
    }
    return `${formatUnitTitle(unitId)} - ${unitTitle}`;
  }, [source, topicTitle, year, unitId, unitTitle]);

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-white selection:bg-indigo-500/30">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-rose-500/10 blur-[100px]" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex h-16 items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold text-white sm:text-lg">
                {pageTitle}
              </h1>
              <p className="text-xs text-slate-400">
                {filteredQuestions.length} {isHindi ? 'प्रश्न' : 'Questions'}
              </p>
            </div>
            <div className={cn('h-8 w-2 rounded-full', colorClass)} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="sticky top-16 z-20 border-b border-white/5 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Year Filter */}
            {uniqueYears.length > 1 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <div className="flex gap-1">
                  <Button
                    variant={filterYear === null ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterYear(null)}
                    className={cn(
                      'h-7 rounded-full px-3 text-xs font-bold',
                      filterYear === null
                        ? 'bg-indigo-500 text-white'
                        : 'text-slate-400 hover:bg-white/10'
                    )}
                  >
                    All
                  </Button>
                  {uniqueYears.slice(0, 6).map((y) => (
                    <Button
                      key={y}
                      variant={filterYear === y ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterYear(y)}
                      className={cn(
                        'h-7 rounded-full px-3 text-xs font-bold',
                        filterYear === y
                          ? 'bg-indigo-500 text-white'
                          : 'text-slate-400 hover:bg-white/10'
                      )}
                    >
                      {y}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Expand/Collapse All */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAll}
              className="ml-auto h-7 gap-1.5 rounded-full px-3 text-xs font-bold text-indigo-400 hover:bg-indigo-500/10"
            >
              {showAllExpanded ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  {isHindi ? 'सब बंद करें' : 'Collapse All'}
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  {isHindi ? 'सब खोलें' : 'Expand All'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="relative mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6">
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedIds.has(q.id);
          const displayText = isHindi ? q.text : (q.textEn || q.text);
          const altText = isHindi ? q.textEn : q.text;

          return (
            <Card
              key={q.id}
              className="overflow-hidden border-slate-800 bg-slate-900/50 shadow-lg"
            >
              {/* Question Header */}
              <div
                className="flex cursor-pointer items-start gap-4 p-4 transition-colors hover:bg-white/5 sm:p-5"
                onClick={() => toggleQuestion(q.id)}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 font-mono text-xs font-bold text-slate-400">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div 
                    className={cn(
                      'text-sm leading-relaxed text-slate-200 sm:text-base',
                      !isExpanded && 'line-clamp-2'
                    )}
                    dangerouslySetInnerHTML={{ 
                      __html: displayText.slice(0, 150) + (displayText.length > 150 ? '...' : '')
                    }}
                  />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {q.qNo && (
                    <span className="text-xs font-mono text-slate-500">
                      Q{q.qNo}
                    </span>
                  )}
                  <YearBadge year={q.year ?? 2020} variant="indigo" />
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-indigo-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-600" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 border-t border-slate-800 bg-slate-950/50 p-4 sm:p-5">
                      {/* Full Question */}
                      <div>
                        {q.type === 'matching' && q.matchPairs && q.matchPairs.length > 0 ? (
                          <>
                            <div 
                              className="prose prose-slate prose-sm max-w-none text-slate-200 sm:prose-base mb-4"
                              dangerouslySetInnerHTML={{ 
                                __html: displayText
                                  .replace(/List-?\s*I{1,2}\b.*$/gim, '') // Remove List-I/List-II text
                                  .replace(/सूची-?\s*I{1,2}\b.*$/gim, '') // Remove Hindi list text
                                  .replace(/\n/g, '<br/>')
                                  .replace(/(?:\r\n|\r|\n)/g, '<br/>')
                                  .trim()
                              }} 
                            />
                            <RenderTableQuestion 
                              matchPairs={q.matchPairs}
                              language={isHindi ? 'hi' : 'en'}
                              className="mb-4"
                              darkMode={true}
                            />
                          </>
                        ) : (
                          <div 
                            className="prose prose-slate prose-sm max-w-none text-slate-200 sm:prose-base"
                            dangerouslySetInnerHTML={{ 
                              __html: displayText
                                .replace(/\n/g, '<br/>')
                                .replace(/(?:\r\n|\r|\n)/g, '<br/>')
                            }} 
                          />
                        )}
                        {altText && altText !== displayText && (
                          <div 
                            className="mt-3 prose prose-slate prose-sm max-w-none text-slate-500 italic"
                            dangerouslySetInnerHTML={{ 
                              __html: altText
                                .replace(/\n/g, '<br/>')
                                .replace(/(?:\r\n|\r|\n)/g, '<br/>')
                            }} 
                          />
                        )}
                      </div>

                      {/* Options */}
                      {q.options && q.options.length > 0 && (
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            // Parse options if they're JSON objects with text/text_en, or just use as strings
                            const parsedOpt = typeof opt === 'object' && opt !== null ? opt : { text: opt };
                            const isCorrect = Number(q.correctAnswer) === optIdx;
                            const optText = isHindi 
                              ? (parsedOpt.text || parsedOpt) 
                              : (parsedOpt.text_en || parsedOpt.textEn || parsedOpt.text || parsedOpt);

                            return (
                              <div
                                key={optIdx}
                                className={cn(
                                  'rounded-lg border px-4 py-3 text-sm transition-colors',
                                  isCorrect
                                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                                    : 'border-slate-700/50 bg-slate-800/30 text-slate-400'
                                )}
                              >
                                <span className="mr-2 font-bold">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <div dangerouslySetInnerHTML={{ __html: optText }} />
                                {isCorrect && (
                                  <Badge className="ml-2 h-5 border-none bg-emerald-500/20 px-1.5 text-[10px] text-emerald-400">
                                    ✓ Correct
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Explanation */}
                      {(q.explanation || q.explanationEn) && (
                        <PremiumExplanation
                          explanation={isHindi ? (q.explanation || '') : (q.explanationEn || q.explanation || '')}
                          darkMode={true}
                          compact={true}
                          language={isHindi ? 'hi' : 'en'}
                        />
                      )}

                      {/* Link to full question page */}
                      <Link
                        href={`/syllabus/quiz/pyq/question/${q.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                      >
                        View detailed analysis →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <Filter className="mb-4 h-12 w-12 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-300">
              {isHindi ? 'कोई प्रश्न नहीं मिला' : 'No questions found'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {isHindi ? 'इस फ़िल्टर के लिए कोई प्रश्न नहीं है' : 'No questions match this filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
