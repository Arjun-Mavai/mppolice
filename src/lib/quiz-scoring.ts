import { QUIZ_CONSTANTS } from '@/config/quiz';

export const SCORING_CONFIG = {
  MARKS_PER_QUESTION: QUIZ_CONSTANTS.MARKS_PER_QUESTION,
  NEGATIVE_MARKING: QUIZ_CONSTANTS.NEGATIVE_MARKING,
} as const;

export function calculateScore(
  totalQuestions: number,
  correctCount: number,
  wrongCount: number
): { totalScore: number; maxMarks: number; percentage: number } {
  const totalScore =
    correctCount * SCORING_CONFIG.MARKS_PER_QUESTION - wrongCount * SCORING_CONFIG.NEGATIVE_MARKING;
  const maxMarks = totalQuestions * SCORING_CONFIG.MARKS_PER_QUESTION;

  // Ensure score doesn't go below 0 if that's the rule, but standard exams allow negative.
  // User requested "proper marks distribution".
  // Usually we show negative if user got negative.
  // But let's keep exact value.

  const percentage = maxMarks > 0 ? Math.round((totalScore / maxMarks) * 100) : 0;

  return {
    totalScore: parseFloat(totalScore.toFixed(2)),
    maxMarks,
    percentage,
  };
}
