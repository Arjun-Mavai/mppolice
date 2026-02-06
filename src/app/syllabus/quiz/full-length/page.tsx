import { getCachedFLTTests, getUserAttempts } from '@/actions/test-actions';
import FLTPageClient, { TestWithAccess } from './FLTPageClient';
import { verifyAuth } from '@/lib/auth';
import { PLAN_LIMITS } from '@/config/plans';

// Server Component
export default async function FLTPage() {
    // 1. Parallel Fetching
    const [tests, user] = await Promise.all([
        getCachedFLTTests(),
        verifyAuth()
    ]);
    
    // 2. Fetch Attempts (Dependent on User and Tests)
    const testIds = tests.map(t => t.id);
    const attempts = await getUserAttempts(testIds);

    // 3. Determine User Tier & Limits
    const userTier = user?.planTier || 'free';
    const effectiveTier = !user ? 'guest' : (user.isSubscribed ? (userTier === 'free' ? 'lite' : userTier) : 'free');
    const limit = PLAN_LIMITS[effectiveTier as keyof typeof PLAN_LIMITS]?.flt_limit || 0;

    // 4. Map Data
    const enrichedTests: TestWithAccess[] = tests.map((test, index) => {
        const isLocked = index >= limit;
        const attemptsCount = attempts[test.id] || 0;
        const maxRetries = test.maxRetries || 3;
        const attemptsLeft = Math.max(0, maxRetries - attemptsCount);
        
        return {
            ...test,
            totalQuestions: test.totalQuestions || 0, // Handle null
            isLocked,
            isCompleted: attemptsLeft === 0,
            attemptsCount,
            attemptsLeft,
            maxRetries,
            // Logic: "Free" badge shows for open tests that are free, typically the first one for non-subscribers
            showFreeBadge: !isLocked && (!user?.isSubscribed) && index === 0
        };
    });
    
    return <FLTPageClient tests={enrichedTests} />;
}
