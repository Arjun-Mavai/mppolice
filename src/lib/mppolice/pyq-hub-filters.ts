import { parseUiBucketFromTags } from '@/data/mppoliceSyllabus';
import type { UiBucket } from '@/lib/mppolice/syllabus-types';

export function testMatchesUiBucket(tags: unknown, bucket: UiBucket): boolean {
  if (bucket === 'all') return true;
  const t = parseUiBucketFromTags(tags);
  if (!t) return false;
  return t === bucket;
}

export function testMatchesCollection(tags: unknown, collection: string | null): boolean {
  if (!collection || collection === 'all') return true;
  if (!Array.isArray(tags)) return false;
  return tags.some((t) => t === `collection:${collection}`);
}

export function extractCollectionsFromTests(tests: { tags?: unknown }[]): string[] {
  const set = new Set<string>();
  for (const te of tests) {
    const tags = te.tags;
    if (!Array.isArray(tags)) continue;
    for (const t of tags) {
      if (typeof t === 'string' && t.startsWith('collection:')) {
        set.add(t.replace('collection:', ''));
      }
    }
  }
  return Array.from(set).sort();
}
