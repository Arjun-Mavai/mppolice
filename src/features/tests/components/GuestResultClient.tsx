'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGuestResultStore } from '../store/guestResultStore';
import { QuizResult } from './QuizResult';

export function GuestResultClient() {
  const router = useRouter();
  const { result, clearResult } = useGuestResultStore();

  useEffect(() => {
    if (!result) {
      router.replace('/');
    }
  }, [result, router]);

  if (!result) return null;

  const { questions, answers } = result;

  // Map store questions to QuizResult Question type
  // @ts-ignore
  const mappedQuestions = questions.map((q: any) => {
    let questionText = '';
    let questionEn = undefined;

    if (typeof q.question === 'string') {
      questionText = q.question;
    } else if (q.question && typeof q.question === 'object') {
      questionText = q.question.text || q.question.textEn || '';
      questionEn = q.question.textEn;
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
      title="Practice Quiz Result"
      isGuest={true}
      disableRetry={false}
    />
  );
}
