import { createClient } from '@libsql/client';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import postgres from 'postgres';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import path from 'path';
import * as schema from './schema';
import * as schemaPg from './schema.pg';
import { env } from '@/lib/env';

// Singleton pattern to prevent connection exhaustion in serverless/dev
const globalForDb = globalThis as unknown as {
  libsqlClient: ReturnType<typeof createClient> | undefined;
  postgresClient: ReturnType<typeof postgres> | undefined;
};

const useLocalSqlite =
  env.DB_PROVIDER === 'turso' &&
  env.NODE_ENV === 'development' &&
  (env.USE_PROD_DB || '').trim() !== 'true';

const localDbPath = path.resolve(process.cwd(), 'mppolice_local_dev.db');
const fallbackSqliteUrl = `file:${localDbPath}`;
const libsqlUrl = useLocalSqlite
  ? fallbackSqliteUrl
  : (env.TURSO_DATABASE_URL || fallbackSqliteUrl);

const clientInstance =
  env.DB_PROVIDER === 'supabase'
    ? (() => {
        const pgUrl =
          env.SUPABASE_DATABASE_URL ||
          'postgresql://postgres:postgres@localhost:5432/postgres';
        const pgClient =
          globalForDb.postgresClient ??
          postgres(pgUrl, { prepare: false, max: 10 });
        if (!globalForDb.postgresClient && env.NODE_ENV === 'development') {
          console.log('⚡ DB connected [SUPABASE_POSTGRES]');
        }
        if (env.NODE_ENV !== 'production') globalForDb.postgresClient = pgClient;
        return pgClient;
      })()
    : (() => {
        const libsqlClient =
          globalForDb.libsqlClient ??
          createClient({
            url: libsqlUrl,
            authToken: useLocalSqlite ? undefined : (env.TURSO_AUTH_TOKEN || undefined),
          });
        if (!globalForDb.libsqlClient && env.NODE_ENV === 'development') {
          console.log(`🔌 DB connected [${useLocalSqlite ? 'LOCAL_SQLITE' : 'TURSO_REMOTE'}]`);
        }
        if (env.NODE_ENV !== 'production') globalForDb.libsqlClient = libsqlClient;
        return libsqlClient;
      })();

const sqliteDb = drizzleLibsql(clientInstance as ReturnType<typeof createClient>, { schema });
const dbInstance =
  env.DB_PROVIDER === 'supabase'
    ? drizzlePostgres(clientInstance as ReturnType<typeof postgres>, { schema: schemaPg })
    : sqliteDb;

export const client = clientInstance as ReturnType<typeof createClient> | ReturnType<typeof postgres>;
// Both providers expose the same Drizzle query surface. Keep the SQLite schema
// as the application-facing contract so existing typed queries remain stable.
export const db = dbInstance as typeof sqliteDb;
