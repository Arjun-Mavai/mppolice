
import { db } from '@/db';
import { pyqTopics } from '@/db/schema';
import { getRepeatedQuestions } from '@/actions/pyq-analytics';

async function main() {
  try {
    const questions = await getRepeatedQuestions();
    // Use proper logging, not JSON.stringify with slice/limit which might not match structure
    // but here we just want to verify property names
    console.log('Sample Topics from getRepeatedQuestions:', JSON.stringify(questions[0]?.topics, null, 2));

    const allTopics = await db.select().from(pyqTopics).limit(5);
    console.log('Sample Topics from DB:', JSON.stringify(allTopics, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
