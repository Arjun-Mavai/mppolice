import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error('Missing TURSO credentials: set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN');
}

const client = createClient({
  url,
  authToken,
});

const CANONICAL_TEST_IDS = {
  2020: '5KRVTgTIw07bWNxu20YNl',
  2021: 'ix0FnJV496Rgvw0YHOEFj',
  2022: 'o_rO3J1tSEACKENOLT9QI',
  2023: 'mQ1a9hZoTdfSRfkz40K5C',
  2024: '3XmZ0l700BJV3j2FLd0XZ',
  2025: 'D0gf6bklgl3RT-sTnue2n',
};

async function check() {
  for (const [year, testId] of Object.entries(CANONICAL_TEST_IDS)) {
    try {
        const res = await client.execute({
        sql: 'SELECT COUNT(*) as count FROM questions WHERE test_id = ? AND deleted_at IS NULL',
        args: [testId]
        });
        console.log(`Year ${year}: ${res.rows[0].count} unique questions`);
        
        const mappedRes = await client.execute({
        sql: 'SELECT COUNT(DISTINCT question_id) as mapped_count, COUNT(*) as all_mappings FROM pyq_question_topics pqt JOIN questions q ON pqt.question_id = q.id WHERE q.test_id = ? AND q.deleted_at IS NULL AND pqt.is_primary = 1',
        args: [testId]
        });
        console.log(`  -> Unique Mapped Qs: ${mappedRes.rows[0].mapped_count}, Total Primary Mappings: ${mappedRes.rows[0].all_mappings}`);
    } catch(e: any) { console.error(e) }
  }
}

check().then(() => client.close()).catch(console.error);
