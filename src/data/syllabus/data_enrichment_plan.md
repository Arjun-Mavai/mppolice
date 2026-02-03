# Syllabus Data Enrichment Plan (Bulk Update)

This document outlines the strategy to bulk update MPPSC syllabus topics with rich, AI-generated content (Points, PYQs, Strategies) for both Hindi and English mediums.

## 1. The Data Structure (JSON)

We need a unified JSON structure that the AI will generate. This structure corresponds to the `content` (Hindi) and `contentEn` (English) columns in our `syllabus_topics` database table.

**The Goal**: A single JSON object per topic that drives the `FlipCard` and `SyllabusTopicSheet`.

### JSON Schema

```json
[
  {
    "id": "topic_unique_id_from_db",
    "content_hindi": {
      "front": "होलकर राजवंश (Holkar Dynasty)",
      "content": "इंदौर के मराठा शासक। मल्हार राव होलकर द्वारा स्थापित।",
      "points": [
        "संस्थापक: मल्हार राव होलकर (1732)",
        "राजधानी: इंदौर (अहिल्या बाई द्वारा महेश्वर से स्थानांतरित)",
        "महत्वपूर्ण युद्ध: महिदपुर का युद्ध (1817)"
      ],
      "pyq": [
        {
          "year": 2021,
          "question": "अहिल्या बाई की राजधानी क्या थी?",
          "strategy": "धार्मिक राजधानी याद रखें - महेश्वर (नर्मदा तट)"
        }
      ],
      "mnemonic": "M-A-M (मल्हार - अहिल्या - महिदपुर)",
      "impact_emoji": "⚔️"
    },
    "content_english": {
      "front": "Holkar Dynasty",
      "content": "Maratha rulers of Indore. Founded by Malhar Rao Holkar.",
      "points": [
        "Founder: Malhar Rao Holkar (1732)",
        "Capital: Indore (Shifted from Maheshwar by Ahilya Bai)",
        "Battle: Battle of Mahidpur (1817)"
      ],
      "pyq": [
        {
          "year": 2021,
          "question": "What was the capital of Ahilya Bai?",
          "strategy": "Remember Religious Capital - Maheshwar"
        }
      ],
      "mnemonic": "M-A-M (Malhar - Ahilya - Mahidpur)",
      "impact_emoji": "⚔️"
    }
  }
]
```

## 2. The Workflow: How to Execute?

### Step 1: Export Existing Topics Context (Input for AI)

To get accurate results, we first need to give the AI the list of topics we want to enrich.

- **Action**: I will create a small script/helper to log all `id` and `title` from your `syllabusData.ts`.
- **Result**: A clean list like:
  ```json
  [
    { "id": "unit_1_topic_1", "title": "History of MP: Major Dynasties" },
    { "id": "unit_1_topic_2", "title": "Independence Movement in MP" }
  ]
  ```

### Step 2: AI Generation (The Magic)

You will upload the list from Step 1 into an AI (ChatGPT/Claude/Gemini) with the **Enrichment Prompt** below.

- **Action**: Paste the Prompt + The Topic List.
- **Result**: The AI will return the `enriched_syllabus_data.json` with all the fields filled out.

### Step 3: Bulk Upload (The Database Update)

We need a way to take that big JSON file and save it to the database.

- **Action**: Go to `/admin/export-syllabus` (Scroll to the bottom).
- **Method**:
  1. Paste your Admin Secret Key.
  2. Paste the AI JSON into the text box.
  3. Click "Upload & Enrich Syllabus".
  4. The system will handle the API call and update the database.

## 3. The AI Prompt

**Copy and Paste this to the AI:**

> **Role**: Expert MPPSC Exam Content Creator.
> **Task**: Enhance the provided list of Syllabus Topics with high-yield exam content for our app.
>
> **Input Data**:
> [PASTE YOUR JSON LIST OF TOPICS HERE]
>
> **Output Requirement**:
> Return a single VALID JSON array. For each topic in the input, create an object with `id`, `content_hindi`, and `content_english`.
>
> **Specific Rules**:
>
> 1. **Points**: Give exactly 3 high-yield bullet points (Facts, Dates, Names).
> 2. **PYQ**: Provide 1 real or model question (2020-2024 style) with a short "Strategy" (2-5 words).
> 3. **Mnemonic**: One creative memory aid.
> 4. **Tone**: Crisp, professional, coaching institute style.
>
> **Format Reference**:
>
> ```json
> [
>   {
>     "id": "OUTPUT_SAME_ID_AS_INPUT",
>     "content_hindi": {
>       "front": "...",
>       "points": ["..."],
>       "pyq": [{ "year": 2022, "question": "...", "strategy": "..." }],
>       "mnemonic": "...",
>       "impact_emoji": "🦁"
>     },
>     "content_english": {
>       "front": "...",
>       "points": ["..."],
>       "pyq": [{ "year": 2022, "question": "...", "strategy": "..." }],
>       "mnemonic": "...",
>       "impact_emoji": "🦁"
>     }
>   }
> ]
> ```

## 4. The "Secret" to Perfect Mapping (How it works)

You might ask: _"How does the system know which line belongs to which topic?"_

The answer is the **`id`**.

1.  **Export**: When you copy the JSON from the tool, each topic has a unique `id` (e.g., `unit_1_t1` or a long code `21bb3b...`).
2.  **AI Generation**: The AI **MUST** return that same `id` in its output. (The prompt tells it to do this).
3.  **Upload**:
    - The system reads the imported JSON list.
    - It takes the first item.
    - It looks at the `id`.
    - It searches the database for that exact ID.
    - It saves the new `content_hindi` and `content_english` into that specific row.

**Why this is safe:**
Even if the AI changes the order, or you sort the list, as long as the `id` is correct, the content will go to the right place.
