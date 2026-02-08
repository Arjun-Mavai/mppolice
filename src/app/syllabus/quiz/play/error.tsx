'use client';

import { useEffect } from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { logger } from "@/lib/logger";

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
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="p-4 bg-red-50 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Quiz Interrupted</h2>
            <p className="text-slate-600 mb-6 max-w-sm">
                We encountered an error while loading the quiz. Your previous progress should be safe.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={reset}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Resume/Retry
                </button>
                <a
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    <Home className="w-4 h-4" />
                    Dashboard
                </a>
            </div>
        </div>
    );
}
