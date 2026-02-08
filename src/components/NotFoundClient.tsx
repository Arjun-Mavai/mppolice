'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export function NotFoundClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />

      <div className="relative max-w-lg w-full text-center">
        {/* Large gradient 404 */}
        <h1 className="text-[10rem] sm:text-[12rem] font-extrabold leading-none tracking-tighter bg-gradient-to-b from-slate-200 to-slate-300 bg-clip-text text-transparent select-none mb-2">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
          Page not found
        </h2>
        <p className="text-base text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-all hover:shadow-md w-full sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:shadow-md w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        <p className="text-sm text-slate-400">
          Need help?{' '}
          <Link
            href="/contact"
            className="text-slate-600 hover:text-slate-900 underline underline-offset-4 decoration-slate-300 hover:decoration-slate-600 transition-colors"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
