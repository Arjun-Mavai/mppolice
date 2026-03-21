import { createClient } from '@libsql/client';

// Production Turso connection
const client = createClient({
  url: 'libsql://mppsc-test-series-arjun-gurjar.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njk5MTg1MjAsImlkIjoiNmZjZWY3MGEtNDZmYi00OWY5LWE4ZGQtYTMxNDk3MWFjOTlhIiwicmlkIjoiMjVkYTUxNjUtNWM1Yi00Mjc1LWEyNTYtZjlhNDhiNjQyZjA4In0.Uat6fTihImcWMjdZHXe2lmhq2tEfI7hj7TApkWgXdhLIVHnhCXB1yB56kuDpwi51m6f9LHbytvWkNlXHb1znCA'
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
    
    const topicCounts = {};
    let topicTotal = 0;
    
    topicTrendsResult.rows.forEach(row => {
      topicCounts[row.subject] = row.total_questions;
      topicTotal += row.total_questions;
      console.log(`  ${row.subject}: ${row.total_questions} questions`);
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
    
    const rawTotal = rawQuestionsResult.rows[0].total_questions;
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

    const subjectCounts = {};
    let subjectTotal = 0;
    
    subjectDistResult.rows.forEach(row => {
      subjectCounts[row.subject] = row.unique_questions;
      subjectTotal += row.unique_questions;
      console.log(`  ${row.subject}: ${row.unique_questions} questions`);
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

    const unmappedCount = unmappedResult.rows[0].unmapped_count;
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

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.close();
  }
}

verifyQuestionCounts().catch(console.error);