import { z } from 'zod';

const envSchema = z.object({
  // 🗄️ Database (Turso)
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_AUTH_TOKEN: z.string().min(1),
  
  // 🔐 Security
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  USE_PROD_DB: z.string().optional().default('false'),

  // 💳 Payments (Razorpay)
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(), // Optional initially, but recommended for prod

  // 📧 Email (Resend)
  RESEND_API_KEY: z.string().min(1),
  ADMIN_EMAIL: z.string().email().optional(),

  // ⚡ Cache/RateLimit (Upstash) - marked as optional/catch to prevent build failures
  UPSTASH_REDIS_REST_URL: z.string().url().optional().catch(undefined),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional().catch(undefined),
});

// "Bhai, agar env variables nahi mile toh yahi fat jayega"
// This ensures type safety and runtime validation for our environment variables
export const env = envSchema.parse(process.env);
