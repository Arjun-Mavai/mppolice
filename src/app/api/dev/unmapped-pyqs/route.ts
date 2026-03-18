import { NextResponse } from 'next/server';
import { db } from '@/db';
import { questions, pyqQuestionTopics } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getScopedPyqTests } from '@/features/tests/actions/pyq-insights';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const from = 2020;
    const to = 2025;
    
    // Core exams exactly matching the PYQ Insights scope
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

    return NextResponse.json({
      success: true,
      stats: {
        scopedTestsCount: scopedTestIds.length,
        coreQuestionsBase: allPyqQuestions.length,
        foundMappedQuestions: mappedIds.size,
        unmappedCount: unmapped.length,
      },
      unmapped,
    });
  } catch (error) {
    console.error('Failed unmapped dump:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
