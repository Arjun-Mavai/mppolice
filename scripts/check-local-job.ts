import Database from 'better-sqlite3';

const db = new Database('./mppsc_local_dev.db');
const job = db.prepare('SELECT error_report FROM pyq_content_import_jobs ORDER BY created_at DESC LIMIT 1').get();
if (job) {
    console.log(job.error_report);
} else {
    console.log("No job found in local sqlite");
}
