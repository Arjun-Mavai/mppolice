'use client';

import { useEffect } from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function QuizError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Quiz Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-red-50 p-4">
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-bold text-slate-900">Quiz Interrupted</h2>
      <p className="mb-6 max-w-sm text-slate-600">
        We encountered an error while loading the quiz. Your previous progress should be safe.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-white transition-colors hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
          Resume/Retry
        </button>
        <a
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </a>
      </div>
    </div>
  );
}
