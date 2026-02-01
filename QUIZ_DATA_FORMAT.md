# MPPSC Quiz Data Format Guide

This guide explains how to structure quiz data for the MPPSC Syllabus App. You can use this format to generate questions using AI tools like ChatGPT or Claude.

## JSON Data Structure

The system expects an array of "Question" objects.

```json
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": [
      "Option A text",
      "Option B text",
      "Option C text",
      "Option D text"
    ],
    "correctAnswer": 0, // 0 for Option A, 1 for B, 2 for C, 3 for D
    "explanation": "Detailed explanation of why the answer is correct.",
    "marks": 2, // Standard marks for MPPSC
    "negativeMarks": 0 // Usually 0 for MPPSC, or 0.33 if applicable
  }
]
```

## AI Prompt Template

Copy and paste the following prompt into ChatGPT/Claude to generate valid data:

> **Prompt:**
> "Generate 100 high-quality multiple-choice questions for [INSERT TOPIC HERE, e.g., MP History / MP Geography] for the MPPSC Exam.
> Output the result strictly as a JSON array.
> Each object in the array should have the following fields:
>
> - `question` (string): The question text in English.
> - `options` (array of 4 strings): The four answer choices.
> - `correctAnswer` (number): The 0-indexed index of the correct option (0-3).
> - `explanation` (string): A helpful explanation of the answer.
> - `marks` (number): Set to 2.
> - `negativeMarks` (number): Set to 0.
>
> Ensure the difficulty level matches MPPSC Prelims standards. Do not wrap in markdown code blocks."

## Database Table Reference

For referencing, here is how the data maps to our `questions` table:

| JSON Key        | Database Column  | Type    | Notes                                                            |
| :-------------- | :--------------- | :------ | :--------------------------------------------------------------- |
| `question`      | `question_text`  | TEXT    | The main question                                                |
| `options`       | `options`        | JSON    | Stored as a JSON array                                           |
| `correctAnswer` | `correct_answer` | TEXT    | We convert the index to a string if needed, or store it directly |
| `explanation`   | `explanation`    | TEXT    | Shown after the user answers                                     |
| `marks`         | `marks`          | INTEGER | Points for correct answer                                        |
| `negativeMarks` | `negative_marks` | REAL    | Points deducted for wrong answer                                 |

## Uploading Data

Once you have the JSON file:

1. Place it in `src/data/imports/` (create this folder if needed).
2. Run the seed script (instructions provided in `README.md`) or use the admin upload form (future feature).
