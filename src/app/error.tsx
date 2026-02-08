'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { logger } from '@/lib/logger';
import { AlertTriangle, RotateCcw, Home, ArrowRight } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Decorative error icon */}
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-rose-50" />
          <div className="absolute inset-2 rounded-full bg-rose-100/60" />
          <AlertTriangle className="relative h-10 w-10 text-rose-400" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-base text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {error.digest && (
          <div className="mb-8 mx-auto max-w-xs rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
            <p className="text-xs text-slate-400 font-mono">
              Error ID: {error.digest}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-all hover:shadow-md w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:shadow-md w-full sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>

        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          Contact Support
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
