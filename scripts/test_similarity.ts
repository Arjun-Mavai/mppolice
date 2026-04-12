
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/db/schema';
import { tests, questions } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getScopedStateServiceYear } from '@/features/tests/utils/pyq-scope';

// Mock DB connection for script
const client = createClient({
  url: 'file:mppolice_local.db',
});
const db = drizzle(client, { schema });

const PYQ_SCOPE_START_YEAR = 2020;
const PYQ_SCOPE_END_YEAR = 2025;

// Simple stop words list (English + Hindi transliterated/common)
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'of', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after',
  'ka', 'ki', 'ke', 'hai', 'tha', 'thi', 'the', 'ko', 'se', 'me', 'mein', 'par', 'aur', 'evam', 'tatha', 'kya', 'kaun', 'kis',
  'nimn', 'likhit', 'nimnalikhit', 'kathan', 'sahi', 'galat', 'hai', 'h', 'question', 'answer', 'option', 'match', 'following', 'consider', 'statements', 'regarding', 'which', 'correct', 'incorrect'
]);

function getTokens(text: string): Set<string> {
    const clean = text.toLowerCase()
      .replace(/[^\w\u0900-\u097F\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(t => t.length > 2 && !STOP_WORDS.has(t));
      
    return new Set(clean);
}

function calculateJaccard(text1: string, text2: string): number {
    const t1 = getTokens(text1 || '');
    const t2 = getTokens(text2 || '');
    
    if (t1.size === 0 || t2.size === 0) return 0;
    
    let intersection = 0;
    for (const token of t1) {
        if (t2.has(token)) intersection++;
    }
    
    const union = new Set([...t1, ...t2]).size;
    return intersection / union;
}

async function run() {
    console.log('Fetching questions...');
    
    const pyqTests = await db.select({
      id: tests.id,
      title: tests.title,
      type: tests.type,
      totalQuestions: tests.totalQuestions,
    }).from(tests).where(eq(tests.type, 'PYQ'));

    const testYearMap = new Map<string, number>();
    const testsByYear = new Map<number, any[]>(); // using any[] for quick fix

    for (const t of pyqTests) {
      const year = getScopedStateServiceYear(t.title);
      if (year && year >= PYQ_SCOPE_START_YEAR && year <= PYQ_SCOPE_END_YEAR) {
        if (!testsByYear.has(year)) testsByYear.set(year, []);
        testsByYear.get(year)!.push(t);
      }
    }
    
    // Select Canonical
    const selectedTestIds = new Set<string>();
    for (const [year, candidates] of testsByYear.entries()) {
        candidates.sort((a, b) => {
            const isHindiA = a.title.includes('MP Police राज्य सेवा');
            const isHindiB = b.title.includes('MP Police राज्य सेवा');
            if (isHindiA && !isHindiB) return -1;
            if (!isHindiA && isHindiB) return 1;
            return (b.totalQuestions || 0) - (a.totalQuestions || 0);
        });
        if (candidates.length > 0) {
            const bestTest = candidates[0];
            testYearMap.set(bestTest.id, year);
            selectedTestIds.add(bestTest.id);
        }
    }

    const testIdArray = Array.from(selectedTestIds);
    if (testIdArray.length === 0) {
        console.log("No tests found");
        return;
    }

    const allQuestions = await db.select({
      id: questions.id,
      testId: questions.testId,
      text: questions.questionText,
      order: questions.order,
    }).from(questions).where(inArray(questions.testId, testIdArray));

    console.log(`Analyzing ${allQuestions.length} questions from ${selectedTestIds.size} years...`);

    const matches = [];
    
    for (let i = 0; i < allQuestions.length; i++) {
        for (let j = i + 1; j < allQuestions.length; j++) {
            const q1 = allQuestions[i];
            const q2 = allQuestions[j];
            
            // Skip same year
            if (q1.testId === q2.testId) continue;

            const y1 = testYearMap.get(q1.testId)!;
            const y2 = testYearMap.get(q2.testId)!;

            // EXCLUDE 2024-2025 pairs for now to see other years
            if ((y1 === 2024 && y2 === 2025) || (y1 === 2025 && y2 === 2024)) continue;
            
            const sim = calculateJaccard(q1.text || '', q2.text || '');
            if (sim > 0.3) { // Lower threshold for other years
                 matches.push({
                     q1: q1.text?.substring(0, 50),
                     y1: y1,
                     q2: q2.text?.substring(0, 50),
                     y2: y2,
                     score: sim.toFixed(2)
                 });
            }
        }
    }
    
    console.log(`Found ${matches.length} potential matches with > 0.4 similarity.`);
    matches.sort((a,b) => parseFloat(b.score) - parseFloat(a.score));
    console.log(JSON.stringify(matches.slice(0, 20), null, 2));
}

run().catch(console.error);
