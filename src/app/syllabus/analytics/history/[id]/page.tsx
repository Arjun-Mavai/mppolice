
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAttemptDetails } from '@/actions/analytics-actions';
import { 
    ArrowLeft, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    Target,
    BarChart3,
    Trophy,
    Lightbulb,
    Brain,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PremiumExplanation } from '@/components/quiz/PremiumExplanation';
import { HistoryLanguageToggle } from '@/components/quiz/HistoryLanguageToggle';
export default async function AttemptReviewPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const attempt = await getAttemptDetails(params.id);

    if (!attempt) {
        return notFound();
    }

    const { meta, answers } = attempt;
    const accuracy = Math.round(((meta.score ?? 0) / (meta.totalMarks || 1)) * 100);
    const duration = meta.endTime && meta.startTime ? 
        Math.round((new Date(meta.endTime).getTime() - new Date(meta.startTime).getTime()) / 60000) : 0;

    // Categorize answers
    const correctAns = answers.filter(a => a.isCorrect);
    const wrongAns = answers.filter(a => !a.isCorrect && a.userAnswer);
    const skippedAns = answers.filter(a => !a.userAnswer);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header / Hero */}
            <div className="bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <Link href="/syllabus" className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Syllabus
                        </Link>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-4">
                            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30">
                                Detailed Analysis
                            </Badge>
                            <h1 className="text-3xl md:text-4xl font-bold font-display leading-tight">
                                {meta.testTitle || "Practice Test Review"}
                            </h1>
                            <div className="flex items-center gap-4 text-slate-300 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" /> 
                                    {new Date(meta.endTime || new Date()).toDateString()}
                                </span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span className="flex items-center gap-1.5">
                                    <BarChart3 className="w-4 h-4" />
                                    {answers.length} Questions
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                             <div className="text-right">
                                 <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Score</div>
                                 <div className="text-3xl font-black text-white">
                                     {meta.score}<span className="text-lg text-slate-500 font-medium">/{meta.totalMarks}</span>
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
                                     <div className="flex justify-between items-start gap-4">
                                         <div className="flex gap-3">
                                             <div className="mt-0.5">
                                                 <Badge variant="outline" className="bg-white font-bold text-slate-500 border-slate-200">
                                                     Q.{ans.order || idx + 1}
                                                 </Badge>
                                             </div>
                                             <div className="space-y-1">
                                                <div className="font-medium text-slate-900 text-lg leading-snug">
                                                    {ans.questionText}
                                                </div>
                                                {ans.questionTextEn && (
                                                    <div className="text-slate-500 text-base font-normal mt-1 leading-snug">
                                                        {ans.questionTextEn}
                                                    </div>
                                                )}
                                             </div>
                                         </div>
                                         <div className="shrink-0">
                                             {isCorrect && (
                                                 <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                                                     Correct (+{ans.marks})
                                                 </Badge>
                                             )}
                                             {isWrong && (
                                                 <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">
                                                     Incorrect (0)
                                                 </Badge>
                                             )}
                                             {isSkipped && (
                                                 <Badge variant="secondary" className="text-slate-500">
                                                     Skipped
                                                 </Badge>
                                             )}
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

                                             const isUserSelected = ans.userAnswer === String(optIdx) || ans.userAnswer === optionId || ans.userAnswer === optionLabel;
                                             
                                             // Align correct answer check
                                             const isCorrectOption = ans.correctAnswer === String(optIdx) || ans.correctAnswer === optionId || ans.correctAnswer === optionLabel;
                                             
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
                                        <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100/50 overflow-hidden">
                                            <div className="bg-indigo-100/50 px-6 py-3 border-b border-indigo-100/50 flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4 text-indigo-600" />
                                                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Premium Explanation</span>
                                            </div>
                                            <div className="p-6">
                                                 {/* We let the component handle language via store, but we pass the raw strings.
                                                     Logic: If user prefers Hindi, we try to pass Hindi string if available. 
                                                     Actually, PreimumExplanation takes one 'explanation' string and parses it. 
                                                     In the history object, we have 'explanation' (Hindi usually) and 'explanationEn'.
                                                     We should pass the one matching the user's preference? 
                                                     But here in Server Component we don't know user pref easily.
                                                     However, PremiumExplanation is Client Component. 
                                                     So we can pass BOTH and let it decide? No, it takes one string.
                                                     
                                                     Solution: Pass a wrapper client component? 
                                                     Or better: Pass 'explanation' (Hindi) as primary if we assume Hindi base, 
                                                     or we need a 'SmartExplanationWrapper' that takes both and picks based on store.
                                                     
                                                     Let's stick to passing 'explanation' (Hindi) for now as default, 
                                                     OR create a small client wrapper right here? 
                                                     
                                                     Actually, PremiumExplanation DOES access store now. 
                                                     But it takes `explanation` prop. It can't switch the *content* of the prop based on store 
                                                     unless the prop *contains* both. 
                                                     
                                                     Refactor: I should pass BOTH to PremiumExplanation if I want it to switch text.
                                                     But for now, I will pass `ans.explanation` (Hindi/Default) because `mppsc_prompts` says 'explanation' is the main one.
                                                     Wait, `mppsc_prompts.md` has `explanation` and `explanationEn`.
                                                     
                                                     If I only pass `ans.explanation`, English users see Hindi.
                                                     
                                                     I will update `PremiumExplanation` to accept `explanationEn` as optional prop.
                                                 */}
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
