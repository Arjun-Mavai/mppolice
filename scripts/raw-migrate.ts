import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL || '',
  authToken: process.env.DATABASE_AUTH_TOKEN || '',
});

async function run() {
  try {
    const result = await client.execute("ALTER TABLE `pyq_topics` ADD `ai_content` text;");
    console.log("Success!", result);
  } catch(e) {
    console.error("Error", e);
  } finally {
      process.exit(0);
  }
}
run();
