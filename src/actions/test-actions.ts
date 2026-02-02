
'use server';

import { db } from '@/db';
import { tests, questions, userAttempts, attemptAnswers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';

const QuestionSchema = z.object({
  text: z.string(),
  options: z.array(z.string()),
  correct: z.union([z.string(), z.number()]), // Can be index (number) or text value
  explanation: z.string().optional(),
  marks: z.number().default(2),
  negative: z.number().default(0),
  order: z.number().optional(),
});

const TestImportSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  slug: z.string().min(3),
  duration: z.number(), // in minutes
  totalMarks: z.number(),
  type: z.enum(['FLT', 'UNIT', 'CSAT', 'PYQ', 'TOPIC']),
  isPro: z.boolean().default(false),
  questions: z.array(QuestionSchema),
});

export async function importTestFromJson(jsonContent: any) {
  // Parsing
  const parsing = TestImportSchema.safeParse(jsonContent);
  if (!parsing.success) {
    console.error("Validation Error", parsing.error.format());
    return { success: false, error: JSON.stringify(parsing.error.format()) };
  }

  const data = parsing.data;
  const testId = randomUUID();

  try {
    // Check for unique slug
    // Note: Drizzle's findFirst is convenient if we had query builder, 
    // but straight insert will fail with constraint error if duplicate. 
    // We'll trust the constraint or handle the error.
    
    // Create Test
    await db.insert(tests).values({
      id: testId,
      title: data.title,
      description: data.description,
      slug: data.slug,
      durationMinutes: data.duration,
      totalMarks: data.totalMarks,
      type: data.type,
      isPro: data.isPro,
    });

    console.log(`Test created: ${data.title} (${testId})`);

    // Prepare Questions
    const questionsData = data.questions.map((q, index) => ({
      id: randomUUID(),
      testId: testId,
      questionText: q.text,
      options: q.options, // Store as JSON directly, Drizzle handles serialization with mode:'json'
      correctAnswer: String(q.correct),
      explanation: q.explanation,
      marks: q.marks,
      negativeMarks: q.negative,
      order: q.order ?? index + 1,
    }));

    if (questionsData.length > 0) {
        // SQLite has limit on variables in one query (999 usually), 
        // so we might need to batch if questions are many.
        // Batch size of 50 is safe.
        const batchSize = 50;
        for (let i = 0; i < questionsData.length; i += batchSize) {
            const batch = questionsData.slice(i, i + batchSize);
            await db.insert(questions).values(batch);
        }
    }

    return { success: true, testId, count: questionsData.length };
  } catch (e: any) {
    console.error('Import Error:', e);
    // Unique constraint error usually contains "UNIQUE constraint failed"
    if (e.message?.includes('UNIQUE constraint')) {
        return { success: false, error: 'A test with this slug already exists.' };
    }
    return { success: false, error: e.message };
  }
}

export async function submitTestAttempt(
  testId: string, 
  userId: string, 
  answers: Record<string, string>, 
  timeTaken: number,
  questionTimes: Record<string, number> = {} // New argument
) {
  try {
    const test = await db.select().from(tests).where(eq(tests.id, testId)).limit(1);
    
    if (!test[0]) throw new Error("Test not found");
    
    // Fetch questions to grade
    const questionsData = await db.select().from(questions).where(eq(questions.testId, testId));

    let score = 0;
    const attemptId = randomUUID();
    
    const answerRecords = questionsData.map(q => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      
      if (isCorrect) {
        score += q.marks;
      } else if (userAnswer) {
        // Handle negative marks if exists, otherwise 0
        score -= (q.negativeMarks || 0);
      }

      return {
        id: randomUUID(),
        attemptId: attemptId,
        questionId: q.id,
        userAnswer: userAnswer || null,
        isCorrect: isCorrect,
        timeTakenSeconds: questionTimes[q.id] || 0, // Save per-question time
      };
    });

    await db.insert(userAttempts).values({
      id: attemptId,
      userId: userId || 'anonymous',
      testId: testId,
      startTime: new Date(Date.now() - (timeTaken * 1000)), 
      endTime: new Date(),
      score: score,
      isCompleted: true,
    });

    if (answerRecords.length > 0) {
        const batchSize = 50;
        for (let i = 0; i < answerRecords.length; i += batchSize) {
             const batch = answerRecords.slice(i, i + batchSize);
             await db.insert(attemptAnswers).values(batch);
        }
    }

    revalidatePath('/syllabus/analytics');
    revalidatePath('/dashboard');

    return { success: true, attemptId, score, points: score }; // Return points/score
  } catch (e: any) {
    console.error("Submit Error:", e);
    return { success: false, error: e.message };
  }
}
