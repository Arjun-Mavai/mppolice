/**
 * MP Police — AI prompt scaffolding for `questions.extended_data.explanation`
 * and bulk MCQ generation. Shapes must match `explanationExtendedSchema` in
 * `src/lib/mppolice/explanation-schema.ts`.
 */

const JSON_ONLY = 'Output ONLY valid JSON. No markdown, no code fences.';

export function mppoliceMathQuantExplanationPrompt(questionHi: string, questionEn: string) {
  return `You are an MP Police Constable Paper I quantitative aptitude tutor (simple arithmetic / mental ability level, not JEE).
${JSON_ONLY}
Shape:
{"stream":"math_quant","steps":["short step in Hinglish or Hindi","..."],"shortcut":"optional one-liner","trap":"common wrong approach","memoryTip":"optional"}
Question (HI): ${questionHi}
Question (EN): ${questionEn}
steps: 3–5 bullets, exam-oriented, encouraging tone.`;
}

export function mppoliceReasoningExplanationPrompt(questionHi: string, questionEn: string) {
  return `You are a reasoning coach for MP Police level (verbal / non-verbal / puzzles).
${JSON_ONLY}
Shape:
{"stream":"reasoning","chain":["..."],"pattern":"optional","elimination":"optional","memoryTip":"optional"}
Question (HI): ${questionHi}
Question (EN): ${questionEn}
chain: 4–6 short bullets building the logic.`;
}

export function mppoliceGkScienceExplanationPrompt(questionHi: string, questionEn: string) {
  return `You are a GK & General Science tutor at MP Police Constable level (factual, memorable, not PhD depth).
${JSON_ONLY}
Shape:
{"stream":"gk_science","facts":["4–6 high-yield bullets"],"mnemonics":["optional acronym or Hindi trick"],"related":["2–4 hooks for similar MCQs"],"memoryTip":"optional"}
Question (HI): ${questionHi}
Question (EN): ${questionEn}
facts: tight bullets students can revise in 30 seconds.`;
}

/** Full array: paste after AI returns questions JSON */
export function mppoliceBulkPyqPrompt(mixDescription: string) {
  return `Generate a JSON array of MCQs for MP Police Constable Paper I.
${mixDescription}
Each object must include: questionText, questionTextEn, options (id 1-4, text, text_en), correctAnswer as string "1"-"4", subject (General Knowledge | General Science | Logical Reasoning | Quantitative Aptitude), marks:1, negativeMarks:0, explanation, explanationEn, extendedData.explanation using stream math_quant | reasoning | gk_science as appropriate.
${JSON_ONLY}`;
}

export function mppoliceBulkPyq100Prompt() {
  return mppoliceBulkPyqPrompt(
    'Exactly 100 questions. Mix ~40 GK, ~20 GS, ~25 Logical Reasoning, ~15 Quant. Bilingual throughout.'
  );
}

export function mppoliceBulkTopicPrompt(topicName: string, count: number, subject: string) {
  return `Generate a JSON array of exactly ${count} MCQs for MP Police. Topic focus: "${topicName}".
Every question must have "subject": "${subject}".
Include rich extendedData.explanation (correct stream per question).
${JSON_ONLY}`;
}
