import type { Question } from '@/types/quiz';
import { parseExplanationStream, parseQuestionExtendedData } from '@/lib/mppolice/explanation-schema';

/** Matches QuizResult PyqFactCard shape for merged flashcards tab */
export interface LocalRevisionFactCard {
  id: string;
  subject?: string | null;
  factText?: string | null;
  factTextEn?: string | null;
  memoryTip?: string | null;
  memoryTipEn?: string | null;
}

/** Build revision cards from wrong answers that carry structured JSON explanations (admin upload). */
export function buildRevisionCardsFromStructuredExplanations(
  questions: Question[],
  wrongQuestionIds: Set<string>
): LocalRevisionFactCard[] {
  const out: LocalRevisionFactCard[] = [];

  for (const q of questions) {
    if (!wrongQuestionIds.has(q.id)) continue;

    const ext = parseQuestionExtendedData(q.extendedData);
    const stream = parseExplanationStream(ext?.explanation);
    if (!stream) continue;

    let factHi = '';
    let factEn: string | null = null;
    let memHi: string | null = null;
    let memEn: string | null = null;

    if (stream.stream === 'gk_science') {
      factHi = stream.facts?.[0] || '';
      factEn = stream.factsEn?.[0] ?? null;
      memHi = stream.memoryTip ?? null;
      memEn = stream.memoryTipEn ?? null;
    } else if (stream.stream === 'reasoning') {
      factHi = stream.chain?.[0] || stream.pattern || '';
      factEn = stream.chainEn?.[0] || stream.patternEn || null;
      memHi = stream.memoryTip ?? null;
      memEn = stream.memoryTipEn ?? null;
    } else if (stream.stream === 'math_quant') {
      factHi = stream.steps?.[0] || stream.shortcut || '';
      factEn = stream.stepsEn?.[0] || stream.shortcutEn || null;
      memHi = stream.memoryTip ?? null;
      memEn = stream.memoryTipEn ?? null;
    }

    const fallbackHi = (q.explanation || '').trim();
    const fallbackEn = (q.explanationEn || '').trim();

    if (!factHi.trim() && !factEn?.trim() && !fallbackHi && !fallbackEn) continue;

    out.push({
      id: `from-json-${q.id}`,
      subject: q.subject ?? null,
      factText: factHi.trim() || fallbackHi || null,
      factTextEn: factEn || fallbackEn || null,
      memoryTip: memHi,
      memoryTipEn: memEn,
    });
  }

  return out;
}
