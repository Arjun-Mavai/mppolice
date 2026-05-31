import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

async function run() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const client = createClient({ url, authToken });

  const result = await client.execute(`SELECT id, name, created_at, exam_type FROM guests ORDER BY created_at DESC LIMIT 10`);
  console.table(result.rows);
  
  const counts = await client.execute(`SELECT exam_type, count(*) as count FROM guests GROUP BY exam_type`);
  console.table(counts.rows);
}
run();
