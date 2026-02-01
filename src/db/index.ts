
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const url = process.env.NEXT_PUBLIC_TURSO_URL;
const authToken = process.env.NEXT_PUBLIC_TURSO_TOKEN;

if (!url) {
  throw new Error('NEXT_PUBLIC_TURSO_URL is not defined');
}

if (!authToken) {
  throw new Error('NEXT_PUBLIC_TURSO_TOKEN is not defined');
}

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
