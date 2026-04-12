
import 'dotenv/config';
import { db } from '../src/db/index';
import { sql } from 'drizzle-orm';
import { questions, tests, pyqQuestionTopics, pyqTopics } from '../src/db/schema';
import { eq, inArray, like } from 'drizzle-orm';

// 1. Define Scope (2020-2025)
const SCOPE = [2020, 2021, 2022, 2023, 2024, 2025];

// Stop Words (Hindi + English)
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'of', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'with', 'by', 'from', 'which', 'correct', 'incorrect', 'following', 'statements', 'regarding', 'consider', 'match', 'option', 'question', 'answer',
  'ka', 'ki', 'ke', 'hai', 'tha', 'thi', 'the', 'ko', 'se', 'me', 'mein', 'par', 'aur', 'evam', 'tatha', 'kya', 'kaun', 'kis', 'nimn', 'likhit', 'nimnalikhit', 'kathan', 'sahi', 'galat', 'h',
  'है', 'हैं', 'था', 'थी', 'थे', 'का', 'की', 'के', 'को', 'से', 'में', 'पर', 'और', 'एवं', 'तथा', 'क्या', 'कौन', 'किस', 'निम्नलिखित', 'कथनों', 'कथन', 'विचार', 'कीजिए', 'सही', 'गलत', 'उत्तर', 'दीजिए', 'विकल्प', 'सुमेलित', 'कौनसा', 'नहीं', 'एक', 'यह', 'वह', 'वे', 'करते', 'होता', 'होती', 'होते', 'दिया', 'गया'
]);

// Helper to determine year from title (User's logic ported)
function getScopedStateServiceYear(title: string): number | null {
  const normalized = title.replace(/\s+/g, ' ').trim();

  // English pattern
  const enMatch = normalized.match(/MP Police State Service Prelims.*? (20\d{2}).*?Paper 1/i);
  if (enMatch) return Number(enMatch[1]);

  // Hindi pattern
  const hiMatch = normalized.match(/MP Police राज्य सेवा प्रारंभिक.*? (20\d{2}).*?पेपर 1/);
  if (hiMatch) return Number(hiMatch[1]);

  return null;
}

function buildFtsQuery(text: string): string | null {
    if (!text) return null;
    const cleanWords = text.toLowerCase()
      .replace(/[^\w\u0900-\u097F\s]/g, '') // Keep alphanumeric + Hindi
      .split(/\s+/)
      .filter(t => t.length > 2 && !STOP_WORDS.has(t));
      
    if (cleanWords.length === 0) return null;
    return cleanWords.join(' OR '); 
}

async function runSmartAnalysis() {
  console.log('🔍 Starting Smart PYQ Analysis (2020-2025)...');

  // 1. Identify Canonical Tests
  const allTests = await db.select({ 
      id: tests.id, 
      title: tests.title,
      totalQuestions: tests.totalQuestions 
  }).from(tests);
  
  const testMap = new Map<number, string>(); // Year -> TestID
  const debugCounts: Record<number, number> = {};

  // Group candidates by year
  const candidatesByYear: Record<number, typeof allTests> = {};

  for (const t of allTests) {
    const year = getScopedStateServiceYear(t.title);
    if (year && SCOPE.includes(year)) {
        if (!candidatesByYear[year]) candidatesByYear[year] = [];
        candidatesByYear[year].push(t);
    }
  }

  // Select best candidate for each year
  for (const year of SCOPE) {
      const candidates = candidatesByYear[year] || [];
      if (candidates.length === 0) {
          console.warn(`⚠️  No paper found for ${year}!`);
          continue;
      }
      
      // Sort: Hindi title preferred (often main one), then higher question count
      candidates.sort((a, b) => {
          // Prefer 'MP Police State Service' clearly over others if ambiguous
          // Actually, our regex already filters for that.
          // Prefer one with ~100 questions.
          const diffA = Math.abs((a.totalQuestions || 0) - 100);
          const diffB = Math.abs((b.totalQuestions || 0) - 100);
          return diffA - diffB; // Closest to 100 wins
      });

      const selected = candidates[0];
      testMap.set(year, selected.id);
      console.log(`✅ ${year}: Found "${selected.title}" (${selected.totalQuestions} Qs)`);
  }

  const targetTestIds = Array.from(testMap.values());
  if (targetTestIds.length < 2) {
      console.error('❌ Not enough papers found for analysis.');
      return;
  }

  // 2. Fetch Questions
  const allQuestions = await db
    .select({
      id: questions.id,
      testId: questions.testId,
      text: questions.questionText,
      textEn: questions.questionTextEn,
      order: questions.order, 
    })
    .from(questions)
    .where(inArray(questions.testId, targetTestIds));

  console.log(`📊 Analyzing ${allQuestions.length} questions from ${targetTestIds.length} papers...`);

  const questionMap = new Map<string, typeof allQuestions[0]>();
  allQuestions.forEach(q => questionMap.set(q.id, q));

  // 3. FTS Search & Scoring
  const matches: any[] = [];
  const processedPairs = new Set<string>(); // avoid A-B and B-A duplicates

  for (const q1 of allQuestions) {
    const searchQuery = buildFtsQuery((q1.text || '') + ' ' + (q1.textEn || ''));
    if (!searchQuery) continue;

    // Search against entire FTS index (but we filter results later)
    // Removed "order" column as it's not in FTS table
    const similarQs = await db.all(sql`
        SELECT id, testId, questionText, bm25(questions_fts) as rank
        FROM questions_fts 
        WHERE questions_fts MATCH ${searchQuery}
        AND testId != ${q1.testId}
        ORDER BY rank
        LIMIT 5
    `);

    for (const q2Row of similarQs) {
         const q2Id = q2Row.id as string;
         const q2TestId = q2Row.testId as string;

         // Check if q2 is in our target scope
         if (!targetTestIds.includes(q2TestId)) continue;
         
         const q2 = questionMap.get(q2Id);
         if (!q2) continue; // Should technically not happen if in scope

         const id1 = q1.id;
         const id2 = q2.id;
         
         // Sort IDs to ensure canonical pair key
         const [minId, maxId] = id1 < id2 ? [id1, id2] : [id2, id1];
         const pairKey = `${minId}-${maxId}`;
         
         if (processedPairs.has(pairKey)) continue;
         processedPairs.add(pairKey);

         const score = Math.abs(Number(q2Row.rank));
         
         // Threshold: 5.0 seems safe based on debug (strong matches are >20)
         if (score > 5.0) {
             matches.push({
                 q1: { 
                     id: q1.id, 
                     text: q1.text, 
                     year: getYear(q1.testId, testMap), 
                     qNo: q1.order 
                 },
                 q2: { 
                     id: q2.id, 
                     text: q2.text || '', 
                     year: getYear(q2.testId, testMap), 
                     qNo: q2.order 
                 },
                 score: score
             });
         }
    }
  }

  // Sort by score (descending = stronger match)
  matches.sort((a,b) => b.score - a.score);
  
  console.log('\n--- Top Detected Repeats ---');
  matches.slice(0, 10).forEach((m, i) => {
      console.log(`\n${i+1}. [${m.q1.year} Q.${m.q1.qNo}] vs [${m.q2.year} Q.${m.q2.qNo}] (Score: ${m.score.toFixed(2)})`);
      console.log(`   Q1: ${m.q1.text.substring(0, 80)}...`);
      console.log(`   Q2: ${m.q2.text.substring(0, 80)}...`);
  });

  console.log('\n✅ Analysis Complete.');
  console.log(`Found ${matches.length} pairs with score > 5.0`);
  
  // Explanation of Algorithm
  console.log('\n--- Algorithm Explanation ---');
  console.log('1. Scope: Only questions from State Service Prelims (Paper 1) 2020-2025 were selected.');
  console.log('2. Indexing: Created a specialized search index (FTS5) aware of Hindi & English words.');
  console.log('3. Search: For each question, we searched for "similar" questions in other years.');
  console.log('4. Ranking: Used BM25 algorithm which gives higher score to rare words (e.g., "Brahmaputra") and ignores common words (e.g., "the", "hai").');
  console.log('5. Scoring: Matches with score > 5.0 are considered potential repeats.');
}

function getYear(testId: string, map: Map<number, string>): number {
    for (const [year, id] of map.entries()) {
        if (id === testId) return year;
    }
    return 0;
}

runSmartAnalysis().catch(console.error);
