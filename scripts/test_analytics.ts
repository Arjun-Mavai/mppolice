// Test the analytics functions directly
import { getUnitDistributionStats, getRepeatedQuestions, getMostRepeatedTopics } from '@/actions/pyq-analytics';

async function main() {
  console.log('=== Testing Analytics Functions ===\n');
  
  try {
    console.log('1. Testing getUnitDistributionStats...');
    const stats = await getUnitDistributionStats();
    console.log('Stats count:', stats.length);
    console.log('Sample stat:', stats[0]);
    
    console.log('\n2. Testing getRepeatedQuestions...');
    const repeated = await getRepeatedQuestions();
    console.log('Repeated count:', repeated.length);
    if (repeated.length > 0) {
      console.log('Sample repeated question:', {
        text: repeated[0].text?.substring(0, 50) + '...',
        occurrences: repeated[0].occurrences,
        count: repeated[0].count
      });
    }
    
    console.log('\n3. Testing getMostRepeatedTopics...');
    const topics = await getMostRepeatedTopics();
    console.log('Topics units count:', Object.keys(topics).length);
    
  } catch (error) {
    console.error('ERROR:', error);
  }
}

main().catch(console.error).finally(() => process.exit(0));
