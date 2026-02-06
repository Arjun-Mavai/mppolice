
"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Defined based on return type of getTestLeaderboard
interface LeaderboardData {
    leaderboard: any[]; // Using any[] for flexibility similar to original code, or define strict type
    userRank: number | null;
    userEntry: any | null;
    totalParticipants: number;
}

interface HistoryLeaderboardProps {
    leaderboard: LeaderboardData | null; // Can be null if fetch fails or no data
    currentUserId: string;
}

export function HistoryLeaderboard({ leaderboard, currentUserId }: HistoryLeaderboardProps) {
    if (!leaderboard) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 relative z-20">
             {/* Rank Banner */}
             {leaderboard.userRank && (
                <div className="mb-6 flex justify-center">
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 bg-slate-900 text-white rounded-full px-8 py-3 shadow-xl shadow-slate-900/20 border border-slate-800"
                    >
                         <span className="text-3xl">🏅</span>
                         <div className="text-left">
                             <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Achieved Rank</div>
                             <div className="text-xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                                #{leaderboard.userRank} <span className="text-slate-500 text-sm font-medium">/ {leaderboard.totalParticipants}</span>
                             </div>
                         </div>
                     </motion.div>
                </div>
             )}

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="bg-slate-50/80 p-4 border-b border-slate-200 flex justify-between items-center backdrop-blur-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-xl">🏆</span> Leaderboard
                    </h3>
                    <Badge variant="outline" className="bg-white border-slate-200 font-normal">
                        Top 10 Performers
                    </Badge>
                </div>
                <div className="divide-y divide-slate-100">
                    {leaderboard.leaderboard.map((entry: any, index: number) => {
                        const isCurrentUser = entry.userId === currentUserId;
                        return (
                            <div 
                                key={entry.id} 
                                className={cn(
                                    "flex items-center justify-between p-3.5 transition-colors",
                                    isCurrentUser ? "bg-indigo-50/60" : "hover:bg-slate-50"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm",
                                        index === 0 ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400/20" :
                                        index === 1 ? "bg-slate-200 text-slate-700 ring-2 ring-slate-400/20" :
                                        index === 2 ? "bg-orange-100 text-orange-700 ring-2 ring-orange-400/20" :
                                        "bg-slate-50 text-slate-400"
                                    )}>
                                        {index === 0 ? '1' : index === 1 ? '2' : index === 2 ? '3' : (index + 1)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                            {isCurrentUser ? "YOU" : entry.displayName}
                                            {isCurrentUser && <Badge className="h-5 px-1.5 bg-indigo-600 text-[10px]">ME</Badge>}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            ⏱️ {Math.floor(entry.timeTakenSeconds / 60)}m {entry.timeTakenSeconds % 60}s
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-indigo-600 tabular-nums">{entry.score}</div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score</div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* If user is not in top 10, show at bottom */}
                    {/* Fixed TS Error: Check if userRank exists before comparison */}
                    {(leaderboard.userRank ?? 0) > 10 && leaderboard.userEntry && (
                        <>
                            <div className="p-2 text-center text-xs text-slate-400 bg-slate-50/50 border-y border-slate-100 italic">
                                ... skipping to your rank ...
                            </div>
                            <div className="flex items-center justify-between p-3.5 bg-indigo-50 border-l-4 border-indigo-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white bg-indigo-500 shadow-md">
                                        {leaderboard.userRank}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                            YOU
                                            <Badge className="h-5 px-1.5 bg-slate-900 text-[10px]">ME</Badge>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            ⏱️ {Math.floor(leaderboard.userEntry.timeTakenSeconds / 60)}m {leaderboard.userEntry.timeTakenSeconds % 60}s
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-indigo-600 tabular-nums">{leaderboard.userEntry.score}</div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
