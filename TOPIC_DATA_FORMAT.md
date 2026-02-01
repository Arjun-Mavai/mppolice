# Syllabus Data Generation Guide (AI Prompt)

Use this guide to generate bulk data for the Syllabus Topics database. We need rich, bilingual content for MPPSC aspirants.

## JSON Structure

The output should be a JSON object containing an array of topics.

```json
{
  "unitId": "unit_1",
  "topics": [
    {
      "id": "u1_t1",
      "title": "प्राचीन भारतीय ज्ञान परंपरा",
      "titleEn": "Ancient Indian Knowledge Tradition",
      "order": 1,
      "isFree": true,
      "imgUrl": "https://example.com/image.jpg",
      "content": {
        "front": "प्राचीन भारतीय ज्ञान परंपरा",
        "back": "यह हमारे पूर्वजों की सोचने की शक्ति और विज्ञान है...",
        "details": "• वेद: ज्ञान का भंडार\n• उपनिषद: दर्शन\n• आरण्यक: वन ग्रंथ",
        "mnemonic": "Trick: R-S-Y-A (Rishabh Sings Yearly Always)",
        "impact_emoji": "🕉️",
        "important_facts": ["Fact 1", "Fact 2"]
      },
      "contentEn": {
        "front": "Ancient Indian Knowledge Tradition",
        "back": "The foundational wisdom of our ancestors...",
        "details": "• Vedas: Repository of knowledge\n• Upanishads: Philosophy",
        "mnemonic": "Trick: R-S-Y-A",
        "impact_emoji": "🕉️",
        "important_facts": ["Fact 1", "Fact 2"]
      }
    }
  ]
}
```

## AI Prompt

**Copy and paste this prompt to an AI (like Gemini/ChatGPT):**

> Act as an expert MPPSC Faculty. Create a detailed JSON data set for **Unit [NUMBER]: [UNIT NAME]**.
>
> **Requirements:**
>
> 1.  **Format**: Strictly follow the JSON structure provided below.
> 2.  **Content Style**: High-quality, exam-oriented, crisp point-wise details.
> 3.  **Bilingual**: Provide both Hindi (`content`) and English (`contentEn`).
> 4.  **Cards**:
>     - `front`: A catchy title/headline.
>     - `back`: A strong 2-line summary.
>     - `details`: 3-5 bullet points covering key facts (Use `•` for bullets).
>     - `mnemonic`: A smart memory trick (optional but preferred).
>     - `important_facts`: Array of 2-3 high-yield facts (e.g., Dates, Founders).
> 5.  **Logic**:
>     - `isFree`: Set `true` for the first 10 topics of Unit 1 ONLY. Set `false` for others.
>     - `order`: Sequential (1, 2, 3...).
>     - `id`: Unique string (e.g., `unit_1_topic_1`).
>
> **JSON Structure Template:**
> [INSERT JSON STRUCTURE HERE]

## Upload Instructions

1.  Go to `/admin/upload-syllabus`.
2.  Login as Admin/Pro User.
3.  Paste the generated JSON.
4.  Click "Upload".
