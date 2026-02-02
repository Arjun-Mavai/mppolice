# MPPSC Topic Test Generator Prompt

Use this prompt to generate JSON data for the "Topic Quick Check" feature in the Admin Dashboard at `/admin/upload`.

## Goal

Generate 10 High-Quality Bilingual MCQs for a specific topic from the MPPSC Syllabus, strictly following the **Universal JSON Schema**.

## Input Data

- **Unit**: [e.g. Unit 1]
- **Topic**: [e.g. 1.1 Concept of Bharatvarsha]
- **Style**: MPPSC 2026 Pattern (Statement-based, Match columns, Conceptual)

## Output Format (RAW JSON)

Return ONLY a valid JSON array. Valid keys are crucial.

```json
[
  {
    "questionText": "प्रश्न हिंदी में? (Question in Hindi)",
    "questionTextEn": "Question in English?",
    "options": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
    "correctAnswer": "विकल्प A",
    "explanation": "विस्तृत व्याख्या हिंदी में। **💡 Exam Fact**: ... **🧠 Memory Tip**: ... **🚫 Scam Alert**: ...",
    "explanationEn": "Detailed explanation in English. **💡 Exam Fact**: ... **🧠 Memory Tip**: ... **🚫 Scam Alert**: ...",
    "marks": 3,
    "negativeMarks": 1,
    "idealTime": 60,
    "subject": "Unit Subject",
    "order": 1
  }
]
```

## Critical Instructions for AI

### 1. Structure & Fields

- **Bilingual Questions**: You MUST provide `questionText` (Hindi) and `questionTextEn` (English) separately.
- **Bilingual Explanations**: You MUST provide `explanation` (Hindi) and `explanationEn` (English).
- **Options**: Provide 4 options in the `options` array. If terms are technical, use "Hindi (English)" format within the string.
- **Correct Answer**: Must exactly match one of the `options`.

### 2. "Marketing Gimmick" Explanation Style (MANDATORY)

The explanation is the USP. It must feel like a premium note.
For **BOTH** Hindi and English explanations, use Markdown to include:

1.  **✅ Correct Logic**: Direct reasoning.
2.  **💡 Exam Fact (High Value)**: A relevant, high-yield fact often asked in MPPSC.
3.  **🧠 Memory Tip (Mnemonic)**: A trick to remember the fact (e.g., "PADMA" for rivers).
4.  **🚫 Scam Alert (Elimination)**: Why other options are wrong or common confusion points.

### 3. MPPSC 2026 Config

- **Marks**: 3 per question.
- **Negative Marking**: 1.
- **Difficulty**: Mix of Factual (One-liners) and Conceptual (Statement/Assertion).

## How to use

1. Copy this prompt to ChatGPT/Claude/DeepSeek.
2. Replace `[Unit]` and `[Topic]` with your target.
3. Copy the resulting JSON.
4. Go to **Admin > Upload**.
5. Select **Topic Check**.
6. Paste JSON and Upload.

---

# 🏗️ System Design & Data Flow (Architecture Learning)

Understanding how the "Topic Test" system works from Database to UI.

## 1. Database Schema (`src/db/schema.ts`)

We use **SQLite** (via Turso/LibSQL) with **Drizzle ORM** for type-safe database interactions.

### Key Tables Involved:

1.  **`tests` Table**:
    - **Role**: Acts as the container or "Folder" for a set of questions.
    - **Key Fields**:
      - `id`: Unique identifier (e.g., `test_123`).
      - `type`: Set to `'TOPIC'` for these tests (other types: `FLT`, `UNIT`).
      - `unitId` & `topicId`: Metadata to link this test to a specific syllabus node (e.g., `unit_1`, `topic_1_1`). This allows us to find "The test for Topic 1.1".
      - `isPro`: If true, only paid users can access.

2.  **`questions` Table**:
    - **Role**: Stores individual MCQs.
    - **Relation**: Linked to `tests` via `testId`. One Test -> Many Questions.
    - **Bilingual Storage**: We store Hindi (`questionText`) and English (`questionTextEn`) separately to allow instant toggling.
    - **Premium Data**: `explanation` field stores the rich markdown with "Marketing Gimmick" sections.

3.  **`user_attempts` Table**:
    - **Role**: Records a user's session when they take a test.
    - **Relation**: Links `userId` + `testId`.
    - **Fields**: `score`, `startTime`, `endTime`. Used to calculate accuracy and show history.

## 2. Data Flow: How it Connects

### Step A: Creation (Admin Side)

1.  **Admin** generates JSON using the AI Prompt above.
2.  **Admin Uploads** via `/admin/upload`.
3.  **Backend Action** (`uploadQuestions` in `admin-actions.ts`):
    - Creates a new entry in `tests` table (Type: `TOPIC`, Name: "Topic 1.1 Test").
    - Iterates through the JSON and inserts rows into `questions` table, linking them to the new `testId`.

### Step B: Discovery (User Side)

1.  **User** visits `/syllabus/quiz/topic`.
2.  **Frontend** renders the Syllabus Tree (from `syllabusData.ts` hardcoded structure).
3.  **User Clicks** a Topic (e.g., "Concept of Bharatvarsha").
4.  **Navigation**: Router pushes to `/syllabus/quiz/play?mode=topic&unitId=unit_1&topicId=topic_1_1`.

### Step C: Execution (Play Page)

1.  **Server Component** (`QuizPlayPage`):
    - Reads `topicId` from URL.
    - **Query**: "Find a test in `tests` table where `type='TOPIC'` AND `topicId='topic_1_1'`".
    - If found: Fetches all associated questions.
    - If NOT found: Falls back to generating random questions from a global pool or shows "No Test Available".
2.  **Client Component** (`QuizInterface`):
    - Receives the questions payload.
    - Manages the timer, option selection, and "Premium Explanation" rendering.

### Step D: Analytics (History)

1.  **Submission**: User submits test.
2.  **Save**: Data written to `user_attempts`.
3.  **Review**: User visits `/syllabus/analytics/history/[id]`.
4.  **Fetch**: We pull the `questions` again (for text) and the `attempt_answers` (for user's choice) to show the detailed report.

## 3. Why this Design? (System Design Principles)

- **Normalization**: Questions are separate from Tests. This allows us to potentially reuse questions in different tests (e.g., a "Mega Mock" could reuse questions from "Topic Tests" by reference, though currently we copy).
- **Metadata Tagging**: By adding `topicId` to the `tests` table, we decouple the "Content" (Questions) from the "Structure" (Syllabus). We can change the Syllabus hierarchy without breaking the database, as long as IDs map correctly.
- **Client-Side Rendering (CSR) for Quiz**: The actual test interface is CSR (`use client`) for immediate interaction (instant feedback, timer), while Data Fetching is SSR (Server Side) for performance and SEO.
