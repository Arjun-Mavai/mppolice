
import { defineConfig } from 'drizzle-kit';
import path from 'path';

const localDbPath = `file:${path.resolve(process.cwd(), 'db.sqlite')}`;
const isDev = process.env.NODE_ENV === 'development';

// Fail fast in production if Turso credentials are missing
if (!isDev && !process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL is required in production');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: isDev ? 'sqlite' : 'turso', 
  dbCredentials: {
    url: isDev ? localDbPath : process.env.TURSO_DATABASE_URL!,
    authToken: isDev ? undefined : process.env.TURSO_AUTH_TOKEN,
  },
});
