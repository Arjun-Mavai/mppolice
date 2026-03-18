import { config } from 'dotenv';
config({ path: '.env' });
console.log("URL:", process.env.TURSO_DATABASE_URL ? "Exists" : "Missing");

import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function force() {
  try {
    console.log("Forcing ALTER TABLE pyq_topics ADD COLUMN ai_content text");
    await db.run(sql`ALTER TABLE pyq_topics ADD COLUMN ai_content text;`);
    console.log("Column added successfully!");
  } catch (err: any) {
    if (err.message && err.message.includes("duplicate column name")) {
        console.log("Column ai_content already exists!");
    } else {
        console.error("Error:", err.message);
    }
  } finally {
    process.exit(0);
  }
}
force();
