import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  console.log('🚀 Starting Safe Migration: Adding missing columns to "tests" table...');

  try {
    // 1. Add exam_type column
    console.log('⏳ Adding "exam_type" column...');
    try {
      await client.execute("ALTER TABLE tests ADD COLUMN exam_type TEXT NOT NULL DEFAULT 'mppolice';");
      console.log('✅ Added "exam_type" column successfully.');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('ℹ️ "exam_type" already exists, skipping.');
      } else {
        throw e;
      }
    }

    // 2. Add cutoffs column
    console.log('⏳ Adding "cutoffs" column...');
    try {
      await client.execute("ALTER TABLE tests ADD COLUMN cutoffs TEXT;");
      console.log('✅ Added "cutoffs" column successfully.');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('ℹ️ "cutoffs" already exists, skipping.');
      } else {
        throw e;
      }
    }

    console.log('✨ All migrations completed successfully! No data was deleted.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

migrate();
