'use client';

import React, { useEffect, useState } from 'react';
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
import { Question } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { PremiumExplanation } from './PremiumExplanation';
import { SCORING_CONFIG } from '@/lib/quiz-scoring';
import { getTestLeaderboard } from '@/actions/leaderboard-actions';
import { revalidateAnalyticsAction } from '@/features/analytics/actions';
import { LoadingQuotes } from '@/components/ui/LoadingQuotes';
import { getRandomFeedback } from '../constants/feedback';
import { useSettingsStore } from '@/store/useSettingsStore';
import {
  FormattedQuestionText,
  RenderTableQuestion,
} from '@/features/tests/utils/questionFormatter';
import { logger } from '@/lib/logger';

interface QuizResultProps {
  questions: Question[];
  answers: Record<string, number>;
  mode: 'topic' | 'full' | 'pyq';
  timeTaken: number; // in seconds
  onRetry?: () => void;
  onExit?: () => void;
  title?: string;
  testId?: string;
  userId?: string;
}

// Bhai, ye component ekdum jhakaas hai! Result dikhane ka zimma iska hai.
export function QuizResult({
  questions,
  answers,
  mode,
  timeTaken,
  onRetry,
  onExit,
  title,
  testId,
  userId,
}: QuizResultProps) {
  const router = useRouter();
  const { language } = useSettingsStore();

  // Revalidate Analytics on Mount to ensure Dashboard is fresh
  // Bhai, data ekdum taaza hona mangta hai!
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const refreshData = async () => {
      try {
        setIsLoadingStats(true);
        await revalidateAnalyticsAction();
        router.refresh(); // Refresh Client Router Cache

        if (testId) {
          const data = await getTestLeaderboard(testId, userId);
          setLeaderboard(data);
        }
      } catch (error) {
        logger.error('Failed to refresh quiz result stats', error, {
          category: 'ui',
          metadata: { testId, userId },
        });
      } finally {
        // Add a small artificial delay for the "feel" if it's too fast, or just let it be natural
        // "Bhai thoda suspense to banta hai"
        setTimeout(() => setIsLoadingStats(false), 2000);
      }
    };
    refreshData();
  }, [router, testId, userId]);

  // Calculate Score matching server logic (SCORING_CONFIG)
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  let totalScore = 0;
  let maxMarks = 0;

  questions.forEach((q) => {
    // Strict Standard Scoring
    const qMarks = SCORING_CONFIG.MARKS_PER_QUESTION;
    const qNegative = SCORING_CONFIG.NEGATIVE_MARKING;

    maxMarks += qMarks;

    if (answers[q.id] === undefined) {
      skippedCount++;
    } else if (answers[q.id] === q.correctAnswer) {
      correctCount++;
      totalScore += qMarks;
    } else {
      wrongCount++;
      totalScore -= qNegative;
    }
  });

  // Precise Score
  totalScore = parseFloat(totalScore.toFixed(2));

  const scorePercentage = maxMarks > 0 ? Math.round((totalScore / maxMarks) * 100) : 0;

  // Memoize feedback to prevent hydration mismatch or changes on re-renders
  const feedbackMessage = React.useMemo(
    () => getRandomFeedback(scorePercentage, language),
    [scorePercentage, language]
  );

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header for Result Page */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900 p-4 shadow-md">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (onExit) {
                onExit();
              } else {
                router.push('/syllabus/quiz/pyq');
              }
            }}
            className="text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Home className="h-5 w-5" />
          </Button>
          <h1 className="font-display max-w-[200px] truncate text-lg font-bold text-white sm:max-w-md">
            {title || 'Results'}
          </h1>
        </div>
      </div>

      {/* Score Header */}
      <div className="relative overflow-hidden bg-slate-900 p-6 pb-24 text-white">
        {/* Background effects */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-slate-700/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"></div>

        <div className="relative z-10 mx-auto max-w-3xl space-y-6 text-center">
          <h1 className="font-display text-2xl font-bold opacity-90">{title || 'Test Results'}</h1>

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
                <div className="text-4xl font-bold">{totalScore}</div>
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
              Time Taken: {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
            </p>
          </div>

          {/* RANKING SECTION - Bhai ka Rank kya hai? */}
          {isLoadingStats ? (
            <div className="mt-6 mb-2">
              <LoadingQuotes />
            </div>
          ) : (
            leaderboard && (
              <div className="mt-6 mb-2">
                <div className="animate-in zoom-in inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-6 py-2 shadow-lg backdrop-blur-sm delay-300 duration-500">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Your Rank
                    </div>
                    <div className="text-xl font-bold text-yellow-400">
                      #{leaderboard.userRank}{' '}
                      <span className="text-sm text-slate-500">
                        / {leaderboard.totalParticipants}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

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

          {/* Smart Analytics / Feedback */}
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

      {/* LEADERBOARD TABLE - Yeda banke peda khao, Top 10 dikhao! */}
      {leaderboard && (
        <div className="relative z-20 mx-auto -mt-10 mb-10 max-w-3xl px-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <span className="text-xl">🏅</span> Top Performers
              </h3>
              <div className="text-xs font-medium text-slate-500">Only Top 10 shown</div>
            </div>
            <div className="divide-y divide-slate-100">
              {leaderboard.leaderboard.map((entry: any, index: number) => {
                const isCurrentUser = entry.userId === userId;
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'flex items-center justify-between p-3 transition-colors',
                      isCurrentUser ? 'bg-yellow-50' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                              ? 'bg-slate-200 text-slate-700'
                              : index === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'text-slate-400'
                        )}
                      >
                        {index === 0 && '👑'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                          {isCurrentUser ? 'YOU' : entry.displayName}
                          {isCurrentUser && (
                            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">
                              ME
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {Math.floor(entry.timeTakenSeconds / 60)}m {entry.timeTakenSeconds % 60}s
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-700">{entry.score}</div>
                      <div className="text-[10px] text-slate-400">Score</div>
                    </div>
                  </div>
                );
              })}

              {/* If user is not in top 10, show them at bottom */}
              {leaderboard.userRank > 10 && leaderboard.userEntry && (
                <>
                  <div className="border-y border-slate-100 bg-slate-50 p-2 text-center text-xs text-slate-400">
                    ...
                  </div>
                  <div className="flex items-center justify-between border-l-4 border-yellow-400 bg-yellow-50 p-3">
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-slate-500">
                        {leaderboard.userRank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                          YOU
                          <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-white">
                            ME
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {Math.floor(leaderboard.userEntry.timeTakenSeconds / 60)}m{' '}
                          {leaderboard.userEntry.timeTakenSeconds % 60}s
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-700">{leaderboard.userEntry.score}</div>
                      <div className="text-[10px] text-slate-400">Score</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      <div className="relative z-20 mx-auto -mt-4 max-w-3xl space-y-4 px-4">
        {questions.map((q, idx) => {
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
                      <FormattedQuestionText
                        text={
                          q.type === 'matching' && q.matchPairs && q.matchPairs.length > 0
                            ? q.question
                                .substring(
                                  0,
                                  q.question.search(/List-?\s*I\b|सूची-?\s*I\b|सूची-?\s*[12]/i) !==
                                    -1
                                    ? q.question.search(/List-?\s*I\b|सूची-?\s*I\b|सूची-?\s*[12]/i)
                                    : q.question.length
                                )
                                .trim()
                            : q.question
                        }
                        className="inline"
                      />

                      {q.type === 'matching' && (
                        <RenderTableQuestion
                          text={q.question}
                          matchPairs={q.matchPairs}
                          language="hi"
                          className="mt-2"
                        />
                      )}
                    </div>

                    {/* English Question Text */}
                    {q.questionEn && (
                      <div className="mt-2 text-sm text-slate-500">
                        <FormattedQuestionText
                          text={
                            q.type === 'matching' && q.matchPairs && q.matchPairs.length > 0
                              ? q.questionEn
                                  .substring(
                                    0,
                                    q.questionEn.search(
                                      /List-?\s*I\b|सूची-?\s*I\b|सूची-?\s*[12]/i
                                    ) !== -1
                                      ? q.questionEn.search(
                                          /List-?\s*I\b|सूची-?\s*I\b|सूची-?\s*[12]/i
                                        )
                                      : q.questionEn.length
                                  )
                                  .trim()
                              : q.questionEn
                          }
                        />

                        {q.type === 'matching' && (
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

              {/* Detailed Dropdown */}
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
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswer === optIdx;
                      const isCorrectOpt = q.correctAnswer === optIdx;

                      // Determine style
                      let styleClass = 'border-slate-200 bg-white text-slate-600';
                      if (isCorrectOpt)
                        styleClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                      else if (isSelected && !isCorrectOpt)
                        styleClass =
                          'border-red-500 bg-red-50 text-red-800 line-through decoration-red-500/50';

                      // Handle object options (bilingual support)
                      let optionText: string;
                      if (typeof opt === 'string') {
                        optionText = opt;
                      } else {
                        // It's an object (BilingualOption)
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

                  {/* Status Banner inside Expanded View */}
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

                  {/* Explanation */}
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
          {mode === 'topic' && (
            <Button
              onClick={() => {
                if (onExit) onExit();
                router.push('/syllabus/quiz'); // Force navigation to hub
              }}
              variant="outline"
              className="h-12 flex-1 rounded-xl border-slate-300 bg-white font-bold text-slate-900"
            >
              <Home className="mr-2 h-4 w-4" /> Back Home
            </Button>
          )}
          <Button
            onClick={onRetry}
            className="h-12 flex-1 rounded-xl bg-slate-900 font-bold text-white hover:bg-slate-800"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Retry Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}
