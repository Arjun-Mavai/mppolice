import { createHash, randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { pyqContentImportJobs, pyqFactBank, pyqTopics, pyqQuestionTopics, questions, tests } from '@/db/schema';
import { normalizeSubject } from '@/features/tests/utils/pyq-subject';
import { getAdminUserFromRequest, slugifyTopic } from '../_lib';

export const dynamic = 'force-dynamic';

const factSchema = z.object({
  fact_text: z.string().min(3),
  fact_text_en: z.string().optional(),
  memory_tip: z.string().optional(),
  memory_tip_en: z.string().optional(),
  scam_alert: z.string().optional(),
  scam_alert_en: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  importance_score: z.number().min(0).max(1).optional(),
  frequency_score: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()).optional(),
  pyq_refs: z
    .array(
      z.object({
        test_id: z.string().optional(),
        question_id: z.string().optional(),
        year: z.number().int().optional(),
      })
    )
    .optional(),
});

const deepLearningSchema = z
  .object({
    must_know_lists: z
      .array(
        z.object({
          list_title: z.string().min(2),
          list_title_en: z.string().optional(),
          items: z.array(z.string().min(1)).min(1),
          items_en: z.array(z.string().min(1)).optional(),
          memory_hook: z.string().optional(),
          memory_hook_en: z.string().optional(),
        })
      )
      .optional(),
    concept_capsule: z.string().optional(),
    concept_capsule_en: z.string().optional(),
    practice_prompts: z.array(z.string()).optional(),
    practice_prompts_en: z.array(z.string()).optional(),
  })
  .optional();

const recordSchema = z.object({
  subject: z.string().min(2),
  topic: z.string().min(2),
  topic_en: z.string().optional(),
  description: z.string().optional(),
  questions: z.array(z.string()).optional(), // List of question IDs belonging to this topic
  facts: z.array(factSchema).optional(),
  deep_learning: deepLearningSchema,
}).superRefine((value, ctx) => {
  if ((!value.facts || value.facts.length === 0) && !value.deep_learning) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Each record must include either facts or deep_learning',
      path: ['facts'],
    });
  }
});

const importSchema = z.object({
  version: z.string().default('1.0'),
  mode: z.enum(['upsert', 'append']).default('upsert'),
  publish: z.boolean().default(true), // Added publish flag
  records: z.array(recordSchema).min(1),
});

export async function POST(request: Request) {
  const adminUser = await getAdminUserFromRequest();
  if (!adminUser) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const jobId = randomUUID();
  try {
    const parsedBody = importSchema.parse(await request.json());
    const inputHash = createHash('sha256').update(JSON.stringify(parsedBody)).digest('hex');

    await db.insert(pyqContentImportJobs).values({
      id: jobId,
      uploadedBy: adminUser.id,
      inputHash,
      totalRecords: parsedBody.records.length,
      successCount: 0,
      failureCount: 0,
      status: 'pending',
      errorReport: [],
    });

    const allQuestionIds = new Set<string>();
    const allTestIds = new Set<string>();
    const allTopicSlugs = new Set<string>();

    for (const record of parsedBody.records) {
      const topicSlug = slugifyTopic(record.topic);
      allTopicSlugs.add(topicSlug);

      if (record.questions) {
        record.questions.forEach((id) => allQuestionIds.add(id));
      }
      if (record.facts) {
        record.facts.forEach((fact) => {
          if (fact.pyq_refs) {
            fact.pyq_refs.forEach((ref) => {
              if (ref.question_id) allQuestionIds.add(ref.question_id);
              if (ref.test_id) allTestIds.add(ref.test_id);
            });
          }
        });
      }
    }

    // Prefetch valid IDs to avoid N+1 queries
    const validQuestionIds = new Set<string>();
    const validTestIds = new Set<string>();
    const existingTopicMap = new Map<string, string>(); // slug -> id

    // Chunking helper for SQLite limit
    const chunkArray = <T>(arr: T[], size: number): T[][] => {
      const chunks: T[][] = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    if (allQuestionIds.size > 0) {
      const qIds = Array.from(allQuestionIds);
      const chunks = chunkArray(qIds, 500);
      for (const chunk of chunks) {
        const found = await db
          .select({ id: questions.id })
          .from(questions)
          .where(inArray(questions.id, chunk));
        found.forEach((f) => validQuestionIds.add(f.id));
      }
    }

    if (allTestIds.size > 0) {
      const tIds = Array.from(allTestIds);
      const chunks = chunkArray(tIds, 500);
      for (const chunk of chunks) {
        const found = await db
          .select({ id: tests.id })
          .from(tests)
          .where(inArray(tests.id, chunk));
        found.forEach((f) => validTestIds.add(f.id));
      }
    }

    if (allTopicSlugs.size > 0) {
      const slugs = Array.from(allTopicSlugs);
      const chunks = chunkArray(slugs, 500);
      for (const chunk of chunks) {
        const found = await db
          .select({ id: pyqTopics.id, slug: pyqTopics.topicSlug })
          .from(pyqTopics)
          .where(inArray(pyqTopics.topicSlug, chunk));
        found.forEach((f) => existingTopicMap.set(f.slug, f.id));
      }
    }

    let topicsUpserted = 0;
    let factsStaged = 0;
    let failedRows = 0;
    const warnings: string[] = [];
    const topicHandledForUpsert = new Set<string>();

    for (const record of parsedBody.records) {
      try {
        await db.transaction(async (tx) => {
          const canonicalSubject = normalizeSubject(record.subject);
          const topicSlug = slugifyTopic(record.topic);

          const existingTopicId = existingTopicMap.get(topicSlug);
          let topicId = existingTopicId;

          if (!topicId) {
            topicId = randomUUID();
            await tx.insert(pyqTopics).values({
              id: topicId,
              subject: canonicalSubject,
              topicSlug,
              topicTitle: record.topic,
              topicTitleEn: record.topic_en ?? null,
              description: record.description ?? null,
              aiContent: record.deep_learning ?? null, // Update AI content
              isActive: true,
            });
            // Update map for subsequent records in same batch
            existingTopicMap.set(topicSlug, topicId);
            topicsUpserted++;
          } else {
            await tx
              .update(pyqTopics)
              .set({
                subject: canonicalSubject,
                topicTitle: record.topic,
                topicTitleEn: record.topic_en ?? null,
                description: record.description ?? null,
                aiContent: record.deep_learning ?? null, // Update AI content
                updatedAt: new Date(),
              })
              .where(eq(pyqTopics.id, topicId));
          }

          // Link questions to topic if provided
          if (record.questions && record.questions.length > 0) {
            const validQIds = record.questions.filter((id) => validQuestionIds.has(id));
            const invalidQIds = record.questions.filter((id) => !validQuestionIds.has(id));
            
            if (invalidQIds.length > 0) {
              warnings.push(`Skipped linking ${invalidQIds.length} unknown questions to topic ${topicSlug}`);
            }

            if (validQIds.length > 0) {
               // Batch insert logic is tricky with randomUUID() for ID.
               // Drizzle bulk insert: values([...])
               await tx
                 .insert(pyqQuestionTopics)
                 .values(
                   validQIds.map((qId) => ({
                     id: randomUUID(),
                     questionId: qId,
                     topicId: topicId!,
                     confidence: 1.0,
                     isPrimary: true,
                     source: 'ai' as const,
                   }))
                 )
                 .onConflictDoNothing();
            }
          }

          if (parsedBody.mode === 'upsert' && !topicHandledForUpsert.has(topicId)) {
            // Delete old facts if upserting
            await tx
              .delete(pyqFactBank)
              .where(eq(pyqFactBank.topicId, topicId));
            topicHandledForUpsert.add(topicId);
          }

          const factsToInsert = [...(record.facts ?? [])];

          for (const fact of factsToInsert) {
            if (fact.pyq_refs && fact.pyq_refs.length > 0) {
              for (const ref of fact.pyq_refs) {
                if (ref.question_id && !validQuestionIds.has(ref.question_id)) {
                  warnings.push(`Missing question_id: ${ref.question_id}`);
                }
                if (ref.test_id && !validTestIds.has(ref.test_id)) {
                  warnings.push(`Missing test_id: ${ref.test_id}`);
                }
              }
            }

            await tx.insert(pyqFactBank).values({
              id: randomUUID(),
              topicId: topicId!, // Non-null assertion safe because we create or find it above
              subject: canonicalSubject,
              factText: fact.fact_text,
              factTextEn: fact.fact_text_en ?? null,
              memoryTip: fact.memory_tip ?? null,
              memoryTipEn: fact.memory_tip_en ?? null,
              scamAlert: fact.scam_alert ?? null,
              scamAlertEn: fact.scam_alert_en ?? null,
              difficulty: fact.difficulty ?? 'medium',
              importanceScore: fact.importance_score ?? 0,
              frequencyScore: fact.frequency_score ?? 0,
              pyqRefs:
                fact.pyq_refs?.map((ref) => ({
                  testId: ref.test_id,
                  questionId: ref.question_id,
                  year: ref.year,
                })) ?? [],
              tags: fact.tags ?? [],
              status: parsedBody.publish ? 'published' : 'draft', // Make it visible if requested
              source: 'ai' as const,
              createdBy: adminUser.id,
            });
            factsStaged++;
          }
        });
      } catch (recordError) {
        failedRows++;
        warnings.push(
          `Failed record ${record.topic} (${record.subject}): ${
            recordError instanceof Error ? recordError.message : 'unknown error'
          }`
        );
      }
    }

    await db
      .update(pyqContentImportJobs)
      .set({
        successCount: factsStaged,
        failureCount: failedRows,
        status: failedRows > 0 ? 'failed' : 'processed',
        errorReport: warnings,
      })
      .where(eq(pyqContentImportJobs.id, jobId));

    return NextResponse.json({
      success: true,
      job_id: jobId,
      summary: {
        topics_upserted: topicsUpserted,
        facts_staged: factsStaged,
        errors: failedRows,
        warnings_count: warnings.length,
      },
      warnings: warnings.slice(0, 50),
    });
  } catch (error) {
    await db
      .update(pyqContentImportJobs)
      .set({
        status: 'failed',
        failureCount: 1,
        errorReport: [
          {
            message: error instanceof Error ? error.message : 'Invalid import payload',
          },
        ],
      })
      .where(eq(pyqContentImportJobs.id, jobId));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload', details: error.issues.map((issue) => issue.message) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}
