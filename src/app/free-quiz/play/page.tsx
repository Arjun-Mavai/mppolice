import { redirect } from 'next/navigation';
import { getFreeQuizWithQuestions } from '../actions';
import { FreeQuizPlayClient } from './FreeQuizPlayClient';
import { Question } from '@/types/quiz';
import { SCORING_CONFIG } from '@/lib/quiz-scoring';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🆓 FREE QUIZ PLAY — GuestQuizInterface reuse karo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// No auth needed — seedha test start hoga
// GuestResultTeaser dikhega end me — lead capture ke liye
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface PageProps {
  searchParams: Promise<{ testId?: string }>;
}

export default async function FreeQuizPlayPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { testId } = params;

  // testId nahi h to listing pe wapas bhejo
  if (!testId) redirect('/free-quiz');

  // Test + questions fetch karo
  const testData = await getFreeQuizWithQuestions(testId);

  if (!testData || !testData.questions.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Test Not Found</h1>
          <p className="text-slate-500">
            Ye test available nahi h ya questions nahi hain.
          </p>
          <a href="/free-quiz" className="text-indigo-600 hover:underline">
            ← Back to Free Quizzes
          </a>
        </div>
      </div>
    );
  }

  // Questions ko Quiz format me map karo — safe parse with fallback
  const questions: Question[] = testData.questions
    .map((q) => {
      let parsedOptions: string[];
      try {
        parsedOptions =
          typeof q.options === 'string' ? JSON.parse(q.options) : (q.options as string[]);
      } catch {
        // Malformed JSON skip karo — page crash nahi honi chahiye
        return null;
      }

      return {
        id: q.id,
        question: q.questionText,
        questionEn: q.questionTextEn || undefined,
        correctAnswer: Number(q.correctAnswer),
        options: parsedOptions,
        explanation: q.explanation || undefined,
        explanationEn: q.explanationEn || undefined,
        subject: q.subject || undefined,
        type: (q.type as 'standard' | 'matching') || 'standard',
        matchPairs: (q.matchPairs as any) || undefined,
        negativeMarks: SCORING_CONFIG.NEGATIVE_MARKING,
        marks: SCORING_CONFIG.MARKS_PER_QUESTION,
      };
    })
    .filter(Boolean) as Question[];

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Invalid Questions</h1>
          <p className="text-slate-500">Questions load nahi ho paaye.</p>
          <a href="/free-quiz" className="text-indigo-600 hover:underline">
            ← Back to Free Quizzes
          </a>
        </div>
      </div>
    );
  }

  return (
    <FreeQuizPlayClient
      questions={questions}
      testId={testId}
      title={testData.title}
    />
  );
}
