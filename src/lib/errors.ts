/** Safe message from thrown values (catch blocks). */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return String(error);
}

/** Driver / SQLite style `code` on thrown objects. */
export function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    const c = (error as { code?: unknown }).code;
    return typeof c === 'string' ? c : undefined;
  }
  return undefined;
}

export function getErrorName(error: unknown): string | undefined {
  if (error instanceof Error) return error.name;
  if (error && typeof error === 'object' && 'name' in error) {
    const n = (error as { name?: unknown }).name;
    return typeof n === 'string' ? n : undefined;
  }
  return undefined;
}
