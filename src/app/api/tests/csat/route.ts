import { db } from '@/db';
import { tests, userAttempts } from '@/db/schema';
import { eq, and, desc, sql, inArray, asc } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await verifyAuth();
    const userId = user?.id;

    // 1. Fetch CSAT Tests
    const csatTests = await db
      .select()
      .from(tests)
      .where(and(eq(tests.type, 'CSAT'), eq(tests.isHidden, false)))
      .orderBy(asc(tests.displayOrder));

    let attemptsData: any[] = [];

    // 2. If user logged in, fetch attempts
    if (userId && csatTests.length > 0) {
      const testIds = csatTests.map((t) => t.id);

      attemptsData = await db
        .select({
          testId: userAttempts.testId,
          count: sql<number>`count(*)`,
        })
        .from(userAttempts)
        .where(and(eq(userAttempts.userId, userId), inArray(userAttempts.testId, testIds)))
        .groupBy(userAttempts.testId);
    }

    return NextResponse.json({
      tests: csatTests,
      attempts: attemptsData,
    });
  } catch (error) {
    logger.error('Error fetching CSAT tests:', error);
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
  }
}
