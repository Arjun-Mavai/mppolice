# 🔍 PRODUCTION-READY CODE REVIEW & INFRASTRUCTURE AUDIT

> **Principal Software Engineer Perspective (20+ Years Experience)**
>
> **Mission**: Ensure application handles 10-1000+ concurrent users with buttery-smooth performance on Vercel Free + Turso Free tier.

---

## 📋 Executive Summary

### Current Setup

- **Framework**: Next.js 16 (App Router)
- **Database**: Turso (LibSQL/SQLite) - Free Tier
- **Hosting**: Vercel - Free Tier
- **Codebase Size**: ~20,582 lines
- **Dependencies**: 30+ packages

### Critical Findings (By Severity)

🔴 **CRITICAL (Must Fix Before Launch)** - 8 Issues
🟡 **HIGH (Fix Within Week 1)** - 12 Issues  
🟢 **MEDIUM (Optimize Post-Launch)** - 15 Issues
🔵 **LOW (Nice to Have)** - 8 Issues

---

## 🔴 CRITICAL ISSUES (Must Fix Before Launch)

### 1. ⚠️ N+1 Query Problem in Analytics

**File**: `src/actions/analytics-actions.ts` (Lines 76-87)

**Problem**:

```typescript
// Current Code (BAD - N+1 Query)
const attemptIds = attempts.map(a => a.id);
if (attemptIds.length > 0) {
    const recentAttemptIds = attemptIds.slice(0, 50);

    // This uses SQL IN clause which can be inefficient
    const answersData = await db.select({...})
        .from(attemptAnswers)
        .leftJoin(questions, eq(attemptAnswers.questionId, questions.id))
        .where(sql`${attemptAnswers.attemptId} IN ${recentAttemptIds}`);
}
```

**Impact**:

- 1000 users × 50 attempts = 50,000 rows scanned
- Database timeout risk on Turso free tier
- Slow dashboard load (3-5 seconds)

**Solution**:

```typescript
// OPTIMIZED VERSION
const answersData = await db
  .select({
    isCorrect: attemptAnswers.isCorrect,
    marks: questions.marks,
    subject: questions.subject,
    attemptId: attemptAnswers.attemptId,
  })
  .from(attemptAnswers)
  .leftJoin(questions, eq(attemptAnswers.questionId, questions.id))
  .where(
    and(
      eq(attemptAnswers.userId, userId), // Use userId directly
      gte(attemptAnswers.createdAt, sql`datetime('now', '-30 days')`), // Last 30 days only
    ),
  )
  .limit(500); // Hard limit
```

**AI Prompt to Fix**:

```
Optimize the analytics query in src/actions/analytics-actions.ts to:
1. Add userId index to attempt_answers table
2. Use date-based filtering instead of IN clause
3. Implement pagination for large datasets
4. Add database indexes: CREATE INDEX idx_attempt_answers_user_date ON attempt_answers(userId, createdAt)
5. Cache aggregated subject stats separately
```

**Priority**: 🔴 CRITICAL - Fix within 24 hours

---

### 2. ⚠️ Missing Database Indexes

**File**: `src/db/schema.ts`

**Problem**:

- No indexes on foreign keys
- No composite indexes for common queries
- Full table scans on every query

**Current Schema** (Missing indexes):

```typescript
export const userAttempts = sqliteTable("user_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => mppscUsers.id)
    .notNull(),
  testId: text("test_id")
    .references(() => tests.id)
    .notNull(),
  // ... no indexes defined
});
```

**Impact**:

- 1000 users with 10 attempts each = 10,000 rows
- Query time: ~2-5 seconds (will grow exponentially)
- Database locks on Turso free tier

**Solution**:

```typescript
// Add indexes
export const userAttempts = sqliteTable(
  "user_attempts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => mppscUsers.id)
      .notNull(),
    testId: text("test_id")
      .references(() => tests.id)
      .notNull(),
    startTime: integer("start_time", { mode: "timestamp" }).notNull(),
    endTime: integer("end_time", { mode: "timestamp" }),
    score: real("score"),
    isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    testIdIdx: index("test_id_idx").on(table.testId),
    userTestIdx: index("user_test_idx").on(table.userId, table.testId),
    completedIdx: index("completed_idx").on(table.isCompleted, table.endTime),
  }),
);
```

**Migration Script**:

```sql
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_attempts_user ON user_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_test ON user_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_user_test ON user_attempts(user_id, test_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_completed ON user_attempts(is_completed, end_time);

CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_question ON attempt_answers(question_id);

CREATE INDEX IF NOT EXISTS idx_questions_test ON questions(test_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);

CREATE INDEX IF NOT EXISTS idx_tests_type ON tests(type);
CREATE INDEX IF NOT EXISTS idx_tests_unit ON tests(unit_id);
CREATE INDEX IF NOT EXISTS idx_tests_topic ON tests(topic_id);

CREATE INDEX IF NOT EXISTS idx_syllabus_topics_unit ON syllabus_topics(unit_id, "order");
```

**AI Prompt to Fix**:

```
Add comprehensive database indexes to the Drizzle schema in src/db/schema.ts:
1. Add indexes on all foreign keys (userId, testId, questionId, attemptId)
2. Add composite indexes for common query patterns (userId + testId, userId + createdAt)
3. Add indexes on filter columns (type, isCompleted, subject)
4. Generate Drizzle migration for indexes
5. Ensure indexes work with SQLite/Turso
6. Add EXPLAIN QUERY PLAN analysis for top 5 queries
```

**Priority**: 🔴 CRITICAL - Fix before launch

---

### 3. ⚠️ Cache Stampede Risk

**File**: `src/actions/analytics-actions.ts` (Line 20)

**Problem**:

```typescript
// Current: 1 second cache
{ revalidate: 1, tags: [`analytics-${userId}`] }
```

**Scenario**:

- User submits test → Cache expires
- 100 concurrent dashboard requests
- All 100 hit DB simultaneously
- Database crashes or times out

**Impact**:

- Turso free tier: 500 concurrent connections limit
- Potential 503 errors during peak hours
- Poor user experience

**Solution - Stale-While-Revalidate**:

```typescript
export const getUserAnalytics = async (userId: string) => {
    if (!userId) return null;

    const getCachedAnalytics = unstable_cache(
        async (uid: string) => {
            return await fetchAnalyticsInternal(uid);
        },
        [`user-analytics-${userId}`],
        {
            revalidate: 300, // 5 minutes (not 1 second!)
            tags: [`analytics-${userId}`]
        }
    );

    return await getCachedAnalytics(userId);
}

// Add manual revalidation AFTER test submission
export async function submitTestAttempt(...) {
    // ... save to DB ...

    // Revalidate cache in background (non-blocking)
    revalidateTag(`analytics-${userId}`);

    return result;
}
```

**AI Prompt to Fix**:

```
Implement cache stampede protection:
1. Increase cache TTL from 1 second to 5 minutes in getUserAnalytics
2. Add background cache warming for active users
3. Implement request coalescing (dedupe concurrent requests)
4. Add cache locking mechanism using Redis or Upstash
5. Trigger manual revalidation after test submission only
6. Add cache hit/miss monitoring
```

**Priority**: 🔴 CRITICAL - Fix before launch

---

### 4. ⚠️ Memory Leak in Quiz Timer

**File**: `src/hooks/useQuizLogic.ts` (Lines 183-198)

**Problem**:

```typescript
// Current Code (Memory Leak)
useEffect(() => {
  if (isSubmitted) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer); // ❌ Wrong - timer already cleared
        handleSubmit();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer); // Cleanup
}, [isSubmitted, handleSubmit]); // ❌ handleSubmit changes every render
```

**Impact**:

- Timer keeps running even after unmount
- Multiple timers created on re-renders
- Memory leaks on long quiz sessions
- Battery drain on mobile devices

**Solution**:

```typescript
// FIXED VERSION
useEffect(() => {
  if (isSubmitted) return;

  const timerRef = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        // Don't call clearInterval here
        handleSubmit();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timerRef);
}, [isSubmitted]); // Only depend on isSubmitted

// Move handleSubmit outside or use useCallback with stable deps
const handleSubmit = useCallback(async () => {
  // ... submit logic ...
}, []); // No dependencies or only stable ones
```

**AI Prompt to Fix**:

```
Fix memory leak in quiz timer hook (src/hooks/useQuizLogic.ts):
1. Remove handleSubmit from useEffect dependencies
2. Use useRef for timer instead of setInterval return value
3. Ensure cleanup runs properly on unmount
4. Add timer pause/resume functionality
5. Implement visibility API to pause timer when tab inactive
6. Add performance monitoring for timer accuracy
```

**Priority**: 🔴 CRITICAL - Fix before launch

---

### 5. ⚠️ 75KB Static Data Bundle

**File**: `src/data/syllabusData.ts` (75KB)

**Problem**:

```typescript
// Entire 75KB loaded in every page
export const syllabusData = {
  units: {
    unit_1: {
      /* huge object */
    },
    unit_2: {
      /* huge object */
    },
    // ... 10 units of data
  },
};
```

**Impact**:

- Increases bundle size by 75KB
- Loaded even on pages that don't need it
- Slow initial page load
- Wasted bandwidth

**Solution - Code Splitting**:

```typescript
// src/data/syllabus/index.ts
export async function getSyllabusUnit(unitId: string) {
  const module = await import(`./units/${unitId}.json`);
  return module.default;
}

// Split into files:
// src/data/syllabus/units/unit_1.json
// src/data/syllabus/units/unit_2.json
// ... etc
```

**Better Solution - Move to Database**:

```typescript
// Already have syllabus_topics table!
// Remove syllabusData.ts entirely
// Fetch from DB with caching

export const getSyllabusUnit = unstable_cache(
  async (unitId: string) => {
    return await db
      .select()
      .from(syllabusTopics)
      .where(eq(syllabusTopics.unitId, unitId));
  },
  ["syllabus-unit"],
  { revalidate: 3600 }, // 1 hour cache
);
```

**AI Prompt to Fix**:

```
Migrate syllabusData.ts to database or code-split it:
Option 1 - Database Migration:
1. Move all data from syllabusData.ts to syllabus_topics table
2. Update all imports to use getSyllabusTopics() from actions
3. Remove syllabusData.ts file
4. Add aggressive caching (1 hour TTL)

Option 2 - Code Splitting:
1. Split syllabusData.ts into 10 JSON files (one per unit)
2. Use dynamic imports
3. Implement lazy loading
4. Add preloading for next unit

Recommend Option 1 for consistency with existing architecture.
```

**Priority**: 🔴 CRITICAL - Reduces bundle by 75KB

---

### 6. ⚠️ Unvalidated User Input in Queries

**File**: `src/actions/test-actions.ts`

**Problem**:

```typescript
// Potential SQL injection (though Drizzle protects, still risky pattern)
export async function getTestWithQuestions(testId: string) {
  // No input validation!
  const test = await db.query.tests.findFirst({
    where: eq(tests.id, testId),
    // ...
  });
}
```

**Impact**:

- Potential injection if Drizzle has bugs
- No protection against malformed UUIDs
- Error messages leak schema info

**Solution**:

```typescript
import { z } from "zod";

const testIdSchema = z.string().uuid();

export async function getTestWithQuestions(testId: string) {
  // Validate input
  const validatedId = testIdSchema.parse(testId);

  try {
    const test = await db.query.tests.findFirst({
      where: eq(tests.id, validatedId),
      with: { questions: { orderBy: asc(questions.order) } },
    });

    if (!test) {
      throw new Error("Test not found");
    }

    return test;
  } catch (error) {
    console.error("Error fetching test:", error);
    // Don't leak schema details
    throw new Error("Failed to load test");
  }
}
```

**AI Prompt to Fix**:

```
Add input validation to all server actions:
1. Install and configure Zod schemas for all inputs
2. Validate testId, userId, questionId (UUID format)
3. Validate pagination params (numbers, ranges)
4. Sanitize search queries
5. Add rate limiting per user
6. Implement error handling that doesn't leak schema info
7. Add request logging for security audit
```

**Priority**: 🔴 CRITICAL - Security issue

---

### 7. ⚠️ No Error Boundaries

**Problem**: App crashes completely on any error

**Impact**:

- White screen of death
- User loses quiz progress
- No error tracking

**Solution**:

```typescript
// src/app/error.tsx
'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to error tracking service
        console.error('App Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    Oops! Something went wrong
                </h2>
                <p className="text-slate-600 mb-6">
                    {error.message || 'An unexpected error occurred'}
                </p>
                <button
                    onClick={reset}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}

// Add to quiz page: src/app/syllabus/quiz/play/error.tsx
export default function QuizError({ error, reset }: { error: Error, reset: () => void }) {
    return (
        <div>
            <h2>Quiz Error - Your progress is saved!</h2>
            <button onClick={reset}>Resume Quiz</button>
        </div>
    );
}
```

**AI Prompt to Fix**:

```
Implement error boundaries throughout the app:
1. Add global error.tsx in src/app/
2. Add specific error.tsx for quiz, dashboard, analytics
3. Implement error recovery strategies (save quiz state)
4. Add error tracking (Sentry or similar)
5. Create user-friendly error messages
6. Preserve user progress on errors
7. Add fallback UI components
```

**Priority**: 🔴 CRITICAL - User experience

---

### 8. ⚠️ Production Console Logs

**Problem**: 181 console.log statements in production

**File**: Multiple files (found 181 instances)

**Impact**:

- Performance overhead
- Security risk (data leakage)
- Cluttered browser console

**Solution**:

```typescript
// src/lib/logger.ts
const isDev = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: any[]) => isDev && console.log(...args),
  error: (...args: any[]) => console.error(...args), // Always log errors
  warn: (...args: any[]) => isDev && console.warn(...args),
  debug: (...args: any[]) => isDev && console.debug(...args),
};

// Replace all console.log with logger.log
import { logger } from "@/lib/logger";
logger.log("Debug info"); // Only in development
```

**AI Prompt to Fix**:

```
Remove production console logs:
1. Create logger utility with environment checks
2. Replace all console.log with logger.log
3. Keep console.error for critical errors
4. Add structured logging (JSON format)
5. Integrate with logging service (Datadog, LogRocket)
6. Add ESLint rule to prevent future console.log
7. Create development-only debug panel
```

**Priority**: 🔴 CRITICAL - Security & Performance

---

## 🟡 HIGH PRIORITY ISSUES (Fix Week 1)

### 9. Missing Request Deduplication

**Problem**: Same data fetched multiple times in single render

**Example**:

```typescript
// DashboardPage
const analytics = await getUserAnalytics(user.id);
const syllabusProgress = await getUserSyllabusProgress();

// Both might fetch from same tables
```

**Solution**: Use React cache() wrapper

---

### 10. No Rate Limiting on Auth Endpoints

**File**: `src/app/api/auth/mppsc-login/route.ts`

**Problem**: Vulnerable to brute force attacks

**Solution**:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  // ... login logic
}
```

---

### 11. Inefficient Image Loading

**Problem**: No next/image usage, large images

**Solution**: Use Next.js Image component with optimization

---

### 12. No Lazy Loading for Routes

**Problem**: All routes loaded upfront

**Solution**: Implement route-based code splitting

---
