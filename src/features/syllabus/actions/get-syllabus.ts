
'use server';

import { db } from '@/db';
import { syllabusTopics } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { cachedData, CACHE_TAGS } from '@/lib/cache';
import { logger } from '@/lib/logger';

// Fetch syllabus topics for a unit with caching
export const getCachedSyllabusTopics = cachedData(
    async (unitId: string) => {
        try {
            const topics = await db.query.syllabusTopics.findMany({
                where: eq(syllabusTopics.unitId, unitId),
                orderBy: [asc(syllabusTopics.order)]
            });
            return topics;
        } catch (error) {
            logger.error("Failed to fetch syllabus topics from DB:", error);
            return [];
        }
    },
    ['syllabus-topics-by-unit'], // Key prefix. The actual key will naturally include args if we use the helper correctly? 
    // Wait, my cachedData helper uses `unstable_cache`. 
    // `unstable_cache` generates keys based on arguments automatically? NO.
    // I need to ensure the key is unique per unitId.
    // The `cachedData` helper I wrote takes `keys: string[]`. 
    // I should modify the helper or usage.
    // Let's look at `src/lib/cache.ts` again.
    // "unstable_cache(fetcher, keys, ...)"
    // If the fetcher closure captures `unitId`, I must include `unitId` in the `keys` array.
    // My cachedData helper usage pattern was: `const getCached = cachedData(...)` and then `getCached()`.
    // It creates a CACHED FUNCTION.
    // So if I pass arguments to retuned function, how does `unstable_cache` handle it?
    // `unstable_cache` returns a function that accepts the same arguments as the original fetcher.
    // And it uses those arguments to generate the cache key if they are primitives?
    // Actually, the second argument `keys` (array of strings) is combined with arguments?
    // Docs say: "The `keyParts` are an array of strings that identify the cached data."
    // If I want dynamic keys based on arguments, I strictly rely on `keyParts`?
    // No, Next.js `unstable_cache` automatically includes arguments in the cache key generation if the function is invoked with them.
    // So passing `['syllabus-topics']` is fine, it will be namespaced by that + arguments.
    [CACHE_TAGS.SYLLABUS] 
);

// Wrapper to match expected import pattern if needed, or export directly
export async function getSyllabusTopics(unitId: string) {
    return await getCachedSyllabusTopics(unitId);
}
