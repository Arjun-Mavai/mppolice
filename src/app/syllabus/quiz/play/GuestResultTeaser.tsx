import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, ChevronRight, BarChart3, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface GuestResultTeaserProps {
    score: number;
    totalQuestions: number;
    timeTaken: number;
    guestName?: string;
    onLogin: () => void;
    onHome: () => void;
}

export function GuestResultTeaser({ score, totalQuestions, timeTaken, guestName, onLogin, onHome }: GuestResultTeaserProps) {
    const router = useRouter();
    const percentage = Math.round((score / (totalQuestions * 3)) * 100) || 0; // Assuming 3 marks per question roughly for %
    
    // Fake Rank Logic: Base 512.
    // Top 10% score -> Rank 1-50
    // Top 50% score -> Rank 51-250
    // Else -> Rank 251-512
    const totalParticipants = 512;
    let rank = 0;
    let beaten = 0;

    if (percentage >= 80) {
        rank = Math.floor(Math.random() * 40) + 1; // 1-40
        beaten = Math.floor(totalParticipants * 0.95);
    } else if (percentage >= 50) {
        rank = Math.floor(Math.random() * 200) + 50; // 50-250
        beaten = Math.floor(totalParticipants * 0.7);
    } else {
        rank = Math.floor(Math.random() * 200) + 250; // 250-450
        beaten = Math.floor(totalParticipants * 0.3);
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
            
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-60 -left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-md w-full relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                >
                    {/* Header Section */}
                    <div className="p-8 text-center space-y-2 relative border-b border-slate-800">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                             <Crown className="w-3 h-3" /> {guestName ? `Great Job, ${guestName}!` : 'Great Job!'}
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            You beat <span className="text-emerald-400">{beaten}</span> students
                        </h1>
                        <p className="text-slate-400 text-sm">
                            based on projected performance in this test.
                        </p>
                    </div>

                    {/* Main Stats Card */}
                    <div className="p-6 space-y-6">
                        
                        {/* Score Circle & Rank */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-700/50">
                                <div className="relative w-20 h-20 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="40" cy="40" r="36" className="stroke-slate-700" strokeWidth="6" fill="transparent" />
                                        <circle 
                                            cx="40" cy="40" r="36" 
                                            className="stroke-emerald-500" 
                                            strokeWidth="6" 
                                            fill="transparent"
                                            strokeDasharray={226}
                                            strokeDashoffset={226 - (226 * percentage) / 100}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute text-xl font-bold text-emerald-400">{percentage}%</span>
                                </div>
                                <span className="text-xs font-medium text-slate-400 mt-2">Score</span>
                            </div>

                            <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-700/50 relative overflow-hidden group">
                                {/* Blurred Effect */}
                                <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] z-10 flex items-center justify-center flex-col gap-1">
                                    <Lock className="w-6 h-6 text-indigo-400" />
                                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Unlock</span>
                                </div>
                                
                                <span className="text-3xl font-bold text-white blur-sm">#{rank}</span>
                                <span className="text-xs font-medium text-slate-400 mt-2">Global Rank</span>
                            </div>
                        </div>

                        {/* Locked Insights List */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest pl-1">
                                Locked Insights
                            </h3>
                            
                            {[
                                { icon: BarChart3, label: "Subject-wise Weakness Analysis", color: "text-blue-400", bg: "bg-blue-500/10" },
                                { icon: Clock, label: "Time Management Report", color: "text-amber-400", bg: "bg-amber-500/10" },
                                { icon: Zap, label: "Leaderboard & Percentile", color: "text-purple-400", bg: "bg-purple-500/10" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
                                    <div className="flex items-center gap-3 opacity-60">
                                        <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="h-2 w-32 bg-slate-700 rounded blur-[2px]" />
                                            <div className="h-2 w-20 bg-slate-700 rounded blur-[2px]" />
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-full bg-slate-800 text-slate-500">
                                        <Lock className="w-3 h-3" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Warning Box */}
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            <p className="text-xs text-red-200/80 leading-relaxed">
                                <strong className="text-red-400">Warning:</strong> This result is not saved. Create an account to save your progress, view detailed solutions, and track your improvement.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-3 pt-2">
                             <Button 
                                onClick={onLogin}
                                className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-indigo-500/25 relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Unlock Full Analysis <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </Button>
                            
                            <Button 
                                variant="ghost" 
                                onClick={onHome}
                                className="w-full text-slate-500 hover:text-slate-300 hover:bg-white/5"
                            >
                                Return to Home
                            </Button>
                        </div>

                    </div>
                </motion.div>
                
                <p className="text-center text-slate-600 text-xs mt-6">
                    Join 15,000+ students preparing for MPPSC 2026
                </p>
            </div>
        </div>
    );
}
