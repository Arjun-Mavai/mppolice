"use client"

import React from 'react';
import { Lightbulb } from 'lucide-react';
import { PremiumExplanation } from '../PremiumExplanation';
import { Question } from '@/types/quiz';

interface QuizExplanationProps {
  question: Question;
  language: string;
  translations: {
    explanation: string;
  };
}

export function QuizExplanation({
  question,
  language,
  translations: t,
}: QuizExplanationProps) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-purple-50 border border-slate-200/50 rounded-xl p-4 sm:p-5 shadow-sm mt-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200/50">
        <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
        <span className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
          {t.explanation}
        </span>
      </div>

      <div className="text-sm sm:text-base text-slate-700 leading-relaxed">
        <PremiumExplanation
          explanation={(question as any).explanation_hi || question.explanation}
          explanationEn={question.explanationEn}
          language={language as 'hi' | 'en'}
        />
      </div>
    </div>
  );
}
