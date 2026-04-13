'use server';

import { db } from '@/db';
import { mppoliceOneLinerFacts } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-admin';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/lib/errors';
import { MPPOLICE_ONELINER_SUBJECTS } from '@/features/revision/constants/mppolice-one-liners';

function isValidSubject(s: string): s is (typeof MPPOLICE_ONELINER_SUBJECTS)[number] {
  return (MPPOLICE_ONELINER_SUBJECTS as readonly string[]).includes(s);
}

export async function importMppoliceOneLinersJson(
  rawJson: string,
  options: { status: 'draft' | 'published'; replaceSubject?: string | null }
): Promise<{ success: boolean; inserted: number; error?: string }> {
  await requireAdmin();
  try {
    const parsed = JSON.parse(rawJson) as unknown;
    if (!Array.isArray(parsed)) {
      return { success: false, inserted: 0, error: 'JSON must be an array of objects' };
    }

    const rows = parsed as Record<string, unknown>[];
    let inserted = 0;
    const now = new Date();

    await db.transaction(async (tx) => {
      if (options.replaceSubject && options.replaceSubject !== '_none' && isValidSubject(options.replaceSubject)) {
        await tx
          .delete(mppoliceOneLinerFacts)
          .where(eq(mppoliceOneLinerFacts.subjectTag, options.replaceSubject));
      }

      for (const r of rows) {
        const subjectTag = typeof r.subjectTag === 'string' ? r.subjectTag.trim() : '';
        if (!isValidSubject(subjectTag)) {
          throw new Error(`Invalid subjectTag: ${subjectTag || '(empty)'} — use one of: ${MPPOLICE_ONELINER_SUBJECTS.join(', ')}`);
        }
        const stemHi = typeof r.stemHi === 'string' ? r.stemHi.trim() : '';
        const answerHi = typeof r.answerHi === 'string' ? r.answerHi.trim() : '';
        if (!stemHi || !answerHi) {
          throw new Error('Each row needs stemHi and answerHi (non-empty strings)');
        }

        await tx.insert(mppoliceOneLinerFacts).values({
          id: nanoid(),
          subjectTag,
          stemHi,
          stemEn: typeof r.stemEn === 'string' ? r.stemEn.trim() : null,
          answerHi,
          answerEn: typeof r.answerEn === 'string' ? r.answerEn.trim() : null,
          importanceScore: typeof r.importanceScore === 'number' ? r.importanceScore : 0,
          sortOrder: typeof r.sortOrder === 'number' ? r.sortOrder : 0,
          extendedData: r.extendedData && typeof r.extendedData === 'object' ? (r.extendedData as object) : null,
          status: options.status,
          createdAt: now,
          updatedAt: now,
        });
        inserted++;
      }
    });

    revalidateTag('mppolice-one-liners', { expire: 0 });
    return { success: true, inserted };
  } catch (e) {
    logger.error('importMppoliceOneLinersJson', e);
    return { success: false, inserted: 0, error: getErrorMessage(e) };
  }
}

export async function publishAllDraftMppoliceOneLiners(subjectTag?: string | null) {
  await requireAdmin();
  try {
    const draft = eq(mppoliceOneLinerFacts.status, 'draft');
    const whereClause =
      subjectTag && isValidSubject(subjectTag) ? and(draft, eq(mppoliceOneLinerFacts.subjectTag, subjectTag)) : draft;

    await db
      .update(mppoliceOneLinerFacts)
      .set({ status: 'published', updatedAt: new Date() })
      .where(whereClause);

    revalidateTag('mppolice-one-liners', { expire: 0 });
    return { success: true };
  } catch (e) {
    return { success: false, error: getErrorMessage(e) };
  }
}

export async function getMppoliceOneLinerStats() {
  await requireAdmin();
  try {
    const all = await db
      .select({
        subjectTag: mppoliceOneLinerFacts.subjectTag,
        status: mppoliceOneLinerFacts.status,
      })
      .from(mppoliceOneLinerFacts);

    const stats = {
      total: all.length,
      published: all.filter((r) => r.status === 'published').length,
      draft: all.filter((r) => r.status === 'draft').length,
      bySubject: {} as Record<string, { total: number; published: number; draft: number }>,
    };

    MPPOLICE_ONELINER_SUBJECTS.forEach((s) => {
      const subjectRows = all.filter((r) => r.subjectTag === s);
      stats.bySubject[s] = {
        total: subjectRows.length,
        published: subjectRows.filter((r) => r.status === 'published').length,
        draft: subjectRows.filter((r) => r.status === 'draft').length,
      };
    });

    return { success: true, stats };
  } catch (e) {
    logger.error('getMppoliceOneLinerStats', e);
    return { success: false, error: getErrorMessage(e) };
  }
}

