
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuizResult } from "@/features/tests/components/QuizResult";
import { cn } from '@/lib/utils';
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
                
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <Link href="/syllabus/analytics" className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Analytics
                        </Link>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-3 min-w-0 flex-1">
                            <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 hover:bg-slate-500/30">
                                Detailed Analysis
                            </Badge>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display leading-tight break-words">
                                {meta.testTitle || "Practice Test Review"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-slate-300 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" /> 
                                    {durationDisplay}
                                </span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full hidden sm:block"></span>
                                <span className="text-slate-400 text-xs sm:text-sm">
                                    {new Date(meta.endTime || new Date()).toDateString()}
                                </span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full hidden sm:block"></span>
                                <span className="flex items-center gap-1.5">
                                    <BarChart3 className="w-4 h-4" />
                                    {answers.length} Qs
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                             <div className="text-right">
                                 <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Score</div>
                                 <div className="text-3xl font-black text-white">
                                     {finalScore}<span className="text-lg text-slate-500 font-medium">/{finalTotalMarks}</span>
                                 </div>
                             </div>
                             <div className={cn(
                                 "w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg border-4 border-slate-900",
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
            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> {correctAns.length}
                        </div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Correct</div>
                    </div>
                    <div className="space-y-1 border-l border-r border-slate-100">
                        <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
                             <XCircle className="w-5 h-5" /> {wrongAns.length}
                        </div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Incorrect</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-slate-400 flex items-center justify-center gap-2">
                           <AlertCircle className="w-5 h-5" /> {skippedAns.length}
                        </div>
                         <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Skipped</div>
                    </div>
                </div>
            </div>

            {/* LEADERBOARD SECTION - Integrated for History */}
            <HistoryLeaderboard 
                leaderboard={leaderboard} 
                currentUserId={meta.userId} 
            />

            {/* Question List */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Question Analysis</h2>
                    <div className="flex gap-2">
                        {/* Filters could go here in future */}
                    </div>
                </div>

                <div className="space-y-6">
                    {answers.map((ans: any, idx: number) => {
                        const isCorrect = ans.isCorrect;
                        const isSkipped = !ans.userAnswer;
                        const isWrong = !isCorrect && !isSkipped;

                        return (
                            <Card key={ans.id} className={cn(
                                "overflow-hidden transition-all border-l-4",
                                isCorrect ? "border-l-emerald-500 shadow-emerald-100/50" :
                                isWrong ? "border-l-red-500 shadow-red-100/50" :
                                "border-l-slate-300"
                            )}>
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                                     {/* Mobile: stack vertically, Desktop: side by side */}
                                     <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                                         <div className="flex gap-3 flex-1 min-w-0">
                                             <div className="shrink-0 mt-0.5">
                                                 <Badge variant="outline" className="bg-white font-bold text-slate-500 border-slate-200">
                                                     Q.{ans.order || idx + 1}
                                                 </Badge>
                                             </div>
                                             <div className="space-y-1 min-w-0">
                                                <div className="font-medium text-slate-900 text-base sm:text-lg leading-relaxed">
                                                    {ans.questionText}
                                                </div>
                                                {ans.questionTextEn && (
                                                    <div className="text-slate-500 text-sm sm:text-base font-normal mt-1 leading-relaxed">
                                                        {ans.questionTextEn}
                                                    </div>
                                                )}
                                             </div>
                                         </div>
                                         {/* Status badges — wrap on mobile */}
                                         <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0 pl-10 sm:pl-0">
                                             {isCorrect && (
                                                 <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-xs">
                                                     Correct (+3)
                                                 </Badge>
                                             )}
                                             {isWrong && (
                                                 <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none text-xs">
                                                     Incorrect (-1)
                                                 </Badge>
                                             )}
                                             {isSkipped && (
                                                 <Badge variant="secondary" className="text-slate-500 text-xs">
                                                     Skipped
                                                 </Badge>
                                             )}
                                             <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 text-xs">
                                                 ⏱️ {ans.timeTaken || 0}s
                                             </Badge>
                                         </div>
                                     </div>
                                </CardHeader>
                                
                                <CardContent className="p-6 space-y-6">
                                    {/* Options */}
                                    <div className="grid gap-3">
                                        {Array.isArray(ans.options) && ans.options.map((opt: any, optIdx: number) => {
                                             const optionId = String.fromCharCode(65 + optIdx); // A, B, C, D
                                             
                                             // Robust parsing: opt could be string or object {text: 'Val', id: 'A'}
                                             let optionText = "";
                                             let optionLabel = optionId;
                                             
                                             if (typeof opt === 'string') {
                                                optionText = opt;
                                             } else if (typeof opt === 'object' && opt !== null) {
                                                optionText = opt.text || opt.text_en || JSON.stringify(opt);
                                                if (opt.id) optionLabel = opt.id;
                                             }

                                             // ✅ Fixed: userAnswer and correctAnswer are now NUMBERS (converted in getAttemptDetails)
                                             // Compare with optIdx (number) directly instead of String(optIdx)
                                             const isUserSelected = ans.userAnswer === optIdx || ans.userAnswer === optionId || ans.userAnswer === optionLabel;
                                             
                                             // Align correct answer check - also use NUMBER comparison
                                             const isCorrectOption = ans.correctAnswer === optIdx || ans.correctAnswer === optionId || ans.correctAnswer === optionLabel;
                                             
                                             return (
                                                 <div key={optIdx} className={cn(
                                                     "relative p-4 rounded-xl border-2 flex items-center gap-4 transition-all",
                                                     isCorrectOption ? "bg-emerald-50 border-emerald-500/50" :
                                                     isUserSelected ? "bg-red-50 border-red-500/50" :
                                                     "bg-white border-slate-100 hover:border-slate-200"
                                                 )}>
                                                     <div className={cn(
                                                         "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                                                         isCorrectOption ? "bg-emerald-500 text-white" :
                                                         isUserSelected ? "bg-red-500 text-white" :
                                                         "bg-slate-100 text-slate-500"
                                                     )}>
                                                         {optionLabel}
                                                     </div>
                                                     <span className={cn(
                                                         "flex-1 font-medium",
                                                         isCorrectOption ? "text-emerald-900" :
                                                         isUserSelected ? "text-red-900" :
                                                         "text-slate-700"
                                                     )}>
                                                         {optionText}
                                                     </span>
                                                     {isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                                                     {isUserSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-600" />}
                                                 </div>
                                             )
                                        })}
                                    </div>

                                    {/* Detailed Explanation Section */}
                                    {(ans.explanation || ans.explanationEn) && (
                                        <div className="bg-slate-50/50 rounded-2xl border border-slate-100/50 overflow-hidden">
                                            <div className="bg-slate-100/50 px-6 py-3 border-b border-slate-100/50 flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4 text-slate-700" />
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Premium Explanation</span>
                                            </div>
                                            <div className="p-6">
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
