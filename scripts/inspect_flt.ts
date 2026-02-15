import 'dotenv/config';
import { db } from '@/db';
import { tests, questions } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Inspecting FLT Questions...');

  const fltTests = await db.query.tests.findMany({
    where: eq(tests.type, 'FLT'),
    with: {
      questions: {
        limit: 1,
      },
    },
  });

  if (fltTests.length === 0) {
    console.log('No FLT tests found.');
    return;
  }

  const test = fltTests[0];
  console.log(`Test: ${test.title} (${test.id})`);

  if (test.questions.length > 0) {
    const q = test.questions[0];
    console.log('Sample Question:', JSON.stringify(q, null, 2));
    console.log('Type of correct_answer:', typeof q.correctAnswer);
  } else {
    console.log('No questions in this test.');
  }
}

main().catch(console.error);
