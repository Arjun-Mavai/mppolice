import { db } from './src/db/index';
import { tests } from './src/db/schema';
import { inArray } from 'drizzle-orm';
async function run() {
  const t = await db.select({
    id: tests.id,
    title: tests.title,
    isInstantMode: tests.isInstantMode,
    tags: tests.tags
  }).from(tests).where(inArray(tests.id, ['yuOCUs4DjTI9wfdDZ90SI', 'aPuOgjYfnfIvodspZDT_n', 'Jr-l8FC9E53TPQ8JqOkma']));
  console.log(JSON.stringify(t, null, 2));
}
run();
