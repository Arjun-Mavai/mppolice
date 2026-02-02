'use server';

import { db } from '@/db';
import { tests, userAttempts } from '@/db/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';
import { unstable_cache } from 'next/cache';

// Cache the unit tests query as it rarely changes
const getCachedUnitTests = unstable_cache(
    async () => {
        return await db.select({
            id: tests.id,
            unitId: tests.unitId,
            maxRetries: tests.maxRetries
        })
        .from(tests)
        .where(eq(tests.type, 'UNIT'));
    },
    ['unit-tests-list'],
    { revalidate: 3600, tags: ['tests'] }
);

export async function getUnitStats() {
    const user = await verifyAuth();
    if (!user) return {};

    // 1. Fetch all UNIT tests (Cached)
    const allUnitTests = await getCachedUnitTests();

    if (allUnitTests.length === 0) return {};

    // 2. Extract Test IDs
    const testIds = allUnitTests.map(t => t.id);

    // 3. Batch Fetch User Attempts -> Single Query
    const attempts = await db.select({
        testId: userAttempts.testId,
        count: sql<number>`count(*)`
    })
    .from(userAttempts)
    .where(
        and(
            eq(userAttempts.userId, user.id),
            inArray(userAttempts.testId, testIds) // Safe because we checked length > 0
        )
    )
    .groupBy(userAttempts.testId);

    // 4. Create Map for O(1) Lookup
    const attemptsMap = new Map(attempts.map(a => [a.testId, Number(a.count)]));

    // 5. Construct Result
    const stats: Record<string, { attempts: number, maxRetries: number, testId: string }> = {};

    for (const test of allUnitTests) {
        if (!test.unitId) continue;
        
        // Use the map instead of a DB query
        stats[test.unitId] = {
            attempts: attemptsMap.get(test.id) || 0,
            maxRetries: test.maxRetries || 5,
            testId: test.id
        };
    }

    return stats;
}
