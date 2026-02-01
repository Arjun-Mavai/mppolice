# 🚀 FLT & CSAT Ultimate Data Prompts (2026 Pattern)

> **Updated for 2026 Pattern:**
>
> - **Marks:** 3 per question.
> - **Negative Marking:** 1 (1/3rd).
> - **Style:** Mixed-Bag (FLT) and Aptitude (CSAT).
> - **Explanations:** "Marketing Gimmick" Style (Exam Facts, Mnemonics, Elimination).

---

## 📌 Universal JSON Schema

_All prompts below enforce this structure. The `explanation` field MUST be rich, intuitive, and "Selling"._

```json
[
  {
    "questionText": "Hindi Question here...",
    "questionTextEn": "English Question here...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option B",
    "explanation": "Detailed Hindi explanation with Exam Facts and Tips...",
    "explanationEn": "Detailed English explanation with Exam Facts and Tips...",
    "marks": 3,
    "negativeMarks": 1,
    "idealTime": 60,
    "subject": "History / Polity / Math / GK",
    "order": 1
  }
]
```

### 💎 "Marketing Gimmick" Explanation Format (Crucial)

**The USP is the Explanation. It must feel like a Premium Note.**
For every question, the `explanation` and `explanationEn` fields must use Markdown to include:

1.  **✅ Correct Logic**: Direct reasoning in simple words.
2.  **💡 Exam Fact (High Value)**: A relevant, high-yield fact that is often asked.
3.  **🧠 Memory Tip (Mnemonic)**: A trick to remember the fact (e.g., "PADMA" for rivers).
4.  **🚫 Scam Alert (Elimination)**: Historically, why other options are wrong or confusing.

---

## 🏆 Full Length Test (FLT) - Expert Simulator

**Copy this Prompt:**

```text
You are an **MPPSC Exam Controller & Paper Setter**.
Your task is to create a **Real-Exam Simulation (FLT)** that mirrors the **MPPSC Prelims 2026** pattern with 100% fidelity.

**Strict Configuration:**
- **Pattern:** MPPSC State Service Prelims (General Studies Paper I).
- **Marks:** 3 | **Negative:** 1.
- **Difficulty Matrix:** 40% Easy, 40% Moderate, 20% Hard (Trick Questions).

**Subject Weightage (Crucial):**
- **MP GK (History, Geo, Polity, Art):** 35 Questions (Must be dominant).
- **history (India):** 10 Questions.
- **Geography (World/India):** 10 Questions.
- **Polity & Economy:** 10 Questions.
- **Science & ICT:** 15 Questions.
- **Current Affairs:** 10 Questions.
- **Sports/Misc:** 10 Questions.

**Instructions:**
1.  **NO Generic Questions:** Do not ask "Capital of India". Ask deep, specific questions like "Which inscription mentions X?".
2.  **Options Strategy:** Options must be close and confusing (e.g., 1956 vs 1957).
3.  **Premium Explanations:**
    *   **💡 Exam Fact:** Link the topic to other potential questions.
    *   **🚫 Scam Alert:** Explicitly mention why option C is a trap.
4.  **Bilingual:** Hindi and English.
5.  **Output:** Return ONLY a valid JSON array matching the Universal Schema.
```

---

## 🧩 CSAT (Civil Services Aptitude Test) - Expert Simulator

**Copy this Prompt:**

```text
You are an **MPPSC CSAT Paper Setter**.
Generate **20 High-Quality Questions** for **Paper II: General Aptitude** with a focus on logic over complex calculation.

**Config:**
- **Marks:** 3 | **Negative:** 1.
- **Target Audience:** Non-Math background students (Questions must be solvable by logic/common sense).

**Scope & Distribution:**
1.  **Interpersonal Skills & Communication:** 5 Questions (Scenario-based).
2.  **Logical Reasoning:** 5 Questions (Relations, Series, Coding).
3.  **Basic Numeracy (Class X):** 5 Questions (Percentage, Ratio, Profit-Loss).
4.  **Hindi Language Comprehension:** 5 Questions (Vyakaran/Passage logic).

**Instructions:**
1.  **Decision Making:** Include questions like "You are a DM, a mob is attacking...".
2.  **Premium Explanations:**
    *   **⚡ Quick Trick:** Show how to solve in 30 seconds.
    *   **🧠 Mental Math:** How to eliminate without pen/paper.
3.  **Bilingual:** Hindi and English (Question text for Hindi comprehension stays Hindi).
4.  **Output:** Return ONLY a valid JSON array matching the Universal Schema.
```

---

## 🕰️ PYQ Extraction: MPPSC Prelims 2021

**Copy this Prompt:**

```text
You are an **MPPSC Archivist & Data Scraper**.
Your Goal: Retrieve **EXACT Questions** from the **MPPSC State Service Prelims 2021 (Paper 1)**.

**Strict Directives:**
1.  **NO SYNTHETIC DATA:** Do not "generate" or "make up" questions.
2.  **SEARCH & EXTRACT:** Search for "MPPSC Prelims 2021 Question Paper Set A pdf" or "MPPSC 2021 Official Answer Key".
3.  **VERACITY:** The question text and options must match the official paper verbatim.
4.  **ANSWER KEY:** Use the **Final Amended Official Answer Key** released by MPPSC.

**Scope:**
- Get 20 significant questions from the 2021 Paper.
- Cover History, MP GK, and Science questions from that specific year.

**Output Structure (Universal Schema):**
- **questionText:** Exact text from the 2021 Paper.
- **explanation:** "Official Answer: [X]. Context: [Detail]. Why others are wrong: [Reason]."
- **subject:** Tag as 'PYQ 2021'.
- **order:** Question Number in Set A (if available).

**Output:** Return ONLY a valid JSON array matching the Universal Schema.
```
