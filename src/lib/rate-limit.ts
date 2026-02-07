import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Rate Limiters Configuration
// Bhai, har action ke liye alag alag limit lagayi hai taaki security tight rahe.

// Only create limiters if Redis is available
// This prevents build errors when Redis env vars are missing

// 1. Signup API: 3 attempts per hour per IP
// Koi script lagake fake accounts na banaye isliye strict rakha hai.
export const signupLimiter = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "@upstash/ratelimit/signup",
}) : null;

// 2. Login API: 5 attempts per 15 minutes per IP
// Brute force attacks rokne ke liye.
export const loginLimiter = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(2, "1 m"),
  prefix: "@upstash/ratelimit/login",
}) : null;

// 3. General API routes: 100 requests per minute per IP
// Normal usage ke liye kaafi hai, lekin DDoS se bachayega.
export const genApiLimiter = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  prefix: "@upstash/ratelimit/api",
}) : null;

// 4. Password Reset: 3 attempts per hour per Email (identifier hum email pass karenge)
// Spam rokne ke liye jaruri hai.
export const resetLimiter = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "@upstash/ratelimit/reset",
}) : null;

// 5. Feedback API: 5 attempts per hour per IP
// Spam aur faaltu messages rokne ke liye.
export const feedbackLimiter = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "@upstash/ratelimit/feedback",
}) : null;

/**
 * Helper to check rate limit
 * @param limiter - The specific Ratelimit instance (can be null if Redis unavailable)
 * @param identifier - IP address or Email or User ID
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkRateLimit(limiter: Ratelimit | null, identifier: string) {
    // If limiter is null (Redis not configured), allow all requests
    if (!limiter) {
        return { success: true, limit: 100, remaining: 100, reset: 0 };
    }
    
    try {
        const { success, limit, remaining, reset } = await limiter.limit(identifier);
        return { success, limit, remaining, reset };
    } catch (error) {
        // Bhai, agar Redis down hai to user ko block mat karo, jaane do.
        // Fail open strategy better hai UX ke liye.
        console.error("Rate Limit Error:", error);
        return { success: true, limit: 100, remaining: 100, reset: 0 };
    }
}
