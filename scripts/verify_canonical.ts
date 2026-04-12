import { db } from '@/db';
import { tests, questions } from '@/db/schema';
import { eq, like, or, sql } from 'drizzle-orm';

async function main() {
  // Find all tests matching the scope pattern
  const result = await db.select({
    id: tests.id,
    title: tests.title,
    totalQuestions: tests.totalQuestions
  }).from(tests)
  .where(eq(tests.type, 'PYQ'));
  
  console.log('=== All PYQ Tests matching scope pattern ===');
  for (const row of result) {
    const title = row.title;
    // Check if matches pattern
    if (title.includes('MP Police State Service Prelims') && title.includes('Paper 1') || 
        title.includes('MP Police राज्य सेवा प्रारंभिक') && title.includes('पेपर 1')) {
      const enMatch = title.match(/20\d{2}/);
      const year = enMatch ? enMatch[0] : 'N/A';
      console.log(year + ': ' + row.id + ' - ' + title + ' (' + row.totalQuestions + ' Qs)');
    }
  }
  
  // Now verify question orders for 2025 test
  const test2025 = result.find(t => t.title.includes('2025') && 
    (t.title.includes('MP Police State Service Prelims') && t.title.includes('Paper 1') || 
     t.title.includes('MP Police राज्य सेवा प्रारंभिक') && t.title.includes('पेपर 1')));
  
  if (test2025) {
    console.log('\n=== Sample: 2025 Test Question Orders ===');
    console.log('Test: ' + test2025.title);
    
    const qs = await db.select({
      id: questions.id,
      order: questions.order,
      text: questions.questionText
    }).from(questions)
    .where(eq(questions.testId, test2025.id))
    .orderBy(questions.order)
    .limit(10);
    
    for (const q of qs) {
      console.log('Q' + q.order + ': ' + (q.text || '').substring(0, 80) + '...');
    }
  }
}

main().catch(console.error);
