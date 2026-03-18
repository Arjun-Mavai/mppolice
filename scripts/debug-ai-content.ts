import { db } from '@/db';
import { pyqTopics } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Fetching topics from DB...');
  const result = await db.select().from(pyqTopics).limit(1);
  
  if (result.length > 0) {
    const topic = result[0];
    console.log('Topic:', topic.topicTitle);
    console.log('AI Content Type:', typeof topic.aiContent);
    console.log('AI Content:', JSON.stringify(topic.aiContent, null, 2));
  } else {
    console.log('No topics found.');
  }
}

main().catch(console.error);
