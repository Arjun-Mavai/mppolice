import { createClient } from '@libsql/client';
import fs from 'fs';

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

const normalizeSubject = (subject: string | null): string => {
  if (!subject) return 'General Studies';
  
  const subjectMap = {
    'Indian History': ['history', 'इतिहास', 'ancient history', 'medieval history', 'modern history'],
    'Indian Polity': ['polity', 'constitution', 'संविधान', 'राजनीति', 'governance'],
    'Geography': ['geography', 'भूगोल', 'physical geography', 'human geography'],
    'General Science': ['science', 'विज्ञान', 'physics', 'chemistry', 'biology'],
    'Economy': ['economy', 'अर्थव्यवस्था', 'economics', 'economic'],
    'MP GK': ['mp gk', 'madhya pradesh', 'मध्यप्रदेश', 'mp history', 'mp geography'],
    'Current Affairs': ['current affairs', 'समसामयिक', 'current', 'affairs'],
    'Environment': ['environment', 'पर्यावरण', 'ecology', 'climate'],
    'General Studies': ['general studies', 'सामान्य अध्ययन']
  };
  
  const subjectLower = subject.toLowerCase();
  for (const [normalized, keywords] of Object.entries(subjectMap)) {
    if (keywords.some(keyword => subjectLower.includes(keyword))) {
      return normalized;
    }
  }
  return 'General Studies';
};

async function updatePyqTopicMappings() {
  console.log('🚀 Starting PYQ topic mapping update...');
  
  try {
    const testIds = Object.values(CANONICAL_TEST_IDS);
    
    // First, get current topic mappings
    console.log('📊 Checking current topic mappings...');
    const currentMappingsResult = await client.execute(`
      SELECT 
        COUNT(*) as total_mappings,
        COUNT(DISTINCT question_id) as unique_questions
      FROM pyq_question_topics 
    `);
    
    const currentMappings = currentMappingsResult.rows[0] as unknown as { total_mappings: number, unique_questions: number };
    console.log(`Current mappings: ${currentMappings.total_mappings} total, ${currentMappings.unique_questions} unique questions`);
    
    // Get all questions from canonical tests
    console.log('🔍 Fetching questions from canonical tests...');
    const placeholders = testIds.map(() => '?').join(',');
    const questionsResult = await client.execute({
      sql: `
        SELECT 
          q.id as questionId,
          q.test_id as testId,
          q.question_text,
          q.question_text_en,
          q.subject,
          q.explanation,
          q.explanation_en,
          q."order" as question_order,
          t.title as testTitle,
          t.created_at
        FROM questions q
        JOIN tests t ON q.test_id = t.id
        WHERE q.test_id IN (${placeholders})
          AND q.deleted_at IS NULL
        ORDER BY q.test_id, q."order"
      `,
      args: testIds
    });

    console.log(`Found ${questionsResult.rows.length} questions from canonical tests`);
    
    // Check existing topics
    const topicsResult = await client.execute(`
      SELECT id, topic_slug, topic_title, subject 
      FROM pyq_topics 
      ORDER BY subject, topic_title
    `);
    
    console.log(`Found ${topicsResult.rows.length} existing topics`);
    
    // Process questions by subject
    const questionsBySubject: Record<string, any[]> = {};
    const yearMapping: Record<string, number> = {};
    Object.entries(CANONICAL_TEST_IDS).forEach(([year, testId]) => {
      yearMapping[testId] = parseInt(year);
    });
    
    for (const row of questionsResult.rows as any[]) {
      const normalizedSubject = normalizeSubject(row.subject as string | null);
      const year = yearMapping[row.testId as string];
      
      if (!questionsBySubject[normalizedSubject]) {
        questionsBySubject[normalizedSubject] = [];
      }
      
      questionsBySubject[normalizedSubject].push({
        questionId: row.questionId as string,
        testId: row.testId as string,
        year,
        subject: normalizedSubject,
        questionText: (row.question_text as string) || (row.question_text_en as string) || '',
        explanation: (row.explanation as string) || (row.explanation_en as string) || '',
        order: row.question_order as number
      });
    }
    
    console.log('\n📈 Questions by subject:');
    Object.entries(questionsBySubject).forEach(([subject, questions]) => {
      const yearCounts: Record<number, number> = {};
      questions.forEach((q: any) => {
        yearCounts[q.year] = (yearCounts[q.year] || 0) + 1;
      });
      console.log(`  ${subject}: ${questions.length} questions`);
      console.log(`    Years: ${Object.entries(yearCounts).map(([y, c]) => `${y}(${c})`).join(', ')}`);
    });
    
    // Check which questions are already mapped
    const mappedQuestionsResult = await client.execute({
      sql: `
        SELECT DISTINCT question_id
        FROM pyq_question_topics pqt
        JOIN questions q ON pqt.question_id = q.id
        WHERE q.test_id IN (${placeholders})
      `,
      args: testIds
    });
    
    const mappedQuestionIds = new Set(
      mappedQuestionsResult.rows.map(row => row.question_id as string)
    );
    
    const allQuestionIds = questionsResult.rows.map(row => row.questionId as string);
    const unmappedQuestions = allQuestionIds.filter(id => !mappedQuestionIds.has(id));
    
    console.log(`\n🎯 Mapping Status:`);
    console.log(`  ✅ Mapped: ${mappedQuestionIds.size} questions`);
    console.log(`  ❌ Unmapped: ${unmappedQuestions.length} questions`);
    console.log(`  📊 Coverage: ${((mappedQuestionIds.size / allQuestionIds.length) * 100).toFixed(1)}%`);
    
    // Show unmapped questions breakdown by year
    const unmappedByYear: Record<number, number> = {};
    for (const row of questionsResult.rows as any[]) {
      if (unmappedQuestions.includes(row.questionId as string)) {
        const year = yearMapping[row.testId as string];
        unmappedByYear[year] = (unmappedByYear[year] || 0) + 1;
      }
    }
    
    if (Object.keys(unmappedByYear).length > 0) {
      console.log(`\n⚠️ Unmapped questions by year:`);
      Object.entries(unmappedByYear).sort().forEach(([year, count]) => {
        console.log(`    ${year}: ${count} questions`);
      });
    }
    
    // Save bootstrap data for manual analysis
    const bootstrapData = {
      timestamp: new Date().toISOString(),
      totalQuestions: questionsResult.rows.length,
      mappedQuestions: mappedQuestionIds.size,
      unmappedQuestions: unmappedQuestions.length,
      coveragePercent: (mappedQuestionIds.size / allQuestionIds.length) * 100,
      questionsBySubject,
      unmappedByYear,
      sampleUnmappedQuestions: (questionsResult.rows as any[])
        .filter(row => unmappedQuestions.includes(row.questionId as string))
        .slice(0, 10)
        .map(row => ({
          year: yearMapping[row.testId as string],
          subject: normalizeSubject(row.subject as string | null),
          questionText: ((row.question_text as string) || (row.question_text_en as string) || '').substring(0, 100) + '...'
        }))
    };
    
    fs.writeFileSync('pyq_bootstrap_analysis.json', JSON.stringify(bootstrapData, null, 2));
    console.log('\n📄 Bootstrap analysis saved to: pyq_bootstrap_analysis.json');
    
    return bootstrapData;
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.close();
  }
}

// Run the analysis
updatePyqTopicMappings().catch(console.error);
