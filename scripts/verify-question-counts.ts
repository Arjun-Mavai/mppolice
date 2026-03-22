import { createClient } from '@libsql/client';

const dbUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl || !authToken) {
  throw new Error('Missing TURSO credentials: set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN');
}

const client = createClient({
  url: dbUrl,
  authToken,
});

const CANONICAL_TEST_IDS = {
  2020: '5KRVTgTIw07bWNxu20YNl',
  2021: 'ix0FnJV496Rgvw0YHOEFj',
  2022: 'o_rO3J1tSEACKENOLT9QI',
  2023: 'mQ1a9hZoTdfSRfkz40K5C',
  2024: '3XmZ0l700BJV3j2FLd0XZ',
  2025: 'D0gf6bklgl3RT-sTnue2n',
};

async function verifyQuestionCounts() {
  console.log('🔍 Verifying Question Counts: Topic Analysis vs Intelligence Page');
  console.log('================================================================\n');

  try {
    // Method 1: Get from topic analysis (pyq_topic_trends)
    console.log('📊 Topic Analysis Data (from pyq_topic_trends):');
    const topicTrendsResult = await client.execute(`
      SELECT 
        subject,
        SUM(question_count) as total_questions
      FROM pyq_topic_trends 
      WHERE year IN (2020, 2021, 2022, 2023, 2024, 2025)
      GROUP BY subject
      ORDER BY total_questions DESC
    `);
    
    const topicCounts: Record<string, number> = {};
    let topicTotal = 0;
    
    topicTrendsResult.rows.forEach(row => {
      const subject = row.subject as string;
      const questionCount = row.total_questions as number;
      topicCounts[subject] = questionCount;
      topicTotal += questionCount;
      console.log(`  ${subject}: ${questionCount} questions`);
    });
    
    console.log(`  Total: ${topicTotal} questions\n`);

    // Method 2: Get from raw questions (intelligence page approach)
    console.log('🧠 Intelligence Page Data (from raw questions):');
    const testIds = Object.values(CANONICAL_TEST_IDS);
    
    const rawQuestionsResult = await client.execute({
      sql: `
        SELECT 
          COUNT(*) as total_questions
        FROM questions q
        WHERE q.test_id IN (${testIds.map(() => '?').join(',')})
          AND q.deleted_at IS NULL
      `,
      args: testIds
    });
    
    const rawTotal = (rawQuestionsResult.rows[0] as unknown as { total_questions: number }).total_questions;
    console.log(`  Total Raw Questions: ${rawTotal} questions\n`);

    // Method 3: Check by subject from question topics
    console.log('🏷️ Subject Distribution (from pyq_question_topics):');
    const subjectDistResult = await client.execute({
      sql: `
        SELECT 
          pt.subject,
          COUNT(DISTINCT pqt.question_id) as unique_questions
        FROM pyq_question_topics pqt
        JOIN pyq_topics pt ON pqt.topic_id = pt.id  
        JOIN questions q ON pqt.question_id = q.id
        WHERE q.test_id IN (${testIds.map(() => '?').join(',')})
          AND q.deleted_at IS NULL
          AND pqt.is_primary = 1
        GROUP BY pt.subject
        ORDER BY unique_questions DESC
      `,
      args: testIds
    });

    const subjectCounts: Record<string, number> = {};
    let subjectTotal = 0;
    
    subjectDistResult.rows.forEach(row => {
      const subject = row.subject as string;
      const uniqueQs = row.unique_questions as number;
      subjectCounts[subject] = uniqueQs;
      subjectTotal += uniqueQs;
      console.log(`  ${subject}: ${uniqueQs} questions`);
    });
    
    console.log(`  Total: ${subjectTotal} questions\n`);

    // Comparison
    console.log('⚖️  COMPARISON:');
    console.log(`  Raw Questions (Intelligence): ${rawTotal}`);
    console.log(`  Topic Trends (Analysis): ${topicTotal}`);
    console.log(`  Subject Distribution: ${subjectTotal}\n`);

    // Check differences
    if (topicTotal !== subjectTotal) {
      console.log('⚠️  DISCREPANCY FOUND!');
      console.log('  Topic Analysis vs Subject Distribution mismatch\n');
      
      // Show detailed comparison
      console.log('📋 Detailed Comparison:');
      const allSubjects = new Set([...Object.keys(topicCounts), ...Object.keys(subjectCounts)]);
      
      for (const subject of allSubjects) {
        const topicCount = topicCounts[subject] || 0;
        const subjectCount = subjectCounts[subject] || 0;
        const diff = Math.abs(topicCount - subjectCount);
        
        if (diff > 0) {
          console.log(`  ⚠️  ${subject}: Topic(${topicCount}) vs Subject(${subjectCount}) = diff ${diff}`);
        } else {
          console.log(`  ✅ ${subject}: ${topicCount} (matched)`);
        }
      }
    } else {
      console.log('✅ Numbers are consistent!');
    }

    // Show unmapped questions
    const unmappedResult = await client.execute({
      sql: `
        SELECT COUNT(*) as unmapped_count
        FROM questions q
        LEFT JOIN pyq_question_topics pqt ON q.id = pqt.question_id
        WHERE q.test_id IN (${testIds.map(() => '?').join(',')})
          AND q.deleted_at IS NULL
          AND pqt.question_id IS NULL
      `,
      args: testIds
    });

    const unmappedCount = (unmappedResult.rows[0] as unknown as { unmapped_count: number }).unmapped_count;
    console.log(`\n🔍 Unmapped Questions: ${unmappedCount}`);
    
    if (unmappedCount > 0) {
      console.log('⚠️  Some questions are not mapped to topics!');
    }

    return {
      rawTotal,
      topicTotal,
      subjectTotal,
      unmappedCount,
      isConsistent: topicTotal === subjectTotal && unmappedCount === 0
    };

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    client.close();
  }
}

verifyQuestionCounts().catch(console.error);
