'use server';

import { db } from '@/db';
import { testLeaderboard, tests } from '@/db/schema';
import { eq, desc, asc, sql, and } from 'drizzle-orm';
import { FAKE_USERS } from '@/data/fakeUsers';

type LeaderboardEntry = typeof testLeaderboard.$inferSelect;

// Bhai, ye function ekdum raapchik hai via optimization!
// Top 10 uthayega aur user ka rank count karega bina DB ko load diye via N+1 logic.
export async function getTestLeaderboard(testId: string, userId?: string) {
  // 1. Pehle check karlo ki koi entries hain bhi ya nahi (Full scan bachane ke liye)
  const countResult = await db.select({ count: sql<number>`count(*)` })
    .from(testLeaderboard)
    .where(eq(testLeaderboard.testId, testId));
  
  const totalParticipants = countResult[0]?.count || 0;

  // 2. Agar koi nahi hai (ya kam log hain), toh nakli public (Fake Users) bhar do - Maahol banane ke liye!
  // Bhai, kam se kam 10 log hone chahiye competition feel karane ke liye.
  if (totalParticipants < 10) {
    await generateFakeLeaderboard(testId);
    return getTestLeaderboard(testId, userId); // Vaapas bulao function ko
  }
  
  // 3. Sirf Top 10 Khiladis ko uthao - Efficiency ka Mamla hai bhai!
  const topTenEntries = await db.select()
    .from(testLeaderboard)
    .where(eq(testLeaderboard.testId, testId))
    .orderBy(desc(testLeaderboard.score), asc(testLeaderboard.timeTakenSeconds))
    .limit(10);
    
  // Unko rank assign karo (1 se 10 taak)
  const rankedTopTen = topTenEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));

  // 4. Ab User ka hisaab lagate hain (Agar user ID diya hai toh)
  let userRank = null;
  let userEntry: LeaderboardEntry | null = null;
  
  if (userId) {
     // Pehle dekho user Top 10 mein hai kya?
     const userIndexInTop10 = rankedTopTen.findIndex(e => e.userId === userId);
     
     if (userIndexInTop10 !== -1) {
         // Agar Top 10 mein hai, toh wahi se data utha lo - DB Query bacha li bhai!
         userRank = userIndexInTop10 + 1;
         userEntry = rankedTopTen[userIndexInTop10];
     } else {
         // Top 10 mein nahi hai, toh alag se dhoondo
         const specificUserEntry = await db.query.testLeaderboard.findFirst({
             where: (leaderboard, { and, eq }) => and(
                 eq(leaderboard.testId, testId),
                 eq(leaderboard.userId, userId)
             )
         });

         if (specificUserEntry) {
             userEntry = specificUserEntry;
             
             // Ab Count Query maar kar Rank nikaalo - Sabse Optimized tareeka!
             // Rank = (Users with more score) + (Users with same score but less time) + 1
             const rankQuery = await db.select({ count: sql<number>`count(*)` })
                 .from(testLeaderboard)
                 .where(and(
                     eq(testLeaderboard.testId, testId),
                     sql`(${testLeaderboard.score} > ${specificUserEntry.score} OR (${testLeaderboard.score} = ${specificUserEntry.score} AND ${testLeaderboard.timeTakenSeconds} < ${specificUserEntry.timeTakenSeconds}))`
                 ));
             
             userRank = (rankQuery[0]?.count || 0) + 1;
             
             // Bhai, userEntry mein rank manually daal do ab
             userEntry = { ...userEntry, rank: userRank };
         }
     }
  }
  
  return {
    leaderboard: rankedTopTen, // Sirf cream layer (Top 10)
    fullLeaderboard: [], // Iski zarurat nahi hai ab, load mat lo
    userRank,
    userEntry,
    totalParticipants
  };
}

// Helper to generate random time between min and max seconds
const randomTime = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

async function generateFakeLeaderboard(testId: string) {
  // Get test info to know total marks
  const test = await db.query.tests.findFirst({
    where: eq(tests.id, testId)
  });
  
  const totalMarks = test?.totalMarks || 20; // Default to 20 if not found
  
  // Generate 50 fake entries
  const fakeEntries = FAKE_USERS.map((user, index) => {
    let percentage;
    
    // Distribution Logic
    if (index < 5) {
      // Top 10% (5 users) - Very high scores (80-100%)
      percentage = 80 + Math.random() * 20; 
    } else if (index < 20) {
      // Next 30% (15 users) - Good scores (60-80%)
      percentage = 60 + Math.random() * 20;
    } else if (index < 40) {
      // Next 40% (20 users) - Average scores (40-60%)
      percentage = 40 + Math.random() * 20;
    } else {
      // Bottom 20% (10 users) - Low scores (20-40%)
      percentage = 20 + Math.random() * 20;
    }
    
    // Calculate raw score based on percentage
    let rawScore = (percentage / 100) * totalMarks;
    // Round to nearest 0.5 for realistic marking
    rawScore = Math.round(rawScore * 2) / 2;
    
    // Ensure accurate percentage based on rounded score
    const finalPercentage = (rawScore / totalMarks) * 100;
    
    // Dynamic Time Calculation based on Test Duration
    // Bhai, ab time bhi asli lagega! Test ke duration ka 50% se 98% tak randomly lenge.
    const durationMinutes = test?.durationMinutes || 15;
    const totalDurationSeconds = durationMinutes * 60;
    
    // Minimum 50% time (Fastest valid attempt) -> Maximum 98% (Just made it)
    const minSeconds = Math.floor(totalDurationSeconds * 0.5);
    const maxSeconds = Math.floor(totalDurationSeconds * 0.98);

    const timeTaken = randomTime(minSeconds, maxSeconds);
    
    return {
      id: `fake_${testId}_${index}_${Date.now()}`,
      testId,
      userId: null, // Fake users have no real userId
      displayName: user.name,
      score: rawScore,
      percentage: finalPercentage,
      timeTakenSeconds: timeTaken,
      rank: 0, // Will be calculated dynamically
      isFake: 1,
      createdAt: new Date()
    };
  });
  
  // Bulk insert
  if (fakeEntries.length > 0) {
      await db.insert(testLeaderboard).values(fakeEntries);
  }
}

export async function insertUserToLeaderboard(data: {
    testId: string;
    userId: string;
    displayName: string;
    score: number;
    timeTaken: number;
    totalMarks?: number;
}) {
    const { testId, userId, displayName, score, timeTaken, totalMarks = 20 } = data;
    
    const percentage = (score / totalMarks) * 100;

    // Check if user already exists in leaderboard for this test
    const existingEntry = await db.query.testLeaderboard.findFirst({
        where: (leaderboard, { and, eq }) => and(
            eq(leaderboard.testId, testId),
            eq(leaderboard.userId, userId)
        )
    });

    if (existingEntry) {
        // Update existing entry if score is higher
        if (score > existingEntry.score) {
             await db.update(testLeaderboard)
                .set({
                    score,
                    percentage,
                    timeTakenSeconds: timeTaken,
                    createdAt: new Date() // Update timestamp to show recent activity
                })
                .where(eq(testLeaderboard.id, existingEntry.id));
        }
        // If score is same but time is better? Optional.
    } else {
        // Insert new entry
        await db.insert(testLeaderboard).values({
            id: crypto.randomUUID(),
            testId,
            userId,
            displayName,
            score,
            percentage,
            timeTakenSeconds: timeTaken,
            rank: 0, // Calculated on read
            isFake: 0,
            createdAt: new Date()
        });
    }
}
