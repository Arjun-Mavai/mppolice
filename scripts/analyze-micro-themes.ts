
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../src/db/schema';
import { questions, tests } from '../src/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getScopedStateServiceYear, PYQ_SCOPE_START_YEAR, PYQ_SCOPE_END_YEAR } from '../src/features/tests/utils/pyq-scope';

const client = createClient({ url: 'file:mppolice_local.db' });
const db = drizzle(client, { schema });

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'of', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'with', 'by', 'from', 'which', 'correct', 'incorrect', 'following', 'statements', 'regarding', 'consider', 'match', 'option', 'question', 'answer',
  'ka', 'ki', 'ke', 'hai', 'tha', 'thi', 'the', 'ko', 'se', 'me', 'mein', 'par', 'aur', 'evam', 'tatha', 'kya', 'kaun', 'kis', 'nimn', 'likhit', 'nimnalikhit', 'kathan', 'sahi', 'galat', 'h',
  'है', 'हैं', 'था', 'थी', 'थे', 'का', 'की', 'के', 'को', 'से', 'में', 'पर', 'और', 'एवं', 'तथा', 'क्या', 'कौन', 'किस', 'निम्नलिखित', 'कथनों', 'कथन', 'विचार', 'कीजिए', 'सही', 'गलत', 'उत्तर', 'दीजिए', 'विकल्प', 'सुमेलित', 'कौनसा', 'नहीं', 'एक', 'यह', 'वह', 'वे', 'करते', 'होता', 'होती', 'होते', 'दिया', 'गया',
  'state', 'district', 'mp', 'madhya', 'pradesh', 'india', 'indian', 'government', 'act', 'year', 'located', 'related'
]);

function getTokens(text: string): string[] {
    if (!text) return [];
    return text.toLowerCase()
        .replace(/[^\w\u0900-\u097F\s]/g, '')
        .split(/\s+/)
        .filter(t => t.length > 2);
}

function generateNGrams(tokens: string[], n: number): string[] {
    const ngrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
        const slice = tokens.slice(i, i + n);
        // Filter out n-grams that are purely stop words
        if (slice.every(t => STOP_WORDS.has(t))) continue;
        ngrams.push(slice.join(' '));
    }
    return ngrams;
}

async function analyzeMicroThemes() {
    console.log('Analyzing Micro-Themes for 2020-2025 PYQs...');

    // Fetch Canonical Questions
    const allTests = await db.select({
        id: tests.id,
        title: tests.title,
        totalQuestions: tests.totalQuestions,
    }).from(tests).where(eq(tests.type, 'PYQ'));

    const testsByYear = new Map();
    for (const t of allTests) {
        const year = getScopedStateServiceYear(t.title);
        if (year && year >= PYQ_SCOPE_START_YEAR && year <= PYQ_SCOPE_END_YEAR) {
            if (!testsByYear.has(year)) testsByYear.set(year, []);
            testsByYear.get(year).push(t);
        }
    }

    const selectedTestIds = [];
    for (const year of Array.from(testsByYear.keys())) {
        const candidates = testsByYear.get(year);
        candidates.sort((a: any, b: any) => {
            const isHindiA = a.title.includes('MP Police राज्य सेवा');
            const isHindiB = b.title.includes('MP Police राज्य सेवा');
            if (isHindiA && !isHindiB) return -1;
            if (!isHindiA && isHindiB) return 1;
            return (b.totalQuestions || 0) - (a.totalQuestions || 0);
        });
        if (candidates.length > 0) selectedTestIds.push(candidates[0].id);
    }

    const scopedQuestions = await db.select({
        id: questions.id,
        text: questions.questionText,
    }).from(questions).where(inArray(questions.testId, selectedTestIds));

    const ngramCounts = new Map<string, number>();
    
    // Analyze bi-grams and tri-grams
    for (const q of scopedQuestions) {
        const tokens = getTokens(q.text || '');
        const bigrams = generateNGrams(tokens, 2);
        const trigrams = generateNGrams(tokens, 3);
        
        [...bigrams, ...trigrams].forEach(ngram => {
            ngramCounts.set(ngram, (ngramCounts.get(ngram) || 0) + 1);
        });
    }

    // Filter and Sort
    const sortedThemes = Array.from(ngramCounts.entries())
        .filter(([_, count]) => count >= 3) // At least 3 occurrences
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);

    console.log('\n--- Top 50 Micro-Themes (Phrases) ---');
    sortedThemes.forEach(([theme, count], i) => {
        console.log(`${i+1}. ${theme} (${count})`);
    });
}

analyzeMicroThemes().then(() => process.exit(0));
