import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL || '',
  authToken: process.env.DATABASE_AUTH_TOKEN || '',
});

async function run() {
  try {
    const result = await client.execute("PRAGMA table_info(pyq_topics);");
    const columns = result.rows.map(r => r.name);
    console.log("Columns in pyq_topics:", columns.join(', '));
    if (columns.includes('ai_content')) {
        console.log("✅ ai_content is confirmed to exist!");
    } else {
        console.log("❌ ai_content is MISSING!");
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
