"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp, Sparkles, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Question } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { PremiumExplanation } from './PremiumExplanation';
import { useSettingsStore } from '@/store/useSettingsStore';
interface QuizResultProps {
    questions: Question[];
    answers: Record<string, number>;
    mode: 'topic' | 'full' | 'pyq';
    timeTaken: number; // in seconds
    onRetry: () => void;
    onExit: () => void;
}

export function QuizResult({ questions, answers, mode, timeTaken, onRetry, onExit }: QuizResultProps) {
    const router = useRouter();
    
    // Calculate Score
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    questions.forEach(q => {
        if (answers[q.id] === undefined) {
            skippedCount++;
        } else if (answers[q.id] === q.correctAnswer) {
            correctCount++;
        } else {
            wrongCount++;
        }
    });

    const totalQuestions = questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Score Header */}
            <div className="bg-slate-900 text-white p-6 pb-24 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
                    <h1 className="text-2xl font-bold font-display opacity-90">Test Results</h1>
                    
                    <div className="flex flex-col items-center">
                         <div className={cn(
                             "w-32 h-32 rounded-full border-4 flex items-center justify-center mb-4 shadow-2xl relative bg-slate-800",
                             scorePercentage >= 70 ? "border-emerald-500 text-emerald-500 shadow-emerald-900/50" :
                             scorePercentage >= 40 ? "border-amber-500 text-amber-500 shadow-amber-900/50" :
                             "border-red-500 text-red-500 shadow-red-900/50"
                         )}>
                             <div className="text-center">
                                 <div className="text-4xl font-bold">{scorePercentage}%</div>
                                 <div className="text-xs uppercase font-bold tracking-wider opacity-60">Accuracy</div>
                             </div>
                         </div>
                         <h2 className="text-3xl font-bold">
                             {scorePercentage >= 70 ? "Excellent Work!" : 
                              scorePercentage >= 40 ? "Keep Practicing!" : 
                              "Needs Improvement"}
                         </h2>
                         <p className="text-slate-400 text-sm mt-2">
                             Time Taken: {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
                         </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mt-8">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-emerald-400">{correctCount}</div>
                            <div className="text-[10px] uppercase font-bold text-emerald-200">Correct</div>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-red-400">{wrongCount}</div>
                            <div className="text-[10px] uppercase font-bold text-red-200">Wrong</div>
                        </div>
                        <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-3 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-slate-300">{skippedCount}</div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">Skipped</div>
                        </div>
                    </div>

                    {/* Smart Analytics / Feedback */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-xl mx-auto mt-8 relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-left border border-white/20 relative z-10 shadow-2xl">
                             <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                                     <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" /> AI Performance Analysis
                                </h3>
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                    scorePercentage >= 80 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : 
                                    scorePercentage >= 60 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : 
                                    "bg-red-500/20 text-red-300 border border-red-500/30"
                                )}>
                                    {scorePercentage >= 80 ? "Excellent" : scorePercentage >= 60 ? "Good" : "Needs Focus"}
                                </span>
                             </div>

                             <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-slate-300">
                                        <span>Knowledge Retention</span>
                                        <span>{scorePercentage}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-white/5 relative">
                                         <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${scorePercentage}%` }}
                                            transition={{ duration: 1.5, type: "spring" }}
                                            className={cn("h-full rounded-full relative overflow-hidden", 
                                                scorePercentage > 70 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : 
                                                scorePercentage > 40 ? "bg-gradient-to-r from-amber-500 to-orange-400" : 
                                                "bg-gradient-to-r from-red-500 to-rose-400"
                                            )} 
                                         >
                                             <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12"></div>
                                         </motion.div>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 shadow-inner">
                                    <p className="text-indigo-100 text-sm leading-relaxed font-medium">
                                        <Quote className="w-4 h-4 text-indigo-400 inline mr-2 -mt-1 transform rotate-180" />
                                        {scorePercentage >= 80 ? "Outstanding command! You have mastered the core concepts. Challenge yourself with a Full Length Mock Test to test endurance." :
                                         scorePercentage >= 60 ? "Solid effort. You have a good grasp, but missed some nuances. Review the explanations below, especially for dates and specific provisions." :
                                         "Don't be discouraged. Focus on the core definitions and timelines. Read the detailed explanations for each question below and retake this quiz."}
                                    </p>
                                </div>
                             </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Detailed Analysis */}
            <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-20 space-y-4">
                {questions.map((q, idx) => {
                    const userAnswer = answers[q.id];
                    const isCorrect = userAnswer === q.correctAnswer;
                    const isSkipped = userAnswer === undefined;
                    const isExpanded = expandedQuestion === q.id;

                    return (
                        <Card 
                            key={q.id} 
                            className={cn(
                                "border-l-4 overflow-hidden",
                                isCorrect ? "border-l-emerald-500" : 
                                isSkipped ? "border-l-slate-300" : "border-l-red-500"
                            )}
                        >
                            <div 
                                onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex gap-4">
                                     <div className="mt-1">
                                         {isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> :
                                          isSkipped ? <AlertCircle className="w-6 h-6 text-slate-300" /> :
                                          <XCircle className="w-6 h-6 text-red-500" />
                                         }
                                     </div>
                                     <div className="flex-1">
                                         <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug">
                                             <span className="text-slate-400 mr-2">Q{idx+1}.</span>
                                             {q.question}
                                         </h3>
                                     </div>
                                     <div className="text-slate-400">
                                         {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                     </div>
                                </div>
                            </div>

                            {/* Detailed Dropdown */}
                            {isExpanded && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className="bg-slate-50/50 border-t border-slate-100 p-4 space-y-4"
                                >
                                    <div className="space-y-2">
                                        {q.options.map((opt, optIdx) => {
                                            const isSelected = userAnswer === optIdx;
                                            const isCorrectOpt = q.correctAnswer === optIdx;
                                            
                                            // Determine style
                                            let styleClass = "border-slate-200 bg-white text-slate-600";
                                            if (isCorrectOpt) styleClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                                            else if (isSelected && !isCorrectOpt) styleClass = "border-red-500 bg-red-50 text-red-800 line-through decoration-red-500/50";

                                            return (
                                                <div 
                                                    key={optIdx} 
                                                    className={cn(
                                                        "p-3 rounded-lg border text-sm flex justify-between items-center",
                                                        styleClass
                                                    )}
                                                >
                                                    <span>{opt}</span>
                                                    {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                                    {isSelected && !isCorrectOpt && <XCircle className="w-4 h-4 text-red-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Explanation */}
                                    <div className="bg-white border border-indigo-100 p-4 rounded-xl text-sm shadow-sm">
                                        <div className="font-bold text-indigo-700 mb-2 flex items-center gap-1.5 uppercase tracking-wide text-xs">
                                            <AlertCircle className="w-4 h-4" /> Explanation
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
                        onClick={onExit}
                        variant="outline" 
                        className="flex-1 h-12 bg-white text-slate-900 border-slate-300 font-bold rounded-xl"
                    >
                        <Home className="w-4 h-4 mr-2" /> Back Home
                     </Button>
                     <Button 
                        onClick={onRetry}
                        className="flex-1 h-12 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Retry Quiz
                     </Button>
                </div>
            </div>
        </div>
    );
}
