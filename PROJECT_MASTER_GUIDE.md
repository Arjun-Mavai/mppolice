# 🎓 MINDFUL MPPSC - Complete Project Master Guide

> **30 Years Experience Perspective**: Yeh documentation tumhe project ka har atom samjhayega - from database to UI, routing to caching, state management to test types. Isse tumhe complete control milega apne codebase par.

---

## 📋 Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Database Schema & Relationships](#2-database-schema--relationships)
3. [Folder Structure Deep Dive](#3-folder-structure-deep-dive)
4. [Routing System](#4-routing-system)
5. [Test Types Management](#5-test-types-management)
6. [Data Flow & Caching Strategy](#6-data-flow--caching-strategy)
7. [State Management](#7-state-management)
8. [Critical Functions & Hooks](#8-critical-functions--hooks)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [UI Component Architecture](#10-ui-component-architecture)

---

## 1. Project Overview & Architecture

### 🏗️ Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     TECH STACK PYRAMID                       │
├─────────────────────────────────────────────────────────────┤
│  Framework:    Next.js 14 (App Router)                      │
│  Language:     TypeScript                                    │
│  Database:     Turso (LibSQL) - Remote SQLite              │
│  ORM:          Drizzle ORM                                   │
│  Auth:         Cookie-based (Custom)                         │
│  State:        Zustand (Client State)                        │
│  UI:           Tailwind + shadcn/ui + Framer Motion        │
│  Deployment:   Vercel (assumed)                             │
└─────────────────────────────────────────────────────────────┘
```

### 🎯 Core Application Purpose

**MPPSC (Madhya Pradesh Public Service Commission) Exam Preparation Platform**

```
┌────────────────────────────────────────────────────────────┐
│                   APPLICATION FEATURES                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📚 SYLLABUS LEARNING                                      │
│   └─ 10 Units with Topics                                 │
│   └─ Flashcards (Front/Back)                              │
│   └─ Dual Language (Hindi/English)                        │
│                                                             │
│  ✅ TEST SERIES (5 Types)                                 │
│   ├─ TOPIC Tests (Quick 10Q checks)                       │
│   ├─ UNIT Tests (Full unit coverage)                      │
│   ├─ FLT (Full Length Tests)                              │
│   ├─ CSAT (Aptitude Tests)                                │
│   └─ PYQ (Previous Year Questions)                        │
│                                                             │
│  📊 ANALYTICS & PROGRESS                                   │
│   └─ Test History                                          │
│   └─ Subject-wise Mastery                                 │
│   └─ AI-powered Suggestions                               │
│                                                             │
│  💳 SUBSCRIPTION TIERS                                     │
│   ├─ FREE (Limited access)                                │
│   ├─ LITE (Mid-tier)                                      │
│   └─ PRO (Full access)                                    │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema & Relationships

### 🗄️ Complete Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  mppsc_users     │
├──────────────────┤
│ id (PK) 🔑       │ ← User UUID
│ email            │
│ password         │ ← Hashed (bcryptjs)
│ name             │
│ isSubscribed     │ ← Boolean
│ planTier         │ ← 'free' | 'lite' | 'pro'
│ role             │ ← 'guest' | 'admin'
│ adminSecret      │ ← For admin operations
│ createdAt        │
└────────┬─────────┘
         │
         │ 1:N (One user → Many attempts)
         │
         ▼
┌──────────────────┐          ┌──────────────────┐
│  user_attempts   │──────────│     tests        │
├──────────────────┤   N:1    ├──────────────────┤
│ id (PK) 🔑       │          │ id (PK) 🔑       │
│ userId (FK) 🔗   │          │ title            │
│ testId (FK) 🔗───┼─────────→│ slug             │
│ startTime        │          │ type  🚨         │ ← 'FLT'|'UNIT'|'TOPIC'|'CSAT'|'PYQ'
│ endTime          │          │ unitId           │ ← Links to syllabus unit
│ score            │          │ topicId          │ ← Links to syllabus topic
│ isCompleted      │          │ totalQuestions   │
└────────┬─────────┘          │ totalMarks       │
         │                    │ durationMinutes  │
         │                    │ isPro            │ ← Pro content lock
         │                    │ maxRetries       │ ← Attempt limit
         │                    │ displayOrder     │
         │                    └────────┬─────────┘
         │                             │
         │ 1:N                         │ 1:N
         │                             │
         ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│ attempt_answers  │          │    questions     │
├──────────────────┤          ├──────────────────┤
│ id (PK) 🔑       │          │ id (PK) 🔑       │
│ attemptId (FK)🔗─┤          │ testId (FK) 🔗   │
│ questionId(FK)🔗─┼─────────→│ questionText     │ ← Hindi
│ userAnswer       │          │ questionTextEn   │ ← English
│ isCorrect        │          │ options (JSON)   │ ← Array of options
│ timeTakenSeconds │          │ correctAnswer    │
└──────────────────┘          │ explanation      │
                              │ explanationEn    │
                              │ marks            │
                              │ negativeMarks    │
                              │ idealTime        │
                              │ subject  🎯      │ ← For mastery tracking
                              │ type             │ ← 'standard'|'matching'
                              │ order            │
                              └──────────────────┘

┌─────────────────────┐
│  syllabus_topics    │ ← Stores actual topic content
├─────────────────────┤
│ id (PK) 🔑          │
│ unitId              │ ← 'unit_1', 'unit_2'...
│ title               │ ← Hindi title
│ titleEn             │ ← English title
│ content (JSON)      │ ← Front/Back flashcard content
│ contentEn (JSON)    │
│ aiContent (JSON)    │ ← AI-enriched content
│ order               │
│ isFree              │
│ imgUrl              │
│ createdAt           │
└─────────────────────┘

┌─────────────────────┐
│  topic_revisions    │ ← User progress tracking
├─────────────────────┤
│ id (PK) 🔑          │
│ userId (FK) 🔗      │
│ topicId             │
│ unitId              │
│ revisionCount       │
│ lastRevisedAt       │
└─────────────────────┘

┌─────────────────────┐
│  content_blogs      │ ← Blog/Study materials
├─────────────────────┤
│ id (PK) 🔑          │
│ slug                │
│ title               │
│ content (JSON)      │
│ category            │
│ contentType         │ ← 'blog' | 'vlog'
│ isPublished         │
└─────────────────────┘
```

### 🔑 Key Field Meanings

| Field | Purpose | Example Value |
|-------|---------|---------------|
| **tests.type** 🚨 | Determines test category | 'TOPIC', 'UNIT', 'FLT', 'CSAT', 'PYQ' |
| **tests.unitId** | Links test to syllabus unit | 'unit_1', 'unit_5' |
| **tests.topicId** | Links test to specific topic | UUID of topic from syllabus_topics |
| **questions.subject** 🎯 | For analytics mastery breakdown | 'Indian Polity', 'History' |
| **userAttempts.score** | Calculated score (can be negative) | 35.5, -2.0 |
| **attemptAnswers.timeTakenSeconds** | Per-question time tracking | 45, 120 |

---


## 3. Folder Structure Deep Dive

### 📁 Complete Project Structure

```
/Users/arjun/Documents/syllabus/
├── src/
│   ├── app/                          🚨 NEXT.JS APP ROUTER (CRITICAL)
│   │   ├── layout.tsx                   ← Root layout (fonts, metadata, providers)
│   │   ├── page.tsx                     ← Homepage (/)
│   │   │
│   │   ├── login/                       ← Authentication
│   │   │   └── page.tsx
│   │   │
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   │
│   │   ├── dashboard/                   🔥 USER DASHBOARD
│   │   │   ├── page.tsx                 ← Main dashboard (http://localhost:3000/dashboard)
│   │   │   ├── layout.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   ├── syllabus/                    🎓 MAIN APP SECTION
│   │   │   ├── page.tsx                 ← Syllabus home (/syllabus)
│   │   │   ├── layout.tsx
│   │   │   │
│   │   │   ├── [unitId]/                ← Dynamic route for units
│   │   │   │   ├── page.tsx             ← /syllabus/unit_1
│   │   │   │   └── UnitContent.tsx      ← Client component for flashcards
│   │   │   │
│   │   │   ├── quiz/                    🎯 TEST SYSTEM (SUPER CRITICAL)
│   │   │   │   ├── page.tsx             ← Quiz selection hub
│   │   │   │   │
│   │   │   │   ├── topic/               📌 TOPIC TESTS
│   │   │   │   │   ├── page.tsx         ← Topic selection (Unit → Topics)
│   │   │   │   │   └── loading.tsx
│   │   │   │   │
│   │   │   │   ├── units/               📌 UNIT TESTS
│   │   │   │   │   ├── page.tsx         ← Unit selection
│   │   │   │   │   └── QuizUnitSelectionClient.tsx
│   │   │   │   │
│   │   │   │   ├── full-length/         📌 FLT TESTS
│   │   │   │   │   ├── page.tsx         ← Server component (fetches tests)
│   │   │   │   │   └── FLTPageClient.tsx← Client UI
│   │   │   │   │
│   │   │   │   ├── csat/                📌 CSAT TESTS
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── CSATPageClient.tsx
│   │   │   │   │
│   │   │   │   ├── pyq/                 📌 PYQ TESTS
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── PYQPageClient.tsx
│   │   │   │   │
│   │   │   │   └── play/                🎮 QUIZ PLAY ENGINE (CRITICAL)
│   │   │   │       ├── page.tsx         ← Universal test player
│   │   │   │       └── QuizPlayClient.tsx ← Quiz UI + Logic
│   │   │   │
│   │   │   └── analytics/               📊 PERFORMANCE TRACKING
│   │   │       ├── page.tsx
│   │   │       ├── AnalyticsDashboardClient.tsx  ← Recent History UI
│   │   │       └── history/
│   │   │           └── [id]/
│   │   │               └── page.tsx     ← Detailed attempt review
│   │   │
│   │   ├── tests/                       🧪 LEGACY/ALTERNATE TEST ROUTES
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       └── analysis/
│   │   │
│   │   ├── admin/                       🔐 ADMIN PANEL
│   │   │   ├── layout.tsx               ← Admin auth check
│   │   │   ├── dashboard/
│   │   │   ├── upload/                  ← Bulk question upload
│   │   │   ├── upload-syllabus/
│   │   │   └── upload-topic-tests/
│   │   │
│   │   ├── api/                         🔌 API ROUTES (SERVER ENDPOINTS)
│   │   │   ├── auth/
│   │   │   │   ├── mppsc-login/route.ts
│   │   │   │   ├── mppsc-signup/route.ts
│   │   │   │   ├── mppsc-logout/route.ts
│   │   │   │   └── me/route.ts
│   │   │   │
│   │   │   ├── tests/
│   │   │   │   ├── pyq/route.ts         ← API endpoint for PYQ tests
│   │   │   │   ├── csat/route.ts
│   │   │   │   └── flt/route.ts
│   │   │   │
│   │   │   ├── payment/
│   │   │   │   ├── checkout/route.ts
│   │   │   │   └── exit-survey/route.ts
│   │   │   │
│   │   │   └── revalidate/route.ts      ← Cache invalidation endpoint
│   │   │
│   │   ├── payment/
│   │   ├── upgrade/
│   │   ├── blogs/
│   │   └── contact/
│   │
│   ├── actions/                         🎬 SERVER ACTIONS (DATA FETCHING)
│   │   ├── analytics-actions.ts         🔥 getUserAnalytics(), getAttemptDetails()
│   │   ├── test-actions.ts              🔥 submitTestAttempt(), getCached*Tests()
│   │   ├── getSyllabusTopics.ts         🔥 Fetches topics from DB
│   │   ├── quiz-actions.ts
│   │   ├── admin-actions.ts
│   │   ├── blog-actions.ts
│   │   ├── syllabus.ts
│   │   └── uploadTopicTests.ts
│   │
│   ├── components/                      🧩 REUSABLE UI COMPONENTS
│   │   ├── ui/                          ← shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   └── ... (30+ components)
│   │   │
│   │   ├── layout/
│   │   │   └── AppFooter.tsx
│   │   │
│   │   ├── quiz/                        ← Quiz-specific components
│   │   ├── analytics/
│   │   │   └── SyllabusProgressWidget.tsx
│   │   │
│   │   ├── TopMenu.tsx                  ← Main navigation
│   │   ├── SideDrawer.tsx
│   │   └── SyllabusLockModal.tsx        ← Paywall modal
│   │
│   ├── hooks/                           🪝 CUSTOM REACT HOOKS
│   │   ├── useQuizLogic.ts              🔥 CRITICAL - Quiz state management
│   │   ├── useAppStore.ts
│   │   ├── usePwa.ts
│   │   └── use-debounce.ts
│   │
│   ├── lib/                             🛠️ UTILITY FUNCTIONS
│   │   ├── auth.ts                      🔥 verifyAuth() - Auth helper
│   │   ├── auth-admin.ts
│   │   ├── quiz-scoring.ts              🔥 Scoring constants
│   │   ├── utils.ts                     ← cn() for classnames
│   │   ├── rate-limit.ts
│   │   └── syllabus-locks.ts            ← Topic lock logic
│   │
│   ├── store/                           ��️ GLOBAL STATE (ZUSTAND)
│   │   └── useSettingsStore.ts          🔥 language, user, isSubscribed
│   │
│   ├── data/                            📦 STATIC DATA & CONFIGS
│   │   ├── syllabusData.ts              🔥 Unit metadata (titles, structure)
│   │   ├── tests.ts                     ← Static test configs
│   │   ├── quotes.ts
│   │   └── mppsc_prompts.md             ← AI prompts for content gen
│   │
│   ├── db/                              💾 DATABASE
│   │   ├── index.ts                     ← Drizzle client initialization
│   │   ├── schema.ts                    🔥 FULL DATABASE SCHEMA
│   │   └── schema.sql
│   │
│   ├── types/                           📝 TYPESCRIPT TYPES
│   │   └── quiz.ts
│   │
│   └── config/                          ⚙️ APP CONFIGS
│       └── plans.ts                     🔥 PLAN_LIMITS (free/lite/pro)
│
├── migrations/                          🗄️ Database migrations
├── scripts/                             🔧 Utility scripts
├── public/                              🖼️ Static assets
│
├── package.json                         📦 Dependencies
├── next.config.ts                       ⚙️ Next.js config
├── drizzle.config.ts                    ⚙️ Drizzle ORM config
└── tsconfig.json                        ⚙️ TypeScript config
```

### 🔥 Critical Files (Red Alert)

| File Path | Purpose | Why Critical |
|-----------|---------|-------------|
| **src/db/schema.ts** | Complete DB schema | All table definitions, single source of truth |
| **src/lib/auth.ts** | `verifyAuth()` function | Used everywhere for auth checks |
| **src/hooks/useQuizLogic.ts** | Quiz state + timer logic | Powers ALL test types |
| **src/actions/analytics-actions.ts** | User analytics & test history | Dashboard ka backbone |
| **src/actions/test-actions.ts** | Test CRUD + submission | Test lifecycle management |
| **src/store/useSettingsStore.ts** | Global state (language, user) | Accessed in 50+ components |
| **src/app/syllabus/quiz/play/QuizPlayClient.tsx** | Universal quiz player | Single player for all test types |
| **src/config/plans.ts** | Free/Lite/Pro limits | Controls content access |

---

## 4. Routing System

### 🛣️ Complete Route Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ROUTE ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────┘

PUBLIC ROUTES (No Auth Required):
──────────────────────────────────
/                           → Landing page (Marketing)
/login                      → Login form
/signup                     → Signup form
/blogs                      → Blog listing
/blogs/[slug]              → Individual blog post
/contact                    → Support contact form

PROTECTED ROUTES (Auth Required):
──────────────────────────────────
/dashboard                  → User dashboard
                               ├─ getUserAnalytics(user.id)
                               ├─ Shows: Recent Test History, Stats, AI Suggestions
                               └─ Renders: AnalyticsDashboardClient

/syllabus                   → Syllabus home (Unit grid)
/syllabus/[unitId]         → Individual unit flashcards
                               └─ Example: /syllabus/unit_1

/syllabus/quiz              → Quiz type selection hub
                               ├─ Topic Tests
                               ├─ Unit Tests
                               ├─ Full Length Tests (FLT)
                               ├─ CSAT Tests
                               └─ PYQ Tests

TEST SELECTION ROUTES:
──────────────────────────────────
/syllabus/quiz/topic        → Topic selection page
                               ├─ Server: getSyllabusTopics()
                               ├─ UI: Unit → Topics hierarchy
                               └─ Click → /syllabus/quiz/play?testId=xxx

/syllabus/quiz/units        → Unit test selection
                               └─ Click → /syllabus/quiz/play?testId=xxx

/syllabus/quiz/full-length  → FLT test listing
                               ├─ Server: getCachedFLTTests()
                               └─ Client: FLTPageClient.tsx

/syllabus/quiz/csat         → CSAT test listing
                               ├─ Server: getCachedCSATTests()
                               └─ Client: CSATPageClient.tsx

/syllabus/quiz/pyq          → PYQ test listing
                               ├─ Server: getCachedPYQTests()
                               └─ Client: PYQPageClient.tsx

TEST PLAY ROUTE (UNIVERSAL):
──────────────────────────────────
🎮 /syllabus/quiz/play
   Query Params: ?testId=xxx&mode=topic
   
   Flow:
   1. Server component (page.tsx):
      ├─ Fetch: getTestWithQuestions(testId)
      ├─ Auth: verifyAuth()
      └─ Pass data → QuizPlayClient
   
   2. Client component (QuizPlayClient.tsx):
      ├─ Hook: useQuizLogic()
      ├─ Renders: Questions, Timer, Options
      └─ On Submit: submitTestAttempt()

ANALYTICS ROUTES:
──────────────────────────────────
/syllabus/analytics         → Full analytics page (same as dashboard)
/syllabus/analytics/history/[id]  → Detailed attempt review
                                     ├─ getAttemptDetails(attemptId)
                                     └─ Shows: All Q&A, time taken, explanations

ADMIN ROUTES (Admin Role Required):
──────────────────────────────────
/admin/dashboard            → Admin overview
/admin/upload               → Bulk question upload
/admin/upload-syllabus      → Syllabus content upload
/admin/upload-topic-tests   → Topic test creation

PAYMENT ROUTES:
──────────────────────────────────
/upgrade                    → Subscription plans page
/payment                    → Payment form (LemonSqueezy)
/payment/success           → Payment success callback

API ROUTES (Backend Endpoints):
──────────────────────────────────
POST /api/auth/mppsc-login     → Login user, set cookie
POST /api/auth/mppsc-signup    → Create user account
POST /api/auth/mppsc-logout    → Clear auth cookie
GET  /api/auth/me              → Get current user data

GET  /api/tests/pyq            → Fetch PYQ tests (alternative API approach)
GET  /api/tests/csat           → Fetch CSAT tests
GET  /api/tests/flt            → Fetch FLT tests

POST /api/revalidate           → Manually invalidate cache
POST /api/payment/checkout     → Create payment session
POST /api/webhooks/dodo        → Payment webhook handler
```

### 🔀 Navigation Flow Examples

#### **User Journey 1: Taking a Topic Test**
```
1. User opens: /dashboard
   └─ Clicks "Take New Test" → /syllabus/quiz

2. /syllabus/quiz
   └─ Clicks "Topic Quick Check" → /syllabus/quiz/topic

3. /syllabus/quiz/topic
   ├─ Server fetches: getSyllabusTopics()
   ├─ User sees: Unit 1-10 cards
   └─ Clicks "Unit 1" → Shows topics list

4. User clicks "संविधान का परिचय"
   └─ Redirects to: /syllabus/quiz/play?testId=abc123&mode=topic

5. /syllabus/quiz/play
   ├─ Server fetches test questions
   ├─ Client shows quiz interface
   ├─ User answers questions
   └─ Clicks "Submit" → submitTestAttempt()

6. After submission:
   ├─ Shows results modal
   └─ Click "View Details" → /syllabus/analytics/history/[attemptId]

7. /syllabus/analytics/history/[attemptId]
   └─ Shows: Question-by-question breakdown, time taken, explanations
```

#### **User Journey 2: Viewing Test History**
```
1. /dashboard
   └─ getUserAnalytics(userId) executed on server
   
2. Recent Test History card populated with:
   ├─ Unique tests (deduplicated)
   ├─ Latest attempt of each test
   └─ Grouped by unit (for Topic tests)

3. User clicks on a test → /syllabus/analytics/history/[attemptId]
```

---


## 5. Test Types Management

### 🎯 The 5 Test Types - Complete Breakdown

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      TEST TYPE ARCHITECTURE                               │
└──────────────────────────────────────────────────────────────────────────┘

1️⃣ TOPIC TESTS
──────────────
Database: tests table WHERE type = 'TOPIC'
Purpose:  Quick 10-question checks on specific syllabus topics
Link:     tests.topicId → syllabusTopics.id
Route:    /syllabus/quiz/topic → /syllabus/quiz/play?testId=xxx

Flow:
┌─────────────────────────────────────────────────────────────┐
│ 1. User opens /syllabus/quiz/topic                         │
│    ├─ Server: getSyllabusTopics()                          │
│    └─ Returns: { unit_1: [topics...], unit_2: [...], ... }│
│                                                              │
│ 2. UI shows Unit cards (Unit 1, Unit 2...)                 │
│    └─ User clicks "Unit 1"                                 │
│                                                              │
│ 3. Topics listed under Unit 1                              │
│    ├─ संविधान का परिचय (Topic 1)                         │
│    ├─ मौलिक अधिकार (Topic 2)                              │
│    └─ Each topic has testId attached                       │
│                                                              │
│ 4. User clicks topic                                        │
│    └─ Redirect: /syllabus/quiz/play?testId=topic_test_123 │
│                                                              │
│ 5. Quiz loads with 10 questions specific to that topic     │
└─────────────────────────────────────────────────────────────┘

Data Structure:
tests table entry:
{
  id: "test_topic_samvidhan_1",
  title: "Topic Quiz",  // Generic, replaced in UI
  type: "TOPIC",
  unitId: "unit_1",
  topicId: "uuid-of-topic",  // 🔑 Key link
  totalQuestions: 10,
  totalMarks: 20,
  durationMinutes: 10
}

syllabusTopics table entry:
{
  id: "uuid-of-topic",  // Matches topicId above
  unitId: "unit_1",
  title: "संविधान का परिचय",
  titleEn: "Introduction to Constitution",
  order: 1,
  content: { front: "...", back: "..." }
}

UI Display Resolution:
─────────────────────
analytics-actions.ts (Line 180-184):
• Fetches syllabusTopics from DB
• Maps topicId → actual topic name
• Replaces generic "Topic Quiz" with "संविधान का परिचय"


2️⃣ UNIT TESTS
──────────────
Database: tests table WHERE type = 'UNIT'
Purpose:  Comprehensive tests covering entire units (30-50 questions)
Link:     tests.unitId → 'unit_1', 'unit_2', etc.
Route:    /syllabus/quiz/units → /syllabus/quiz/play?testId=xxx

Flow:
┌─────────────────────────────────────────────────────────────┐
│ 1. User opens /syllabus/quiz/units                         │
│    └─ Shows Unit 1-10 cards                                │
│                                                              │
│ 2. User clicks "Unit 1"                                     │
│    ├─ Server: getTestByUnitId('unit_1')                    │
│    └─ Returns: Unit test with all questions                │
│                                                              │
│ 3. Redirect to: /syllabus/quiz/play?testId=unit_test_1    │
│                                                              │
│ 4. Full unit test loads (30-50 questions)                  │
└─────────────────────────────────────────────────────────────┘

Data Structure:
{
  id: "test_unit_1_full",
  title: "Unit 1: Complete Test",
  type: "UNIT",
  unitId: "unit_1",  // 🔑 Identifies which unit
  topicId: null,     // Not topic-specific
  totalQuestions: 40,
  totalMarks: 100,
  durationMinutes: 60
}


3️⃣ FULL LENGTH TESTS (FLT)
───────────────────────────
Database: tests table WHERE type = 'FLT'
Purpose:  Complete mock exams covering all 10 units
Link:     Independent (no specific unit/topic)
Route:    /syllabus/quiz/full-length → /syllabus/quiz/play?testId=xxx

Flow:
┌─────────────────────────────────────────────────────────────┐
│ 1. User opens /syllabus/quiz/full-length                   │
│    ├─ Server: getCachedFLTTests()                          │
│    └─ Returns: List of FLTs                                │
│                                                              │
│ 2. UI shows FLT cards:                                      │
│    ├─ FLT 1 - Mock Test Series 1                           │
│    ├─ FLT 2 - Mock Test Series 2                           │
│    └─ Each with: Questions count, marks, duration          │
│                                                              │
│ 3. User clicks FLT 1                                        │
│    └─ Redirect: /syllabus/quiz/play?testId=flt_1          │
│                                                              │
│ 4. Full exam simulation (100+ questions, 2-3 hours)        │
└─────────────────────────────────────────────────────────────┘

Data Structure:
{
  id: "flt_mock_1",
  title: "FLT Mock Test Series 1",
  type: "FLT",
  unitId: null,      // Covers all units
  topicId: null,
  totalQuestions: 100,
  totalMarks: 200,
  durationMinutes: 120,
  isPro: true        // Usually premium content
}

Caching:
src/actions/test-actions.ts (Line 28-37):
export const getCachedFLTTests = unstable_cache(
    async () => { ... },
    ['flt-tests-list'],
    { revalidate: 60, tags: ['tests'] }
);
• Cache: 60 seconds
• Tag: 'tests' (can be invalidated)


4️⃣ CSAT TESTS
──────────────
Database: tests table WHERE type = 'CSAT'
Purpose:  Civil Services Aptitude Test (Logical reasoning, comprehension)
Language: Usually in English (CSAT Paper-II pattern)
Route:    /syllabus/quiz/csat → /syllabus/quiz/play?testId=xxx

Flow:
┌─────────────────────────────────────────────────────────────┐
│ 1. User opens /syllabus/quiz/csat                          │
│    ├─ Server: getCachedCSATTests()                         │
│    └─ Returns: CSAT test list                              │
│                                                              │
│ 2. UI shows CSAT test cards                                │
│    ├─ CSAT Practice 1 - Reasoning                          │
│    ├─ CSAT Practice 2 - Comprehension                      │
│    └─ CSAT Practice 3 - Data Interpretation                │
│                                                              │
│ 3. User clicks CSAT Practice 1                             │
│    └─ Redirect: /syllabus/quiz/play?testId=csat_1         │
│                                                              │
│ 4. CSAT test loads (mostly English questions)              │
└─────────────────────────────────────────────────────────────┘

Data Structure:
{
  id: "csat_reasoning_1",
  title: "CSAT Practice 1 - Reasoning",
  type: "CSAT",
  unitId: null,
  topicId: null,
  totalQuestions: 80,
  totalMarks: 160,
  durationMinutes: 100
}

Special Handling:
QuizPlayClient.tsx automatically switches to English if:
• test.type === 'CSAT'
• Question has no Hindi translation


5️⃣ PREVIOUS YEAR QUESTIONS (PYQ)
──────────────────────────────────
Database: tests table WHERE type = 'PYQ'
Purpose:  Actual questions from past MPPSC exams
Organization: By year (2023, 2022, 2021...)
Route:    /syllabus/quiz/pyq → /syllabus/quiz/play?testId=xxx

Flow:
┌─────────────────────────────────────────────────────────────┐
│ 1. User opens /syllabus/quiz/pyq                           │
│    ├─ Server: getCachedPYQTests()                          │
│    └─ Returns: PYQ tests grouped by year                   │
│                                                              │
│ 2. UI shows year-wise cards:                               │
│    ├─ 📅 MPPSC 2023 (100 Questions)                       │
│    ├─ 📅 MPPSC 2022 (100 Questions)                       │
│    └─ 📅 MPPSC 2021 (100 Questions)                       │
│                                                              │
│ 3. User clicks "MPPSC 2023"                                │
│    └─ Redirect: /syllabus/quiz/play?testId=pyq_2023       │
│                                                              │
│ 4. Real exam paper loads                                    │
└─────────────────────────────────────────────────────────────┘

Data Structure:
{
  id: "pyq_mppsc_2023",
  title: "MPPSC Prelims 2023",
  type: "PYQ",
  unitId: null,
  topicId: null,
  totalQuestions: 100,
  totalMarks: 200,
  durationMinutes: 120,
  tags: ["2023", "prelims"]  // Year extracted in action
}

Year Extraction Logic:
src/actions/test-actions.ts (Line 19-22):
pyqTests.map(test => ({
    ...test,
    year: test.title.match(/\d{4}/)?.[0] || new Date(test.createdAt!).getFullYear().toString()
}));
```

### 🔄 Common Test Flow (All Types)

```
┌─────────────────────────────────────────────────────────────────────┐
│           UNIVERSAL TEST EXECUTION FLOW                              │
│      (Works for ALL 5 test types)                                   │
└─────────────────────────────────────────────────────────────────────┘

Step 1: Test Selection
──────────────────────
User navigates to specific test type page
↓
Server fetches tests using cached functions:
• getCachedTopicTests() [via getSyllabusTopics]
• getCachedFLTTests()
• getCachedCSATTests()
• getCachedPYQTests()
↓
Client renders test cards with:
• Title, Description
• Questions count, Marks, Duration
• Attempt count (if user logged in)

Step 2: Test Start
──────────────────
User clicks test card
↓
Redirect to: /syllabus/quiz/play?testId={test_id}
↓
Server Component (page.tsx) executes:
┌────────────────────────────────────────────────┐
│ const testData = await getTestWithQuestions() │
│ const user = await verifyAuth()               │
│                                                 │
│ Returns:                                        │
│ {                                               │
│   test: { id, title, type, duration, ... },   │
│   questions: [                                  │
│     {                                           │
│       id, questionText, questionTextEn,        │
│       options, correctAnswer, explanation, ... │
│     }                                           │
│   ]                                             │
│ }                                               │
└────────────────────────────────────────────────┘
↓
Data passed to QuizPlayClient component

Step 3: Quiz Rendering
──────────────────────
QuizPlayClient.tsx receives:
• questions array
• test metadata
• user info
↓
useQuizLogic() hook initializes:
┌────────────────────────────────────────────────┐
│ State:                                          │
│ • currentQuestionIndex = 0                     │
│ • answers = {}                                 │
│ • timeLeft = test.durationMinutes * 60        │
│ • questionTimes = {}                           │
│                                                 │
│ Timer starts:                                   │
│ • setInterval every 1 second                   │
│ • Decrements timeLeft                          │
│ • Auto-submits at 0                            │
└────────────────────────────────────────────────┘
↓
UI renders:
• Question card with options
• Timer
• Question palette (navigation)
• Submit button

Step 4: User Interaction
────────────────────────
User selects option
↓
handleOptionSelect(optionIndex) called
↓
State updated:
answers[currentQuestionId] = optionIndex
↓
User navigates using:
• Next button → handleNext()
• Previous button → handlePrev()
• Question palette → handleJump(index)
↓
On each navigation:
• saveCurrentQuestionTime() called
• Time for current question recorded

Step 5: Test Submission
───────────────────────
User clicks "Submit" OR Timer reaches 0
↓
handleSubmit() executed:
┌────────────────────────────────────────────────┐
│ 1. Format answers:                              │
│    { questionId: selectedOptionIndex }         │
│                                                 │
│ 2. Calculate total time:                       │
│    timeTaken = durationMinutes*60 - timeLeft   │
│                                                 │
│ 3. Call server action:                         │
│    await submitTestAttempt(                    │
│      testId,                                    │
│      userId,                                    │
│      formattedAnswers,                         │
│      timeTaken,                                 │
│      questionTimes                             │
│    )                                            │
└────────────────────────────────────────────────┘
↓
Server Action (submitTestAttempt):
┌────────────────────────────────────────────────┐
│ 1. Fetch correct answers from DB               │
│                                                 │
│ 2. Calculate score:                            │
│    For each answer:                             │
│      if correct: +2 marks                      │
│      if wrong: -0.66 marks (negative marking)  │
│                                                 │
│ 3. Create attempt record:                      │
│    INSERT INTO user_attempts (                 │
│      id, userId, testId,                       │
│      startTime, endTime, score                 │
│    )                                            │
│                                                 │
│ 4. Save individual answers:                    │
│    INSERT INTO attempt_answers (               │
│      attemptId, questionId,                    │
│      userAnswer, isCorrect, timeTaken          │
│    ) FOR EACH QUESTION                         │
└────────────────────────────────────────────────┘
↓
Database updated
↓
Return: { success: true, attemptId, score }

Step 6: Results Display
───────────────────────
Quiz UI shows results modal:
• Total score
• Correct/Incorrect/Unattempted breakdown
• Percentage
• Time taken
↓
User clicks "View Detailed Analysis"
↓
Redirect to: /syllabus/analytics/history/[attemptId]
↓
Detailed review page shows:
• Question-by-question breakdown
• User's answer vs Correct answer
• Time taken per question
• Explanations
```

### 📊 Test Type Comparison Matrix

| Feature | TOPIC | UNIT | FLT | CSAT | PYQ |
|---------|-------|------|-----|------|-----|
| **Questions** | 10 | 30-50 | 100+ | 80 | 100 |
| **Duration** | 10 min | 60 min | 120 min | 100 min | 120 min |
| **Scope** | Single topic | Full unit | All 10 units | Aptitude | Past exam |
| **Link Field** | `topicId` | `unitId` | None | None | None |
| **Language** | Hindi/English | Hindi/English | Hindi/English | Mostly English | Hindi/English |
| **Free Access** | First 5 topics | First 2 units | None (Pro) | Limited | Limited |
| **Retry Limit** | Unlimited | 5 attempts | 3 attempts | Unlimited | Unlimited |
| **Cache TTL** | On-demand | On-demand | 60 sec | 60 sec | 60 sec |

---


## 6. Data Flow & Caching Strategy

### 🔄 Complete Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    DATA FLOW: DATABASE → UI                               │
└──────────────────────────────────────────────────────────────────────────┘

Layer 1: DATABASE (Turso/LibSQL)
────────────────────────────────
Location: Remote SQLite database (Turso cloud)
Connection: src/db/index.ts
Schema: src/db/schema.ts

┌─────────────────────────────────────┐
│  Turso Database                     │
│  ├─ mppsc_users                    │
│  ├─ tests                          │
│  ├─ questions                      │
│  ├─ user_attempts                  │
│  ├─ attempt_answers                │
│  ├─ syllabus_topics                │
│  └─ ...                            │
└───────────┬─────────────────────────┘
            │
            │ SQL Queries via Drizzle ORM
            ▼
Layer 2: DRIZZLE ORM
────────────────────
File: src/db/index.ts

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);

Usage Example:
await db.select().from(tests).where(eq(tests.type, 'FLT'));
            │
            │ Wrapped in Server Actions
            ▼
Layer 3: SERVER ACTIONS (Data Fetching Layer)
──────────────────────────────────────────────
Location: src/actions/*.ts

🔥 CRITICAL SERVER ACTIONS:

┌────────────────────────────────────────────────────────────┐
│ File: src/actions/test-actions.ts                         │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ getCachedPYQTests()                                        │
│ ├─ SELECT * FROM tests WHERE type = 'PYQ'                │
│ ├─ Cache: 60 seconds                                      │
│ ├─ Tag: ['tests']                                         │
│ └─ Returns: Array of PYQ tests                           │
│                                                             │
│ getCachedFLTTests()                                        │
│ ├─ SELECT * FROM tests WHERE type = 'FLT'                │
│ ├─ Cache: 60 seconds                                      │
│ └─ Returns: Array of FLT tests                           │
│                                                             │
│ getCachedCSATTests()                                       │
│ ├─ Similar to above, type = 'CSAT'                       │
│                                                             │
│ getTestWithQuestions(testId)                              │
│ ├─ Uses Drizzle relations                                 │
│ ├─ Fetches test + all questions in one query             │
│ ├─ NO CACHE (always fresh for quiz play)                 │
│ └─ Returns: { test, questions: [...] }                   │
│                                                             │
│ submitTestAttempt(...)                                     │
│ ├─ Validates answers on server                            │
│ ├─ Calculates score                                       │
│ ├─ Inserts into: user_attempts, attempt_answers          │
│ └─ Returns: { success, attemptId, score }                │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ File: src/actions/analytics-actions.ts                    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ getUserAnalytics(userId)                                   │
│ ├─ JOIN: user_attempts + tests + attempt_answers         │
│ ├─ Processes: Subject mastery, recent history             │
│ ├─ Deduplicates: Keeps latest attempt per test           │
│ ├─ Enriches: Topic names from syllabusTopics             │
│ ├─ Cache: 1 second (!!!)                                 │
│ ├─ Tag: [`analytics-${userId}`]                          │
│ └─ Returns: {                                             │
│      overallScore,                                         │
│      totalTests,                                           │
│      mastery: [...],                                       │
│      recentActivity: [...],                                │
│      aiSuggestion                                          │
│    }                                                        │
│                                                             │
│ getAttemptDetails(attemptId)                              │
│ ├─ Fetches: Attempt meta + all Q&A                       │
│ ├─ NO CACHE                                               │
│ └─ Used for: Detailed review page                        │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ File: src/actions/getSyllabusTopics.ts                    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ getSyllabusTopics()                                        │
│ ├─ SELECT * FROM syllabus_topics                         │
│ ├─ Groups by: unitId                                      │
│ ├─ Cache: 5 minutes (300 sec)                            │
│ ├─ Tag: ['syllabus-topics']                              │
│ └─ Returns: {                                             │
│      unit_1: [topics...],                                 │
│      unit_2: [topics...],                                 │
│      ...                                                   │
│    }                                                        │
└────────────────────────────────────────────────────────────┘

            │
            │ Called from Server Components
            ▼
Layer 4: SERVER COMPONENTS (RSC - React Server Components)
───────────────────────────────────────────────────────────
Location: src/app/**/page.tsx files

Example: src/app/dashboard/page.tsx

export default async function DashboardPage() {
    const user = await verifyAuth();  // Auth check
    
    if (!user) redirect('/login');
    
    // 🔥 Data fetching on server
    const analyticsData = await getUserAnalytics(user.id);
    const syllabusProgress = await getUserSyllabusProgress();
    
    // Pass data to client component
    return (
        <div>
            <AnalyticsDashboardClient analytics={analyticsData} />
        </div>
    );
}

Benefits:
• No client-side loading states
• SEO-friendly (data in initial HTML)
• Secure (DB queries never exposed to client)
• Automatic deduplication of parallel requests

            │
            │ Props passed down
            ▼
Layer 5: CLIENT COMPONENTS (Interactive UI)
────────────────────────────────────────────
Location: src/app/**/*Client.tsx, src/components/**/*.tsx

Example: AnalyticsDashboardClient.tsx

'use client';

export default function AnalyticsDashboardClient({ analytics }) {
    const { recentActivity, mastery } = analytics;
    
    // Client-side interactions
    const [activeTab, setActiveTab] = useState('ALL');
    
    // Filtering (client-side, instant)
    const filtered = recentActivity.filter(item => 
        activeTab === 'ALL' || item.type === activeTab
    );
    
    return (
        <div>
            {/* Interactive UI */}
            <Tabs onChange={setActiveTab} />
            <TestHistoryList items={filtered} />
        </div>
    );
}

            │
            │ User interactions
            ▼
Layer 6: USER INTERACTIONS & STATE UPDATES
───────────────────────────────────────────
• Click events
• Form submissions
• Timer updates (client-side)
• Zustand store updates (global state)

When data needs to change:
────────────────────────────
User submits test
    ↓
submitTestAttempt() called (server action)
    ↓
Database updated
    ↓
Option 1: Router refresh
    router.refresh() → Re-fetches server component data
    
Option 2: Manual revalidation
    revalidateTag(`analytics-${userId}`)
    
Option 3: Optimistic update
    Update client state immediately, sync in background
```

### ⚡ Caching Strategy Deep Dive

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      CACHING LAYERS & POLICIES                            │
└──────────────────────────────────────────────────────────────────────────┘

🔥 CRITICAL CONCEPT: Next.js unstable_cache()

What it does:
• Caches function results on the server
• Deduplicates requests within same render cycle
• Persists across requests based on revalidation policy

Syntax:
const cachedFn = unstable_cache(
    async () => { /* expensive operation */ },
    ['cache-key'],              // Unique identifier
    {
        revalidate: 60,         // TTL in seconds
        tags: ['tag1', 'tag2']  // For manual invalidation
    }
);

┌─────────────────────────────────────────────────────────────┐
│         CACHE CONFIGURATION BY DATA TYPE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 1. TEST LISTS (FLT, CSAT, PYQ)                             │
│    ────────────────────────────                             │
│    TTL: 60 seconds                                          │
│    Tag: ['tests']                                           │
│    Reason: Tests rarely change, but not completely static   │
│                                                              │
│    Cache Key Examples:                                      │
│    • 'flt-tests-list'                                       │
│    • 'csat-tests-list'                                      │
│    • 'pyq-tests-list'                                       │
│                                                              │
│    Invalidation:                                            │
│    • Manual: revalidateTag('tests')                        │
│    • Auto: After 60 seconds                                 │
│    • Use case: Admin uploads new test                      │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 2. USER ANALYTICS                                           │
│    ────────────────                                         │
│    TTL: 1 second (!!!) 🔥                                  │
│    Tag: ['analytics-{userId}']                             │
│    Reason: Near real-time updates for dashboard            │
│                                                              │
│    Cache Key: `user-analytics-${userId}`                   │
│                                                              │
│    Why such short TTL?                                      │
│    • User expects fresh data after test                    │
│    • But multiple components fetch same data               │
│    • 1 sec prevents DB hammering during single page load   │
│                                                              │
│    Example Timeline:                                        │
│    10:00:00 → Dashboard loads, DB query                    │
│    10:00:00.5 → Analytics widget loads, CACHED             │
│    10:00:02 → User refreshes, DB query (cache expired)     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 3. SYLLABUS TOPICS                                          │
│    ────────────────                                         │
│    TTL: 300 seconds (5 minutes)                            │
│    Tag: ['syllabus-topics']                                │
│    Reason: Syllabus data is semi-static                    │
│                                                              │
│    Cache Key: 'syllabus-topics-all'                        │
│                                                              │
│    Invalidation:                                            │
│    • Admin updates syllabus content                        │
│    • Manual revalidation via API                           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 4. NO CACHE (Fresh Every Time)                             │
│    ───────────────────────                                  │
│    • getTestWithQuestions()                                │
│      → Quiz play needs fresh questions always              │
│                                                              │
│    • getAttemptDetails()                                   │
│      → Review page should show exact attempt data          │
│                                                              │
│    • submitTestAttempt()                                   │
│      → Write operations never cached                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              CACHE INVALIDATION STRATEGIES                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Strategy 1: Time-based (Automatic)                         │
│ ──────────────────────────────                             │
│ • revalidate: 60 means cache expires after 60 seconds      │
│ • Next request after expiry triggers fresh fetch           │
│ • No manual intervention needed                            │
│                                                              │
│ Strategy 2: Tag-based (Manual)                             │
│ ──────────────────────────                                  │
│ • Each cache has tags: ['tag1', 'tag2']                    │
│ • Server action can invalidate:                            │
│                                                              │
│   import { revalidateTag } from 'next/cache';              │
│   revalidateTag('tests');                                  │
│                                                              │
│ • ALL caches with tag 'tests' are invalidated immediately  │
│                                                              │
│ Strategy 3: Path-based Revalidation                        │
│ ──────────────────────────────────────                     │
│ • Revalidate entire route:                                 │
│                                                              │
│   import { revalidatePath } from 'next/cache';             │
│   revalidatePath('/dashboard');                            │
│                                                              │
│ • Use case: After major data changes                       │
│                                                              │
│ Strategy 4: On-demand API Endpoint                         │
│ ──────────────────────────────────────                     │
│ File: src/app/api/revalidate/route.ts                     │
│                                                              │
│ POST /api/revalidate                                        │
│ Body: { tag: 'tests' }                                     │
│                                                              │
│ • Admin can trigger cache clear via UI                     │
│ • Webhook integration for external updates                 │
└─────────────────────────────────────────────────────────────┘

🔥 REAL-WORLD CACHE FLOW EXAMPLE

Scenario: User takes a test and checks dashboard
─────────────────────────────────────────────────

Timeline:

10:00:00 → User submits test
           ├─ submitTestAttempt() called
           ├─ Database writes: user_attempts, attempt_answers
           └─ NO cache invalidation (by default)

10:00:05 → User navigates to /dashboard
           ├─ Page.tsx calls: getUserAnalytics(userId)
           ├─ Cache check: Last cached at 9:59:00 (>1 sec old)
           ├─ Cache MISS → DB query executed
           ├─ New data includes recent test
           └─ Cache updated with key: 'user-analytics-user_123'

10:00:07 → User refreshes dashboard (impatient!)
           ├─ getUserAnalytics(userId) called again
           ├─ Cache check: Cached at 10:00:05 (<1 sec ago)
           └─ Cache HIT → Instant response, no DB query

10:00:10 → User opens analytics page
           ├─ Different component, same getUserAnalytics() call
           ├─ Cache check: Cached at 10:00:05 (5 sec old)
           ├─ Cache EXPIRED (TTL = 1 sec)
           ├─ Cache MISS → DB query
           └─ Fresh data returned

Performance Impact:
───────────────────
Without cache: 3 DB queries in 10 seconds
With cache: 2 DB queries (1 saved at 10:00:07)

For high-traffic dashboard with 100 users:
• Without cache: 300 queries/10s = 30 QPS
• With cache: 200 queries/10s = 20 QPS
• 33% reduction in DB load

🎯 ADVANCED: Cache Warming

For critical pages, pre-populate cache on deployment:

// In build/deployment script
await getCachedFLTTests();
await getCachedPYQTests();
await getSyllabusTopics();

// Now first user gets instant response
```

### 🔍 Where is Data Used? (Connection Map)

```
┌────────────────────────────────────────────────────────────────┐
│             DATA USAGE ACROSS APPLICATION                       │
└────────────────────────────────────────────────────────────────┘

📊 USER ANALYTICS DATA (from getUserAnalytics)
─────────────────────────────────────────────

Used in:
1. /dashboard (page.tsx)
   └─ Component: AnalyticsDashboardClient.tsx
      ├─ Recent Test History card
      ├─ Subject Mastery chart
      ├─ AI Suggestions
      └─ Overall stats (Tests Taken, Avg Score)

2. /syllabus/analytics (page.tsx)
   └─ Same AnalyticsDashboardClient component
      └─ Full analytics page (identical to dashboard)

Data Fields Usage:
──────────────────
• recentActivity array
  └─ Used in: Recent Test History section
     • Displays: Test name, score, date, type
     • Filtering: By test type (TOPIC, UNIT, FLT, etc.)
     • Grouping: By unit for topic tests
     • Click → Navigate to /history/[attemptId]

• mastery array
  └─ Used in: Subject Mastery section
     • Progress bars per subject
     • Color coding: Red (<40%), Amber (40-80%), Green (>80%)

• aiSuggestion string
  └─ Used in: AI Coach card
     • Personalized recommendation
     • Changes based on performance

• overallScore number
  └─ Used in: Stats cards
     • "Avg. Score: 78%"

• totalTests number
  └─ Used in: Stats cards
     • "Tests Taken: 12"


🎓 SYLLABUS TOPICS DATA (from getSyllabusTopics)
────────────────────────────────────────────────

Used in:
1. /syllabus/quiz/topic (page.tsx)
   └─ Topic selection page
      • Unit cards → Topic list
      • Click topic → /quiz/play?testId=xxx

2. Analytics enrichment (analytics-actions.ts Line 158-166)
   └─ Resolves topicId to actual topic name
      • "Topic Quiz" → "संविधान का परिचय"

Data Fields Usage:
──────────────────
• id (topic UUID)
  └─ Linked to: tests.topicId
     • Matches test to topic

• title / titleEn
  └─ Display name in UI
     • Language-aware (Hindi/English)

• unitId
  └─ Grouping in UI
     • Unit 1 header → All Unit 1 topics listed below

• order
  └─ Sorting + Access control
     • Order 1-5: Free
     • Order 6+: Premium (depending on plan)

• content (JSON)
  └─ Flashcard front/back text
     • Used in: /syllabus/[unitId] flashcard viewer


🧪 TEST DATA (from getCached*Tests)
───────────────────────────────────

Used in:
1. /syllabus/quiz/pyq (PYQPageClient.tsx)
2. /syllabus/quiz/csat (CSATPageClient.tsx)
3. /syllabus/quiz/full-length (FLTPageClient.tsx)
4. /syllabus/quiz/units (QuizUnitSelectionClient.tsx)

Common Pattern:
───────────────
• Server component fetches: await getCachedPYQTests()
• Passes to client: <PYQPageClient initialTests={tests} />
• Client renders: Test cards with metadata
• User clicks → Navigate to /quiz/play?testId={test.id}

Data Fields Usage:
──────────────────
• id
  └─ Query param for quiz play

• title
  └─ Card heading

• totalQuestions, totalMarks, durationMinutes
  └─ Card badges ("100 Questions • 200 Marks • 120 min")

• isPro
  └─ Lock icon for premium tests

• type
  └─ Badge color/styling
     • FLT → Blue
     • CSAT → Green
     • PYQ → Purple


🎮 QUIZ PLAY DATA (from getTestWithQuestions)
─────────────────────────────────────────────

Used in:
1. /syllabus/quiz/play (QuizPlayClient.tsx)

Flow:
─────
Server: const test = await getTestWithQuestions(testId)
↓
Client: <QuizPlayClient questions={test.questions} test={test} />
↓
Hook: useQuizLogic({ questions, timeLimitInMinutes: test.durationMinutes })
↓
Renders: Question UI, Timer, Options, Navigation

Data Fields Usage:
──────────────────
• questions array → Rendered one by one
• test.durationMinutes → Timer initialization
• question.questionText / questionTextEn → Language toggle
• question.options → Radio buttons
• question.correctAnswer → Validation (on submit, server-side)
• question.explanation → Shown in results


👤 USER DATA (from useSettingsStore)
────────────────────────────────────

Global Zustand store, accessed everywhere

Used in:
────────
• TopMenu.tsx → Show user name, avatar
• Quiz pages → Lock logic based on planTier
• Language toggle → Switch Hindi/English
• Analytics → Personalized greeting

Data Fields:
────────────
• user.id → Used in getUserAnalytics(userId)
• user.name → Display in header
• user.plan_tier → 'free' | 'lite' | 'pro'
  └─ Controls: Topic access limits, test access
• isSubscribed → Boolean flag
• language → 'hi' | 'en'
  └─ Switches: questionText vs questionTextEn
```

---


## 7. State Management

### 🗃️ State Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT LAYERS                                │
└──────────────────────────────────────────────────────────────────────────┘

3 Types of State:
1. Server State (Database-backed)
2. Global Client State (Zustand)
3. Local Component State (React useState)

┌─────────────────────────────────────────────────────────────┐
│  1. SERVER STATE (Database-backed, cached)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Managed by: Server Actions + Next.js Cache                │
│  Location: Database → Server Actions → RSC → Client Props  │
│                                                              │
│  Examples:                                                   │
│  • User attempts (getUserAnalytics)                         │
│  • Test questions (getTestWithQuestions)                    │
│  • Syllabus topics (getSyllabusTopics)                      │
│                                                              │
│  Characteristics:                                            │
│  ✓ Source of truth is database                             │
│  ✓ Automatically revalidated on time/tag basis             │
│  ✓ Shared across sessions (persistent)                     │
│  ✓ No client-side state management needed                  │
│                                                              │
│  Update Flow:                                                │
│  Client → Server Action → DB Write → Cache Invalidation    │
│  → Next Request Fetches Fresh Data                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  2. GLOBAL CLIENT STATE (Zustand) 🔥 CRITICAL              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  File: src/store/useSettingsStore.ts                       │
│                                                              │
│  interface SettingsState {                                  │
│    // User Authentication                                   │
│    user: User | null;                                       │
│    isSubscribed: boolean;                                   │
│    setUser: (user, isSubscribed) => void;                  │
│                                                              │
│    // Language Preference                                   │
│    language: 'hi' | 'en';                                   │
│    setLanguage: (lang) => void;                            │
│                                                              │
│    // UI State                                              │
│    isLockModalOpen: boolean;                                │
│    setLockModalOpen: (isOpen) => void;                     │
│  }                                                           │
│                                                              │
│  Persistence: localStorage (via zustand/persist)            │
│  Key: 'settings-storage'                                    │
│                                                              │
│  Usage Everywhere:                                          │
│  ────────────────                                           │
│  import { useSettingsStore } from '@/store/useSettingsStore';│
│                                                              │
│  const { user, language, isSubscribed } = useSettingsStore();│
│                                                              │
│  Used in:                                                    │
│  • TopMenu.tsx → Display user name                         │
│  • All quiz pages → Language toggle                        │
│  • Lock logic → Check planTier                             │
│  • Analytics → Personalized messages                       │
│                                                              │
│  Why Zustand?                                               │
│  ─────────────                                              │
│  ✓ Lightweight (no Provider wrapper needed)                │
│  ✓ Persistent (survives page refresh)                      │
│  ✓ Type-safe (TypeScript support)                          │
│  ✓ Simple API (no actions/reducers boilerplate)           │
│                                                              │
│  Hydration:                                                  │
│  ──────────                                                 │
│  On app load (src/components/PwaRegistry.tsx):             │
│  1. Check cookie: mppsc_token                              │
│  2. If exists, fetch: /api/auth/me                         │
│  3. Update store: setUser(userData, isSubscribed)          │
│                                                              │
│  On logout:                                                  │
│  1. Call: /api/auth/logout                                 │
│  2. Clear store: setUser(null, false)                      │
│  3. Redirect: /login                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  3. LOCAL COMPONENT STATE (React useState)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Used for: UI-only state that doesn't need persistence     │
│                                                              │
│  Examples:                                                   │
│  ──────────                                                 │
│  • Modal open/close state                                   │
│    const [isOpen, setIsOpen] = useState(false);            │
│                                                              │
│  • Form input values                                        │
│    const [searchQuery, setSearchQuery] = useState('');     │
│                                                              │
│  • Tab selection                                            │
│    const [activeTab, setActiveTab] = useState('ALL');      │
│                                                              │
│  • Loading states                                           │
│    const [isLoading, setIsLoading] = useState(true);       │
│                                                              │
│  When to use local state:                                   │
│  ────────────────────────                                   │
│  ✓ State only used in one component                        │
│  ✓ Doesn't need to survive page navigation                 │
│  ✓ Short-lived interactions                                 │
│  ✓ No need to share across components                      │
└─────────────────────────────────────────────────────────────┘
```

### 🔥 Critical State: useQuizLogic Hook

```
┌──────────────────────────────────────────────────────────────────────────┐
│                 QUIZ STATE MANAGEMENT (useQuizLogic)                      │
│  File: src/hooks/useQuizLogic.ts                                         │
│  🚨 SUPER CRITICAL - Powers all quiz interactions                       │
└──────────────────────────────────────────────────────────────────────────┘

Purpose:
────────
Centralized quiz state + logic for ALL test types (Topic, Unit, FLT, CSAT, PYQ)

Input Props:
────────────
interface UseQuizLogicProps {
    questions: Question[];          // Array of questions
    mode: 'topic' | 'full' | 'pyq'; // Test type
    timeLimitInMinutes: number;     // e.g., 10, 60, 120
    testId: string;                 // For submission
    userId: string;                 // Current user
    onRetry?: () => void;           // Optional retry callback
    isInstantMode?: boolean;        // Show correct answer instantly
}

State Variables:
────────────────
1. currentQuestionIndex: number
   └─ Tracks which question user is viewing (0 to questions.length-1)

2. answers: Record<string, number>
   └─ Structure: { questionId: selectedOptionIndex }
   └─ Example: { "q1": 2, "q3": 0, "q5": 1 }
   └─ Missing entries = unanswered questions

3. markedForReview: string[]
   └─ Array of question IDs marked for later review
   └─ Example: ["q2", "q7", "q9"]

4. isSubmitted: boolean
   └─ True after test submitted
   └─ Switches UI from quiz → results view

5. timeLeft: number
   └─ Seconds remaining
   └─ Decrements every second via setInterval
   └─ Auto-submit when reaches 0

6. questionTimes: Record<string, number>
   └─ Tracks time spent on each question
   └─ Structure: { questionId: secondsSpent }
   └─ Used for: Analytics, per-question performance

7. instantModeEnabled: boolean
   └─ If true, shows correct answer immediately after selection
   └─ Used for: Practice mode (not exam mode)

Actions (Functions):
────────────────────
handleOptionSelect(optionIndex: number)
├─ Updates: answers[currentQuestionId] = optionIndex
└─ User can change answer (no lock)

handleNext()
├─ Saves current question time
├─ Increments: currentQuestionIndex++
└─ Bounded by: questions.length

handlePrev()
├─ Saves current question time
├─ Decrements: currentQuestionIndex--
└─ Bounded by: 0

handleJump(index: number)
├─ Saves current question time
├─ Sets: currentQuestionIndex = index
└─ Used by: Question palette navigation

toggleMarkForReview()
├─ Adds/removes currentQuestionId from markedForReview array
└─ Visual indicator in question palette

handleSubmit() 🔥 CRITICAL
├─ Step 1: Stop timer
├─ Step 2: Calculate final time for last question
├─ Step 3: Format answers for API
│   └─ Convert: Record<string, number> → Record<string, string>
├─ Step 4: Call server action:
│   await submitTestAttempt(
│     testId,
│     userId,
│     formattedAnswers,
│     totalTimeTaken,
│     questionTimes
│   )
├─ Step 5: Set isSubmitted = true
└─ Step 6: Show results UI

handleRetry()
├─ Resets all state to initial values
├─ Calls onRetry() callback if provided
└─ Used for: "Take test again" functionality

Timer Logic (useEffect):
────────────────────────
useEffect(() => {
    if (isSubmitted) return; // Don't run after submit
    
    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                clearInterval(timer);
                handleSubmit(); // Auto-submit
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
    
    return () => clearInterval(timer); // Cleanup
}, [isSubmitted]);

Time Tracking Logic:
────────────────────
On component mount:
• questionStartTimeRef.current = Date.now()

On question change (Next/Prev/Jump):
• Calculate: duration = (Date.now() - questionStartTimeRef.current) / 1000
• Update: questionTimes[currentQuestionId] += duration
• Reset: questionStartTimeRef.current = Date.now()

On submit:
• Include final question time in submission

Returned Values (Hook API):
────────────────────────────
return {
    // State (read-only for consumer)
    currentQuestionIndex,
    answers,
    markedForReview,
    isSubmitted,
    timeLeft,
    instantModeEnabled,
    language,
    
    // Actions (functions)
    setInstantModeEnabled,
    handleOptionSelect,
    handleNext,
    handlePrev,
    handleJump,
    toggleMarkForReview,
    handleSubmit,
    handleRetry,
    
    // Helpers
    getParsedOptions,      // Parses JSON options safely
    
    // Derived state
    currentQuestion,       // questions[currentQuestionIndex]
    isAnswered,            // Boolean: current question answered?
    totalQuestions,        // questions.length
};

Usage in QuizPlayClient.tsx:
─────────────────────────────
const {
    currentQuestion,
    currentQuestionIndex,
    answers,
    timeLeft,
    handleOptionSelect,
    handleNext,
    handleSubmit,
    ...
} = useQuizLogic({
    questions,
    mode: 'topic',
    timeLimitInMinutes: test.durationMinutes,
    testId: test.id,
    userId: user.id
});

// Then in JSX:
<div>
    <Timer seconds={timeLeft} />
    <Question 
        data={currentQuestion}
        selectedOption={answers[currentQuestion.id]}
        onSelect={handleOptionSelect}
    />
    <Button onClick={handleNext}>Next</Button>
    <Button onClick={handleSubmit}>Submit</Button>
</div>

Why This Design?
────────────────
✓ Single source of truth for quiz state
✓ Reusable across all test types
✓ Encapsulates complex logic (timer, tracking)
✓ Easy to test independently
✓ Clean separation: Logic (hook) vs UI (component)
```

---

## 8. Critical Functions & Hooks

### 🎯 Top 10 Critical Functions

```
┌──────────────────────────────────────────────────────────────────────────┐
│              CRITICAL FUNCTIONS RANKED BY IMPORTANCE                      │
└──────────────────────────────────────────────────────────────────────────┘

1️⃣ verifyAuth()
───────────────
File: src/lib/auth.ts
Purpose: Authenticates every protected request

export const verifyAuth = cache(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('mppsc_token');
    
    if (!token) return null;
    
    const userId = token.value;
    const users = await db.select().from(mppscUsers)
        .where(eq(mppscUsers.id, userId))
        .limit(1);
    
    return users[0] || null;
});

Used in:
• Every protected page (dashboard, quiz, analytics)
• Server actions that need user context
• Admin routes

Why Critical:
🔥 Core security mechanism
🔥 Called on every server-side render
🔥 Uses React cache() for deduplication within request

Cache Behavior:
• Cached within single request cycle
• Multiple verifyAuth() calls = 1 DB query
• Not cached across requests (security)

────────────────────────────────────────────────────────────────

2️⃣ submitTestAttempt()
───────────────────────
File: src/actions/test-actions.ts
Purpose: Saves user's test attempt and calculates score

async function submitTestAttempt(
    testId, userId, answers, durationSeconds, questionTimes
) {
    // 1. Fetch correct answers (server-side validation)
    const testQuestions = await db.select({
        id, correctAnswer, marks, negativeMarks
    }).from(questions).where(eq(questions.testId, testId));
    
    // 2. Calculate score
    let totalScore = 0;
    testQuestions.forEach(q => {
        const userAnswer = answers[q.id];
        if (userAnswer !== undefined) {
            const isCorrect = String(userAnswer) === String(q.correctAnswer);
            if (isCorrect) {
                totalScore += SCORING_CONFIG.MARKS_PER_QUESTION;
            } else {
                totalScore -= SCORING_CONFIG.NEGATIVE_MARKING;
            }
        }
    });
    
    // 3. Create attempt record (transaction)
    await db.transaction(async (tx) => {
        await tx.insert(userAttempts).values({
            id: attemptId,
            userId, testId,
            startTime, endTime,
            score: totalScore,
            isCompleted: true
        });
        
        // 4. Save individual answers
        await tx.insert(attemptAnswers).values(
            answersList.map(a => ({
                id, attemptId,
                questionId, userAnswer,
                isCorrect, timeTakenSeconds
            }))
        );
    });
    
    return { success: true, attemptId, score: totalScore };
}

Why Critical:
🔥 Core test submission logic
🔥 Handles scoring calculation securely
🔥 Uses transactions for data integrity
🔥 Returns attemptId for navigation to results

Security:
• Answers validated on server (not trusted from client)
• Correct answers never sent to client
• Score calculated server-side

────────────────────────────────────────────────────────────────

3️⃣ getUserAnalytics()
──────────────────────
File: src/actions/analytics-actions.ts
Purpose: Fetches and processes user's complete performance data

async function getUserAnalytics(userId) {
    return unstable_cache(
        async () => {
            // 1. Fetch all attempts
            const attempts = await db.select({...})
                .from(userAttempts)
                .leftJoin(tests, ...)
                .where(eq(userAttempts.userId, userId));
            
            // 2. Calculate subject mastery
            const answersData = await db.select({...})
                .from(attemptAnswers)
                .leftJoin(questions, ...);
            
            // Process subject-wise performance...
            
            // 3. Deduplicate test history
            const uniqueTests = new Map();
            attempts.forEach(a => {
                if (!uniqueTests.has(a.testId)) {
                    uniqueTests.set(a.testId, a);
                }
            });
            
            // 4. Enrich topic names
            const syllabusTopics = await getSyllabusTopics();
            const enrichedHistory = Array.from(uniqueTests.values())
                .map(a => ({
                    ...a,
                    testTitle: resolveTopicName(a.topicId, syllabusTopics),
                    unitName: `Unit ${extractUnitNumber(a.unitId)}`
                }));
            
            // 5. Generate AI suggestion
            const aiSuggestion = generateAISuggestion(mastery);
            
            return {
                overallScore,
                totalTests,
                mastery,
                recentActivity: enrichedHistory,
                aiSuggestion
            };
        },
        [`user-analytics-${userId}`],
        { revalidate: 1, tags: [`analytics-${userId}`] }
    );
}

Why Critical:
🔥 Powers entire dashboard
🔥 Complex data processing (joins, grouping, enrichment)
🔥 Most frequently called server action
🔥 Performance-sensitive (hence aggressive caching)

Performance:
• Cache TTL: 1 second
• Joins 3 tables (attempts, tests, answers)
• Processes 50+ attempts in memory

────────────────────────────────────────────────────────────────

4️⃣ useQuizLogic()
──────────────────
File: src/hooks/useQuizLogic.ts
Purpose: Centralized quiz state management

(Already detailed in Section 7 - State Management)

Why Critical:
🔥 Single source of truth for quiz interaction
🔥 Used by ALL test types
🔥 Manages timer, answers, navigation
🔥 Complex logic (200+ lines)

────────────────────────────────────────────────────────────────

5️⃣ getTestWithQuestions()
──────────────────────────
File: src/actions/test-actions.ts
Purpose: Fetches test + all questions for quiz play

async function getTestWithQuestions(testId) {
    const test = await db.query.tests.findFirst({
        where: eq(tests.id, testId),
        with: {
            questions: {
                orderBy: asc(questions.order)
            }
        }
    });
    
    return test || null;
}

Why Critical:
�� Called on every quiz play page load
🔥 Uses Drizzle relations (efficient single query)
🔥 No caching (always fresh questions)

Drizzle Magic:
• `with: { questions: ... }` → Automatic JOIN
• Fetches test + questions in one round-trip
• Type-safe result

────────────────────────────────────────────────────────────────

6️⃣ getSyllabusTopics()
───────────────────────
File: src/actions/getSyllabusTopics.ts
Purpose: Fetches all syllabus topics grouped by unit

async function getSyllabusTopics() {
    return unstable_cache(
        async () => {
            const topics = await db.select()
                .from(syllabusTopics)
                .orderBy(asc(syllabusTopics.order));
            
            // Group by unitId
            const grouped: Record<string, Topic[]> = {};
            topics.forEach(t => {
                if (!grouped[t.unitId]) grouped[t.unitId] = [];
                grouped[t.unitId].push(t);
            });
            
            return { success: true, data: grouped };
        },
        ['syllabus-topics-all'],
        { revalidate: 300, tags: ['syllabus-topics'] }
    );
}

Why Critical:
🔥 Used for topic test selection
🔥 Used for enriching analytics (topic name resolution)
🔥 Heavy caching (5 min TTL)

Usage:
• Topic selection page: Shows unit → topics hierarchy
• Analytics: Converts topicId to display name

────────────────────────────────────────────────────────────────

7️⃣ getCached*Tests() (PYQ, FLT, CSAT)
──────────────────────────────────────
File: src/actions/test-actions.ts
Purpose: Fetch test lists by type

export const getCachedPYQTests = unstable_cache(
    async () => {
        return await db.select()
            .from(tests)
            .where(eq(tests.type, 'PYQ'))
            .orderBy(asc(tests.displayOrder));
    },
    ['pyq-tests-list'],
    { revalidate: 60, tags: ['tests'] }
);

Why Critical:
🔥 Called on every test listing page
🔥 Cached for performance
🔥 Similar pattern for FLT, CSAT

Pattern:
• Server component calls: const tests = await getCachedPYQTests()
• Passes to client: <PYQPageClient initialTests={tests} />
• Client renders cards

────────────────────────────────────────────────────────────────

8️⃣ SCORING_CONFIG
──────────────────
File: src/lib/quiz-scoring.ts
Purpose: Centralized scoring rules

export const SCORING_CONFIG = {
    MARKS_PER_QUESTION: 2,
    NEGATIVE_MARKING: 0.66,  // 1/3 of positive marks
    PASSING_PERCENTAGE: 40,
};

Why Critical:
🔥 Single source of truth for scoring
🔥 Easy to update scoring rules
🔥 Used in: submitTestAttempt(), results calculation

────────────────────────────────────────────────────────────────

9️⃣ PLAN_LIMITS
───────────────
File: src/config/plans.ts
Purpose: Defines access limits per subscription tier

export const PLAN_LIMITS = {
    guest: {
        topic_tests_limit: 0,
        unit_tests_limit: 0,
        flt_limit: 0,
    },
    free: {
        topic_tests_limit: 5,
        unit_tests_limit: 2,
        flt_limit: 0,
    },
    lite: {
        topic_tests_limit: 20,
        unit_tests_limit: 5,
        flt_limit: 2,
    },
    pro: {
        topic_tests_limit: Infinity,
        unit_tests_limit: Infinity,
        flt_limit: Infinity,
    },
};

Why Critical:
🔥 Controls content access (paywall)
🔥 Used in lock logic across quiz pages
🔥 Business logic centralized

Usage:
const userTier = user?.plan_tier || 'free';
const limit = PLAN_LIMITS[userTier].topic_tests_limit;
const isLocked = topic.order > limit;

────────────────────────────────────────────────────────────────

🔟 revalidateTag() / revalidatePath()
──────────────────────────────────────
File: next/cache (built-in)
Purpose: Manual cache invalidation

import { revalidateTag, revalidatePath } from 'next/cache';

// Invalidate specific tag
revalidateTag('tests');  // Clears all caches with tag 'tests'

// Invalidate entire route
revalidatePath('/dashboard');  // Re-renders dashboard on next request

Why Critical:
🔥 Allows manual cache control
🔥 Used after admin uploads
🔥 Ensures fresh data after mutations

Example:
After admin uploads new test:
1. Upload test to DB
2. Call: revalidateTag('tests')
3. Next user sees new test immediately
```

---


## 9. Authentication & Authorization

### 🔐 Auth System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                                     │
└──────────────────────────────────────────────────────────────────────────┘

🔄 Login Flow
─────────────

Step 1: User submits login form
────────────────────────────────
Client: /login page
↓
Form submission → POST /api/auth/mppsc-login
Body: { email, password }

Step 2: API Route validates credentials
────────────────────────────────────────
File: src/app/api/auth/mppsc-login/route.ts

export async function POST(req: Request) {
    const { email, password } = await req.json();
    
    // 1. Find user by email
    const user = await db.select().from(mppscUsers)
        .where(eq(mppscUsers.email, email))
        .limit(1);
    
    if (!user[0]) {
        return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    // 2. Verify password (bcrypt)
    const isValid = await bcrypt.compare(password, user[0].password);
    
    if (!isValid) {
        return Response.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    // 3. Set cookie with userId
    cookies().set('mppsc_token', user[0].id, {
        httpOnly: true,        // Cannot be accessed by JavaScript
        secure: true,          // HTTPS only (production)
        sameSite: 'lax',       // CSRF protection
        maxAge: 60 * 60 * 24 * 7  // 7 days
    });
    
    return Response.json({
        success: true,
        user: {
            id: user[0].id,
            name: user[0].name,
            email: user[0].email,
            plan_tier: user[0].planTier,
            is_subscribed: user[0].isSubscribed
        }
    });
}

Step 3: Client updates global state
────────────────────────────────────
On successful response:
↓
useSettingsStore.getState().setUser(userData, isSubscribed);
↓
Redirect to: /dashboard

────────────────────────────────────────────────────────────────

🔄 Signup Flow
──────────────

Similar to login, but:
• API Route: POST /api/auth/mppsc-signup
• Password hashed: await bcrypt.hash(password, 10)
• User created: await db.insert(mppscUsers).values({...})
• Default plan: 'free'

────────────────────────────────────────────────────────────────

🔄 Session Verification (on every protected route)
──────────────────────────────────────────────────

File: src/lib/auth.ts

export const verifyAuth = cache(async () => {
    // 1. Read cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('mppsc_token');
    
    if (!token) return null;  // Not logged in
    
    // 2. Token value = userId (simple design)
    const userId = token.value;
    
    // 3. Fetch user from DB
    const users = await db.select().from(mppscUsers)
        .where(eq(mppscUsers.id, userId))
        .limit(1);
    
    return users[0] || null;  // Return user object or null
});

Usage in protected pages:
─────────────────────────
export default async function DashboardPage() {
    const user = await verifyAuth();
    
    if (!user) {
        redirect('/login');  // Redirect if not authenticated
    }
    
    // User is authenticated, proceed with page logic
    return <div>Welcome {user.name}</div>;
}

────────────────────────────────────────────────────────────────

🔄 Logout Flow
──────────────

Client: Click "Logout" button
↓
API Call: POST /api/auth/mppsc-logout
↓
Server clears cookie:
cookies().delete('mppsc_token');
↓
Client clears Zustand state:
useSettingsStore.getState().setUser(null, false);
↓
Redirect: /login

────────────────────────────────────────────────────────────────

🔒 Authorization (Role-based Access)
─────────────────────────────────────

Admin Routes:
────────────
File: src/app/admin/layout.tsx

export default async function AdminLayout({ children }) {
    const user = await verifyAuth();
    
    if (!user || user.role !== 'admin') {
        redirect('/dashboard');  // Non-admin users redirected
    }
    
    return <div>{children}</div>;
}

Content Access (Plan-based):
────────────────────────────
File: src/app/syllabus/quiz/topic/page.tsx

const handleTopicClick = (topic) => {
    const userTier = user?.plan_tier || 'free';
    const limit = PLAN_LIMITS[userTier].topic_tests_limit;
    
    const isLocked = topic.order > limit;
    
    if (isLocked) {
        setPaywallOpen(true);  // Show upgrade modal
        return;
    }
    
    router.push(`/quiz/play?testId=${topic.testId}`);
};

Free vs Pro Content:
────────────────────
tests table has: isPro boolean field
↓
Free users: Filter tests where isPro = false
Pro users: Access all tests

Query Example:
const visibleTests = await db.select()
    .from(tests)
    .where(
        user.isSubscribed 
            ? undefined  // No filter, show all
            : eq(tests.isPro, false)  // Only free tests
    );
```

### 🛡️ Security Measures

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        SECURITY CHECKLIST                                 │
└──────────────────────────────────────────────────────────────────────────┘

✅ Password Security
────────────────────
• Hashing: bcryptjs (10 rounds)
• Never stored in plain text
• Never sent to client
• Validation on server only

✅ Cookie Security
──────────────────
• HttpOnly: Prevents XSS attacks (JS can't access)
• Secure: HTTPS only in production
• SameSite: CSRF protection
• Short-lived: 7 days max

✅ Server-Side Validation
──────────────────────────
• Quiz answers validated on server (not trusted from client)
• Correct answers never sent to client
• Score calculated server-side
• DB queries only on server

✅ Authorization Checks
───────────────────────
• Every protected route calls verifyAuth()
• Admin routes check user.role
• Premium content checks user.planTier
• Lock logic enforced server-side + client-side

✅ SQL Injection Prevention
────────────────────────────
• Using Drizzle ORM (parameterized queries)
• No raw SQL with user input
• Type-safe queries

Example (Safe):
await db.select().from(users).where(eq(users.email, userEmail));
// Drizzle handles escaping

✅ Rate Limiting
────────────────
File: src/lib/rate-limit.ts
• Limits API requests per IP
• Prevents brute-force attacks
• Used on: Login, signup endpoints

✅ Environment Variables
─────────────────────────
• Database credentials in .env (not committed)
• API keys not exposed to client
• Admin secrets in environment

⚠️ Known Limitations (Areas for Improvement)
────────────────────────────────────────────
• No JWT refresh tokens (cookie-only auth)
• No email verification
• No 2FA support
• Simple userId-as-token approach (should use signed JWT)
```

---

## 10. UI Component Architecture

### 🧩 Component Patterns

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT ARCHITECTURE                                 │
└──────────────────────────────────────────────────────────────────────────┘

Pattern 1: Server Component → Client Component
───────────────────────────────────────────────

Structure:
┌─────────────────────────────────────┐
│  page.tsx (Server Component)        │
│  ├─ Fetches data                    │
│  └─ Passes to → Client Component    │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  ClientComponent.tsx                │
│  ├─ 'use client' directive          │
│  ├─ Interactive UI                  │
│  └─ Uses: useState, useEffect, etc. │
└─────────────────────────────────────┘

Example: Dashboard
──────────────────
File: src/app/dashboard/page.tsx (Server)

export default async function DashboardPage() {
    const user = await verifyAuth();
    const analytics = await getUserAnalytics(user.id);
    
    return <AnalyticsDashboardClient analytics={analytics} />;
}

File: src/app/syllabus/analytics/AnalyticsDashboardClient.tsx (Client)

'use client';

export default function AnalyticsDashboardClient({ analytics }) {
    const [activeTab, setActiveTab] = useState('ALL');
    
    return (
        <div>
            <Tabs onChange={setActiveTab} />
            <TestHistory data={analytics.recentActivity} filter={activeTab} />
        </div>
    );
}

Benefits:
✓ Data fetching on server (faster initial load)
✓ Interactivity on client (smooth UX)
✓ SEO-friendly (data in HTML)
✓ Security (DB queries hidden from client)

────────────────────────────────────────────────────────────────

Pattern 2: shadcn/ui Components
────────────────────────────────

Location: src/components/ui/
• Pre-built, customizable components
• Based on Radix UI primitives
• Styled with Tailwind CSS

Key Components Used:
────────────────────
• Button (src/components/ui/button.tsx)
  └─ Variants: default, outline, ghost, destructive
  └─ Sizes: sm, md, lg

• Card (src/components/ui/card.tsx)
  └─ Structure: Card → CardHeader → CardTitle → CardContent
  └─ Used for: Test cards, stats cards

• Dialog (src/components/ui/dialog.tsx)
  └─ Modal/popup windows
  └─ Used for: Lock modal, results modal

• Progress (src/components/ui/progress.tsx)
  └─ Progress bars
  └─ Used for: Subject mastery, timer

• ScrollArea (src/components/ui/scroll-area.tsx)
  └─ Custom scrollbars
  └─ Used for: Test history list, topic list

Usage Example:
──────────────
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

<Card>
    <CardContent>
        <Button variant="outline" size="lg">
            Click Me
        </Button>
    </CardContent>
</Card>

────────────────────────────────────────────────────────────────

Pattern 3: Animation with Framer Motion
────────────────────────────────────────

Library: framer-motion
Used for: Page transitions, card animations, loaders

Example: Card Hover Effect
───────────────────────────
import { motion } from 'framer-motion';

<motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ duration: 0.2 }}
>
    <Card>...</Card>
</motion.div>

Example: Staggered List
───────────────────────
{items.map((item, index) => (
    <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
    >
        <TestCard data={item} />
    </motion.div>
))}

Benefits:
✓ Smooth animations (60fps)
✓ Declarative API
✓ Exit animations (AnimatePresence)

────────────────────────────────────────────────────────────────

Pattern 4: Conditional Rendering (Lock Logic)
──────────────────────────────────────────────

Example: Topic Lock
───────────────────
const isLocked = !user.isSubscribed && topic.order > 5;

<div className={isLocked ? 'opacity-50 cursor-not-allowed' : ''}>
    <TopicCard
        title={topic.title}
        onClick={isLocked ? () => setPaywallOpen(true) : handleClick}
    />
    {isLocked && (
        <Badge>
            <Lock className="w-3 h-3" /> Premium
        </Badge>
    )}
</div>

Pattern: Lock Overlay
─────────────────────
• Free users see all content (blurred/locked)
• Click → Paywall modal
• Pro users see no locks

────────────────────────────────────────────────────────────────

Pattern 5: Language Toggle (i18n)
──────────────────────────────────

Global State: useSettingsStore → language ('hi' | 'en')

Usage in Components:
────────────────────
const { language } = useSettingsStore();

const title = language === 'hi' 
    ? question.questionText 
    : question.questionTextEn || question.questionText;

return <h2>{title}</h2>;

Fallback Strategy:
──────────────────
If English translation missing → Fall back to Hindi
questionTextEn || questionText

Toggle Button:
──────────────
<Button onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}>
    {language === 'hi' ? 'English' : 'हिंदी'}
</Button>

────────────────────────────────────────────────────────────────

Pattern 6: Loading States
──────────────────────────

Server Component Loading:
─────────────────────────
File: src/app/dashboard/loading.tsx

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
    );
}

• Automatically shown while server component fetches data
• Next.js Suspense boundary

Client Component Loading:
──────────────────────────
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    fetchData().then(() => setIsLoading(false));
}, []);

if (isLoading) return <Skeleton />;

────────────────────────────────────────────────────────────────

Pattern 7: Error Handling
──────────────────────────

Try-Catch in Server Actions:
────────────────────────────
try {
    const data = await db.select()...;
    return { success: true, data };
} catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Failed to fetch" };
}

Toast Notifications:
────────────────────
import { toast } from 'sonner';

const handleSubmit = async () => {
    const result = await submitTest();
    
    if (result.success) {
        toast.success("Test submitted successfully!");
    } else {
        toast.error("Submission failed. Please try again.");
    }
};

Error Boundaries (Future):
──────────────────────────
// error.tsx in app directory
export default function Error({ error, reset }) {
    return (
        <div>
            <h2>Something went wrong!</h2>
            <button onClick={reset}>Try again</button>
        </div>
    );
}
```

### 🎨 Design System

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         DESIGN TOKENS                                     │
└──────────────────────────────────────────────────────────────────────────┘

Colors (Tailwind Classes):
───────────────────────────
Primary:   indigo-600, indigo-500
Secondary: slate-900, slate-800
Success:   emerald-600, green-500
Warning:   amber-600, yellow-500
Error:     red-600, red-500

Background:
───────────
Light:     slate-50 (main background)
Card:      white
Hover:     slate-100

Text:
─────
Heading:   slate-900 (dark)
Body:      slate-700
Muted:     slate-500, slate-400

Typography:
───────────
Font Family:
• Body: Outfit (--font-outfit)
• Display/Headings: Playfair Display (--font-playfair)

Sizes:
• text-xs (12px)
• text-sm (14px)
• text-base (16px)
• text-lg (18px)
• text-xl (20px)
• text-2xl (24px)
• text-3xl (30px)

Spacing:
────────
• p-4 (16px padding)
• gap-4 (16px gap in flex/grid)
• space-y-4 (16px vertical margin)

Common spacing: 2, 4, 6, 8, 12, 16

Border Radius:
──────────────
• rounded-lg (8px) - Cards, buttons
• rounded-xl (12px) - Large cards
• rounded-full (50%) - Avatars, pills

Shadows:
────────
• shadow-sm - Subtle elevation
• shadow-md - Cards on hover
• shadow-lg - Modals, dropdowns
• shadow-xl - Hero sections

Animations:
───────────
• transition-all - Smooth property changes
• duration-200 - Fast (hover effects)
• duration-300 - Medium (page transitions)
• ease-in-out - Natural easing

Custom Animations (Tailwind):
• animate-spin - Loading spinners
• animate-pulse - Skeleton loaders
```

---

## 🎯 Quick Reference Cheat Sheet

### Most Common Tasks

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      DEVELOPER QUICK GUIDE                                │
└──────────────────────────────────────────────────────────────────────────┘

Task 1: Add a New Test
──────────────────────
1. Admin uploads via: /admin/upload
2. Data saved to: tests + questions tables
3. Cache invalidation: revalidateTag('tests')
4. Test appears in: Respective listing page (FLT/CSAT/PYQ)

Task 2: Modify Scoring Logic
─────────────────────────────
File: src/lib/quiz-scoring.ts
Change: SCORING_CONFIG values
Effect: All future tests use new scoring

Task 3: Change Plan Limits
───────────────────────────
File: src/config/plans.ts
Change: PLAN_LIMITS values
Effect: Lock logic updates immediately

Task 4: Add New Subject to Mastery
───────────────────────────────────
1. Add subject field to questions when uploading
2. Analytics automatically picks up new subjects
3. No code change needed!

Task 5: Invalidate Cache Manually
──────────────────────────────────
Method 1: API endpoint
POST /api/revalidate
Body: { tag: 'tests' }

Method 2: In code
import { revalidateTag } from 'next/cache';
revalidateTag('analytics-user_123');

Task 6: Debug User Issue
─────────────────────────
1. Check cookie: mppsc_token in browser DevTools
2. Check DB: SELECT * FROM mppsc_users WHERE id = 'xxx'
3. Check attempts: SELECT * FROM user_attempts WHERE userId = 'xxx'
4. Logs: Check server console for errors

Task 7: Add New Route
──────────────────────
1. Create: src/app/new-route/page.tsx
2. Export default async function
3. Auto-routed: http://localhost:3000/new-route

Task 8: Modify Dashboard
─────────────────────────
Files:
• Data: src/actions/analytics-actions.ts
• UI: src/app/syllabus/analytics/AnalyticsDashboardClient.tsx

Task 9: Change Quiz Timer
─────────────────────────
File: Database tests.durationMinutes
OR
Override in: useQuizLogic({ timeLimitInMinutes })

Task 10: Deploy Changes
────────────────────────
1. Commit: git commit -m "Your changes"
2. Push: git push origin main
3. Vercel auto-deploys (if configured)
4. Run migrations if schema changed: npx drizzle-kit push
```

---

## 🚀 Performance Optimization Tips

```
Current Optimizations:
──────────────────────
✅ unstable_cache() for expensive queries
✅ Drizzle ORM with relations (efficient queries)
✅ Server components (reduce client JS)
✅ Static data in syllabusData.ts
✅ Zustand for minimal re-renders

Future Improvements:
────────────────────
⚡ Add ISR (Incremental Static Regeneration) for test pages
⚡ Implement pagination for test history
⚡ Use React.memo for expensive components
⚡ Lazy load quiz components
⚡ Add service worker for offline support
⚡ Optimize images with next/image
⚡ Split large JSON data (syllabusData.ts)
```

---

## 📚 Key Takeaways

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    PROJECT PHILOSOPHY                                     │
└──────────────────────────────────────────────────────────────────────────┘

1. Server-First Architecture
   • Data fetching on server
   • Client only for interactivity
   • Security + Performance

2. Type Safety Everywhere
   • TypeScript strict mode
   • Drizzle ORM type inference
   • No "any" types

3. Single Source of Truth
   • Database for persistent data
   • Zustand for global client state
   • No duplicate state

4. Caching Strategy
   • Aggressive caching for read-heavy data
   • Short TTLs for user-specific data
   • Manual invalidation for admin changes

5. Component Reusability
   • useQuizLogic for all test types
   • shadcn/ui for consistent design
   • Server/Client pattern for data flow

6. Developer Experience
   • Clear folder structure
   • Consistent naming conventions
   • Comments in critical sections
```

---

## 🎓 Conclusion

**Bhai, ab tumhare paas complete project ka 30-years-experience wala knowledge hai!**

Yeh guide tumhe help karega:
- 🔍 Kisi bhi feature ko quickly locate karne mein
- 🛠️ Changes karne mein confidently
- 🐛 Bugs debug karne mein efficiently
- 🚀 New features add karne mein properly

Agar koi specific part aur detail mein chahiye, just ask! Main tumhe uski separate deep-dive document bana dunga.

**Happy Coding! 🎉**

