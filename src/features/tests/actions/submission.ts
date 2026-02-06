'use server';

import { db } from '@/db';
import { tests, userAttempts, questions, attemptAnswers } from '@/db/schema';
import { eq, asc, desc, and, inArray, sql } from 'drizzle-orm';
import { unstable_cache, revalidateTag } from 'next/cache';
import { verifyAuth } from '@/lib/auth';
import { SCORING_CONFIG } from '@/lib/quiz-scoring';
import { logger } from '@/lib/logger';
import { insertUserToLeaderboard } from '@/actions/leaderboard-actions';

// --- Generic Cached Fetchers ---

export const getCachedPYQTests = unstable_cache(
    async () => {
        const pyqTests = await db.select()
            .from(tests)
            .where(eq(tests.type, 'PYQ'))
            .orderBy(asc(tests.displayOrder), desc(tests.createdAt));
        
        return pyqTests.map(test => ({
            ...test,
            year: test.title.match(/\d{4}/)?.[0] || new Date(test.createdAt!).getFullYear().toString()
        }));
    },
    ['pyq-tests-list'],
    { revalidate: 60, tags: ['tests'] }
);

export const getCachedFLTTests = unstable_cache(
    async () => {
        return await db.select()
            .from(tests)
            .where(eq(tests.type, 'FLT'))
            .orderBy(asc(tests.displayOrder));
    },
    ['flt-tests-list'],
    { revalidate: 60, tags: ['tests'] }
);

export const getCachedCSATTests = unstable_cache(
    async () => {
        return await db.select()
            .from(tests)
            .where(eq(tests.type, 'CSAT'))
            .orderBy(asc(tests.displayOrder), desc(tests.createdAt));
    },
    ['csat-tests-list'],
    { revalidate: 60, tags: ['tests'] }
);


// --- Dynamic User Data Fetchers ---

export async function getUserAttempts(testIds: string[]) {
    const user = await verifyAuth();
    if (!user || testIds.length === 0) return {};

    const attempts = await db.select({
        testId: userAttempts.testId,
        count: sql<number>`count(*)`
    })
    .from(userAttempts)
    .where(
        and(
            eq(userAttempts.userId, user.id),
            inArray(userAttempts.testId, testIds)
        )
    )
    .groupBy(userAttempts.testId);

    // Return as a Record<string, number> for easy client-side mapping
    return attempts.reduce((acc, curr) => {
        acc[curr.testId] = Number(curr.count);
        return acc;
    }, {} as Record<string, number>);
}

import { z } from 'zod';

const testIdSchema = z.string().uuid().or(z.string().min(1)); // Allow non-UUID IDs if legacy support needed, but prefer UUID
const unitIdSchema = z.string().min(1);

export async function getTestByUnitId(unitId: string) {
    const validatedUnitId = unitIdSchema.parse(unitId);

    const test = await db.query.tests.findFirst({
        where: and(
            eq(tests.unitId, validatedUnitId),
            // We look for 'UNIT' type tests specifically. 
            // If multiple exist, we take the first one (usually there's only one "Unit Test" per unit).
            eq(tests.type, 'UNIT') 
        ),
        with: {
            questions: {
                orderBy: asc(questions.order)
            }
        }
    });
    
    return test || null;
}

export async function getTestWithQuestions(testId: string) {
    try {
        const validatedId = testIdSchema.parse(testId);
        
        const test = await db.query.tests.findFirst({
            where: eq(tests.id, validatedId),
            with: {
                questions: {
                    orderBy: asc(questions.order)
                }
            }
        });
        
        return test || null;
    } catch (error) {
        logger.error("Invalid Test ID or DB Error:", error);
        return null;
    }
}

export async function submitTestAttempt(
    testId: string,
    userId: string,
    answers: Record<string, string>,
    durationSeconds: number,
    questionTimes: Record<string, number>
) {
    try {
        // 1. Fetch Correct Answers from DB (Secure)
        const testQuestions = await db.select({
            id: questions.id,
            correctAnswer: questions.correctAnswer,
            marks: questions.marks,
            negativeMarks: questions.negativeMarks
        })
        .from(questions)
        .where(eq(questions.testId, testId));

        if (testQuestions.length === 0) return { error: "Test not found" };

        // 2. Calculate Score
        let totalScore = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        
        const answersList: { questionId: string; userAnswer: string; isCorrect: boolean; timeTaken: number }[] = [];

        testQuestions.forEach(q => {
             const userAnswer = answers[q.id];
             if (userAnswer !== undefined) {
                 const isCorrect = String(userAnswer) === String(q.correctAnswer);
                 
                 if (isCorrect) {
                     // Strict Scoring as per User Request ("Global Standard")
                     const marks = SCORING_CONFIG.MARKS_PER_QUESTION;
                     totalScore += marks;
                     correctCount++;
                 } else {
                     // Strict Negative Marking
                     const deduction = SCORING_CONFIG.NEGATIVE_MARKING;
                     totalScore -= deduction;
                     incorrectCount++;
                 }

                 answersList.push({
                     questionId: q.id,
                     userAnswer: String(userAnswer),
                     isCorrect,
                     timeTaken: Math.round(questionTimes[q.id] || 0)
                 });
             }
        });

        // 3. Create Attempt Record
        const attemptId = crypto.randomUUID();
        
        // Transaction to ensure data consistency
        await db.transaction(async (tx) => {
             // Create Attempt
             await tx.insert(userAttempts).values({
                 id: attemptId,
                 userId,
                 testId,
                 startTime: new Date(Date.now() - durationSeconds * 1000), // Approx start
                 endTime: new Date(),
                 score: parseFloat(totalScore.toFixed(2)),
                 isCompleted: true
             });

             // Bulk Insert Answers (if supported by DB/Drizzle driver, otherwise loop)
             if (answersList.length > 0) {
                 // Drizzle supports bulk insert
                 // Need to map to table columns
                 /*
                 export const attemptAnswers = sqliteTable('attempt_answers', {
                    id: text('id').primaryKey(),
                    attemptId: ...
                    questionId: ...
                    userAnswer: ...
                    isCorrect: ...
                    timeTakenSeconds: ...
                 */
                 await tx.insert(attemptAnswers).values(
                     answersList.map(a => ({
                         id: crypto.randomUUID(),
                         attemptId,
                         questionId: a.questionId,
                         userAnswer: a.userAnswer,
                         isCorrect: a.isCorrect,
                         timeTakenSeconds: a.timeTaken
                     }))
                 );
             }
        });

        // 4. Update Leaderboard (Async - Fire and Forget mostly, or await if critical)
        // Need user name for leaderboard
        const user = await verifyAuth();
        if (user && user.name) {
             // We need total marks for percentage calc in leaderboard
             // We sum marks from questions
             /* 
                Already have testQuestions with marks.
                const totalMarks = testQuestions.reduce((sum, q) => sum + q.marks, 0); 
             */
             const totalTestMarks = testQuestions.reduce((sum, q) => sum + q.marks, 0);

             await insertUserToLeaderboard({
                 testId,
                 userId,
                 displayName: user.name,
                 score: parseFloat(totalScore.toFixed(2)),
                 timeTaken: durationSeconds,
                 totalMarks: totalTestMarks
             });
        }

        // 5. Invalidate User Analytics Cache
        // "Bhai result aa gaya, ab purana cache hatao"
        await revalidateTag(`analytics-${userId}`, { expire: 0 });
        
        return { success: true, attemptId, score: parseFloat(totalScore.toFixed(2)) };

    } catch (error) {
        logger.error("Error submitting test:", error);
        return { error: "Failed to submit test" };
    }
}
