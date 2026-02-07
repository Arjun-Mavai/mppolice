import { Redis } from '@upstash/redis';

// Bhai, Redis client bana rahe hain. 
// Ye Upstash se judega aur Rate Limiting/Caching handle karega.
// Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are in .env

// Strip any surrounding quotes from env vars (common issue)
const stripQuotes = (str: string | undefined) => {
  if (!str) return '';
  return str.replace(/^["']|["']$/g, '');
};

const redisUrl = stripQuotes(process.env.UPSTASH_REDIS_REST_URL);
const redisToken = stripQuotes(process.env.UPSTASH_REDIS_REST_TOKEN);

// Only initialize Redis if credentials are available
// This prevents build errors when env vars are missing
export const redis = redisUrl && redisToken 
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

