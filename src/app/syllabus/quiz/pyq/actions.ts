'use server';

import { db } from '@/db';
import { tests } from '@/db/schema';
import { like, and, eq } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';
import { canAccessTest } from '@/lib/access-control';
import { unstable_cache } from 'next/cache';

export interface PartAccessStatus {
  isLocked: boolean;
  slug: string;
  testId?: string;
  isFree?: boolean;
}

export async function getSubjectPartAccess(subject: string) {
  const user = await verifyAuth();
  const ALLOWED_SUBJECTS = [
    'mp gk',
    'history',
    'geography',
    'polity',
    'economy',
    'science',
    'ict',
    'current affairs',
    'misc',
  ];

  if (!ALLOWED_SUBJECTS.includes(subject.toLowerCase())) {
    return {};
  }

  const subjectSlug = subject.toLowerCase().replace(/\s+/g, '-');
  const pattern = `pyq-${subjectSlug}-part-%`;

  // Fetch all part tests for this subject
  // We use `like` to match the cached pattern
  const partTests = await db
    .select()
    .from(tests)
    .where(and(eq(tests.type, 'PYQ'), like(tests.slug, pattern)));

  const accessMap: Record<number, PartAccessStatus> = {};

  for (const test of partTests) {
    // Extract part number from slug
    // slug format: pyq-history-part-1
    const parts = test.slug.split('-');
    const partNum = parseInt(parts[parts.length - 1]);

    if (!isNaN(partNum)) {
      // Create a minimal user object or pass null (not undefined) if not logged in
      const hasAccess = await canAccessTest(test, user ?? null);
      accessMap[partNum] = {
        isLocked: !hasAccess,
        slug: test.slug,
        testId: test.id,
        isFree: test.isFreeAccess || false,
      };
    }
  }

  return accessMap;
}
