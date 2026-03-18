import 'dotenv/config';
import { db } from '../src/db';
import { pyqFactBank, pyqTopics } from '../src/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  const stats = await db
    .select({
      subject: pyqFactBank.subject,
      status: pyqFactBank.status,
      count: sql<number>`count(*)`,
    })
    .from(pyqFactBank)
    .groupBy(pyqFactBank.subject, pyqFactBank.status);
    
  console.log('\n--- Fact Bank Stats ---');
  console.table(stats);

  const topicStats = await db.select({
    id: pyqTopics.id,
    subject: pyqTopics.subject,
    deepLearning: sql`json_extract(ai_content, '$.deep_learning')`
  }).from(pyqTopics).limit(1).catch(() => null);

  console.log('\n--- Checking pyqTopics structure ---');
  console.log(topicStats ? "Query succeeded" : "No ai_content field on pyqTopics or table issues");

  process.exit(0);
}
main();
