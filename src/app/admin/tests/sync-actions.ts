'use server';

import { db } from '@/db';
import { tests } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-admin';
import { getSubjectWisePYQStats } from '@/features/tests/actions/pyq-analytics';
import { logger } from '@/lib/logger';

export async function syncSubjectParts() {
  await requireAdmin();

  const stats = await getSubjectWisePYQStats();
  const QUESTIONS_PER_PART = 30;
  const createdTests = [];

  for (const [subject, count] of Object.entries(stats)) {
    const totalParts = Math.ceil(count / QUESTIONS_PER_PART);
    const subjectSlug = subject.toLowerCase().replace(/\s+/g, '-');

    for (let part = 1; part <= totalParts; part++) {
      const slug = `pyq-${subjectSlug}-part-${part}`;
      const title = `${subject} Part ${part}`;

      // Calculate specific question count for this part
      // e.g. 70 questions: Part 1 (30), Part 2 (30), Part 3 (10)
      const isLastPart = part === totalParts;
      const partQuestions = isLastPart
        ? count - (part - 1) * QUESTIONS_PER_PART
        : QUESTIONS_PER_PART;

      // Check if exists
      const existing = await db.query.tests.findFirst({
        where: and(eq(tests.slug, slug), eq(tests.examType, 'mppolice')),
      });

      if (!existing) {
        // Create new "Ghost" Test
        await db.insert(tests).values({
          id: crypto.randomUUID(),
          title: title,
          slug: slug,
          type: 'PYQ', // Reusing PYQ type
          description: `Access Control container for ${subject} Part ${part}`,
          totalQuestions: partQuestions,
          totalMarks: partQuestions * 3, // Assuming 3 marks per question
          durationMinutes: 30, // Default duration
          isHidden: true, // IMPORTANT: Hide from main lists
          isFreeAccess: part === 1, // Part 1 is Free
          isLiteAccess: false,
          isProAccess: true,
          tags: ['subject-series', `subject-${subjectSlug}`, `part-${part}`],
          examType: 'mppolice',
        });
        createdTests.push(title);
      } else {
        // Optional: Update meta if needed (e.g. question count changed)
        // For now, we just ensure it exists
      }
    }
  }

  // Revalidate everything to ensure Admin Dashboard sees new tests
  revalidateTag('tests', { expire: 0 });
  revalidateTag('tests-list', { expire: 0 });
  revalidateTag('pyq-stats', { expire: 0 });

  logger.info(`Synced ${createdTests.length} new subject parts`, {
    category: 'admin',
    metadata: { createdTests },
  });

  return { success: true, createdCount: createdTests.length };
}
