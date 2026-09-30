import { z } from 'zod';

const envSchema = z
  .object({
    DB_PROVIDER: z.enum(['turso', 'supabase']).default('supabase'),
    // 🗄️ Database (Turso / Supabase)
    TURSO_DATABASE_URL: z.string().optional(),
    TURSO_AUTH_TOKEN: z.string().optional(),
    SUPABASE_DATABASE_URL: z.string().optional(),

    // 🔐 Security
    JWT_SECRET: z.string().min(32),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    USE_PROD_DB: z.string().optional().default('false'),

    // 💳 Payments (Razorpay)
    NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
    RAZORPAY_KEY_SECRET: z.string().min(1),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

    // 📧 Email (Resend)
    RESEND_API_KEY: z.string().min(1),
    ADMIN_EMAIL: z.string().email().optional(),

    // ⚡ Cache/RateLimit (Upstash) - marked as optional/catch to prevent build failures
    UPSTASH_REDIS_REST_URL: z.string().url().optional().catch(undefined),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional().catch(undefined),
  })
  .superRefine((value, context) => {
    if (value.DB_PROVIDER === 'turso' && value.NODE_ENV === 'production') {
      if (!value.TURSO_DATABASE_URL || !value.TURSO_AUTH_TOKEN) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['TURSO_DATABASE_URL'],
          message: 'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required when DB_PROVIDER=turso',
        });
      }
    }
    if (value.DB_PROVIDER === 'supabase' && !value.SUPABASE_DATABASE_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SUPABASE_DATABASE_URL'],
        message: 'SUPABASE_DATABASE_URL is required when DB_PROVIDER=supabase',
      });
    }
  });

// "Bhai, agar env variables nahi mile toh yahi fat jayega"
// This ensures type safety and runtime validation for our environment variables
export const env = envSchema.parse(process.env);
