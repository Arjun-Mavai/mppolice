'use server';

import { db } from '@/db';
import { questions, tests } from '@/db/schema';
import { and, eq, like, or } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { logger } from '@/lib/logger';

// ------------------------------------------------------------------
// 🏷️ Subject Normalization Logic
// Matches 300+ variations in DB to 8-10 Canonical Categories
// ------------------------------------------------------------------
function normalizeSubject(rawSubject: string | null): string {
  if (!rawSubject) return 'Misc';
  const lower = rawSubject.toLowerCase().trim();

  // 1. MP GK (Most critical for MPPSC)
  if (
    lower.includes('mp ') ||
    lower.includes('madhya pradesh') ||
    lower.includes('unit 1') ||
    lower.includes('unit 3') ||
    lower.includes('unit 5') ||
    lower.includes('tribes') ||
    lower.includes('folk') ||
    lower.includes('tourism') ||
    lower.includes('dynasties')
  ) {
    return 'MP GK';
  }

  // 2. History
  if (
    lower.includes('history') ||
    lower.includes('freedom') ||
    lower.includes('ancient') ||
    lower.includes('medieval') ||
    lower.includes('modern') ||
    lower.includes('unit 2') ||
    lower.includes('culture') ||
    lower.includes('archaeology')
  ) {
    return 'History';
  }

  // 3. Geography
  if (
    lower.includes('geography') ||
    lower.includes('climate') ||
    lower.includes('monsoon') ||
    lower.includes('resource') ||
    lower.includes('agriculture') ||
    lower.includes('unit 4') ||
    lower.includes('disaster') ||
    lower.includes('environment')
  ) {
    return 'Geography';
  }

  // 4. Polity & Commission
  if (
    lower.includes('polity') ||
    lower.includes('constitution') ||
    lower.includes('commission') ||
    lower.includes('act') ||
    lower.includes('governance') ||
    lower.includes('panchat') ||
    lower.includes('unit 10') ||
    lower.includes('unit 6') // Part of Unit 6 is Polity
  ) {
    return 'Polity';
  }

  // 5. Economy
  if (
    lower.includes('economy') ||
    lower.includes('economic') ||
    lower.includes('budget') ||
    lower.includes('financial') ||
    lower.includes('trade') ||
    lower.includes('bank') ||
    lower.includes('sebi') ||
    lower.includes('rbi')
  ) {
    return 'Economy';
  }

  // 6. Science
  if (
    lower.includes('science') ||
    lower.includes('bio') ||
    lower.includes('physics') ||
    lower.includes('chem') ||
    lower.includes('nutrition') ||
    lower.includes('health') ||
    lower.includes('disease') ||
    lower.includes('unit 7')
  ) {
    return 'Science';
  }

  // 7. ICT & Computer
  if (
    lower.includes('computer') ||
    lower.includes('ict') ||
    lower.includes('internet') ||
    lower.includes('cyber') ||
    lower.includes('robotics') ||
    lower.includes('ai') ||
    lower.includes('electronics') ||
    lower.includes('unit 9')
  ) {
    return 'ICT';
  }

  // 8. Current Affairs & Sports
  if (
    lower.includes('current') ||
    lower.includes('sports') ||
    lower.includes('award') ||
    lower.includes('unit 8') ||
    lower.includes('defence') ||
    lower.includes('summit')
  ) {
    return 'Current Affairs';
  }

  // Fallback
  logger.warn(`normalizeSubject: Unmatched subject category for '${rawSubject}'`, {
    rawSubject,
    category: 'system',
  });
  return 'Misc';
}

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
      .where(and(eq(tests.type, 'PYQ'), eq(tests.isHidden, false)));

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
      const canonical = normalizeSubject(q.subject);
      stats[canonical] = (stats[canonical] || 0) + 1;
    }

    // Sort keys mostly for consistency if needed, but object keys are unordered technically
    // Only return categories with > 0 questions
    return stats;
  },
  ['subject-wise-pyq-stats'],
  { revalidate: 3600, tags: ['pyq-stats'] } // Revalidate every hour
);

// ------------------------------------------------------------------
// 🎮 Practice Mode Fetcher
// Returns: Question[] but with extra `year` field and `testTitle`
// ------------------------------------------------------------------
export interface MixedQuestion {
  id: string;
  questionText: string;
  questionTextEn: string | null;
  options: any;
  correctAnswer: string;
  explanation: string | null;
  explanationEn: string | null;
  marks: number;
  negativeMarks: number | null;
  idealTime: number | null;
  order: number;
  subject: string | null;
  type: 'standard' | 'matching' | null;
  matchPairs: any; // JSON
  // Extra fields for context
  testId: string;
  year: string;
  testTitle: string;
}

export async function getQuestionsBySubject(subject: string): Promise<MixedQuestion[]> {
  // 1. Fetch all PYQ Tests again to map TestID -> Year
  const pyqTests = await db
    .select({
      id: tests.id,
      title: tests.title,
      createdAt: tests.createdAt,
    })
    .from(tests)
    .where(and(eq(tests.type, 'PYQ'), eq(tests.isHidden, false)));

  if (pyqTests.length === 0) return [];

  // Create a Map for quick lookup: TestID -> { Year, Title }
  const testMap = new Map<string, { year: string; title: string }>();
  pyqTests.forEach((t) => {
    const yearMatch = t.title.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : new Date(t.createdAt!).getFullYear().toString();
    testMap.set(t.id, { year, title: t.title });
  });

  // 2. Fetch ALL questions from these tests
  // NOTE: Fetching ALL questions (rows) and filtering in memory is inefficient for large datasets.
  // Ideally, we should have a `canonical_subject` column in the database to allow SQL-level filtering.
  // However, given the current complexity of `normalizeSubject` (300+ rules), reproducing this logic in SQL is risky.
  // For the current scale (<10k questions), in-memory filtering is acceptable but should be monitored.
  const allQuestions = await db
    .select()
    .from(questions)
    .where(or(...pyqTests.map((t) => eq(questions.testId, t.id))));

  // 3. Filter & Map in JS
  const filterederQuestions = allQuestions
    .filter((q) => normalizeSubject(q.subject) === subject)
    .map((q) => {
      const testInfo = testMap.get(q.testId) || { year: 'Unknown', title: 'Unknown Test' };
      return {
        ...q,
        type: q.type ?? 'standard', // Ensure default matches strict type
        year: testInfo.year,
        testTitle: testInfo.title,
      };
    });

  // Fisher-Yates Shuffle
  const shuffled = [...filterederQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
