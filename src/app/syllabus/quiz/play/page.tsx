import { redirect } from 'next/navigation';
import { getTestWithQuestions, getUserAttempts } from '@/actions/test-actions';
import { QuizPlayClient } from './QuizPlayClient';
import { verifyAuth } from '@/lib/auth';
import { PLAN_LIMITS } from '@/config/plans';
import { Question } from '@/types/quiz';

interface PageProps {
    searchParams: Promise<{
        testId?: string;
        mode?: string;
    }>;
}

export default async function QuizPlayPage({ searchParams }: PageProps) {

    const params = await searchParams;
    console.log("params", params);
    const { testId, mode } = params;

    if (!testId) {
        redirect('/syllabus/quiz');
    }

    // 1. Fetch Test and User Data in Parallel
    const [testData, user] = await Promise.all([
        getTestWithQuestions(testId),
        verifyAuth()
    ]);

    if (!testData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-[80px]">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-slate-900">Test Not Found</h1>
                    <p className="text-slate-500">The requested test could not be found.</p>
                </div>
            </div>
        );
    }

    // 2. Map Questions to correct type
    const questions: Question[] = testData.questions.map((q) => {
        // Ensure options are parsed if they come as a stringified array
        const parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;

        return {
            ...q,
            question: q.questionText,
            questionEn: (testData.type === 'CSAT' && (!q.questionTextEn || q.questionTextEn.trim().toLowerCase() === 'n/a' || q.questionTextEn.trim().toLowerCase() === 'na')) 
                        ? q.questionText 
                        : (q.questionTextEn || undefined),
            correctAnswer: Number(q.correctAnswer), 
            options: parsedOptions as string[], // Cast assumes standard string[] options for now
            explanation: q.explanation || undefined,
            explanationEn: q.explanationEn || undefined,
            subject: q.subject || undefined,
            type: (q.type as 'standard' | 'matching') || 'standard',
            matchPairs: (q.matchPairs as any) || undefined,
            negativeMarks: q.negativeMarks ?? undefined,
            marks: q.marks ?? undefined
        };
    });

    // 3. Determine Access / Paywall Logic
    const userTier = user?.planTier || 'free';
    const effectiveTier = !user ? 'guest' : (user.isSubscribed ? (userTier === 'free' ? 'lite' : userTier) : 'free');
    
    // Limits
    // Note: This page is for PLAYING. The limit check usually happens on the listing page (FLTPage).
    // However, for direct link access, we should re-verify or rely on "Access Denied" if locked.
    // Current requirement: "FLT page client hydration issue... sab kuch server se karo".
    // For this specific 'Play' page, we might want to ensure they CAN play.
    
    // Logic from FLT Page:
    // limit = PLAN_LIMITS[effectiveTier].flt_limit
    // isOpen = index < limit.
    // But here we rely on testId. We don't know the index easily without fetching ALL tests.
    // Optimization: If it's an FLT, maybe we should just check subscription for now, 
    // OR we trust the "Locked" UI on the previous page prevented entry.
    // BUT direct navigation is possible.
    
    // Simplification for 'Principal Engineer' robustness:
    // If it's an FLT and user is NOT Pro/Lite (depending on specific logic), maybe show paywall.
    // But `displayOrder` is key.
    // Let's assume for now valid entry if they got here, BUT check `isPro` for the test itself.
    
    const isProUser = user?.isSubscribed || false;
    
    // If test is marked isPro and user is not subscribed -> Paywall
    // OR if test is FLT and user is Free -> Paywall (typically FLT are premium except demo)
    
    let shouldShowPaywall = false;
    
    // Very basic check: If test.isPro && !isProUser
    if (testData.isPro && !isProUser) {
        shouldShowPaywall = true;
    }
    
    // 4. Content Logic (Attempts)
    const attemptsMap = await getUserAttempts([testId]);
    const userAttemptsCount = attemptsMap[testId] || 0;
    
    return (
        <QuizPlayClient 
            questions={questions}
            mode={(mode as 'topic' | 'full' | 'pyq') || 'topic'} // Default to topic if undefined
            testId={testId}
            userId={user?.id || null}
            maxRetries={testData.maxRetries}
            userAttempts={userAttemptsCount}
            isPro={isProUser}
            shouldShowPaywall={shouldShowPaywall}
        />
    );
}
