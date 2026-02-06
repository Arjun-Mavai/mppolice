
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { env } from '@/lib/env';

// "Ab constant variable nahi, verified maal use kar rahe"
const url = env.TURSO_DATABASE_URL;
const authToken = env.TURSO_AUTH_TOKEN;

// Singleton pattern to prevent connection exhaustion in serverless/dev
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createClient> | undefined;
};

export const client = globalForDb.client ?? createClient({ 
  url, 
  authToken,
  // syncUrl: process.env.TURSO_SYNC_URL, // Optional: Enable if using embedded replica
});

if (env.NODE_ENV !== 'production') {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
