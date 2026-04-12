import { createClient } from '@libsql/client';
import { config } from 'dotenv';

// Load environment variables
config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  console.log('🚀 Starting Migration: Adding exam_type column to all relevant tables...');

  const tables = [
    'content_blogs',
    'syllabus_topics',
    'questions',
    'user_attempts',
    'mppsc_users',
    'support_tickets',
    'payment_exit_reasons',
    'free_user_attempts',
    'feedbacks',
    'guests',
    'payments',
    'test_feedback'
  ];

  for (const table of tables) {
    console.log(`⏳ Adding "exam_type" column to "${table}"...`);
    try {
      // Add column with default 'mppolice' to ensure all existing data is marked correctly
      await client.execute(`ALTER TABLE ${table} ADD COLUMN exam_type TEXT NOT NULL DEFAULT 'mppolice';`);
      console.log(`✅ Added "exam_type" column to "${table}" successfully.`);
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log(`ℹ️ "exam_type" already exists in "${table}", skipping.`);
      } else {
        console.error(`❌ Error adding column to "${table}":`, e.message);
      }
    }
  }

  console.log('✨ Migration completed!');
  process.exit(0);
}

migrate();
