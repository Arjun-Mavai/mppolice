import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { env } from '@/lib/env';

// Singleton pattern to prevent connection exhaustion in serverless/dev
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createClient> | undefined;
};

// Determine connection URL based on environment
const isDev = process.env.NODE_ENV === 'development' && process.env.USE_PROD_DB !== 'true';
const connectionUrl = isDev 
  ? 'file:mppsc_local_dev.db' 
  : env.TURSO_DATABASE_URL;

const connectionAuthToken = isDev
  ? undefined
  : env.TURSO_AUTH_TOKEN;

if (process.env.NODE_ENV !== 'test') {
  console.log(`🔌 Initializing DB Connection: ${isDev ? 'LOCAL (mppsc_local_dev.db)' : 'REMOTE (Turso)'}`);
}

export const client =
  globalForDb.client ??
  createClient({
    url: connectionUrl,
    authToken: connectionAuthToken,
    // syncUrl: process.env.TURSO_SYNC_URL, // Optional: Enable if using embedded replica
  });

if (env.NODE_ENV !== 'production') {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
