'use server';

import { db } from '@/db';
import { syllabusTopics } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { cachedData, CACHE } from '@/lib/cache';
import { logger } from '@/lib/logger';

// Fetch syllabus topics for a unit with caching
export const getCachedSyllabusTopics = cachedData(
  async (unitId: string) => {
    try {
      const topics = await db.query.syllabusTopics.findMany({
        where: eq(syllabusTopics.unitId, unitId),
        orderBy: [asc(syllabusTopics.order)],
      });
      return topics;
    } catch (error) {
      logger.error('Failed to fetch syllabus topics from DB:', error);
      return [];
    }
  },
  ['syllabus-topics-by-unit'],
  [CACHE.SYLLABUS.TAGS.ALL]
);

// Wrapper to match expected import pattern if needed, or export directly
export async function getSyllabusTopics(unitId: string) {
  return await getCachedSyllabusTopics(unitId);
}
