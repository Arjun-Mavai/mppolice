export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  explanationEn?: string | null;
  explanation_hi?: string | null; // Optional override handling if needed
  marks?: number;
  negativeMarks?: number;
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
