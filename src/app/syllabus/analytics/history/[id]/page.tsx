
import  { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAttemptDetails } from "@/features/analytics/actions";
import { getTestLeaderboard } from '@/actions/leaderboard-actions';
import { 
    ArrowLeft, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    BarChart3,
    Lightbulb
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuizResult } from "@/features/tests/components/QuizResult";
import { cn } from '@/lib/utils';
import { FormattedQuestionText } from '@/features/tests/utils/questionFormatter';
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
    // Fetch Leaderboard Data
    const leaderboard = await getTestLeaderboard(meta.testId, meta.userId);

    // Categorize answers first to use lengths for calculation
    const correctAns = answers.filter(a => a.isCorrect);
    // Wrong answers are those that are NOT correct AND have a userAnswer (not skipped)
    const wrongAns = answers.filter(a => !a.isCorrect && a.userAnswer !== null && a.userAnswer !== undefined); 
    const skippedAns = answers.filter(a => a.userAnswer === null || a.userAnswer === undefined);

    // Recalculate Score Dynamically to ensure 3/-1 Rule is always displayed
    const recalculated = calculateScore(answers.length, correctAns.length, wrongAns.length);
    
    // Use recalculated values for display
    const finalScore = recalculated.totalScore;
    const finalTotalMarks = recalculated.maxMarks;
    const accuracy = recalculated.percentage;

    // Calculate Duration
    let durationDisplay = "0m";
    if (meta.startTime && meta.endTime) {
         const diffSeconds = Math.round((new Date(meta.endTime).getTime() - new Date(meta.startTime).getTime()) / 1000);
         const minutes = Math.floor(diffSeconds / 60);
         const seconds = diffSeconds % 60;
         durationDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header / Hero */}
            <div className="bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <Link href="/syllabus/analytics" className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Analytics
                        </Link>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
                            <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 hover:bg-slate-500/30 text-[11px]">
                                Detailed Analysis
                            </Badge>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display leading-tight break-words">
                                {meta.testTitle || "Practice Test Review"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-300 text-xs sm:text-sm">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                                    {durationDisplay}
                                </span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full hidden sm:block"></span>
                                <span className="text-slate-400 text-xs sm:text-sm">
                                    {new Date(meta.endTime || new Date()).toDateString()}
                                </span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full hidden sm:block"></span>
                                <span className="flex items-center gap-1.5">
                                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    {answers.length} Qs
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 bg-white/5 p-3 sm:p-4 rounded-2xl border border-white/10 backdrop-blur-md w-full md:w-auto justify-center md:justify-end">
                             <div className="text-right">
                                 <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Score</div>
                                 <div className="text-2xl sm:text-3xl font-black text-white">
                                     {finalScore}<span className="text-base sm:text-lg text-slate-500 font-medium">/{finalTotalMarks}</span>
                                 </div>
                             </div>
                             <div className={cn(
                                 "w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg border-4 border-slate-900",
                                 accuracy >= 80 ? "bg-emerald-500 text-white" :
                                 accuracy >= 60 ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                             )}>
                                 {accuracy}%
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 px-4 py-4 sm:p-6 grid grid-cols-3 gap-3 sm:gap-4 text-center">
                    <div className="space-y-0.5 sm:space-y-1">
                        <div className="text-xl sm:text-2xl font-bold text-emerald-600 flex items-center justify-center gap-1.5 sm:gap-2">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> {correctAns.length}
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">Correct</div>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 border-l border-r border-slate-100">
                        <div className="text-xl sm:text-2xl font-bold text-red-600 flex items-center justify-center gap-1.5 sm:gap-2">
                             <XCircle className="w-4 h-4 sm:w-5 sm:h-5" /> {wrongAns.length}
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">Incorrect</div>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                        <div className="text-xl sm:text-2xl font-bold text-slate-400 flex items-center justify-center gap-1.5 sm:gap-2">
                           <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" /> {skippedAns.length}
                        </div>
                         <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">Skipped</div>
                    </div>
                </div>
            </div>

            {/* LEADERBOARD SECTION - Integrated for History */}
            <HistoryLeaderboard 
                leaderboard={leaderboard} 
                currentUserId={meta.userId} 
            />

            {/* Question List */}
            <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 px-1">Question Analysis</h2>

                <div className="space-y-3 sm:space-y-5">
                    {answers.map((ans: any, idx: number) => {
                        const isCorrect = ans.isCorrect;
                        const isSkipped = !ans.userAnswer;
                        const isWrong = !isCorrect && !isSkipped;

                        return (
                            <Card key={ans.id} className={cn(
                                "overflow-hidden transition-all border-l-[3px] rounded-xl",
                                isCorrect ? "border-l-emerald-500" :
                                isWrong ? "border-l-red-500" :
                                "border-l-slate-300"
                            )}>
                                {/* Question — Q number inline, full width */}
                                <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-slate-100 bg-slate-50/30">
                                     <div className="space-y-2">
                                         <div className="flex items-start gap-0">
                                             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide shrink-0 mt-[3px] mr-2 tabular-nums">
                                                 Q{ans.order || idx + 1}.
                                             </span>
                                             <div className="flex-1 min-w-0">
                                                <FormattedQuestionText 
                                                    text={ans.questionText}
                                                    className="text-[15px] sm:text-base text-slate-900 font-medium leading-[1.7] tracking-[-0.01em]"
                                                />
                                                {ans.questionTextEn && (
                                                    <FormattedQuestionText 
                                                        text={ans.questionTextEn}
                                                        className="text-[13px] sm:text-sm text-slate-500 leading-[1.7] mt-1.5"
                                                    />
                                                )}
                                             </div>
                                         </div>
                                         {/* Status badges — compact inline row */}
                                         <div className="flex flex-wrap items-center gap-1.5 pl-6">
                                             {isCorrect && (
                                                 <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">✓ Correct +3</span>
                                             )}
                                             {isWrong && (
                                                 <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">✗ Wrong −1</span>
                                             )}
                                             {isSkipped && (
                                                 <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Skipped</span>
                                             )}
                                             <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                                                 ⏱ {ans.timeTaken || 0}s
                                             </span>
                                         </div>
                                     </div>
                                </div>
                                
                                <CardContent className="px-4 py-3.5 sm:px-5 sm:py-4 space-y-4">
                                    {/* Options — clean, full width */}
                                    <div className="space-y-2">
                                        {Array.isArray(ans.options) && ans.options.map((opt: any, optIdx: number) => {
                                             const optionId = String.fromCharCode(65 + optIdx);
                                             let optionText = "";
                                             let optionLabel = optionId;
                                             
                                             if (typeof opt === 'string') {
                                                optionText = opt;
                                             } else if (typeof opt === 'object' && opt !== null) {
                                                optionText = opt.text || opt.text_en || JSON.stringify(opt);
                                                if (opt.id) optionLabel = opt.id;
                                             }

                                             const isUserSelected = ans.userAnswer === optIdx || ans.userAnswer === optionId || ans.userAnswer === optionLabel;
                                             const isCorrectOption = ans.correctAnswer === optIdx || ans.correctAnswer === optionId || ans.correctAnswer === optionLabel;
                                             
                                             return (
                                                 <div key={optIdx} className={cn(
                                                     "relative px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border flex items-start gap-2.5 transition-all",
                                                     isCorrectOption ? "bg-emerald-50/80 border-emerald-300" :
                                                     isUserSelected ? "bg-red-50/80 border-red-300" :
                                                     "bg-white border-slate-100"
                                                 )}>
                                                     <span className={cn(
                                                         "w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 mt-[1px]",
                                                         isCorrectOption ? "bg-emerald-500 text-white" :
                                                         isUserSelected ? "bg-red-500 text-white" :
                                                         "bg-slate-100 text-slate-500"
                                                     )}>
                                                         {optionLabel}
                                                     </span>
                                                     <span className={cn(
                                                         "flex-1 text-[14px] sm:text-[15px] leading-[1.65] tracking-[-0.005em]",
                                                         isCorrectOption ? "text-emerald-900" :
                                                         isUserSelected ? "text-red-900" :
                                                         "text-slate-700"
                                                     )}>
                                                         {optionText}
                                                     </span>
                                                     {isCorrectOption && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                                                     {isUserSelected && !isCorrectOption && <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                                                 </div>
                                             )
                                        })}
                                    </div>

                                    {/* Premium Explanation — flush to card edges for max width */}
                                    {(ans.explanation || ans.explanationEn) && (
                                        <div className="-mx-4 sm:-mx-5 -mb-3.5 sm:-mb-4 border-t border-slate-100 bg-slate-50/50">
                                            <div className="px-4 py-2 sm:px-5 border-b border-slate-100/80 flex items-center gap-2">
                                                <Lightbulb className="w-3.5 h-3.5 text-slate-500" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Explanation</span>
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
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
