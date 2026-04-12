import { z } from 'zod';

/** Structured explanation JSON stored in questions.extended_data (parsed with explanationStream) */
export const explanationExtendedSchema = z.discriminatedUnion('stream', [
  z.object({
    stream: z.literal('math_quant'),
    steps: z.array(z.string()),
    shortcut: z.string().optional(),
    trap: z.string().optional(),
    memoryTip: z.string().optional(),
  }),
  z.object({
    stream: z.literal('reasoning'),
    chain: z.array(z.string()),
    pattern: z.string().optional(),
    elimination: z.string().optional(),
    memoryTip: z.string().optional(),
  }),
  z.object({
    stream: z.literal('gk_science'),
    facts: z.array(z.string()),
    mnemonics: z.array(z.string()).optional(),
    related: z.array(z.string()).optional(),
    memoryTip: z.string().optional(),
  }),
]);

export type ExplanationExtended = z.infer<typeof explanationExtendedSchema>;

/** Wraps explanation + optional image layout hints for MCQ image type */
export const questionExtendedDataSchema = z
  .object({
    explanation: explanationExtendedSchema.optional(),
    questionLayout: z.enum(['text', 'image', 'text_image']).optional(),
    questionImageUrl: z.string().url().optional(),
  })
  .passthrough();

export type QuestionExtendedData = z.infer<typeof questionExtendedDataSchema> & {
  explanation?: ExplanationExtended;
};

export function parseQuestionExtendedData(raw: unknown): QuestionExtendedData | null {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    try {
      return parseQuestionExtendedData(JSON.parse(raw));
    } catch {
      return null;
    }
  }
  const parsed = questionExtendedDataSchema.safeParse(raw);
  return parsed.success ? (parsed.data as QuestionExtendedData) : null;
}

export function parseExplanationStream(raw: unknown): ExplanationExtended | null {
  if (raw == null) return null;
  const o = typeof raw === 'string' ? safeJson(raw) : raw;
  if (!o || typeof o !== 'object') return null;
  const r = explanationExtendedSchema.safeParse(o);
  return r.success ? r.data : null;
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
