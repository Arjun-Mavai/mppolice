// 🎮 Quiz Play Page - The Engine of MP Police Elite
// Bhai, ye page saare tests (PYQ, Topic, Full) ko execute karta h.
// Lightning fast loading ke liye humne parallel fetching aur efficient mapping use ki h.

import { redirect } from 'next/navigation';
import { getTestWithQuestions, getUserAttempts } from '@/features/tests/actions/submission';
import { getQuestionsBySubject } from '@/features/tests/actions/pyq-analytics';
import { QuizPlayClient } from './QuizPlayClient';
import { verifyAuth } from '@/lib/auth';
import { Question } from '@/types/quiz';
import { logger } from '@/lib/logger';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { getCachedAttemptLimits } from '@/app/admin/test-access/actions';
import { getSubjectPartAccess } from '@/app/syllabus/quiz/pyq/actions';
import { canAccessTest, getUserTier } from '@/lib/access-control';
import { correctAnswerToOptionIndex } from '@/lib/mppolice/mcq-answer-key';

interface PageProps {
  searchParams: Promise<{
    testId?: string;
    mode?: string;
    subject?: string;
    limit?: string;
    offset?: string;
    completed?: string;
  }>;
}

export default async function QuizPlayPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { testId, mode, subject, completed } = params;

  if (completed === 'true') {
    redirect('/syllabus/quiz/pyq');
  }

  // 📝 0. Security Whitelist: Random subjects ko block karne ke liye.
  const ALLOWED_SUBJECTS = [
    'General Knowledge', 'General Science', 'Logical Reasoning', 'Quantitative Aptitude',
    'MP GK', 'History', 'Geography', 'Polity', 'Economy', 'Science', 'ICT', 'Current Affairs', 'Misc',
  ];
  if (subject && !ALLOWED_SUBJECTS.includes(subject)) {
    redirect('/syllabus/quiz/pyq');
  }

  // 1. 🏗️ Handle Subject Practice Mode (Mixed PYQs from DB)
  if (mode === 'pyq-subject' && subject) {
    const user = await verifyAuth();

    // Pagination Logic: Default 30 questions per part (Chunking)
    const rawLimit = Number(params.limit);
    const limitDefault = 30; 
    const limit = Math.min(Math.max(Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : limitDefault, 1), limitDefault);

    const rawOffset = Number(params.offset);
    const offset = Math.max(Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0, 0);

    const CHUNK_SIZE = 30;
    const partNum = Math.floor(offset / CHUNK_SIZE) + 1;

    // 🔒 Access Control: Check if this Part is Free/Unlocked for the user.
    const accessMap = await getSubjectPartAccess(subject);
    const partAccess = accessMap?.[partNum];

    let isLocked = false;
    if (partAccess) {
      isLocked = partAccess.isLocked; 
    } else {
      const tier = user ? getUserTier(user) : 'free';
      isLocked = tier === 'free';
    }

    if (isLocked) redirect('/pricing');

    // ✅ Access Granted - Fetch & Map Questions
    const rawQuestions = await getQuestionsBySubject(subject);
    const questionsSlice = rawQuestions.slice(offset, offset + limit);

    if (!questionsSlice || questionsSlice.length === 0) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-[80px]">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900">No Questions Found</h1>
            <p className="text-slate-500">Is subject ke liye questions abhi available nahi hain.</p>
          </div>
        </div>
      );
    }

    // 🛠️ Map raw DB rows to clean UI Question type
    const questions: Question[] = questionsSlice.map((q: any) => {
      const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      let ext = typeof q.extendedData === 'string' ? (JSON.parse(q.extendedData) || {}) : (q.extendedData || {});
      
      return {
        id: q.id,
        question: q.questionText,
        questionEn: q.questionTextEn || undefined,
        correctAnswer: correctAnswerToOptionIndex(q.correctAnswer, opts),
        options: opts as string[],
        explanation: q.explanation || undefined,
        explanationEn: q.explanationEn || undefined,
        subject: `PYQ ${q.year}`,
        type: q.type || 'standard',
        matchPairs: q.matchPairs,
        negativeMarks: q.negativeMarks ?? QUIZ_CONSTANTS.NEGATIVE_MARKING,
        marks: q.marks ?? QUIZ_CONSTANTS.MARKS_PER_QUESTION,
        extendedData: ext,
        questionImageUrl: ext?.questionImageUrl,
      };
    });

    const hasPaidPlan = user ? getUserTier(user) !== 'free' : false;
    const isProUI = hasPaidPlan || (partAccess && partAccess.isFree);

    return (
      <QuizPlayClient
        questions={questions}
        mode="pyq"
        testId={`practice-${subject}-${offset}`}
        title={`${subject} Part ${partNum}`}
        userId={user?.id || null}
        userName={user?.name || undefined}
        maxRetries={null} 
        userAttempts={0}
        isPro={!!isProUI}
        shouldShowPaywall={false}
      />
    );
  }

  // 2. 🏛️ Standard Test Mode (Specific Test IDs)
  if (!testId) redirect('/syllabus/quiz/pyq');

  // 🏎️ Parallel Fetching (Main Waterfall Killer)
  const [testData, user, attemptLimits] = await Promise.all([
    getTestWithQuestions(testId),
    verifyAuth(),
    getCachedAttemptLimits(),
  ]);

  if (!testData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-[80px]">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Test Not Found</h1>
          <p className="text-slate-500">Ye test database me nahi mila. Check unit settings.</p>
        </div>
      </div>
    );
  }

  // 🛡️ Global Access Check (Guest/User/Tier)
  const guestDenied = !user && !testData.isFreeAccess;
  const loggedInDenied = user && !canAccessTest(testData, user);
  if (guestDenied || loggedInDenied) redirect('/pricing');

  // Fetch attempts only if user is logged in
  const attemptsMap = user ? await getUserAttempts([testId], user.id) : {};
  const userAttemptsCount = (attemptsMap as any)[testId] || 0;

  // 🛠️ Map Questions for UI
  const questions: Question[] = testData.questions.map((q) => {
    const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
    let ext = typeof q.extendedData === 'string' ? (JSON.parse(q.extendedData) || {}) : (q.extendedData || {});
    
    return {
      id: q.id,
      question: q.questionText,
      questionEn: (testData.type === 'CSAT' && (!q.questionTextEn || q.questionTextEn.toLowerCase() === 'n/a')) 
        ? q.questionText 
        : q.questionTextEn || undefined,
      correctAnswer: correctAnswerToOptionIndex(q.correctAnswer, opts),
      options: opts as string[],
      explanation: q.explanation || undefined,
      explanationEn: q.explanationEn || undefined,
      subject: q.subject || undefined,
      type: (q.type as 'standard' | 'matching') || 'standard',
      matchPairs: (q.matchPairs as any) || undefined,
      negativeMarks: q.negativeMarks ?? QUIZ_CONSTANTS.NEGATIVE_MARKING,
      marks: q.marks ?? QUIZ_CONSTANTS.MARKS_PER_QUESTION,
      extendedData: ext,
      questionImageUrl: ext?.questionImageUrl,
    };
  });

  const isTestingUser = user?.role === 'admin';
  let maxRetries = attemptLimits[testData.type] ?? null;
  if (isTestingUser) maxRetries = null; // Admins have unlimited retries

  return (
    <QuizPlayClient
      questions={questions}
      mode={(mode as 'topic' | 'full' | 'pyq') || 'topic'}
      testId={testId}
      title={testData.title}
      userId={user?.id || null}
      userName={user?.name || undefined}
      maxRetries={maxRetries}
      userAttempts={userAttemptsCount}
      isPro={getUserTier(user) !== 'free'}
      shouldShowPaywall={false}
    />
  );
}
