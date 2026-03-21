'use client';

import * as Sentry from '@sentry/nextjs';
import NextError, { type ErrorInfo } from 'next/error';
import { useEffect } from 'react';

export default function GlobalError(props: ErrorInfo & { error: Error & { digest?: string } }) {
  const { error, reset, unstable_retry } = props;
  const errorWithDigest = error as Error & { digest?: string };

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const handleRetry = () => {
     if (unstable_retry) {
       unstable_retry();
     } else if (reset) {
       reset();
     } else {
        window.location.reload();
     }
  };

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
             <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
             <button
                onClick={handleRetry}
                className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
             >
                Try again
             </button>
        </div>
      </body>
    </html>
  );
}
