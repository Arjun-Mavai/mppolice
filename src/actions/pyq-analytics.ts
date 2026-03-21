'use server';

import { db } from '@/db';
import { questions, pyqQuestionTopics, pyqTopics } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { syllabusData } from '@/data/syllabusData';
import { normalizeSubject } from '@/features/tests/utils/pyq-subject';

// ============================================
// CANONICAL TEST IDS - Verified from PROD DB
// Only these 6 tests (2020-2025) are used for analysis
// Each test has exactly 100 questions with order 1-100
// ============================================
const CANONICAL_TEST_IDS: Record<number, string> = {
  2020: '5KRVTgTIw07bWNxu20YNl',
  2021: 'ix0FnJV496Rgvw0YHOEFj',
  2022: 'o_rO3J1tSEACKENOLT9QI',
  2023: 'mQ1a9hZoTdfSRfkz40K5C',
  2024: '3XmZ0l700BJV3j2FLd0XZ',
  2025: 'D0gf6bklgl3RT-sTnue2n',
};

// Helper to get canonical test IDs as array
function getCanonicalTestIds(): string[] {
  return Object.values(CANONICAL_TEST_IDS);
}

// Helper to get year from test ID
function getYearFromTestId(testId: string): number {
  for (const [year, id] of Object.entries(CANONICAL_TEST_IDS)) {
    if (id === testId) return Number(year);
  }
  return 0;
}

// ============================================
// Types
// ============================================

export interface RepeatedQuestion {
  questionId: string;
  text: string;
  textEn?: string | null;
  occurrences: { year: number; qNo: number }[];
  count: number;
  topics: { id: string; name: string; nameEn?: string | null }[];
  unit?: { id: string; title: string };
}

export interface UnitDistributionStats {
  year: number;
  unitId: string;
  unitTitle: string;
  count: number;
  questions: { id: string; text: string; textEn?: string | null; year: number; qNo: number }[];
}

export interface TopicStat {
  unitId: string;
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  topicTitleEn?: string | null;
  count: number;
  years: number[];
  questions: { id: string; text: string; textEn?: string | null; year: number; qNo: number }[];
}

// ============================================
// Stop Words for text processing
// ============================================

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'of', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'with', 'by', 'from', 'which', 'correct', 'incorrect', 'following', 'statements', 'regarding', 'consider', 'match', 'option', 'question', 'answer', 'not', 'none', 'all', 'above', 'below', 'true', 'false',
  'ka', 'ki', 'ke', 'hai', 'tha', 'thi', 'the', 'ko', 'se', 'me', 'mein', 'par', 'aur', 'evam', 'tatha', 'kya', 'kaun', 'kis', 'nimn', 'likhit', 'nimnalikhit', 'kathan', 'sahi', 'galat', 'h', 'nahi',
  'है', 'हैं', 'था', 'थी', 'थे', 'का', 'की', 'के', 'को', 'से', 'में', 'पर', 'और', 'एवं', 'तथा', 'क्या', 'कौन', 'किस', 'निम्नलिखित', 'कथनों', 'कथन', 'विचार', 'कीजिए', 'सही', 'गलत', 'उत्तर', 'दीजिए', 'विकल्प', 'सुमेलित', 'कौनसा', 'नहीं', 'एक', 'यह', 'वह', 'वे', 'करते', 'होता', 'होती', 'होते', 'दिया', 'गया'
]);

// ============================================
// Unit Classification
// ============================================

const manualKeywords: Record<string, string[]> = {
  unit_1: ['indus', 'harappa', 'vedic', 'mauryan', 'gupta', 'delhi sultanate', 'mughal', 'maratha', 'freedom struggle', 'gandhi', 'nehru', 'congress', 'revolution', '1857', 'buddha', 'mahavira', 'jain', 'ashoka', 'chandragupta', 'akbar', 'aurangzeb', 'shivaji', 'british', 'viceroy', 'governor', 'quit india', 'dandi', 'swadeshi', 'satyagraha', 'मौर्य', 'गुप्त', 'मुगल', 'स्वतंत्रता', 'आंदोलन'],
  unit_2: ['mp history', 'holkar', 'scindia', 'bhopal state', 'bundela', 'baghel', 'bhima nayak', 'tantya bhil', 'culture of mp', 'folk', 'festivals', 'gwalior', 'indore', 'ujjain', 'maheshwar', 'mandu', 'chanderi', 'बुन्देला', 'होलकर', 'सिंधिया', 'भोपाल', 'ग्वालियर', 'मध्यप्रदेश', 'संस्कृति'],
  unit_3: ['geography of india', 'mountains', 'rivers india', 'climate india', 'monsoon', 'soil types', 'minerals india', 'population', 'census', 'himalaya', 'ganga', 'brahmaputra', 'plateau', 'coastal', 'peninsula', 'western ghats', 'eastern ghats', 'deccan', 'भारत का भूगोल', 'हिमालय', 'नदी', 'जलवायु'],
  unit_4: ['mp geography', 'forests mp', 'wildlife mp', 'national parks mp', 'narmada', 'chambal', 'betwa', 'tapti', 'satpura', 'vindhya', 'malwa', 'bundelkhand', 'पन्ना', 'कान्हा', 'बांधवगढ़', 'पचमढ़ी', 'नर्मदा', 'चम्बल', 'मध्यप्रदेश भूगोल'],
  unit_5: ['constitution', 'polity', 'president', 'parliament', 'supreme court', 'fundamental rights', 'dpsp', 'amendment', 'article', 'lok sabha', 'rajya sabha', 'judiciary', 'executive', 'legislature', 'directive principles', 'संविधान', 'मूल अधिकार', 'राष्ट्रपति', 'संसद', 'न्यायपालिका'],
  unit_6: ['economy', 'gdp', 'rbi', 'banking', 'budget', 'gst', 'poverty', 'unemployment', 'fiscal policy', 'monetary policy', 'inflation', 'five year plan', 'niti aayog', 'अर्थव्यवस्था', 'बजट', 'मुद्रास्फीति', 'बैंकिंग'],
  unit_7: ['science', 'physics', 'chemistry', 'biology', 'environment', 'pollution', 'diseases', 'vitamins', 'space', 'isro', 'satellite', 'ecology', 'biodiversity', 'greenhouse', 'ozone', 'विज्ञान', 'पर्यावरण', 'विटामिन', 'रोग', 'प्रदूषण'],
  unit_8: ['current affairs', 'sports', 'olympics', 'commonwealth', 'asian games', 'awards', 'padma', 'nobel', 'cricket', 'hockey', 'world cup', 'summit', 'g20', 'खेल', 'पुरस्कार', 'समसामयिक'],
  unit_9: ['ict', 'computer', 'internet', 'cyber security', 'artificial intelligence', 'software', 'hardware', 'digital', 'कंप्यूटर', 'इंटरनेट', 'साइबर', 'सॉफ्टवेयर'],
  unit_10: ['tribes mp', 'gond', 'bhil', 'baiga', 'sahariya', 'korku', 'scheduled tribes', 'adivasi', 'जनजाति', 'गोंड', 'भील', 'बैगा', 'अनुसूचित']
};

let unitKeywordsCache: Map<string, { title: string; tokens: Set<string> }> | null = null;

function getTokens(text: string): Set<string> {
  if (!text) return new Set();
  const words = text.toLowerCase()
    .replace(/[^\w\u0900-\u097F\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
  return new Set(words);
}

function prepareUnitKeywords(): Map<string, { title: string; tokens: Set<string> }> {
  if (unitKeywordsCache) return unitKeywordsCache;
  
  unitKeywordsCache = new Map();
  for (const [unitId, unitData] of Object.entries(syllabusData.units)) {
    const allText = [
      unitData.title,
      unitData.title_en,
      ...(unitData.topics || []).map(t => t.front + ' ' + t.back + ' ' + (t.details || '')),
      ...(unitData.topics_en || []).map(t => t.front + ' ' + t.back),
      ...(manualKeywords[unitId] || [])
    ].join(' ');
    
    const displayTitle = unitData.unit_title || `${unitData.title} (${unitData.title_en})`;
    
    unitKeywordsCache.set(unitId, {
      title: displayTitle,
      tokens: getTokens(allText)
    });
  }
  return unitKeywordsCache;
}

function assignUnitToQuestion(text: string): { id: string; title: string } | undefined {
  const keywords = prepareUnitKeywords();
  const qTokens = getTokens(text);
  
  let bestUnit: { id: string; title: string } | undefined;
  let maxScore = 0;

  for (const [unitId, data] of keywords.entries()) {
    let score = 0;
    for (const t of qTokens) {
      if (data.tokens.has(t)) score++;
    }
    if (score > maxScore) {
      maxScore = score;
      bestUnit = { id: unitId, title: data.title };
    }
  }

  return maxScore > 1 ? bestUnit : undefined;
}

// ============================================
// Jaccard Similarity for Repeated Question Detection
// ============================================

function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u0900-\u097F\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSignificantTokens(text: string): Set<string> {
  const normalized = normalizeForComparison(text);
  const tokens = normalized.split(' ').filter(t => t.length > 3 && !STOP_WORDS.has(t));
  return new Set(tokens);
}

function jaccardSimilarity(text1: string, text2: string): number {
  const tokens1 = getSignificantTokens(text1);
  const tokens2 = getSignificantTokens(text2);
  
  if (tokens1.size === 0 || tokens2.size === 0) return 0;
  
  let intersection = 0;
  for (const t of tokens1) {
    if (tokens2.has(t)) intersection++;
  }
  
  const union = tokens1.size + tokens2.size - intersection;
  return intersection / union;
}

// ============================================
// Get Repeated Questions
// Uses only the 6 canonical tests (2020-2025)
// High Jaccard threshold (0.6) for accuracy
// ============================================

// ============================================
// Get Repeated Questions
// Uses only the 6 canonical tests (2020-2025)
// High Jaccard threshold (0.6) for accuracy
// ============================================

export async function getRepeatedQuestions(): Promise<RepeatedQuestion[]> {
  try {
    const testIds = getCanonicalTestIds();

    // Fetch all questions from canonical tests
    const allQuestions = await db.select({
      id: questions.id,
      testId: questions.testId,
      text: questions.questionText,
      textEn: questions.questionTextEn,
      order: questions.order,
    }).from(questions).where(inArray(questions.testId, testIds));

    // Group by year for cross-year comparison
    const questionsByYear = new Map<number, typeof allQuestions>();
    for (const q of allQuestions) {
      const year = getYearFromTestId(q.testId);
      if (!questionsByYear.has(year)) questionsByYear.set(year, []);
      questionsByYear.get(year)!.push(q);
    }

    // Union-Find for clustering similar questions
    const parent = new Map<string, string>();
    allQuestions.forEach(q => parent.set(q.id, q.id));

    function find(id: string): string {
      if (parent.get(id) === id) return id;
      const root = find(parent.get(id)!);
      parent.set(id, root);
      return root;
    }

    function union(id1: string, id2: string) {
      const root1 = find(id1);
      const root2 = find(id2);
      if (root1 !== root2) {
        parent.set(root2, root1);
      }
    }

    // Compare questions ONLY across different years
    // Use HIGH threshold (0.6) for accuracy
    const SIMILARITY_THRESHOLD = 0.6;
    const years = Array.from(questionsByYear.keys()).sort();

    for (let i = 0; i < years.length; i++) {
      for (let j = i + 1; j < years.length; j++) {
        const qs1 = questionsByYear.get(years[i])!;
        const qs2 = questionsByYear.get(years[j])!;
        
        for (const q1 of qs1) {
          const q1Text = (q1.text || '') + ' ' + (q1.textEn || '');
          for (const q2 of qs2) {
            const q2Text = (q2.text || '') + ' ' + (q2.textEn || '');
            const similarity = jaccardSimilarity(q1Text, q2Text);
            if (similarity >= SIMILARITY_THRESHOLD) {
              union(q1.id, q2.id);
            }
          }
        }
      }
    }

    // Build clusters
    const clusters = new Map<string, typeof allQuestions>();
    allQuestions.forEach(q => {
      const root = find(q.id);
      if (!clusters.has(root)) clusters.set(root, []);
      clusters.get(root)!.push(q);
    });

    // Format results - only include if repeated across DIFFERENT years
    const result: RepeatedQuestion[] = [];
    
    for (const cluster of clusters.values()) {
      const yearsInCluster = new Set(cluster.map(q => getYearFromTestId(q.testId)));
      
      if (yearsInCluster.size > 1) {
        // Sort by year descending to get most recent as representative
        cluster.sort((a, b) => getYearFromTestId(b.testId) - getYearFromTestId(a.testId));
        const representative = cluster[0];
        
        const occurrences = cluster.map(c => ({
          year: getYearFromTestId(c.testId),
          qNo: c.order
        })).sort((a, b) => b.year - a.year);

        const unit = assignUnitToQuestion((representative.text || '') + ' ' + (representative.textEn || ''));

        result.push({
          questionId: representative.id,
          text: representative.text || '',
          textEn: representative.textEn,
          occurrences,
          count: yearsInCluster.size,
          topics: [],
          unit,
        });
      }
    }
    
    result.sort((a, b) => b.count - a.count);

    // Fetch topics for top repeated questions
    const topRepeated = result.slice(0, 100);
    const questionIds = topRepeated.map(r => r.questionId);

    if (questionIds.length > 0) {
      const topicData = await db.select({
        questionId: pyqQuestionTopics.questionId,
        topicId: pyqTopics.id,
        topicTitle: pyqTopics.topicTitle,
        topicTitleEn: pyqTopics.topicTitleEn
      })
      .from(pyqQuestionTopics)
      .innerJoin(pyqTopics, eq(pyqQuestionTopics.topicId, pyqTopics.id))
      .where(inArray(pyqQuestionTopics.questionId, questionIds));
      
      const topicMap = new Map<string, { id: string; name: string; nameEn?: string | null }[]>();
      for (const t of topicData) {
        if (!topicMap.has(t.questionId)) topicMap.set(t.questionId, []);
        topicMap.get(t.questionId)!.push({ 
          id: t.topicId, 
          name: t.topicTitle,
          nameEn: t.topicTitleEn
        });
      }

      for (const r of topRepeated) {
        r.topics = topicMap.get(r.questionId) || [];
      }
    }

    return topRepeated;

  } catch (error) {
    console.error('Error in repeated questions analysis:', error);
    return [];
  }
}

// ============================================
// Get Unit Distribution Stats
// Uses only the 6 canonical tests (2020-2025)
// ============================================

// ============================================
// Get Unit Distribution Stats
// Uses only the 6 canonical tests (2020-2025)
// ============================================

export async function getUnitDistributionStats(): Promise<UnitDistributionStats[]> {
  try {
    const testIds = getCanonicalTestIds();

    // Fetch all questions from canonical tests
    const allQuestions = await db.select({
      id: questions.id,
      testId: questions.testId,
      text: questions.questionText,
      textEn: questions.questionTextEn,
      order: questions.order,
    }).from(questions).where(inArray(questions.testId, testIds));

    // Classify each question into a unit
    const stats: Record<string, UnitDistributionStats> = {};

    for (const q of allQuestions) {
      const year = getYearFromTestId(q.testId);
      const fullText = (q.text || '') + ' ' + (q.textEn || '');
      const unit = assignUnitToQuestion(fullText);

      const unitId = unit ? unit.id : 'unmapped';
      const unitTitle = unit ? unit.title : 'Unmapped / General';
      const key = `${year}-${unitId}`;
      
      if (!stats[key]) {
        stats[key] = {
          year,
          unitId,
          unitTitle,
          count: 0,
          questions: []
        };
      }
      
      stats[key].count++;
      stats[key].questions.push({
        id: q.id,
        text: q.text || '',
        textEn: q.textEn,
        year,
        qNo: q.order
      });
    }

    return Object.values(stats).sort((a, b) => b.year - a.year || a.unitId.localeCompare(b.unitId));

  } catch (error) {
    console.error('Error in Unit Distribution Analysis:', error);
    return [];
  }
}

// ============================================
// Get Subject-wise Distribution for Intelligence Page
// Maps units to normalized subjects like Topic Analysis page
// ============================================

export interface SubjectDistributionStats {
  year: number;
  subjectId: string;
  subjectTitle: string;
  count: number;
  questions: Array<{
    id: string;
    text: string;
    order: number;
  }>;
}

// Map unit assignments to subject categories
function mapUnitToSubject(unitId: string, unitTitle: string): { id: string; title: string } {
  const subjectMapping = {
    // History
    'unit_1': { id: 'indian-history', title: 'Indian History' },
    
    // MP GK
    'unit_2': { id: 'mp-gk', title: 'MP GK' },
    'unit_10': { id: 'mp-gk', title: 'MP GK' }, // Tribes also MP GK
    
    // Geography
    'unit_3': { id: 'geography', title: 'Geography' },
    'unit_4': { id: 'mp-gk', title: 'MP GK' }, // MP Geography = MP GK
    
    // Polity
    'unit_5': { id: 'indian-polity', title: 'Indian Polity' },
    
    // Economy
    'unit_6': { id: 'economy', title: 'Economy' },
    
    // Science
    'unit_7': { id: 'general-science', title: 'General Science' },
    
    // Current Affairs
    'unit_8': { id: 'current-affairs', title: 'Current Affairs' },
    
    // ICT
    'unit_9': { id: 'ict', title: 'ICT' },
    
    // Unmapped = General Studies
    'unmapped': { id: 'general-studies', title: 'General Studies' }
  };
  
  return subjectMapping[unitId] || { id: 'general-studies', title: 'General Studies' };
}

export async function getSubjectDistributionStats(): Promise<SubjectDistributionStats[]> {
  try {
    // Get unit-wise data first
    const unitStats = await getUnitDistributionStats();
    
    // Convert to subject-wise aggregation
    const subjectGroups: Record<string, SubjectDistributionStats> = {};
    
    for (const unitStat of unitStats) {
      const subject = mapUnitToSubject(unitStat.unitId, unitStat.unitTitle);
      const key = `${unitStat.year}-${subject.id}`;
      
      if (!subjectGroups[key]) {
        subjectGroups[key] = {
          year: unitStat.year,
          subjectId: subject.id,
          subjectTitle: subject.title,
          count: 0,
          questions: []
        };
      }
      
      // Aggregate data
      subjectGroups[key].count += unitStat.count;
      subjectGroups[key].questions.push(...unitStat.questions);
    }
    
    // Sort by year and subject for consistent ordering
    const sortedStats = Object.values(subjectGroups).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.subjectTitle.localeCompare(b.subjectTitle);
    });
    
    return sortedStats;
  } catch (error) {
    console.error('Error in Subject Distribution Analysis:', error);
    return [];
  }
}

// ============================================
// Get Most Repeated Topics
// Uses only the 6 canonical tests (2020-2025)
// ============================================

// ============================================
// Get Most Repeated Topics
// Uses only the 6 canonical tests (2020-2025)
// ============================================

export async function getMostRepeatedTopics(): Promise<Record<string, TopicStat[]>> {
  try {
    const testIds = getCanonicalTestIds();

    // Fetch questions with their topics
    const topicData = await db.select({
      testId: questions.testId,
      questionId: questions.id,
      questionText: questions.questionText,
      questionTextEn: questions.questionTextEn,
      questionOrder: questions.order,
      topicId: pyqTopics.id,
      topicSlug: pyqTopics.topicSlug,
      topicTitle: pyqTopics.topicTitle,
      topicTitleEn: pyqTopics.topicTitleEn
    })
    .from(questions)
    .innerJoin(pyqQuestionTopics, eq(questions.id, pyqQuestionTopics.questionId))
    .innerJoin(pyqTopics, eq(pyqQuestionTopics.topicId, pyqTopics.id))
    .where(inArray(questions.testId, testIds));

    // Aggregate by Unit
    const unitTopics: Record<string, Map<string, TopicStat>> = {};

    for (const row of topicData) {
      const year = getYearFromTestId(row.testId);
      const fullText = (row.questionText || '') + ' ' + (row.questionTextEn || '');
      const unit = assignUnitToQuestion(fullText);
      const unitId = unit ? unit.id : 'unmapped';

      if (!unitTopics[unitId]) unitTopics[unitId] = new Map();
      
      const topicKey = row.topicId;
      if (!unitTopics[unitId].has(topicKey)) {
        unitTopics[unitId].set(topicKey, {
          unitId,
          topicId: row.topicId,
          topicSlug: row.topicSlug,
          topicTitle: row.topicTitle,
          topicTitleEn: row.topicTitleEn,
          count: 0,
          years: [],
          questions: []
        });
      }
      
      const stat = unitTopics[unitId].get(topicKey)!;
      stat.count++;
      if (!stat.years.includes(year)) stat.years.push(year);
      if (!stat.questions.some(q => q.id === row.questionId)) {
        stat.questions.push({
          id: row.questionId,
          text: row.questionText || '',
          textEn: row.questionTextEn,
          year,
          qNo: row.questionOrder
        });
      }
    }

    // Convert to sorted array - top 10 per unit
    const result: Record<string, TopicStat[]> = {};
    for (const [unitId, map] of Object.entries(unitTopics)) {
      result[unitId] = Array.from(map.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }

    return result;

  } catch (error) {
    console.error('Error in Most Repeated Topics Analysis:', error);
    return {};
  }
}
