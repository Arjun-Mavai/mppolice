'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';
import { PremiumExplanation } from '../PremiumExplanation';
import { StructuredExplanationBlock } from '@/components/mppolice/StructuredExplanation';
import { parseQuestionExtendedData } from '@/lib/mppolice/explanation-schema';
import { Question } from '@/types/quiz';

interface QuizExplanationProps {
  question: Question;
  language: string;
  translations: {
    explanation: string;
  };
}

export function QuizExplanation({ question, language, translations: t }: QuizExplanationProps) {
  const isHi = language === 'hi';
  const hasText = Boolean(question.explanation?.trim() || question.explanationEn?.trim());
  const hasStructured = Boolean(parseQuestionExtendedData(question.extendedData)?.explanation);
  const showEmpty = !hasText && !hasStructured;

  return (
    <div className="mt-2 rounded-xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-purple-50 p-2 shadow-sm sm:p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-slate-200/50 pb-2">
        <Lightbulb className="h-4 w-4 text-slate-700 sm:h-5 sm:w-5" />
        <span className="text-sm font-bold tracking-wide text-slate-900 uppercase sm:text-base">
          {t.explanation}
        </span>
      </div>

      <div className="text-sm leading-relaxed text-slate-700 sm:text-base">
        {showEmpty && (
          <p className="text-sm text-slate-500">
            {isHi ? 'कोई व्याख्या उपलब्ध नहीं।' : 'No explanation available.'}
          </p>
        )}
        {hasText && (
          <PremiumExplanation
            explanation={question.explanation || question.explanationEn || 'No explanation available.'}
            explanationEn={question.explanationEn}
            explanationHi={question.explanation_hi}
            language={language as 'hi' | 'en'}
          />
        )}
        <StructuredExplanationBlock
          extendedData={question.extendedData}
          explanation={null}
          explanationEn={null}
          isHi={isHi}
        />
      </div>
    </div>
  );
}
