import { defineConfig } from 'drizzle-kit';
import path from 'path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

const localDbPath = `file:${path.resolve(
  process.cwd(),
  'mppolice_local_dev.db'
)}`;

const nodeEnv = process.env.NODE_ENV || 'development';
const provider = process.env.DB_PROVIDER || 'turso';
const useLocalSqlite =
  provider === 'turso' &&
  nodeEnv === 'development' &&
  (process.env.USE_PROD_DB || '').trim() !== 'true';

if (provider === 'supabase') {
  console.log('⚡ drizzle-kit: SUPABASE PostgreSQL');
} else if (useLocalSqlite) {
  console.log('🛠️ drizzle-kit: LOCAL SQLite', localDbPath);
} else {
  console.log('🌐 drizzle-kit: Turso / remote');
}

console.log(
  '📍 Target:',
  provider === 'supabase'
    ? process.env.SUPABASE_DATABASE_URL
    : useLocalSqlite
      ? localDbPath
      : process.env.TURSO_DATABASE_URL
);

if (provider === 'turso' && !useLocalSqlite && !process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL is required when not using local SQLite');
}

if (provider === 'supabase' && !process.env.SUPABASE_DATABASE_URL) {
  throw new Error('SUPABASE_DATABASE_URL is required when DB_PROVIDER=supabase');
}

export default defineConfig({
  schema: provider === 'supabase' ? './src/db/schema.pg.ts' : './src/db/schema.ts',
  out: provider === 'supabase' ? './drizzle-pg' : './drizzle',
  dialect: provider === 'supabase' ? 'postgresql' : useLocalSqlite ? 'sqlite' : 'turso',
  dbCredentials: {
    url: provider === 'supabase'
      ? process.env.SUPABASE_DATABASE_URL!
      : useLocalSqlite
        ? localDbPath
        : process.env.TURSO_DATABASE_URL!,
    authToken: provider === 'turso' && !useLocalSqlite ? process.env.TURSO_AUTH_TOKEN : undefined,
  },
});
