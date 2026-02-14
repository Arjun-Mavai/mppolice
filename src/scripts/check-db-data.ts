import 'dotenv/config';
import { db } from '@/db';
import { tests, questions } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('--- Checking Tests Table ---');
  const allTests = await db.select().from(tests).limit(5);
  console.log(JSON.stringify(allTests, null, 2));

  if (allTests.length > 0) {
    console.log('\n--- Checking Questions for First Test ---');
    const testId = allTests[0].id;
    const testQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.testId, testId))
      .limit(3);
    console.log(JSON.stringify(testQuestions, null, 2));
  } else {
    console.log('\nNo tests found.');
  }
}

main().catch(console.error);
