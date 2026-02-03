import { redirect } from 'next/navigation';
import { db } from '@/db';
import { tests, questions } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { QuizPlayClient } from './QuizPlayClient';
import { Question } from '@/types/quiz';
import { verifyAuth } from '@/lib/auth';
import { userAttempts } from '@/db/schema';
import { and } from 'drizzle-orm';


// Force dynamic to ensure fresh questions (randomization strategy)
export const dynamic = 'force-dynamic';

function resolveCorrectAnswerIndex(val: string | number | null | undefined): number {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    
    const str = String(val).trim().toUpperCase();
    
    // Check if it's already a number string like "0", "1"
    if (!isNaN(Number(str)) && str !== "") {
        return Number(str);
    }
    
    // Check for "Option A", "Option B" etc. common patterns
    if (str.startsWith("OPTION ")) {
        const char = str.replace("OPTION ", "").trim().charAt(0);
         return char.charCodeAt(0) - 65;
    }

    // Map A->0, B->1, etc.
    if (str.length === 1 && str >= 'A' && str <= 'Z') {
        return str.charCodeAt(0) - 65;
    }
    
    return 0; // Fallback
}

export default async function QuizPlayPage({ searchParams }: { searchParams: Promise<{ mode?: string; unitId?: string; testId?: string, topicId?: string }> }) {
    const params = await searchParams;
    const mode = (params.mode as 'topic' | 'full' | 'pyq') || 'topic';
    const unitId = params.unitId;
    const testId = params.testId;
    const topicId = params.topicId;

    let quizQuestions: Question[] = [];

    let maxRetries: number | null = null;
    let userAttemptsCount = 0;
    
    // Auth is OPTIONAL - only required for tracking attempts and premium content
    const user = await verifyAuth();
    const isPro = user?.isSubscribed || false;
    let resolvedTestId = "";
    
    // For premium content (FLT, PYQ), check if user is subscribed
    // If not subscribed, we'll pass a flag to show paywall modal instead of redirecting
    const isPremiumMode = mode === 'full' || mode === 'pyq';
    const shouldShowPaywall = isPremiumMode && !isPro;

    // Helper to get user ID (mock for now if no auth implemented in this file yet)
    // Ideally we use `verifyAuth` or similar. 
    try {
        if (mode === 'full') {
             // 1. Full Length Test Logic
             if (!testId) {
                 const latestFLT = await db.query.tests.findFirst({
                     where: (calc, { eq }) => eq(calc.type, 'FLT'),
                     orderBy: (calc, { desc }) => [desc(calc.createdAt)]
                 });
                 if (latestFLT) {
                    resolvedTestId = latestFLT.id;
                 }
             } else {
                 resolvedTestId = testId;
             }

             if (resolvedTestId) {
                 const test = await db.query.tests.findFirst({
                     where: (calc, { eq }) => eq(calc.id, resolvedTestId),
                     with: {questions: {orderBy: (q, {asc}) => [asc(q.order)]}}
                 });

                 if (test) {
                     quizQuestions = test.questions.map(q => ({
                         id: q.id,
                         question: q.questionText,
                         questionEn: q.questionTextEn || null,
                         options: q.options as string[],
                         correctAnswer: resolveCorrectAnswerIndex(q.correctAnswer),
                         explanation: q.explanation || "",
                         explanationEn: q.explanationEn || null,
                         marks: q.marks,
                         negativeMarks: q.negativeMarks || 0
                     }));
                     maxRetries = test.maxRetries;
                 }
             }

        } else if (mode === 'pyq') {
            // 3. PYQ Mode Logic
            if (!testId) {
                const latestPYQ = await db.query.tests.findFirst({
                    where: (calc, { eq }) => eq(calc.type, 'PYQ'),
                    orderBy: (calc, { desc }) => [desc(calc.createdAt)]
                });
                if (latestPYQ) {
                    resolvedTestId = latestPYQ.id;
                }
            } else {
                resolvedTestId = testId;
            }

            if (resolvedTestId) {
                const test = await db.query.tests.findFirst({
                    where: (calc, { eq }) => eq(calc.id, resolvedTestId),
                    with: {questions: {orderBy: (q, {asc}) => [asc(q.order)]}}
                });

                if (test) {
                    quizQuestions = test.questions.map(q => ({
                        id: q.id,
                        question: q.questionText,
                        questionEn: q.questionTextEn || null,
                        options: q.options as string[],
                        correctAnswer: resolveCorrectAnswerIndex(q.correctAnswer),
                        explanation: q.explanation || "",
                        explanationEn: q.explanationEn || null,
                        marks: q.marks,
                        negativeMarks: q.negativeMarks || 0
                    }));
                    maxRetries = test.maxRetries;
                }
            }

        } else {
            // 4. Topic Mode Logic (Default)
            // If `testId` is passed directly (from our new flow), use it.
            if (testId) {
                 resolvedTestId = testId;
                 const test = await db.query.tests.findFirst({
                     where: (calc, { eq }) => eq(calc.id, resolvedTestId),
                     with: {questions: {orderBy: (q, {asc}) => [asc(q.order)]}}
                 });
                 if (test) {
                     quizQuestions = test.questions.map(q => ({
                         id: q.id,
                         question: q.questionText,
                         questionEn: q.questionTextEn || null,
                         options: q.options as string[],
                         correctAnswer: resolveCorrectAnswerIndex(q.correctAnswer),
                         explanation: q.explanation || "",
                         explanationEn: q.explanationEn || null,
                         marks: q.marks,
                         negativeMarks: q.negativeMarks || 0
                     }));
                     maxRetries = test.maxRetries;
                 }
            } 
            // Fallback: If only unitId and topicId are provided (Legacy or Link flow)
            else if (unitId && params.topicId) { 
                 const topicId = params.topicId as string;
                 // Try to find a specific TOPIC test first
                 const topicTest = await db.query.tests.findFirst({
                    where: (calc, { eq, and }) => and(
                        eq(calc.type, 'TOPIC'), 
                        eq(calc.unitId, unitId),
                        eq(calc.topicId, topicId) 
                    ),
                    orderBy: (calc, { desc }) => [desc(calc.createdAt)],
                    with: {questions: {orderBy: (q, {asc}) => [asc(q.order)]}}
                 });

                 if (topicTest) {
                     resolvedTestId = topicTest.id;
                     quizQuestions = topicTest.questions.map(q => ({
                         id: q.id,
                         question: q.questionText,
                         questionEn: q.questionTextEn || null,
                         options: q.options as string[],
                         correctAnswer: resolveCorrectAnswerIndex(q.correctAnswer),
                         explanation: q.explanation || "",
                         explanationEn: q.explanationEn || null,
                         marks: q.marks,
                         negativeMarks: q.negativeMarks || 0
                     }));
                 } else {
                     // If no specific topic test, maybe fallback or empty?
                     // For now, if no test found for topic, we return empty (handled below)
                 }
            }
            else if (unitId) {
                // If only Unit ID is provided -> UNIT Test (Random 20 mixed)
                const latestUnitTest = await db.query.tests.findFirst({
                    where: (calc, { eq, and }) => and(eq(calc.type, 'UNIT'), eq(calc.unitId, unitId)),
                    orderBy: (calc, { desc }) => [desc(calc.createdAt)],
                    with: {questions: true}
                });

                if (latestUnitTest) {
                     resolvedTestId = latestUnitTest.id;
                     // For unit tests, pick 20 random from its pool
                     const dbQuestions = await db.select().from(questions)
                        .where(eq(questions.testId, latestUnitTest.id))
                        .orderBy(sql`RANDOM()`) 
                        .limit(20);

                     quizQuestions = dbQuestions.map(q => ({
                        id: q.id,
                        question: q.questionText,
                        questionEn: q.questionTextEn || null,
                        options: q.options as string[],
                        correctAnswer: resolveCorrectAnswerIndex(q.correctAnswer),
                        explanation: q.explanation || "",
                        explanationEn: q.explanationEn || null,
                        marks: q.marks,
                        negativeMarks: q.negativeMarks || 0
                    }));
                    maxRetries = latestUnitTest.maxRetries;
                }
            } else {
                 // General Practice (Random)
                 const dbQuestions = await db.select().from(questions)
                    .orderBy(sql`RANDOM()`)
                    .limit(20);
                
                 quizQuestions = dbQuestions.map(q => ({
                    id: q.id,
                    question: q.questionText,
                    questionEn: q.questionTextEn || null,
                    options: q.options as string[],
                    correctAnswer: resolveCorrectAnswerIndex(q.correctAnswer),
                    explanation: q.explanation || "",
                    explanationEn: q.explanationEn || null,
                    marks: q.marks,
                    negativeMarks: q.negativeMarks || 0
                }));
                resolvedTestId = 'general-practice-v1';
            }
        }
        
        // Final fallback if resolvedTestId is still empty (e.g. unitId provided but no test found)
        if (!resolvedTestId) {
             resolvedTestId = 'general-practice-v1';
        }
        
        // Fetch User Attempts (only if user is logged in)
        if (resolvedTestId && user) {
            const attempts = await db.select({count: sql<number>`count(*)`}).from(userAttempts)
               .where(and(eq(userAttempts.userId, user.id), eq(userAttempts.testId, resolvedTestId)));
            userAttemptsCount = Number(attempts[0].count);
        }

    } catch (error) {
        console.error("Quiz Fetch Error:", error);
        quizQuestions = []; 
    }

    return (
        <QuizPlayClient 
            questions={quizQuestions} 
            mode={mode} 
            maxRetries={maxRetries}
            userAttempts={userAttemptsCount}
            isPro={isPro}
            testId={resolvedTestId}
            userId={user?.id || null}
            shouldShowPaywall={shouldShowPaywall}
        />
    );
}
