import { getCachedCSATTests, getUserAttempts } from '@/features/tests/actions/submission';
import CSATPageClient from './CSATPageClient';
import { verifyAuth } from '@/lib/auth';
import { getUserTier, hasAccessToContent } from '@/lib/access-control';
import { getCachedAttemptLimits } from '@/app/admin/test-access/actions';

// Server Component — DB flags se access control
export default async function CSATPage() {
    const [tests, user, attemptLimits] = await Promise.all([
        getCachedCSATTests(),
        verifyAuth(),
        getCachedAttemptLimits()
    ]);

    const tier = getUserTier(user);
    const maxRetries = attemptLimits['CSAT'] ?? null;
    
    // User attempts fetch karo
    const testIds = tests.map(t => t.id);
    const attempts = await getUserAttempts(testIds);

    // Har test ko access info ke saath enrich karo
    const enrichedTests = tests.map((test) => {
        const hasAccess = user?.role === 'admin' || hasAccessToContent(
            { isFreeAccess: test.isFreeAccess, isLiteAccess: test.isLiteAccess, isProAccess: test.isProAccess },
            tier
        );
        const attemptsCount = attempts[test.id] || 0;
        const attemptsLeft = maxRetries != null ? Math.max(0, maxRetries - attemptsCount) : null;

        return {
            ...test,
            isLocked: !hasAccess && !(test.isFreeAccess ?? false),
            isFree: (test.isFreeAccess ?? false) && !user, // Badge only for guests
            attemptsLeft: user ? attemptsLeft : null,
            maxRetries: user ? maxRetries : null,
        };
    });

    return <CSATPageClient initialTests={enrichedTests} />;
}
