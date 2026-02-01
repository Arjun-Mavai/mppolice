# 🚀 MPPSC 2026 Ultimate Data Prompts (Units 1-10)

> **Updated for 2026 Pattern:**
>
> - **Marks:** 3 per question.
> - **Negative Marking:** 1 (1/3rd).
> - **Style:** Statement-based, Match the Columns.
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
    "subject": "Unit Subject",
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

**Example String for `explanationEn`:**
"**Correct Answer:** B (Lord Canning)\n\n**Detailed Analysis:** Lord Canning was the Governor-General during the 1857 Revolt.\n\n**💡 Exam Fact:** He was also the **first Viceroy** of India after the 1858 Act.\n\n**🧠 Memory Tip:** 'Canning' = 'Cunning' British who survived the revolt.\n\n**🚫 Scam Alert:** Lord Dalhousie left just before the revolt (known for Doctrine of Lapse), don't get confused!"

---

## 🏛️ Unit 1: History of India

**Copy this Prompt:**

```text
You are an MPPSC Exam Expert specializing in Indian History.
Generate **20 High-Quality Questions** for **MPPSC Prelims Unit 1: History of India** based on the **2026 Pattern**.

**Config:**
- Marks: 3
- Negative Marks: 1
- Format: Statement-based (2-3 statements) & Match the Columns.

**Scope:**
1. Ancient Indian Knowledge Tradition (Vedas, Upanishads, Aranyakas, Shaddarshan, Smritis).
2. Major features, events, and administrative/social/economic systems of Ancient and Medieval India.
3. Social and Religious Reform movements (19th-20th Century).
4. Independence Struggle and Indian National Movement.
5. Integration and Reorganization of India after Independence.

**Instructions:**
1. **Search & Verify:** Use internet search to ensure historical accuracy, dates, and facts.
2. **Premium Explanations:** MUST include **💡 Exam Fact**, **🧠 Memory Tip**, and **🚫 Scam Alert** in every explanation.
3. **Bilingual:** Provide distinct Hindi and English text for Question, Options, and Explanation.
4. **Ideal Time:** Estimate time (45s-90s) based on difficulty.
5. **Output:** Return ONLY a valid JSON array matching the Universal Schema (Marks 3, Neg 1).
```

---

## 🏰 Unit 2: History, Culture & Literature of MP

**Copy this Prompt:**

```text
You are an MPPSC Exam Expert specializing in Madhya Pradesh GK.
Generate **20 High-Quality Questions** for **MPPSC Prelims Unit 2: History, Culture and Literature of Madhya Pradesh**.

**Config:**
- Marks: 3
- Negative Marks: 1
- Format: Statement-based & Factual Match.

**Scope:**
1. Major dynasties of MP (Holkar, Scindia, Baghel, Chandela, Parmar).
2. Contribution of MP in Freedom Movement (1857 Revolt, Jungle Satyagraha).
3. Major Arts, Sculpture, and Festivals of MP.
4. Major Tribes (Bhil, Gond, Baiga) and their Dialects per 2026 data.
5. Folk Music, Folk Arts, and Folk Literature.
6. Important Literateur of MP and their works.
7. World Heritage Sites and Tourist places in MP.

**Instructions:**
1. **Search:** Ensure deep factual accuracy regarding MP specific data (latest awards/recognitions).
2. **Premium Explanations:** MUST include **💡 Exam Fact**, **🧠 Memory Tip**, and **🚫 Scam Alert**.
3. **Bilingual:** Hindi and English.
4. **Output:** Return ONLY a valid JSON array matching the Universal Schema (Marks 3, Neg 1).
```

---

## 🌍 Unit 3: Geography of India

**Copy this Prompt:**

```text
You are an MPPSC Exam Expert specializing in Indian Geography.
Generate **20 High-Quality Questions** for **MPPSC Prelims Unit 3: Geography of India**.

**Config:**
- Marks: 3
- Negative Marks: 1
- Format: Map-based logic, Assertion-Reasoning.

**Scope:**
1. Physical Features: Mountains, Hills, Plateaus, Rivers, Lakes.
2. Climate Phenomena: El Nino, La Nina, Southern Oscillation, Western Disturbances.
3. Natural Resources: Forest, Minerals, Water Resources.
4. Agriculture: Major Crops, Food Security, Green Revolution (1st & 2nd strategies).
5. Energy: Conventional and Non-Conventional sources.
6. Demography: Population growth, distribution, density, migration (Census 2011 & latest data).

**Instructions:**
1. **Premium Explanations:** Include specific data points as **💡 Exam Fact** (e.g., "Highest producer of X is Y").
2. **Bilingual:** Hindi and English.
3. **Output:** Return ONLY a valid JSON array matching the Universal Schema (Marks 3, Neg 1).
```

---

## 🗺️ Unit 4: Geography of MP

**Copy this Prompt:**

```text
You are an MPPSC Exam Expert specializing in MP Geography.
Generate **20 High-Quality Questions** for **MPPSC Prelims Unit 4: Geography of Madhya Pradesh**.

**Config:**
- Marks: 3
- Negative Marks: 1
- Format: Match columns (District-Mineral/Crop).

**Scope:**
1. Forests, Forest Produce, Wild Life, Rivers, Mountains, Plateaus of MP.
2. Climate: Seasons, Temperature, Rainfall distribution.
3. Natural Resources: Soils, Major Minerals (Diamond, Copper, Manganese).
4. Major Crops, Irrigation Projects, and Energy Sources (Solar/Thermal).
5. Major Industries of MP (Agro-based, Mineral-based).
6. Demography: Population & Urbanization in MP (Census 2011).

**Instructions:**
1. **Search:** Verify specific district-wise production data and recent irrigation projects.
2. **Premium Explanations:** Use mnemonics for district lists (e.g., "Best Soyabean districts").
3. **Bilingual:** Hindi and English.
4. **Output:** Return ONLY a valid JSON array matching the Universal Schema (Marks 3, Neg 1).
```

---

## ⚖️ Unit 5: Constitutional System of India & MP

**Copy this Prompt:**

```text
You are an MPPSC Exam Expert specializing in Indian Polity.
Generate **20 High-Quality Questions** for **MPPSC Prelims Unit 5: Constitutional System of India and MP**.

**Config:**
- Marks: 3
- Negative Marks: 1
- Format: Assertion-Reasoning, Article Matching.

**Scope:**
1. Constituent Assembly, Federal Executive, President, Parliament.
2. Supreme Court, Judicial System, Constitutional Amendments.
3. Fundamental Rights, Duties, DPSP.
4. National & Regional Constitutional/Statutory Commissions (Election Commission, UPSC, NITI Aayog, etc.).
5. Constitutional System of MP (Governor, CM, Assembly, High Court).
6. Three-tier Panchayati Raj and Urban Administration in MP.
7. Good Governance.

**Instructions:**
1. **Search:** Include recent constitutional amendments or landmark SC judgments.
2. **Premium Explanations:** Explain the 'Why' behind Articles. Use **🚫 Scam Alert** for confusing articles (e.g. Art 32 vs 226).
3. **Bilingual:** Hindi and English.
4. **Output:** Return ONLY a valid JSON array matching the Universal Schema (Marks 3, Neg 1).
```

---

## 📈 Unit 6: Economy of India & MP

**Copy this Prompt:**

```text
You are an MPPSC Exam Expert specializing in Indian Economy.
Generate **20 High-Quality Questions** for **MPPSC Prelims Unit 6: Economy of India and MP**.

**Config:**
- Marks: 3
- Negative Marks: 1
- Format: Data Interpretations, Scheme details.

**Scope:**
1. MP's position in Indian Economy, GDP contribution.
2. Sustainable Development Goals (SDGs) progress in MP.
3. ODOP (One District One Product), Atmanirbhar MP, IPR progress.
4. Financial Institutions: RBI, Banks, SEBI, NBFCs.
5. India's Foreign Trade Policy, G-20, SAARC, ASEAN.
6. Industrial & Infrastructure development in MP.

**Instructions:**
1. **Search:** CRITICAL. Use latest Budget 2025-26 and Economic Survey data.
2. **Premium Explanations:** Focus on **💡 Exam Fact** (Latest percentages/ranks).
3. **Bilingual:** Hindi and English.
4. **Output:** Return ONLY a valid JSON array matching the Universal Schema (Marks 3, Neg 1).
```

---

## 🔬 Unit 7: Science, Environment & Health

**Copy this Prompt:**

```text
You are an MPPSC Exam Expert specializing in Science & Environment.
Generate **20 High-Quality Questions** for **MPPSC Prelims Unit 7: Science, Environment and Health**.

**Config:**
- Marks: 3
- Negative Marks: 1
- Format: Applied Science, Current Tech.

**Scope:**
1. Basic Principles of Science (Physics, Chem, Bio).
2. ISRO, DRDO, Scientific Institutions, Satellites & Space Tech.
3. Human Body, Nutrition, Genetic Diseases (Sickle Cell Anemia).
4. Pollution, Natural Disasters, Environment & Biodiversity.
5. Sustainable Development Goals (SDGs).
6. Health Policy & Programs of India/MP.

**Instructions:**
1. **Search:** Include recent ISRO missions (Chandrayaan-3, Aditya L1) and environmental treaties.
2. **Premium Explanations:** Use Diagrams/Process description in text.
3. **Bilingual:** Hindi and English.
4. **Output:** Return ONLY a valid JSON array matching the Universal Schema (Marks 3, Neg 1).
```

---

## 📰 Unit 8: Current Affairs (Intl, National, MP)

**Copy this Prompt:**

```text
You are an MPPSC Exam Expert specializing in Current Affairs.
Generate **20 High-Quality Questions** for **MPPSC Prelims Unit 8: Current Events**.

**Config:**
- Marks: 3
- Negative Marks: 1
- Format: Person-Place-Event Match.

**Scope:**
1. International Current Events (Summits, Wars, Indices).
2. National Current Events (Schemes, Awards, Sports).
3. Madhya Pradesh Current Events (State Awards, New Policies, Appointments).

**Instructions:**
1. **Search:** FOCUS ON LAST 6 MONTHS. Ensure data is relevant for 2026 exam cycle.
2. **Premium Explanations:** Connect current event to static syllabus in **💡 Exam Fact**.
3. **Bilingual:** Hindi and English.
4. **Output:** Return ONLY a valid JSON array matching the Universal Schema (Marks 3, Neg 1).
```

---

## 💻 Unit 9: ICT (Information & Comm Technology)

**Copy this Prompt:**

```text
You are an MPPSC Exam Expert specializing in Technology.
Generate **20 High-Quality Questions** for **MPPSC Prelims Unit 9: ICT**.

**Config:**
- Marks: 3
- Negative Marks: 1
- Format: Full forms, Tech Logic.

**Scope:**
1. Electronics, ICT, Robotics, Artificial Intelligence (AI).
2. Cyber Security, E-Governance.
3. Internet & Social Networking Platforms.
4. Basic Computer Knowledge.

**Instructions:**
1. **Search:** Include recent trends in AI, 5G/6G, and Cyber laws.
2. **Premium Explanations:** Explain the technology simply with **🧠 Memory Tip** for acronyms.
3. **Bilingual:** Hindi and English.
4. **Output:** Return ONLY a valid JSON array matching the Universal Schema (Marks 3, Neg 1).
```

---

## 🏹 Unit 10: Tribes of Madhya Pradesh

**Copy this Prompt:**

```text
You are an MPPSC Exam Expert specializing in MP Tribes.
Generate **20 High-Quality Questions** for **MPPSC Prelims Unit 10: Tribes of Madhya Pradesh**.

**Config:**
- Marks: 3
- Negative Marks: 1
- Format: Culture match, Tribe-Region match.

**Scope:**
1. Geographical distribution of Tribes in MP.
2. Constitutional Provisions for Tribes.
3. PVTGs (Baiga, Bharia, Sahariya) - Special focus.
4. Welfare Schemes for Tribes.
5. Tribal Culture: Festivals, Dialects, Folk Arts, Literature.
6. Contribution of Tribals in Freedom Movement.
7. Important Tribal Personalities (Tantya Bhil, etc.).

**Instructions:**
1. **Search:** Use deep cultural data and specific scheme details.
2. **Premium Explanations:** Focus on unique cultural aspects (marriage types, deities).
3. **Bilingual:** Hindi and English.
4. **Output:** Return ONLY a valid JSON array matching the Universal Schema (Marks 3, Neg 1).
```
