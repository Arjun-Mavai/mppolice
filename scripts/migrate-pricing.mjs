import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') });
config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const client = createClient({ url, authToken });

async function migrate() {
  console.log('🚀 Starting Pricing Migration on Prod...');

  try {
    // 1. Create the new table structure
    await client.execute(`
      CREATE TABLE IF NOT EXISTS pricing_config_new (
        exam_type TEXT PRIMARY KEY,
        lite_price INTEGER DEFAULT 99,
        lite_original_price INTEGER DEFAULT 299,
        lite_validity_text TEXT DEFAULT 'Valid till Exam',
        lite_months INTEGER DEFAULT 8,
        pro_price INTEGER DEFAULT 299,
        pro_original_price INTEGER DEFAULT 999,
        pro_validity_text TEXT DEFAULT 'Valid for 1 Year',
        pro_months INTEGER DEFAULT 12,
        upgrade_price INTEGER DEFAULT 199,
        upgrade_original_price INTEGER DEFAULT 299,
        urgency_text TEXT DEFAULT 'Special Offer',
        urgency_text_hi TEXT DEFAULT 'विशेष ऑफर',
        students_bought INTEGER DEFAULT 23,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // 2. Try to copy existing 'default' data to 'mppsc'
    try {
      await client.execute(`
        INSERT INTO pricing_config_new (
          exam_type, lite_price, lite_original_price, lite_validity_text, lite_months,
          pro_price, pro_original_price, pro_validity_text, pro_months,
          upgrade_price, upgrade_original_price, urgency_text, urgency_text_hi,
          students_bought, updated_at
        )
        SELECT 
          'mppsc', lite_price, lite_original_price, lite_validity_text, lite_months,
          pro_price, pro_original_price, pro_validity_text, pro_months,
          upgrade_price, upgrade_original_price, urgency_text, urgency_text_hi,
          students_bought, updated_at
        FROM pricing_config
        WHERE id = 'default'
      `);
      console.log('✅ Migrated MPPSC data from existing default row.');
    } catch (e) {
      console.warn('⚠️ No existing pricing_config data found or migration failed. Using defaults for MPPSC.');
      await client.execute(`INSERT OR IGNORE INTO pricing_config_new (exam_type) VALUES ('mppsc')`);
    }

    // 3. Ensure MPPOLICE and UPSC rows exist
    await client.execute(`INSERT OR IGNORE INTO pricing_config_new (exam_type) VALUES ('mppolice')`);
    await client.execute(`INSERT OR IGNORE INTO pricing_config_new (exam_type) VALUES ('upsc')`);
    console.log('✅ Initialized MPPOLICE and UPSC rows.');

    // 4. Swap tables
    await client.execute(`DROP TABLE IF EXISTS pricing_config_old`);
    await client.execute(`ALTER TABLE pricing_config RENAME TO pricing_config_old`);
    await client.execute(`ALTER TABLE pricing_config_new RENAME TO pricing_config`);
    console.log('✅ Swapped tables successfully.');

    console.log('🎉 Migration Complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
