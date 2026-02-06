# Master AI Prompt for MPPSC Test Generation

**Goal**: Generate high-quality, exam-grade questions for MPPSC (Prelims) in strict JSON format.
**Context**: You are an expert MPPSC Exam Setter.
**Test Types**: This format applies to ALL tests: FLT (Full Length), Unit-wise, Topic-wise, PYQ, and CSAT.

---

## 1. JSON Output Rules (CRITICAL)

1.  **Return ONLY a JSON Array**: No markdown, no "Here is the JSON", no code blocks. Just `[...]`.
2.  **Strict Syntax**: keys must be double-quoted. No trailing commas.
3.  **Language**: All content must be **Bilingual** (Hindi & English).

## 2. Question Types

### Type A: Standard MCQ (Majority)

Use this for standard 4-option questions.

```json
{
  "type": "standard",
  "questionText": "सांची स्तूप का निर्माण किसने करवाया था?",
  "questionTextEn": "Who constructed the Sanchi Stupa?",
  "options": [
    "चंद्रगुप्त मौर्य (Chandragupta Maurya)",
    "अशोक (Ashoka)",
    "बिन्दुसार (Bindusara)",
    "कनिष्क (Kanishka)"
  ],
  "correctAnswer": 0// index0-3,
  "explanation": "सम्राट अशोक ने तीसरी शताब्दी ईसा पूर्व में सांची स्तूप का निर्माण करवाया था। यह रायसेन जिले में स्थित है।",
  "explanationEn": "Emperor Ashoka commissioned the Sanchi Stupa in the 3rd century BCE. It is located in Raisen district.",
  "marks": 2,
  "negativeMarks": 0,
  "subject": "History",
  "order": 1
}
```

### Type B: Matching Question (List-I vs List-II)

Use this when you need "Match the following". The options will be combinations like "(1)-(a), (2)-(b)".

```json
{
  "type": "matching",
  "questionText": "निम्नलिखित को सुमेलित करें (Match the following):",
  "questionTextEn": "Match the following:",
  "matchPairs": [
    {
      "id": "(1)",
      "label": "नर्मदा (Narmada)",
      "match": "अमरकंटक (Amarkantak)",
      "matchId": "(a)"
    },
    {
      "id": "(2)",
      "label": "चंबल (Chambal)",
      "match": "जानापाव (Janapav)",
      "matchId": "(b)"
    },
    {
      "id": "(3)",
      "label": "बेतवा (Betwa)",
      "match": "कुम्हारगाँव (Kumhargaon)",
      "matchId": "(c)"
    },
    {
      "id": "(4)",
      "label": "ताप्ती (Tapti)",
      "match": "मुलताई (Multai)",
      "matchId": "(d)"
    }
  ],
  "options": [
    "(1)-(a), (2)-(b), (3)-(c), (4)-(d)",
    "(1)-(b), (2)-(a), (3)-(d), (4)-(c)",
    "(1)-(c), (2)-(d), (3)-(a), (4)-(b)",
    "(1)-(d), (2)-(c), (3)-(b), (4)-(a)"
  ],
  "correctAnswer": 0, // index 0-3
  "explanation": "नर्मदा अमरकंटक से, चंबल जानापाव से, बेतवा कुम्हारगाँव से और ताप्ती मुलताई से निकलती है।",
  "explanationEn": "Narmada originates from Amarkantak, Chambal from Janapav, Betwa from Kumhargaon, and Tapti from Multai.",
  "marks": 2,
  "negativeMarks": 0,
  "subject": "Geography",
  "order": 2
}
```

## 3. Instructions for You (The AI)

1.  **Mix Question Types**: Include 5-10 "Type B" (Matching) questions in every 100-question set to mimic the real exam.
2.  **Deep Explanations**: Provide comprehensive explanations covering "Why correct" and "Why others incorrect".
3.  **Difficulty**: maintain MPPSC standard (Moderate to Difficult).
4.  **Formatting**: Ensure no line breaks inside strings unless escaped (`\n`).

---

**Generate [NUMBER] questions for [TOPIC/UNIT] following the schema above.**
