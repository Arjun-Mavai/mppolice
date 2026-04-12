'use server';

import { db } from '@/db';
import { questions, tests } from '@/db/schema';
import { and, eq, or } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { normalizeMppolicePyqSubject } from '@/features/tests/utils/pyq-subject';

// ------------------------------------------------------------------
// 📊 Aggregation Action
// Returns: { "History": 150, "Geography": 120, ... }
// ------------------------------------------------------------------
export const getSubjectWisePYQStats = unstable_cache(
  async () => {
    // Fetch all questions from PYQ tests
    // Joined fetch using Drizzle's query builder for efficiency
    // But since we need to normalize heavily, raw SQL or simple select + JS processing is easier
    // and safer for complex string matching.

    // Step 1: Get all PYQ Test IDs
    const pyqTests = await db
      .select({ id: tests.id, title: tests.title })
      .from(tests)
      .where(
        and(eq(tests.type, 'PYQ'), eq(tests.isHidden, false), eq(tests.examType, 'mppolice'))
      );

    if (pyqTests.length === 0) return {};

    const pyqTestIds = pyqTests.map((t) => t.id);

    // Step 2: Get all questions for these tests
    // Query chunks if too many, but for < 10k questions, one query is fine.
    const allQuestions = await db
      .select({
        id: questions.id,
        subject: questions.subject,
      })
      .from(questions)
      .where(or(...pyqTestIds.map((id) => eq(questions.testId, id))));

    // Step 3: Aggregate
    const stats: Record<string, number> = {};

    for (const q of allQuestions) {
      const canonical = normalizeMppolicePyqSubject(q.subject);
      stats[canonical] = (stats[canonical] || 0) + 1;
    }

    // Sort keys mostly for consistency if needed, but object keys are unordered technically
    // Only return categories with > 0 questions
    return stats;
  },
  ['subject-wise-pyq-stats-mppolice-v2'],
  { revalidate: 3600, tags: ['pyq-stats'] } // Revalidate every hour
);

// ------------------------------------------------------------------
// 🎮 Practice Mode Fetcher (CACHED)
// Returns: Question[] but with extra `year` field and `testTitle`
// ------------------------------------------------------------------
export interface MixedQuestion {
  id: string;
  questionText: string;
  questionTextEn: string | null;
  options: unknown;
  correctAnswer: string;
  explanation: string | null;
  explanationEn: string | null;
  marks: number;
  negativeMarks: number | null;
  idealTime: number | null;
  order: number;
  subject: string | null;
  type: 'standard' | 'matching' | null;
  matchPairs: unknown; // JSON
  // Extra fields for context
  testId: string;
  year: string;
  testTitle: string;
}

// Internal fetcher - does the heavy lifting
const fetchQuestionsBySubjectData = async (subject: string): Promise<MixedQuestion[]> => {
  // 1. Fetch all PYQ Tests to map TestID -> Year
  const pyqTests = await db
    .select({
      id: tests.id,
      title: tests.title,
      createdAt: tests.createdAt,
    })
    .from(tests)
    .where(
      and(eq(tests.type, 'PYQ'), eq(tests.isHidden, false), eq(tests.examType, 'mppolice'))
    );

  if (pyqTests.length === 0) return [];

  // Create a Map for quick lookup: TestID -> { Year, Title }
  const testMap = new Map<string, { year: string; title: string }>();
  pyqTests.forEach((t) => {
    const yearMatch = t.title.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : new Date(t.createdAt!).getFullYear().toString();
    testMap.set(t.id, { year, title: t.title });
  });

  // 2. Fetch ALL questions from these tests
  const allQuestions = await db
    .select()
    .from(questions)
    .where(or(...pyqTests.map((t) => eq(questions.testId, t.id))));

  // 3. Filter & Map in JS
  const filteredQuestions = allQuestions
    .filter((q) => normalizeMppolicePyqSubject(q.subject) === subject)
    .map((q) => {
      const testInfo = testMap.get(q.testId) || { year: 'Unknown', title: 'Unknown Test' };
      return {
        ...q,
        type: q.type ?? 'standard',
        year: testInfo.year,
        testTitle: testInfo.title,
      };
    });

  return filteredQuestions;
};

// Cached version - subject-specific, revalidates every hour
export const getCachedQuestionsBySubject = unstable_cache(
  fetchQuestionsBySubjectData,
  ['pyq-questions-by-subject-mppolice-v2'],
  { revalidate: 3600, tags: ['pyq-questions', 'tests'] }
);

export async function getQuestionsBySubject(subject: string): Promise<MixedQuestion[]> {
  const cachedQuestions = await getCachedQuestionsBySubject(subject);
  
  // Fisher-Yates Shuffle (done at runtime, not cached, for variety)
  const shuffled = [...cachedQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
