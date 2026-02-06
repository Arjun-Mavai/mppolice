import { useRouter } from 'next/navigation';
 import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();
    useEffect(() => {
        // Log to error tracking service
        logger.error('App Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Something went wrong!
                </h2>
                <p className="text-slate-600 mb-6 text-sm">
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
                <div className="space-y-3">
                    <button
                        onClick={reset}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() =>router.push("/")}
                        className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );
}
