// Script to verify canonical tests in PROD database
import { db } from '@/db';
import { tests, questions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getScopedStateServiceYear, PYQ_SCOPE_START_YEAR, PYQ_SCOPE_END_YEAR } from '@/features/tests/utils/pyq-scope';

async function main() {
  console.log('=== Verifying PROD Database ===\n');
  
  // 1. Fetch ALL PYQ tests
  const allPyqTests = await db.select({
    id: tests.id,
    title: tests.title,
    totalQuestions: tests.totalQuestions,
  }).from(tests).where(eq(tests.type, 'PYQ'));
  
  console.log('Total PYQ tests in DB:', allPyqTests.length);
  
  // 2. Filter by scope pattern
  const scopedTests: { id: string; title: string; year: number; totalQuestions: number | null }[] = [];
  
  for (const t of allPyqTests) {
    const year = getScopedStateServiceYear(t.title);
    if (year && year >= PYQ_SCOPE_START_YEAR && year <= PYQ_SCOPE_END_YEAR) {
      scopedTests.push({ ...t, year });
    }
  }
  
  console.log('Tests matching scope pattern:', scopedTests.length);
  console.log('\n--- Matched Tests ---');
  for (const t of scopedTests.sort((a, b) => a.year - b.year)) {
    console.log(t.year + ': ' + t.id + ' | ' + t.title + ' | ' + t.totalQuestions + ' Qs');
  }
  
  // 3. Select canonical test per year (prefer Hindi, then highest question count)
  const testsByYear = new Map<number, typeof scopedTests>();
  for (const t of scopedTests) {
    if (!testsByYear.has(t.year)) testsByYear.set(t.year, []);
    testsByYear.get(t.year)!.push(t);
  }
  
  console.log('\n--- Canonical Tests (1 per year) ---');
  const canonicalTests: { id: string; year: number; title: string }[] = [];
  
  for (const [year, candidates] of Array.from(testsByYear.entries())) {
    // Sort: Hindi first, then by question count
    candidates.sort((a, b) => {
      const isHindiA = a.title.includes('MPPSC राज्य सेवा');
      const isHindiB = b.title.includes('MPPSC राज्य सेवा');
      if (isHindiA && !isHindiB) return -1;
      if (!isHindiA && isHindiB) return 1;
      return (b.totalQuestions || 0) - (a.totalQuestions || 0);
    });
    
    const canonical = candidates[0];
    canonicalTests.push({ id: canonical.id, year, title: canonical.title });
    console.log(year + ': ' + canonical.id);
  }
  
  // 4. Verify question orders for each canonical test
  console.log('\n--- Verifying Question Orders ---');
  for (const ct of canonicalTests.sort((a, b) => a.year - b.year)) {
    const qs = await db.select({
      id: questions.id,
      order: questions.order,
      text: questions.questionText,
    }).from(questions).where(eq(questions.testId, ct.id));
    
    const orders = qs.map(q => q.order).sort((a, b) => a - b);
    const min = Math.min(...orders);
    const max = Math.max(...orders);
    const count = qs.length;
    
    console.log(ct.year + ': ' + count + ' questions, orders ' + min + '-' + max);
    
    // Show first 3 questions as sample
    const sample = qs.sort((a, b) => a.order - b.order).slice(0, 3);
    for (const q of sample) {
      console.log('  Q' + q.order + ': ' + (q.text || '').substring(0, 60) + '...');
    }
  }
  
  // 5. Output canonical test IDs for use in code
  console.log('\n--- CANONICAL TEST IDS (copy to code) ---');
  console.log('const CANONICAL_TEST_IDS = {');
  for (const ct of canonicalTests.sort((a, b) => a.year - b.year)) {
    console.log('  ' + ct.year + ': "' + ct.id + '",');
  }
  console.log('};');
}

main().catch(console.error).finally(() => process.exit(0));
