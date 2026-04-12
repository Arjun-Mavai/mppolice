import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { submitTestAttempt } from '@/features/tests/actions/submission';
import { v4 as uuidv4 } from 'uuid';
import { getUserAnalytics } from '@/features/analytics/actions';

async function main() {
  console.log('🚀 Starting Analytics Verification Flow...');

  // 1. Create and Insert Dummy User
  const userId = `test-user-${uuidv4().substring(0, 8)}`;
  const userEmail = `${userId}@example.com`;
  console.log(`\n👤 Creating User: ${userId} (${userEmail})`);

  await db.insert(mppscUsers).values({
    id: userId,
    name: 'Test User',
    email: userEmail,
    password: 'mock_password_123',
    examType: 'mppolice',
  });
  console.log(`✅ User inserted into DB.`);

  // 2. Submit a Test Attempt (Simulating 'General Practice' with random answers)
  // We assume 'general-practice-v1' exists from previous steps.
  const testId = 'general-practice-v1';

  // Fetch some questions to answer
  const questions = await db.query.questions.findMany({
    where: (q, { eq }) => eq(q.testId, testId),
    limit: 5,
  });

  if (questions.length === 0) {
    // Fallback to any questions if specific test has none (it should have them)
    console.warn(
      '⚠️ No questions found for general-practice-v1, using random questions to construct payload.'
    );
  }

  const answers: Record<string, string> = {};
  const mockSubjects = ['MP History', 'Polity', 'Geography'];

  // Simulate answering 5 questions (mix of correct/incorrect)
  // We need to know valid questions for this test to store in attempt_answers properly?
  // Actually submitTestAttempt fetches questions from DB based on testId.
  // So we MUST use a testId that has questions.
  // 'general-practice-v1' might NOT have specific questions linked to it in 'questions' table
  // IF the logic in QuizPlayPage was "Fetch random questions -> Assign to general-practice-v1".
  // Wait, submitTestAttempt verifies: `db.select().from(questions).where(eq(questions.testId, testId))`
  // If 'general-practice-v1' has NO questions linked in DB, submission will fail or have score 0.

  // Let's check if 'general-practice-v1' has questions.
  // In seed-general-practice.ts, did we insert questions with testId='general-practice-v1'?
  // Let's verify.

  const generalQuestions = await db.query.questions.findMany({
    where: (q, { eq }) => eq(q.testId, testId),
  });

  console.log(`\n📚 Questions found for ${testId}: ${generalQuestions.length}`);

  if (generalQuestions.length === 0) {
    console.error(
      "❌ 'general-practice-v1' has no linked questions. Submissions effectively grade nothing."
    );
    // We should fix this if we want "Random Question" mode to work with persistence.
    // OR we use a testId that DOES have questions (like the seeded Unit 1 or FLT).
    // Let's use 'mppolice-flt-mock-1' which we know has questions with subjects.
    const fltTest = await db.query.tests.findFirst({
      where: (t, { eq }) => eq(t.slug, 'mppolice-flt-mock-1'),
    });

    if (fltTest) {
      console.log(`🔄 Switching to FLT Test ID: ${fltTest.id} for verification.`);
      const fltQuestions = await db.query.questions.findMany({
        where: (q, { eq }) => eq(q.testId, fltTest.id),
      });

      // Answer first 3 questions
      fltQuestions.slice(0, 3).forEach((q, idx) => {
        // Mark correct
        answers[q.id] = q.correctAnswer;
        console.log(`   - Answering Q${idx + 1} (${q.subject || 'General'}): Correctly`);
      });
      // Answer next 2 incorrectly
      fltQuestions.slice(3, 5).forEach((q, idx) => {
        answers[q.id] = '99'; // Invalid option
        console.log(`   - Answering Q${idx + 4} (${q.subject || 'General'}): Incorrectly`);
      });

      await runSubmission(fltTest.id, userId, answers);
    } else {
      console.error('❌ Could not find FLT test either.');
    }
  } else {
    // Proceed with general practice
    // ...
  }
}

async function runSubmission(testId: string, userId: string, answers: Record<string, string>) {
  console.log('\n📤 Submitting Test Attempt...');
  const timeTaken = 120; // 2 minutes

  const result = await submitTestAttempt(testId, userId, answers, timeTaken, {});
  console.log('✅ Submission Result:', result);

  if (result.success) {
    console.log('\n📊 Fetching User Analytics...');
    const analytics = await getUserAnalytics(userId);

    if (analytics) {
      console.log('\n--- Analytics Report ---');
      console.log(`Total Tests: ${analytics.totalTests}`);
      console.log(`Overall Score: ${analytics.overallScore}%`);
      console.log('\nSubject Mastery:');
      analytics.mastery.forEach((m) => {
        console.log(`- ${m.name}: ${m.percentage}% (${m.status})`);
      });
      console.log('\nAI Suggestion:');
      console.log(analytics.aiSuggestion);
      console.log('------------------------');
    } else {
      console.error('❌ Failed to fetch analytics.');
    }
  }
}

main().catch(console.error);
