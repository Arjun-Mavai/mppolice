'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGuestResultStore } from '../store/guestResultStore';
import { QuizResult } from './QuizResult';

export function GuestResultClient({ userId }: { userId?: string }) {
  const router = useRouter();
  const { result, clearResult } = useGuestResultStore();
  
  // Get guest name from localStorage
  const guestName = typeof window !== 'undefined' ? localStorage.getItem('mppsc_guest_name') : null;

  useEffect(() => {
    if (!result) {
      router.replace('/');
    }
  }, [result, router]);

  if (!result) return null;

  const { answers } = result;

  // For guest results, we don't need full question data to reduce memory usage
  // Create minimal question objects for basic result display
  const mappedQuestions = Object.keys(answers).map((questionId, index) => ({
    id: questionId,
    question: `Question ${index + 1}`, // Simplified for guest view  
    questionEn: undefined,
    options: ['Option A', 'Option B', 'Option C', 'Option D'], // Generic options
    correctAnswer: 0, // Will be calculated properly by QuizResult
    explanation: undefined,
    explanationEn: undefined,
    marks: 1,
    negativeMarks: 0.33,
    type: 'standard' as const,
    matchPairs: undefined,
    subject: 'General',
  }));

  const mappedAnswers: Record<string, number> = {};
  Object.keys(answers).forEach((qId) => {
    // @ts-ignore
    mappedAnswers[qId] = answers[qId];
  });

  return (
    <QuizResult
      questions={mappedQuestions}
      answers={mappedAnswers}
      mode="full" // Treat as full test for now
      timeTaken={0} // Time tracking not fully implemented for guest yet
      onRetry={() => {
        clearResult();
        router.push('/syllabus/quiz');
      }}
      onExit={() => {
        clearResult();
        router.push('/');
      }}
      title={result.title || "Quiz Result"} // Use title from store
      testId={result.testId} // Pass testId from store
      isGuest={!userId}
      userId={userId}
      userName={guestName || undefined}  // Pass guest name from localStorage
      disableRetry={true}
      showFeedbackModal={true}  // 🔥 ENABLE FEEDBACK MODAL FOR GUESTS
    />
  );
}
