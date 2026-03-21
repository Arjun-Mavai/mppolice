'use client';

import type { ErrorInfo } from 'next/error';
import Link from 'next/link';
import { useEffect } from 'react';
import { logger } from '@/lib/logger';
import { AlertTriangle, RotateCcw, Home, ArrowRight } from 'lucide-react';

export default function Error(props: ErrorInfo) {
  const { error, reset, unstable_retry } = props;
  const errorWithDigest = error as Error & { digest?: string };

  useEffect(() => {
    logger.error('App Error:', error);
  }, [error]);

  const handleRetry = () => {
    // Primary: try unstable_retry if available (new in 16.2)
    if (unstable_retry) {
      unstable_retry();
    } else {
      // Fallback: use reset()
      reset();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="w-full max-w-lg text-center">
        {/* Decorative error icon */}
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-rose-50" />
          <div className="absolute inset-2 rounded-full bg-rose-100/60" />
          <AlertTriangle className="relative h-10 w-10 text-rose-400" />
        </div>

        <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900">
          Something went wrong
        </h1>
        <p className="mx-auto mb-8 max-w-sm text-base leading-relaxed text-slate-500">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {errorWithDigest.digest && (
          <div className="mx-auto mb-8 max-w-xs rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
            <p className="font-mono text-xs text-slate-400">Error ID: {errorWithDigest.digest}</p>
          </div>
        )}

        <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={handleRetry}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>

        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-600"
        >
          Contact Support
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
