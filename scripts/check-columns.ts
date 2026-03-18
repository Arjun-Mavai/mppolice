import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://mppsc-test-series-arjun-gurjar.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njk5MTg1MjAsImlkIjoiNmZjZWY3MGEtNDZmYi00OWY5LWE4ZGQtYTMxNDk3MWFjOTlhIiwicmlkIjoiMjVkYTUxNjUtNWM1Yi00Mjc1LWEyNTYtZjlhNDhiNjQyZjA4In0.Uat6fTihImcWMjdZHXe2lmhq2tEfI7hj7TApkWgXdhLIVHnhCXB1yB56kuDpwi51m6f9LHbytvWkNlXHb1znCA',
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
