import { db } from './src/db/index.ts';
import { tests } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
async function run() {
  const misc = await db.select({ id: tests.id, isInstantMode: tests.isInstantMode }).from(tests).where(eq(tests.type, 'MISC')).limit(5);
  console.log(misc);
}
run();
