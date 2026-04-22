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

/** Normalize tags array (handles rare JSON string storage). */
function asTagArray(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map((t) => String(t));
  if (typeof tags === 'string') {
    try {
      const p = JSON.parse(tags) as unknown;
      if (Array.isArray(p)) return p.map((t) => String(t));
    } catch {
      /* ignore */
    }
  }
  if (tags && typeof tags === 'object' && !Array.isArray(tags)) {
    try {
      return Object.values(tags as Record<string, unknown>).map((v) => String(v));
    } catch {
      /* ignore */
    }
  }
  return [];
}

/** First `collection:*` slug, lowercased (e.g. memory, pyp, pyq). */
export function parseCollectionSlugFromTags(tags: unknown): string | null {
  for (const raw of asTagArray(tags)) {
    const m = raw.match(/^collection\s*:\s*(.+)$/i);
    if (m?.[1]) {
      const slug = m[1].trim().toLowerCase();
      return slug || null;
    }
  }
  return null;
}

/** MBT = admin collection tag `memory` (stored as `collection:memory`) or legacy bare `memory` tag. */
export function isMbtByCollectionTags(tags: unknown): boolean {
  if (tags == null) return false;
  try {
    const blob = typeof tags === 'string' ? tags : JSON.stringify(tags);
    if (blob && /collection\s*:\s*memory\b/i.test(blob)) return true;
  } catch {
    /* ignore non-serializable tags */
  }
  const slug = parseCollectionSlugFromTags(tags);
  if (slug === 'memory') return true;
  return asTagArray(tags).some((t) => t.toLowerCase() === 'memory');
}

/**
 * PYP tab: any PYQ row that is NOT MBT/memory-tagged.
 * (Admin may use `collection:pyp`, `collection:pyq`, or any other non-memory collection — all count as PYP.)
 */
export function isPyqRowForPypTab(tags: unknown): boolean {
  return !isMbtByCollectionTags(tags);
}

/** Rows already filtered to MP Police in SQL; missing / blank examType treated as hub-safe. */
export function isMppolicePyqHubExam(examType: unknown): boolean {
  const s = String(examType ?? '').trim().toLowerCase();
  if (!s) return true;
  return s === 'mppolice' || s === 'all';
}

/** FLT hub family (case-insensitive). */
export function isFltFamilyHubType(type: unknown): boolean {
  const ty = String(type ?? '').trim().toUpperCase();
  return ty === 'FLT' || ty === 'POLICE_CONSTABLE' || ty === 'POLICE_SI';
}

/** @deprecated use isPyqRowForPypTab — kept name for older imports */
export function isPypCollectionOrLegacy(tags: unknown): boolean {
  return isPyqRowForPypTab(tags);
}
