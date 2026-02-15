export const SCORING_CONFIG = {
  MARKS_PER_QUESTION: 3,
  NEGATIVE_MARKING: 1, // 1 mark deduction
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
