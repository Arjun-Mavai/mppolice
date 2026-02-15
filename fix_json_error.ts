import 'dotenv/config';
import { db } from '@/db';
import { syllabusTopics } from '@/db/schema';
import { sql } from 'drizzle-orm';

async function fix() {
  console.log('Fixing JSON error...');
  try {
    // Set aiContent and aiContentEn to NULL for all rows
    // This clears any bad data that is causing JSON parse errors
    await db.update(syllabusTopics).set({
      aiContent: null,
      aiContentEn: null,
    });
    console.log('✅ Successfully cleared aiContent columns. App should work now.');
  } catch (e) {
    console.error('Error fixing DB:', e);
  }
  process.exit(0);
}

fix();
