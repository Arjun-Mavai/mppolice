'use server';

import { db } from '@/db';
import { mppoliceOneLinerFacts } from '@/db/schema';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { MPPOLICE_ONELINER_SUBJECTS } from '@/features/revision/constants/mppolice-one-liners';

export interface MppoliceOneLinerRow {
  id: string;
  subjectTag: string;
  stemHi: string;
  stemEn: string | null;
  answerHi: string;
  answerEn: string | null;
  importanceScore: number | null;
  extendedData: {
    facts?: string[];
    factsEn?: string[];
    memoryTip?: string;
    memoryTipEn?: string;
    related?: string[];
    explanationHi?: string;
    explanationEn?: string;
    analogy?: string;
    analogyEn?: string;
    syllabusTopic?: string;
    patternConnections?: string[];
    pyqs?: { exam: string; question: string; year?: string; answer?: string }[];
  } | null;
}

export async function getPublishedMppoliceOneLiners(
  subject: string,
  limit = 50,
  offset = 0,
  sortBy: 'default' | 'newest' = 'default'
): Promise<MppoliceOneLinerRow[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 5000);
  const safeOffset = Math.max(offset, 0);
  const subs = [...MPPOLICE_ONELINER_SUBJECTS] as string[];
  const normalizedSubject = subs.includes(subject) ? subject : 'General Knowledge';
  const cacheKeySubject = subject === 'All' || subject === 'all' ? 'All' : normalizedSubject;

  return unstable_cache(
    async () => {
      const isAll = cacheKeySubject === 'All';

      const subjectCond = isAll
        ? inArray(mppoliceOneLinerFacts.subjectTag, subs.filter(s => s !== 'MP GK'))
        : eq(mppoliceOneLinerFacts.subjectTag, normalizedSubject);

      const rows = await db
        .select({
          id: mppoliceOneLinerFacts.id,
          subjectTag: mppoliceOneLinerFacts.subjectTag,
          stemHi: mppoliceOneLinerFacts.stemHi,
          stemEn: mppoliceOneLinerFacts.stemEn,
          answerHi: mppoliceOneLinerFacts.answerHi,
          answerEn: mppoliceOneLinerFacts.answerEn,
          importanceScore: mppoliceOneLinerFacts.importanceScore,
          extendedData: mppoliceOneLinerFacts.extendedData,
        })
        .from(mppoliceOneLinerFacts)
        .where(and(eq(mppoliceOneLinerFacts.status, 'published'), subjectCond))
        .orderBy(
          sortBy === 'newest' ? desc(mppoliceOneLinerFacts.updatedAt) : desc(mppoliceOneLinerFacts.importanceScore),
          desc(mppoliceOneLinerFacts.sortOrder),
          mppoliceOneLinerFacts.id
        )
        .limit(safeLimit)
        .offset(safeOffset);

      return rows.map((r) => ({
        ...r,
        importanceScore: r.importanceScore ?? 0,
        extendedData: r.extendedData ?? null,
      }));
    },
    // 🛡️ CRITICAL FIX: Added safeOffset to the cache key
    // Bhai, pehle offset cache key me nahi tha, jis wajah se pagination kaam nahi kar rahi thi
    // (saare batches me same data aa raha tha). Ab ye fix ho gaya h!
    ['mppolice-one-liners', cacheKeySubject, String(safeLimit), String(safeOffset), sortBy],
    { revalidate: 300, tags: ['mppolice-one-liners'] }
  )();
}

const getMppoliceOnelinerCountsCached = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const rows = await db
      .select({
        subject: mppoliceOneLinerFacts.subjectTag,
        c: sql<number>`count(*)`.mapWith(Number),
      })
      .from(mppoliceOneLinerFacts)
      .where(eq(mppoliceOneLinerFacts.status, 'published'))
      .groupBy(mppoliceOneLinerFacts.subjectTag);

    const out: Record<string, number> = {};
    for (const s of MPPOLICE_ONELINER_SUBJECTS) {
      out[s] = 0;
    }
    for (const r of rows) {
      out[r.subject] = r.c;
    }
    return out;
  },
  ['mppolice-one-liner-counts'],
  { revalidate: 300, tags: ['mppolice-one-liners'] }
);

export async function getMppoliceOnelinerCountsBySubject(): Promise<Record<string, number>> {
  return getMppoliceOnelinerCountsCached();
}
