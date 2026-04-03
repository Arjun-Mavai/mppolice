/**
 * 🛡️ PRODUCTION ERROR BOUNDARY
 * 
 * Catches and handles specific production errors gracefully:
 * - Analytics failures (postEvent, gtag, fbq)
 * - API failures (requestFullscreen)
 * - Service Worker issues
 * 
 * Prevents app crashes from non-critical features.
 */

'use client';

import React from 'react';
import { logger } from '@/lib/logger';

interface ProductionErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ProductionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ProductionErrorBoundary extends React.Component<
  ProductionErrorBoundaryProps,
  ProductionErrorBoundaryState
> {
  constructor(props: ProductionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ProductionErrorBoundaryState {
    // Check if this is a non-critical error we can ignore
    const errorMessage = error.message?.toLowerCase() || '';
    const errorStack = error.stack?.toLowerCase() || '';
    
    const nonCriticalPatterns = [
      'postevent',
      'method not found',
      'requestfullscreen',
      'is not a function',
      'gtag is not defined',
      'fbq is not defined',
      'serviceworker',
      'analytics',
    ];
    
    const isNonCritical = nonCriticalPatterns.some(pattern => 
      errorMessage.includes(pattern) || errorStack.includes(pattern)
    );
    
    if (isNonCritical) {
      // Log the error but don't crash the app
      logger.warn('Non-critical error caught by boundary', { 
        category: 'error-boundary',
        metadata: { message: error.message, nonCritical: true, error: error.toString() }
      });
      return { hasError: false }; // Don't render fallback UI
    }
    
    // This is a critical error - show fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorMessage = error.message?.toLowerCase() || '';
    const nonCriticalPatterns = [
      'postevent',
      'method not found', 
      'requestfullscreen',
      'is not a function',
      'gtag is not defined',
      'fbq is not defined',
    ];
    
    const isNonCritical = nonCriticalPatterns.some(pattern => 
      errorMessage.includes(pattern)
    );
    
    if (isNonCritical) {
      // Just log non-critical errors, don't call onError
      logger.warn('Non-critical error boundary caught', {
        category: 'error-boundary',
        metadata: { 
          componentStack: errorInfo.componentStack,
          nonCritical: true,
          error: error.toString()
        }
      });
      return;
    }
    
    // Log critical errors
    logger.error('Critical error boundary caught', error, {
      category: 'error-boundary', 
      metadata: { componentStack: errorInfo.componentStack }
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI for critical errors only
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">
            We've encountered an unexpected error. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 🔧 Hook for handling non-critical errors in components
 */
export function useProductionErrorHandler() {
  const handleNonCriticalError = React.useCallback((error: unknown, context?: string) => {
    try {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.warn(`Non-critical error in ${context || 'component'}`, {
        category: 'production-error',
        metadata: { context, handled: true, error: errorObj.toString() }
      });
    } catch {
      // Even logging failed - just continue
    }
  }, []);

  return { handleNonCriticalError };
}