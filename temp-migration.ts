import { db } from './src/db/index.ts';
import { sql } from 'drizzle-orm';
async function migrate() {
  try {
    await db.run(sql`ALTER TABLE tests ADD COLUMN is_instant_mode integer DEFAULT 0`);
    console.log("Migration successful");
  } catch (e) {
    console.error("Migration failed:", e);
  }
}
migrate();
