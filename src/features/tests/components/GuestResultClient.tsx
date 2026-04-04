'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGuestResultStore } from '../store/guestResultStore';
import { QuizResult } from './QuizResult';
import { Question } from '@/types/quiz';

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

  const { questions, answers } = result;

  // Map store questions to QuizResult Question type
  const mappedQuestions: Question[] = questions.map((q) => {
    let questionText = '';
    let questionEn: string | undefined = undefined;

    if (typeof q.question === 'string') {
      questionText = q.question;
    } else if (q.question && typeof q.question === 'object') {
      const qObj = q.question as { text?: string; textEn?: string };
      questionText = qObj.text || qObj.textEn || '';
      questionEn = qObj.textEn;
    }

    return {
      id: q.id,
      question: questionText,
      questionEn: questionEn,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      explanationEn: q.explanationEn,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      type: q.type || 'standard',
      matchPairs: q.matchPairs,
      subject: q.subject,
    };
  });

  const mappedAnswers: Record<string, number> = {};
  Object.keys(answers).forEach((qId) => {
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
