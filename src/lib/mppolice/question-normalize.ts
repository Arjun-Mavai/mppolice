/** Normalize admin JSON row → DB row shape (single question) */
export function normalizeMppoliceQuestionInput(q: Record<string, unknown>): {
  questionText: string;
  questionTextEn: string | null;
  options: unknown;
  correctAnswer: string;
  explanation: string | null;
  explanationEn: string | null;
  marks: number;
  negativeMarks: number;
  idealTime: number | null;
  subject: string;
  type: 'standard' | 'matching';
  matchPairs: unknown;
  extendedData: unknown;
} {
  const questionType = q.questionType as string | undefined;
  let questionText = (q.questionText as string) || '';
  let questionTextEn = (q.questionTextEn as string) || null;

  let extOut: Record<string, unknown> | null = null;

  if (questionType === 'image' && q.question && typeof q.question === 'object') {
    const qq = q.question as { text?: string; image?: string };
    questionText = qq.text || questionText || '[Image question]';
    questionTextEn = (q.questionTextEn as string) || qq.text || null;
    const ext = (q.extendedData && typeof q.extendedData === 'object'
      ? (q.extendedData as Record<string, unknown>)
      : {}) as Record<string, unknown>;
    extOut = {
      ...ext,
      questionLayout: 'text_image',
      questionImageUrl: qq.image,
    };
    q.extendedData = extOut;
  }

  let options = q.options;
  if (options && typeof options === 'object' && !Array.isArray(options)) {
    options = Object.values(options as object);
  }

  const correctRaw = q.correctAnswer ?? q.correctOption;
  const correctAnswer =
    correctRaw !== undefined && correctRaw !== null ? String(correctRaw) : '';

  let extendedData: unknown = q.extendedData ?? null;
  if (extendedData && typeof extendedData === 'string') {
    try {
      extendedData = JSON.parse(extendedData);
    } catch {
      /* keep string */
    }
  }

  if (!extOut && extendedData && typeof extendedData === 'object') {
    extOut = extendedData as Record<string, unknown>;
  }

  return {
    questionText,
    questionTextEn,
    options: options as unknown,
    correctAnswer,
    explanation: (q.explanation as string) || null,
    explanationEn: (q.explanationEn as string) || null,
    marks: typeof q.marks === 'number' ? q.marks : 1,
    negativeMarks:
      typeof q.negativeMarks === 'number'
        ? q.negativeMarks
        : typeof (q as { marks?: { positive?: number; negative?: number } }).marks === 'object'
          ? (q as { marks: { negative?: number } }).marks?.negative ?? 0
          : 0,
    idealTime: typeof q.idealTime === 'number' ? q.idealTime : null,
    subject: typeof q.subject === 'string' ? q.subject : 'General',
    type: q.type === 'matching' ? 'matching' : 'standard',
    matchPairs: q.matchPairs ?? null,
    extendedData: extOut,
  };
}
