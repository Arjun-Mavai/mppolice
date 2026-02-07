'use server';

import { db } from '@/db';
import { testLeaderboard, tests } from '@/db/schema';
import { eq, desc, asc, sql, and } from 'drizzle-orm';
import { FAKE_USERS } from '@/data/fakeUsers';
import { questions } from '@/db/schema';
import { SCORING_CONFIG } from '@/lib/quiz-scoring';

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
  // Get accurate total marks based on question count
  const qCount = await db.select({ count: sql<number>`count(*)` })
      .from(questions)
      .where(eq(questions.testId, testId));
      
  const totalQuestions = qCount[0]?.count || 0;
  // Fallback to 20 questions if count fails, but aim for accuracy
  const totalMarks = totalQuestions > 0 ? totalQuestions * SCORING_CONFIG.MARKS_PER_QUESTION : 60; 
  
  // Randomize count between 45 and 80
  const minUsers = 45;
  const maxUsers = 80;
  const targetCount = Math.floor(Math.random() * (maxUsers - minUsers + 1)) + minUsers;
  
  // Generate fake entries
  const fakeEntries = [];
  
  for (let i = 0; i < targetCount; i++) {
       // Cycle through fake users if we need more than we have
       const baseUser = FAKE_USERS[i % FAKE_USERS.length];
       const displayName = i >= FAKE_USERS.length ? `${baseUser.name} ${i+1}` : baseUser.name;
       
       let percentage;
    
       // Distribution Logic - Bell Curve-ish
       if (i < targetCount * 0.1) {
         // Top 10% - Toppers (80-98%)
         percentage = 80 + Math.random() * 18; 
       } else if (i < targetCount * 0.4) {
         // Next 30% - Good scores (60-80%)
         percentage = 60 + Math.random() * 20;
       } else if (i < targetCount * 0.8) {
         // Next 40% - Average scores (35-60%)
         percentage = 35 + Math.random() * 25;
       } else {
         // Bottom 20% - Low scores (15-35%)
         percentage = 15 + Math.random() * 20;
       }
       
       // Calculate raw score based on percentage
       let rawScore = (percentage / 100) * totalMarks;
       
       // Round to reasonable steps (e.g. 0.33 or 1 or 0.5 depending on marking)
       // Since marks are 3 and neg is 1, scores are usually integers.
       rawScore = Math.round(rawScore);
       
       // Cap at totalMarks (Safety check)
       if (rawScore > totalMarks) rawScore = totalMarks;
       
       // Ensure accurate percentage based on rounds
       const finalPercentage = (rawScore / totalMarks) * 100;
       
       // Dynamic Time Calculation
       // Assume 20 mins (1200s) default if DB fetch fails, to save query
       // Or fetch test details if needed. For speed, we can assume standard times or fetch light.
       // Let's use a standard range per question. 
       // Fast: 30s/q, Slow: 90s/q.
       const estTimeSeconds = totalQuestions * 60; // 1 min per question avg
       const minSeconds = Math.floor(estTimeSeconds * 0.4); 
       const maxSeconds = Math.floor(estTimeSeconds * 0.95);
   
       const timeTaken = randomTime(minSeconds, maxSeconds);
       
       fakeEntries.push({
         id: `fake_${testId}_${i}_${Date.now()}`,
         testId,
         userId: null,
         displayName,
         score: rawScore,
         percentage: finalPercentage,
         timeTakenSeconds: timeTaken,
         rank: 0,
         isFake: 1,
         createdAt: new Date()
       });
  }
  
  // Bulk insert
  if (fakeEntries.length > 0) {
      // Chunking if massive (80 is fine for one go)
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
