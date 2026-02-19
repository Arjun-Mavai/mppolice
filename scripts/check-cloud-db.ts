import { env } from '@/lib/env';
import { createClient } from '@libsql/client';

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Missing TURSO credentials');
    process.exit(1);
  }

  console.log('Connecting to:', url);
  const client = createClient({ url, authToken });

  try {
    const result = await client.execute('SELECT COUNT(*) as total FROM content_blogs');
    const resultWithExcerpt = await client.execute(
      'SELECT COUNT(*) as with_excerpt FROM content_blogs WHERE excerpt IS NOT NULL'
    );

    console.log('Total Blogs:', result.rows[0].total);
    console.log('Blogs with Excerpt:', resultWithExcerpt.rows[0].with_excerpt);

    // Check column names to be sure
    const tableInfo = await client.execute('PRAGMA table_info(content_blogs)');
    const columns = tableInfo.rows.map((r) => r.name);
    console.log('Columns:', columns);
  } catch (e) {
    console.error('Error checking DB:', e);
  } finally {
    client.close();
  }
}

main();
