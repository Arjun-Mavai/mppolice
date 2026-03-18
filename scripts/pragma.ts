import { createClient } from '@libsql/client';
const client = createClient({
  url: process.env.DATABASE_URL || '',
  authToken: process.env.DATABASE_AUTH_TOKEN || '',
});
async function run() {
  const result = await client.execute("PRAGMA table_info(pyq_topics);");
  console.log(result.rows);
  process.exit(0);
}
run();
