'use server';

import { db } from '@/db';
import { questions, pyqQuestionTopics, pyqTopics } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { syllabusData } from '@/data/syllabusData';
import { normalizeSubject } from '@/features/tests/utils/pyq-subject';
import { CANONICAL_TEST_IDS, getCanonicalTestIds, getYearFromTestId } from '@/lib/pyq-constants';

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

export interface OverallWeightageSubjectData {
  subject: string;
  questions: {
    id: string;
    text: string;
    textEn?: string | null;
    year: number;
    qNo: number;
    testTitle: string;
    testId: string;
  }[];
}

// Function to get subject-wise questions for Intelligence Overall Weightage
export async function getOverallWeightageSubjectData(): Promise<OverallWeightageSubjectData[]> {
  const canonicalTestIds = getCanonicalTestIds();
  
  // Get all questions from canonical tests with subject grouping
  const allQuestions = await db
    .select({
      id: questions.id,
      text: questions.questionText,
      textEn: questions.questionTextEn,
      subject: questions.subject,
      testId: questions.testId,
      order: questions.order,
    })
    .from(questions)
    .where(inArray(questions.testId, canonicalTestIds));

  // Group by subject
  const subjectGroups: Record<string, typeof allQuestions> = {};
  
  for (const q of allQuestions) {
    const normalizedSubject = normalizeSubject(q.subject);
    if (!subjectGroups[normalizedSubject]) {
      subjectGroups[normalizedSubject] = [];
    }
    subjectGroups[normalizedSubject].push(q);
  }

  // Format for UI
  return Object.entries(subjectGroups).map(([subject, questions]) => ({
    subject,
    questions: questions.map(q => ({
      id: q.id,
      text: q.text,
      textEn: q.textEn,
      year: getYearFromTestId(q.testId),
      qNo: q.order,
      testTitle: `MPPSC Prelims ${getYearFromTestId(q.testId)}`,
      testId: q.testId,
    })).sort((a, b) => b.year - a.year || a.qNo - b.qNo), // Sort by year desc, then qNo asc
  }));
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
  'the',
  'is',
  'at',
  'of',
  'on',
  'and',
  'a',
  'an',
  'in',
  'to',
  'for',
  'with',
  'by',
  'from',
  'which',
  'correct',
  'incorrect',
  'following',
  'statements',
  'regarding',
  'consider',
  'match',
  'option',
  'question',
  'answer',
  'not',
  'none',
  'all',
  'above',
  'below',
  'true',
  'false',
  'ka',
  'ki',
  'ke',
  'hai',
  'tha',
  'thi',
  'the',
  'ko',
  'se',
  'me',
  'mein',
  'par',
  'aur',
  'evam',
  'tatha',
  'kya',
  'kaun',
  'kis',
  'nimn',
  'likhit',
  'nimnalikhit',
  'kathan',
  'sahi',
  'galat',
  'h',
  'nahi',
  'है',
  'हैं',
  'था',
  'थी',
  'थे',
  'का',
  'की',
  'के',
  'को',
  'से',
  'में',
  'पर',
  'और',
  'एवं',
  'तथा',
  'क्या',
  'कौन',
  'किस',
  'निम्नलिखित',
  'कथनों',
  'कथन',
  'विचार',
  'कीजिए',
  'सही',
  'गलत',
  'उत्तर',
  'दीजिए',
  'विकल्प',
  'सुमेलित',
  'कौनसा',
  'नहीं',
  'एक',
  'यह',
  'वह',
  'वे',
  'करते',
  'होता',
  'होती',
  'होते',
  'दिया',
  'गया',
]);

// ============================================
// Unit Classification
// ============================================

const manualKeywords: Record<string, string[]> = {
  unit_1: [
    'indus',
    'harappa',
    'vedic',
    'mauryan',
    'gupta',
    'delhi sultanate',
    'mughal',
    'maratha',
    'freedom struggle',
    'gandhi',
    'nehru',
    'congress',
    'revolution',
    '1857',
    'buddha',
    'mahavira',
    'jain',
    'ashoka',
    'chandragupta',
    'akbar',
    'aurangzeb',
    'shivaji',
    'british',
    'viceroy',
    'governor',
    'quit india',
    'dandi',
    'swadeshi',
    'satyagraha',
    'मौर्य',
    'गुप्त',
    'मुगल',
    'स्वतंत्रता',
    'आंदोलन',
  ],
  unit_2: [
    'mp history',
    'holkar',
    'scindia',
    'bhopal state',
    'bundela',
    'baghel',
    'bhima nayak',
    'tantya bhil',
    'culture of mp',
    'folk',
    'festivals',
    'gwalior',
    'indore',
    'ujjain',
    'maheshwar',
    'mandu',
    'chanderi',
    'बुन्देला',
    'होलकर',
    'सिंधिया',
    'भोपाल',
    'ग्वालियर',
    'मध्यप्रदेश',
    'संस्कृति',
  ],
  unit_3: [
    'geography of india',
    'mountains',
    'rivers india',
    'climate india',
    'monsoon',
    'soil types',
    'minerals india',
    'population',
    'census',
    'himalaya',
    'ganga',
    'brahmaputra',
    'plateau',
    'coastal',
    'peninsula',
    'western ghats',
    'eastern ghats',
    'deccan',
    'भारत का भूगोल',
    'हिमालय',
    'नदी',
    'जलवायु',
  ],
  unit_4: [
    'mp geography',
    'forests mp',
    'wildlife mp',
    'national parks mp',
    'narmada',
    'chambal',
    'betwa',
    'tapti',
    'satpura',
    'vindhya',
    'malwa',
    'bundelkhand',
    'पन्ना',
    'कान्हा',
    'बांधवगढ़',
    'पचमढ़ी',
    'नर्मदा',
    'चम्बल',
    'मध्यप्रदेश भूगोल',
  ],
  unit_5: [
    'constitution',
    'polity',
    'president',
    'parliament',
    'supreme court',
    'fundamental rights',
    'dpsp',
    'amendment',
    'article',
    'lok sabha',
    'rajya sabha',
    'judiciary',
    'executive',
    'legislature',
    'directive principles',
    'संविधान',
    'मूल अधिकार',
    'राष्ट्रपति',
    'संसद',
    'न्यायपालिका',
  ],
  unit_6: [
    'economy',
    'gdp',
    'rbi',
    'banking',
    'budget',
    'gst',
    'poverty',
    'unemployment',
    'fiscal policy',
    'monetary policy',
    'inflation',
    'five year plan',
    'niti aayog',
    'अर्थव्यवस्था',
    'बजट',
    'मुद्रास्फीति',
    'बैंकिंग',
  ],
  unit_7: [
    'science',
    'physics',
    'chemistry',
    'biology',
    'environment',
    'pollution',
    'diseases',
    'vitamins',
    'space',
    'isro',
    'satellite',
    'ecology',
    'biodiversity',
    'greenhouse',
    'ozone',
    'विज्ञान',
    'पर्यावरण',
    'विटामिन',
    'रोग',
    'प्रदूषण',
  ],
  unit_8: [
    'current affairs',
    'sports',
    'olympics',
    'commonwealth',
    'asian games',
    'awards',
    'padma',
    'nobel',
    'cricket',
    'hockey',
    'world cup',
    'summit',
    'g20',
    'खेल',
    'पुरस्कार',
    'समसामयिक',
  ],
  unit_9: [
    'ict',
    'computer',
    'internet',
    'cyber security',
    'artificial intelligence',
    'software',
    'hardware',
    'digital',
    'कंप्यूटर',
    'इंटरनेट',
    'साइबर',
    'सॉफ्टवेयर',
  ],
  unit_10: [
    'tribes mp',
    'gond',
    'bhil',
    'baiga',
    'sahariya',
    'korku',
    'scheduled tribes',
    'adivasi',
    'जनजाति',
    'गोंड',
    'भील',
    'बैगा',
    'अनुसूचित',
  ],
};

let unitKeywordsCache: Map<string, { title: string; tokens: Set<string> }> | null = null;

function getTokens(text: string): Set<string> {
  if (!text) return new Set();
  const words = text
    .toLowerCase()
    .replace(/[^\w\u0900-\u097F\s]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
  return new Set(words);
}

function prepareUnitKeywords(): Map<string, { title: string; tokens: Set<string> }> {
  if (unitKeywordsCache) return unitKeywordsCache;

  unitKeywordsCache = new Map();
  for (const [unitId, unitData] of Object.entries(syllabusData.units)) {
    const allText = [
      unitData.title,
      unitData.title_en,
      ...(unitData.topics || []).map((t) => t.front + ' ' + t.back + ' ' + (t.details || '')),
      ...(unitData.topics_en || []).map((t) => t.front + ' ' + t.back),
      ...(manualKeywords[unitId] || []),
    ].join(' ');

    const displayTitle = unitData.unit_title || `${unitData.title} (${unitData.title_en})`;

    unitKeywordsCache.set(unitId, {
      title: displayTitle,
      tokens: getTokens(allText),
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
  const tokens = normalized.split(' ').filter((t) => t.length > 3 && !STOP_WORDS.has(t));
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
    const allQuestions = await db
      .select({
        id: questions.id,
        testId: questions.testId,
        text: questions.questionText,
        textEn: questions.questionTextEn,
        order: questions.order,
      })
      .from(questions)
      .where(inArray(questions.testId, testIds));

    // Group by year for cross-year comparison
    const questionsByYear = new Map<number, typeof allQuestions>();
    for (const q of allQuestions) {
      const year = getYearFromTestId(q.testId);
      if (!questionsByYear.has(year)) questionsByYear.set(year, []);
      questionsByYear.get(year)!.push(q);
    }

    // Union-Find for clustering similar questions
    const parent = new Map<string, string>();
    allQuestions.forEach((q) => parent.set(q.id, q.id));

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
    allQuestions.forEach((q) => {
      const root = find(q.id);
      if (!clusters.has(root)) clusters.set(root, []);
      clusters.get(root)!.push(q);
    });

    // Format results - only include if repeated across DIFFERENT years
    const result: RepeatedQuestion[] = [];

    for (const cluster of clusters.values()) {
      const yearsInCluster = new Set(cluster.map((q) => getYearFromTestId(q.testId)));

      if (yearsInCluster.size > 1) {
        // Sort by year descending to get most recent as representative
        cluster.sort((a, b) => getYearFromTestId(b.testId) - getYearFromTestId(a.testId));
        const representative = cluster[0];

        const occurrences = cluster
          .map((c) => ({
            year: getYearFromTestId(c.testId),
            qNo: c.order,
          }))
          .sort((a, b) => b.year - a.year);

        const unit = assignUnitToQuestion(
          (representative.text || '') + ' ' + (representative.textEn || '')
        );

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
    const questionIds = topRepeated.map((r) => r.questionId);

    if (questionIds.length > 0) {
      const topicData = await db
        .select({
          questionId: pyqQuestionTopics.questionId,
          topicId: pyqTopics.id,
          topicTitle: pyqTopics.topicTitle,
          topicTitleEn: pyqTopics.topicTitleEn,
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
          nameEn: t.topicTitleEn,
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
    const allQuestions = await db
      .select({
        id: questions.id,
        testId: questions.testId,
        text: questions.questionText,
        textEn: questions.questionTextEn,
        order: questions.order,
      })
      .from(questions)
      .where(inArray(questions.testId, testIds));

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
          questions: [],
        };
      }

      stats[key].count++;
      stats[key].questions.push({
        id: q.id,
        text: q.text || '',
        textEn: q.textEn,
        year,
        qNo: q.order,
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
    textEn?: string | null;
    order: number;
  }>;
}

// Map unit assignments to subject categories using normalizeSubject function
function mapUnitToSubject(unitId: string, unitTitle: string): { id: string; title: string } {
  // Use actual subject normalization logic
  let rawSubject = '';

  switch (unitId) {
    case 'unit_1':
      rawSubject = 'Indian History';
      break;
    case 'unit_2':
      rawSubject = 'MP GK';
      break;
    case 'unit_3':
      rawSubject = 'Geography';
      break;
    case 'unit_4':
      rawSubject = 'MP GK'; // MP Geography = MP GK
      break;
    case 'unit_5':
      rawSubject = 'Indian Polity';
      break;
    case 'unit_6':
      rawSubject = 'Economy';
      break;
    case 'unit_7':
      rawSubject = 'General Science';
      break;
    case 'unit_8':
      rawSubject = 'Current Affairs';
      break;
    case 'unit_9':
      rawSubject = 'ICT';
      break;
    case 'unit_10':
      rawSubject = 'MP GK'; // Tribes = MP GK
      break;
    case 'unmapped':
      rawSubject = 'General Studies';
      break;
    default:
      rawSubject = 'General Studies';
  }

  // Normalize using the actual function
  const normalizedSubject = normalizeSubject(rawSubject);

  return {
    id: normalizedSubject.toLowerCase().replace(/\s+/g, '-'),
    title: normalizedSubject,
  };
}

export async function getSubjectDistributionStats(): Promise<SubjectDistributionStats[]> {
  try {
    // Use unified stats function for consistency
    const unifiedStats = await getUnifiedSubjectStats();

    // Convert to legacy format for backwards compatibility
    const subjectDistributionStats: SubjectDistributionStats[] = [];

    for (const stats of unifiedStats) {
      for (const [year, count] of Object.entries(stats.yearBreakdown)) {
        subjectDistributionStats.push({
          year: Number(year),
          subjectId: stats.subject.toLowerCase().replace(/\s+/g, '-'),
          subjectTitle: stats.subject,
          count: count,
          questions: stats.questionsByYear[Number(year)] || [],
        });
      }
    }

    // Sort by year and subject
    return subjectDistributionStats.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.subjectTitle.localeCompare(b.subjectTitle);
    });
  } catch (error) {
    console.error('Error in Subject Distribution Analysis:', error);
    return [];
  }
}

// ============================================
// UNIFIED SUBJECT DISTRIBUTION - Used by BOTH pages
// This ensures Intelligence and Topic Analysis show identical numbers
// ============================================

export interface UnifiedSubjectStats {
  subject: string;
  totalQuestions: number;
  yearBreakdown: Record<number, number>;
  questionsByYear: Record<
    number,
    Array<{
      id: string;
      text: string;
      textEn?: string | null;
      order: number;
    }>
  >;
}

export async function getUnifiedSubjectStats(): Promise<UnifiedSubjectStats[]> {
  try {
    // Get question-topic mappings directly from canonical tests with bilingual support
    const questionTopics = await db
      .select({
        questionId: pyqQuestionTopics.questionId,
        testId: questions.testId,
        topicTitle: pyqTopics.topicTitle,
        questionText: questions.questionText, // Hindi
        questionTextEn: questions.questionTextEn, // English
        questionOrder: questions.order,
      })
      .from(pyqQuestionTopics)
      .leftJoin(questions, eq(pyqQuestionTopics.questionId, questions.id))
      .leftJoin(pyqTopics, eq(pyqQuestionTopics.topicId, pyqTopics.id))
      .where(inArray(questions.testId, Object.values(CANONICAL_TEST_IDS)));

    // Group by normalized subject
    const subjectGroups: Record<string, UnifiedSubjectStats> = {};

    for (const mapping of questionTopics) {
      if (!mapping.testId || !mapping.topicTitle) continue;

      // Get year from test ID using canonical mapping
      const year = getYearFromTestId(mapping.testId);
      if (!year) continue;

      const normalizedSubject = normalizeSubject(mapping.topicTitle);

      if (!subjectGroups[normalizedSubject]) {
        subjectGroups[normalizedSubject] = {
          subject: normalizedSubject,
          totalQuestions: 0,
          yearBreakdown: {},
          questionsByYear: {},
        };
      }

      const stats = subjectGroups[normalizedSubject];
      stats.totalQuestions += 1;
      stats.yearBreakdown[year] = (stats.yearBreakdown[year] || 0) + 1;

      if (!stats.questionsByYear[year]) {
        stats.questionsByYear[year] = [];
      }

      stats.questionsByYear[year].push({
        id: mapping.questionId,
        text: mapping.questionText || '',
        textEn: mapping.questionTextEn,
        order: mapping.questionOrder || 0,
      });
    }

    // Sort questions within each year by order
    for (const stats of Object.values(subjectGroups)) {
      for (const year of Object.keys(stats.questionsByYear)) {
        stats.questionsByYear[Number(year)].sort((a, b) => a.order - b.order);
      }
    }

    // Sort by total questions (descending)
    return Object.values(subjectGroups).sort((a, b) => b.totalQuestions - a.totalQuestions);
  } catch (error) {
    console.error('Error in Unified Subject Stats:', error);
    return [];
  }
}

export async function getMostRepeatedTopics(): Promise<Record<string, TopicStat[]>> {
  try {
    const testIds = getCanonicalTestIds();

    // Fetch questions with their topics
    const topicData = await db
      .select({
        testId: questions.testId,
        questionId: questions.id,
        questionText: questions.questionText,
        questionTextEn: questions.questionTextEn,
        questionOrder: questions.order,
        topicId: pyqTopics.id,
        topicSlug: pyqTopics.topicSlug,
        topicTitle: pyqTopics.topicTitle,
        topicTitleEn: pyqTopics.topicTitleEn,
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
          questions: [],
        });
      }

      const stat = unitTopics[unitId].get(topicKey)!;
      stat.count++;
      if (!stat.years.includes(year)) stat.years.push(year);
      if (!stat.questions.some((q) => q.id === row.questionId)) {
        stat.questions.push({
          id: row.questionId,
          text: row.questionText || '',
          textEn: row.questionTextEn,
          year,
          qNo: row.questionOrder,
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

// ============================================
// GET QUESTIONS BY SUBJECT - Unified Approach
// Used by the subject-wise quiz play functionality
// Uses the same topic mapping as Intelligence page
// ============================================
export async function getQuestionsBySubjectUnified(subject: string) {
  try {
    const unifiedStats = await getUnifiedSubjectStats();
    const subjectData = unifiedStats.find(s => s.subject === subject);
    
    if (!subjectData) {
      return [];
    }

    // Flatten all questions from all years for this subject
    const allQuestions: Array<{
      id: string;
      questionText: string;
      questionTextEn?: string | null;
      order: number;
      year: number;
    }> = [];

    for (const [year, questions] of Object.entries(subjectData.questionsByYear)) {
      questions.forEach(q => {
        allQuestions.push({
          id: q.id,
          questionText: q.text,
          questionTextEn: q.textEn,
          order: q.order,
          year: Number(year),
        });
      });
    }

    // Get full question details for these question IDs
    if (allQuestions.length === 0) return [];
    
    const fullQuestions = await db
      .select()
      .from(questions)
      .where(inArray(questions.id, allQuestions.map(q => q.id)));

    // Create a map for year lookup from allQuestions
    const yearMap = new Map(allQuestions.map(q => [q.id, q.year]));

    // Sort by year (newest first), then by order within year
    return fullQuestions.sort((a, b) => {
      const yearA = yearMap.get(a.id) || 0;
      const yearB = yearMap.get(b.id) || 0;
      if (yearA !== yearB) return yearB - yearA;
      return (a.order || 0) - (b.order || 0);
    });
  } catch (error) {
    console.error('Error in getQuestionsBySubjectUnified:', error);
    return [];
  }
}
