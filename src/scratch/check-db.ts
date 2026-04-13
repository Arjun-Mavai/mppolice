import { db } from '../db';
import { mppoliceOneLinerFacts, pyqFactBank } from '../db/schema';
import { sql } from 'drizzle-orm';

async function check() {
  console.log('--- FINAL DB CHECK ---');
  try {
    const counts = await db.run(sql`
      SELECT 
        (SELECT count(*) FROM mppolice_one_liner_facts) as oneliners,
        (SELECT count(*) FROM pyq_fact_bank) as pyqfacts,
        (SELECT count(*) FROM mppsc_users) as users
    `);
    console.log('Counts:', counts.rows[0]);
    
    const tables = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'mppolice%'`);
    console.log('Mppolice Tables:', tables.rows.map(r => r.name));

  } catch (err) {
    console.error('Error:', err);
  }
}

check();
