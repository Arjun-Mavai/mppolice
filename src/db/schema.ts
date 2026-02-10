
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// MPPSC Users Table
export const mppscUsers = sqliteTable('mppsc_users', {
  id: text('id').primaryKey(), // UUID handled in application logic
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name'),
  isSubscribed: integer('is_subscribed', { mode: 'boolean' }).default(false),
  planTier: text('plan_tier', { enum: ['free', 'lite', 'pro'] }).default('free'),
  role: text('role').default('guest'), // 'guest' | 'admin'
  adminSecret: text('admin_secret'), // Secure key for admin operations (nullable)
  deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete support
  // Active flag — admin toggle. Inactive = can't login. Default ON.
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  // ── New Fields ────────────────────────────────────────────────
  // Access expiry — after this timestamp, user can't access content
  // Default: 6 months from creation. Admin can extend per user.
  accessExpiresAt: integer('access_expires_at', { mode: 'timestamp' }),
  // Phone number — optional, for contact
  phone: text('phone'),
  // Metadata — JSON field for location, notes, any extra info admin wants to store
  metadata: text('metadata', { mode: 'json' }),
  // Previous user ID — when lite→pro upgrade happens via soft-delete+recreate
  // Links to the old record for tracking migration history
  previousUserId: text('previous_user_id'),
}, (table) => [
  index('idx_users_email').on(table.email),
]);

// Tests Table
export const tests = sqliteTable('tests', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  titleEn: text('title_en'),
  description: text('description'),
  slug: text('slug').unique().notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  totalQuestions: integer('total_questions').default(0),
  totalMarks: integer('total_marks').notNull(),
  type: text('type', { enum: ['FLT', 'UNIT', 'CSAT', 'PYQ', 'TOPIC'] }).notNull(),
  unitId: text('unit_id'), // To link directly to a syllabus unit e.g., 'unit_1'
  topicId: text('topic_id'), // To link to specific topic ID from syllabusData
  tags: text('tags', { mode: 'json' }), // JSON array of related tags e.g., ['history', 'ancient']
  isPro: integer('is_pro', { mode: 'boolean' }).default(false),
  // ── Access Control Flags ──────────────────────────────────────────
  // Ye 3 flags admin panel se control hote hain
  // isFreeAccess = true → Free/Guest users bhi de sakte hain test
  // isLiteAccess = true → Lite plan wale de sakte hain
  // isProAccess = true  → Pro plan wale de sakte hain (default true)
  // Admin ko ye check nahi lagta — wo sab de sakta hai
  isFreeAccess: integer('is_free_access', { mode: 'boolean' }).default(false),
  isLiteAccess: integer('is_lite_access', { mode: 'boolean' }).default(false),
  isProAccess: integer('is_pro_access', { mode: 'boolean' }).default(true),
  displayOrder: integer('display_order').default(0),
  maxRetries: integer('max_retries'), // null = unlimited. Standard: Unit=5, FLT=3
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete support
}, (table) => [
  index('idx_tests_slug').on(table.slug),
  index('idx_tests_type_ispro').on(table.type, table.isPro),
]);

// Questions Table
export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  testId: text('test_id').references(() => tests.id, { onDelete: 'cascade' }).notNull(),
  questionText: text('question_text').notNull(), // Hindi (Default)
  questionTextEn: text('question_text_en'),     // English
  options: text('options', { mode: 'json' }).notNull(), // JSON: [{ id: 'A', text: 'Hi', text_en: 'En' }]
  correctAnswer: text('correct_answer').notNull(), // Option ID (e.g., 'A') or Text
  explanation: text('explanation'),              // Hindi
  explanationEn: text('explanation_en'),         // English
  marks: integer('marks').notNull(),
  negativeMarks: real('negative_marks').default(1),
  idealTime: integer('ideal_time').default(60),  // Expected time in seconds
  order: integer('order').notNull(),
  subject: text('subject'), // e.g., 'Indian History', 'Polity'
  // New fields for Matching Support
  type: text('type', { enum: ['standard', 'matching'] }).default('standard'),
  matchPairs: text('match_pairs', { mode: 'json' }), // JSON Array: [{ id: '1', label: 'A', match: 'B', ... }]
  deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete support
}, (table) => [
    index('idx_questions_subject').on(table.testId, table.subject),
]);

// User Attempts Table
export const userAttempts = sqliteTable('user_attempts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => mppscUsers.id).notNull(), // Linked to users table
  testId: text('test_id').references(() => tests.id).notNull(),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }),
  score: real('score'),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete support
}, (table) => [
  index('user_id_idx').on(table.userId),
  index('test_id_idx').on(table.testId),
  index('user_test_idx').on(table.userId, table.testId),
  // Optimized for analytics and completion history
  index('completed_idx').on(table.isCompleted, table.endTime),
  // Composite index for fast history lookups
  index('idx_user_test_completed').on(table.userId, table.testId, table.isCompleted, table.endTime),
  // Time-based analytics index
  index('idx_attempts_by_date').on(table.userId, table.endTime),
  // NEW: Requested by code review
  index('idx_user_attempts_completion_score').on(table.userId, table.isCompleted, table.score),
]);


// Attempt Answers (Granular tracking)
export const attemptAnswers = sqliteTable('attempt_answers', {
  id: text('id').primaryKey(),
  attemptId: text('attempt_id').references(() => userAttempts.id, { onDelete: 'cascade' }).notNull(),
  questionId: text('question_id').references(() => questions.id).notNull(),
  userAnswer: text('user_answer'),
  isCorrect: integer('is_correct', { mode: 'boolean' }),
  timeTakenSeconds: integer('time_taken_seconds'),
 }, (table) => [
    index('attempt_id_idx').on(table.attemptId),
    index('question_id_idx').on(table.questionId),
    // Performance: Composite index for granular analytics
    index('idx_attempt_question').on(table.attemptId, table.questionId),
]);

// Syllabus Topics Table (New)
export const syllabusTopics = sqliteTable('syllabus_topics', {
  id: text('id').primaryKey(),
  unitId: text('unit_id').notNull(), // e.g. 'unit_1'
  title: text('title').notNull(),
  titleEn: text('title_en'),
  // Content stored as JSON for flexibility
  // Expected default keys: front, back, details, mnemonic, impact_emoji, important_facts
  content: text('content', { mode: 'json' }).notNull(),
  contentEn: text('content_en', { mode: 'json' }), 
  // New AI-enriched content (Points, PYQ, Mnemonic) - Separate from official syllabus text
  aiContent: text('ai_content', { mode: 'json' }),
  aiContentEn: text('ai_content_en', { mode: 'json' }), 
  order: integer('order').notNull(),
  // ── Access Control Flags ──────────────────────────────────────
  // isFree = old flag (backward compat) — same as isFreeAccess
  isFree: integer('is_free', { mode: 'boolean' }).default(false),
  // New tier-based flags — admin panel se control karo
  isLiteAccess: integer('is_lite_access', { mode: 'boolean' }).default(false),
  isProAccess: integer('is_pro_access', { mode: 'boolean' }).default(true),
  imgUrl: text('img_url'), // For image support
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => [
    index('unit_order_idx').on(table.unitId, table.order),
]);

// Blog/Vlog Content Table
export const contentBlogs = sqliteTable('content_blogs', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content', { mode: 'json' }).notNull(), // Mixed content: text, images, etc.
  category: text('category').notNull(), // e.g., 'history', 'geography', 'current_affairs_mp'
  imageUrl: text('image_url'),
  readingTime: integer('reading_time'), // in minutes
  contentType: text('content_type', { enum: ['blog', 'vlog'] }).default('blog').notNull(),
  unitId: text('unit_id'), // Linked to syllabusUnit e.g., 'unit_1', 'unit_10'
  topicId: text('topic_id'), // Linked to syllabusData topic.id (e.g. '1', '2')
  isPremium: integer('is_premium', { mode: 'boolean' }).default(true), // Legacy flag (kept for backward compat)
  // ── Access Control Flags ──────────────────────────────────────
  // Same pattern as tests — admin panel se toggle karo
  isFreeAccess: integer('is_free_access', { mode: 'boolean' }).default(false),
  isLiteAccess: integer('is_lite_access', { mode: 'boolean' }).default(false),
  isProAccess: integer('is_pro_access', { mode: 'boolean' }).default(true),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Relations
import { relations } from 'drizzle-orm';

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
    answers: many(attemptAnswers)
}));

// Support Tickets Table
export const supportTickets = sqliteTable('support_tickets', {
    id: text('id').primaryKey(),
    userId: text('user_id'), // Optional, if user is logged in
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    category: text('category').default('general'), // 'general', 'technical', 'payment', 'content'
    message: text('message').notNull(),
    status: text('status', { enum: ['open', 'in_progress', 'resolved', 'closed'] }).default('open'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const attemptAnswersRelations = relations(attemptAnswers, ({ one }) => ({
    attempt: one(userAttempts, {
        fields: [attemptAnswers.attemptId],
        references: [userAttempts.id]
    }),
    question: one(questions, {
        fields: [attemptAnswers.questionId],
        references: [questions.id]
    })
}));

// Payment Exit Reasons Table
export const paymentExitReasons = sqliteTable('payment_exit_reasons', {
    id: text('id').primaryKey(),
    reason: text('reason').notNull(),
    customReason: text('custom_reason'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Topic Revisions Table (User Progress)
export const topicRevisions = sqliteTable('topic_revisions', {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => mppscUsers.id).notNull(),
    topicId: text('topic_id').notNull(), // Matching syllabusData IDs
    unitId: text('unit_id').notNull(),
    revisionCount: integer('revision_count').default(0),
    lastRevisedAt: integer('last_revised_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Test Leaderboard Table (Ranking Feature)
export const testLeaderboard = sqliteTable('test_leaderboard', {
    id: text('id').primaryKey(),
    testId: text('test_id').notNull(),
    userId: text('user_id'), // Nullable for fake users
    displayName: text('display_name').notNull(),
    score: real('score').notNull(),
    percentage: real('percentage'),
    timeTakenSeconds: integer('time_taken_seconds'),
    rank: integer('rank'),
    isFake: integer('is_fake').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => [
  index('test_score_idx').on(table.testId, table.score),
  // Ranking index: Score DESC, Time ASC
  index('idx_leaderboard_ranking').on(table.testId, table.score, table.timeTakenSeconds),
]);

// User Feedback Table
export const feedbacks = sqliteTable('feedbacks', {
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
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => [
    index('idx_feedbacks_created_at').on(table.createdAt),
    index('idx_feedbacks_category').on(table.category),
    index('idx_feedbacks_role').on(table.role),
]);

// Guests Table (Lead Generation)
export const guests = sqliteTable('guests', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    mobile: text('mobile'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => [
    index('idx_guests_email').on(table.email),
    index('idx_guests_mobile').on(table.mobile),
]);

// Payments Table
export const payments = sqliteTable('payments', {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => mppscUsers.id).notNull(),
    orderId: text('order_id').notNull(),
    paymentId: text('payment_id').unique(),
    signature: text('signature'),
    amount: integer('amount').notNull(),
    planTier: text('plan_tier', { enum: ['lite', 'pro'] }),
    status: text('status', { enum: ['created', 'captured', 'failed'] }).default('created').notNull(),
    currency: text('currency').default('INR').notNull(),
    receipt: text('receipt'),
    notes: text('notes', { mode: 'json' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => [
    index('idx_payments_order_id').on(table.orderId),
    index('idx_payments_user_id').on(table.userId),
    index('idx_payments_status').on(table.status),
    index('idx_payments_payment_id').on(table.paymentId),
]);

// Verification Tokens Table (for set password / email verification)
export const verificationTokens = sqliteTable('verification_tokens', {
    identifier: text('identifier').notNull(), // email or userId
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => [
    index('idx_verification_tokens_identifier').on(table.identifier),
    index('idx_verification_tokens_token').on(table.token),
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 PRICING CONFIG TABLE — Dynamic pricing, admin se change karo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Single row table (key-value style) — stores current pricing.
// Admin updates → cache busts → pricing page shows new prices.
// No deploy needed to change prices!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const pricingConfig = sqliteTable('pricing_config', {
  id: text('id').primaryKey().default('default'), // Single row — always 'default'
  // Lite plan pricing
  litePrice: integer('lite_price').default(99),           // Current price ₹99
  liteOriginalPrice: integer('lite_original_price').default(299), // Strikethrough ₹299
  liteValidityText: text('lite_validity_text').default('Valid till MPPSC 2026 Prelims'),
  liteMonths: integer('lite_months').default(8),          // Shown as "~8 months"
  // Pro plan pricing
  proPrice: integer('pro_price').default(299),            // Current price ₹299
  proOriginalPrice: integer('pro_original_price').default(999), // Strikethrough ₹999
  proValidityText: text('pro_validity_text').default('Valid till MPPSC 2026 Mains'),
  proMonths: integer('pro_months').default(12),           // Shown as "~12 months"
  // Upgrade pricing
  upgradePrice: integer('upgrade_price').default(199),    // Lite→Pro difference
  upgradeOriginalPrice: integer('upgrade_original_price').default(299),
  // Urgency text
  urgencyText: text('urgency_text').default('Special pricing for first 100 students'),
  urgencyTextHi: text('urgency_text_hi').default('पहले 100 छात्रों के लिए विशेष मूल्य'),
  // Dynamic student count for FOMO
  studentsBought: integer('students_bought').default(23),
  // Last updated
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});
