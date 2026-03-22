import 'dotenv/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import path from 'path';

// Force local DB connection for this script as requested
const dbPath = path.resolve(process.cwd(), 'mppsc_local_dev.db');
const client = createClient({ url: `file:${dbPath}` });
const db = drizzle(client);

async function setupFts() {
  console.log('Setting up FTS5 Virtual Table...');

  try {
    // 1. Drop existing table to ensure clean state
    await db.run(sql`DROP TABLE IF EXISTS questions_fts`);
    
    // 2. Create FTS5 virtual table
    // tokenize='unicode61' supports Unicode characters including Hindi
    await db.run(sql`
      CREATE VIRTUAL TABLE questions_fts USING fts5(
        id UNINDEXED, 
        testId UNINDEXED, 
        questionText, 
        tokenize='unicode61'
      );
    `);
    console.log('✅ Created questions_fts virtual table');

    // 3. Populate with existing data
    // We concatenate Hindi (questionText) and English (questionTextEn) for better search coverage
    const start = Date.now();
    
    await db.run(sql`
      INSERT INTO questions_fts(id, testId, questionText) 
      SELECT 
        id, 
        test_id, 
        COALESCE(question_text, '') || ' ' || COALESCE(question_text_en, '')
      FROM questions
    `);
    
    console.log(`✅ Populated questions_fts table in ${Date.now() - start}ms`);

    // Verify count
    const result = await db.all(sql`SELECT COUNT(*) as count FROM questions_fts`);
    console.log(`Total rows in FTS index: ${(result[0] as any).count}`);

  } catch (error) {
    console.error('Error setting up FTS:', error);
    process.exit(1);
  }
}

setupFts().then(() => process.exit(0));
