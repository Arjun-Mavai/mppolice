import { getCachedFLTTests, getUserAttempts } from '@/features/tests/actions/submission';
import FLTPageClient, { TestWithAccess } from './FLTPageClient';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';

// Server Component — FLT tests ko DB flags se access control karta hai
export default async function FLTPage() {
    // 1. Parallel fetch — test list + current user ek saath lao
    const [tests, user] = await Promise.all([
        getCachedFLTTests(),
        verifyAuth()
    ]);
    
    // 2. User ke attempts fetch karo (kitni baar de chuka har test)
    const testIds = tests.map(t => t.id);
    const attempts = await getUserAttempts(testIds);

    // 3. User tier nikalo — DB flags is tier se match honge
    const tier = getUserTier(user);

    // 4. Har test ko access info ke saath enrich karo
    // Ab index-based locking nahi — DB flags se decide hota hai!
    const enrichedTests: TestWithAccess[] = tests.map((test) => {
        // DB flags se access check — admin panel se control hota hai
        const hasAccess = tier === 'pro' 
            ? (test.isProAccess ?? true)
            : tier === 'lite' 
                ? ((test.isLiteAccess ?? false) || (test.isFreeAccess ?? false))
                : (test.isFreeAccess ?? false);

        const isLocked = !hasAccess && user?.role !== 'admin';
        const attemptsCount = attempts[test.id] || 0;
        const maxRetries = test.maxRetries || 3;
        const attemptsLeft = Math.max(0, maxRetries - attemptsCount);
        
        return {
            ...test,
            totalQuestions: test.totalQuestions || 0,
            isLocked,
            isCompleted: attemptsLeft === 0,
            attemptsCount,
            attemptsLeft,
            maxRetries,
            // "Free" badge tab dikhe jab test free hai aur user subscriber nahi
            showFreeBadge: (test.isFreeAccess ?? false) && !user?.isSubscribed
        };
    });
    
    return <FLTPageClient tests={enrichedTests} />;
}
