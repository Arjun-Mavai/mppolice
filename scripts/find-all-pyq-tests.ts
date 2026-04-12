#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq, like, and, inArray, sql } from 'drizzle-orm';
import { 
  tests,
  questions as questionsTable
} from '@/db/schema';

const turso = createClient({
  url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL || 'file:./mppolice_local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

const db = drizzle(turso);

async function findActualPyqTests() {
  console.log('🔍 Finding ALL PYQ Tests in Database\n');

  try {
    // Find ALL PYQ tests
    const allPyqTests = await db
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
      .having(sql`count(${questionsTable.id}) > 0`)
      .orderBy(sql`count(${questionsTable.id}) DESC`);

    console.log('📊 ALL PYQ Tests with Questions:');
    console.log('===============================');
    let total = 0;
    const byPattern = new Map<string, number>();
    
    for (const test of allPyqTests) {
      console.log(`${test.slug}: ${test.questionCount} questions`);
      total += test.questionCount;
      
      // Extract pattern
      const parts = test.slug.split('-');
      if (parts.length >= 3) {
        const pattern = parts.slice(0, 3).join('-');
        byPattern.set(pattern, (byPattern.get(pattern) || 0) + test.questionCount);
      }
    }
    
    console.log(`\nTotal PYQ Questions: ${total}\n`);
    
    console.log('📈 Pattern Summary:');
    console.log('==================');
    for (const [pattern, count] of byPattern.entries()) {
      console.log(`${pattern}: ${count} questions`);
    }
    
    // Look specifically for subject-based tests
    console.log('\n🎯 MP GK Related Tests:');
    console.log('======================');
    const mpgkTests = allPyqTests.filter(t => 
      t.slug.includes('mp') || t.slug.includes('gk') || t.title.toLowerCase().includes('mp')
    );
    for (const test of mpgkTests) {
      console.log(`${test.slug}: ${test.questionCount} questions (${test.title})`);
    }
    
    console.log('\n🎯 Current Affairs Related Tests:');
    console.log('================================');
    const currentTests = allPyqTests.filter(t => 
      t.slug.includes('current') || t.slug.includes('affairs') || t.title.toLowerCase().includes('current')
    );
    for (const test of currentTests) {
      console.log(`${test.slug}: ${test.questionCount} questions (${test.title})`);
    }
    
  } catch (error) {
    console.error('❌ Error finding PYQ tests:', error);
  }
}

findActualPyqTests().catch(console.error);