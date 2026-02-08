
import { defineConfig } from 'drizzle-kit';
import path from 'path';
// import * as dotenv from 'dotenv';

// dotenv.config();

const localDbPath = `file:${path.resolve(process.cwd(), 'db.sqlite')}`;
const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: isDev ? 'sqlite' : 'turso', 
  dbCredentials: {
    // Agar development hai toh local file uthao, warna cloud URL
    url: isDev ? localDbPath : (process.env.TURSO_DATABASE_URL || ''),
    authToken: isDev ? undefined : process.env.TURSO_AUTH_TOKEN,
  },
});
