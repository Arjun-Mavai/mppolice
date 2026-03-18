'use server';

import { randomUUID } from 'crypto';
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import {
  pyqFactBank,
  pyqQuestionTopics,
  pyqTopicTrends,
  pyqTopics,
  questions,
  tests,
} from '@/db/schema';
import {
  getScopedStateServiceYear,
  PYQ_SCOPE_END_YEAR,
  PYQ_SCOPE_START_YEAR,
} from '@/features/tests/utils/pyq-scope';
import { normalizeSubject } from '@/features/tests/utils/pyq-subject';
import { logger } from '@/lib/logger';

const CURRENT_YEAR = new Date().getFullYear();
const PYQ_INSIGHTS_TABLES = ['pyq_fact_bank', 'pyq_topic_trends', 'pyq_topics', 'pyq_question_topics'];

const toErrorString = (error: unknown): string => {
  if (error instanceof Error) {
    const cause = (error as Error & { cause?: unknown }).cause;
    const causeMessage =
      cause && typeof cause === 'object' && 'message' in cause
        ? String((cause as { message?: unknown }).message)
        : '';
    return `${error.message} ${causeMessage}`.trim();
  }
  return String(error);
};

const isMissingInsightsTableError = (error: unknown): boolean => {
  const message = toErrorString(error).toLowerCase();
  return (
    message.includes('no such table') &&
    PYQ_INSIGHTS_TABLES.some((tableName) => message.includes(tableName))
  );
};

const getTestYear = (title: string, createdAt: Date | null): number => {
  const titleYear = title.match(/\b(19|20)\d{2}\b/)?.[0];
  if (titleYear) return Number(titleYear);
  return createdAt ? new Date(createdAt).getFullYear() : CURRENT_YEAR;
};

type ScopedTest = {
  testId: string;
  year: number;
  questionCount: number;
};

export const getScopedPyqTests = async (
  fromYear = PYQ_SCOPE_START_YEAR,
  toYear = PYQ_SCOPE_END_YEAR
): Promise<ScopedTest[]> => {
  const rows = await db
    .select({
      testId: tests.id,
      testTitle: tests.title,
      questionCount: sql<number>`count(${questions.id})`,
    })
    .from(tests)
    .leftJoin(questions, eq(questions.testId, tests.id))
    .where(eq(tests.type, 'PYQ'))
    .groupBy(tests.id, tests.title);

  const byYear = new Map<number, ScopedTest>();
  rows.forEach((row) => {
    const year = getScopedStateServiceYear(row.testTitle);
    if (year === null || year < fromYear || year > toYear) return;
    const candidate: ScopedTest = {
      testId: row.testId,
      year,
      questionCount: Number(row.questionCount),
    };
    const existing = byYear.get(year);
    if (!existing || candidate.questionCount > existing.questionCount) {
      byYear.set(year, candidate);
    }
  });

  return [...byYear.values()].sort((a, b) => a.year - b.year);
};

export interface PyqFactItem {
  id: string;
  subject: string;
  topicSlug: string;
  topicTitle: string;
  topicTitleEn: string | null;
  factText: string;
  factTextEn: string | null;
  memoryTip: string | null;
  memoryTipEn: string | null;
  scamAlert: string | null;
  scamAlertEn: string | null;
  importanceScore: number | null;
  frequencyScore: number | null;
  pyqRefs: { testId?: string; questionId?: string; year?: number }[];
  tags: string[] | null;
  enrichedRefs?: {
    questionId: string;
    testTitle: string;
    testTitleEn: string | null;
    year: number;
    questionOrder: number;
  }[];
}

export interface PyqTopicAnalysisItem {
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  topicTitleEn: string | null;
  totalQuestions: number;
  latestYearCount: number;
  latestWeightPercent: number;
  trendDelta: number;
}

export interface PyqYearMatrixItem {
  year: number;
  questionCount: number;
}

export interface PyqAnalysisResult {
  subject: string;
  fromYear: number;
  toYear: number;
  topicDistribution: PyqTopicAnalysisItem[];
  yearMatrix: PyqYearMatrixItem[];
  risingTopics: PyqTopicAnalysisItem[];
  topicYearBreakdown: {
    topicId: string;
    topicTitle: string;
    topicTitleEn: string | null;
    years: PyqYearMatrixItem[];
  }[];
}

export interface PyqInsightSubjectItem {
  subject: string;
  factCount: number;
  topicCount: number;
}

export interface PyqTopicDeepLearning {
  must_know_lists?: {
    list_title: string;
    list_title_en?: string;
    items: string[];
    items_en?: string[];
    memory_hook?: string;
    memory_hook_en?: string;
  }[];
  concept_capsule?: string;
  concept_capsule_en?: string;
  practice_prompts?: string[];
  practice_prompts_en?: string[];
}

export interface PyqInsightTopicItem {
  topicSlug: string;
  topicTitle: string;
  topicTitleEn: string | null;
  factCount: number;
  aiContent?: PyqTopicDeepLearning | null;
}

export interface PyqInsightsCoverageYearItem {
  year: number;
  pyqQuestionCount: number;
  mappedQuestionCount: number;
}

export interface PyqInsightsCoverageSummary {
  fromYear: number;
  toYear: number;
  pyqQuestionCount: number;
  mappedQuestionCount: number;
  mappingCoveragePercent: number;
  publishedFactCount: number;
  years: PyqInsightsCoverageYearItem[];
}

export const getPublishedPyqFacts = unstable_cache(
  async (
    subject: string,
    topicSlug?: string,
    year?: number,
    limit = 50
  ): Promise<{
    subject: string;
    topicSlug?: string;
    year?: number;
    facts: PyqFactItem[];
  }> => {
    const effectiveSubject = normalizeSubject(subject);
    const safeLimit = Math.min(Math.max(limit, 1), 200);

    try {
      const conditions = [eq(pyqFactBank.status, 'published'), eq(pyqFactBank.subject, effectiveSubject)];
      if (topicSlug && topicSlug !== 'all') {
        conditions.push(eq(pyqTopics.topicSlug, topicSlug));
      }

      const rows = await db
        .select({
          id: pyqFactBank.id,
          subject: pyqFactBank.subject,
          topicSlug: pyqTopics.topicSlug,
          topicTitle: pyqTopics.topicTitle,
          topicTitleEn: pyqTopics.topicTitleEn,
          factText: pyqFactBank.factText,
          factTextEn: pyqFactBank.factTextEn,
          memoryTip: pyqFactBank.memoryTip,
          memoryTipEn: pyqFactBank.memoryTipEn,
          scamAlert: pyqFactBank.scamAlert,
          scamAlertEn: pyqFactBank.scamAlertEn,
          importanceScore: pyqFactBank.importanceScore,
          frequencyScore: pyqFactBank.frequencyScore,
          pyqRefs: pyqFactBank.pyqRefs,
          tags: pyqFactBank.tags,
        })
        .from(pyqFactBank)
        .innerJoin(pyqTopics, eq(pyqFactBank.topicId, pyqTopics.id))
        .where(and(...conditions))
        .orderBy(desc(pyqFactBank.importanceScore), desc(pyqFactBank.frequencyScore))
        .limit(year ? 1000 : safeLimit); // Fetch more if filtering by year in JS

      // Extract all question IDs to fetch metadata
      const allQuestionIds = new Set<string>();
      rows.forEach((row) => {
        row.pyqRefs?.forEach((ref) => {
          if (ref.questionId) allQuestionIds.add(ref.questionId);
        });
      });

      const questionMetadata = new Map<
        string,
        { title: string; titleEn: string | null; year: number; order: number }
      >();

      if (allQuestionIds.size > 0) {
        try {
          const metadataRows = await db
            .select({
              questionId: questions.id,
              testTitle: tests.title,
              testTitleEn: tests.titleEn,
              testCreatedAt: tests.createdAt,
              questionOrder: questions.order,
            })
            .from(questions)
            .innerJoin(tests, eq(questions.testId, tests.id))
            .where(inArray(questions.id, Array.from(allQuestionIds)));

          metadataRows.forEach((meta) => {
            questionMetadata.set(meta.questionId, {
              title: meta.testTitle,
              titleEn: meta.testTitleEn,
              year: getTestYear(meta.testTitle, meta.testCreatedAt),
              order: meta.questionOrder,
            });
          });
        } catch (metaError) {
          logger.warn('Failed to fetch question metadata for facts', {
            category: 'system',
            error: String(metaError),
          });
        }
      }

      let facts = rows.map((row) => {
          const enrichedRefs = row.pyqRefs
          ?.filter(r => r.questionId && questionMetadata.has(r.questionId))
          .map(r => {
              const meta = questionMetadata.get(r.questionId!)!;
              return {
                  questionId: r.questionId!,
                  testTitle: meta.title,
                  testTitleEn: meta.titleEn,
                  year: meta.year,
                  questionOrder: meta.order
              };
          }) || [];

          return {
            ...row,
            pyqRefs: row.pyqRefs ?? [],
            tags: row.tags ?? null,
            enrichedRefs
          };
      });

      // Apply Year filter if present
      if (year && year !== 0) {
        facts = facts.filter(f => 
          f.enrichedRefs.some(ref => ref.year === year) || 
          f.pyqRefs.some(ref => ref.year === year)
        );
      }

      return {
        subject: effectiveSubject,
        topicSlug,
        year,
        facts: facts.slice(0, safeLimit),
      };
    } catch (error) {
      if (isMissingInsightsTableError(error)) {
        logger.warn('PYQ insights tables missing; returning empty facts payload', {
          category: 'system',
        });
        return { subject: effectiveSubject, topicSlug, year, facts: [] };
      }
      throw error;
    }
  },
  ['pyq-insights-facts'],
  { revalidate: 3600, tags: ['pyq-insights', 'pyq-facts'] }
);

export const getPyqTopicAnalysis = unstable_cache(
  async (subject: string, years = 5): Promise<PyqAnalysisResult> => {
    const effectiveSubject = normalizeSubject(subject);
    const safeYears = Math.min(Math.max(years, 1), 15);
    const toYear = 2025; // DB's max year for PYQs currently
    const fromYear = toYear - (safeYears - 1);

    type TrendRow = {
      topicId: string;
      topicSlug: string;
      topicTitle: string;
      topicTitleEn: string | null;
      year: number;
      questionCount: number;
      weightPercent: number;
      trendDelta: number | null;
    };

    let trendRows: TrendRow[] = [];
    try {
      trendRows = await db
        .select({
          topicId: pyqTopicTrends.topicId,
          topicSlug: pyqTopics.topicSlug,
          topicTitle: pyqTopics.topicTitle,
          topicTitleEn: pyqTopics.topicTitleEn,
          year: pyqTopicTrends.year,
          questionCount: pyqTopicTrends.questionCount,
          weightPercent: pyqTopicTrends.weightPercent,
          trendDelta: pyqTopicTrends.trendDelta,
        })
        .from(pyqTopicTrends)
        .innerJoin(pyqTopics, eq(pyqTopicTrends.topicId, pyqTopics.id))
        .where(and(eq(pyqTopicTrends.subject, effectiveSubject), gte(pyqTopicTrends.year, fromYear)));
    } catch (error) {
      if (isMissingInsightsTableError(error)) {
        logger.warn('PYQ insights tables missing; returning empty analysis payload', {
          category: 'system',
        });
      } else {
        throw error;
      }
    }

    // If trend snapshot is empty for this subject, build a fallback from published facts + pyq_refs.
    if (trendRows.length === 0) {
      const fallbackRows = await db
        .select({
          topicId: pyqFactBank.topicId,
          topicSlug: pyqTopics.topicSlug,
          topicTitle: pyqTopics.topicTitle,
          topicTitleEn: pyqTopics.topicTitleEn,
          pyqRefs: pyqFactBank.pyqRefs,
        })
        .from(pyqFactBank)
        .innerJoin(pyqTopics, eq(pyqFactBank.topicId, pyqTopics.id))
        .where(and(eq(pyqFactBank.subject, effectiveSubject), eq(pyqFactBank.status, 'published')));

      const dedupe = new Set<string>();
      const topicYearCount = new Map<string, number>();
      for (const row of fallbackRows) {
        const refs = row.pyqRefs ?? [];
        for (const ref of refs) {
          const year = ref.year;
          if (!year || year < fromYear) continue;
          const uniq = `${row.topicId}::${year}::${ref.questionId ?? 'na'}`;
          if (dedupe.has(uniq)) continue;
          dedupe.add(uniq);
          const key = `${row.topicId}::${year}`;
          topicYearCount.set(key, (topicYearCount.get(key) ?? 0) + 1);
        }
      }

      const byTopic = new Map<string, { slug: string; title: string; titleEn: string | null }>();
      for (const row of fallbackRows) {
        byTopic.set(row.topicId, {
          slug: row.topicSlug,
          title: row.topicTitle,
          titleEn: row.topicTitleEn,
        });
      }

      const subjectYearTotals = new Map<number, number>();
      for (const [key, count] of topicYearCount.entries()) {
        const [, y] = key.split('::');
        const year = Number(y);
        subjectYearTotals.set(year, (subjectYearTotals.get(year) ?? 0) + count);
      }

      trendRows = [...topicYearCount.entries()].map(([key, count]) => {
        const [topicId, y] = key.split('::');
        const year = Number(y);
        const meta = byTopic.get(topicId);
        const total = subjectYearTotals.get(year) ?? 0;
        return {
          topicId,
          topicSlug: meta?.slug ?? topicId,
          topicTitle: meta?.title ?? topicId,
          topicTitleEn: meta?.titleEn ?? null,
          year,
          questionCount: count,
          weightPercent: total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0,
          trendDelta: null,
        };
      });
    }

    const topicMap = new Map<
      string,
      PyqTopicAnalysisItem & {
        latestYear: number;
      }
    >();
    const yearMap = new Map<number, number>();
    const topicYearMap = new Map<string, Map<number, number>>();

    for (const row of trendRows) {
      yearMap.set(row.year, (yearMap.get(row.year) ?? 0) + row.questionCount);
      const yMap = topicYearMap.get(row.topicId) ?? new Map<number, number>();
      yMap.set(row.year, row.questionCount);
      topicYearMap.set(row.topicId, yMap);

      const existing = topicMap.get(row.topicId);
      if (!existing) {
        topicMap.set(row.topicId, {
          topicId: row.topicId,
          topicSlug: row.topicSlug,
          topicTitle: row.topicTitle,
          topicTitleEn: row.topicTitleEn,
          totalQuestions: row.questionCount,
          latestYearCount: row.questionCount,
          latestWeightPercent: row.weightPercent,
          trendDelta: row.trendDelta ?? 0,
          latestYear: row.year,
        });
        continue;
      }

      existing.totalQuestions += row.questionCount;
      if (row.year >= existing.latestYear) {
        existing.latestYearCount = row.questionCount;
        existing.latestWeightPercent = row.weightPercent;
        existing.trendDelta = row.trendDelta ?? 0;
        existing.latestYear = row.year;
      }
    }

    const topicDistribution = [...topicMap.values()]
      .map((item) => ({
        topicId: item.topicId,
        topicSlug: item.topicSlug,
        topicTitle: item.topicTitle,
        topicTitleEn: item.topicTitleEn,
        totalQuestions: item.totalQuestions,
        latestYearCount: item.latestYearCount,
        latestWeightPercent: item.latestWeightPercent,
        trendDelta: item.trendDelta,
      }))
      .sort((a, b) => b.totalQuestions - a.totalQuestions);
    const yearMatrix = [...yearMap.entries()]
      .map(([year, questionCount]) => ({ year, questionCount }))
      .sort((a, b) => a.year - b.year);
    const risingTopics = [...topicDistribution]
      .filter((item) => item.trendDelta > 0)
      .sort((a, b) => b.trendDelta - a.trendDelta)
      .slice(0, 8);
    const topicYearBreakdown = [...topicDistribution].map((topic) => ({
      topicId: topic.topicId,
      topicTitle: topic.topicTitle,
      topicTitleEn: topic.topicTitleEn,
      years: [...(topicYearMap.get(topic.topicId)?.entries() ?? [])]
        .map(([year, questionCount]) => ({ year, questionCount }))
        .sort((a, b) => a.year - b.year),
    }));

    return {
      subject: effectiveSubject,
      fromYear,
      toYear: CURRENT_YEAR,
      topicDistribution,
      yearMatrix,
      risingTopics,
      topicYearBreakdown,
    };
  },
  ['pyq-insights-analysis'],
  { revalidate: 3600, tags: ['pyq-insights', 'pyq-trends'] }
);

const chunkArray = <T>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export const getPublishedPyqFactsByYear = unstable_cache(
  async (
    year: number,
    limit = 100
  ): Promise<{
    year: number;
    facts: PyqFactItem[];
  }> => {
    const safeLimit = Math.min(Math.max(limit, 1), 300);
    try {
      const rows = await db
        .select({
          id: pyqFactBank.id,
          subject: pyqFactBank.subject,
          topicSlug: pyqTopics.topicSlug,
          topicTitle: pyqTopics.topicTitle,
          topicTitleEn: pyqTopics.topicTitleEn,
          factText: pyqFactBank.factText,
          factTextEn: pyqFactBank.factTextEn,
          memoryTip: pyqFactBank.memoryTip,
          memoryTipEn: pyqFactBank.memoryTipEn,
          scamAlert: pyqFactBank.scamAlert,
          scamAlertEn: pyqFactBank.scamAlertEn,
          importanceScore: pyqFactBank.importanceScore,
          frequencyScore: pyqFactBank.frequencyScore,
          pyqRefs: pyqFactBank.pyqRefs,
          tags: pyqFactBank.tags,
        })
        .from(pyqFactBank)
        .innerJoin(pyqTopics, eq(pyqFactBank.topicId, pyqTopics.id))
        .where(eq(pyqFactBank.status, 'published'))
        .orderBy(desc(pyqFactBank.importanceScore), desc(pyqFactBank.frequencyScore))
        .limit(3000);

      const allQuestionIds = new Set<string>();
      rows.forEach((row) => {
        row.pyqRefs?.forEach((ref) => {
          if (ref.questionId) allQuestionIds.add(ref.questionId);
        });
      });

      const questionYearById = new Map<string, number>();
      if (allQuestionIds.size > 0) {
        const qIds = Array.from(allQuestionIds);
        const chunks = chunkArray(qIds, 200);
        
        for (const chunk of chunks) {
          const metadataRows = await db
            .select({
              questionId: questions.id,
              testTitle: tests.title,
              testCreatedAt: tests.createdAt,
            })
            .from(questions)
            .innerJoin(tests, eq(questions.testId, tests.id))
            .where(inArray(questions.id, chunk));

          metadataRows.forEach((meta) => {
            questionYearById.set(meta.questionId, getTestYear(meta.testTitle, meta.testCreatedAt));
          });
        }
      }

      const filtered = rows
        .filter((row) =>
          (row.pyqRefs ?? []).some((ref) => {
            const resolvedYear =
              typeof ref.year === 'number' && Number.isFinite(ref.year)
                ? ref.year
                : ref.questionId
                  ? questionYearById.get(ref.questionId)
                  : undefined;
            return resolvedYear === year;
          })
        )
        .slice(0, safeLimit)
        .map((row) => ({
          ...row,
          pyqRefs: row.pyqRefs ?? [],
          tags: row.tags ?? null,
        }));

      return { year, facts: filtered };
    } catch (error) {
      if (isMissingInsightsTableError(error)) {
        logger.warn('PYQ insights tables missing; returning empty yearly facts payload', {
          category: 'system',
        });
        return { year, facts: [] };
      }
      throw error;
    }
  },
  ['pyq-insights-facts-by-year'],
  { revalidate: 3600, tags: ['pyq-insights', 'pyq-facts'] }
);

export const getPyqInsightsCoverageSummary = unstable_cache(
  async (
    startYear = 2020,
    endYear = CURRENT_YEAR
  ): Promise<PyqInsightsCoverageSummary> => {
    const from = Math.min(startYear, endYear);
    const to = Math.max(startYear, endYear);
    try {
      const scopedTests = await getScopedPyqTests(from, to);
      const scopedTestIds = scopedTests.map((item) => item.testId);

      const pyqRows = scopedTestIds.length
        ? await db
        .select({
          questionId: questions.id,
          testTitle: tests.title,
          testCreatedAt: tests.createdAt,
        })
        .from(questions)
        .innerJoin(tests, eq(questions.testId, tests.id))
            .where(inArray(questions.testId, scopedTestIds))
        : [];

      const pyqByYear = new Map<number, Set<string>>();
      for (const row of pyqRows) {
        const year = getTestYear(row.testTitle, row.testCreatedAt);
        if (year < from || year > to) continue;
        const set = pyqByYear.get(year) ?? new Set<string>();
        set.add(row.questionId);
        pyqByYear.set(year, set);
      }

      const mappedRows = scopedTestIds.length
        ? await db
        .select({
          questionId: pyqQuestionTopics.questionId,
          testTitle: tests.title,
          testCreatedAt: tests.createdAt,
        })
        .from(pyqQuestionTopics)
        .innerJoin(questions, eq(pyqQuestionTopics.questionId, questions.id))
        .innerJoin(tests, eq(questions.testId, tests.id))
            .where(inArray(questions.testId, scopedTestIds))
        : [];

      const mappedByYear = new Map<number, Set<string>>();
      for (const row of mappedRows) {
        const year = getTestYear(row.testTitle, row.testCreatedAt);
        if (year < from || year > to) continue;
        const set = mappedByYear.get(year) ?? new Set<string>();
        set.add(row.questionId);
        mappedByYear.set(year, set);
      }

      const factRows = await db
        .select({ id: pyqFactBank.id })
        .from(pyqFactBank)
        .where(eq(pyqFactBank.status, 'published'));

      const years: PyqInsightsCoverageYearItem[] = [];
      let pyqQuestionCount = 0;
      let mappedQuestionCount = 0;
      for (let y = from; y <= to; y += 1) {
        const pyqCount = pyqByYear.get(y)?.size ?? 0;
        const mappedCount = mappedByYear.get(y)?.size ?? 0;
        pyqQuestionCount += pyqCount;
        mappedQuestionCount += mappedCount;
        years.push({
          year: y,
          pyqQuestionCount: pyqCount,
          mappedQuestionCount: mappedCount,
        });
      }

      return {
        fromYear: from,
        toYear: to,
        pyqQuestionCount,
        mappedQuestionCount,
        mappingCoveragePercent:
          pyqQuestionCount > 0
            ? Number(((mappedQuestionCount / pyqQuestionCount) * 100).toFixed(2))
            : 0,
        publishedFactCount: factRows.length,
        years,
      };
    } catch (error) {
      if (isMissingInsightsTableError(error)) {
        logger.warn('PYQ insights tables missing; returning empty coverage summary', {
          category: 'system',
        });
        return {
          fromYear: from,
          toYear: to,
          pyqQuestionCount: 0,
          mappedQuestionCount: 0,
          mappingCoveragePercent: 0,
          publishedFactCount: 0,
          years: Array.from({ length: to - from + 1 }, (_, idx) => ({
            year: from + idx,
            pyqQuestionCount: 0,
            mappedQuestionCount: 0,
          })),
        };
      }
      throw error;
    }
  },
  ['pyq-insights-coverage'],
  { revalidate: 3600, tags: ['pyq-insights', 'pyq-trends', 'pyq-facts'] }
);

export const getPyqInsightSubjects = unstable_cache(
  async (): Promise<PyqInsightSubjectItem[]> => {
    try {
      const rows = await db
        .select({
          subject: pyqTopics.subject,
          factCount: sql<number>`count(${pyqFactBank.id})`,
          topicCount: sql<number>`count(distinct ${pyqTopics.id})`,
        })
        .from(pyqTopics)
        .leftJoin(
          pyqFactBank,
          and(eq(pyqFactBank.topicId, pyqTopics.id), eq(pyqFactBank.status, 'published'))
        )
        .where(eq(pyqTopics.isActive, true))
        .groupBy(pyqTopics.subject)
        .orderBy(desc(sql<number>`count(${pyqFactBank.id})`));

      return rows.map((row) => ({
        subject: row.subject,
        factCount: Number(row.factCount),
        topicCount: Number(row.topicCount),
      }));
    } catch (error) {
      if (isMissingInsightsTableError(error)) {
        logger.warn('PYQ insights tables missing; returning empty subject summary', {
          category: 'system',
        });
        return [];
      }
      throw error;
    }
  },
  ['pyq-insights-subjects'],
  { revalidate: 3600, tags: ['pyq-insights', 'pyq-facts'] }
);

export const getPyqPublishedTopicsBySubject = unstable_cache(
  async (subject: string): Promise<PyqInsightTopicItem[]> => {
    const effectiveSubject = normalizeSubject(subject);

    try {
      // 1. Get ALL active topics for this subject (so we show topics even with 0 facts if they have AI content)
      const topicsData = await db
        .select({
          id: pyqTopics.id,
          topicSlug: pyqTopics.topicSlug,
          topicTitle: pyqTopics.topicTitle,
          topicTitleEn: pyqTopics.topicTitleEn,
          aiContent: pyqTopics.aiContent,
        })
        .from(pyqTopics)
        .where(and(eq(pyqTopics.subject, effectiveSubject), eq(pyqTopics.isActive, true)));

      if (topicsData.length === 0) return [];

      const topicIds = topicsData.map((t) => t.id);

      // 2. Get fact counts for these topics (published only)
      const counts = await db
        .select({
          topicId: pyqFactBank.topicId,
          factCount: sql<number>`count(*)`.mapWith(Number),
        })
        .from(pyqFactBank)
        .where(
          and(
            eq(pyqFactBank.status, 'published'),
            inArray(pyqFactBank.topicId, topicIds)
          )
        )
        .groupBy(pyqFactBank.topicId);

      const countMap = new Map<string, number>();
      counts.forEach((c) => {
        if (c.topicId) countMap.set(c.topicId, c.factCount);
      });

      // 3. Merge and sort
      return topicsData
        .map((t) => ({
          topicSlug: t.topicSlug,
          topicTitle: t.topicTitle,
          topicTitleEn: t.topicTitleEn,
          aiContent: (t.aiContent as PyqTopicDeepLearning) ?? null,
          factCount: countMap.get(t.id) ?? 0,
        }))
        .sort((a, b) => {
          // Sort by fact count desc, then title
          if (b.factCount !== a.factCount) return b.factCount - a.factCount;
          return a.topicTitle.localeCompare(b.topicTitle);
        });
    } catch (error) {
      if (isMissingInsightsTableError(error)) {
        logger.warn('PYQ insights tables missing; returning empty topic summary', {
          category: 'system',
        });
        return [];
      }
      throw error;
    }
  },
  ['pyq-insights-topics'],
  { revalidate: 3600, tags: ['pyq-insights', 'pyq-facts'] }
);

// ONE-OFF SCRIPT TO FETCH UNMAPPED QUESTIONS
export async function getUnmappedPyqQuestionsData() {
  const from = 2020;
  const to = 2025;
  const scopedTests = await getScopedPyqTests(from, to);
  const scopedTestIds = scopedTests.map((item) => item.testId);

  if (scopedTestIds.length === 0) return [];

  // 1. Get ALL questions in these tests
  const allPyqQuestions = await db
    .select({
      id: questions.id,
      text: questions.questionText,
      testTitle: tests.title,
    })
    .from(questions)
    .innerJoin(tests, eq(questions.testId, tests.id))
    .where(inArray(questions.testId, scopedTestIds));

  // 2. Get ALL mapped questions
  const mappedQuestions = await db
    .select({
      id: pyqQuestionTopics.questionId,
    })
    .from(pyqQuestionTopics)
    .innerJoin(questions, eq(pyqQuestionTopics.questionId, questions.id))
    .where(inArray(questions.testId, scopedTestIds));

  const mappedIds = new Set(mappedQuestions.map((q) => q.id));

  // 3. Filter for unmapped
  const unmapped = allPyqQuestions.filter((q) => !mappedIds.has(q.id));

  return unmapped;
}

export async function recomputePyqTopicTrends(years?: number[]) {
  // Always fetch ALL scoped tests to ensure we have full history for delta calculations
  const scopedTests = await getScopedPyqTests(PYQ_SCOPE_START_YEAR, PYQ_SCOPE_END_YEAR);
  
  const requestedYears =
    years && years.length > 0
      ? years.filter((y) => y >= PYQ_SCOPE_START_YEAR && y <= PYQ_SCOPE_END_YEAR)
      : null;

  // We need ALL scoped tests to calculate correct deltas, even if we only update specific years
  const scopedTestIds = scopedTests.map((item) => item.testId);

  const mappedRows = scopedTestIds.length
    ? await db
        .select({
          topicId: pyqQuestionTopics.topicId,
          questionId: questions.id,
          subject: pyqTopics.subject,
          testTitle: tests.title,
          testCreatedAt: tests.createdAt,
        })
        .from(pyqQuestionTopics)
        .innerJoin(questions, eq(pyqQuestionTopics.questionId, questions.id))
        .innerJoin(tests, eq(questions.testId, tests.id))
        .innerJoin(pyqTopics, eq(pyqQuestionTopics.topicId, pyqTopics.id))
        .where(inArray(questions.testId, scopedTestIds))
    : [];

  // We don't filter mappedRows by year here because we need previous years to calculate deltas.
  // We will filter the final output (insertRows) instead.

  const topicYearCount = new Map<string, number>();
  const subjectYearTotals = new Map<string, number>();
  const topicSubject = new Map<string, string>();

  for (const row of mappedRows) {
    const year = getTestYear(row.testTitle, row.testCreatedAt);
    // REMOVED yearFilter check here to allow calculating full history
    
    topicSubject.set(row.topicId, row.subject);

    const topicKey = `${row.topicId}::${year}`;
    topicYearCount.set(topicKey, (topicYearCount.get(topicKey) ?? 0) + 1);

    const subjectYearKey = `${row.subject}::${year}`;
    subjectYearTotals.set(subjectYearKey, (subjectYearTotals.get(subjectYearKey) ?? 0) + 1);
  }

  const topicYearRows = [...topicYearCount.entries()].map(([key, count]) => {
    const [topicId, yearRaw] = key.split('::');
    const year = Number(yearRaw);
    return { topicId, year, count };
  });

  const topicHistory = new Map<string, Map<number, number>>();
  for (const row of topicYearRows) {
    const map = topicHistory.get(row.topicId) ?? new Map<number, number>();
    map.set(row.year, row.count);
    topicHistory.set(row.topicId, map);
  }

  let insertRows = topicYearRows.map((row) => {
    const subject = topicSubject.get(row.topicId) ?? 'Misc';
    const subjectYearTotal = subjectYearTotals.get(`${subject}::${row.year}`) ?? 0;
    const history = topicHistory.get(row.topicId) ?? new Map<number, number>();
    const prevYearCount = history.get(row.year - 1) ?? 0;

    return {
      id: randomUUID(),
      topicId: row.topicId,
      subject,
      year: row.year,
      questionCount: row.count,
      weightPercent: subjectYearTotal > 0 ? Number(((row.count / subjectYearTotal) * 100).toFixed(2)) : 0,
      trendDelta: row.count - prevYearCount,
      computedAt: new Date(),
    };
  });

  // Filter for requested years only before writing to DB
  if (requestedYears && requestedYears.length > 0) {
    const allowedYears = new Set(requestedYears);
    insertRows = insertRows.filter(row => allowedYears.has(row.year));
  }

  const yearsToRefresh = requestedYears && requestedYears.length > 0
    ? requestedYears
    : [...new Set(scopedTests.map((row) => row.year))];
  if (yearsToRefresh.length > 0) {
    await db.delete(pyqTopicTrends).where(inArray(pyqTopicTrends.year, yearsToRefresh));
  }

  if (insertRows.length > 0) {
    await db.insert(pyqTopicTrends).values(insertRows);
  }

  return {
    yearsRefreshed: yearsToRefresh,
    rowsWritten: insertRows.length,
  };
}
