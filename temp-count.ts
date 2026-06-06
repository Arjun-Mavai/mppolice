import { db } from './src/db/index';
import { sql } from 'drizzle-orm';
async function run() {
  const allMisc = await db.all(sql`SELECT COUNT(*) as c FROM tests WHERE type='MISC' AND exam_type='mppolice'`);
  const freeMisc = await db.all(sql`SELECT COUNT(*) as c FROM tests WHERE type='MISC' AND exam_type='mppolice' AND is_free_access=1 AND is_hidden=0`);
  console.log("All MISC:", allMisc);
  console.log("Free Visible MISC:", freeMisc);
}
run();
