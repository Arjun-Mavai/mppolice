'use server'

import { db } from '@/db';
import { userAttempts, tests, questions, attemptAnswers } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { syllabusData } from '@/data/syllabusData';

import { unstable_cache } from "next/cache";

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
            tags: tests.tags,
            totalMarks: tests.totalMarks,
            createdAt: userAttempts.endTime
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
            // Limit to last 50 attempts for performance
            const recentAttemptIds = attemptIds.slice(0, 50);

            const answersData = await db.select({
                isCorrect: attemptAnswers.isCorrect,
                marks: questions.marks,
                subject: questions.subject
            })
            .from(attemptAnswers)
            .leftJoin(questions, eq(attemptAnswers.questionId, questions.id))
            .where(sql`${attemptAnswers.attemptId} IN ${recentAttemptIds}`);
            
            answersData.forEach(ans => {
                const subject = ans.subject || 'General';
                if (!subjectStats[subject]) {
                    subjectStats[subject] = { totalScore: 0, totalMax: 0, count: 0, name: subject };
                }
                
                const marks = ans.marks || 0;
                subjectStats[subject].totalMax += marks;
                if (ans.isCorrect) {
                    subjectStats[subject].totalScore += marks;
                }
                subjectStats[subject].count++;
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

        return {
            overallScore: overallAvg,
            totalTests: attempts.length,
            mastery,
            recentActivity: attempts.sort((a,b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)), 
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

        // 2. Fetch Questions and User Answers
        const answers = await db.select({
            id: attemptAnswers.id,
            questionId: attemptAnswers.questionId,
            userAnswer: attemptAnswers.userAnswer,
            isCorrect: attemptAnswers.isCorrect,
            timeTaken: attemptAnswers.timeTakenSeconds, // Fetch actual time taken
            questionText: questions.questionText,
            questionTextEn: questions.questionTextEn, // Added
            options: questions.options,
            correctAnswer: questions.correctAnswer,
            explanation: questions.explanation,
            explanationEn: questions.explanationEn, // Added
            idealTime: questions.idealTime // Added
        })
        .from(attemptAnswers)
        .leftJoin(questions, eq(attemptAnswers.questionId, questions.id))
        .leftJoin(userAttempts, eq(attemptAnswers.attemptId, userAttempts.id)) // To get attempt context if needed
        .where(eq(attemptAnswers.attemptId, attemptId))
        .orderBy(questions.order);

        return {
            meta: attempt[0],
            answers
        };

    } catch (error) {
        console.error("Fetch Attempt Details Error:", error);
        return null;
    }
}
