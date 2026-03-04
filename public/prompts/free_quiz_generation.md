# 🎯 MPPSC 2026 Free Quiz — Universal AI Prompt

## How to Use
1. Copy the prompt below
2. Replace `[SUBJECT]` and `[TOPIC]` with your desired subject/topic
3. Replace `[N]` with number of questions (10/20/30)
4. Paste in ChatGPT/Claude/Gemini and get JSON output
5. Upload JSON directly in Admin → Content Manager → Free Quiz (MISC type)

---

## 📚 MPPSC Unit Reference (10 Units)

| Unit | Subject (EN) | Subject (HI) | Key Topics |
|------|-------------|---------------|------------|
| Unit 1 | History of India | भारत का इतिहास | Vedas, Upanishads, Ancient/Medieval India, Reform Movements, Independence Struggle |
| Unit 2 | MP History & Culture | म.प्र. इतिहास एवं संस्कृति | MP History, Culture, Literature, Heritage Sites |
| Unit 3 | Geography of India | भारत का भूगोल | Physical Geography, Climate, Rivers, Soils, Natural Resources |
| Unit 4 | Geography of MP | म.प्र. का भूगोल | MP Rivers, Districts, Minerals, Forests, Climate |
| Unit 5 | Polity & Constitution | संवैधानिक व्यवस्था | Constitution, Governance, Panchayati Raj, MP State System |
| Unit 6 | Economy | अर्थव्यवस्था | Indian Economy, Planning, MP Economy, Budget, Schemes |
| Unit 7 | Science & Environment | विज्ञान एवं पर्यावरण | Physics, Chemistry, Biology, Health, Environment |
| Unit 8 | Current Affairs | समसामयिक घटनाएँ | National, International, MP Current Events |
| Unit 9 | ICT | सूचना प्रौद्योगिकी | Computer Basics, Internet, E-governance, Cyber Security |
| Unit 10 | MP Tribes & Heritage | म.प्र. जनजातियाँ | Tribal Culture, Folk Art, Heritage, Festivals |

---

## 🔥 Universal Prompt (Copy This)

```
You are an MPPSC Exam Expert for the 2026 Pattern.
Generate **[N] High-Quality Questions** for **[SUBJECT]** focusing on **[TOPIC]**.

**MPPSC 2026 Exam Config:**
- Marks per question: 3
- Negative Marking: 1 (1/3rd penalty)
- Question Style: Statement-based (2-3 statements), Match the Columns
- This belongs to MPPSC Unit [UNIT_NUMBER]: [UNIT_NAME]

**Matching Questions Rule:**
- If generating 10 questions → include 1 matching question
- If generating 20 questions → include 2 matching questions
- If generating 30 questions → include 3 matching questions

**For MATCHING type questions, use this format:**
{
  "questionText": "सूची-I को सूची-II से सुमेलित कीजिए:\n\nसूची-I (A)\nसूची-II (B)\n\nनीचे दिए गए कूट का उपयोग करके सही उत्तर चुनिए:",
  "questionTextEn": "Match List-I with List-II:\n\nList-I (A)\nList-II (B)\n\nSelect the correct answer using the code given below:",
  "type": "matching",
  "matchPairs": [
    { "id": "1", "label": "Item A (HI)", "labelEn": "Item A (EN)", "match": "Match A (HI)", "matchId": "a", "matchEn": "Match A (EN)" },
    { "id": "2", "label": "Item B (HI)", "labelEn": "Item B (EN)", "match": "Match B (HI)", "matchId": "b", "matchEn": "Match B (EN)" },
    { "id": "3", "label": "Item C (HI)", "labelEn": "Item C (EN)", "match": "Match C (HI)", "matchId": "c", "matchEn": "Match C (EN)" },
    { "id": "4", "label": "Item D (HI)", "labelEn": "Item D (EN)", "match": "Match D (HI)", "matchId": "d", "matchEn": "Match D (EN)" }
  ],
  "options": ["A-a, B-b, C-c, D-d", "A-b, B-a, C-d, D-c", "A-c, B-d, C-a, D-b", "A-d, B-c, C-b, D-a"],
  "correctAnswer": 0,
  ...rest same as standard
}

**For STANDARD questions, use this format:**
{
  "questionText": "Hindi Question here...",
  "questionTextEn": "English Question here...",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 1,
  "explanation": "Hindi explanation with marketing gimmicks...",
  "explanationEn": "English explanation with marketing gimmicks...",
  "marks": 3,
  "negativeMarks": 1,
  "idealTime": 60,
  "subject": "[SUBJECT]",
  "type": "standard",
  "order": 1
}

**💎 EXPLANATION FORMAT (Marketing Gimmick Style — Must Follow):**
Every explanation MUST include these 4 sections using markdown:

✅ **Correct Logic:** Direct reasoning in simple, clear words.
💡 **Exam Fact (High Value):** A related fact that MPPSC loves to ask.
🧠 **Memory Tip (Mnemonic):** A creative trick to remember (acronym, story, rhyme).
🚫 **Scam Alert (Elimination):** Why other options are wrong — common confusions.

Example explanationEn:
"✅ **Correct Answer: B (Lord Canning)**\n\nLord Canning was the Governor-General during the 1857 Revolt.\n\n💡 **Exam Fact:** He was also the first Viceroy of India after the 1858 Act.\n\n🧠 **Memory Tip:** 'Canning' = 'Cunning' British who survived the revolt.\n\n🚫 **Scam Alert:** Lord Dalhousie left just before the revolt (Doctrine of Lapse) — don't confuse!"

**Instructions:**
1. **Search & Verify:** Use internet to ensure factual accuracy, dates, and latest data.
2. **Bilingual:** Provide DISTINCT Hindi and English text (not translations — natural language).
3. **Difficulty Mix:** 40% Easy, 40% Medium, 20% Hard questions.
4. **idealTime:** 45s for easy, 60s for medium, 90s for hard questions.
5. **Output:** Return ONLY a valid JSON array. No extra text.
6. **Test Name Suggestion:** Based on the topic, suggest a test name like "Quick Check: [Topic Name]"
```

---

## 📋 Quick Examples

### History (Unit 1) — 10 Questions
Replace in prompt:
- `[N]` → 10
- `[SUBJECT]` → History
- `[TOPIC]` → Independence Struggle & National Movement
- `[UNIT_NUMBER]` → 1
- `[UNIT_NAME]` → History of India

### Geography (Unit 3) — 20 Questions
Replace in prompt:
- `[N]` → 20
- `[SUBJECT]` → Geography
- `[TOPIC]` → Rivers, Lakes & Water Resources of India
- `[UNIT_NUMBER]` → 3
- `[UNIT_NAME]` → Geography of India

### MP Tribes (Unit 10) — 10 Questions
Replace in prompt:
- `[N]` → 10
- `[SUBJECT]` → MP Tribes
- `[TOPIC]` → Major Tribes of MP — Bhil, Gond, Korku, Saharia
- `[UNIT_NUMBER]` → 10
- `[UNIT_NAME]` → MP Tribes & Heritage

---

## ⚙️ Upload Steps
1. Generate questions using the prompt above
2. Go to Admin → Content Manager → Tests & Quizzes tab
3. Select "Create New Test" → Type: **Free Quiz (MISC)**
4. Select the Unit
5. Enter Title (or use AI suggested name)
6. Paste the JSON array
7. Click "Create & Upload Test"
8. The test will appear on `/free-quiz` automatically!
