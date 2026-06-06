import { db } from './src/db/index.ts';
import { sql } from 'drizzle-orm';
async function run() {
  try {
    // Safely update only free MISC quizzes
    const result = await db.run(sql`UPDATE tests SET is_instant_mode = 0 WHERE type = 'MISC' AND is_free_access = 1`);
    console.log("Successfully turned off instant mode for all free quizzes:", result);
  } catch (error) {
    console.error("Failed:", error);
  }
}
run();
