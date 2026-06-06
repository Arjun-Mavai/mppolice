import { db } from './src/db/index';
import { tests } from './src/db/schema';
import { like } from 'drizzle-orm';
async function run() {
  const t = await db.select({
    id: tests.id,
    title: tests.title,
    isInstantMode: tests.isInstantMode,
    tags: tests.tags
  }).from(tests).where(like(tests.title, '%Set 9%'));
  console.log(JSON.stringify(t, null, 2));
}
run();
