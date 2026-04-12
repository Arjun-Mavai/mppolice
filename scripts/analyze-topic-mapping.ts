#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq, inArray, sql } from 'drizzle-orm';
import { 
  pyqQuestionTopics,
  pyqTopics,
  questions as questionsTable
} from '@/db/schema';
import { normalizeSubject } from '@/features/tests/utils/pyq-subject';

// Use environment variables for production database
const turso = createClient({
  url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL || 'file:./mppolice_local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

const db = drizzle(turso);

const CANONICAL_TEST_IDS: Record<number, string> = {
  2020: '5KRVTgTIw07bWNxu20YNl',
  2021: 'ix0FnJV496Rgvw0YHOEFj',
  2022: 'o_rO3J1tSEACKENOLT9QI',
  2023: 'mQ1a9hZoTdfSRfkz40K5C',
  2024: '3XmZ0l700BJV3j2FLd0XZ',
  2025: 'D0gf6bklgl3RT-sTnue2n',
};

async function analyzeTopicMapping() {
  console.log('🔍 Analyzing Topic Mapping for Data Inconsistencies\n');

  try {
    // Get actual topic titles and their normalizations
    const topicAnalysis = await db
      .select({
        topicId: pyqTopics.id,
        topicTitle: pyqTopics.title,
        questionCount: sql<number>`count(${pyqQuestionTopics.questionId})`,
      })
      .from(pyqTopics)
      .leftJoin(pyqQuestionTopics, eq(pyqTopics.id, pyqQuestionTopics.topicId))
      .leftJoin(questionsTable, eq(pyqQuestionTopics.questionId, questionsTable.id))
      .where(inArray(questionsTable.testId, Object.values(CANONICAL_TEST_IDS)))
      .groupBy(pyqTopics.id, pyqTopics.title)
      .orderBy(sql`count(${pyqQuestionTopics.questionId}) DESC`);

    console.log('📊 Topic Analysis (Original → Normalized):');
    console.log('==========================================');
    
    const subjectCounts = new Map<string, number>();
    
    for (const topic of topicAnalysis) {
      if (!topic.topicTitle || topic.questionCount === 0) continue;
      
      const normalized = normalizeSubject(topic.topicTitle);
      const count = topic.questionCount;
      
      console.log(`${topic.topicTitle} → ${normalized} (${count} questions)`);
      
      subjectCounts.set(normalized, (subjectCounts.get(normalized) || 0) + count);
    }

    console.log('\n📈 Aggregated Subject Counts:');
    console.log('=============================');
    
    for (const [subject, count] of Array.from(subjectCounts.entries()).sort((a, b) => b[1] - a[1])) {
      console.log(`${subject}: ${count} questions`);
    }
    
    console.log(`\nTotal: ${Array.from(subjectCounts.values()).reduce((a, b) => a + b, 0)} questions`);
    
    // Check specific problematic subjects
    console.log('\n🔍 Detailed Analysis for Problematic Subjects:');
    console.log('===============================================');
    
    const problemSubjects = ['Current Affairs', 'MP GK'];
    
    for (const subject of problemSubjects) {
      console.log(`\n${subject}:`);
      const matchingTopics = topicAnalysis.filter(t => 
        t.topicTitle && normalizeSubject(t.topicTitle) === subject && t.questionCount > 0
      );
      
      for (const topic of matchingTopics) {
        console.log(`  - "${topic.topicTitle}": ${topic.questionCount} questions`);
      }
      
      const total = matchingTopics.reduce((sum, t) => sum + t.questionCount, 0);
      console.log(`  Total: ${total} questions`);
    }

  } catch (error) {
    console.error('❌ Error analyzing topics:', error);
  }
}

analyzeTopicMapping().catch(console.error);