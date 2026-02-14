import { getCachedFLTTests, getUserAttempts } from '@/features/tests/actions/submission';
import FLTPageClient, { TestWithAccess } from './FLTPageClient';
import { verifyAuth } from '@/lib/auth';
import { getUserTier, hasAccessToContent } from '@/lib/access-control';
import { getCachedAttemptLimits } from '@/app/admin/test-access/actions';

// Server Component — FLT tests ko DB flags se access control karta hai
export default async function FLTPage() {
    // 1. Parallel fetch — test list + current user + attempt limits
    const [tests, user, attemptLimits] = await Promise.all([
        getCachedFLTTests(),
        verifyAuth(),
        getCachedAttemptLimits()
    ]);
    
    // 2. User ke attempts fetch karo (kitni baar de chuka har test)
    const testIds = tests.map(t => t.id);
    const attempts = await getUserAttempts(testIds);

    // 3. User tier nikalo — DB flags is tier se match honge
    const tier = getUserTier(user);

    // Max attempts from attempt_limits table (source of truth)
    const maxRetries = attemptLimits['FLT'] ?? null;

    // 4. Har test ko access info ke saath enrich karo
    const enrichedTests: TestWithAccess[] = tests.map((test) => {
        const hasAccess = user?.role === 'admin' || hasAccessToContent(
            { isFreeAccess: test.isFreeAccess, isLiteAccess: test.isLiteAccess, isProAccess: test.isProAccess },
            tier
        );
        const isLocked = !hasAccess;
        const attemptsCount = attempts[test.id] || 0;
        const attemptsLeft = maxRetries != null ? Math.max(0, maxRetries - attemptsCount) : null;
        
        return {
            ...test,
            totalQuestions: test.totalQuestions || 0,
            isLocked: isLocked && !(test.isFreeAccess ?? false),
            isCompleted: attemptsLeft === 0,
            attemptsCount,
            attemptsLeft: user ? (attemptsLeft ?? 9999) : null,
            maxRetries: user ? maxRetries : null,
            isFree: (test.isFreeAccess ?? false) && !user
        };
    });
    
    return <FLTPageClient tests={enrichedTests} />;
}
