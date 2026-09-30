import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

import postgres from 'postgres';

async function checkSupabase() {
  const url = process.env.SUPABASE_DATABASE_URL!;
  console.log('Connecting to Supabase:', url.replace(/:[^:@]+@/, ':***@'));
  const sql = postgres(url, { prepare: false, max: 1 });

  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;

  console.log('Existing public tables in Supabase:');
  for (const t of tables) {
    const [{ count }] = await sql`SELECT count(*)::int as count FROM ${sql(t.table_name)}`;
    console.log(` - ${t.table_name}: ${count} rows`);
  }

  await sql.end();
}

checkSupabase().catch(console.error);
