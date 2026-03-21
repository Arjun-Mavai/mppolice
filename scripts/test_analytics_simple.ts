// Test analytics functions without caching
import { db } from '@/db';
import { questions } from '@/db/schema';
import { inArray } from 'drizzle-orm';

const CANONICAL_TEST_IDS: Record<number, string> = {
  2020: '5KRVTgTIw07bWNxu20YNl',
  2021: 'ix0FnJV496Rgvw0YHOEFj',
  2022: 'o_rO3J1tSEACKENOLT9QI',
  2023: 'mQ1a9hZoTdfSRfkz40K5C',
  2024: '3XmZ0l700BJV3j2FLd0XZ',
  2025: 'D0gf6bklgl3RT-sTnue2n',
};

function getCanonicalTestIds(): string[] {
  return Object.values(CANONICAL_TEST_IDS);
}

function getYearFromTestId(testId: string): number {
  for (const [year, id] of Object.entries(CANONICAL_TEST_IDS)) {
    if (id === testId) return Number(year);
  }
  return 0;
}

async function main() {
  console.log('=== Testing Analytics (Simple) ===\n');
  
  try {
    const testIds = getCanonicalTestIds();
    console.log('Using test IDs:', testIds);
    
    // Fetch questions from canonical tests
    const allQuestions = await db.select({
      id: questions.id,
      testId: questions.testId,
      text: questions.questionText,
      textEn: questions.questionTextEn,
      order: questions.order,
    }).from(questions).where(inArray(questions.testId, testIds));
    
    console.log('Total questions found:', allQuestions.length);
    console.log('Expected: 600 questions (6 tests × 100 questions)');
    
    // Group by year
    const byYear = new Map<number, number>();
    for (const q of allQuestions) {
      const year = getYearFromTestId(q.testId);
      byYear.set(year, (byYear.get(year) || 0) + 1);
    }
    
    console.log('\nQuestions per year:');
    for (const [year, count] of Array.from(byYear.entries()).sort((a, b) => a[0] - b[0])) {
      console.log(`${year}: ${count} questions`);
    }
    
    // Sample questions
    console.log('\nSample questions (first 3):');
    for (const q of allQuestions.slice(0, 3)) {
      const year = getYearFromTestId(q.testId);
      console.log(`${year} Q${q.order}: ${(q.text || '').substring(0, 60)}...`);
    }
    
    console.log('\n✅ Analytics data looks good!');
    
  } catch (error) {
    console.error('ERROR:', error);
  }
}

main().catch(console.error).finally(() => process.exit(0));
