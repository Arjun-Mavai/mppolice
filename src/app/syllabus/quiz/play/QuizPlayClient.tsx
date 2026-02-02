"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizInterface } from '@/components/quiz/QuizInterface';
import { Question } from '@/types/quiz';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SyllabusLockModal } from '@/components/SyllabusLockModal';

interface QuizPlayClientProps {
    questions: Question[];
    mode: 'topic' | 'full' | 'pyq';
    testId: string;
    userId: string | null;
    maxRetries?: number | null;
    userAttempts?: number;
    isPro?: boolean;
    shouldShowPaywall?: boolean;
}

export function QuizPlayClient({ 
    questions, 
    mode, 
    testId, 
    userId, 
    maxRetries = null, 
    userAttempts = 0, 
    isPro = false,
    shouldShowPaywall = false 
}: QuizPlayClientProps) {
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [paywallOpen, setPaywallOpen] = useState(shouldShowPaywall);

  // If premium content and user is not subscribed, show paywall modal
  if (shouldShowPaywall) {
      return (
          <>
              <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                  <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl text-center space-y-6">
                       <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Lock size={32} />
                       </div>
                       
                       <h2 className="text-2xl font-bold text-slate-900">
                           Premium Content
                       </h2>
                       
                       <p className="text-slate-600 leading-relaxed">
                           {mode === 'full' 
                               ? 'Full Length Tests are available for Premium members only. Upgrade to access complete mock tests with detailed analysis.'
                               : 'Previous Year Questions are available for Premium members only. Upgrade to practice with actual exam questions.'}
                       </p>

                       <div className="pt-4 space-y-3">
                           <Button 
                               onClick={() => setPaywallOpen(true)}
                               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-200"
                           >
                               Upgrade to Premium
                           </Button>
                           <Button variant="outline" onClick={() => router.push('/syllabus/quiz')} className="w-full h-12 rounded-xl">
                               Back to Tests
                           </Button>
                       </div>
                  </div>
              </div>
              <SyllabusLockModal open={paywallOpen} onOpenChange={setPaywallOpen} />
          </>
      );
  }

  // Retry Logic Check
  const effectiveAttempts = userAttempts + retryCount;
  const hasAttemptsLeft = maxRetries === null || effectiveAttempts < maxRetries;
  
  // Logic: 
  // Free User: 1 Attempt only (if maxRetries is set, assuming free limit is 1)
  // But the seed script sets maxRetries: 5 (Unit) or 2 (FLT).
  // User Requirement: "Retry quiz ka option only pro ke liye rakho".
  // Interpretation: 
  // - Free users: Can take it ONCE. After that, "result view" only.
  // - Pro users: Can take up to maxRetries.
  
  // Implementation:
  // If !isPro and userAttempts > 0 -> Block
  // If isPro and userAttempts >= maxRetries -> Block
  
  const isBlocked = !isPro && userAttempts > 0 
      ? true 
      : (maxRetries !== null && effectiveAttempts >= maxRetries);

  if (!questions || questions.length === 0) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4 pt-[80px]">
              <div className="text-xl font-bold text-slate-900">No questions found.</div>
              <p className="text-slate-500">Please try another unit or check back later.</p>
              <button onClick={() => router.back()} className="text-indigo-600 hover:underline">Go Back</button>
          </div>
      );
  }

  // Block Screen
  if (isBlocked) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl text-center space-y-6">
                   <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Lock size={32} />
                   </div>
                   
                   <h2 className="text-2xl font-bold text-slate-900">
                       {!isPro ? "Unlock Unlimited Practice" : "Maximum Attempts Reached"}
                   </h2>
                   
                   <p className="text-slate-600 leading-relaxed">
                       {!isPro 
                           ? "Free users can only attempt this quiz once. Upgrade to Pro to unlock regular retries and detailed analysis."
                           : `You have used all ${maxRetries} attempts for this test. Review your previous performance to improve.`
                       }
                   </p>

                   <div className="pt-4 space-y-3">
                       {!isPro && (
                           <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-200">
                               Upgrade to Pro
                           </Button>
                       )}
                       <Button variant="outline" onClick={() => router.push('/syllabus')} className="w-full h-12 rounded-xl">
                           Back to Syllabus
                       </Button>
                   </div>
              </div>
          </div>
      )
  }

  return (
    <QuizInterface 
        key={retryCount}
        questions={questions}
        mode={mode}
        testId={testId}
        userId={userId || 'guest'}
        timeLimitInMinutes={mode === 'full' ? 120 : 20} // 2 hours for FLT, 20 mins for Unit
        onExit={() => router.push('/syllabus')}
        onRetry={() => {
            // Optimistic update, server should re-validate
            setRetryCount(r => r + 1);
        }}
    />
  );
}
