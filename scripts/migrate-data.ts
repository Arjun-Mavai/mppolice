import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

import { createClient } from '@libsql/client';
import postgres from 'postgres';

const tursoUrl = process.env.TURSO_DATABASE_URL!;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const supabaseUrl = process.env.SUPABASE_DATABASE_URL!;

if (!tursoUrl || !supabaseUrl) {
  console.error('❌ Missing database URLs in environment!');
  process.exit(1);
}

const turso = createClient({ url: tursoUrl, authToken: tursoToken });
const pg = postgres(supabaseUrl, { prepare: false, max: 10 });

// Ordered dependency list: parent tables before child tables
const TABLES_IN_ORDER = [
  'system_settings',
  'pricing_config',
  'test_attempt_limits',
  'verification_tokens',
  'guests',
  'mppsc_users',
  'tests',
  'syllabus_topics',
  'content_blogs',
  'support_tickets',
  'payment_exit_reasons',
  'feedbacks',
  'pyq_topics',
  'mppolice_one_liner_facts',
  'pyq_content_import_jobs',
  'pyq_unit_cache',
  'questions',
  'pyq_question_topics',
  'pyq_fact_bank',
  'pyq_topic_trends',
  'pyq_repeated_cache',
  'mppolice_one_liner_revisions',
  'user_attempts',
  'attempt_answers',
  'topic_revisions',
  'test_leaderboard',
  'free_quiz_attempts',
  'mppsc_user_activities',
  'payments',
  'test_feedback',
  'intelligence_feedback',
  'support_conversations',
  'support_messages',
];

// Helper to convert timestamp values
function formatTimestamp(val: any): string | null {
  if (val === null || val === undefined || val === '') return null;
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'number') {
    const ms = val > 1e11 ? val : val * 1000;
    return new Date(ms).toISOString();
  }
  if (typeof val === 'string') {
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      const ms = num > 1e11 ? num : num * 1000;
      return new Date(ms).toISOString();
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

// Helper to format JSON values
function formatJson(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val === 'object') return JSON.stringify(val);
  if (typeof val === 'string') {
    try {
      JSON.parse(val);
      return val;
    } catch {
      return JSON.stringify(val);
    }
  }
  return JSON.stringify(val);
}

// Helper to format boolean values
function formatBoolean(val: any): boolean | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim();
    return lower === '1' || lower === 'true';
  }
  return Boolean(val);
}

async function getPgColumnTypes(tableName: string) {
  const cols = await pg`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = ${tableName} AND table_schema = 'public';
  `;
  const map: Record<string, { type: string; udt: string }> = {};
  for (const c of cols) {
    map[c.column_name] = { type: c.data_type, udt: c.udt_name };
  }
  return map;
}

async function migrateTable(tableName: string) {
  const pgCols = await getPgColumnTypes(tableName);
  if (Object.keys(pgCols).length === 0) {
    console.log(`⚠️ Table ${tableName} does not exist in Supabase Postgres, skipping.`);
    return;
  }

  // Get total count from Turso
  let totalRows = 0;
  try {
    const countRes = await turso.execute(`SELECT count(*) as cnt FROM "${tableName}"`);
    totalRows = Number(countRes.rows[0].cnt);
  } catch (e: any) {
    console.log(`⚠️ Could not query ${tableName} in Turso (${e.message}), skipping.`);
    return;
  }

  if (totalRows === 0) {
    console.log(`ℹ️ ${tableName}: 0 rows in Turso.`);
    return;
  }

  console.log(`\n🚚 Migrating ${tableName} (${totalRows} rows)...`);

  const CHUNK_SIZE = 500;
  let offset = 0;
  let migratedCount = 0;

  while (offset < totalRows) {
    const batch = await turso.execute(
      `SELECT * FROM "${tableName}" LIMIT ${CHUNK_SIZE} OFFSET ${offset}`
    );

    if (batch.rows.length === 0) break;

    const formattedRows: Record<string, any>[] = [];

    for (const rawRow of batch.rows) {
      const row: Record<string, any> = {};
      for (const [colName, val] of Object.entries(rawRow)) {
        if (!pgCols[colName]) continue; // Column not in PG table

        const { type } = pgCols[colName];

        if (val === null || val === undefined) {
          row[colName] = null;
          continue;
        }

        if (type.includes('timestamp') || type.includes('date')) {
          row[colName] = formatTimestamp(val);
        } else if (type === 'boolean') {
          row[colName] = formatBoolean(val);
        } else if (type === 'jsonb' || type === 'json') {
          row[colName] = formatJson(val);
        } else if (type.includes('int') || type === 'bigint' || type === 'smallint') {
          row[colName] = typeof val === 'number' ? Math.round(val) : parseInt(String(val), 10);
        } else if (type === 'double precision' || type === 'real' || type === 'numeric') {
          row[colName] = typeof val === 'number' ? val : parseFloat(String(val));
        } else {
          row[colName] = String(val);
        }
      }
      formattedRows.push(row);
    }

    if (formattedRows.length > 0) {
      // Chunk insert into Postgres
      const colNames = Object.keys(formattedRows[0]);
      try {
        await pg`
          INSERT INTO ${pg(tableName)} ${pg(formattedRows, ...colNames)}
          ON CONFLICT DO NOTHING
        `;
        migratedCount += formattedRows.length;
      } catch (err: any) {
        console.error(`❌ Batch insert error on ${tableName} at offset ${offset}:`, err.message);
        // Fallback row by row for precise error tracking
        for (const singleRow of formattedRows) {
          try {
            await pg`
              INSERT INTO ${pg(tableName)} ${pg(singleRow, ...Object.keys(singleRow))}
              ON CONFLICT DO NOTHING
            `;
            migratedCount++;
          } catch (rowErr: any) {
            console.error(`   Failed row in ${tableName}:`, rowErr.message, singleRow);
          }
        }
      }
    }

    offset += CHUNK_SIZE;
    process.stdout.write(`   ↳ Processed ${Math.min(offset, totalRows)}/${totalRows} rows\r`);
  }

  // Get final Postgres count
  const [{ count }] = await pg`SELECT count(*)::int as count FROM ${pg(tableName)}`;
  console.log(`\n✅ ${tableName} complete: Turso=${totalRows}, Supabase=${count}`);
}

async function runMigration() {
  console.log('🚀 Starting Data Migration from Turso to Supabase Postgres...');
  console.log('Turso:', tursoUrl);
  console.log('Supabase:', supabaseUrl.replace(/:[^:@]+@/, ':***@'));

  for (const table of TABLES_IN_ORDER) {
    await migrateTable(table);
  }

  console.log('\n🎉 ALL TABLES MIGRATED SUCCESSFULLY!');
  await pg.end();
}

runMigration().catch((err) => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
