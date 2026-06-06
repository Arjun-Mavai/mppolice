'use server';

import { db } from '@/db';
import { tests, questions, contentBlogs, paymentExitReasons, guests } from '@/db/schema';
import { nanoid } from 'nanoid';
import { revalidatePath, revalidateTag } from 'next/cache';
import { eq, sql, desc, and } from 'drizzle-orm';
import { CACHE } from '@/lib/cache';
import { AdminDashboardResponse } from '@/types/admin';
import { logger } from '@/lib/logger';
import { requireAdmin } from '@/lib/auth-admin';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { normalizeMppoliceQuestionInput } from '@/lib/mppolice/question-normalize';
import { uiBucketToTag } from '@/data/mppoliceSyllabus';
import type { UiBucket } from '@/lib/mppolice/syllabus-types';
import { setTelemetryEnabled, getTelemetryEnabled } from '@/lib/system-settings';

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

    const title = (formData.get('title') as string) || '';
    const titleEnForm = ((formData.get('titleEn') as string) || '').trim();
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

    if (mode === 'new' && !type) {
      return { success: false, message: 'Missing Type for New Test' };
    }

    if (mode === 'new' && type === 'MISC' && !subjectTag) {
      return { success: false, message: 'Missing Subject Tag for Free Quiz (MISC)' };
    }

    if (mode === 'existing' && !existingTestId) {
      return { success: false, message: 'Select an existing test to add questions to.' };
    }

    let parsedQuestions: unknown[];
    let aiTestTitle: string | undefined;
    let aiTestTitleEn: string | undefined;

    try {
      const raw: unknown = JSON.parse(jsonInput);
      if (Array.isArray(raw)) {
        parsedQuestions = raw;
      } else if (
        raw &&
        typeof raw === 'object' &&
        Array.isArray((raw as { questions?: unknown }).questions)
      ) {
        const o = raw as {
          questions: unknown[];
          testTitle?: unknown;
          testTitleEn?: unknown;
        };
        parsedQuestions = o.questions;
        if (typeof o.testTitle === 'string' && o.testTitle.trim()) {
          aiTestTitle = o.testTitle.trim();
        }
        if (typeof o.testTitleEn === 'string' && o.testTitleEn.trim()) {
          aiTestTitleEn = o.testTitleEn.trim();
        }
      } else {
        return {
          success: false,
          message:
            'JSON must be a question array, or an object { "testTitle"?, "testTitleEn"?, "questions": [...] }',
        };
      }
    } catch {
      return { success: false, message: 'Invalid JSON format' };
    }

    const formTitle = title.trim();
    const resolvedTitle = formTitle || aiTestTitle || 'Imported test';
    const resolvedTitleEn = titleEnForm || aiTestTitleEn || null;

    let testId = existingTestId;
    let testTitle = resolvedTitle;

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
      'mp_general_knowledge',
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
        resolvedTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') +
        '-' +
        nanoid(4);

      const isFreeAccessFlag = formData.get('isFreeAccess') === 'true';
      const isInstantModeFlag = formData.get('isInstantMode') === 'true';

      await db.insert(tests).values({
        id: testId,
        title: resolvedTitle,
        titleEn: resolvedTitleEn,
        slug: slug,
        type: type, // FLT, UNIT, MISC, etc.
        unitId: type === 'UNIT' || type === 'TOPIC' || type === 'MISC' ? unitId : null,
        topicId: type === 'TOPIC' ? topicId : null,
        description: `Imported test: ${resolvedTitle}`,
        totalMarks: totalMarksPlanned,
        totalQuestions: n,
        durationMinutes,
        examType: 'mppolice',
        // Now using the explicit toggle from the admin panel
        isFreeAccess: isFreeAccessFlag,
        isInstantMode: isInstantModeFlag,
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
      finalQuestionCount = n;
      await db
        .update(tests)
        .set({ totalQuestions: finalQuestionCount })
        .where(eq(tests.id, testId || ''));
    }

    // Existing-test JSON uploads never applied `collectionTag` before — merge into `tests.tags` so
    // PYQ/FLT + `collection:memory` shows under MBT on the quiz hub.
    if (mode === 'existing' && testId) {
      const collectionFromForm = formData.get('collectionTag');
      if (typeof collectionFromForm === 'string' && collectionFromForm.trim()) {
        const [testRow] = await db.select({ tags: tests.tags }).from(tests).where(eq(tests.id, testId));
        const rawTags = testRow?.tags;
        let tagList: string[] = [];
        if (Array.isArray(rawTags)) {
          tagList = rawTags.map((t) => String(t));
        } else if (rawTags && typeof rawTags === 'object') {
          tagList = Object.values(rawTags as Record<string, unknown>).map((v) => String(v));
        } else if (typeof rawTags === 'string') {
          try {
            const p = JSON.parse(rawTags) as unknown;
            if (Array.isArray(p)) tagList = p.map((t) => String(t));
          } catch {
            tagList = [];
          }
        }
        const trimmed = collectionFromForm.trim();
        const withoutCollection = tagList.filter((t) => !/^collection\s*:/i.test(t));
        withoutCollection.push(`collection:${trimmed}`);
        await db
          .update(tests)
          .set({ tags: withoutCollection, updatedAt: new Date() })
          .where(eq(tests.id, testId));
      }
    }

    revalidateTag(CACHE.TESTS.TAGS.ALL, { expire: 0 });
    revalidateTag('tests-list', { expire: 0 });
    revalidateTag('syllabus-topics', { expire: 0 });
    revalidatePath('/tests');
    revalidatePath('/admin/dashboard');
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
      .limit(1000); // Increased limit to show more history per user request

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

export async function toggleTelemetryAction(enabled: boolean) {
  await requireAdmin();
  try {
    await setTelemetryEnabled(enabled);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update telemetry settings' };
  }
}

export async function fetchTelemetryStateAction() {
  await requireAdmin();
  try {
    const enabled = await getTelemetryEnabled();
    return { success: true, enabled };
  } catch {
    return { success: false, enabled: false };
  }
}

// --- MANUAL PASSWORD LINK GENERATOR ---
export async function generateManualPasswordLink(userId: string) {
  await requireAdmin();
  try {
    const { mppscUsers, payments, verificationTokens } = await import('@/db/schema');
    const { v4: uuidv4 } = await import('uuid');
    const { addHours } = await import('date-fns');

    // 1. Verify user exists and is not deleted
    const [user] = await db
      .select()
      .from(mppscUsers)
      .where(and(eq(mppscUsers.id, userId), sql`${mppscUsers.deletedAt} IS NULL`));

    if (!user) {
      return { success: false, error: 'User not found or has been deleted' };
    }

    // 2. Guard: Only for users with a captured payment or non-free plan
    // This prevents unintentional Pro access for free users if the set-password flow defaults to Pro.
    const [latestPayment] = await db
      .select()
      .from(payments)
      .where(and(eq(payments.userId, userId), eq(payments.status, 'captured')))
      .orderBy(desc(payments.createdAt))
      .limit(1);

    if (!latestPayment && user.planTier === 'free') {
      return { 
        success: false, 
        error: 'Manual links are restricted to users with a captured payment or active paid plan.' 
      };
    }

    const token = uuidv4();
    const expires = addHours(new Date(), 24); // Manual links last longer (24h)

    await db.insert(verificationTokens).values({
      identifier: userId,
      token,
      expires,
    });

    const { appPath } = await import('@/lib/app-url');
    const url = `${appPath('auth/set-password')}?token=${token}`;

    logger.info(`Manual password link generated for user: ${userId} by admin`);
    return { success: true, url };
  } catch (error) {
    logger.error('Failed to generate manual link:', error);
    return { success: false, error: 'Failed to generate link' };
  }
}

// --- EMAIL DEBUGGER ---
export async function testResendEmail(targetEmail: string) {
  await requireAdmin();
  try {
    const { Resend } = await import('resend');
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return { success: false, error: 'RESEND_API_KEY is missing in .env' };
    }

    const resend = new Resend(apiKey);
    const fromName = process.env.EMAIL_FROM_NAME || 'MP POLICE ZEN';
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'mppolice@zenscroll.app';
    const fromEmail = `${fromName} <${fromAddress}>`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [targetEmail],
      subject: '🛠️ Test Email - MP POLICE ZEN Debugger',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #10b981;">Resend is Working! ✅</h2>
          <p>If you are reading this, your Resend configuration is correct.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            <strong>From:</strong> ${fromEmail}<br>
            <strong>Time:</strong> ${new Date().toLocaleString('en-IN')}
          </p>
        </div>
      `,
    });

    if (error) {
      logger.error('Resend Debug Test Failed:', error);
      return {
        success: false,
        error: error.message || 'Resend returned an error',
        details: error,
      };
    }

    return { success: true, data };
  } catch (error: any) {
    logger.error('Test email execution error:', error);
    return { success: false, error: error.message || 'Execution failed' };
  }
}

