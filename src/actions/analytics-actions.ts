'use server'

import { db } from '@/db';
import { userAttempts, tests, questions, attemptAnswers } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { unstable_cache, revalidateTag } from "next/cache";
import { verifyAuth } from '@/lib/auth';

// Cache Analytics per user for 5 minutes to avoid DB spam on refresh
export const getUserAnalytics = async (userId: string) => {
    if (!userId) return null;

    const getCachedAnalytics = unstable_cache(
        async (uid: string) => {
             // ... The entire logic ...
             return await fetchAnalyticsInternal(uid);
        },
        [`user-analytics-${userId}`],
        { revalidate: 300, tags: [`analytics-${userId}`] }
    );
    
    return await getCachedAnalytics(userId);
}

// Action to explicitly revalidate analytics cache (for Client Components)
export async function revalidateAnalyticsAction() {
    const user = await verifyAuth();
    if (user) {
        revalidateTag(`analytics-${user.id}`,{expire:0});
    }
}

// Extracted internal function
async function fetchAnalyticsInternal(userId: string) {
    try {
        // 1. Fetch all completed attempts for the user
        const attempts = await db.select({
            id: userAttempts.id,
            score: userAttempts.score,
            testId: userAttempts.testId,
            testTitle: tests.title,
            unitId: tests.unitId,
            topicId: tests.topicId, // Needed for server-side name resolution
            type: tests.type, // Added for categorization
            tags: tests.tags,
            totalMarks: tests.totalMarks,
            createdAt: userAttempts.endTime,
            startTime: userAttempts.startTime,
            endTime: userAttempts.endTime,
            durationMinutes: tests.durationMinutes
        })
        .from(userAttempts)
        .leftJoin(tests, eq(userAttempts.testId, tests.id))
        .where(eq(userAttempts.userId, userId));

        if (!attempts.length) {
            return {
                overallScore: 0,
                totalTests: 0,
                mastery: [],
                recentActivity: [],
                aiSuggestion: "Start your first test to get personalized insights!"
            };
        }

        // 2. Calculate Overall Stats
        let totalPercentage = 0;
        let validAttemptsCount = 0;

        // 3. Granular Analysis by Subject (Question Level)
        const attemptIds = attempts.map(a => a.id);
        
        let subjectStats: Record<string, { totalScore: number, totalMax: number, count: number, name: string }> = {};
        
        if (attemptIds.length > 0) {
            // Limit to last 50 attempts for performance optimization
            const recentAttemptIds = attemptIds.slice(0, 50);

            // Optimized query: Use inArray instead of raw SQL IN for safety and better Drizzle support
            const answersData = await db.select({
                isCorrect: attemptAnswers.isCorrect,
                marks: questions.marks,
                subject: questions.subject
            })
            .from(attemptAnswers)
            .leftJoin(questions, eq(attemptAnswers.questionId, questions.id))
            .where(inArray(attemptAnswers.attemptId, recentAttemptIds));
            
            answersData.forEach(ans => {
                const marks = ans.marks || 0;
                // Only process if marks are valid numbers
                if (typeof marks === 'number') {
                    const subject = ans.subject || 'General';
                    if (!subjectStats[subject]) {
                        subjectStats[subject] = { totalScore: 0, totalMax: 0, count: 0, name: subject };
                    }
                    
                    subjectStats[subject].totalMax += marks;
                    if (ans.isCorrect) {
                        subjectStats[subject].totalScore += marks;
                    }
                    subjectStats[subject].count++;
                }
            });
        }
        
        attempts.forEach(attempt => {
            if (attempt.totalMarks && attempt.totalMarks > 0) {
                const percentage = ((attempt.score || 0) / attempt.totalMarks) * 100;
                totalPercentage += percentage;
                validAttemptsCount++;
            }
        });

        const overallAvg = validAttemptsCount > 0 ? Math.round(totalPercentage / validAttemptsCount) : 0;

        // 4. Format Mastery Data
        const mastery = Object.entries(subjectStats)
            .map(([id, data]) => {
                const percentage = data.totalMax > 0 ? Math.round((data.totalScore / data.totalMax) * 100) : 0;
                return {
                    id,
                    name: data.name,
                    percentage,
                    count: data.count,
                    status: percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : percentage >= 40 ? 'Average' : 'Weak',
                    color: percentage >= 80 ? 'emerald' : percentage >= 60 ? 'amber' : 'red'
                };
            })
            .sort((a, b) => b.percentage - a.percentage);

        // 5. Generate AI Suggestion
        const sortedMastery = [...mastery].sort((a, b) => a.percentage - b.percentage);
        const weakest = sortedMastery[0];
        const strongest = sortedMastery[sortedMastery.length - 1];
        
        let aiSuggestion = "";
        
        if (!weakest) {
            aiSuggestion = "Great start! Take more tests to build your mastery profile. We'll analyze your performance to give specific tips.";
        } else if (weakest.percentage < 40) {
            aiSuggestion = `Urgent: You need to focus on "${weakest.name}". Your accuracy is currently at a critical level (${weakest.percentage}%). Re-read the revision cards for this unit before taking another test.`;
        } else if (weakest.percentage < 60) {
            aiSuggestion = `Focus Area: Your performance in "${weakest.name}" is below average. Try practicing topic-specific quizzes to bridge the gap. You're doing great in ${strongest?.name || 'others'} though!`;
        } else if (weakest.percentage < 80) {
            aiSuggestion = `Optimization: You're doing well, but "${weakest.name}" could use some polish to reach excellence. Aim for 80%+ mastery across all topics.`;
        } else {
            aiSuggestion = `Expert Level: You've mastered all current topics with 80%+ accuracy! Keep the momentum going by taking Full Length Tests (FLTs) to simulate the real exam pressure.`;
        }

        // Deduplicate attempts - Keep only the LATEST attempt for each testId
        // User requested: "Recent history me sab test dikhe" but "jo latest attempt ho wahi rakhna h" (Keep only latest attempt of each unique test).
        const uniqueAttemptsMap = new Map();
        // Sort by date desc first so the first one we see is the latest
        attempts.sort((a,b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        
        attempts.forEach(a => {
            if (!uniqueAttemptsMap.has(a.testId)) {
                uniqueAttemptsMap.set(a.testId, a);
            }
        });
        
        // Use server data to enrich history with proper Topic & Unit names
        const { getSyllabusTopics } = await import('./getSyllabusTopics');
        const syllabusRes = await getSyllabusTopics();
        const topicMap = new Map<string, any>();
        
        if (syllabusRes.success && syllabusRes.data) {
             Object.values(syllabusRes.data).flat().forEach((t: any) => {
                 topicMap.set(t.id, t);
             });
        }

        const recentActivity = Array.from(uniqueAttemptsMap.values()).map((activity: any) => {
             const unitId = activity.unitId || 'unknown';
             
             // 1. Generate Dynamic Unit Name (e.g. "Unit 1") matches quiz/topic/page.tsx logic
             let unitName = 'Miscellaneous';
             if (unitId !== 'unknown') {
                 const unitIndex = parseInt(unitId.replace('unit_', '')) || 0;
                 unitName = `Unit ${unitIndex}`;
             }

             // 2. Resolve Dynamic Topic Name from DB
             let displayTitle = activity.testTitle;
             if (activity.topicId && topicMap.has(activity.topicId)) {
                 const topic = topicMap.get(activity.topicId);
                 // Prefer English title or Fallback to generic title
                 displayTitle = topic.titleEn || topic.title || activity.testTitle;
             }
             
             // 3. Time Calculations
             let timeTakenFormatted = "0m";
             let totalDurationFormatted = `${activity.durationMinutes || 0}m`;
             
             if (activity.startTime && activity.endTime) {
                 const start = new Date(activity.startTime).getTime();
                 const end = new Date(activity.endTime).getTime();
                 const diffSeconds = Math.max(0, Math.round((end - start) / 1000));
                 
                 const takenMinutes = Math.floor(diffSeconds / 60);
                 const takenSeconds = diffSeconds % 60;
                 
                 if (takenMinutes > 0) {
                     timeTakenFormatted = `${takenMinutes}m`;
                 } else {
                     timeTakenFormatted = `${takenSeconds}s`;
                 }
             }

             return {
                 ...activity,
                 unitName,
                 testTitle: displayTitle,
                 // Ensure unitId is preserved for grouping
                 unitId,
                 timeTaken: timeTakenFormatted,
                 totalDuration: totalDurationFormatted
             };
        });

        return {
            overallScore: overallAvg,
            totalTests: attempts.length, // Total tests is total attempts (or unique? User said "jo latest h usi ko store karna h". Assuming total tests count is unique tests taken? Let's keep attempts.length for Total Count as "Tests Taken" usually means attempts. But Recent History needs unique.)
            // Actually, "Tests Taken" usually implies total attempts. But "Recent History" shows unique tests. 
            // If user took Test A 5 times, History shows Test A (latest).
            mastery,
            recentActivity: recentActivity, 
            aiSuggestion
        };

    } catch (error) {
        console.error("Analytics Error:", error);
        return null;
    }
}

export async function getAttemptDetails(attemptId: string) {
    if (!attemptId) return null;

    try {
        // 1. Fetch Attempt Meta
        const attempt = await db.select({
            id: userAttempts.id,
            score: userAttempts.score,
            testId: userAttempts.testId,
            testTitle: tests.title,
            totalMarks: tests.totalMarks,
            endTime: userAttempts.endTime,
            startTime: userAttempts.startTime
        })
        .from(userAttempts)
        .leftJoin(tests, eq(userAttempts.testId, tests.id))
        .where(eq(userAttempts.id, attemptId))
        .limit(1);

        if (!attempt[0]) return null;

        // 2. Fetch Questions (ALL questions for the test)
        const allQuestions = await db.select({
             id: questions.id,
             questionText: questions.questionText,
             questionTextEn: questions.questionTextEn,
             options: questions.options,
             correctAnswer: questions.correctAnswer,
             explanation: questions.explanation,
             explanationEn: questions.explanationEn,
             idealTime: questions.idealTime,
             order: questions.order,
             marks: questions.marks, // Ensure marks are available
             negativeMarks: questions.negativeMarks // Ensure negativeMarks are available
        })
        .from(questions)
        .where(eq(questions.testId, attempt[0].testId))
        .orderBy(questions.order);

        // 3. Fetch User Answers 
        const userAnswers = await db.select()
        .from(attemptAnswers)
        .where(eq(attemptAnswers.attemptId, attemptId));

        // 4. Map answers to questions
        const answersMap = new Map(userAnswers.map(a => [a.questionId, a]));

        const combinedData = allQuestions.map(q => {
            const ua = answersMap.get(q.id);
            return {
                id: ua?.id || crypto.randomUUID(), // Placeholder ID for skipped
                questionId: q.id,
                userAnswer: ua ? ua.userAnswer : null, // null if skipped
                isCorrect: ua ? ua.isCorrect : false,
                timeTaken: ua ? ua.timeTakenSeconds : 0,
                questionText: q.questionText,
                questionTextEn: q.questionTextEn,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                explanationEn: q.explanationEn,
                idealTime: q.idealTime,
                marks: q.marks,
                negativeMarks: q.negativeMarks
            };
        });

        return {
            meta: attempt[0],
            answers: combinedData
        };

    } catch (error) {
        console.error("Fetch Attempt Details Error:", error);
        return null;
    }
}
