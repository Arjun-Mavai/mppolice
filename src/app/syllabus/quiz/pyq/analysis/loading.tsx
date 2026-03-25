'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fafbfc] pb-20">
      {/* Header Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-slate-200" />
              <Skeleton className="h-8 w-64 bg-slate-200" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-40 bg-slate-200" />
            <Skeleton className="h-10 w-24 bg-slate-200" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Skeleton className="h-12 w-full max-w-xs rounded-xl bg-slate-200" />
          <Skeleton className="h-12 w-40 rounded-xl bg-slate-200" />
        </div>

        {/* Content Skeleton */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Skeleton className="h-6 w-48 bg-slate-200 mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-2xl bg-slate-100" />
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Skeleton className="h-6 w-40 bg-slate-200 mb-6" />
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl bg-slate-100" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
