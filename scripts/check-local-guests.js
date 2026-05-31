import Database from 'better-sqlite3';
const db = new Database('mppolice_local_dev.db');
const counts = db.prepare("SELECT exam_type, count(*) as count FROM guests GROUP BY exam_type").all();
console.table(counts);
