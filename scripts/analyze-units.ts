
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../src/db/schema';
import { questions, tests } from '../src/db/schema';
import { eq, inArray, like } from 'drizzle-orm';
import { getScopedStateServiceYear, PYQ_SCOPE_START_YEAR, PYQ_SCOPE_END_YEAR } from '../src/features/tests/utils/pyq-scope';
import { syllabusData } from '../src/data/syllabusData';

const client = createClient({ url: 'file:mppolice_local.db' });
const db = drizzle(client, { schema });

// STOP WORDS for improved matching (Hindi + English)
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'of', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'with', 'by', 'from', 'which', 'correct', 'incorrect', 'following', 'statements', 'regarding', 'consider', 'match', 'option', 'question', 'answer',
  'ka', 'ki', 'ke', 'hai', 'tha', 'thi', 'the', 'ko', 'se', 'me', 'mein', 'par', 'aur', 'evam', 'tatha', 'kya', 'kaun', 'kis', 'nimn', 'likhit', 'nimnalikhit', 'kathan', 'sahi', 'galat', 'h',
  'है', 'हैं', 'था', 'थी', 'थे', 'का', 'की', 'के', 'को', 'से', 'में', 'पर', 'और', 'एवं', 'तथा', 'क्या', 'कौन', 'किस', 'निम्नलिखित', 'कथनों', 'कथन', 'विचार', 'कीजिए', 'सही', 'गलत', 'उत्तर', 'दीजिए', 'विकल्प', 'सुमेलित', 'कौनसा', 'नहीं', 'एक', 'यह', 'वह', 'वे', 'करते', 'होता', 'होती', 'होते', 'दिया', 'गया'
]);

// Helper to tokenize text
function getTokens(text: string): Set<string> {
    if (!text) return new Set();
    const words = text.toLowerCase()
        .replace(/[^\w\u0900-\u097F\s]/g, '')
        .split(/\s+/)
        .filter(t => t.length > 2 && !STOP_WORDS.has(t));
    return new Set(words);
}

// Helper to calculate overlap score
function calculateScore(qTokens: Set<string>, topicTokens: Set<string>): number {
    if (qTokens.size === 0 || topicTokens.size === 0) return 0;
    let match = 0;
    for (const t of qTokens) {
        if (topicTokens.has(t)) match++;
    }
    return match;
}

async function analyzeUnitDistribution() {
    console.log('Starting Unit-wise Analysis for 2020-2025 PYQs...');

    // 1. Fetch Canonical Questions
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
    const testYearMap = new Map();

    for (const year of Array.from(testsByYear.keys())) {
        const candidates = testsByYear.get(year);
        candidates.sort((a: any, b: any) => {
            const isHindiA = a.title.includes('MP Police राज्य सेवा');
            const isHindiB = b.title.includes('MP Police राज्य सेवा');
            if (isHindiA && !isHindiB) return -1;
            if (!isHindiA && isHindiB) return 1;
            return (b.totalQuestions || 0) - (a.totalQuestions || 0);
        });
        if (candidates.length > 0) {
            selectedTestIds.push(candidates[0].id);
            testYearMap.set(candidates[0].id, year);
        }
    }

    const scopedQuestions = await db.select({
        id: questions.id,
        testId: questions.testId,
        text: questions.questionText,
        textEn: questions.questionTextEn,
    }).from(questions).where(inArray(questions.testId, selectedTestIds));

    console.log(`Analyzing ${scopedQuestions.length} questions against Syllabus Units...`);

    // 2. Prepare Unit Keywords
    // Flatten syllabus data into a searchable structure
    const unitKeywords = new Map<string, { title: string, tokens: Set<string>, topics: any[] }>();

    // Manual keywords to boost accuracy where syllabus text is sparse
    const manualKeywords: Record<string, string[]> = {
        unit_1: ['indus', 'harappa', 'vedic', 'mauryan', 'gupta', 'delhi sultanate', 'mughal', 'maratha', 'freedom struggle', 'gandhi', 'nehru', 'congress', 'revolution', '1857', 'buddha', 'mahavira', 'jain'],
        unit_2: ['history of mp', 'holkar', 'scindia', 'bhopal state', 'bundela', 'baghel', 'tribal personalities', 'bhima nayak', 'tantya bhil', 'culture of mp', 'folk', 'festivals', 'literature mp'],
        unit_3: ['geography of india', 'mountains', 'rivers', 'climate', 'monsoon', 'soil', 'agriculture', 'minerals', 'population', 'census', 'transport', 'himalaya', 'ganga', 'narmada'],
        unit_4: ['geography of mp', 'forests', 'wildlife', 'national parks', 'rivers mp', 'narmada', 'chambal', 'betwa', 'tapti', 'climate mp', 'minerals mp', 'industries mp'],
        unit_5: ['constitution', 'polity', 'president', 'parliament', 'supreme court', 'fundamental rights', 'dpsp', 'amendment', 'article', 'governor', 'chief minister', 'vidhan sabha', 'panchayat', 'municipality'],
        unit_6: ['economy of india', 'gdp', 'rbi', 'banking', 'budget', 'gst', 'schemes', 'poverty', 'unemployment', 'agriculture economy', 'foreign trade', 'sensex', 'niti aayog'],
        unit_7: ['science', 'physics', 'chemistry', 'biology', 'environment', 'pollution', 'diseases', 'vitamins', 'space', 'isro', 'satellite', 'drdo', 'food processing', 'health policy', 'disaster management'],
        unit_8: ['current affairs', 'sports', 'games', 'olympics', 'commonwealth', 'asian games', 'awards', 'padma', 'nobel', 'cricket', 'hockey', 'football', 'badminton', 'tennis', 'tokyo', 'modi', 'summit'],
        unit_9: ['ict', 'computer', 'internet', 'networking', 'cyber security', 'robotics', 'artificial intelligence', 'electronics', 'e-governance', 'social media', 'ecommerce', 'virus', 'hacker', 'protocol'],
        unit_10: ['tribes of mp', 'gond', 'bhil', 'baiga', 'sahariya', 'bharia', 'kol', 'korku', 'pvtg', 'scheduled tribes', 'art and culture of tribes', 'dialects']
    };

    for (const [unitId, unitData] of Object.entries(syllabusData.units)) {
        // Collect tokens from Unit Title + All Topic Titles + Topic Descriptions
        const allText = [
            unitData.title,
            unitData.title_en,
            ...(unitData.topics || []).map(t => t.front + ' ' + t.back + ' ' + (t.details || '')),
            ...(unitData.topics_en || []).map(t => t.front + ' ' + t.back),
            ...(manualKeywords[unitId] || [])
        ].join(' ');
        
        // Use title_en + title for display if unit_title is missing
        const displayTitle = unitData.unit_title || `${unitData.title} (${unitData.title_en})`;

        unitKeywords.set(unitId, {
            title: displayTitle,
            tokens: getTokens(allText),
            topics: unitData.topics
        });
    }

    // 3. Match Questions to Units
    const unitStats = new Map<string, number>();
    const yearUnitStats = new Map<number, Map<string, number>>();

    // Initialize stats
    for (const unitId of Object.keys(syllabusData.units)) {
        unitStats.set(unitId, 0);
    }
    for (let y = PYQ_SCOPE_START_YEAR; y <= PYQ_SCOPE_END_YEAR; y++) {
        yearUnitStats.set(y, new Map());
        for (const unitId of Object.keys(syllabusData.units)) {
            yearUnitStats.get(y)!.set(unitId, 0);
        }
    }

    let unmappedCount = 0;

    for (const q of scopedQuestions) {
        const qTokens = getTokens((q.text || '') + ' ' + (q.textEn || ''));
        const year = testYearMap.get(q.testId);

        let bestUnit = null;
        let maxScore = 0;

        for (const [unitId, data] of unitKeywords.entries()) {
            const score = calculateScore(qTokens, data.tokens);
            // Simple keyword matching heuristic
            // If explicit Unit name mentions found (e.g. "Madhya Pradesh History") boost score
            
            if (score > maxScore) {
                maxScore = score;
                bestUnit = unitId;
            }
        }

        // Threshold for matching
        if (maxScore > 1 && bestUnit) {
            unitStats.set(bestUnit, unitStats.get(bestUnit)! + 1);
            yearUnitStats.get(year)!.set(bestUnit, yearUnitStats.get(year)!.get(bestUnit)! + 1);
        } else {
            unmappedCount++;
        }
    }

    console.log('\n--- Unit-wise Weightage (2020-2025) ---');
    const sortedUnits = Array.from(unitStats.entries()).sort((a,b) => b[1] - a[1]);
    
    for (const [unitId, count] of sortedUnits) {
        const title = unitKeywords.get(unitId)?.title;
        const percentage = ((count / scopedQuestions.length) * 100).toFixed(1);
        console.log(`${unitId} (${title}): ${count} Qs (${percentage}%)`);
    }

    console.log(`\nUnmapped Questions: ${unmappedCount} (Need better keywords or manual tagging)`);

    console.log('\n--- Year-wise Trends (Top 3 Units) ---');
    for (let y = PYQ_SCOPE_END_YEAR; y >= PYQ_SCOPE_START_YEAR; y--) {
        const stats = yearUnitStats.get(y)!;
        const sorted = Array.from(stats.entries()).sort((a,b) => b[1] - a[1]).slice(0, 3);
        const topUnits = sorted.map(([u, c]) => `${u} (${c})`).join(', ');
        console.log(`${y}: ${topUnits}`);
    }
}

analyzeUnitDistribution().then(() => process.exit(0));
