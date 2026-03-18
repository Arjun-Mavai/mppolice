import { NextResponse } from 'next/server';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db';
import { pyqFactBank, pyqTopics } from '@/db/schema';
import { normalizeSubject } from '@/features/tests/utils/pyq-subject';
import { getAdminUserFromRequest } from '../_lib';

export const dynamic = 'force-dynamic';

const publishSchema = z.object({
  publish_scope: z.enum(['all', 'subject', 'topic']),
  subject: z.string().optional(),
  topic_ids: z.array(z.string().uuid()).optional(),
});

export async function GET() {
  const adminUser = await getAdminUserFromRequest();
  if (!adminUser) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const draftBySubject = await db
    .select({
      subject: pyqFactBank.subject,
      draftCount: sql<number>`count(*)`,
    })
    .from(pyqFactBank)
    .where(eq(pyqFactBank.status, 'draft'))
    .groupBy(pyqFactBank.subject)
    .orderBy(desc(sql<number>`count(*)`));

  const draftByTopic = await db
    .select({
      topicId: pyqTopics.id,
      topicTitle: pyqTopics.topicTitle,
      subject: pyqTopics.subject,
      draftCount: sql<number>`count(*)`,
    })
    .from(pyqFactBank)
    .innerJoin(pyqTopics, eq(pyqFactBank.topicId, pyqTopics.id))
    .where(eq(pyqFactBank.status, 'draft'))
    .groupBy(pyqTopics.id, pyqTopics.topicTitle, pyqTopics.subject)
    .orderBy(desc(sql<number>`count(*)`))
    .limit(100);

  return NextResponse.json({
    success: true,
    draft_by_subject: draftBySubject,
    draft_by_topic: draftByTopic,
  });
}

export async function POST(request: Request) {
  const adminUser = await getAdminUserFromRequest();
  if (!adminUser) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const body = publishSchema.parse(await request.json());
    const conditions = [eq(pyqFactBank.status, 'draft')];

    if (body.publish_scope === 'subject') {
      if (!body.subject) {
        return NextResponse.json({ error: 'subject is required for subject scope' }, { status: 400 });
      }
      const normalized = normalizeSubject(body.subject);
      conditions.push(eq(pyqFactBank.subject, normalized));
    }

    if (body.publish_scope === 'topic') {
      if (!body.topic_ids || body.topic_ids.length === 0) {
        return NextResponse.json({ error: 'topic_ids required for topic scope' }, { status: 400 });
      }
      conditions.push(inArray(pyqFactBank.topicId, body.topic_ids));
    }

    const updated = await db
      .update(pyqFactBank)
      .set({ status: 'published', updatedAt: new Date() })
      .where(and(...conditions))
      .returning({ id: pyqFactBank.id });

    revalidateTag('pyq-insights', { expire: 0 });
    revalidateTag('pyq-facts', { expire: 0 });

    return NextResponse.json({
      success: true,
      published_count: updated.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload', details: error.issues.map((issue) => issue.message) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Publish failed' },
      { status: 500 }
    );
  }
}
