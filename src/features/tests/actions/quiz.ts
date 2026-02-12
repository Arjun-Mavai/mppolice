'use server';

import { db } from '@/db';
import { tests, userAttempts } from '@/db/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';
import { cachedData, CACHE } from '@/lib/cache';
import { getCachedAttemptLimits } from '@/app/admin/test-access/actions';

// Cache the unit tests query using our centralized policy (7 days)
const getCachedUnitTests = cachedData(
    async () => {
        return await db.select({
            id: tests.id,
            unitId: tests.unitId,
            title: tests.title,
            titleEn: tests.titleEn,
            totalQuestions: tests.totalQuestions,
            isFreeAccess: tests.isFreeAccess
        })
        .from(tests)
        .where(eq(tests.type, 'UNIT'));
    },
    ['unit-tests-list'],
    [CACHE.TESTS.TAGS.ALL]
);

export async function getAvailableUnitTests() {
    const [user, allUnitTests, attemptLimits] = await Promise.all([
        verifyAuth(),
        getCachedUnitTests(),
        getCachedAttemptLimits()
    ]);

    if (allUnitTests.length === 0) return [];

    const maxRetries = attemptLimits['UNIT'] ?? null;
    let attemptsMap = new Map<string, number>();

    // If user exists, fetch their attempts
    if (user) {
        const testIds = allUnitTests.map(t => t.id);
        
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

        attemptsMap = new Map(attempts.map(a => [a.testId, Number(a.count)]));
    }

    return allUnitTests.map((test, idx) => {
        const attemptsCount = attemptsMap.get(test.id) || 0;
        const attemptsLeft = maxRetries != null ? Math.max(0, maxRetries - attemptsCount) : null;
        
        // Simple tier limit for units (lite/pro vs free)
        const isPastLimit = idx >= (maxRetries || 999); // This is a bit arbitrary, let's use actual PLAN_LIMITS if possible
        // Actually, for Unit tests, we use PLAN_LIMITS in the client. 
        // Let's keep the client-side decision for "Locked due to tier" but allow isFreeAccess override from backend.
        
        return {
            ...test,
            attempts: attemptsCount,
            attemptsLeft: user ? attemptsLeft : null,
            maxRetries: maxRetries,
            isFree: (test.isFreeAccess ?? false) && !user,
            isFreeAccess: !!test.isFreeAccess
        };
    });
}
