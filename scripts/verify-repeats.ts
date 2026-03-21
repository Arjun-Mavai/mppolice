import 'dotenv/config';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { getRepeatedQuestions } from '@/actions/pyq-analytics';

async function verifyRepeats() {
  console.log('Verifying Repeated Questions Logic...');
  
  const repeated = await getRepeatedQuestions();
  
  console.log(`Found ${repeated.length} repeated clusters.`);
  
  if (repeated.length === 0) {
      console.log('No repeated questions found. Check FTS setup?');
      return;
  }

  // Distribution of counts
  const counts: Record<number, number> = {};
  repeated.forEach(r => {
      counts[r.count] = (counts[r.count] || 0) + 1;
  });
  console.log('Repeated Counts Distribution:', counts);

  // Print top 5 clusters
  console.log('\n--- Top 5 Clusters ---');
  repeated.slice(0, 5).forEach((r, i) => {
      console.log(`\nCluster #${i + 1} (Count: ${r.count}x)`);
      console.log(`Text: ${r.text.substring(0, 100)}...`);
      console.log('Occurrences:');
      r.occurrences.forEach(occ => {
          console.log(`  - ${occ.year} (Q.${occ.qNo})`);
      });
      console.log('Unit:', r.unit);
  });
}

verifyRepeats().catch(console.error);
