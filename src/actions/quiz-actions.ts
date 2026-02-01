'use server';

import { db } from '@/db';
import { tests, userAttempts } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';

export async function getUnitStats() {
    const user = await verifyAuth();
    if (!user) return {};

    // Fetch all UNIT tests
    const allUnitTests = await db.select({
        id: tests.id,
        unitId: tests.unitId,
        maxRetries: tests.maxRetries
    })
    .from(tests)
    .where(eq(tests.type, 'UNIT'));

    const stats: Record<string, { attempts: number, maxRetries: number, testId: string }> = {};

    for (const test of allUnitTests) {
        if (!test.unitId) continue;

        const attemptCount = await db.select({ count: sql<number>`count(*)` })
            .from(userAttempts)
            .where(and(eq(userAttempts.userId, user.id), eq(userAttempts.testId, test.id)));
        
        const count = Number(attemptCount[0]?.count || 0);

        // If multiple tests exist for a unit (versions), we ideally aggregate or pick latest.
        // For now, assume one active test per unit or overwrite with latest.
        stats[test.unitId] = {
            attempts: count,
            maxRetries: test.maxRetries || 5, // Default 5 if null
            testId: test.id
        };
    }

    return stats;
}
