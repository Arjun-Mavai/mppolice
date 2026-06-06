import { db } from './src/db/index';
import { sql } from 'drizzle-orm';
async function run() {
  const res = await db.all(sql`SELECT id, title, is_instant_mode FROM tests WHERE type='MISC' LIMIT 5`);
  console.log(res);
}
run();
