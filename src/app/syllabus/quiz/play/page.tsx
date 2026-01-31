"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuizInterface } from '@/components/quiz/QuizInterface';
import { mockFLTQuestions, mockTopicQuestions, Question } from '@/data/mockQuizData';

export default function QuizPlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') as 'topic' | 'full') || 'topic';
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
     // Shuffle function
     const shuffle = <T,>(array: T[]): T[] => {
         return [...array].sort(() => Math.random() - 0.5);
     };

     // Load and shuffle questions based on mode
     let rawQuestions: Question[] = [];
     if (mode === 'full') {
         rawQuestions = mockFLTQuestions;
     } else {
         rawQuestions = mockTopicQuestions;
     }

     // Shuffle questions AND their options
     const shuffled = shuffle(rawQuestions).map(q => {
         // Note: If we shuffle options, we must track the correct answer index change
         const originalOptions = q.options;
         const originalCorrect = q.options[q.correctAnswer];
         
         const shuffledOptions = shuffle(originalOptions);
         const newCorrectIndex = shuffledOptions.indexOf(originalCorrect);

         return {
             ...q,
             options: shuffledOptions,
             correctAnswer: newCorrectIndex
         };
     });

     setQuestions(shuffled);
     setLoading(false);
  }, [mode, retryCount]);

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
      );
  }

  return (
    <QuizInterface 
        key={retryCount}
        questions={questions}
        mode={mode}
        timeLimitInMinutes={mode === 'full' ? 60 : 10}
        onExit={() => router.push('/syllabus')}
        onRetry={() => {
            setLoading(true); // Show loading while shuffling
            setRetryCount(r => r + 1);
        }}
    />
  );
}
