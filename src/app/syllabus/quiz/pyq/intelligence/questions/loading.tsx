'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Quote } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-100" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="h-9 w-20 rounded-lg bg-slate-100" />
          </div>
        </div>
      </div>

      {/* Questions List Skeleton */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>

        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 shrink-0 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full rounded-2xl bg-white" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
