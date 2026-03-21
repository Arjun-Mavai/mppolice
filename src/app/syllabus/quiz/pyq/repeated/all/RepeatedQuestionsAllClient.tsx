'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Filter,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { YearBadge } from '@/app/syllabus/quiz/pyq/intelligence/components/shared/UnitBadge';
import { PremiumExplanation } from '@/features/tests/components/PremiumExplanation';
import { RenderTableQuestion } from '@/features/tests/utils/questionFormatter';

interface RepeatedQuestion {
  id: string;
  text: string;
  textEn?: string | null;
  type?: string;
  options: any[];
  matchPairs?: any[];
  correctAnswer: string;
  explanation?: string | null;
  explanationEn?: string | null;
  subject: string | null;
  count: number;
  years: number[];
  occurrences: Array<{
    year: number;
    qNo: number;
    testTitle: string;
  }>;
}

interface RepeatedQuestionsAllClientProps {
  questions: RepeatedQuestion[];
}

export default function RepeatedQuestionsAllClient({ questions }: RepeatedQuestionsAllClientProps) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';
  
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAllExpanded, setShowAllExpanded] = useState(false);
  const [filterCount, setFilterCount] = useState('all');

  // Filter questions based on repeat count
  const filteredQuestions = questions.filter(q => {
    if (filterCount === 'all') return true;
    if (filterCount === '2') return q.count === 2;
    if (filterCount === '3') return q.count === 3;
    if (filterCount === '4+') return q.count >= 4;
    return true;
  });

  const toggleQuestion = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const toggleAll = () => {
    if (showAllExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredQuestions.map(q => q.id)));
    }
    setShowAllExpanded(!showAllExpanded);
  };

  const uniqueYears = Array.from(
    new Set(filteredQuestions.flatMap(q => q.years))
  ).sort((a, b) => b - a);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-8 w-8 rounded-full p-0 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-white sm:text-xl">
                  {isHindi ? 'सभी दोहराए गए प्रश्न' : 'All Repeated Questions'}
                </h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  {filteredQuestions.length} {isHindi ? 'प्रश्न पैटर्न' : 'question patterns'} • 
                  {isHindi ? ' व्याख्या के साथ' : ' with explanations'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter by count */}
              <div className="hidden items-center gap-1 sm:flex">
                {['all', '2', '3', '4+'].map((count) => (
                  <Button
                    key={count}
                    variant={filterCount === count ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterCount(count)}
                    className={cn(
                      'h-7 rounded-full px-3 text-xs font-bold',
                      filterCount === count
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-400 hover:bg-white/10'
                    )}
                  >
                    {count === 'all' ? 'All' : `${count}x`}
                  </Button>
                ))}
              </div>

              {/* Expand/Collapse All */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAll}
                className="h-7 gap-1.5 rounded-full px-3 text-xs font-bold text-amber-400 hover:bg-amber-500/10"
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
                {/* Repeat Count Badge */}
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-amber-100/20 bg-gradient-to-br from-amber-50/10 to-orange-50/10">
                  <span className="text-lg font-black leading-none text-amber-400">
                    {q.count}x
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-amber-600/60">
                    Times
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div 
                    className={cn(
                      'text-sm leading-relaxed text-slate-200 sm:text-base',
                      !isExpanded && 'line-clamp-2'
                    )}
                    dangerouslySetInnerHTML={{ 
                      __html: displayText.slice(0, 200) + (displayText.length > 200 ? '...' : '')
                    }}
                  />
                  
                  {/* Year badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {q.years.map((year) => (
                      <YearBadge key={year} year={year} variant="amber" />
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 items-center">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-amber-400" />
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

                      {/* Occurrence details */}
                      <div className="space-y-2 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {isHindi ? 'प्रकटीकरण' : 'Occurrences'}
                        </h5>
                        <div className="space-y-1">
                          {q.occurrences.map((occ, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-slate-500">
                              <span>{occ.testTitle}</span>
                              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                                Q.{occ.qNo}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Link to detailed view */}
                      <Link
                        href={`/syllabus/quiz/pyq/repeated/${q.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300"
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