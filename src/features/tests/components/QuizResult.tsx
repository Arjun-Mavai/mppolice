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
  Filter,
  TrendingDown,
  TrendingUp,
  Minus,
  Lightbulb,
  AlertTriangle,
  Zap,
  BookOpen,
  ArrowRight,
  Target,
  Trophy,
  Lock
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
  cleanMatchingQuestionText,
} from '@/features/tests/utils/questionFormatter';
import { logger } from '@/lib/logger';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getPYQIntelligenceForWrongQuestions, PYQWrongTopicInsight } from '@/actions/pyq-intelligence';

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
  disableRetry?: boolean;
  isGuest?: boolean;
}

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
  disableRetry = false,
  isGuest = false,
}: QuizResultProps) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';

  const isGuestLocked = isGuest && !userId;

  const PremiumLock = ({ label, className }: { label: string; className?: string }) => (
    <div className={cn("absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] z-20 rounded-lg border border-slate-100", className)}>
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 text-center max-w-[200px]">
        <div className="mx-auto bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
          <Lock className="w-5 h-5 text-amber-600" />
        </div>
        <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>
        <Button size="sm" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold" onClick={() => router.push('/pricing')}>
          Unlock Now
        </Button>
      </div>
    </div>
  );

  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [pyqInsights, setPyqInsights] = useState<PYQWrongTopicInsight[]>([]);
  const [isFetchingInsights, setIsFetchingInsights] = useState(false);
  const [showSimulatorLogic, setShowSimulatorLogic] = useState(false);

  // Score Calculations
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  let totalScore = 0;
  let maxMarks = 0;

  questions.forEach((q) => {
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

  totalScore = parseFloat(totalScore.toFixed(2));
  const scorePercentage = maxMarks > 0 ? Math.round((totalScore / maxMarks) * 100) : 0;
  const attemptedCount = correctCount + wrongCount;
  const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
  const totalQuestions = questions.length;

  useEffect(() => {
    const refreshData = async () => {
      try {
        setIsLoadingStats(true);
        await revalidateAnalyticsAction();
        router.refresh();

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
        setTimeout(() => setIsLoadingStats(false), 1000);
      }
    };
    refreshData();
  }, [router, testId, userId]);

  useEffect(() => {
    if (mode === 'pyq' && wrongCount > 0) {
      setIsFetchingInsights(true);
      const wrongQIds = questions
        .filter((q) => answers[q.id] !== undefined && answers[q.id] !== q.correctAnswer)
        .map((q) => q.id);

      getPYQIntelligenceForWrongQuestions(wrongQIds)
        .then((insights) => {
          setPyqInsights(insights);
        })
        .finally(() => setIsFetchingInsights(false));
    }
  }, [mode, questions, answers, wrongCount]);

  const feedbackMessage = React.useMemo(
    () => getRandomFeedback(scorePercentage, language),
    [scorePercentage, language]
  );

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [activeQuestionTab, setActiveQuestionTab] = useState<'all' | 'correct' | 'wrong' | 'skipped'>('all');

  const CUTOFF_PERCENTAGE = 0.76; // Updated to 76% for 300 marks exam (approx 228/300)
  const CUTOFF_ESTIMATE = Math.round(maxMarks * CUTOFF_PERCENTAGE);
  const isCutoffCleared = totalScore >= CUTOFF_ESTIMATE;

  // Render the detailed question analysis list
  const renderQuestionList = () => {
    const filteredQuestions = questions.map((q, i) => ({ ...q, originalIndex: i })).filter((q) => {
      if (activeQuestionTab === 'all') return true;
      const userAnswer = answers[q.id];
      const isSkipped = userAnswer === undefined;
      const isCorrect = userAnswer === q.correctAnswer;
      
      if (activeQuestionTab === 'skipped') return isSkipped;
      if (activeQuestionTab === 'correct') return isCorrect;
      if (activeQuestionTab === 'wrong') return !isSkipped && !isCorrect;
      return true;
    });

    if (filteredQuestions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Filter className="mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-900">No {activeQuestionTab} questions</h3>
          <p className="mt-1 text-sm text-slate-500">
            You didn't have any {activeQuestionTab} answers in this quiz.
          </p>
        </div>
      );
    }

    return filteredQuestions.map((q) => {
      const idx = q.originalIndex;
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      const isSkipped = userAnswer === undefined;
      const isExpanded = expandedQuestion === q.id;
      const isLocked = isGuestLocked && !isCorrect;

      return (
        <Card
          key={q.id}
          className={cn(
            'overflow-hidden border-l-4 mb-4 relative',
            isCorrect
              ? 'border-l-emerald-500'
              : isSkipped
                ? 'border-l-slate-300'
                : 'border-l-rose-500' // Better red
          )}
        >
          <div
            onClick={() => {
              if (isLocked) {
                // router.push('/pricing'); // Optional: redirect on click
                return;
              }
              setExpandedQuestion(isExpanded ? null : q.id)
            }}
            className={cn("cursor-pointer p-4 transition-colors hover:bg-slate-50", isLocked && "cursor-not-allowed")}
          >
            <div className="flex gap-4">
              <div className="mt-1">
                {isCorrect ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : isSkipped ? (
                  <AlertCircle className="h-6 w-6 text-slate-300" />
                ) : (
                  <XCircle className="h-6 w-6 text-rose-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm leading-snug font-bold text-slate-900 md:text-base">
                  <span className="mr-2 text-slate-400">Q{idx + 1}.</span>
                  <FormattedQuestionText
                    text={cleanMatchingQuestionText(q.question, q)}
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

                {q.questionEn && (
                  <div className="mt-2 text-sm text-slate-500">
                    <FormattedQuestionText text={cleanMatchingQuestionText(q.questionEn, q)} />

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
                {isLocked ? (
                  <Lock className="h-5 w-5 text-amber-500" />
                ) : isExpanded ? (
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
                {q.options.map((opt, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  const isCorrectOpt = q.correctAnswer === optIdx;

                  let styleClass = 'border-slate-200 bg-white text-slate-600';
                  if (isCorrectOpt)
                    styleClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                  else if (isSelected && !isCorrectOpt)
                    styleClass =
                      'border-rose-500 bg-rose-50 text-rose-800 line-through decoration-rose-500/50';

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
                        <XCircle className="h-4 w-4 text-rose-600" />
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
                      : 'bg-rose-100 text-rose-800'
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
    });
  };

  // Content for Result Tab
  const renderResultContent = () => {
    // Math for progress bar segments to prevent overflow and visual glitches
    const progressPositive = Math.max(0, totalScore);
    const progressNegative = Math.max(0, wrongCount * SCORING_CONFIG.NEGATIVE_MARKING);
    // Green = Score, Space = Skipped/Margin, Red = Penalty
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 pt-6">
        {/* Score Card Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-slate-700/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"></div>

          <div className="relative z-10">
            <div className="mb-2 text-sm font-bold text-slate-400 capitalize">{title || 'Test Result'}</div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 mt-4">
              <div>
                <div className="text-6xl font-black font-display flex items-baseline gap-1">
                  {totalScore}
                  <span className="text-2xl text-slate-500 font-bold">/{maxMarks}</span>
                </div>
                {SCORING_CONFIG.NEGATIVE_MARKING > 0 && wrongCount > 0 && (
                    <div className="text-sm text-rose-400 mt-1 font-medium bg-rose-500/10 inline-flex px-2 py-0.5 rounded-full border border-rose-500/20">
                        Includes penalty
                    </div>
                )}
              </div>
              
              <div className="flex flex-col items-center sm:items-end">
                <div className="text-4xl font-bold">{scorePercentage}%</div>
                {isCutoffCleared ? (
                  <div className="inline-flex items-center text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full mt-2 shadow-inner">
                    <TrendingUp className="w-3 h-3 mr-1.5" /> Est. Cleared (~{CUTOFF_ESTIMATE})
                  </div>
                ) : (
                  <div className="inline-flex items-center text-xs font-bold bg-amber-500/20 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-full mt-2 shadow-inner">
                    <TrendingDown className="w-3 h-3 mr-1.5" /> Needs Push (~{CUTOFF_ESTIMATE})
                  </div>
                )}
              </div>
            </div>

            {/* CUTOFF PROGRESS BAR - Refined */}
            <div className="w-full space-y-2.5 mb-8">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>0</span>
                <span className={cn(
                  "pr-12 transition-colors",
                  isCutoffCleared ? "text-emerald-400" : "text-amber-400"
                )}>
                  Cutoff est. ~{CUTOFF_ESTIMATE}
                </span>
                <span>{maxMarks}</span>
              </div>
              
              <div className="relative h-4 w-full bg-slate-800/80 rounded-full overflow-hidden flex shadow-inner border border-slate-700/50">
                {/* Visualizer: Score Segment */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((progressPositive / maxMarks) * 100, 100)}%` }}
                  className="bg-emerald-500 h-full relative z-10" 
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 to-white/20"></div>
                </motion.div>
                
                {/* Visualizer: Negative Marking Segment (Red at the end of the green) */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((progressNegative / maxMarks) * 100, 100)}%` }}
                  className="bg-rose-500/90 h-full relative z-10" 
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px)' }}
                />
                
                {/* Cutoff Tick */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-amber-400 z-20 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  style={{ left: `${(CUTOFF_ESTIMATE / maxMarks) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs font-bold mt-2">
                <span className="text-emerald-400 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Net Score ({totalScore})</span>
                <span className="text-rose-400 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Penalty (-{progressNegative})</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-2 pt-5 border-t border-slate-700/50">
              <div className="text-center group">
                <div className="text-2xl font-black text-emerald-400 transition-transform group-hover:scale-110">{correctCount}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Correct</div>
              </div>
              <div className="text-center group border-l border-slate-700/50">
                <div className="text-2xl font-black text-rose-400 transition-transform group-hover:scale-110">{wrongCount}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Wrong</div>
              </div>
              <div className="text-center group border-l border-slate-700/50">
                <div className="text-2xl font-black text-slate-300 transition-transform group-hover:scale-110">{skippedCount}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Skipped</div>
              </div>
              <div className="text-center group border-l border-slate-700/50">
                <div className="text-2xl font-black text-white transition-transform group-hover:scale-110">{totalScore}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Net Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* RESTORED: LEADERBOARD TABLE */}
        {leaderboard && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <Trophy className="w-5 h-5 text-amber-500" /> Top Performers
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
                      isCurrentUser ? 'bg-amber-50' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                          index === 0
                            ? 'bg-amber-100 text-amber-700'
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

              {/* Current user at bottom if out of top 10 */}
              {leaderboard.userRank > 10 && leaderboard.userEntry && (
                <>
                  <div className="border-y border-slate-100 bg-slate-50 p-2 text-center text-xs text-slate-400">
                    ...
                  </div>
                  <div className="flex items-center justify-between border-l-4 border-amber-400 bg-amber-50 p-3">
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
        )}

        {/* Question Details Controller */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-bold text-slate-900">Question Summary</h3>
          </div>
          <div className="sticky top-[72px] z-30 mb-6 max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white/80 p-2 shadow-sm backdrop-blur-md">
            <div className="flex min-w-max items-center gap-2">
              <Button
                variant={activeQuestionTab === 'all' ? 'default' : 'ghost'}
                onClick={() => setActiveQuestionTab('all')}
                className={cn(
                  "rounded-full px-4 text-sm font-bold transition-all",
                  activeQuestionTab === 'all' ? "bg-slate-800 text-white shadow-md hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                All ({questions.length})
              </Button>
              <Button
                variant={activeQuestionTab === 'correct' ? 'default' : 'ghost'}
                onClick={() => setActiveQuestionTab('correct')}
                className={cn(
                  "rounded-full px-4 text-sm font-bold transition-all",
                  activeQuestionTab === 'correct' ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                )}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Correct ({correctCount})
              </Button>
              <Button
                variant={activeQuestionTab === 'wrong' ? 'default' : 'ghost'}
                onClick={() => setActiveQuestionTab('wrong')}
                className={cn(
                  "rounded-full px-4 text-sm font-bold transition-all",
                  activeQuestionTab === 'wrong' ? "bg-rose-500 text-white shadow-md hover:bg-rose-600" : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                )}
              >
                <XCircle className="mr-1.5 h-4 w-4" /> Wrong ({wrongCount})
              </Button>
              <Button
                variant={activeQuestionTab === 'skipped' ? 'default' : 'ghost'}
                onClick={() => setActiveQuestionTab('skipped')}
                className={cn(
                  "rounded-full px-4 text-sm font-bold transition-all",
                  activeQuestionTab === 'skipped' ? "bg-slate-500 text-white shadow-md hover:bg-slate-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-600"
                )}
              >
                <AlertCircle className="mr-1.5 h-4 w-4" /> Skipped ({skippedCount})
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {renderQuestionList()}
          </div>
        </div>
      </div>
    );
  };

  // Content for Strategy Tab
  const renderStrategyContent = () => {
    // Strategy AI analysis logic
    const isOverAttempting = wrongCount > (totalQuestions * 0.15); // >15% wrong is dangerous
    const isUnderAttempting = attemptedCount < (totalQuestions * 0.75); // <75% attempt is low
    
    // Accurate Simulator Math
    const calculateSimulatedScore = (attemptRate: number, accRate: number) => {
      const simAttempts = Math.round(totalQuestions * attemptRate);
      const simCorrect = Math.round(simAttempts * accRate);
      const simWrong = simAttempts - simCorrect;
      
      const posMarks = simCorrect * SCORING_CONFIG.MARKS_PER_QUESTION;
      const negMarks = simWrong * SCORING_CONFIG.NEGATIVE_MARKING;
      return parseFloat((posMarks - negMarks).toFixed(2));
    };

    const sim85score = calculateSimulatedScore(0.85, 0.82); // Attempt 85%, 82% precision
    const sim75score = calculateSimulatedScore(0.75, 0.90); // Attempt 75%, 90% precision

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 pt-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">
            {isHindi ? 'प्रयास विश्लेषण' : 'Attempt Intelligence'}
          </h2>
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            {isHindi ? (
              <>
                {SCORING_CONFIG.MARKS_PER_QUESTION} अंक सही <span className="text-rose-500 font-bold mx-1">|</span> -{SCORING_CONFIG.NEGATIVE_MARKING} नकारात्मक अंकन
              </>
            ) : (
              <>
                {SCORING_CONFIG.MARKS_PER_QUESTION} marks correct <span className="text-rose-500 font-bold mx-1">|</span> -{SCORING_CONFIG.NEGATIVE_MARKING} negative marking
              </>
            )}
          </p>
        </div>

        <Card className="overflow-hidden border border-slate-200 bg-white">
          <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
              {isHindi ? 'आपका स्कोर गणित' : 'Your Attempt Math'}
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-2 py-1 rounded-full text-[10px]">
              {isHindi ? 'इस मॉक का विश्लेषण' : 'This mock analysis'}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
              <span className="text-sm font-bold text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> {isHindi ? 'कुल प्रयास' : 'Attempted'}</span>
              <span className="font-bold text-slate-900">{attemptedCount} <span className="text-slate-400 font-medium">/ {totalQuestions}</span></span>
            </div>
            <div className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
              <span className="text-sm font-bold text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {isHindi ? 'सही प्रयास' : 'Correct attempts'}</span>
              <span className="font-bold text-emerald-600">
                {correctCount} <span className="text-slate-400 text-xs font-medium mx-1">× {SCORING_CONFIG.MARKS_PER_QUESTION} =</span> +{correctCount * SCORING_CONFIG.MARKS_PER_QUESTION}
              </span>
            </div>
            <div className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors bg-rose-50/30">
              <span className="text-sm font-bold text-rose-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> {isHindi ? 'गलत प्रयास' : 'Wrong attempts'}</span>
              <span className="font-bold text-rose-600">
                {wrongCount} <span className="text-slate-400 text-xs font-medium mx-1">× {SCORING_CONFIG.NEGATIVE_MARKING} =</span> -{wrongCount * SCORING_CONFIG.NEGATIVE_MARKING}
              </span>
            </div>
            <div className="p-4 flex justify-between items-center bg-slate-50/80 border-t-2 border-slate-200">
              <span className="text-sm font-black text-slate-800 uppercase tracking-widest pl-3.5">{isHindi ? 'शुद्ध स्कोर' : 'Net Score'}</span>
              <span className="font-black text-slate-900 text-xl">{totalScore} <span className="text-sm text-slate-500 font-bold ml-0.5">{isHindi ? 'अंक' : 'pts'}</span></span>
            </div>
            <div className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
              <span className="text-sm font-bold text-slate-600 pl-3.5">{isHindi ? 'सटीकता दर' : 'Accuracy Rate'}</span>
              <span className={cn("font-bold flex items-center gap-2", accuracy >= 80 ? "text-emerald-500" : "text-amber-500")}>
                {accuracy.toFixed(1)}% <span className="text-[10px] font-medium opacity-70 bg-slate-100 rounded px-1.5 py-0.5 text-slate-600">({isHindi ? 'लक्ष्य' : 'Target'}: ≥80%)</span>
              </span>
            </div>
            <div className={cn("p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors", skippedCount > (totalQuestions * 0.2) ? "bg-amber-50/50" : "")}>
              <span className="text-sm font-bold text-slate-600 pl-3.5">{isHindi ? 'छोड़े गए (सुरक्षित क्षेत्र)' : 'Skipped (Safe Zone)'}</span>
              <span className="font-bold text-emerald-600">
                {skippedCount} <span className="text-xs text-slate-400 font-medium ml-1">
                  {isHindi ? `बचाए ~${skippedCount * SCORING_CONFIG.NEGATIVE_MARKING} नकारात्मक अंक` : `saved ~${skippedCount * SCORING_CONFIG.NEGATIVE_MARKING} negative points`}
                </span>
              </span>
            </div>
          </div>
        </Card>

        {/* Strategy Gaps Box */}
        {(isOverAttempting || isUnderAttempting || accuracy < 80) && (
          <Card className="border border-amber-500/30 bg-amber-50/60 overflow-hidden shadow-sm">
            <div className="p-4 flex items-start gap-4">
              <div className="bg-amber-100 p-2 rounded-full shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-3 text-sm uppercase tracking-wide">
                  {isHindi ? 'रणनीति में कमियां पाई गईं' : 'Strategy Gaps Identified'}
                </h3>
                <ul className="space-y-3 test-sm text-amber-800 font-medium list-disc pl-4 marker:text-amber-400">
                  {isOverAttempting && (
                    <li className="pl-1">
                      {isHindi ? (
                        <>आपने <span className="font-bold">{wrongCount} गलत उत्तर</span> दिए। यह {wrongCount * SCORING_CONFIG.NEGATIVE_MARKING} अंकों का नुकसान है। यदि आत्मविश्वास नहीं है, तो छोड़ना बेहतर है।</>
                      ) : (
                        <>You got <span className="font-bold">{wrongCount} wrong answers</span>. That's {wrongCount * SCORING_CONFIG.NEGATIVE_MARKING} points lost to negative marking. If not confident, it's better to skip.</>
                      )}
                    </li>
                  )}
                  {accuracy < 80 && (
                    <li className="pl-1">
                      {isHindi ? (
                        <>आपकी सटीकता <span className="font-bold">{accuracy.toFixed(0)}%</span> है। {CUTOFF_ESTIMATE}+ कटऑफ को लगातार पास करने के लिए, सटीकता 80% से अधिक होनी चाहिए।</>
                      ) : (
                        <>Your accuracy is <span className="font-bold">{accuracy.toFixed(0)}%</span>. To consistently clear {CUTOFF_ESTIMATE}+ cutoffs, accuracy must exceed 80%.</>
                      )}
                    </li>
                  )}
                  {isUnderAttempting && (
                    <li className="pl-1">
                      {isHindi ? (
                        <>आपने केवल <span className="font-bold">{attemptedCount}</span> प्रश्न हल किए। कटौती के साथ अच्छा स्कोर करने के लिए, कम से कम {Math.round(totalQuestions * 0.8)} प्रश्नों का प्रयास करें।</>
                      ) : (
                        <>You attempted only <span className="font-bold">{attemptedCount}</span> questions. To score well with deductions, try safely attempting at least {Math.round(totalQuestions * 0.8)} questions.</>
                      )}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-900 p-4 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm tracking-wide uppercase flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" /> {isHindi ? 'इष्टतम प्रयास सिम्युलेटर' : 'Optimal Attempt Simulator'}
            </h3>
          </div>
          <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
            {isHindi ? 'स्कोर अनुमान (सख्त नकारात्मक अंकन)' : 'Score Projections (Strict Negative Marking)'}
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            <div className="p-4 flex justify-between items-center font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col">
                <span>{isHindi ? 'प्रयास 85%' : 'Attempt 85%'} <span className="text-slate-400 font-medium text-xs ml-1">({isHindi ? 'छोड़ें 15%' : 'Skip 15%'})</span></span>
                <span className="text-[10px] text-slate-400 font-medium">{isHindi ? 'मानता है 82% सटीकता' : 'Assumes 82% precision'}</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-600 block text-lg">~{sim85score}</span>
                <span className="text-[10px] text-slate-400">{isHindi ? 'अनुमानित अंक' : 'Projected Marks'}</span>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center font-bold text-slate-700 hover:bg-slate-50 transition-colors border-l-4 border-l-transparent">
              <div className="flex flex-col">
                <span>{isHindi ? 'प्रयास 75%' : 'Attempt 75%'} <span className="text-slate-400 font-medium text-xs ml-1">({isHindi ? 'छोड़ें 25%' : 'Skip 25%'})</span></span>
                <span className="text-[10px] text-slate-400 font-medium">{isHindi ? 'मानता है 90% सटीकता' : 'Assumes 90% precision'}</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-500 block text-lg">~{sim75score}</span>
                <span className="text-[10px] text-slate-400">{isHindi ? 'अनुमानित अंक' : 'Projected Marks'}</span>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center font-bold text-amber-700 bg-amber-50/30 border-l-4 border-l-amber-400">
              <div className="flex flex-col">
                <span>{isHindi ? 'आपकी वर्तमान स्थिति' : 'Your Current State'}</span>
                <span className="text-[10px] text-amber-600/70 font-medium">
                  {isHindi ? `प्रयास ${attemptedCount} (${accuracy.toFixed(0)}% सटीकता)` : `Attempted ${attemptedCount} (${accuracy.toFixed(0)}% precision)`}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-lg">{totalScore}</span>
                <span className="text-[10px] opacity-70">{isHindi ? 'वास्तविक अंक' : 'Actual Marks'}</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-xs font-bold text-emerald-800 text-center flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 fill-emerald-500" /> 
              {isHindi ? 'संतुलित प्रयास दर + उच्च सटीकता = अधिकतम शुद्ध स्कोर' : 'Balanced Attempt Rate + High Accuracy = Maximum Net Score'}
            </div>
            <button 
              onClick={() => setShowSimulatorLogic(!showSimulatorLogic)}
              className="text-[10px] text-emerald-600 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-700 mt-1 flex items-center gap-1"
            >
              {isHindi ? 'यह गणना कैसे की जाती है?' : 'How is this calculated?'}
              {showSimulatorLogic ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            
            {showSimulatorLogic && (
              <div className="mt-2 w-full text-left bg-white/60 rounded-lg p-3 text-[10px] text-emerald-800 font-medium leading-relaxed border border-emerald-100 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="mb-2">
                  <span className="font-bold block text-emerald-900 mb-0.5">{isHindi ? 'परिदृश्य 1: आक्रामक (85% प्रयास)' : 'Scenario 1: Aggressive (85% Attempt)'}</span>
                  85 Qs × 82% Accuracy ≈ <span className="font-bold text-emerald-700">70 Correct</span>, 15 Wrong<br/>
                  Score = (70 × 3) - (15 × 1) = <span className="font-bold text-emerald-900">195 Marks</span>
                </div>
                <div>
                  <span className="font-bold block text-emerald-900 mb-0.5">{isHindi ? 'परिदृश्य 2: सटीक (75% प्रयास)' : 'Scenario 2: Precision (75% Attempt)'}</span>
                  75 Qs × 90% Accuracy ≈ <span className="font-bold text-emerald-700">68 Correct</span>, 7 Wrong<br/>
                  Score = (68 × 3) - (7 × 1) = <span className="font-bold text-emerald-900">197 Marks</span>
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-200/50 text-center italic text-emerald-600">
                  {isHindi ? 'निष्कर्ष: कम प्रयास लेकिन उच्च सटीकता अक्सर बेहतर स्कोर देती है।' : 'Conclusion: Lower attempts with higher accuracy often yields a better score.'}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // Content for PYQ Analysis Tab
  const renderPYQAnalysisContent = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">PYQ Intelligence</h2>
          <p className="text-sm text-slate-500 font-medium">Topics you got wrong — with exam history</p>
        </div>

        {isFetchingInsights ? (
          <div className="flex justify-center p-12">
            <LoadingQuotes />
          </div>
        ) : pyqInsights.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/30">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-black text-emerald-900">Perfect Execution!</h3>
            <p className="text-emerald-700/80 mt-2 text-sm max-w-sm mx-auto font-medium">
              You didn't get any PYQ-tracked questions wrong. You are well prepared for these topics based on past year trends.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {pyqInsights.map((insight, index) => (
              <Card key={insight.topicId} className="overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 group-hover:bg-slate-50 transition-colors">
                  <h3 className="font-bold text-slate-800 leading-tight">
                    {insight.topicTitle}
                    {insight.topicTitleEn && <span className="block text-xs text-slate-500 font-medium mt-0.5">{insight.topicTitleEn}</span>}
                  </h3>
                  <div className="bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-black tracking-wide px-2.5 py-1 rounded-md flex items-center gap-1.5 shrink-0 uppercase">
                    <XCircle className="w-3.5 h-3.5" /> Wrong <span className="opacity-50 mx-1">•</span> -{SCORING_CONFIG.NEGATIVE_MARKING} pt
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    <div className={cn(
                      "rounded-xl border p-3 flex flex-col items-center justify-center text-center transition-colors",
                      insight.frequencyLast6Years >= 4 ? "bg-rose-50/50 border-rose-200" : "bg-slate-50 border-slate-200"
                    )}>
                      <div className={cn(
                        "text-2xl font-black",
                        insight.frequencyLast6Years >= 4 ? "text-rose-600" : "text-slate-700"
                      )}>{insight.frequencyLast6Years}x</div>
                      <div className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mt-1 leading-tight">Last 6 years</div>
                    </div>

                    <div className={cn(
                      "rounded-xl border p-3 flex flex-col items-center justify-center text-center transition-colors",
                      insight.trend2024 === 'Rising' ? "bg-amber-50 border-amber-200 text-amber-700" : 
                      insight.trend2024 === 'Falling' ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                      "bg-slate-50 border-slate-200 text-slate-600"
                    )}>
                      <div className="text-xl font-black flex items-center gap-1.5">
                        {insight.trend2024 === 'Rising' && <TrendingUp className="w-5 h-5 flex-shrink-0" />}
                        {insight.trend2024 === 'Falling' && <TrendingDown className="w-5 h-5 flex-shrink-0" />}
                        {insight.trend2024 === 'Stable' && <Minus className="w-5 h-5 flex-shrink-0" />}
                        <span className="truncate">{insight.trend2024}</span>
                      </div>
                      <div className="text-[9px] font-bold tracking-widest uppercase opacity-70 mt-1 leading-tight">Trend 2024</div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex flex-col items-center justify-center text-center">
                      <div className="text-2xl font-black text-slate-800">{insight.importanceScore}<span className="text-sm text-slate-400">/10</span></div>
                      <div className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mt-1 leading-tight">Importance</div>
                    </div>
                  </div>

                  {/* Core Facts & Traps */}
                  <div className="space-y-3 pt-2">
                    {insight.coreFact && (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                          <BookOpen size={48} />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 relative z-10">
                          CORE FACT
                        </div>
                        <p className="text-slate-200 font-medium leading-relaxed relative z-10">
                          {insight.coreFact}
                        </p>
                      </div>
                    )}
                    
                    {/* Visual hint for memory tip */}
                    <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5 text-sm text-emerald-700 font-medium flex gap-3 items-start">
                       <Lightbulb className="w-5 h-5 shrink-0 fill-emerald-100 text-emerald-500 mt-0.5" />
                       <div className="leading-relaxed">
                        <span className="font-bold block mb-0.5 opacity-80 text-xs">MEMORY TIP</span>
                        "Candle (Chandela) light mein Khajuraho dekho" example mnemonic
                       </div>
                    </div>

                    {insight.trapAlert && (
                      <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3.5 text-sm text-rose-700 font-medium flex gap-3 items-start">
                       <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                       <div className="leading-relaxed">
                        <span className="font-bold block mb-0.5 opacity-80 text-xs">SCAM ALERT</span>
                        Trap: Parmera → Bhojpur | Chandela → Khajuraho
                       </div>
                      </div>
                    )}
                  </div>

                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <Button 
            onClick={() => router.push('/syllabus/quiz/pyq/intelligence')}
            className="h-12 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-900/20 flex items-center gap-2 group transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            {isHindi ? 'विस्तृत विश्लेषण देखें' : 'View Deep Analysis'}
            <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* App-like Header */}
      <div className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
        <div className="flex items-center justify-between p-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (onExit) onExit();
                else router.push('/syllabus/quiz');
              }}
              className="text-slate-400 hover:bg-slate-800 hover:text-white rounded-full h-10 w-10"
            >
              <Home className="h-5 w-5" />
            </Button>
            <h1 className="font-display truncate text-lg font-bold text-white max-w-[200px] sm:max-w-md">
              {title || 'Results'}
            </h1>
          </div>
          {!disableRetry && (
            <Button
              onClick={onRetry}
              variant="ghost" 
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-800 font-bold"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="result" className="w-full max-w-3xl mx-auto px-4 md:px-0">
        <div className="sticky top-[73px] z-40 bg-slate-50 pt-4 pb-2 border-b border-slate-200/60 shadow-sm/50">
          <TabsList className={cn(
            "w-full bg-slate-200/50 p-1 rounded-xl grid", 
            mode === 'pyq' ? "grid-cols-3" : "grid-cols-2"
          )}>
            <TabsTrigger value="result" className="rounded-lg py-2.5 text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500">
              Result
            </TabsTrigger>
            <TabsTrigger value="strategy" className="rounded-lg py-2.5 text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500">
              Strategy
            </TabsTrigger>
            {mode === 'pyq' && (
              <TabsTrigger value="pyq-analysis" className="rounded-lg py-2.5 text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500">
                PYQ Analysis
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="result" className="m-0 focus-visible:outline-none">
          {renderResultContent()}
        </TabsContent>
        <TabsContent value="strategy" className="m-0 focus-visible:outline-none relative min-h-[400px]">
          {isGuestLocked && <PremiumLock label="Strategy Analysis Locked" className="backdrop-blur-sm bg-white/80" />}
          <div className={isGuestLocked ? "blur-sm pointer-events-none select-none" : ""}>
            {renderStrategyContent()}
          </div>
        </TabsContent>
        {mode === 'pyq' && (
          <TabsContent value="pyq-analysis" className="m-0 focus-visible:outline-none relative min-h-[400px]">
            {isGuestLocked && <PremiumLock label="PYQ Intelligence Locked" className="backdrop-blur-sm bg-white/80" />}
            <div className={isGuestLocked ? "blur-sm pointer-events-none select-none" : ""}>
              {renderPYQAnalysisContent()}
            </div>
          </TabsContent>
        )}
      </Tabs>
      
    </div>
  );
}
