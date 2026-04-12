#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq, like, and, inArray, sql } from 'drizzle-orm';
import { 
  tests,
  questions as questionsTable
} from '@/db/schema';

// Use environment variables fallback to local
const turso = createClient({
  url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL || 'file:./mppolice_local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

const db = drizzle(turso);

async function investigatePartBasedTests() {
  console.log('🔍 Investigating Part-Based Tests for MP GK and Current Affairs\n');

  try {
    // Check MP GK part tests
    const mpgkTests = await db
      .select({
        testId: tests.id,
        title: tests.title,
        slug: tests.slug,
        questionCount: sql<number>`count(${questionsTable.id})`,
      })
      .from(tests)
      .leftJoin(questionsTable, eq(tests.id, questionsTable.testId))
      .where(and(
        eq(tests.type, 'PYQ'),
        like(tests.slug, 'pyq-mp-gk-part-%')
      ))
      .groupBy(tests.id, tests.title, tests.slug)
      .orderBy(tests.slug);

    console.log('📊 MP GK Part Tests:');
    console.log('===================');
    let mpgkTotal = 0;
    for (const test of mpgkTests) {
      console.log(`${test.slug}: ${test.questionCount} questions (${test.title})`);
      mpgkTotal += test.questionCount;
    }
    console.log(`MP GK Total: ${mpgkTotal} questions\n`);

    // Check Current Affairs part tests
    const currentAffairsTests = await db
      .select({
        testId: tests.id,
        title: tests.title,
        slug: tests.slug,
        questionCount: sql<number>`count(${questionsTable.id})`,
      })
      .from(tests)
      .leftJoin(questionsTable, eq(tests.id, questionsTable.testId))
      .where(and(
        eq(tests.type, 'PYQ'),
        like(tests.slug, 'pyq-current-affairs-part-%')
      ))
      .groupBy(tests.id, tests.title, tests.slug)
      .orderBy(tests.slug);

    console.log('📊 Current Affairs Part Tests:');
    console.log('=============================');
    let currentAffairsTotal = 0;
    for (const test of currentAffairsTests) {
      console.log(`${test.slug}: ${test.questionCount} questions (${test.title})`);
      currentAffairsTotal += test.questionCount;
    }
    console.log(`Current Affairs Total: ${currentAffairsTotal} questions\n`);

    // Check canonical test IDs for comparison
    const CANONICAL_TEST_IDS = [
      '5KRVTgTIw07bWNxu20YNl', // 2020
      'ix0FnJV496Rgvw0YHOEFj', // 2021
      'o_rO3J1tSEACKENOLT9QI', // 2022
      'mQ1a9hZoTdfSRfkz40K5C', // 2023
      '3XmZ0l700BJV3j2FLd0XZ', // 2024
      'D0gf6bklgl3RT-sTnue2n', // 2025
    ];

    const canonicalTests = await db
      .select({
        testId: tests.id,
        title: tests.title,
        slug: tests.slug,
        questionCount: sql<number>`count(${questionsTable.id})`,
      })
      .from(tests)
      .leftJoin(questionsTable, eq(tests.id, questionsTable.testId))
      .where(inArray(tests.id, CANONICAL_TEST_IDS))
      .groupBy(tests.id, tests.title, tests.slug)
      .orderBy(tests.slug);

    console.log('📊 Canonical Tests (6 years 2020-2025):');
    console.log('=======================================');
    let canonicalTotal = 0;
    for (const test of canonicalTests) {
      console.log(`${test.slug}: ${test.questionCount} questions (${test.title})`);
      canonicalTotal += test.questionCount;
    }
    console.log(`Canonical Total: ${canonicalTotal} questions\n`);

    console.log('💡 Analysis:');
    console.log('============');
    console.log(`Topic-wise MP GK: ${mpgkTotal} questions`);
    console.log(`Topic-wise Current Affairs: ${currentAffairsTotal} questions`);
    console.log(`Canonical approach total: ${canonicalTotal} questions`);
    console.log('');
    console.log('This explains the discrepancy! Topic-wise page uses part-based tests,');
    console.log('while Intelligence page uses canonical year-based tests.');

  } catch (error) {
    console.error('❌ Error investigating part tests:', error);
  }
}

investigatePartBasedTests().catch(console.error);