# 🗄️ COMPLETE DATABASE ARCHITECTURE - Saari Tables Connected

> **Bhai, ab tumhe COMPLETE database ki picture mil jayegi - har table, har connection, har dot connected!**

---

## 🌐 Quick Overview

```
TOTAL TABLES: 11

👤 USER MANAGEMENT (2)
  - mppsc_users (Identity)
  - topic_revisions (Study progress)

📝 TEST SYSTEM (4) ← CORE HEART
  - tests (Blueprints)
  - questions (Question bank)
  - user_attempts (❤️ Main data)
  - attempt_answers (Detailed breakdown)

📚 CONTENT (2)
  - syllabus_topics (Flashcards)
  - content_blogs (Blogs)

💼 BUSINESS (3)
  - support_tickets
  - payment_exit_reasons
```

---

## 🔗 THE BIG PICTURE - All Connected

```
                    ┌──────────────────┐
                    │   mppsc_users    │ ← Identity Card
                    │    (Master)      │
                    ├──────────────────┤
                    │ • id (PK)        │
                    │ • email          │
                    │ • isSubscribed   │
                    │ • planTier       │
                    └────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            │ 1:N            │ 1:N            │ 1:N
            ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │user_attempts │  │topic_        │  │support_      │
    │ (Test data)  │  │revisions     │  │tickets       │
    └──────┬───────┘  └──────────────┘  └──────────────┘
           │
           │ 1:N (har attempt → multiple answers)
           ▼
    ┌──────────────┐
    │attempt_      │
    │answers       │ 
    └──────┬───────┘
           │
           │ N:1 (har answer → 1 question)
           ▼
    ┌──────────────┐         ┌─────────────┐
    │  questions   │◄────────│   tests     │ ← Blueprint
    │              │  1:N    │             │
    └──────────────┘         ├─────────────┤
                             │ • id (PK)   │
             ┌───────────────┤ • type 🎯   │
             │               │ • topicId   │
             │               └──────┬──────┘
             │                      │
             │ Link                 │ Link
             ▼                      ▼
    ┌─────────────────┐    ┌─────────────────┐
    │syllabus_topics  │    │content_blogs    │
    │  (Flashcards)   │    │  (Extras)       │
    └─────────────────┘    └─────────────────┘
```

---

## 🎯 CORE FLOW - User Takes Test

```
JOURNEY: Arjun History Test Deta Hai
─────────────────────────────────────

Step 1: SELECT TEST
User: "Main History ka test dena chahta hoon"
↓
Query: SELECT * FROM tests WHERE unitId = 'unit_1' AND type = 'TOPIC';
↓
Shows: ["भारतीय इतिहास", "राजव्यवस्था", ...]


Step 2: LOAD QUESTIONS
User clicks: "भारतीय इतिहास" (test_hist_101)
↓
Query: SELECT * FROM questions WHERE testId = 'test_hist_101' ORDER BY "order";
↓
Loads: 10 questions with options


Step 3: USER ANSWERS (Client)
Quiz UI active, user selects answers:
{
  q_1: 0,    ← Option 0
  q_2: 0,
  // q_3 skipped
  q_4: 2,
  ...
}


Step 4: SUBMIT → DATABASE
BEGIN TRANSACTION;

INSERT INTO user_attempts → 1 row
  (attempt_abc_123, user_arjun_123, test_hist_101, ..., 10.67)

INSERT INTO attempt_answers → 8 rows (2 skipped)
  (ans_1, attempt_abc_123, q_1, 0, true, 45)
  (ans_2, attempt_abc_123, q_2, 0, true, 30)
  -- q_3 skip, no row!
  (ans_3, attempt_abc_123, q_4, 2, false, 40)
  ...

COMMIT;


Step 5: DASHBOARD
Query: Get latest attempt per test
↓
Shows: "🟡 53% │ भारतीय इतिहास"


Step 6: REVIEW
Query: Merge questions + user answers
↓
Shows: Question-by-question breakdown
```

---

## 🔥 KEY TABLE DETAILS

### 1. mppsc_users (Identity)

```sql
CREATE TABLE mppsc_users (
    id TEXT PRIMARY KEY,        -- "user_arjun_123"
    email TEXT UNIQUE,          -- Login ID
    name TEXT,                  -- Display name
    isSubscribed INTEGER,       -- 0 or 1
    planTier TEXT,              -- 'free', 'lite', 'pro'
    role TEXT                   -- 'guest' or 'admin'
);
```

**Purpose**: Har user ki basic info

**Connections**:
- → user_attempts (kis user ka attempt)
- → topic_revisions (kis user ne padha)
- → support_tickets (kaun contact kar raha)

---

### 2. tests (Blueprint)

```sql
CREATE TABLE tests (
    id TEXT PRIMARY KEY,        -- "test_hist_101"
    title TEXT,                 -- "भारतीय इतिहास"
    type TEXT,                  -- 'TOPIC'|'UNIT'|'FLT'|'CSAT'|'PYQ' 🔥
    totalQuestions INTEGER,
    totalMarks INTEGER,
    durationMinutes INTEGER,
    unitId TEXT,                -- Link to unit (optional)
    topicId TEXT                -- Link to topic (optional)
);
```

**Purpose**: Test ka structure define karta hai

**Types**:
- TOPIC → Single topic quiz (unitId + topicId)
- UNIT → Full unit test (unitId only)
- FLT → All units combined
- CSAT → Aptitude test
- PYQ → Previous year paper

---

### 3. questions (Question Bank)

```sql
CREATE TABLE questions (
    id TEXT PRIMARY KEY,
    testId TEXT,                -- FK → tests.id
    questionText TEXT,          -- Hindi
    questionTextEn TEXT,        -- English
    options TEXT,               -- JSON array
    correctAnswer TEXT,         -- "0", "1", "2", "3"
    subject TEXT,               -- "History", "Polity"
    "order" INTEGER
);
```

**Purpose**: Har test ke saare questions

**Connection**: testId → tests.id

---

### 4. user_attempts ❤️ (The Heart)

```sql
CREATE TABLE user_attempts (
    id TEXT PRIMARY KEY,        -- "attempt_abc_123"
    userId TEXT,                -- FK → mppsc_users.id
    testId TEXT,                -- FK → tests.id
    startTime INTEGER,
    endTime INTEGER,
    score REAL,                 -- Calculated
    isCompleted INTEGER
);
```

**Purpose**: Har test attempt ka record

**🔥 KEY**: Same user + same test = Multiple rows!

**Example**:
```
Arjun ne test_hist_101 ko 3 baar diya:
- attempt_1 | score: 8.0  | 2024-02-01
- attempt_2 | score: 12.0 | 2024-02-04
- attempt_3 | score: 10.67| 2024-02-06
```

---

### 5. attempt_answers (Detailed)

```sql
CREATE TABLE attempt_answers (
    id TEXT PRIMARY KEY,
    attemptId TEXT,             -- FK → user_attempts.id
    questionId TEXT,            -- FK → questions.id
    userAnswer TEXT,            -- "0", "1", "2", "3"
    isCorrect INTEGER,          -- 0 or 1
    timeTakenSeconds INTEGER
);
```

**Purpose**: Har question ka individual answer

**🔥 KEY**: Skipped question = No row!

**Example**:
```
10 questions, user ne 8 answer kiye:
- 8 rows in attempt_answers
- 2 questions skipped (no rows)
```

---

## 🔗 RELATIONSHIP EXAMPLES

### Example 1: Get User's All Tests

```sql
SELECT 
  t.title,
  ua.score,
  ua.endTime
FROM user_attempts ua
JOIN tests t ON ua.testId = t.id
WHERE ua.userId = 'user_arjun_123'
ORDER BY ua.endTime DESC;
```

**Result**:
```
भारतीय इतिहास   | 10.67 | 2024-02-06
राजव्यवस्था      | 8.0   | 2024-02-05
भूगोल            | 14.0  | 2024-02-03
```

---

### Example 2: Get Question-wise Breakdown

```sql
SELECT 
  q.questionText,
  aa.userAnswer,
  q.correctAnswer,
  aa.isCorrect
FROM questions q
LEFT JOIN attempt_answers aa 
  ON q.id = aa.questionId 
  AND aa.attemptId = 'attempt_abc_123'
WHERE q.testId = 'test_hist_101';
```

**Result**:
```
मौर्य साम्राज्य... | 0 | 0 | true
अशोक किस युद्ध...   | 0 | 0 | true
गुप्त काल में...    | NULL | 2 | NULL  ← Skipped
```

---

### Example 3: Subject-wise Performance

```sql
SELECT 
  q.subject,
  COUNT(*) as total,
  SUM(CASE WHEN aa.isCorrect = 1 THEN 1 ELSE 0 END) as correct
FROM attempt_answers aa
JOIN questions q ON aa.questionId = q.id
WHERE aa.attemptId = 'attempt_abc_123'
GROUP BY q.subject;
```

**Result**:
```
History    | 5 | 4  → 80% accuracy
Polity     | 3 | 2  → 67% accuracy
```

---

## 🎓 SUMMARY

### Data Flow
```
User → Tests → Questions → Answers → Analytics
```

### Key Points
1. **user_attempts**: Har attempt = Ek row (same test dubara = new row)
2. **attempt_answers**: Har answered question = Ek row (skip = no row)
3. **Dashboard**: Latest attempt per test (deduplication)
4. **Review**: All questions + user answers merged (LEFT JOIN)

### Connections
- User 1:N Attempts
- Test 1:N Questions
- Attempt 1:N Answers
- Answer N:1 Question

**Sab clear ho gaya bhai?** 🎯

