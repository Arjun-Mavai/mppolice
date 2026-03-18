import { getPyqPublishedTopicsBySubject } from '@/features/tests/actions/pyq-insights';

async function main() {
  console.log('Fetching topics for History...');
  const topics = await getPyqPublishedTopicsBySubject('History');
  console.log(`Found ${topics.length} topics.`);
  
  if (topics.length > 0) {
    const first = topics[0];
    console.log('First Topic:', first.topicTitle);
    console.log('AI Content Type:', typeof first.aiContent);
    console.log('AI Content:', JSON.stringify(first.aiContent, null, 2));
  }
}

main().catch(console.error);
