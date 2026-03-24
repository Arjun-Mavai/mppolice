'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-white selection:bg-indigo-500/30">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-rose-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
      </div>

      {/* Header Skeleton */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/10" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 ring-1 ring-white/10">
                    <Zap className="h-5 w-5 animate-pulse" />
                  </div>
                  <Skeleton className="h-6 w-40 bg-white/10" />
                </div>
                <Skeleton className="h-3 w-48 bg-white/5" />
              </div>
            </div>
            <div className="h-8 w-24 rounded-lg bg-white/10" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Menu Skeleton */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 shrink-0 rounded-xl bg-white/5" />
          ))}
        </div>

        {/* Section Title Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-white/10" />
          <Skeleton className="h-4 w-96 bg-white/5" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl bg-white/5" />
          ))}
        </div>

        {/* Large Section Skeleton */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <Skeleton className="h-6 w-48 bg-white/10" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
