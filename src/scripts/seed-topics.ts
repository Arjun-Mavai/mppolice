import 'dotenv/config';
import { db } from '@/db';
import { tests, questions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { syllabusData } from '@/data/syllabusData';

// Map Option Strings to Index
const OPTION_MAP: Record<string, string> = {
  'Option A': '0',
  'Option B': '1',
  'Option C': '2',
  'Option D': '3',
};

interface QuestionInput {
  questionText: string;
  questionTextEn?: string;
  options: string[];
  correctAnswer: string; // "Option A", "Option B", etc.
  explanation?: string;
  explanationEn?: string;
  marks?: number;
  negativeMarks?: number;
}

interface TestInput {
  topicId: number;
  questions: QuestionInput[];
}

interface BulkUploadInput {
  unitId: string;
  tests: TestInput[];
}

async function seedTopics(filePath: string) {
  console.log(`\n🚀 Starting Bulk Upload from: ${filePath}\n`);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: BulkUploadInput = JSON.parse(fileContent);

    const unitId = data.unitId;
    const unitData = syllabusData.units[unitId];

    if (!unitData) {
      throw new Error(`❌ Unit ID '${unitId}' not found in syllabusData.`);
    }

    console.log(`📦 Processing Unit: ${unitData.title_en || unitData.title} (${unitId})`);

    for (const testInput of data.tests) {
      // 1. Find Topic Data
      const topic = unitData.topics.find((t) => t.id === testInput.topicId);
      const topicEn = unitData.topics_en?.find((t) => t.id === testInput.topicId);

      if (!topic) {
        console.warn(`⚠️  Topic ID ${testInput.topicId} not found in Unit ${unitId}. Skipping.`);
        continue;
      }

      const topicTitle = topicEn?.front || topic.front;
      console.log(`\n  📝 Processing Topic ${testInput.topicId}: ${topicTitle}`);

      // 2. Get or Create Test
      const slug = `unit-${unitId}-topic-${testInput.topicId}`.toLowerCase().replace(/_/g, '-');

      let testId: string;

      // Check existing by slug or unitId+topicId+type
      const existingTest = await db.select().from(tests).where(eq(tests.slug, slug)).limit(1);

      if (existingTest.length > 0) {
        testId = existingTest[0].id;
        console.log(`     🔹 Found existing test (ID: ${testId}). Appending questions...`);
      } else {
        testId = uuidv4();
        const title = `${topicTitle} - Practice Test`;

        await db.insert(tests).values({
          id: testId,
          title: title,
          slug: slug,
          description: `Topic-wise practice test for ${topicTitle}`,
          durationMinutes: 20, // Default for topic tests
          totalMarks: 0, // Will update dynamically or keep logical
          type: 'TOPIC',
          unitId: unitId,
          topicId: testInput.topicId.toString(),
          tags: [unitId, `topic-${testInput.topicId}`],
          isPro: false,
          maxRetries: 10,
        });
        console.log(`     ✨ Created new test (ID: ${testId}, Slug: ${slug})`);
      }

      // 3. Process Questions (Safe Append)
      let addedCount = 0;
      let skippedCount = 0;

      const existingQuestions = await db
        .select({ text: questions.questionText })
        .from(questions)
        .where(eq(questions.testId, testId));
      const existingQuestionTexts = new Set(existingQuestions.map((q) => q.text));

      const newQuestionsToInsert = [];

      for (const q of testInput.questions) {
        if (existingQuestionTexts.has(q.questionText)) {
          skippedCount++;
          continue;
        }

        // Map Correct Answer
        let correctIdx = OPTION_MAP[q.correctAnswer];
        if (!correctIdx) {
          // Fallback: try to find if it's already an index or raw string
          if (['0', '1', '2', '3'].includes(q.correctAnswer)) {
            correctIdx = q.correctAnswer;
          } else {
            console.warn(
              `     ⚠️  Invalid correct answer format: '${q.correctAnswer}'. Defaulting to '0' (Option A).`
            );
            correctIdx = '0';
          }
        }

        newQuestionsToInsert.push({
          id: uuidv4(),
          testId: testId,
          questionText: q.questionText,
          questionTextEn: q.questionTextEn,
          options: q.options,
          correctAnswer: correctIdx,
          explanation: q.explanation,
          explanationEn: q.explanationEn,
          marks: q.marks || 3,
          negativeMarks: q.negativeMarks || 1,
          order: existingQuestionTexts.size + addedCount + 1, // Append order
          subject: unitData.subject || 'General Studies',
        });

        addedCount++;
      }

      if (newQuestionsToInsert.length > 0) {
        await db.insert(questions).values(newQuestionsToInsert);

        // Update total marks/questions for test
        const currentTotalQuestions = existingQuestionTexts.size + addedCount;
        await db
          .update(tests)
          .set({
            totalQuestions: currentTotalQuestions,
            totalMarks: currentTotalQuestions * 3,
            updatedAt: new Date(),
          })
          .where(eq(tests.id, testId));
      }

      console.log(`     ✅ Added: ${addedCount} | ⏭️  Skipped (Duplicate): ${skippedCount}`);
    }

    console.log(`\n🎉 Bulk Upload Complete!`);
  } catch (error) {
    console.error('❌ Error during bulk upload:', error);
    process.exit(1);
  }
}

// CLI Argument Handling
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: npx tsx src/scripts/seed-topics.ts <path-to-json-file>');
  process.exit(1);
}

seedTopics(args[0]);
