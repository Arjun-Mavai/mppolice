import { db } from '@/db';
import { mppscUsers, tests, questions, pyqFactBank, mppoliceOneLinerFacts } from '@/db/schema';
import { count, eq } from 'drizzle-orm';

async function testAppDbConnection() {
  console.log('🧪 Testing App DB Client (Supabase PostgreSQL)...');

  const [usersCount] = await db.select({ val: count() }).from(mppscUsers);
  console.log(`✓ Users count: ${usersCount.val}`);

  const [testsCount] = await db.select({ val: count() }).from(tests);
  console.log(`✓ Tests count: ${testsCount.val}`);

  const [questionsCount] = await db.select({ val: count() }).from(questions);
  console.log(`✓ Questions count: ${questionsCount.val}`);

  const [factsCount] = await db.select({ val: count() }).from(pyqFactBank);
  console.log(`✓ PYQ Fact Bank count: ${factsCount.val}`);

  const [oneLinersCount] = await db.select({ val: count() }).from(mppoliceOneLinerFacts);
  console.log(`✓ MP Police One Liners count: ${oneLinersCount.val}`);

  // Test selecting sample data with relations
  const sampleTest = await db.select().from(tests).limit(1);
  console.log(`✓ Sample test fetched: "${sampleTest[0]?.title}" (slug: ${sampleTest[0]?.slug})`);

  const sampleUser = await db.select({ email: mppscUsers.email, role: mppscUsers.role }).from(mppscUsers).limit(2);
  console.log('✓ Sample users fetched:', sampleUser);

  console.log('\n🎉 ALL DATABASE INTEGRATION CHECKS PASSED!');
  process.exit(0);
}

testAppDbConnection().catch((err) => {
  console.error('❌ App DB Client test failed:', err);
  process.exit(1);
});
