'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Home,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useGuestResultStore } from '../store/guestResultStore';
import { getRandomFeedback } from '@/features/tests/constants/feedback';
import { useSettingsStore } from '@/store/useSettingsStore';
import {
  FormattedQuestionText,
  RenderTableQuestion,
} from '@/features/tests/utils/questionFormatter';
import { PremiumExplanation } from '@/features/tests/components/PremiumExplanation';

export function GuestResultClient() {
  const router = useRouter();
  const { result, clearResult } = useGuestResultStore();
  const { language } = useSettingsStore();
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (!result) {
      router.replace('/');
    }
  }, [result, router]);

  if (!result) return null;

  const {
    score,
    totalQuestions,
    correctCount,
    wrongCount,
    skippedCount,
    timeTaken,
    questions,
    answers,
  } = result;

  // Max marks calculation to calculate percentage
  let maxMarks = 0;
  // @ts-ignore
  questions.forEach((q: any) => {
    maxMarks += q.marks || 2; // Default to 2 if not set, matches config
  });

  const scorePercentage = maxMarks > 0 ? Math.round((score / maxMarks) * 100) : 0;
  const feedbackMessage = getRandomFeedback(scorePercentage, language);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900 p-4 shadow-md">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Home className="h-5 w-5" />
          </Button>
          <h1 className="font-display max-w-[200px] truncate text-lg font-bold text-white sm:max-w-md">
            Guest Results
          </h1>
        </div>
      </div>

      {/* Score Header */}
      <div className="relative overflow-hidden bg-slate-900 p-6 pb-24 text-white">
        {/* Background effects */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-slate-700/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"></div>

        <div className="relative z-10 mx-auto max-w-3xl space-y-6 text-center">
          <h1 className="font-display text-2xl font-bold opacity-90">Test Results</h1>

          <div className="flex flex-col items-center">
            <div
              className={cn(
                'relative mb-4 flex h-40 w-40 items-center justify-center rounded-full border-4 bg-slate-800 shadow-2xl',
                scorePercentage >= 70
                  ? 'border-emerald-500 text-emerald-500 shadow-emerald-900/50'
                  : scorePercentage >= 40
                    ? 'border-amber-500 text-amber-500 shadow-amber-900/50'
                    : 'border-red-500 text-red-500 shadow-red-900/50'
              )}
            >
              <div className="text-center">
                <div className="text-4xl font-bold">{score}</div>
                <div className="text-sm font-medium opacity-80">/ {maxMarks}</div>
                <div className="mt-1 text-[10px] font-bold tracking-wider uppercase opacity-60">
                  Score
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold">
              {scorePercentage >= 70
                ? 'Excellent Work!'
                : scorePercentage >= 40
                  ? 'Keep Practicing!'
                  : 'Needs Improvement'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Time Taken: {Math.floor(timeTaken / 60)}m {Math.floor(timeTaken % 60)}s
            </p>
          </div>

          {/* Upsell Banner for Ranking */}
          <div className="mt-6 mb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-700/50 bg-yellow-900/20 px-6 py-2 shadow-lg backdrop-blur-sm">
              <span className="text-2xl">🏆</span>
              <div className="text-left">
                <div className="text-[10px] font-bold tracking-widest text-yellow-500 uppercase">
                  Want to see your Rank?
                </div>
                <div className="text-sm font-bold text-white">
                  <button
                    onClick={() => router.push('/login')}
                    className="underline hover:text-yellow-400"
                  >
                    Sign in
                  </button>{' '}
                  to view leaderboard
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-emerald-400">{correctCount}</div>
              <div className="text-[10px] font-bold text-emerald-200 uppercase">Correct</div>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-red-400">{wrongCount}</div>
              <div className="text-[10px] font-bold text-red-200 uppercase">Wrong</div>
            </div>
            <div className="rounded-xl border border-slate-500/20 bg-slate-500/10 p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-slate-300">{skippedCount}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Skipped</div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative mx-auto mt-8 max-w-xl"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-slate-700/20 to-slate-700/20 opacity-50 blur-xl transition-opacity group-hover:opacity-100"></div>
            <div className="relative z-10 rounded-2xl border border-white/20 bg-white/10 p-6 text-left shadow-2xl backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-white uppercase">
                  <Sparkles className="h-4 w-4 fill-yellow-400 text-yellow-400" /> Smart Performance
                  Analysis
                </h3>
                <span
                  className={cn(
                    'rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                    scorePercentage >= 80
                      ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-300'
                      : scorePercentage >= 60
                        ? 'border border-amber-500/30 bg-amber-500/20 text-amber-300'
                        : 'border border-red-500/30 bg-red-500/20 text-red-300'
                  )}
                >
                  {scorePercentage >= 80
                    ? 'Excellent'
                    : scorePercentage >= 60
                      ? 'Good'
                      : 'Needs Focus'}
                </span>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-slate-300">
                    <span>Knowledge Retention</span>
                    <span>{scorePercentage}%</span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full border border-white/5 bg-slate-800/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scorePercentage}%` }}
                      transition={{ duration: 1.5, type: 'spring' }}
                      className={cn(
                        'relative h-full overflow-hidden rounded-full',
                        scorePercentage > 70
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : scorePercentage > 40
                            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                            : 'bg-gradient-to-r from-red-500 to-rose-400'
                      )}
                    >
                      <div className="absolute inset-0 skew-x-12 animate-[shimmer_2s_infinite] bg-white/20"></div>
                    </motion.div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-slate-900/40 p-4 shadow-inner">
                  <p className="text-sm leading-relaxed font-medium text-slate-200">
                    <Quote className="-mt-1 mr-2 inline h-4 w-4 rotate-180 transform text-slate-400" />
                    {feedbackMessage}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Detailed Analysis Section */}
      <div className="relative z-20 mx-auto -mt-4 max-w-3xl space-y-4 px-4">
        {/* @ts-ignore */}
        {questions.map((q: any, idx: number) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          const isSkipped = userAnswer === undefined;
          const isExpanded = expandedQuestion === q.id;

          return (
            <Card
              key={q.id}
              className={cn(
                'overflow-hidden border-l-4',
                isCorrect
                  ? 'border-l-emerald-500'
                  : isSkipped
                    ? 'border-l-slate-300'
                    : 'border-l-red-500'
              )}
            >
              <div
                onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                className="cursor-pointer p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex gap-4">
                  <div className="mt-1">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : isSkipped ? (
                      <AlertCircle className="h-6 w-6 text-slate-300" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm leading-snug font-bold text-slate-900 md:text-base">
                      <span className="mr-2 text-slate-400">Q{idx + 1}.</span>
                      <FormattedQuestionText text={q.question} className="inline" />

                      {q.type === 'matching' && q.matchPairs && (
                        <RenderTableQuestion
                          text={q.question}
                          matchPairs={q.matchPairs}
                          language="hi"
                          className="mt-2"
                        />
                      )}
                    </div>

                    {q.questionEn && (
                      <div className="mt-2 text-sm text-slate-500">
                        <FormattedQuestionText text={q.questionEn} />
                        {q.type === 'matching' && q.matchPairs && (
                          <RenderTableQuestion
                            text={q.questionEn}
                            matchPairs={q.matchPairs}
                            language="en"
                            className="mt-2 border-slate-300"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-4 border-t border-slate-100 bg-slate-50/50 p-4"
                >
                  {q.type === 'matching' && (
                    <div className="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
                      Select the correct code:
                    </div>
                  )}
                  <div className="space-y-2">
                    {/* @ts-ignore */}
                    {q.options.map((opt: any, optIdx: number) => {
                      const isSelected = userAnswer === optIdx;
                      const isCorrectOpt = q.correctAnswer === optIdx;

                      let styleClass = 'border-slate-200 bg-white text-slate-600';
                      if (isCorrectOpt)
                        styleClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                      else if (isSelected && !isCorrectOpt)
                        styleClass =
                          'border-red-500 bg-red-50 text-red-800 line-through decoration-red-500/50';

                      let optionText: string;
                      if (typeof opt === 'string') {
                        optionText = opt;
                      } else {
                        optionText =
                          language === 'hi'
                            ? opt.text || opt.textEn || opt.text_en || JSON.stringify(opt)
                            : opt.textEn || opt.text_en || opt.text || JSON.stringify(opt);
                      }

                      return (
                        <div
                          key={optIdx}
                          className={cn(
                            'flex items-center justify-between rounded-lg border p-3 text-sm',
                            styleClass
                          )}
                        >
                          <span>{optionText}</span>
                          {isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                          {isSelected && !isCorrectOpt && (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-lg p-3 text-sm font-bold',
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : isSkipped
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-red-100 text-red-800'
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isSkipped ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}

                    <span>
                      {isCorrect
                        ? 'You answered correctly!'
                        : isSkipped
                          ? 'You skipped this question.'
                          : 'You answered incorrectly.'}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm shadow-sm">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-800 uppercase">
                      <AlertCircle className="h-4 w-4" /> Explanation
                    </div>

                    <PremiumExplanation
                      explanation={q.explanation || 'No explanation available.'}
                      explanationEn={q.explanationEn}
                    />
                  </div>
                </motion.div>
              )}
            </Card>
          );
        })}

        <div className="flex gap-4 pt-8">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="h-12 flex-1 rounded-xl border-slate-300 bg-white font-bold text-slate-900"
          >
            <Home className="mr-2 h-4 w-4" /> Back Home
          </Button>
          <Button
            onClick={() => {
              clearResult();
              router.push('/syllabus/quiz');
            }}
            className="h-12 flex-1 rounded-xl bg-slate-900 font-bold text-white hover:bg-slate-800"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Start New Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}
