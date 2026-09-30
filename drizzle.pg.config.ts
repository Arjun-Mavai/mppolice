import { defineConfig } from 'drizzle-kit';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error('SUPABASE_DATABASE_URL is required for the Supabase Drizzle config');
}

export default defineConfig({
  schema: './src/db/schema.pg.ts',
  out: './drizzle-pg',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_DATABASE_URL,
  },
});
