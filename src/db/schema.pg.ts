import {
  pgTable,
  text,
  integer,
  doublePrecision,
  index,
  uniqueIndex,
  numeric,
  primaryKey,
  serial,
  customType,
} from 'drizzle-orm/pg-core';

import { sql, relations } from 'drizzle-orm';

export const booleanMode = customType<{ data: boolean; driverData: boolean | number | string }>({
  dataType: () => 'boolean',
  fromDriver: (value) => value === true || value === 1 || value === '1' || value === 'true',
  toDriver: (value) => Boolean(value),
});

export const timestampMode = customType<{ data: Date; driverData: Date | string | number }>({
  dataType: () => 'timestamp with time zone',
  fromDriver: (value) => (value instanceof Date ? value : new Date(value)),
  toDriver: (value) => (value instanceof Date ? value.toISOString() : new Date(value).toISOString()),
});

export const jsonText = <T = unknown>(name: string) =>
  customType<{ data: T; driverData: string | unknown }>({
    dataType: () => 'jsonb',
    fromDriver: (value) => {
      if (value === null || value === undefined) return value as T;
      if (typeof value !== 'string') return value as T;
      try {
        return JSON.parse(value) as T;
      } catch {
        // Some Postgres drivers can stringify an already-decoded JSON value
        // as "[object Object]". Invalid optional JSON must not break auth.
        return {} as T;
      }
    },
    toDriver: (value) => JSON.stringify(value),
  })(name);




// MPPSC Users Table
export const mppscUsers = pgTable(
  'mppsc_users',
  {
    id: text('id').primaryKey(), // UUID handled in application logic
    createdAt: timestampMode('created_at').default(sql`now()`),
    email: text('email').unique().notNull(),
    password: text('password').notNull(),
    name: text('name'),
    isSubscribed: booleanMode('is_subscribed').default(false),
    planTier: text('plan_tier', { enum: ['free', 'lite', 'pro'] }).default('free'),
    role: text('role').default('guest'), // 'guest' | 'admin'
    adminSecret: text('admin_secret'), // Secure key for admin operations (nullable)
    deletedAt: timestampMode('deleted_at'), // Soft delete support
    // Active flag — admin toggle. Inactive = can't login. Default ON.
    isActive: booleanMode('is_active').default(true),
    // ── New Fields ────────────────────────────────────────────────
    sessionVersion: integer('session_version').default(1),
    // Access expiry — after this timestamp, user can't access content
    // Default: 6 months from creation. Admin can extend per user.
    accessExpiresAt: timestampMode('access_expires_at'),
    // Phone number — optional, for contact
    phone: text('phone'),
    category: text('category', { enum: ['UR', 'OBC', 'SC', 'ST', 'EWS', 'PH'] }).default('UR'),
    gender: text('gender', { enum: ['M', 'F', 'OTHER'] }).default('M'),
    // Metadata — JSON field for location, notes, any extra info admin wants to store
    metadata: jsonText('metadata'),
    // Previous user ID — when lite→pro upgrade happens via soft-delete+recreate
    // Links to the old record for tracking migration history
    previousUserId: text('previous_user_id'),
    // Exam type segregation - UPSC/MPPSC/MPPOLICE isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
      .default('mppolice')
      .notNull(),
  },
  (table) => [index('idx_users_email').on(table.email)]
);

// Tests Table
export const tests = pgTable(
  'tests',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    titleEn: text('title_en'),
    description: text('description'),
    slug: text('slug').unique().notNull(),
    durationMinutes: integer('duration_minutes').notNull(),
    totalQuestions: integer('total_questions').default(0),
    totalMarks: integer('total_marks').notNull(),
    type: text('type', {
      enum: ['FLT', 'UNIT', 'CSAT', 'PYQ', 'TOPIC', 'MISC', 'UPSC_PYQ', 'UPSC_FLT', 'UPSC_FREE_QUIZ', 'POLICE_CONSTABLE', 'POLICE_SI'],
    }).notNull(),
    unitId: text('unit_id'), // To link directly to a syllabus unit e.g., 'unit_1'
    topicId: text('topic_id'), // To link to specific topic ID from syllabusData
    tags: jsonText('tags'), // JSON array of related tags e.g., ['history', 'ancient']
    isPro: booleanMode('is_pro').default(false),
    // ── Access Control Flags ──────────────────────────────────────────
    // Ye 3 flags admin panel se control hote hain
    // isFreeAccess = true → Free/Guest users bhi de sakte hain test
    // isLiteAccess = true → Lite plan wale de sakte hain
    // isProAccess = true  → Pro plan wale de sakte hain (default true)
    // Admin ko ye check nahi lagta — wo sab de sakta hai
    isFreeAccess: booleanMode('is_free_access').default(false),
    isLiteAccess: booleanMode('is_lite_access').default(false),
    isProAccess: booleanMode('is_pro_access').default(true),
    isInstantMode: booleanMode('is_instant_mode').default(false),
    displayOrder: integer('display_order').default(0),
    isHidden: booleanMode('is_hidden').default(false),
    maxRetries: integer('max_retries'), // null = unlimited. Standard: Unit=5, FLT=3
    createdAt: timestampMode('created_at').default(sql`now()`),
    updatedAt: timestampMode('updated_at').default(sql`now()`),
    deletedAt: timestampMode('deleted_at'), // Soft delete support
    // Category cutoffs JSON for result analysis
    // e.g. { "UR_OPEN": 154, "UR_FEMALE": 150, "OBC_OPEN": 148, ... }
    cutoffs: jsonText('cutoffs').$type<Record<string, number>>(),
    // Exam type segregation - UPSC/MPPSC/MPPOLICE isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
      .default('mppolice')
      .notNull(),
  },
  (table) => [
    index('idx_tests_slug').on(table.slug),
    index('idx_tests_type_ispro').on(table.type, table.isPro),
  ]
);

// Questions Table
export const questions = pgTable(
  'questions',
  {
    id: text('id').primaryKey(),
    testId: text('test_id')
      .references(() => tests.id, { onDelete: 'cascade' })
      .notNull(),
    questionText: text('question_text').notNull(), // Hindi (Default)
    questionTextEn: text('question_text_en'), // English
    options: jsonText('options').notNull(), // JSON: [{ id: 'A', text: 'Hi', text_en: 'En' }]
    correctAnswer: text('correct_answer').notNull(), // Option ID (e.g., 'A') or Text
    explanation: text('explanation'), // Hindi
    explanationEn: text('explanation_en'), // English
    marks: integer('marks').notNull(),
    negativeMarks: doublePrecision('negative_marks').default(1),
    idealTime: integer('ideal_time').default(60), // Expected time in seconds
    order: integer('order').notNull(),
    subject: text('subject'), // e.g., 'Indian History', 'Polity'
    // New fields for Matching Support
    type: text('type', { enum: ['standard', 'matching'] }).default('standard'),
    matchPairs: jsonText('match_pairs'), // JSON Array: [{ id: '1', label: 'A', match: 'B', ... }]
    extendedData: jsonText('extended_data'), // New flexible schema for UPSC statement/table questions
    deletedAt: timestampMode('deleted_at'), // Soft delete support
    // Exam type segregation - UPSC/MPPSC/MPPOLICE isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
      .default('mppolice')
      .notNull(),
  },
  (table) => [index('idx_questions_subject').on(table.testId, table.subject)]
);

// PYQ Canonical Topics
export const pyqTopics = pgTable(
  'pyq_topics',
  {
    id: text('id').primaryKey(),
    subject: text('subject').notNull(),
    topicSlug: text('topic_slug').notNull(),
    topicTitle: text('topic_title').notNull(),
    topicTitleEn: text('topic_title_en'),
    description: text('description'),
    aiContent: jsonText('ai_content'), // New field for deep_learning
    isActive: booleanMode('is_active').default(true),
    createdAt: timestampMode('created_at').default(sql`now()`),
    updatedAt: timestampMode('updated_at').default(sql`now()`),
  },
  (table) => [
    uniqueIndex('pyq_topics_topic_slug_unique').on(table.topicSlug),
    index('idx_pyq_topics_subject').on(table.subject, table.isActive),
  ]
);

// PYQ Question <> Topic Mapping
export const pyqQuestionTopics = pgTable(
  'pyq_question_topics',
  {
    id: text('id').primaryKey(),
    questionId: text('question_id')
      .references(() => questions.id, { onDelete: 'cascade' })
      .notNull(),
    topicId: text('topic_id')
      .references(() => pyqTopics.id, { onDelete: 'cascade' })
      .notNull(),
    confidence: doublePrecision('confidence').default(1),
    isPrimary: booleanMode('is_primary').default(false),
    source: text('source', { enum: ['manual', 'ai', 'rule'] }).default('manual'),
    createdAt: timestampMode('created_at').default(sql`now()`),
  },
  (table) => [
    uniqueIndex('pyq_qt_question_topic_unique').on(table.questionId, table.topicId),
    index('idx_pyq_qt_topic').on(table.topicId),
    index('idx_pyq_qt_question').on(table.questionId),
    index('idx_pyq_qt_primary').on(table.topicId, table.isPrimary),
  ]
);

// PYQ Facts Bank (Student Revision)
export const pyqFactBank = pgTable(
  'pyq_fact_bank',
  {
    id: text('id').primaryKey(),
    topicId: text('topic_id')
      .references(() => pyqTopics.id, { onDelete: 'cascade' })
      .notNull(),
    subject: text('subject').notNull(),
    factText: text('fact_text').notNull(),
    factTextEn: text('fact_text_en'),
    memoryTip: text('memory_tip'),
    memoryTipEn: text('memory_tip_en'),
    scamAlert: text('scam_alert'),
    scamAlertEn: text('scam_alert_en'),
    difficulty: text('difficulty', { enum: ['easy', 'medium', 'hard'] }).default('medium'),
    frequencyScore: doublePrecision('frequency_score').default(0),
    importanceScore: doublePrecision('importance_score').default(0),
    pyqRefs: jsonText('pyq_refs')
      .$type<{ testId?: string; questionId?: string; year?: number }[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    tags: jsonText('tags')
      .$type<string[]>()
      .default(sql`'[]'::jsonb`),
    status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft'),
    source: text('source', { enum: ['manual', 'ai'] }).default('manual'),
    createdBy: text('created_by'),
    createdAt: timestampMode('created_at').default(sql`now()`),
    updatedAt: timestampMode('updated_at').default(sql`now()`),
  },
  (table) => [
    index('idx_fact_topic_status').on(table.topicId, table.status),
    index('idx_fact_subject_status').on(table.subject, table.status),
    index('idx_fact_importance').on(table.status, table.importanceScore),
  ]
);

/** Fast-revision GK / GS one-liners (MP Police) — tile shows Q+A; expand for deep JSON */
export const mppoliceOneLinerFacts = pgTable(
  'mppolice_one_liner_facts',
  {
    id: text('id').primaryKey(),
    subjectTag: text('subject_tag').notNull(),
    stemHi: text('stem_hi').notNull(),
    stemEn: text('stem_en'),
    answerHi: text('answer_hi').notNull(),
    answerEn: text('answer_en'),
    importanceScore: doublePrecision('importance_score').default(0),
    sortOrder: integer('sort_order').default(0),
    extendedData: jsonText('extended_data').$type<{
      facts?: string[];
      factsEn?: string[];
      memoryTip?: string;
      memoryTipEn?: string;
      related?: string[];
      explanationHi?: string;
      explanationEn?: string;
      analogy?: string;
      analogyEn?: string;
      syllabusTopic?: string;
      patternConnections?: string[];
      pyqs?: { exam: string; question: string; year?: string; answer?: string }[];
    } | null>(),
    status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft'),
    createdAt: timestampMode('created_at').default(sql`now()`),
    updatedAt: timestampMode('updated_at').default(sql`now()`),
  },
  (table) => [
    index('idx_mppol_ol_subject_status').on(table.subjectTag, table.status),
    index('idx_mppol_ol_importance').on(table.status, table.importanceScore),
  ]
);

// GK One-Liner User Revision Tracking
export const mppoliceOneLinerRevisions = pgTable(
  'mppolice_one_liner_revisions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => mppscUsers.id, { onDelete: 'cascade' })
      .notNull(),
    factId: text('fact_id')
      .references(() => mppoliceOneLinerFacts.id, { onDelete: 'cascade' })
      .notNull(),
    revisionCount: integer('revision_count').default(0),
    lastRevisedAt: timestampMode('last_revised_at').default(sql`now()`),
  },
  (table) => [
    index('idx_mppol_rel_user').on(table.userId),
    index('idx_mppol_rel_fact').on(table.factId),
    uniqueIndex('idx_mppol_rel_user_fact').on(table.userId, table.factId),
  ]
);

// PYQ Topic Trends Snapshot
export const pyqTopicTrends = pgTable(
  'pyq_topic_trends',
  {
    id: text('id').primaryKey(),
    topicId: text('topic_id')
      .references(() => pyqTopics.id, { onDelete: 'cascade' })
      .notNull(),
    subject: text('subject').notNull(),
    year: integer('year').notNull(),
    questionCount: integer('question_count').default(0).notNull(),
    weightPercent: doublePrecision('weight_percent').default(0).notNull(),
    trendDelta: doublePrecision('trend_delta').default(0),
    computedAt: timestampMode('computed_at').default(sql`now()`),
  },
  (table) => [
    uniqueIndex('pyq_trends_topic_year_unique').on(table.topicId, table.year),
    index('idx_trends_subject_year').on(table.subject, table.year),
    index('idx_trends_topic_year').on(table.topicId, table.year),
  ]
);

// PYQ Import Jobs (Admin Audit)
export const pyqContentImportJobs = pgTable(
  'pyq_content_import_jobs',
  {
    id: text('id').primaryKey(),
    uploadedBy: text('uploaded_by'),
    inputHash: text('input_hash').notNull(),
    totalRecords: integer('total_records'),
    successCount: integer('success_count'),
    failureCount: integer('failure_count'),
    status: text('status', { enum: ['pending', 'processed', 'failed'] }).default('pending'),
    errorReport: jsonText('error_report'),
    createdAt: timestampMode('created_at').default(sql`now()`),
  },
  (table) => [index('idx_pyq_jobs_status_created').on(table.status, table.createdAt)]
);

// PYQ Repeated Questions Cache (Pre-computed for fast reads)
export const pyqRepeatedCache = pgTable(
  'pyq_repeated_cache',
  {
    id: text('id').primaryKey(),
    questionId: text('question_id')
      .references(() => questions.id, { onDelete: 'cascade' })
      .notNull(),
    clusterId: text('cluster_id').notNull(), // Groups similar questions
    unitId: text('unit_id'), // unit_1, unit_2, etc.
    unitTitle: text('unit_title'),
    repeatCount: integer('repeat_count').default(1).notNull(),
    years: jsonText('years').$type<number[]>().notNull(), // [2020, 2021, 2023]
    occurrences: jsonText('occurrences')
      .$type<{ year: number; qNo: number; testId: string }[]>()
      .notNull(),
    relatedQuestionIds: jsonText('related_question_ids').$type<string[]>().notNull(), // All question IDs in this cluster
    computedAt: timestampMode('computed_at').default(sql`now()`),
  },
  (table) => [
    index('idx_pyq_repeated_cluster').on(table.clusterId),
    index('idx_pyq_repeated_unit').on(table.unitId),
    index('idx_pyq_repeated_count').on(table.repeatCount),
  ]
);

// PYQ Unit Distribution Cache (Pre-computed for fast reads)
export const pyqUnitCache = pgTable(
  'pyq_unit_cache',
  {
    id: text('id').primaryKey(),
    year: integer('year').notNull(),
    unitId: text('unit_id').notNull(),
    unitTitle: text('unit_title').notNull(),
    questionCount: integer('question_count').default(0).notNull(),
    questionIds: jsonText('question_ids').$type<string[]>().notNull(),
    computedAt: timestampMode('computed_at').default(sql`now()`),
  },
  (table) => [
    uniqueIndex('pyq_unit_cache_year_unit_unique').on(table.year, table.unitId),
    index('idx_pyq_unit_cache_year').on(table.year),
  ]
);

// User Attempts Table
export const userAttempts = pgTable(
  'user_attempts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => mppscUsers.id, { onDelete: 'cascade' })
      .notNull(), // Linked to users table
    testId: text('test_id')
      .references(() => tests.id, { onDelete: 'cascade' })
      .notNull(),
    startTime: timestampMode('start_time').notNull(),
    endTime: timestampMode('end_time'),
    score: doublePrecision('score'),
    isCompleted: booleanMode('is_completed').default(false),
    createdAt: timestampMode('created_at').default(sql`now()`),
    deletedAt: timestampMode('deleted_at'), // Soft delete support
    // Exam type segregation - UPSC/MPPSC/MPPOLICE isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
      .default('mppolice')
      .notNull(),
  },
  (table) => [
    index('user_id_idx').on(table.userId),
    index('test_id_idx').on(table.testId),
    index('user_test_idx').on(table.userId, table.testId),
    // Optimized for analytics and completion history
    index('completed_idx').on(table.isCompleted, table.endTime),
    // Composite index for fast history lookups
    index('idx_user_test_completed').on(
      table.userId,
      table.testId,
      table.isCompleted,
      table.endTime
    ),
    // 🛡️ Note: Race condition duplicates are prevented via application-level rate-limiting locks.
    // Time-based analytics index
    index('idx_attempts_by_date').on(table.userId, table.endTime),
    // NEW: Pro-Level Index for Leaderboards and Score Analytics
    index('idx_user_attempts_completion_score').on(table.userId, table.isCompleted, table.score),
  ]
);

// Attempt Answers (Granular tracking)
export const attemptAnswers = pgTable(
  'attempt_answers',
  {
    id: text('id').primaryKey(),
    attemptId: text('attempt_id')
      .references(() => userAttempts.id, { onDelete: 'cascade' })
      .notNull(),
    questionId: text('question_id')
      .references(() => questions.id)
      .notNull(),
    userAnswer: text('user_answer'),
    isCorrect: booleanMode('is_correct'),
    timeTakenSeconds: integer('time_taken_seconds'),
  },
  (table) => [
    index('attempt_id_idx').on(table.attemptId),
    index('question_id_idx').on(table.questionId),
    // Performance: Composite index for granular analytics
    index('idx_attempt_question').on(table.attemptId, table.questionId),
  ]
);

// Syllabus Topics Table (New)
export const syllabusTopics = pgTable(
  'syllabus_topics',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(), // e.g. 'unit_1'
    title: text('title').notNull(),
    titleEn: text('title_en'),
    // Content stored as JSON for flexibility
    // Expected default keys: front, back, details, mnemonic, impact_emoji, important_facts
    content: jsonText('content').notNull(),
    contentEn: jsonText('content_en'),
    // New AI-enriched content (Points, PYQ, Mnemonic) - Separate from official syllabus text
    aiContent: jsonText('ai_content'),
    aiContentEn: jsonText('ai_content_en'),
    order: integer('order').notNull(),
    // ── Access Control Flags ──────────────────────────────────────
    // isFree = old flag (backward compat) — same as isFreeAccess
    isFree: booleanMode('is_free').default(false),
    // New tier-based flags — admin panel se control karo
    isLiteAccess: booleanMode('is_lite_access').default(false),
    isProAccess: booleanMode('is_pro_access').default(true),
    imgUrl: text('img_url'), // For image support
    createdAt: timestampMode('created_at').default(sql`now()`),
    // Exam type segregation - UPSC/MPPSC/MPPOLICE isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
      .default('mppolice')
      .notNull(),
  },
  (table) => [index('unit_order_idx').on(table.unitId, table.order)]
);

// Test Attempt Limits — category wise max attempts (source of truth)
// null maxAttempts = unlimited
export const testAttemptLimits = pgTable('test_attempt_limits', {
  testType: text('test_type', {
    enum: ['FLT', 'UNIT', 'CSAT', 'PYQ', 'TOPIC', 'MISC', 'UPSC_PYQ', 'UPSC_FLT', 'UPSC_FREE_QUIZ', 'POLICE_CONSTABLE', 'POLICE_SI'],
  }).primaryKey(),
  maxAttempts: integer('max_attempts'), // null = unlimited
});

// Blog/Vlog Content Table
export const contentBlogs = pgTable('content_blogs', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  excerpt: text('excerpt'), // Auto-generated plain text summary (200-300 chars) that is SEO friendly
  content: jsonText('content').notNull(), // Mixed content: text, images, etc.
  category: text('category').notNull(), // e.g., 'history', 'geography', 'current_affairs_mp'
  examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
    .default('mppolice')
    .notNull(), // Blog exam type for segregation
  imageUrl: text('image_url'),
  readingTime: integer('reading_time'), // in minutes
  contentType: text('content_type', { enum: ['blog', 'vlog'] })
    .default('blog')
    .notNull(),
  unitId: text('unit_id'), // Linked to syllabusUnit e.g., 'unit_1', 'unit_10'
  topicId: text('topic_id'), // Linked to syllabusData topic.id (e.g. '1', '2')
  isPremium: booleanMode('is_premium').default(true), // Legacy flag (kept for backward compat)
  // ── Access Control Flags ──────────────────────────────────────
  // Same pattern as tests — admin panel se toggle karo
  isFreeAccess: booleanMode('is_free_access').default(false),
  isLiteAccess: booleanMode('is_lite_access').default(false),
  isProAccess: booleanMode('is_pro_access').default(true),
  isPublished: booleanMode('is_published').default(false),
  isHidden: booleanMode('is_hidden').default(false),
  createdAt: timestampMode('created_at').default(sql`now()`),
  updatedAt: timestampMode('updated_at').default(sql`now()`),
});

// Relations
export const testsRelations = relations(tests, ({ many }) => ({
  questions: many(questions),
  userAttempts: many(userAttempts),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  test: one(tests, {
    fields: [questions.testId],
    references: [tests.id],
  }),
}));

export const userAttemptsRelations = relations(userAttempts, ({ one, many }) => ({
  user: one(mppscUsers, {
    fields: [userAttempts.userId],
    references: [mppscUsers.id],
  }),
  test: one(tests, {
    fields: [userAttempts.testId],
    references: [tests.id],
  }),
  answers: many(attemptAnswers),
}));

// Support Tickets Table
export const supportTickets = pgTable('support_tickets', {
  id: text('id').primaryKey(),
  userId: text('user_id'), // Optional, if user is logged in
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  category: text('category').default('general'), // 'general', 'technical', 'payment', 'content'
  message: text('message').notNull(),
  status: text('status', { enum: ['open', 'in_progress', 'resolved', 'closed'] }).default('open'),
  createdAt: timestampMode('created_at').default(sql`now()`),
  // Exam type segregation - UPSC/MPPSC/MPPOLICE isolation
  examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
    .default('mppolice')
    .notNull(),
});

export const attemptAnswersRelations = relations(attemptAnswers, ({ one }) => ({
  attempt: one(userAttempts, {
    fields: [attemptAnswers.attemptId],
    references: [userAttempts.id],
  }),
  question: one(questions, {
    fields: [attemptAnswers.questionId],
    references: [questions.id],
  }),
}));

// Payment Exit Reasons Table
export const paymentExitReasons = pgTable('payment_exit_reasons', {
  id: text('id').primaryKey(),
  reason: text('reason').notNull(),
  customReason: text('custom_reason'),
  createdAt: timestampMode('created_at').default(sql`now()`),
  // Exam type segregation - UPSC/MPPSC/MPPOLICE isolation
  examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
    .default('mppolice')
    .notNull(),
});

// Topic Revisions Table (User Progress)
export const topicRevisions = pgTable('topic_revisions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => mppscUsers.id, { onDelete: 'cascade' })
    .notNull(),
  topicId: text('topic_id').notNull(), // Matching syllabusData IDs
  unitId: text('unit_id').notNull(),
  revisionCount: integer('revision_count').default(0),
  lastRevisedAt: timestampMode('last_revised_at').default(
    sql`now()`
  ),
});

// Test Leaderboard Table (Ranking Feature)
export const testLeaderboard = pgTable(
  'test_leaderboard',
  {
    id: text('id').primaryKey(),
    testId: text('test_id').notNull(),
    userId: text('user_id'), // Nullable for fake users
    displayName: text('display_name').notNull(),
    score: doublePrecision('score').notNull(),
    percentage: doublePrecision('percentage'),
    timeTakenSeconds: integer('time_taken_seconds'),
    rank: integer('rank'),
    isFake: integer('is_fake').default(0),
    createdAt: timestampMode('created_at').default(sql`now()`),
  },
  (table) => [
    index('test_score_idx').on(table.testId, table.score),
    // Ranking index: Score DESC, Time ASC
    index('idx_leaderboard_ranking').on(table.testId, table.score, table.timeTakenSeconds),
  ]
);

// Free Quiz Attempts (Guest score tracking)
export const freeQuizAttempts = pgTable(
  'free_quiz_attempts',
  {
    id: text('id').primaryKey(),
    testId: text('test_id')
      .references(() => tests.id, { onDelete: 'cascade' })
      .notNull(),
    guestId: text('guest_id'),
    score: doublePrecision('score'),
    totalQuestions: integer('total_questions'),
    percentage: doublePrecision('percentage'),
    timeTakenSeconds: integer('time_taken_seconds'),
    completedAt: timestampMode('completed_at').default(
      sql`now()`
    ),
    // Exam type segregation - UPSC/MPPSC/MPPOLICE isolation  
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
      .default('mppolice')  // Preserve existing attempts as MPPOLICE
      .notNull(),
  },
  (table) => [
    index('idx_free_attempts_test').on(table.testId),
    index('idx_free_attempts_guest').on(table.guestId),
  ]
);

// User Feedback Table
export const feedbacks = pgTable(
  'feedbacks',
  {
    id: text('id').primaryKey(),
    userId: text('user_id'), // Optional, if user is logged in
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'), // Optional phone number
    message: text('message').notNull(),
    rating: integer('rating').notNull(), // 1 to 5
    // Categories: 'bug', 'content', 'ui', 'feature_request', 'other'
    category: text('category').default('other'),
    // Alignment with Testimonials
    role: text('role'), // e.g., 'Aspirant', 'Selected Officer', 'Teacher'
    location: text('location'), // e.g., 'Indore', 'Bhopal'
    createdAt: timestampMode('created_at').default(sql`now()`),
    // Exam type segregation - UPSC/MPPSC/MPPOLICE isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
      .default('mppolice')
      .notNull(),
  },
  (table) => [
    index('idx_feedbacks_created_at').on(table.createdAt),
    index('idx_feedbacks_category').on(table.category),
    index('idx_feedbacks_role').on(table.role),
  ]
);

// Guests Table (Lead Generation)
export const guests = pgTable(
  'guests',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    mobile: text('mobile'), // Primary identifier for upsert (last 10 digits stored)
    createdAt: timestampMode('created_at').default(sql`now()`),
    updatedAt: timestampMode('updated_at').default(sql`now()`),
    // Exam type segregation - UPSC/MPPSC/MPPOLICE isolation  
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
      .default('mppolice')  // Preserve existing guests as MPPOLICE
      .notNull(),
  },
  (table) => [
    index('idx_guests_email').on(table.email),
    uniqueIndex('idx_guests_mobile_unique').on(table.mobile), // Unique for upsert logic
  ]
);

// User Activity Logs (Audit Trail)
export const mppscUserActivities = pgTable(
  'mppsc_user_activities',
  {
    id: text('id').primaryKey(),
    userId: text('user_id'), // Kept even if user is deleted (for history)
    userEmail: text('user_email').notNull(),
    userName: text('user_name'),
    adminId: text('admin_id'), // Who performed the action
    action: text('action', {
      enum: ['PLAN_CHANGE', 'DELETE', 'GRANT', 'UPDATE', 'LOGIN', 'LOGOUT'],
    }).notNull(),
    details: jsonText('details'), // Store old/new values
    createdAt: timestampMode('created_at').default(sql`now()`),
  },
  (table) => [
    index('idx_activities_user_id').on(table.userId),
    index('idx_activities_action').on(table.action),
    index('idx_activities_created_at').on(table.createdAt),
  ]
);

// Payments Table
export const payments = pgTable(
  'payments',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => mppscUsers.id, { onDelete: 'set null' }), // Set null on user delete
    orderId: text('order_id').notNull(),
    paymentId: text('payment_id').unique(),
    signature: text('signature'),
    amount: integer('amount').notNull(),
    planTier: text('plan_tier', { enum: ['lite', 'pro'] }),
    status: text('status', { enum: ['created', 'captured', 'failed'] })
      .default('created')
      .notNull(),
    currency: text('currency').default('INR').notNull(),
    receipt: text('receipt'),
    notes: jsonText('notes'),
    createdAt: timestampMode('created_at').default(sql`now()`),
    updatedAt: timestampMode('updated_at').default(sql`now()`),
    // Exam type segregation - UPSC/MPPSC/MPPOLICE isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
      .default('mppolice')
      .notNull(),
  },
  (table) => [
    index('idx_payments_order_id').on(table.orderId),
    index('idx_payments_user_id').on(table.userId),
    index('idx_payments_status').on(table.status),
    index('idx_payments_payment_id').on(table.paymentId),
  ]
);

// Verification Tokens Table (for set password / email verification)
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(), // email or userId
    token: text('token').notNull(),
    expires: timestampMode('expires').notNull(),
    createdAt: timestampMode('created_at').default(sql`now()`),
  },
  (table) => [
    index('idx_verification_tokens_identifier').on(table.identifier),
    index('idx_verification_tokens_token').on(table.token),
  ]
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 PRICING CONFIG TABLE — Dynamic pricing, admin se change karo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Single row table (key-value style) — stores current pricing.
// Admin updates → cache busts → pricing page shows new prices.
// No deploy needed to change prices!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const pricingConfig = pgTable('pricing_config', {
  examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice'] }).primaryKey(),
  // Lite plan pricing
  litePrice: integer('lite_price').default(99), // Current price ₹99
  liteOriginalPrice: integer('lite_original_price').default(299), // Strikethrough ₹299
  liteValidityText: text('lite_validity_text').default('Valid till MP Police Constable Exam'),
  liteMonths: integer('lite_months').default(8), // Shown as "~8 months"
  // Pro plan pricing
  proPrice: integer('pro_price').default(299), // Current price ₹299
  proOriginalPrice: integer('pro_original_price').default(999), // Strikethrough ₹999
  proValidityText: text('pro_validity_text').default('Valid till MP Police SI Exam'),
  proMonths: integer('pro_months').default(12), // Shown as "~12 months"
  // Upgrade pricing
  upgradePrice: integer('upgrade_price').default(199), // Lite→Pro difference
  upgradeOriginalPrice: integer('upgrade_original_price').default(299),
  // Urgency text
  urgencyText: text('urgency_text').default('Special pricing for first 100 students'),
  urgencyTextHi: text('urgency_text_hi').default('पहले 100 छात्रों के लिए विशेष मूल्य'),
  // Dynamic student count for FOMO
  studentsBought: integer('students_bought').default(23),
  // Last updated
  updatedAt: timestampMode('updated_at').default(sql`now()`),
});

// Test Feedback Table
export const testFeedback = pgTable('test_feedback', {
  id: text('id').primaryKey(),
  testId: text('test_id').notNull(),
  userId: text('user_id'), // Optional for guest users
  testType: text('test_type', { enum: ['free', 'premium', 'pyq'] }).notNull(),
  testName: text('test_name'), // Identifies the test title (e.g., 'Modern History Quiz')

  // Feedback ratings
  overallRating: integer('overall_rating').notNull(), // 1-5 stars
  difficultyLevel: text('difficulty_level', {
    enum: ['too_easy', 'just_right', 'too_hard'],
  }).notNull(),
  questionQuality: text('question_quality', {
    enum: ['excellent', 'good', 'average', 'poor'],
  }).notNull(),
  wouldRecommend: text('would_recommend', {
    enum: ['definitely', 'probably', 'maybe', 'no'],
  }).notNull(),

  // Optional text feedback
  comments: text('comments'),

  // User Info (Added to identify guest/logged-in users easily)
  userName: text('user_name'),
  userEmail: text('user_email'),

  // Metadata
  createdAt: timestampMode('created_at').default(sql`now()`),
  updatedAt: timestampMode('updated_at').default(sql`now()`),
  
  // Exam type segregation - UPSC/MPPSC/MPPOLICE isolation  
  examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
    .default('mppolice')  // Preserve existing test feedback as MPPOLICE
    .notNull(),
});

export const testFeedbackRelations = relations(testFeedback, ({ one }) => ({
  user: one(mppscUsers, {
    fields: [testFeedback.userId],
    references: [mppscUsers.id],
  }),
  test: one(tests, {
    fields: [testFeedback.testId],
    references: [tests.id],
  }),
}));

// System Settings Table (Scalable and isolated configuration storage)
export const systemSettings = pgTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: timestampMode('updated_at').default(sql`now()`),
});

export const intelligenceFeedback = pgTable('intelligence_feedback', {
  id: text('id').primaryKey(),
  questionId: text('question_id').notNull(),
  questionText: text('question_text'),
  testId: text('test_id'),
  reaction: text('reaction').notNull(),
  message: text('message'),
  isPro: booleanMode('is_pro').default(false),
  source: text('source'),
  userId: text('user_id'),
  userName: text('user_name'),
  userMobile: text('user_mobile'),
  userEmail: text('user_email'),
  examType: text('exam_type').default('mppolice').notNull(),
  createdAt: timestampMode('created_at').default(sql`now()`),
});
// ==========================================
// TELEGRAM / WHATSAPP SUPPORT INBOX
// ==========================================
export const supportConversations = pgTable('support_conversations', {
  id: text('id').primaryKey(),
  platform: text('platform', { enum: ['whatsapp', 'telegram'] }).notNull(),
  guestId: text('guest_id').references(() => guests.id),
  guestName: text('guest_name'),
  guestPhone: text('guest_phone'), // WhatsApp number or Telegram ID
  language: text('language').default('PENDING'), // EN, HI, PENDING
  status: text('status', { enum: ['open', 'resolved'] }).default('open'),
  humanActive: booleanMode('human_active').default(false), // true = admin replied, suppress bot
  unreadCount: integer('unread_count').default(0),
  lastMessageAt: timestampMode('last_message_at').default(sql`now()`),
  createdAt: timestampMode('created_at').default(sql`now()`),
  updatedAt: timestampMode('updated_at').default(sql`now()`),
  examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
    .default('mppolice')
    .notNull(),
}, (table) => ({
  guestPhoneIdx: index('idx_support_conv_guest_phone').on(table.guestPhone),
  lastMessageAtIdx: index('idx_support_conv_last_msg').on(table.lastMessageAt),
  examTypeIdx: index('idx_support_conv_exam_type').on(table.examType),
}));

export const supportMessages = pgTable('support_messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').references(() => supportConversations.id, { onDelete: 'cascade' }).notNull(),
  sender: text('sender', { enum: ['user', 'bot', 'admin'] }).notNull(),
  text: text('text').notNull(),
  mediaUrl: text('media_url'), // For image messages (WhatsApp image URLs)
  messageType: text('message_type', { enum: ['text', 'image', 'interactive'] }).default('text'),
  status: text('status', { enum: ['sent', 'delivered', 'read', 'failed'] }),
  createdAt: timestampMode('created_at').default(sql`now()`),
  examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice', 'all'] })
    .default('mppolice')
    .notNull(),
}, (table) => ({
  conversationIdIdx: index('idx_support_msg_conv_id').on(table.conversationId),
  createdAtIdx: index('idx_support_msg_created_at').on(table.createdAt),
  examTypeIdx: index('idx_support_msg_exam_type').on(table.examType),
}));

export const supportConversationsRelations = relations(supportConversations, ({ many, one }) => ({
  messages: many(supportMessages),
  guest: one(guests, {
    fields: [supportConversations.guestId],
    references: [guests.id],
  }),
}));

export const supportMessagesRelations = relations(supportMessages, ({ one }) => ({
  conversation: one(supportConversations, {
    fields: [supportMessages.conversationId],
    references: [supportConversations.id],
  }),
}));
