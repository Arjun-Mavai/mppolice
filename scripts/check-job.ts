import 'dotenv/config';
import { db } from '../src/db';
import { pyqContentImportJobs } from '../src/db/schema';
import { desc } from 'drizzle-orm';

async function check() {
  try {
    // get jobs from Turso directly
    console.log("Checking jobs...");
    const jobs = await db.select().from(pyqContentImportJobs).orderBy(desc(pyqContentImportJobs.createdAt)).limit(5);
    
    if (jobs.length > 0) {
      console.log(`Found ${jobs.length} jobs. Latest job ID:`, jobs[0].id);
      console.log("Error Report:", JSON.stringify(jobs[0].errorReport, null, 2));
    } else {
      console.log("NO JOBS FOUND IN TURSO. Trying local sqlite file directly...");
      
      const Database = require('better-sqlite3');
      try {
        const localDb = new Database('./mppsc_local_dev.db');
        const job = localDb.prepare('SELECT id, error_report FROM pyq_content_import_jobs ORDER BY created_at DESC LIMIT 1').get();
        if (job) {
          console.log("FOUND IN LOCAL SQLITE:", job.id);
          console.log(job.error_report);
        } else {
          console.log("Not found in local either.");
        }
      } catch (locErr: any) {
        console.error("Local sqlite read failed:", locErr.message);
      }
    }
  } catch (err) {
    console.error("Critical error:", err);
  } finally {
    process.exit(0);
  }
}
check();
