import { Redis } from '@upstash/redis';

// Bhai, Redis client bana rahe hain. 
// Ye Upstash se judega aur Rate Limiting/Caching handle karega.
// Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are in .env

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export { redis };
