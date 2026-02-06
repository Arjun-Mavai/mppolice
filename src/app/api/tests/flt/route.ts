import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tests, userAttempts } from '@/db/schema';
import { eq, desc, and, sql, inArray, asc } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
    try {
        // 1. Fetch FLTs
        const fltTests = await db.select()
            .from(tests)
            .where(eq(tests.type, 'FLT'))
            .orderBy(asc(tests.displayOrder));

        // Get user attempts if logged in
        const user = await verifyAuth();
        let userFLTAttempts: { testId: string; count: number }[] = [];

        if (user && fltTests.length > 0) {
            const testIds = fltTests.map(t => t.id);
            const attemptsData = await db.select({
                testId: userAttempts.testId,
                count: sql<number>`count(*)`
            })
            .from(userAttempts)
            .where(and(
                eq(userAttempts.userId, user.id),
                inArray(userAttempts.testId, testIds)
            ))
            .groupBy(userAttempts.testId);

            userFLTAttempts = attemptsData.map(a => ({
                testId: a.testId,
                count: Number(a.count)
            }));
        }

        return NextResponse.json({
            success: true,
            tests: fltTests,
            attempts: userFLTAttempts
        });
    } catch (error) {
        console.error('FLT fetch error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch FLT tests',
            tests: [],
            attempts: []
        }, { status: 500 });
    }
}
