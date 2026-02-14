'use client';

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
    <div className="relative z-20 mx-auto mt-8 max-w-4xl px-4 sm:px-6">
      {/* Rank Banner */}
      {leaderboard.userRank && (
        <div className="mb-6 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900 px-8 py-3 text-white shadow-xl shadow-slate-900/20"
          >
            <span className="text-3xl">🏅</span>
            <div className="text-left">
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Achieved Rank
              </div>
              <div className="bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-xl font-bold text-transparent">
                #{leaderboard.userRank}{' '}
                <span className="text-sm font-medium text-slate-500">
                  / {leaderboard.totalParticipants}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 p-4 backdrop-blur-sm">
          <h3 className="flex items-center gap-2 font-bold text-slate-800">
            <span className="text-xl">🏆</span> Leaderboard
          </h3>
          <Badge variant="outline" className="border-slate-200 bg-white font-normal">
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
                  'flex items-center justify-between p-3.5 transition-colors',
                  isCurrentUser ? 'bg-slate-50/60' : 'hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-sm',
                      index === 0
                        ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400/20'
                        : index === 1
                          ? 'bg-slate-200 text-slate-700 ring-2 ring-slate-400/20'
                          : index === 2
                            ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-400/20'
                            : 'bg-slate-50 text-slate-400'
                    )}
                  >
                    {index === 0 ? '1' : index === 1 ? '2' : index === 2 ? '3' : index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      {isCurrentUser ? 'YOU' : entry.displayName}
                      {isCurrentUser && (
                        <Badge className="h-5 bg-slate-800 px-1.5 text-[10px]">ME</Badge>
                      )}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">
                      ⏱️ {Math.floor(entry.timeTakenSeconds / 60)}m {entry.timeTakenSeconds % 60}s
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-700 tabular-nums">{entry.score}</div>
                  <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Score
                  </div>
                </div>
              </div>
            );
          })}

          {/* If user is not in top 10, show at bottom */}
          {/* Fixed TS Error: Check if userRank exists before comparison */}
          {(leaderboard.userRank ?? 0) > 10 && leaderboard.userEntry && (
            <>
              <div className="border-y border-slate-100 bg-slate-50/50 p-2 text-center text-xs text-slate-400 italic">
                ... skipping to your rank ...
              </div>
              <div className="flex items-center justify-between border-l-4 border-slate-500 bg-slate-50 p-3.5">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-500 text-sm font-bold text-white shadow-md">
                    {leaderboard.userRank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      YOU
                      <Badge className="h-5 bg-slate-900 px-1.5 text-[10px]">ME</Badge>
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">
                      ⏱️ {Math.floor(leaderboard.userEntry.timeTakenSeconds / 60)}m{' '}
                      {leaderboard.userEntry.timeTakenSeconds % 60}s
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-700 tabular-nums">
                    {leaderboard.userEntry.score}
                  </div>
                  <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Score
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
