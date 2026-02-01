"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    Clock, 
    Check, 
    ArrowLeft,
    Filter,
    Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AnalysisViewProps {
    result: any; // Type from getAttemptResult
}

export default function AnalysisView({ result }: AnalysisViewProps) {
    const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct' | 'skipped'>('all');
    const [language, setLanguage] = useState<'hi' | 'en'>('hi');

    const { score, totalMarks, details } = result;
    const accuracy = Math.round((score / (totalMarks || 1)) * 100);

    const filteredQuestions = details.filter((q: any) => {
        if (filter === 'all') return true;
        if (filter === 'correct') return q.isCorrect;
        if (filter === 'incorrect') return !q.isCorrect && q.userAnswer;
        if (filter === 'skipped') return !q.userAnswer;
        return true;
    });

    const formatTime = (seconds: number) => {
        if (!seconds) return '-';
        return `${seconds}s`;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Context Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/tests">
                            <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-full">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-slate-900 leading-tight">Test Analysis</h1>
                            <div className="text-xs text-slate-500 font-medium">{new Date(result.startTime).toLocaleDateString()} • {details.length} Questions</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                         <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setLanguage('hi')}
                                className={cn("h-7 px-3 text-xs font-bold rounded-md", language === 'hi' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500")}
                            >
                                हिंदी
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setLanguage('en')}
                                className={cn("h-7 px-3 text-xs font-bold rounded-md", language === 'en' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500")}
                            >
                                ENG
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                
                {/* Score Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-6 border-slate-200 shadow-sm bg-white">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</div>
                        <div className="text-3xl font-black text-slate-900">{result.score} <span className="text-lg text-slate-400 font-medium">/ {result.totalMarks}</span></div>
                    </Card>
                    <Card className="p-6 border-slate-200 shadow-sm bg-white">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Accuracy</div>
                        <div className={cn("text-3xl font-black", accuracy >= 80 ? "text-emerald-600" : accuracy >= 60 ? "text-amber-600" : "text-red-600")}>
                            {accuracy}%
                        </div>
                    </Card>
                    <Card className="p-6 border-slate-200 shadow-sm bg-white">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Correct</div>
                        <div className="text-3xl font-black text-emerald-600">{details.filter((d: any) => d.isCorrect).length}</div>
                    </Card>
                    <Card className="p-6 border-slate-200 shadow-sm bg-white">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Wrong</div>
                        <div className="text-3xl font-black text-red-600">{details.filter((d: any) => !d.isCorrect && d.userAnswer).length}</div>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {(['all', 'incorrect', 'correct', 'skipped'] as const).map((f) => (
                        <Button
                            key={f}
                            variant={filter === f ? 'default' : 'outline'}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "rounded-full font-bold capitalize",
                                filter === f ? "bg-slate-900 text-white" : "bg-white border-slate-200 text-slate-600"
                            )}
                        >
                            {f}
                        </Button>
                    ))}
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                    {filteredQuestions.map((q: any, idx: number) => {
                        const isCorrect = q.isCorrect;
                        const isSkipped = !q.userAnswer;
                        const isWrong = !isCorrect && !isSkipped;
                        
                        const timeTaken = q.timeTaken || 0;
                        const idealTime = q.idealTime || 60;
                        const isTimeEfficient = timeTaken <= idealTime;

                        const questionText = language === 'en' && q.questionTextEn ? q.questionTextEn : q.questionText;
                        const explanation = language === 'en' && q.explanationEn ? q.explanationEn : q.explanation;

                        return (
                            <div 
                                key={q.questionId} 
                                className={cn(
                                    "bg-white rounded-3xl p-6 md:p-8 border-2 transition-all relative overflow-hidden group",
                                    isCorrect ? "border-emerald-100" : isWrong ? "border-red-100" : "border-slate-100"
                                )}
                            >
                                {/* Status Badge & Time */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "h-8 px-3 rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-wider",
                                            isCorrect ? "bg-emerald-100 text-emerald-700" : isWrong ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                                        )}>
                                            {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : isWrong ? <XCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            {isCorrect ? "Correct" : isWrong ? "Incorrect" : "Skipped"}
                                        </div>
                                        <div className="h-8 px-3 rounded-lg bg-indigo-50 text-indigo-700 flex items-center gap-2 text-xs font-bold border border-indigo-100/50">
                                            <span className="text-indigo-400">Q.{q.order}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border",
                                            isTimeEfficient ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                                        )}>
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatTime(timeTaken)}
                                            <span className="text-slate-400 font-normal">/ {formatTime(idealTime)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Question */}
                                <div className="mb-8">
                                    <p className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed font-display">
                                        {questionText}
                                    </p>
                                </div>

                                {/* Options */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                                   {/* Assuming options are stored as JSON strings if they are simple array, 
                                       or we need to parse if they are complex objects now. 
                                       The schema update said options: json array.
                                       We need to handle both legacy (string[]) and new (object[]) formats 
                                   */}
                                   {Array.isArray(q.options) && q.options.map((opt: any, optIdx: number) => {
                                       // Handle new schema object or old string
                                       const optId = typeof opt === 'object' ? opt.id : ['A','B','C','D'][optIdx];
                                       const optText = (typeof opt === 'object') 
                                            ? (language === 'en' ? opt.textEn : opt.text)
                                            : opt;

                                       const isSelected = q.userAnswer === optId; // Using IDs now
                                       // If legacy string match
                                       const isLegacyMatch = q.userAnswer === String(optIdx); // fallback logic if needed

                                        // Determining Correctness
                                       const isThisCorrect = q.correctAnswer === optId; 

                                       return (
                                           <div 
                                                key={optIdx}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 flex items-center gap-4 transition-all",
                                                    isThisCorrect 
                                                        ? "bg-emerald-50 border-emerald-500 text-emerald-900" 
                                                        : isSelected 
                                                            ? "bg-red-50 border-red-500 text-red-900" 
                                                            : "bg-white border-slate-100 text-slate-600"
                                                )}
                                           >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border",
                                                    isThisCorrect 
                                                        ? "bg-emerald-200 border-emerald-300 text-emerald-800"
                                                        : isSelected
                                                            ? "bg-red-200 border-red-300 text-red-800"
                                                            : "bg-slate-50 border-slate-200 text-slate-400"
                                                )}>
                                                    {typeof opt === 'object' ? opt.id : ['A','B','C','D'][optIdx]}
                                                </div>
                                                <span className="font-bold text-sm">{optText}</span>
                                                {isThisCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-auto" />}
                                                {isSelected && !isThisCorrect && <XCircle className="w-5 h-5 text-red-600 ml-auto" />}
                                           </div>
                                       )
                                   })}
                                </div>

                                {/* Explanation */}
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="bg-indigo-100 p-1.5 rounded-lg">
                                            <Check className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-indigo-900">Explanation & Concept</span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {explanation ? explanation.split('\n').map((line: string, i: number) => {
                                            const trimmed = line.trim();
                                            if (!trimmed) return null;

                                            // 💡 Exam Fact (High Value)
                                            if (trimmed.includes('💡') || trimmed.toLowerCase().includes('exam fact')) {
                                                return (
                                                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium">
                                                        <span className="text-lg">💡</span>
                                                        <span className="pt-0.5">{trimmed.replace(/💡|Exam Fact:/gi, '').trim()}</span>
                                                    </div>
                                                );
                                            }
                                            
                                            // 🧠 Memory Tip (Mnemonic)
                                            if (trimmed.includes('🧠') || trimmed.toLowerCase().includes('memory tip')) {
                                                return (
                                                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-sm font-medium">
                                                        <span className="text-lg">🧠</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-0.5">Memory Strategy</span>
                                                            <span>{trimmed.replace(/🧠|Memory Tip:/gi, '').trim()}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // 🚫 Scam Alert (Elimination)
                                            if (trimmed.includes('🚫') || trimmed.toLowerCase().includes('scam alert') || trimmed.toLowerCase().includes('elimination')) {
                                                return (
                                                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-medium">
                                                        <span className="text-lg">🚫</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-0.5">Don't Get Confused</span>
                                                            <span>{trimmed.replace(/🚫|Scam Alert:/gi, '').trim()}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // ✅ Correct Logic / Standard Text
                                            return (
                                                <p key={i} className="text-slate-600 leading-relaxed text-sm">
                                                    {trimmed.replace(/✅|Correct Answer:|Detailed Analysis:/gi, '').trim()}
                                                </p>
                                            );
                                        }) : (
                                            <p className="italic text-slate-400">No explanation provided.</p>
                                        )}
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
