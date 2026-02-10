import { getCachedCSATTests, getUserAttempts } from '@/features/tests/actions/submission';
import CSATPageClient from './CSATPageClient';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';

// Server Component — DB flags se access control
export default async function CSATPage() {
    const [tests, user] = await Promise.all([
        getCachedCSATTests(),
        verifyAuth()
    ]);

    const tier = getUserTier(user);

    // Har test ko access info ke saath enrich karo
    const enrichedTests = tests.map((test) => {
        const hasAccess = tier === 'pro'
            ? (test.isProAccess ?? true)
            : tier === 'lite'
                ? ((test.isLiteAccess ?? false) || (test.isFreeAccess ?? false))
                : (test.isFreeAccess ?? false);

        return {
            ...test,
            isLocked: !hasAccess && user?.role !== 'admin',
            showFreeBadge: (test.isFreeAccess ?? false) && !user?.isSubscribed,
        };
    });

    return <CSATPageClient initialTests={enrichedTests} />;
}
