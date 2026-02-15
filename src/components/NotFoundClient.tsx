'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export function NotFoundClient() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-white p-6">
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)] bg-[size:4rem_4rem]" />

      <div className="relative w-full max-w-lg text-center">
        {/* Large gradient 404 */}
        <h1 className="mb-2 bg-gradient-to-b from-slate-200 to-slate-300 bg-clip-text text-[10rem] leading-none font-extrabold tracking-tighter text-transparent select-none sm:text-[12rem]">
          404
        </h1>

        <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Page not found
        </h2>
        <p className="mx-auto mb-10 max-w-sm text-base leading-relaxed text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        <p className="text-sm text-slate-400">
          Need help?{' '}
          <Link
            href="/contact"
            className="text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-900 hover:decoration-slate-600"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
