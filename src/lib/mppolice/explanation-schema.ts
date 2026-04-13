import { z } from 'zod';

const STREAM_NEST_KEYS = ['gk_science', 'reasoning', 'math_quant'] as const;

/**
 * Some AI JSON nests payload under the stream name instead of using `stream`:
 *   { "explanation": { "gk_science": { "facts": [...] } } }  ❌ common mistake
 * Canonical:
 *   { "explanation": { "stream": "gk_science", "facts": [...] } }  ✅
 * We coerce the former so instant mode, review, and flashcards all see one shape.
 */
export function coerceLegacyNestedExplanation(raw: unknown): unknown {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const o = raw as Record<string, unknown>;
  if (typeof o.stream === 'string' && STREAM_NEST_KEYS.includes(o.stream as (typeof STREAM_NEST_KEYS)[number])) {
    return raw;
  }
  for (const key of STREAM_NEST_KEYS) {
    const inner = o[key];
    if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
      return { stream: key, ...(inner as Record<string, unknown>) };
    }
  }
  return raw;
}

function coerceExtendedDataRoot(raw: unknown): unknown {
  if (raw == null) return raw;
  if (typeof raw === 'string') {
    try {
      return coerceExtendedDataRoot(JSON.parse(raw));
    } catch {
      return raw;
    }
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const out = { ...(raw as Record<string, unknown>) };
  if ('explanation' in out && out.explanation != null) {
    out.explanation = coerceLegacyNestedExplanation(out.explanation);
  }
  return out;
}

/**
 * Structured explanation in `questions.extended_data.explanation`.
 * Hindi fields are primary; `*En` parallels are optional — UI falls back to Hindi if English missing.
 */
/** passthrough = AI JSON may include extra keys; UI reads only known fields */
export const explanationExtendedSchema = z.discriminatedUnion('stream', [
  z
    .object({
      stream: z.literal('math_quant'),
      steps: z.array(z.string()),
      stepsEn: z.array(z.string()).optional(),
      shortcut: z.string().optional(),
      shortcutEn: z.string().optional(),
      trap: z.string().optional(),
      trapEn: z.string().optional(),
      memoryTip: z.string().optional(),
      memoryTipEn: z.string().optional(),
    })
    .passthrough(),
  z
    .object({
      stream: z.literal('reasoning'),
      chain: z.array(z.string()),
      chainEn: z.array(z.string()).optional(),
      pattern: z.string().optional(),
      patternEn: z.string().optional(),
      elimination: z.string().optional(),
      eliminationEn: z.string().optional(),
      memoryTip: z.string().optional(),
      memoryTipEn: z.string().optional(),
    })
    .passthrough(),
  z
    .object({
      stream: z.literal('gk_science'),
      facts: z.array(z.string()),
      factsEn: z.array(z.string()).optional(),
      mnemonics: z.array(z.string()).optional(),
      mnemonicsEn: z.array(z.string()).optional(),
      related: z.array(z.string()).optional(),
      relatedEn: z.array(z.string()).optional(),
      memoryTip: z.string().optional(),
      memoryTipEn: z.string().optional(),
    })
    .passthrough(),
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
  const coerced = coerceExtendedDataRoot(raw);
  const parsed = questionExtendedDataSchema.safeParse(coerced);
  if (parsed.success) return parsed.data as QuestionExtendedData;
  /** Top-level passthrough: only explanation invalid — still expose coerced explanation for UI */
  if (coerced && typeof coerced === 'object' && !Array.isArray(coerced)) {
    const c = coerced as Record<string, unknown>;
    const expl = c.explanation != null ? coerceLegacyNestedExplanation(c.explanation) : null;
    const stream = parseExplanationStream(expl);
    if (stream) {
      return { ...c, explanation: stream } as QuestionExtendedData;
    }
  }
  return null;
}

export function parseExplanationStream(raw: unknown): ExplanationExtended | null {
  if (raw == null) return null;
  const o = typeof raw === 'string' ? safeJson(raw) : raw;
  if (!o || typeof o !== 'object') return null;
  const coerced = coerceLegacyNestedExplanation(o);
  const r = explanationExtendedSchema.safeParse(coerced);
  return r.success ? r.data : null;
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
