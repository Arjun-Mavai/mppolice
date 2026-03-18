import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../db';
import { questions, pyqQuestionTopics, tests } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getScopedPyqTests } from '../features/tests/actions/pyq-insights';
import fs from 'fs';

async function main() {
  const from = 2020;
  const to = 2025;
  const scopedTests = await getScopedPyqTests(from, to);
  const scopedTestIds = scopedTests.map((item) => item.testId);

  const allPyqQuestions = await db
    .select({
      id: questions.id,
      text: questions.questionText,
    })
    .from(questions)
    .where(inArray(questions.testId, scopedTestIds));

  const mappedQuestions = await db
    .select({
      id: pyqQuestionTopics.questionId,
    })
    .from(pyqQuestionTopics)
    .innerJoin(questions, eq(pyqQuestionTopics.questionId, questions.id))
    .where(inArray(questions.testId, scopedTestIds));

  const mappedIds = new Set(mappedQuestions.map((q) => q.id));
  const unmapped = allPyqQuestions.filter((q) => !mappedIds.has(q.id));

  console.log(`Scoped PYQ Core Exams: ${scopedTestIds.length}`);
  console.log(`Core Questions Base: ${allPyqQuestions.length}`);
  console.log(`Found Mapped Questions: ${mappedIds.size}`);
  console.log(`Calculated Unmapped PYQs: ${unmapped.length}`);

  fs.writeFileSync('/tmp/unmapped_pyqs.json', JSON.stringify(unmapped, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed executing TS Script: ", err);
  process.exit(1);
});
