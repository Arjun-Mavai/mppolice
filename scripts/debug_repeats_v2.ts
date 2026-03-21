
import 'dotenv/config';
import { db } from '../src/db';
import { tests, questions } from '../src/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getScopedStateServiceYear, PYQ_SCOPE_START_YEAR, PYQ_SCOPE_END_YEAR } from '../src/features/tests/utils/pyq-scope';

async function main() {
  console.log('--- Debugging Repeated Questions Logic ---');

  // 1. Fetch PYQ Tests
  const pyqTests = await db.select({
    id: tests.id,
    title: tests.title,
    type: tests.type,
    totalQuestions: tests.totalQuestions,
  }).from(tests).where(eq(tests.type, 'PYQ'));

  console.log(`Total PYQ Tests found: ${pyqTests.length}`);

  // 2. Check Scope Utility
  const testsByYear = new Map<number, typeof pyqTests>();
  const invalidTests = [];

  for (const t of pyqTests) {
    const year = getScopedStateServiceYear(t.title);
    if (year) {
      if (year >= PYQ_SCOPE_START_YEAR && year <= PYQ_SCOPE_END_YEAR) {
        if (!testsByYear.has(year)) testsByYear.set(year, []);
        testsByYear.get(year)!.push(t);
      } else {
        // Year out of range
      }
    } else {
      invalidTests.push(t.title);
    }
  }

  console.log('\nValid Tests by Year (Scoped):');
  [...testsByYear.entries()].sort((a,b) => a[0]-b[0]).forEach(([year, ts]) => {
     console.log(`${year}: ${ts.length} tests`);
     ts.forEach(t => console.log(`  - ${t.title} (${t.id})`));
  });

  console.log(`\nTests rejected by scope util: ${invalidTests.length}`);
  if (invalidTests.length > 0) {
      console.log('Sample rejected:', invalidTests.slice(0, 3));
  }

  // 3. Select Canonical Tests (Same logic as action)
  const selectedTestIds = new Set<string>();
    
  for (const [year, candidates] of testsByYear.entries()) {
      candidates.sort((a, b) => {
          const isHindiA = a.title.includes('MPPSC राज्य सेवा');
          const isHindiB = b.title.includes('MPPSC राज्य सेवा');
          if (isHindiA && !isHindiB) return -1;
          if (!isHindiA && isHindiB) return 1;
          return (b.totalQuestions || 0) - (a.totalQuestions || 0);
      });
      if (candidates.length > 0) {
          selectedTestIds.add(candidates[0].id);
      }
  }

  const canonicalIds = Array.from(selectedTestIds);
  console.log(`\nSelected Canonical IDs (${canonicalIds.length}):`, canonicalIds);

  if (canonicalIds.length < 2) {
      console.log('Not enough canonical tests to find repeats.');
      return;
  }

  // 4. Check Question Text Matching
  // Fetch questions from 2024 and 2025 canonical tests to test matching
  // (Assuming we have valid tests for these years)
  
  const allQs = await db.select({
      id: questions.id,
      text: questions.questionText,
      testId: questions.testId
  }).from(questions).where(inArray(questions.testId, canonicalIds));

  console.log(`Fetched ${allQs.length} questions from canonical tests.`);

  const normalize = (s: string) => s.toLowerCase().replace(/[^\w\u0900-\u097F]/g, '').slice(0, 300);

  const map = new Map<string, Set<string>>();
  allQs.forEach(q => {
      const key = normalize(q.text || '');
      if (key.length < 5) return;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(q.testId);
  });

  let repeats = 0;
  map.forEach((testSet, key) => {
      if (testSet.size > 1) {
          repeats++;
          if (repeats <= 5) {
             console.log(`Repeat: "${key.substring(0, 50)}..." in tests: ${Array.from(testSet).join(', ')}`);
          }
      }
  });

  console.log(`\nTotal Repeats found: ${repeats}`);
}

main().catch(console.error);
