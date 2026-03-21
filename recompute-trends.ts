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

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

async function recomputePyqTrends() {
  console.log('🔄 Recomputing PYQ topic trends...');
  
  try {
    const years = [2020, 2021, 2022, 2023, 2024, 2025];
    
    // Clear existing trends for these years
    console.log('🗑️ Clearing existing trend data...');
    await client.execute({
      sql: `DELETE FROM pyq_topic_trends WHERE year IN (${years.map(() => '?').join(',')})`,
      args: years
    });
    
    // Get all topic-question mappings for canonical tests
    console.log('📊 Calculating new trends...');
    const trendsResult = await client.execute({
      sql: `
        SELECT 
          pqt.topic_id,
          pt.subject,
          pt.topic_slug,
          pt.topic_title,
          q.test_id,
          COUNT(*) as question_count
        FROM pyq_question_topics pqt
        JOIN pyq_topics pt ON pqt.topic_id = pt.id
        JOIN questions q ON pqt.question_id = q.id
        WHERE q.test_id IN (${Object.values(CANONICAL_TEST_IDS).map(() => '?').join(',')})
          AND q.deleted_at IS NULL
          AND pqt.is_primary = 1
        GROUP BY pqt.topic_id, q.test_id
        ORDER BY pt.subject, pt.topic_title
      `,
      args: Object.values(CANONICAL_TEST_IDS)
    });

    // Create year mapping
    const testIdToYear = {};
    Object.entries(CANONICAL_TEST_IDS).forEach(([year, testId]) => {
      testIdToYear[testId] = parseInt(year);
    });

    // Calculate trends per year
    const trendData = [];
    const subjectTotals = {}; // year -> subject -> total count

    // First pass: calculate subject totals per year
    for (const row of trendsResult.rows) {
      const year = testIdToYear[row.test_id];
      if (!subjectTotals[year]) subjectTotals[year] = {};
      if (!subjectTotals[year][row.subject]) subjectTotals[year][row.subject] = 0;
      subjectTotals[year][row.subject] += row.question_count;
    }

    console.log('\n📈 Subject totals by year:');
    years.forEach(year => {
      console.log(`  ${year}:`);
      if (subjectTotals[year]) {
        Object.entries(subjectTotals[year]).forEach(([subject, count]) => {
          console.log(`    ${subject}: ${count} questions`);
        });
      }
    });

    // Second pass: calculate weight percentages and trends
    for (const row of trendsResult.rows) {
      const year = testIdToYear[row.test_id];
      const subjectTotal = subjectTotals[year]?.[row.subject] || 1;
      const weightPercent = (row.question_count / subjectTotal) * 100;
      
      // Calculate trend delta (current year vs previous year)
      let trendDelta = 0;
      const previousYear = year - 1;
      if (previousYear >= 2020) {
        // Find same topic in previous year
        const previousYearData = trendsResult.rows.find(r => 
          r.topic_id === row.topic_id && 
          testIdToYear[r.test_id] === previousYear
        );
        
        if (previousYearData) {
          const previousSubjectTotal = subjectTotals[previousYear]?.[row.subject] || 1;
          const previousWeightPercent = (previousYearData.question_count / previousSubjectTotal) * 100;
          trendDelta = weightPercent - previousWeightPercent;
        }
      }

      trendData.push({
        id: generateId(),
        topicId: row.topic_id,
        subject: row.subject, // Add subject
        year: year,
        questionCount: row.question_count,
        weightPercent: Math.round(weightPercent * 100) / 100, // 2 decimal places
        trendDelta: Math.round(trendDelta * 100) / 100 // 2 decimal places
      });
    }

    console.log(`\n💾 Inserting ${trendData.length} trend records...`);

    // Insert new trend data
    let successCount = 0;
    for (const trend of trendData) {
      try {
        await client.execute({
          sql: `
            INSERT INTO pyq_topic_trends 
            (id, topic_id, subject, year, question_count, weight_percent, trend_delta, computed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            trend.id,
            trend.topicId,
            trend.subject, // Add subject field
            trend.year,
            trend.questionCount,
            trend.weightPercent,
            trend.trendDelta,
            Math.floor(Date.now() / 1000) // computed_at
          ]
        });
        successCount++;
      } catch (error) {
        console.log(`⚠️ Error inserting trend for topic ${trend.topicId}: ${error.message}`);
      }
    }

    console.log(`\n✅ Successfully inserted: ${successCount}/${trendData.length} trend records`);

    // Verify final counts
    const verifyResult = await client.execute(`
      SELECT 
        year,
        COUNT(*) as topic_count,
        SUM(question_count) as total_questions
      FROM pyq_topic_trends 
      WHERE year IN (${years.map(() => '?').join(',')})
      GROUP BY year
      ORDER BY year
    `, years);

    console.log(`\n🎯 Final verification:`);
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.year}: ${row.topic_count} topics, ${row.total_questions} total questions`);
    });

    return {
      trendsInserted: successCount,
      yearsCovered: years
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.close();
  }
}

// Run the trend computation
recomputePyqTrends().catch(console.error);