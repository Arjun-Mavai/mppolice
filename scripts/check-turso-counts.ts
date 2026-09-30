import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

import { createClient } from '@libsql/client';

async function checkTursoCounts() {
  const url = process.env.TURSO_DATABASE_URL!;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  console.log('Connecting to Turso:', url);
  const client = createClient({ url, authToken });

  const tablesResult = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%' AND name NOT LIKE '_drizzle%' ORDER BY name;"
  );

  console.log('\n📊 Turso Tables and Row Counts:');
  for (const row of tablesResult.rows) {
    const tableName = row.name as string;
    try {
      const countRes = await client.execute(`SELECT count(*) as cnt FROM "${tableName}"`);
      console.log(` - ${tableName}: ${countRes.rows[0].cnt} rows`);
    } catch (e: any) {
      console.log(` - ${tableName}: Error counting (${e.message})`);
    }
  }
}

checkTursoCounts().catch(console.error);
