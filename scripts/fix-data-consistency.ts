#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, inArray, sql } from 'drizzle-orm';
import { 
  pyqTopicTrends,
  pyqQuestionTopics,
  pyqTopics,
  questions as questionsTable
} from '@/db/schema';
import { normalizeSubject } from '@/features/tests/utils/pyq-subject';

// Local database connection
const sqlite = new Database('./mppsc_local.db');
const db = drizzle(sqlite);

const CANONICAL_TEST_IDS: Record<number, string> = {
  2020: '5KRVTgTIw07bWNxu20YNl',
  2021: 'ix0FnJV496Rgvw0YHOEFj',
  2022: 'o_rO3J1tSEACKENOLT9QI',
  2023: 'mQ1a9hZoTdfSRfkz40K5C',
  2024: '3XmZ0l700BJV3j2FLd0XZ',
  2025: 'D0gf6bklgl3RT-sTnue2n',
};

const testIds = Object.values(CANONICAL_TEST_IDS);

async function fixDataConsistency() {
  console.log('🔄 Starting Data Consistency Fix...\n');

  // Step 1: Clear existing pyq_topic_trends
  console.log('🧹 Clearing existing topic trends...');
  db.delete(pyqTopicTrends).run();
  
  // Step 2: Get fresh question-topic mappings for canonical tests only
  console.log('📊 Fetching fresh question-topic data...');
  const questionTopicData = db
    .select({
      questionId: pyqQuestionTopics.questionId,
      topicId: pyqQuestionTopics.topicId,
      year: questionsTable.year,
      testId: questionsTable.testId,
      topicTitle: pyqTopics.title,
      topicUnit: pyqTopics.unit,
    })
    .from(pyqQuestionTopics)
    .leftJoin(questionsTable, eq(pyqQuestionTopics.questionId, questionsTable.id))
    .leftJoin(pyqTopics, eq(pyqQuestionTopics.topicId, pyqTopics.id))
    .where(inArray(questionsTable.testId, testIds))
    .all();

  console.log(`📋 Found ${questionTopicData.length} question-topic mappings`);

  // Step 3: Count by subject and year using proper normalization
  const subjectCounts = new Map<string, Map<number, number>>();
  
  for (const mapping of questionTopicData) {
    if (!mapping.year || !mapping.topicTitle) continue;
    
    const subject = normalizeSubject(mapping.topicTitle);
    const year = mapping.year;
    
    if (!subjectCounts.has(subject)) {
      subjectCounts.set(subject, new Map());
    }
    
    const yearCounts = subjectCounts.get(subject)!;
    yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
  }

  // Step 4: Insert into pyq_topic_trends
  console.log('💾 Inserting fresh trend data...');
  let totalInserted = 0;

  for (const [subject, yearCounts] of subjectCounts.entries()) {
    for (const [year, count] of yearCounts.entries()) {
      db.insert(pyqTopicTrends).values({
        id: `${subject.toLowerCase().replace(/\s+/g, '_')}_${year}`,
        subject: subject,
        year: year,
        questionCount: count,
        percentage: 0, // Will be computed later
        computedAt: new Date(),
      }).run();
      totalInserted++;
    }
  }

  console.log(`✅ Inserted ${totalInserted} trend records`);

  // Step 5: Update percentages
  console.log('🧮 Computing percentages...');
  for (const year of Object.keys(CANONICAL_TEST_IDS).map(Number)) {
    const totalQuestions = db
      .select({ count: sql<number>`count(*)` })
      .from(questionsTable)
      .where(eq(questionsTable.testId, CANONICAL_TEST_IDS[year]))
      .get();

    const total = totalQuestions?.count || 100;

    db
      .update(pyqTopicTrends)
      .set({ 
        percentage: sql`ROUND((question_count * 100.0 / ${total}), 2)`
      })
      .where(eq(pyqTopicTrends.year, year))
      .run();
  }

  console.log('✅ Data consistency fix complete!');
  
  // Verification
  console.log('\n🔍 Verification:');
  const totalTrends = db
    .select({ count: sql<number>`count(*)` })
    .from(pyqTopicTrends)
    .get();
  
  const subjectSummary = db
    .select({
      subject: pyqTopicTrends.subject,
      totalQuestions: sql<number>`sum(question_count)`,
      years: sql<number>`count(distinct year)`
    })
    .from(pyqTopicTrends)
    .groupBy(pyqTopicTrends.subject)
    .all();
  
  console.log(`📊 Total trend records: ${totalTrends?.count || 0}`);
  console.log(`📈 Subjects with data:`);
  for (const summary of subjectSummary) {
    console.log(`  ${summary.subject}: ${summary.totalQuestions} questions across ${summary.years} years`);
  }
  
  sqlite.close();
  process.exit(0);
}

fixDataConsistency().catch(console.error);