'use server';

import { db } from '@/db';
import { tests, userAttempts } from '@/db/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';
import { unstable_cache } from 'next/cache';

// Cache the unit tests query
const getCachedUnitTests = unstable_cache(
    async () => {
        return await db.select({
            id: tests.id,
            unitId: tests.unitId,
            title: tests.title,
            maxRetries: tests.maxRetries,
            totalQuestions: tests.totalQuestions
        })
        .from(tests)
        .where(eq(tests.type, 'UNIT'));
    },
    ['unit-tests-list'],
    { revalidate: 3600, tags: ['tests'] }
);

export async function getAvailableUnitTests() {
    const user = await verifyAuth();
    
    // 1. Fetch all UNIT tests (Cached)
    const allUnitTests = await getCachedUnitTests();

    if (allUnitTests.length === 0) return [];

    let attemptsMap = new Map<string, number>();

    // 2. If user exists, fetch their attempts
    if (user) {
        const testIds = allUnitTests.map(t => t.id);
        
        const attempts = await db.select({
            testId: userAttempts.testId,
            count: sql<number>`count(*)`
        })
        .from(userAttempts) // Changed from userAttempts to userAttempts (already imported)
        .where(
            and(
                eq(userAttempts.userId, user.id),
                inArray(userAttempts.testId, testIds)
            )
        )
        .groupBy(userAttempts.testId);

        attemptsMap = new Map(attempts.map(a => [a.testId, Number(a.count)]));
    }

    // 3. Construct Result Array
    return allUnitTests.map(test => ({
        ...test,
        attempts: attemptsMap.get(test.id) || 0,
        maxRetries: test.maxRetries || 5 // Default to 5 if null
    }));
}
