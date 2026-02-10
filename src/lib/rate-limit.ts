import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ RATE LIMITING — Production-standard limits
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Dev mode: Set RATE_LIMIT_ENABLED=true in .env to test locally
// Production: Always active (env var absent = ON in prod)
//
// Fail-open: If Redis down → allow requests (don't block users)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const isDev = process.env.NODE_ENV === 'development';
const rateLimitEnabled = isDev
  ? process.env.RATE_LIMIT_ENABLED === 'true'  // Dev: opt-in
  : true;                                       // Prod: always on

function createLimiter(tokens: number, window: string, prefix: string) {
  if (!redis || !rateLimitEnabled) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window as any),
    prefix: `@upstash/ratelimit/${prefix}`,
  });
}

// ── Limiters ─────────────────────────────────────────────────
// Signup: 10/hour — real users won't hit this, spammers will
export const signupLimiter = createLimiter(10, "1 h", "signup");

// Login: 10 per 15 min — allows typos + retries, blocks brute force
export const loginLimiter = createLimiter(10, "15 m", "login");

// General API: 120 requests/min — normal browsing won't hit this
export const genApiLimiter = createLimiter(120, "1 m", "api");

// Password Reset: 5/hour — prevents email spam
export const resetLimiter = createLimiter(5, "1 h", "reset");

// Feedback: 10/hour — generous for real feedback
export const feedbackLimiter = createLimiter(10, "1 h", "feedback");

// Payment: 10 per 15 min — user might retry after failed payment
export const paymentLimiter = createLimiter(10, "15 m", "payment");

// Set Password: 10/hour — user might re-click link multiple times
export const setPasswordLimiter = createLimiter(10, "1 h", "set-password");

/**
 * Check rate limit — fail-open (Redis down → allow)
 */
export async function checkRateLimit(limiter: Ratelimit | null, identifier: string) {
    if (!limiter) {
        return { success: true, limit: 100, remaining: 100, reset: 0 };
    }
    try {
        const { success, limit, remaining, reset } = await limiter.limit(identifier);
        return { success, limit, remaining, reset };
    } catch (error) {
        console.error("Rate Limit Error:", error);
        return { success: true, limit: 100, remaining: 100, reset: 0 };
    }
}
