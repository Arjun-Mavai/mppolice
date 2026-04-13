/**
 * Admin JSON / DB often store correctAnswer as option id ("1".."4").
 * Quiz UI uses 0-based option index everywhere (selection, instant feedback).
 * Submission compares user answer strings to DB correctAnswer — must send same encoding as DB.
 */

export function getMcqOptionsArray(options: unknown): unknown[] {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    try {
      const p = JSON.parse(options);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  if (typeof options === 'object') return Object.values(options as object);
  return [];
}

/** Map DB / JSON correctAnswer → 0-based index for QuizQuestion / comparisons in client state */
export function correctAnswerToOptionIndex(
  correctRaw: string | number | null | undefined,
  options: unknown
): number {
  const opts = getMcqOptionsArray(options);
  if (opts.length === 0) {
    const n = Number(correctRaw);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  }
  const str = correctRaw != null ? String(correctRaw).trim() : '';

  for (let i = 0; i < opts.length; i++) {
    const o = opts[i];
    if (typeof o === 'object' && o !== null && 'id' in o) {
      const id = (o as { id?: unknown }).id;
      if (id !== undefined && id !== null && String(id) === str) return i;
    }
  }

  const n = Number(str);
  if (!Number.isNaN(n) && Number.isInteger(n)) {
    if (n >= 1 && n <= opts.length) return n - 1;
    if (n >= 0 && n < opts.length) return n;
  }
  return 0;
}

/** Map user's selected option index → string stored in DB (matches admin upload / grading) */
export function selectedIndexToStoredAnswer(optionIndex: number, options: unknown): string {
  const opts = getMcqOptionsArray(options);
  const o = opts[optionIndex];
  if (typeof o === 'object' && o !== null && 'id' in o) {
    const id = (o as { id?: unknown }).id;
    if (id !== undefined && id !== null) return String(id);
  }
  const anyWithId = opts.some(
    (x) => typeof x === 'object' && x !== null && 'id' in x && (x as { id?: unknown }).id != null
  );
  if (anyWithId) return String(optionIndex + 1);
  return String(optionIndex);
}
