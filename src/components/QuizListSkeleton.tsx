'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function QuizListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="relative flex items-center gap-4 rounded-[1.8rem] border border-slate-100 bg-white p-4 shadow-sm sm:gap-6 sm:p-5"
        >
          {/* Index Skeleton */}
          <Skeleton className="h-12 w-12 rounded-2xl sm:h-14 sm:w-14" />

          {/* Content Skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4 max-w-[200px] rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          </div>

          {/* Action Skeleton */}
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function TopicGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[320px] w-full rounded-[2.5rem]" />
      ))}
    </div>
  );
}
