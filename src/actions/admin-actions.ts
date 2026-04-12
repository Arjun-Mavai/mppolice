'use server';

import { db } from '@/db';
import { tests, questions, contentBlogs, paymentExitReasons, guests } from '@/db/schema';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { eq, sql, desc } from 'drizzle-orm';
import { AdminDashboardResponse } from '@/types/admin';
import { logger } from '@/lib/logger';
import { requireAdmin } from '@/lib/auth-admin';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { normalizeMppoliceQuestionInput } from '@/lib/mppolice/question-normalize';
import { uiBucketToTag } from '@/data/mppoliceSyllabus';
import type { UiBucket } from '@/lib/mppolice/syllabus-types';

// Helper to fetch tests for the dropdown
export async function getExistingTests() {
  await requireAdmin();
  try {
    const result = await db
      .select({
        id: tests.id,
        title: tests.title,
        type: tests.type,
        totalQuestions: sql<number>`count(${questions.id})`.mapWith(Number),
      })
      .from(tests)
      .leftJoin(questions, eq(tests.id, questions.testId))
      .where(eq(tests.examType, 'mppolice'))
      .groupBy(tests.id)
      .orderBy(tests.createdAt);

    return result;
  } catch (e) {
    logger.error('Error fetching tests:', e);
    return [];
  }
}

export async function uploadTestFromJSON(prevState: any, formData: FormData) {
  await requireAdmin();
  try {
    const mode = formData.get('mode') as 'new' | 'existing'; // 'new' or 'existing'
    const existingTestId = formData.get('existingTestId') as string;

    const title = formData.get('title') as string;
    const type = formData.get('type') as 'FLT' | 'UNIT' | 'PYQ' | 'CSAT' | 'TOPIC' | 'MISC';
    const unitId = formData.get('unitId') as string;
    const topicId = formData.get('topicId') as string; // Changed from null/undefined
    const subjectTag = formData.get('subjectTag') as string; // MISC ke liye subject tag
    const jsonInput = formData.get('jsonData') as string;
    const strictBilingual = formData.get('strictBilingual') === 'true';
    const uiBucketRaw = formData.get('uiBucket') as string | null;
    const collectionTag = formData.get('collectionTag') as string | null;

    // Basic Validation
    if (!jsonInput) {
      return { success: false, message: 'Missing JSON Data' };
    }

    if (mode === 'new' && (!title || !type)) {
      return { success: false, message: 'Missing Title or Type for New Test' };
    }

    if (mode === 'new' && type === 'MISC' && !subjectTag) {
      return { success: false, message: 'Missing Subject Tag for Free Quiz (MISC)' };
    }

    if (mode === 'existing' && !existingTestId) {
      return { success: false, message: 'Select an existing test to add questions to.' };
    }

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(jsonInput);
    } catch (e) {
      return { success: false, message: 'Invalid JSON format' };
    }

    if (!Array.isArray(parsedQuestions)) {
      return { success: false, message: 'JSON must be an array of questions' };
    }

    let testId = existingTestId;
    let testTitle = title;

    const normalizedQuestions = (parsedQuestions as Record<string, unknown>[]).map((q) =>
      normalizeMppoliceQuestionInput(q)
    );

    for (let i = 0; i < normalizedQuestions.length; i++) {
      const nq = normalizedQuestions[i];
      if (
        !nq.questionText ||
        typeof nq.questionText !== 'string' ||
        nq.questionText.trim().length === 0
      ) {
        return {
          success: false,
          message:
            "Validation Failed: One or more questions are missing question text (use questionText or image.question).",
        };
      }
      if (strictBilingual) {
        const hasEn =
          nq.questionTextEn &&
          String(nq.questionTextEn).trim().length > 0 &&
          String(nq.questionTextEn).trim().toLowerCase() !== 'n/a';
        if (!hasEn) {
          return {
            success: false,
            message: `Strict bilingual: question ${i + 1} needs questionTextEn.`,
          };
        }
      }
    }

    const n = normalizedQuestions.length;
    const durationMinutes = Math.max(1, Math.ceil(n * QUIZ_CONSTANTS.TIME_PER_QUESTION_MINUTES));
    const totalMarksPlanned = normalizedQuestions.reduce((s, q) => s + (q.marks || 1), 0);

    const tagsBase: string[] = [type, '2026'];
    if (subjectTag) tagsBase.push(subjectTag);
    const validBuckets: UiBucket[] = [
      'general_knowledge',
      'general_science',
      'logical_reasoning',
      'quantitative_aptitude',
    ];
    if (uiBucketRaw && validBuckets.includes(uiBucketRaw as UiBucket)) {
      tagsBase.push(uiBucketToTag(uiBucketRaw as Exclude<UiBucket, 'all'>));
    }
    if (collectionTag?.trim()) {
      tagsBase.push(`collection:${collectionTag.trim()}`);
    }

    // 1. Create Test IF Mode is 'new'
    if (mode === 'new') {
      testId = nanoid();
      const slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') +
        '-' +
        nanoid(4);

      await db.insert(tests).values({
        id: testId,
        title: title,
        slug: slug,
        type: type, // FLT, UNIT, MISC, etc.
        unitId: type === 'UNIT' || type === 'TOPIC' || type === 'MISC' ? unitId : null,
        topicId: type === 'TOPIC' ? topicId : null,
        description: `Imported test: ${title}`,
        totalMarks: totalMarksPlanned,
        totalQuestions: n,
        durationMinutes,
        examType: 'mppolice',
        // MISC type = free quiz → isFreeAccess ON by default
        isFreeAccess: type === 'MISC' ? true : false,
        tags: tagsBase,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // Fetch title for success message
      const existing = await db
        .select({ title: tests.title })
        .from(tests)
        .where(eq(tests.id, testId ? testId : 'invalid'))
        .then((res) => res[0]);
      testTitle = existing?.title || 'Unknown Test';
    }

    // Determine starting order
    let startOrder = 0;
    if (mode === 'existing' && testId) {
      const maxOrderResult = await db
        .select({ maxOrder: sql<number>`MAX(${questions.order})` })
        .from(questions)
        .where(eq(questions.testId, testId));
      startOrder = maxOrderResult[0]?.maxOrder || 0;
    }

    const questionsToInsert = normalizedQuestions.map((q, idx: number) => ({
      id: nanoid(),
      testId: testId,
      questionText: q.questionText,
      questionTextEn: q.questionTextEn,
      options: JSON.stringify(q.options),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      explanationEn: q.explanationEn,
      marks: q.marks || 1,
      negativeMarks: q.negativeMarks ?? 0,
      idealTime: q.idealTime ?? 60,
      order: startOrder + idx + 1,
      subject: q.subject || 'General',
      type: q.type || 'standard',
      matchPairs: q.matchPairs ?? null,
      extendedData: q.extendedData ?? null,
      examType: 'mppolice' as const,
    }));

    // Filter out duplicates (check against existing questions in this test)
    let duplicatesCount = 0;
    // ... (Duplicate logic remains same, skipping for brevity in replacement but preserving context)
    if (mode === 'existing') {
      const existingQs = await db
        .select({ text: questions.questionText })
        .from(questions)
        .where(eq(questions.testId, testId || ''));
      const existingSet = new Set(existingQs.map((q) => q.text?.trim().toLowerCase()));

      const uniqueQuestions = questionsToInsert.filter((newQ: any) => {
        const isDup = existingSet.has(newQ.questionText.trim().toLowerCase());
        if (isDup) duplicatesCount++;
        return !isDup;
      });

      questionsToInsert.length = 0;
      questionsToInsert.push(...uniqueQuestions);
    }

    // 3. Bulk Insert Questions
    let finalQuestionCount = 0;

    if (questionsToInsert.length > 0) {
      await db.insert(questions).values(questionsToInsert);

      // We need current total questions to add to it, or just set it based on COUNT(*)
      // Setting based on COUNT(*) is safer for data consistency.
      if (testId) {
        const countResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(questions)
          .where(eq(questions.testId, testId));
        const totalQ = countResult[0]?.count || 0;
        finalQuestionCount = totalQ;

        const marksSumResult = await db
          .select({ s: sql<number>`coalesce(sum(${questions.marks}),0)`.mapWith(Number) })
          .from(questions)
          .where(eq(questions.testId, testId));
        const totalMarksNow = marksSumResult[0]?.s ?? 0;
        const durationNow = Math.max(
          1,
          Math.ceil(totalQ * QUIZ_CONSTANTS.TIME_PER_QUESTION_MINUTES)
        );

        await db
          .update(tests)
          .set({
            updatedAt: new Date(),
            totalMarks: totalMarksNow,
            totalQuestions: totalQ,
            durationMinutes: durationNow,
          })
          .where(eq(tests.id, testId));
      }
    } else if (mode === 'new') {
      // If new test but 0 questions inserted (unlikely unless empty JSON), update count
      finalQuestionCount = parsedQuestions.length;
      await db
        .update(tests)
        .set({ totalQuestions: finalQuestionCount })
        .where(eq(tests.id, testId || ''));
    }

    revalidatePath('/tests');
    const dupMsg = duplicatesCount > 0 ? ` (${duplicatesCount} duplicates skipped)` : '';
    return {
      success: true,
      message: `Successfully ${mode === 'new' ? 'created' : 'updated'} "${testTitle}". Total Questions: ${finalQuestionCount}${dupMsg}`,
    };
  } catch (error) {
    logger.error('Upload Error:', error);
    return {
      success: false,
      message: `Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// --- DASHBOARD STATS ---
// --- DASHBOARD STATS ---
export async function getAdminDashboardStats(): Promise<AdminDashboardResponse> {
  await requireAdmin();
  try {
    const testsData = await db
      .select({
        id: tests.id,
        type: tests.type,
        title: tests.title,
        unitId: tests.unitId,
        topicId: tests.topicId,
        totalQuestions: tests.totalQuestions,
        updatedAt: tests.updatedAt,
      })
      .from(tests)
      .where(eq(tests.examType, 'mppolice'));

    const blogsData = await db
      .select({
        id: contentBlogs.id,
        title: contentBlogs.title,
        category: contentBlogs.category,
        contentType: contentBlogs.contentType,
        createdAt: contentBlogs.createdAt,
      })
      .from(contentBlogs)
      .where(eq(contentBlogs.examType, 'mppolice'));

    const recentGuests = await db
      .select({
        id: guests.id,
        name: guests.name,
        email: guests.email,
        mobile: guests.mobile,
        createdAt: guests.createdAt,
      })
      .from(guests)
      .where(eq(guests.examType, 'mppolice'))
      .orderBy(desc(guests.createdAt))
      .limit(100); // Increased limit to show more history per user request

    const totalTests = testsData.length;
    const totalQuestions = testsData.reduce((acc, t) => acc + (t.totalQuestions || 0), 0);
    const totalBlogs = blogsData.length;

    const typeCount = {
      FLT: 0,
      UNIT: 0,
      TOPIC: 0,
      CSAT: 0,
      PYQ: 0,
      MISC: 0,
    };

    // Blog category count
    const blogCategoryCount: Record<string, number> = {};
    blogsData.forEach((b) => {
      blogCategoryCount[b.category] = (blogCategoryCount[b.category] || 0) + 1;
    });

    const recentUploads = testsData
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0))
      .slice(0, 5);
    const recentBlogs = blogsData
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, 5);

    // Topic Coverage Map: Unit -> Set of TopicIds
    const topicCoverage: Record<string, Set<string>> = {};

    testsData.forEach((t) => {
      const normalizedType = t.type?.toUpperCase();
      if (normalizedType && Object.hasOwn(typeCount, normalizedType)) {
        const k = normalizedType as keyof typeof typeCount;
        typeCount[k]++;
      }
      if (normalizedType === 'TOPIC' && t.unitId && t.topicId) {
        if (!topicCoverage[t.unitId]) {
          topicCoverage[t.unitId] = new Set();
        }
        topicCoverage[t.unitId].add(t.topicId);
      }
    });

    // Convert Sets to Arrays for serialization
    const serializedCoverage: Record<string, string[]> = {};
    for (const [unit, topics] of Object.entries(topicCoverage)) {
      serializedCoverage[unit] = Array.from(topics);
    }

    return {
      success: true,
      stats: {
        totalTests,
        totalQuestions,
        totalBlogs,
        typeCount,
        blogCategoryCount,
      },
      recentUploads,
      recentBlogs,
      recentGuests, // Added recentGuests to return
      topicCoverage: serializedCoverage,
    };
  } catch (e) {
    logger.error('Dashboard Stats Error:', e);
    return { success: false, error: 'Failed to fetch stats' };
  }
}
// --- PAYMENT EXIT STATS ---
export async function getPaymentExitStats() {
  await requireAdmin();
  try {
    const reasons = await db
      .select()
      .from(paymentExitReasons)
      .orderBy(desc(paymentExitReasons.createdAt))
      .limit(50);

    // Group by reason
    const breakdown = reasons.reduce((acc: any, curr) => {
      acc[curr.reason] = (acc[curr.reason] || 0) + 1;
      return acc;
    }, {});

    return { success: true, reasons, breakdown };
  } catch (error) {
    logger.error('Failed to fetch payment exit stats:', error);
    return { success: false, error: 'Failed to fetch stats' };
  }
}
