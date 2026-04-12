export type BilingualOption =
  | string
  | { text: string; textEn?: string; text_en?: string; image?: string; id?: string; [key: string]: unknown };

export interface Question {
  id: string;
  question: string;
  questionEn?: string | null;
  options: BilingualOption[];
  correctAnswer: number;
  explanation?: string;
  explanationEn?: string | null;
  explanation_hi?: string | null; // Optional override handling if needed
  marks?: number;
  negativeMarks?: number;
  type?: 'standard' | 'matching';
  subject?: string; // 🏷️ New field for mixed quizzes
  /** Parsed from extended_data for image MCQs */
  questionImageUrl?: string;
  extendedData?: unknown;
  matchPairs?: {
    id: string;
    label: string;
    labelEn?: string;
    match: string;
    matchId: string;
    matchEn?: string;
  }[];
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTaken: number;
  createdAt: Date;
}
