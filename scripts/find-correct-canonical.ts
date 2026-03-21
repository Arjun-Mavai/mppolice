#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq, like, and, inArray, sql } from 'drizzle-orm';
import { 
  tests,
  questions as questionsTable
} from '@/db/schema';

const turso = createClient({
  url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL || 'file:./mppsc_local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

const db = drizzle(turso);

async function findCorrectCanonicalMapping() {
  console.log('🔍 Finding Correct Canonical Test Mapping\n');

  try {
    // Old canonical IDs that user mentioned
    const OLD_CANONICAL_TEST_IDS = {
      2020: '5KRVTgTIw07bWNxu20YNl',
      2021: 'ix0FnJV496Rgvw0YHOEFj', 
      2022: 'o_rO3J1tSEACKENOLT9QI',
      2023: 'mQ1a9hZoTdfSRfkz40K5C',
      2024: '3XmZ0l700BJV3j2FLd0XZ',
      2025: 'D0gf6bklgl3RT-sTnue2n',
    };

    console.log('❌ Old Canonical Test IDs Check:');
    console.log('===============================');
    for (const [year, id] of Object.entries(OLD_CANONICAL_TEST_IDS)) {
      const test = await db
        .select({
          id: tests.id,
          title: tests.title,
          slug: tests.slug,
          questionCount: sql<number>`count(${questionsTable.id})`,
        })
        .from(tests)
        .leftJoin(questionsTable, eq(tests.id, questionsTable.testId))
        .where(eq(tests.id, id))
        .groupBy(tests.id, tests.title, tests.slug);
      
      if (test.length > 0) {
        console.log(`${year}: ✅ ${test[0].slug} (${test[0].questionCount} questions)`);
      } else {
        console.log(`${year}: ❌ ${id} NOT FOUND`);
      }
    }

    // Find actual year-based tests
    console.log('\n✅ Actual Year-based Tests:');
    console.log('===========================');
    const yearTests = new Map<number, string>();
    
    const allTests = await db
      .select({
        testId: tests.id,
        title: tests.title,
        slug: tests.slug,
        questionCount: sql<number>`count(${questionsTable.id})`,
      })
      .from(tests)
      .leftJoin(questionsTable, eq(tests.id, questionsTable.testId))
      .where(eq(tests.type, 'PYQ'))
      .groupBy(tests.id, tests.title, tests.slug)
      .having(sql`count(${questionsTable.id}) = 100`) // Only full tests
      .orderBy(tests.slug);

    for (const test of allTests) {
      // Extract year from slug or title
      let year = null;
      const yearMatch = test.title.match(/20(2[0-5])/);
      if (yearMatch) {
        year = parseInt(yearMatch[1]);
      }
      
      if (year && year >= 2020 && year <= 2025) {
        if (!yearTests.has(year)) {
          yearTests.set(year, test.testId);
          console.log(`${year}: ${test.testId} (${test.slug}) - ${test.questionCount} questions`);
        }
      }
    }

    // Generate new canonical mapping
    console.log('\n🎯 NEW CANONICAL TEST MAPPING:');
    console.log('==============================');
    console.log('const CANONICAL_TEST_IDS = {');
    for (const [year, testId] of Array.from(yearTests.entries()).sort()) {
      console.log(`  ${year}: '${testId}',`);
    }
    console.log('};');

    const totalQuestions = Array.from(yearTests.values()).length * 100;
    console.log(`\nExpected Total: ${totalQuestions} questions (${Array.from(yearTests.values()).length} tests × 100 questions)`);

  } catch (error) {
    console.error('❌ Error finding canonical mapping:', error);
  }
}

findCorrectCanonicalMapping().catch(console.error);