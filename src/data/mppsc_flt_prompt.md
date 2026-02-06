# 🚀 MPPSC 2026 Full Length Test (FLT) Generator Prompt

> **Objective:** Generate a complete 100-Question Mock Test that mimics the EXACT pattern of MPPSC Prelims 2026.
> **Mix:** 94 Standard Questions + 6 "Match the Column" Questions.
> **Total Marks:** 300 (3 Marks each). Negative Marking: 1 Mark.

---

## 📌 Universal JSON Schema (Mixed Types)

Your output **MUST** be a single JSON array containing 100 objects. You will use two structures:

### Type A: Standard Question (Use for ~94 Questions)

```json
{
  "id": "q1",
  "type": "standard",
  "questionText": "Hindi Question...",
  "questionTextEn": "English Question...",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0, // Index 0-3
  "explanation": "Markdown Hindi explanation with Exam Facts...",
  "explanationEn": "Markdown English explanation with Exam Facts...",
  "marks": 3,
  "negativeMarks": 1,
  "subject": "History",
  "order": 1
}
```

### Type B: Matching Question (Use EXACTLY for 6 Questions)

{
"id": "q40",
"type": "matching",
"questionText": "निम्नलिखित को सुमेलित करें (Match the following):",
"questionTextEn": "Match the following:",
"matchPairs": [
{
"id": "(1)",
"label": "Hindi Item 1",
"labelEn": "Eng Item 1",
"match": "Hindi Match A",
"matchId": "(i)",
"matchEn": "Eng Match A"
},
{
"id": "(2)",
"label": "Hindi Item 2",
"labelEn": "Eng Item 2",
"match": "Hindi Match B",
"matchId": "(ii)",
"matchEn": "Eng Match B"
},
{
"id": "(3)",
"label": "Hindi Item 3",
"labelEn": "Eng Item 3",
"match": "Hindi Match C",
"matchId": "(iii)",
"matchEn": "Eng Match C"
},
{
"id": "(4)",
"label": "Hindi Item 4",
"labelEn": "Eng Item 4",
"match": "Hindi Match D",
"matchId": "(iv)",
"matchEn": "Eng Match D"
}
],
"options": [
"(1)-(ii), (2)-(i), (3)-(iv), (4)-(iii)",
"(1)-(i), (2)-(ii), (3)-(iii), (4)-(iv)",
"...",
"..."
],
"correctAnswer": 0,
"explanation": "...",
"explanationEn": "...",
"marks": 3,
"negativeMarks": 1,
"subject": "Geography",
"order": 40
}

````

---

## 🤖 The Prompt

**Copy and paste this into your AI Model:**

```text
You are the Chief Examiner for MPPSC (Madhya Pradesh Public Service Commission).
Your task is to generate a **High-Difficulty Full Length Test (FLT)** of **100 Questions** for the 2026 Cycle.

**Strict Distribution (Based on Latest Trends):**
1. Unit 1 (India History): 9 Qs
2. Unit 6 (India/MP Economy): 8 Qs
3. Unit 10 (Tribes of MP): 10 Qs
4. Unit 4 (MP Geography): 12 Qs
5. Unit 2 (MP History/Culture): 11 Qs
6. Unit 3 (India Geography): 10 Qs
7. Unit 5 (Polity India/MP): 10 Qs
8. Unit 7 (Science/Env): 10 Qs
9. Unit 8 (Current Affairs): 10 Qs
10. Unit 9 (ICT/Computers): 10 Qs

**Mandatory Requirement: 6 Matching Questions**
- You MUST generate exactly **6 Matching-Type Questions** (Type B schema).
- Distribute them across: Unit 4 (Rivers/Projects), Unit 10 (Tribe-Dance), Unit 1 (Books-Authors), Unit 7 (Institute-City).
- The remaining **94 Questions** must be Standard Multiple Choice (Type A schema).

**Quality Control Instructions (The "Marketing Gimmick"):**
1.  **Explanations:** Every single explanation MUST follow the premium format:
    -   **✅ Correct Logic**: Why option is right.
    -   **💡 Exam Fact**: A high-yield related fact (e.g., "This was also asked in 2019").
    -   **🧠 Memory Tip**: A mnemonic or trick.
    -   **🚫 Scam Alert**: Why the distractor options are wrong.
2.  **Bilingual**: Accurate Hindi and English for ALL fields.
3.  **Correctness**: Double-check logic for matching codes (e.g., if A is 1, make sure option reflects that).

**Output:**
Return ONLY a valid JSON array of 100 objects. Do not include markdown code blocks or introductory text. Start with `[` and end with `]`.
````
