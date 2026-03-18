import { db } from '../src/db';
import { tests, questions, pyqQuestionTopics } from '../src/db/schema';
import { like, inArray } from 'drizzle-orm';

// Fix for process.env.DATABASE_URL if needed
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  console.log('🔍 Analyzing Missing PYQ Questions...');

  try {
    // 1. Find Relevant Tests
    const allTests = await db
      .select({ id: tests.id, title: tests.title })
      .from(tests);

    const relevantTests = allTests.filter(t => 
      (t.title.includes('MPPSC State Service Prelims') && t.title.includes('Paper 1')) ||
      (t.title.includes('MPPSC राज्य सेवा प्रारंभिक') && t.title.includes('पेपर 1'))
    );

    if (relevantTests.length === 0) {
      console.log('❌ No tests found matching the criteria.');
      process.exit(1);
    }

    console.log(`\n📚 Found ${relevantTests.length} Tests:`);
    relevantTests.forEach((t) => console.log(`- ${t.title} (${t.id})`));

    const testIds = relevantTests.map((t) => t.id);

    // 2. Get All Questions from these tests
    const allQuestions = await db
      .select({
        id: questions.id,
        testId: questions.testId,
        questionText: questions.questionText,
        order: questions.order,
      })
      .from(questions)
      .where(inArray(questions.testId, testIds));
      // orderBy removed because it might not be imported or supported correctly in this context without explicit sort function

    // Sort manually
    allQuestions.sort((a, b) => (a.testId > b.testId ? 1 : -1) || (a.order || 0) - (b.order || 0));

    console.log(`\n🔢 Total Questions in Tests: ${allQuestions.length}`);

    // 3. Get Mapped Questions
    const mappedQuestions = await db
      .select({ questionId: pyqQuestionTopics.questionId })
      .from(pyqQuestionTopics);
    
    const mappedIds = new Set(mappedQuestions.map((q) => q.questionId));

    // 4. Find Missing
    const missing = allQuestions.filter((q) => !mappedIds.has(q.id));

    console.log(`\n⚠️  Missing Questions: ${missing.length}`);
    
    if (missing.length > 0) {
      console.log('\n📝 Detail of Missing Questions:');
      
      const grouped: Record<string, typeof missing> = {};
      
      missing.forEach(q => {
        const test = relevantTests.find(t => t.id === q.testId);
        const title = test ? test.title : 'Unknown Test';
        if (!grouped[title]) grouped[title] = [];
        grouped[title].push(q);
      });

      Object.entries(grouped).forEach(([title, qs]) => {
        console.log(`\n📌 ${title}: (${qs.length} missing)`);
        qs.forEach(q => {
          const snippet = (q.questionText || '').substring(0, 60).replace(/\n/g, ' ') + '...';
          console.log(`   [Q${q.order}] ${snippet} (ID: ${q.id})`);
        });
      });
    } else {
      console.log('\n✅ All questions are mapped!');
    }

  } catch (error) {
    console.error("Error executing script:", error);
  }

  process.exit(0);
}

main();
