
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { tests, questions } from '../src/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getScopedStateServiceYear, PYQ_SCOPE_START_YEAR, PYQ_SCOPE_END_YEAR } from '../src/features/tests/utils/pyq-scope';

const client = createClient({ url: 'file:mppsc_local.db' });
const db = drizzle(client);

async function verifyScope() {
  console.log('Verifying Scope (2020-2025)...');
  
  // 1. Fetch PYQ Tests
  const allTests = await db.select({
      id: tests.id,
      title: tests.title,
      type: tests.type,
      totalQuestions: tests.totalQuestions,
    }).from(tests).where(eq(tests.type, 'PYQ'));

  const testsByYear = new Map();

  for (const t of allTests) {
      const year = getScopedStateServiceYear(t.title);
      if (year && year >= PYQ_SCOPE_START_YEAR && year <= PYQ_SCOPE_END_YEAR) {
        if (!testsByYear.has(year)) testsByYear.set(year, []);
        testsByYear.get(year).push(t);
      }
  }

  console.log('\nCanonical Tests Selected (Strict 6-Year Scope):');
  const selectedTestIds = [];
  
  const sortedYears = Array.from(testsByYear.keys()).sort((a: any,b: any) => b-a);
  
  for (const year of sortedYears) {
      const candidates = testsByYear.get(year);
      // Same logic as main code
      candidates.sort((a: any, b: any) => {
            const isHindiA = a.title.includes('MPPSC राज्य सेवा');
            const isHindiB = b.title.includes('MPPSC राज्य सेवा');
            if (isHindiA && !isHindiB) return -1;
            if (!isHindiA && isHindiB) return 1;
            return (b.totalQuestions || 0) - (a.totalQuestions || 0);
      });
      
      const best = candidates[0];
      selectedTestIds.push(best.id);
      console.log(`${year}: ${best.title} (${best.totalQuestions} qs)`);
  }

  // 2. Count Questions
  if (selectedTestIds.length > 0) {
      const relevantQuestions = await db.select({ id: questions.id })
        .from(questions)
        .where(inArray(questions.testId, selectedTestIds));

      console.log(`\nTotal Questions in Analysis Scope: ${relevantQuestions.length}`);
      console.log('(These are the ONLY questions compared against the FTS index)');
  } else {
      console.log('No relevant tests found in scope.');
  }
}

verifyScope().then(() => process.exit(0));
