import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

async function runMigration() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Missing Turso credentials');
    process.exit(1);
  }

  console.log(`Connecting to ${url}`);

  const client = createClient({ url, authToken });

  try {
    console.log('Creating intelligence_feedback table if not exists...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS intelligence_feedback (
        "id" TEXT PRIMARY KEY NOT NULL,
        "question_id" TEXT NOT NULL,
        "question_text" TEXT,
        "test_id" TEXT,
        "reaction" TEXT NOT NULL,
        "message" TEXT,
        "is_pro" INTEGER DEFAULT false,
        "source" TEXT,
        "user_id" TEXT,
        "user_name" TEXT,
        "user_mobile" TEXT,
        "user_email" TEXT,
        "exam_type" TEXT DEFAULT 'mppolice' NOT NULL,
        "created_at" INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);
    console.log('Successfully created intelligence_feedback table');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.close();
  }
}

runMigration();
