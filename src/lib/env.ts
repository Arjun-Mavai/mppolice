import { z } from 'zod';

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_AUTH_TOKEN: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// "Bhai, agar env variables nahi mile toh yahi fat jayega"
// This ensures type safety and runtime validation for our environment variables
export const env = envSchema.parse(process.env);
