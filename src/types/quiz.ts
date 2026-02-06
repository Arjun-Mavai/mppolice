export interface Question {
  id: string;
  question: string;
  questionEn?: string | null;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  explanationEn?: string | null;
  explanation_hi?: string | null; // Optional override handling if needed
  marks?: number;
  negativeMarks?: number;
  type?: 'standard' | 'matching';
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
