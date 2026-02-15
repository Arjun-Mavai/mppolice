'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 max-w-md rounded-lg bg-red-50 p-4 text-red-900">
        <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
        <p className="mb-2 text-sm opacity-80">We've noted this error and will fix it.</p>
        <pre className="max-h-32 overflow-auto rounded bg-red-100 p-2 text-left text-xs">
          {(error as any)?.message || 'Unknown error'}
        </pre>
      </div>
      <Button onClick={resetErrorBoundary} variant="outline">
        Try again
      </Button>
    </div>
  );
};

export const GlobalErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const handleError = (error: any, info: React.ErrorInfo) => {
    logger.error('Client-side UI error caught by boundary', error, {
      category: 'ui',
      metadata: {
        componentStack: info.componentStack,
      },
    });
  };

  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  );
};
