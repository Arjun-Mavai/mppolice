import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAttemptDetails } from '@/features/analytics/actions';
import { getTestLeaderboard } from '@/actions/leaderboard-actions';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuizResult } from '@/features/tests/components/QuizResult';
import { cn } from '@/lib/utils';
import {
  FormattedQuestionText,
  RenderTableQuestion,
} from '@/features/tests/utils/questionFormatter';
import { calculateScore } from '@/lib/quiz-scoring';
import Loading from './loading';
import { HistoryLeaderboard } from './HistoryLeaderboard';
import { PremiumExplanation } from '@/features/tests/components/PremiumExplanation';

export default async function AttemptReviewPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <Suspense fallback={<Loading />}>
      <AttemptContent attemptId={params.id} />
    </Suspense>
  );
}

async function AttemptContent({ attemptId }: { attemptId: string }) {
  const attempt = await getAttemptDetails(attemptId);

  if (!attempt) {
    return notFound();
  }

  const { meta, answers } = attempt;

  // Parallelize Leaderboard while processing the review logic
  const leaderboardPromise = getTestLeaderboard(meta.testId, meta.userId);

  // Categorize answers first to use lengths for calculation
  const correctAns = answers.filter((a) => a.isCorrect);
  // Wrong answers are those that are NOT correct AND have a userAnswer (not skipped)
  const wrongAns = answers.filter(
    (a) => !a.isCorrect && a.userAnswer !== null && a.userAnswer !== undefined
  );
  const skippedAns = answers.filter((a) => a.userAnswer === null || a.userAnswer === undefined);

  // Recalculate Score Dynamically to ensure 3/-1 Rule is always displayed
  const recalculated = calculateScore(answers.length, correctAns.length, wrongAns.length);

  // Use recalculated values for display
  const finalScore = recalculated.totalScore;
  const finalTotalMarks = recalculated.maxMarks;
  const accuracy = recalculated.percentage;

  // Calculate Duration
  let durationDisplay = '0m';
  if (meta.startTime && meta.endTime) {
    const diffSeconds = Math.round(
      (new Date(meta.endTime).getTime() - new Date(meta.startTime).getTime()) / 1000
    );
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    durationDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header / Hero */}
      <div className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-slate-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl"></div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
            <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
              <Badge className="border-slate-500/30 bg-slate-500/20 text-[11px] text-slate-300 hover:bg-slate-500/30">
                Detailed Analysis
              </Badge>
              <h1 className="font-display text-xl leading-tight font-bold break-words sm:text-2xl md:text-3xl">
                {meta.testTitle || 'Practice Test Review'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 sm:gap-3 sm:text-sm">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {durationDisplay}
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block"></span>
                <span className="text-xs text-slate-400 sm:text-sm">
                  {new Date(meta.endTime || new Date()).toDateString()}
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block"></span>
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {answers.length} Qs
                </span>
              </div>
            </div>

            <div className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md sm:gap-4 sm:p-4 md:w-auto md:justify-end">
              <div className="text-right">
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase sm:text-xs">
                  Score
                </div>
                <div className="text-2xl font-black text-white sm:text-3xl">
                  {finalScore}
                  <span className="text-base font-medium text-slate-500 sm:text-lg">
                    /{finalTotalMarks}
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-xl border-4 border-slate-900 text-lg font-bold shadow-lg sm:h-16 sm:w-16 sm:text-xl',
                  accuracy >= 80
                    ? 'bg-emerald-500 text-white'
                    : accuracy >= 60
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                )}
              >
                {accuracy}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative z-20 mx-auto -mt-6 max-w-5xl px-4 sm:-mt-8 sm:px-6">
        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 text-center shadow-xl shadow-slate-200/50 sm:gap-4 sm:p-6">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xl font-bold text-emerald-600 sm:gap-2 sm:text-2xl">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" /> {correctAns.length}
            </div>
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase sm:text-xs">
              Correct
            </div>
          </div>
          <div className="space-y-0.5 border-r border-l border-slate-100 sm:space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xl font-bold text-red-600 sm:gap-2 sm:text-2xl">
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" /> {wrongAns.length}
            </div>
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase sm:text-xs">
              Incorrect
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xl font-bold text-slate-400 sm:gap-2 sm:text-2xl">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" /> {skippedAns.length}
            </div>
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase sm:text-xs">
              Skipped
            </div>
          </div>
        </div>
      </div>

      {/* LEADERBOARD SECTION - Integrated for History */}
      <HistoryLeaderboard leaderboard={await leaderboardPromise} currentUserId={meta.userId} />

      {/* Question List */}
      <div className="mx-auto max-w-4xl space-y-4 px-3 py-6 sm:space-y-6 sm:px-6 sm:py-10">
        <h2 className="px-1 text-lg font-bold text-slate-900 sm:text-xl">Question Analysis</h2>

        <div className="space-y-3 sm:space-y-5">
          {answers.map((ans: any, idx: number) => {
            const isCorrect = ans.isCorrect;
            const isSkipped = !ans.userAnswer;
            const isWrong = !isCorrect && !isSkipped;

            return (
              <Card
                key={ans.id}
                className={cn(
                  'overflow-hidden rounded-xl border-l-[3px] transition-all',
                  isCorrect
                    ? 'border-l-emerald-500'
                    : isWrong
                      ? 'border-l-red-500'
                      : 'border-l-slate-300'
                )}
              >
                {/* Question — Q number inline, full width */}
                <div className="border-b border-slate-100 bg-slate-50/30 px-4 py-3.5 sm:px-5 sm:py-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-0">
                      <span className="mt-[3px] mr-2 shrink-0 text-[11px] font-bold tracking-wide text-slate-400 uppercase tabular-nums">
                        Q{ans.order || idx + 1}.
                      </span>
                      <div className="min-w-0 flex-1">
                        <FormattedQuestionText
                          text={ans.questionText}
                          className="text-[15px] leading-[1.7] font-medium tracking-[-0.01em] text-slate-900 sm:text-base"
                        />
                        {ans.type === 'matching' && ans.matchPairs && (
                          <RenderTableQuestion
                            matchPairs={ans.matchPairs}
                            language="hi"
                            className="mt-3 mb-2"
                          />
                        )}
                        {ans.questionTextEn && (
                          <>
                            <FormattedQuestionText
                              text={ans.questionTextEn}
                              className="mt-1.5 text-[13px] leading-[1.7] text-slate-500 sm:text-sm"
                            />
                            {ans.type === 'matching' && ans.matchPairs && (
                              <RenderTableQuestion
                                matchPairs={ans.matchPairs}
                                language="en"
                                className="mt-3 mb-2 border-slate-300"
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {/* Status badges — compact inline row */}
                    <div className="flex flex-wrap items-center gap-1.5 pl-6">
                      {isCorrect && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          ✓ Correct +3
                        </span>
                      )}
                      {isWrong && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                          ✗ Wrong −1
                        </span>
                      )}
                      {isSkipped && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          Skipped
                        </span>
                      )}
                      <span className="rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        ⏱ {ans.timeTaken || 0}s
                      </span>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-4 px-4 py-3.5 sm:px-5 sm:py-4">
                  {/* Options — clean, full width */}
                  <div className="space-y-2">
                    {Array.isArray(ans.options) &&
                      ans.options.map((opt: any, optIdx: number) => {
                        const optionId = String.fromCharCode(65 + optIdx);
                        let optionText = '';
                        let optionLabel = optionId;

                        if (typeof opt === 'string') {
                          optionText = opt;
                        } else if (typeof opt === 'object' && opt !== null) {
                          optionText = opt.text || opt.text_en || JSON.stringify(opt);
                          if (opt.id) optionLabel = opt.id;
                        }

                        const isUserSelected =
                          ans.userAnswer === optIdx ||
                          ans.userAnswer === optionId ||
                          ans.userAnswer === optionLabel;
                        const isCorrectOption =
                          ans.correctAnswer === optIdx ||
                          ans.correctAnswer === optionId ||
                          ans.correctAnswer === optionLabel;

                        return (
                          <div
                            key={optIdx}
                            className={cn(
                              'relative flex items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-all sm:px-4 sm:py-3',
                              isCorrectOption
                                ? 'border-emerald-300 bg-emerald-50/80'
                                : isUserSelected
                                  ? 'border-red-300 bg-red-50/80'
                                  : 'border-slate-100 bg-white'
                            )}
                          >
                            <span
                              className={cn(
                                'mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold',
                                isCorrectOption
                                  ? 'bg-emerald-500 text-white'
                                  : isUserSelected
                                    ? 'bg-red-500 text-white'
                                    : 'bg-slate-100 text-slate-500'
                              )}
                            >
                              {optionLabel}
                            </span>
                            <span
                              className={cn(
                                'flex-1 text-[14px] leading-[1.65] tracking-[-0.005em] sm:text-[15px]',
                                isCorrectOption
                                  ? 'text-emerald-900'
                                  : isUserSelected
                                    ? 'text-red-900'
                                    : 'text-slate-700'
                              )}
                            >
                              {optionText}
                            </span>
                            {isCorrectOption && (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            )}
                            {isUserSelected && !isCorrectOption && (
                              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                            )}
                          </div>
                        );
                      })}
                  </div>

                  {/* Premium Explanation — flush to card edges for max width */}
                  {(ans.explanation || ans.explanationEn) && (
                    <div className="-mx-4 -mb-3.5 border-t border-slate-100 bg-slate-50/50 sm:-mx-5 sm:-mb-4">
                      <div className="flex items-center gap-2 border-b border-slate-100/80 px-4 py-2 sm:px-5">
                        <Lightbulb className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                          Explanation
                        </span>
                      </div>
                      <div className="px-4 py-4 sm:px-5 sm:py-5">
                        <PremiumExplanation
                          explanation={ans.explanation}
                          explanationEn={ans.explanationEn}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
