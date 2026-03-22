import { NextResponse } from 'next/server';
import { db } from '@/db';
import { testFeedback, tests, mppscUsers } from '@/db/schema';
import { cookies } from 'next/headers';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    // Verify Admin
    const cookieStore = await cookies();
    const token = cookieStore.get('mppsc_token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { verifyToken } = await import('@/lib/jwt');
    const decoded: any = verifyToken(token);

    if (!decoded?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check role
    const user = await db.query.mppscUsers.findFirst({
      where: (users, { eq }) => eq(users.id, decoded.userId),
      columns: { role: true },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch Test Feedbacks joined with Test Titles
    const data = await db
      .select({
        id: testFeedback.id,
        testId: testFeedback.testId,
        testTitle: tests.title,
        userName: testFeedback.userName,
        userEmail: testFeedback.userEmail,
        overallRating: testFeedback.overallRating,
        difficultyLevel: testFeedback.difficultyLevel,
        questionQuality: testFeedback.questionQuality,
        wouldRecommend: testFeedback.wouldRecommend,
        comments: testFeedback.comments,
        createdAt: testFeedback.createdAt,
      })
      .from(testFeedback)
      .leftJoin(tests, eq(testFeedback.testId, tests.id))
      .orderBy(desc(testFeedback.createdAt));

    return NextResponse.json({ feedbacks: data });
  } catch (error) {
    console.error('Test Feedback API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
