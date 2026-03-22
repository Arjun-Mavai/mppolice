
import 'dotenv/config';
import { db } from '../src/db/index';
import { sql } from 'drizzle-orm';
import { questions, tests } from '../src/db/schema';
import { like } from 'drizzle-orm';

async function debugScores() {
  console.log('🔍 Debugging FTS Scores...');

  // 1. Get a sample question from 2024
  const q2024 = await db.query.questions.findFirst({
    where: like(questions.questionText, '%Madhya Pradesh%'),
    with: {
        test: true
    }
  });

  if (!q2024) {
    console.log('No sample question found.');
    return;
  }

  console.log(`\nSample Question (ID: ${q2024.id}):`);
  console.log(`Text: ${q2024.questionText}`);
  console.log(`Test: ${q2024.test.title}`);

  // 2. Run FTS Search
  const searchQuery = buildFtsQuery(q2024.questionText);
  if (!searchQuery) {
      console.log('Could not build search query.');
      return;
  }
  
  console.log(`\nSearch Query: ${searchQuery}`);

  const matches = await db.all(sql`
        SELECT id, questionText, bm25(questions_fts) as rank
        FROM questions_fts 
        WHERE questions_fts MATCH ${searchQuery}
        AND id != ${q2024.id}
        ORDER BY rank
        LIMIT 5
    `);

  console.log('\n--- Top 5 Matches ---');
  for (const m of matches as any[]) {
      console.log(`\nMatch ID: ${m.id}`);
      console.log(`Rank (Raw): ${m.rank}`);
      console.log(`Rank (Abs): ${Math.abs(Number(m.rank))}`);
      console.log(`Text: ${m.questionText.substring(0, 100)}...`);
  }
}

// Stop Words (Hindi + English)
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'of', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'with', 'by', 'from', 'which', 'correct', 'incorrect', 'following', 'statements', 'regarding', 'consider', 'match', 'option', 'question', 'answer',
  'ka', 'ki', 'ke', 'hai', 'tha', 'thi', 'the', 'ko', 'se', 'me', 'mein', 'par', 'aur', 'evam', 'tatha', 'kya', 'kaun', 'kis', 'nimn', 'likhit', 'nimnalikhit', 'kathan', 'sahi', 'galat', 'h',
  'है', 'हैं', 'था', 'थी', 'थे', 'का', 'की', 'के', 'को', 'से', 'में', 'पर', 'और', 'एवं', 'तथा', 'क्या', 'कौन', 'किस', 'निम्नलिखित', 'कथनों', 'कथन', 'विचार', 'कीजिए', 'सही', 'गलत', 'उत्तर', 'दीजिए', 'विकल्प', 'सुमेलित', 'कौनसा', 'नहीं', 'एक', 'यह', 'वह', 'वे', 'करते', 'होता', 'होती', 'होते', 'दिया', 'गया'
]);

function buildFtsQuery(text: string): string | null {
    if (!text) return null;
    const cleanWords = text.toLowerCase()
      .replace(/[^\w\u0900-\u097F\s]/g, '') 
      .split(/\s+/)
      .filter(t => t.length > 2 && !STOP_WORDS.has(t));
      
    if (cleanWords.length === 0) return null;
    return cleanWords.join(' OR '); 
}

debugScores().catch(console.error);
