'use client';

import { useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { findTopicById, getSectionLabel } from '@/data/mppoliceSyllabus';
import { CHAPTER_CATEGORY_PILLS } from '@/lib/mppolice/chapter-topic-category';
import Link from 'next/link';

/** What the app parses: `src/lib/mppolice/explanation-schema.ts` + `StructuredExplanation` UI (tutor-style cards) */
const EXPLANATION_PROTOCOL = `═══ DEEP EXPLAIN (required for every MCQ) ═══
The app renders your JSON in rich “human tutor” sections (steps, pattern, traps, hooks). Students should feel someone is explaining slowly — NOT a dry textbook.

═══ VOICE (critical — Hindi & English should BOTH sound natural; NOT word-for-word translation) ═══

• MATH (math_quant / steps, stepsEn):
  - Hindi: बोलचाल जैसे शिक्षक — "पहले लिख लो…", "अब ध्यान से देखो…", "इसका मतलब…", हर स्टेप अलग लाइन, बिल्कुल सरल शब्द।
  - English: friendly tutor — "Start by writing…", "Now look closely…", "So that means…" — same logic, different idioms; can add a tiny different angle (e.g. “think of it as…”).
  - Minimum 3–5 steps for non-trivial sums; छोटे सवाल पर भी कम से कम 2–3 स्टेप।

• REASONING (reasoning / chain, chainEn):
  - Hindi: सोच का रास्ता दिखाओ — पहले प्रश्न में क्या दिया, फिर नियम, फिर निष्कर्ष। जैसे दोस्त को समझा रहे हों।
  - English: walk the logic out loud — what’s given, what rule fires, what follows. Different rhythm from Hindi OK.
  - pattern / patternEn: नियम का नाम + एक लाइन “अगली बार ऐसे पहचानो”।
  - elimination: गलत विकल्प पर एक-एक करके क्यों नहीं बनता — conversational.

• GK / GS (gk_science / facts, factsEn):
  - हर fact छोटी कहानी या संदर्भ के साथ — सिर्फ तारीख नहीं, “क्यों एग्जाम में आता है” की झलक।
  - English: same count/order as Hindi facts but fresh wording, not literal translation; mnemonicsEn can use different hook than Hindi.

• memoryTip vs mnemonics: memoryTip = exam hall one-liner; mnemonics = छोटी याद की कड़ियाँ (array).

A) SHORT LINES (always)
- "explanation": 1–2 lines Hindi — crisp “answer kyun”।
- "explanationEn": English — can rephrase, not clone.

B) STRUCTURED BLOCK — "extendedData": { "explanation": { ... } } — ONE stream per question:

┌─ "gk_science"
│  facts[], factsEn[] (same length), mnemonics[], mnemonicsEn[], related[], relatedEn[], memoryTip, memoryTipEn

┌─ "reasoning"
│  chain[], chainEn[] (same length), pattern, patternEn, elimination, eliminationEn, memoryTip, memoryTipEn

┌─ "math_quant"
│  steps[], stepsEn[] (same length), shortcut, shortcutEn, trap, trapEn, memoryTip, memoryTipEn

STREAM ROUTER: GK static → gk_science | Science fact → gk_science | Reasoning → reasoning | Quant → math_quant

Preferred shape: "explanation": { "stream": "gk_science", "facts": [...], ... }.
Alternate (also accepted): "explanation": { "gk_science": { "facts": [...], ... } } — same fields inside the nested object; app normalizes to one UI.

Facts only; MP Police level; no fake years/quotes.`;

const MCQ_JSON_GK = `[
  {
    "questionText": "भारत की राजधानी क्या है?",
    "questionTextEn": "What is the capital of India?",
    "options": [
      { "id": "1", "text": "मुंबई", "text_en": "Mumbai" },
      { "id": "2", "text": "नई दिल्ली", "text_en": "New Delhi" },
      { "id": "3", "text": "कोलकाता", "text_en": "Kolkata" },
      { "id": "4", "text": "चेन्नई", "text_en": "Chennai" }
    ],
    "correctAnswer": "2",
    "subject": "General Knowledge",
    "marks": 1,
    "negativeMarks": 0,
    "explanation": "कार्यकारी केंद्र नई दिल्ली; वित्तीय केंद्र अक्सर मुंबई — प्रश्न राजधानी पूछ रहा है।",
    "explanationEn": "The seat of the Union government is New Delhi; don't confuse with the largest city or financial hub.",
    "extendedData": {
      "explanation": {
        "stream": "gk_science",
        "facts": [
          "जब पेपर में 'राजधानी' लिखा हो तो मतलब संघ का प्रशासनिक केंद्र — वो नई दिल्ली है।",
          "नई दिल्ली केंद्र शासित प्रदेश भी है; संसद, राष्ट्रपति भवन, सर्वोच्च न्यायालय यहीं बैठते हैं।",
          "मुंबई अक्सर 'सबसे बड़ा शहर' वाले सवालों में आता है — इस सवाल से भ्रमित मत होना।"
        ],
        "factsEn": [
          "When the stem says 'capital', it usually means the seat of the Union government — that's New Delhi.",
          "New Delhi is a Union Territory too; Parliament, Rashtrapati Bhavan and the Supreme Court sit here.",
          "Mumbai often shows up as 'largest city' — don't mix that trap with 'capital'."
        ],
        "mnemonics": ["राजधानी = केंद्र सरकार का 'कमांड रूम' → दिल्ली।"],
        "mnemonicsEn": ["Think 'capital = where the Union cabinet actually runs the country' → Delhi."],
        "related": ["भारत की राजभाषाएँ", "लोकसभा सीटें"],
        "relatedEn": ["Official languages of India", "Lok Sabha seats"],
        "memoryTip": "राजधानी vs सबसे बड़ा शहर अलग हो सकते हैं — शब्द पढ़कर तय करो।",
        "memoryTipEn": "Capital ≠ largest city — read the question stem carefully."
      }
    }
  }
]`;

const MCQ_JSON_REASONING = `[
  {
    "questionText": "यदि सभी A हैं B और सभी B हैं C, तो सभी A हैं C। यह किस प्रकार का तर्क है?",
    "questionTextEn": "If all A are B and all B are C, then all A are C. What kind of reasoning is this?",
    "options": [
      { "id": "1", "text": "अनुमान", "text_en": "Inductive" },
      { "id": "2", "text": "यादृच्छिक", "text_en": "Random" },
      { "id": "3", "text": "उपागम / निगमन", "text_en": "Deductive / syllogistic" },
      { "id": "4", "text": "दृष्टांत", "text_en": "Analogy" }
    ],
    "correctAnswer": "3",
    "subject": "Logical Reasoning",
    "marks": 1,
    "negativeMarks": 0,
    "explanation": "सामान्य कथनों से निश्चित निष्कर्ष — उपागम (डिडक्टिव) तर्क।",
    "explanationEn": "General premises yield a certain conclusion — deductive (syllogistic) reasoning.",
    "extendedData": {
      "explanation": {
        "stream": "reasoning",
        "chain": [
          "पहले देखो क्या दिया है: 'सभी A, B हैं' और 'सभी B, C हैं' — दोनों 'सभी' वाले कथन हैं।",
          "अब कल्पना करो: A वाला समूह B के अंदर बैठा है, और B पूरा C के अंदर है — तो A सीधे C के अंदर ही है।",
          "इसलिए निष्कर्ष 'सभी A, C हैं' पक्का है; यहाँ अनुमान वाला 'कुछ उदाहरणों से नियम' वाला खेल नहीं चल रहा।"
        ],
        "chainEn": [
          "First notice what's given: two universal statements — all A are B, and all B are C.",
          "Picture nested circles: the A-set sits inside B, and B sits fully inside C — so A must sit inside C too.",
          "So 'all A are C' is forced; this isn't induction from examples, it's deduction from rules."
        ],
        "pattern": "यह वर्गीय उपागम (syllogism) है — जब दो बार 'सभी' जुड़ जाए तो श्रृंखला से निष्कर्ष निकालो।",
        "patternEn": "Classic categorical syllogism — when two 'all' links stack, read the chain and state the conclusion.",
        "elimination": "'अनुमान' तब होता है जब कम उदाहरणों से सामान्य नियम बनाओ; यहाँ तो सिद्धांत पहले से दिए हैं इसलिए विकल्प 1 नहीं। 'यादृच्छिक' तो बेमानी है; 'दृष्टांत' अलग तर्क होता है।",
        "eliminationEn": "Induction needs examples → rule; here the rules are already given, so (1) is wrong. 'Random' is nonsense; analogy is a different move.",
        "memoryTip": "दो 'सभी' मिलें तो तीर बना लो: A→B→C, फिर A→C पढ़ दो।",
        "memoryTipEn": "See two 'all' statements? Draw A→B→C and read off A→C in one breath."
      }
    }
  }
]`;

const MCQ_JSON_MATH = `[
  {
    "questionText": "800 रु. की वस्तु पर 25% लाभ से विक्रय मूल्य क्या होगा?",
    "questionTextEn": "Selling price at 25% profit on cost ₹800?",
    "options": [
      { "id": "1", "text": "900 रु.", "text_en": "₹900" },
      { "id": "2", "text": "1000 रु.", "text_en": "₹1000" },
      { "id": "3", "text": "950 रु.", "text_en": "₹950" },
      { "id": "4", "text": "850 रु.", "text_en": "₹850" }
    ],
    "correctAnswer": "2",
    "subject": "Quantitative Aptitude",
    "marks": 1,
    "negativeMarks": 0,
    "explanation": "25% लाभ = लागत का चौथाई; 800 + 200 = 1000।",
    "explanationEn": "25% of 800 is 200; SP = 1000.",
    "extendedData": {
      "explanation": {
        "stream": "math_quant",
        "steps": [
          "पहले लिख लो: लागत (CP) = 800 रु। — प्रश्न में साफ लिखा है।",
          "अब समझो '25% लाभ' का मतलब: लाभ हमेशा लागत पर निकालते हैं जब तक विकल्प न कहें। तो लाभ = 800 का 25%।",
          "25% का एक चौथाई जैसा होता है — 800 ÷ 4 = 200 रु। लाभ मिल गया।",
          "विक्रय मूल्य = लागत + लाभ = 800 + 200 = 1000 रु। — यही उत्तर।"
        ],
        "stepsEn": [
          "Write down what you're given: cost CP = ₹800 — the stem states it plainly.",
          "Interpret '25% profit': unless told otherwise, profit % is on cost. So profit = 25% of 800.",
          "25% is the same idea as a quarter — 800 ÷ 4 = ₹200 profit.",
          "Selling price = cost + profit = 800 + 200 = ₹1000 — that's the answer."
        ],
        "shortcut": "एक ही लाइन: SP = CP × (1 + 25/100) = 800 × 1.25 = 1000 — परीक्षा में पहले मतलब समझकर फिर शॉर्टकट।",
        "shortcutEn": "One-liner: SP = CP × 1.25 = 800 × 5/4 = 1000 — but in the hall, know *why* before you jump.",
        "trap": "कभी-कभी % विक्रय मूल्य पर दे देते हैं — तब सारा खेल बदल जाता है। यहाँ सवाल सीधा 'लागत पर लाभ' है, उलझो मत।",
        "trapEn": "Some items put the % on selling price — whole setup changes. Here it's profit on cost; don't misread the base.",
        "memoryTip": "25% लाभ = 'लागत + उसका चौथाई' — बड़ी संख्या दिखे तो पहले ÷4 सोचो।",
        "memoryTipEn": "25% profit on cost ≈ 'add a quarter of CP' — big round numbers? think ÷4 first."
      }
    }
  }
]`;

const MBT_EXPLANATIONS_ONLY_PROMPT = `You are helping an MP Police admin who already wrote every MCQ (Hindi/English stem, 4 options, correct key).

Rules:
- Do NOT invent new questions or change the keyed answer.
- Keep questionText / questionTextEn / options / correctAnswer exactly as given.
- Add or upgrade: explanation, explanationEn, and extendedData.explanation using the same tutor-style streams as the app (gk_science / reasoning / math_quant) — bilingual, natural voice, NOT literal translation.

Output: JSON array only (same length & order as input).`;

const UNIT_SUBJECT_PROMPT = `MP Police Constable — **subject-wise UNIT test** (one big section test, not 100-Q FLT).

${EXPLANATION_PROTOCOL}

Admin form: Test Type **UNIT**, pick the **unitId** (sec_gk_reasoning / sec_mental_ability / sec_science_arithmetic) to match the student "Subject-wise" tab.

Return ONLY a JSON array of MCQs. Bilingual + extendedData.explanation per question.`;

const RAW_TO_MCQ_INSTRUCTIONS = `You convert messy exam lines into the app's MCQ JSON array.

For EVERY row:
- Bilingual MCQ + extendedData.explanation with tutor-style voice (see VOICE rules in protocol): Hindi steps/chain/facts sound like a teacher; English same logic, natural wording, not literal translation.
- Math: 3–5 gentle steps; Reasoning: chain like explaining to a friend; GK: facts with tiny "why it matters" flavour.

Output: JSON array only. Preserve keyed answers; fix OCR Hindi.`;

interface Props {
  testType: string;
  unitId: string;
  topicId: string;
}

export function ContentManagerUploadGuide({ testType, unitId, topicId }: Props) {
  const topicMeta = topicId ? findTopicById(topicId) : undefined;
  const unitLabelEn = getSectionLabel(unitId, 'en');
  const unitLabelHi = getSectionLabel(unitId, 'hi');

  const topicPrompt = useMemo(() => {
    if (testType !== 'TOPIC' || !topicId || !topicMeta) {
      return `Pehle form mein Test Type = **TOPIC** select karo, Unit + Topic choose karo — phir yahan se prompt copy karna best match hoga.\n\n${EXPLANATION_PROTOCOL}`;
    }
    return `You are an expert item writer for MP Police Constable Paper I (topic drill).

${EXPLANATION_PROTOCOL}

═══ ADMIN (form already set; JSON must be valid MCQs only) ═══
- App test type: TOPIC
- unitId: "${unitId}"
- topicId: "${topicId}"
- Topic label: ${topicMeta.front} / ${topicMeta.frontEn}
- Section: ${unitLabelEn} / ${unitLabelHi}

═══ OUTPUT (titles + questions) ═══
**Preferred:** return ONE JSON object (no markdown) with bilingual test titles + questions array:

{
  "testTitle": "त्वरित चेक: ${topicMeta.front}",
  "testTitleEn": "Quick check: ${topicMeta.frontEn}",
  "questions": [ /* exactly 20 MCQ objects */ ]
}

**Also OK:** return ONLY a JSON array of exactly **20** MCQs (no wrapper). Then the admin form’s Title (Hindi) / Title (English) fields (or topic auto-fill) set the test name.

**Priority if both exist:** whatever the admin types in Title fields wins over testTitle / testTitleEn in JSON.

Each MCQ MUST include: questionText, questionTextEn, options[4] with id "1".."4", text, text_en, correctAnswer (string id), subject (General Knowledge / Logical Reasoning / General Science / Quantitative Aptitude), marks:1, negativeMarks:0, explanation, explanationEn, extendedData.explanation with correct stream and full bilingual structured fields as above.

The app UI renders math as numbered step cards, reasoning as a vertical “thought trail”, GK as checkmarked context lines — write copy that deserves that treatment (warm, step-by-step, not robotic).

Do not output markdown.`;
  }, [testType, unitId, topicId, topicMeta, unitLabelEn, unitLabelHi]);

  const fltPrompt = useMemo(
    () => `MP Police Constable — **full mock** (100 MCQs).

Section mix (approx): ~40 GK+Reasoning, ~30 Mental, ~30 Science+Arithmetic.

${EXPLANATION_PROTOCOL}

Return ONLY a JSON array. Each question: bilingual MCQ shape + extendedData.explanation (correct stream per question). Admin: Test Type FLT, title e.g. "Full Mock 01".`,
    []
  );

  const pyqPrompt = useMemo(
    () => `MP Police — **PYQ / previous paper** style set.

${EXPLANATION_PROTOCOL}

Return ONLY a JSON array. Bilingual + extendedData.explanation for every item (stream per question).

Admin: Test Type **PYQ**; title must include **year**; optional collection tag + UI bucket.`,
    []
  );

  const copy = (s: string, label = 'Copied') => {
    navigator.clipboard.writeText(s).then(() => toast.success(label)).catch(() => toast.error('Copy failed'));
  };

  const chapterPillList = CHAPTER_CATEGORY_PILLS.map((p) => p.labelEn).join(' · ');

  return (
    <Accordion type="multiple" className="rounded-xl border border-emerald-200/80 bg-white shadow-sm">
      <AccordionItem value="hub-map" className="border-emerald-100 px-3">
        <AccordionTrigger className="text-sm font-bold text-emerald-900 hover:no-underline">
          Student app (4 tabs) → is form me kya select karna hai
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4 text-sm text-slate-700">
          <ol className="list-inside list-decimal space-y-2 text-xs text-slate-600">
            <li>
              <strong>Tab 1 — Full tests hub (MBT + Subject):</strong> 100-Q mocks = type <strong>FLT</strong>{' '}
              (same JSON shape as pehle). Subject-wise list = type <strong>UNIT</strong> + sahi{' '}
              <code>unitId</code> (MP Police section).
            </li>
            <li>
              <strong>Tab 2 — PYQ:</strong> type <strong>PYQ</strong>, title me <strong>year</strong>, optional{' '}
              UI bucket tag (PYQ hub pills).
            </li>
            <li>
              <strong>Tab 3 — Chapter-wise:</strong> type <strong>TOPIC</strong> + Unit dropdown se MP section +{' '}
              Topic picker se <strong>exact topicId</strong> — yahi ID chapter pills ({chapterPillList}) me
              auto-bucket lagane ke liye use hoti hai.
            </li>
            <li>
              <strong>Tab 4 — One-liners:</strong> alag admin page:{' '}
              <Link href="/admin/one-liner-gk" className="font-semibold text-emerald-700 underline">
                /admin/one-liner-gk
              </Link>{' '}
              (yahan test JSON nahi).
            </li>
          </ol>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="mbt-explain" className="border-emerald-100 px-3">
        <AccordionTrigger className="text-sm font-bold text-emerald-900 hover:no-underline">
          MBT / FLT — questions tum likho, AI sirf explanation + deep JSON
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4 text-sm text-slate-700">
          <p className="text-xs text-slate-600">
            Pehle MCQ array khud bana ke <strong>Questions JSON</strong> me paste karo (jaise instant mode /
            strict bilingual). Phir AI se sirf <strong>explanation / extendedData</strong> banwane ke liye neeche
            wala prompt copy karo — naye prashan mat likhwayo.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => copy(MBT_EXPLANATIONS_ONLY_PROMPT, 'MBT explanation prompt copied')}
          >
            Copy MBT explanation-only prompt
          </Button>
          <pre className="max-h-40 overflow-auto rounded-lg bg-slate-50 p-3 text-[10px] whitespace-pre-wrap">
            {MBT_EXPLANATIONS_ONLY_PROMPT}
          </pre>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="unit-subject" className="border-emerald-100 px-3">
        <AccordionTrigger className="text-sm font-bold text-emerald-900 hover:no-underline">
          Subject-wise (UNIT) — AI prompt + form
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4 text-sm text-slate-700">
          <ol className="list-inside list-decimal space-y-1 text-xs text-slate-600">
            <li>
              Test Type = <strong>UNIT</strong> → Unit = <code>sec_gk_reasoning</code>,{' '}
              <code>sec_mental_ability</code>, ya <code>sec_science_arithmetic</code>.
            </li>
            <li>Copy prompt → AI → JSON array → Questions JSON me paste.</li>
          </ol>
          <Button type="button" size="sm" variant="outline" onClick={() => copy(UNIT_SUBJECT_PROMPT, 'UNIT prompt copied')}>
            Copy UNIT (subject-wise) prompt
          </Button>
          <pre className="max-h-36 overflow-auto rounded-lg bg-slate-50 p-3 text-[10px] whitespace-pre-wrap">
            {UNIT_SUBJECT_PROMPT}
          </pre>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="chapter-ui" className="border-emerald-100 px-3">
        <AccordionTrigger className="text-sm font-bold text-emerald-900 hover:no-underline">
          Chapter-wise (TOPIC) — frontend pills ke saath match
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4 text-sm text-slate-700">
          <p className="text-xs text-slate-600">
            App par strips: <strong>{chapterPillList}</strong>. Topic row ka syllabus <code>id</code> agar
            picker wala <code>topicId</code> hai to auto-filter sahi bucket me girega. Nayi row banaoge to
            admin me wahi <strong>topicId</strong> choose karo jo{' '}
            <a
              href="/docs/mp-police-syllabus-reference"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-emerald-700 underline"
            >
              syllabus reference
            </a>{' '}
            / picker me dikh raha ho.
          </p>
          <p className="text-xs text-slate-600">
            <strong>MP GK</strong> strip: title me MP / मध्य प्रदेश / भोपाल jaise seedhe signals hon to topic{' '}
            <strong>MP GK</strong> pill me dikhega; baaki GK <strong>General Knowledge</strong> pill me.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="topic" className="border-emerald-100 px-3">
        <AccordionTrigger className="text-sm font-bold text-emerald-900 hover:no-underline">
          Topic test — subject / topic + AI prompt (GK / Reasoning / Maths deep JSON)
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4 text-sm text-slate-700">
          <ol className="list-inside list-decimal space-y-1 text-xs text-slate-600">
            <li>Create New Test → Topic Check → Unit + Topic (yehi DB link hai).</li>
            <li>Title (Hindi) / Title (English) — khali chhod sakte ho (topic se auto) ya JSON ke `testTitle` / `testTitleEn` se aayega; form me jo likhoge wo JSON par bhari padega.</li>
            <li>Copy **Topic prompt** → AI → poora JSON (object with `questions` ya sirf array) → Questions JSON me paste.</li>
            <li>Use **GK / Reasoning / Math** template below as shape reference (pick one stream per question).</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => copy(topicPrompt, 'Full topic prompt copied')}>
              Copy topic prompt
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => copy(MCQ_JSON_GK, 'GK JSON copied')}>
              JSON: GK stream
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => copy(MCQ_JSON_REASONING, 'Reasoning JSON copied')}>
              JSON: Reasoning
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => copy(MCQ_JSON_MATH, 'Math JSON copied')}>
              JSON: Math
            </Button>
          </div>
          <pre className="max-h-52 overflow-auto rounded-lg bg-slate-50 p-3 text-[10px] leading-relaxed whitespace-pre-wrap">
            {topicPrompt}
          </pre>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="flt" className="border-emerald-100 px-3">
        <AccordionTrigger className="text-sm font-bold text-emerald-900 hover:no-underline">
          Full test (100 Q / FLT)
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4 text-sm text-slate-700">
          <ol className="list-inside list-decimal space-y-1 text-xs text-slate-600">
            <li>Type: **FLT**, title set karo.</li>
            <li>Har question par `extendedData.explanation` + bilingual *_En (same protocol).</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => copy(fltPrompt, 'FLT prompt copied')}>
              Copy FLT prompt
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => copy(MCQ_JSON_GK, 'Sample JSON copied')}>
              Copy sample JSON (GK)
            </Button>
          </div>
          <pre className="max-h-36 overflow-auto rounded-lg bg-slate-50 p-3 text-[10px] whitespace-pre-wrap">{fltPrompt}</pre>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="pyq" className="border-emerald-100 px-3">
        <AccordionTrigger className="text-sm font-bold text-emerald-900 hover:no-underline">
          PYP / PYQ paper upload
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4 text-sm text-slate-700">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => copy(pyqPrompt, 'PYQ prompt copied')}>
              Copy PYQ prompt
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => copy(MCQ_JSON_REASONING, 'Sample JSON copied')}>
              Copy sample JSON (Reasoning)
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="raw" className="border-emerald-100 px-3">
        <AccordionTrigger className="text-sm font-bold text-emerald-900 hover:no-underline">
          Raw text → bilingual MCQ + deep extendedData
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4 text-sm text-slate-700">
          <p className="text-xs text-slate-600">
            Master rules:{' '}
            <a href="/prompts/mppolice-ai-master.md" target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 underline">
              mppolice-ai-master.md
            </a>
          </p>
          <Button type="button" size="sm" variant="outline" onClick={() => copy(RAW_TO_MCQ_INSTRUCTIONS, 'Raw→MCQ copied')}>
            Copy raw→MCQ instructions
          </Button>
          <pre className="max-h-40 overflow-auto rounded-lg bg-slate-50 p-3 text-[10px] whitespace-pre-wrap">
            {RAW_TO_MCQ_INSTRUCTIONS}
          </pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
