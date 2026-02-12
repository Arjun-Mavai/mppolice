"use client"

import { motion } from 'framer-motion';
import { Play, Lock, CheckCircle2, Clock, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizListItemProps {
    index: number;
    title: string;
    subtitle?: string;
    questions?: number;
    marks?: number;
    duration?: number;
    isLocked?: boolean;
    isCompleted?: boolean;
    attemptsLeft?: number | null;
    maxAttempts?: number | null;
    isFree?: boolean;
    onClick: () => void;
    language?: 'en' | 'hi';
    colorVariant?: 'blue' | 'pink' | 'emerald' | 'amber' | 'slate' | 'indigo';
}

export function QuizListItem({
    index,
    title,
    questions,
    marks,
    duration,
    isLocked,
    isCompleted,
    attemptsLeft,
    maxAttempts,
    isFree,
    onClick,
    language = 'en',
    colorVariant = 'slate'
}: QuizListItemProps) {
    const hi = language === 'hi';
    const num = index + 1;
    const formattedNum = num < 10 ? `0${num}` : num;

    const styles = {
        blue: "bg-blue-50/60 hover:bg-blue-50 border-blue-100 hover:border-blue-200 text-blue-600",
        pink: "bg-pink-50/60 hover:bg-pink-50 border-pink-100 hover:border-pink-200 text-pink-600",
        emerald: "bg-emerald-50/60 hover:bg-emerald-50 border-emerald-100 hover:border-emerald-200 text-emerald-600",
        amber: "bg-amber-50/60 hover:bg-amber-50 border-amber-100 hover:border-amber-200 text-amber-600",
        indigo: "bg-indigo-50/60 hover:bg-indigo-50 border-indigo-100 hover:border-indigo-200 text-indigo-600",
        slate: "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600",
    };

    const style = styles[colorVariant];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.002 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className={cn(
                "group relative border rounded-[1.8rem] p-4 sm:p-5 transition-all cursor-pointer",
                style,
                isLocked && "grayscale-[0.4] opacity-80"
            )}
        >
            <div className="flex flex-row items-center gap-4 sm:gap-6">
                
                {/* 🔢 Index / Status Indicator */}
                <div className="relative flex-shrink-0">
                    <div className={cn(
                        "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-transform group-hover:scale-105",
                        isLocked 
                            ? "bg-slate-100 text-slate-400" 
                            : isCompleted 
                                ? "bg-white text-emerald-600 border border-emerald-100 shadow-sm"
                                : "bg-slate-900 text-white shadow-md shadow-slate-200"
                    )}>
                        <span className="text-[9px] leading-tight uppercase tracking-widest opacity-60">
                            {hi ? 'टेस्ट' : 'Test'}
                        </span>
                        <span className="text-lg sm:text-xl leading-none">
                            {isLocked ? <Lock size={18} /> : formattedNum}
                        </span>
                    </div>

                    {isCompleted && !isLocked && (
                         <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-white" />
                         </div>
                    )}
                </div>

                {/* 📝 Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn(
                            "text-base sm:text-lg font-black tracking-tight transition-colors truncate",
                            isLocked ? "text-slate-500" : "text-slate-900"
                        )}>
                            {title}
                        </h3>
                        {isFree && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-200">
                                Free
                            </span>
                        )}
                        {/* 🔒 ATTEMPTS (Grey Text Only) */}
                        {!isLocked && attemptsLeft !== undefined && attemptsLeft !== null && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                {attemptsLeft === 9999 
                                    ? (hi ? 'असीमित प्रयास' : 'Unlimited') 
                                    : (maxAttempts 
                                        ? (hi ? `${(maxAttempts - attemptsLeft)}/${maxAttempts} प्रयास` : `${(maxAttempts - attemptsLeft)}/${maxAttempts} Attempts`)
                                        : (hi ? `${attemptsLeft} शेष प्रयास` : `${attemptsLeft} Left`)
                                    )
                                }
                            </span>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-500">
                        {questions !== undefined && (
                            <span className="flex items-center gap-1">
                                {questions} {hi ? 'प्रश्न' : 'Que'}
                            </span>
                        )}
                        {marks !== undefined && (
                            <span className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                {marks} {hi ? 'अंक' : 'Marks'}
                            </span>
                        )}
                        {attemptsLeft !== undefined && maxAttempts && (
                            <span className={cn(
                                "flex items-center gap-1",
                                attemptsLeft === 0 ? "text-rose-500" : "text-emerald-600"
                            )}>
                                <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                                {attemptsLeft} {hi ? 'शेष' : 'Left'}
                            </span>
                        )}
                    </div>
                </div>

                {/* 🏁 Action Area */}
                <div className="flex items-center gap-3 ml-auto">
                    {duration !== undefined && (
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{hi ? 'समय' : 'Time'}</span>
                            <span className="text-slate-900 font-black text-xs">{duration}m</span>
                        </div>
                    )}

                    <Button 
                        size="sm"
                        className={cn(
                            "h-10 px-4 rounded-xl font-black text-xs transition-all flex items-center gap-2 border-0 shadow-sm active:scale-95 flex-shrink-0",
                            isLocked 
                                ? "bg-slate-100 text-slate-400" 
                                : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-900 hover:text-white"
                        )}
                    >
                        {isLocked ? (
                            <Lock size={14} />
                        ) : (
                            <>
                                <Play size={14} className={cn("transition-transform group-hover:scale-110", !isLocked && "fill-current")} />
                                <span className="hidden xs:inline">
                                    {isCompleted ? (hi ? 'फिर से' : 'Redo') : (hi ? 'शुरू' : 'Start')}
                                </span>
                            </>
                        )}
                    </Button>
                </div>

            </div>
        </motion.div>
    );
}
