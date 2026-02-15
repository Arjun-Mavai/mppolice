import { getSyllabusTopics } from '@/actions/getSyllabusTopics';

async function main() {
  console.log('Testing getSyllabusTopics...');
  try {
    const result = await getSyllabusTopics();
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Critical Failure:', e);
  }
}

main();
