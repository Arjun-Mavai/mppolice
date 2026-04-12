const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Test IDs for 6 years
const testIds = [
  '5KRVTgTIw07bWNxu20YNl', // 2020
  'ix0FnJV496Rgvw0YHOEFj', // 2021  
  'o_rO3J1tSEACKENOLT9QI', // 2022
  'mQ1a9hZoTdfSRfkz40K5C', // 2023
  '3XmZ0l700BJV3j2FLd0XZ', // 2024
  'D0gf6bklgl3RT-sTnue2n'  // 2025
];

const yearMap = {
  '5KRVTgTIw07bWNxu20YNl': 2020,
  'ix0FnJV496Rgvw0YHOEFj': 2021,
  'o_rO3J1tSEACKENOLT9QI': 2022,
  'mQ1a9hZoTdfSRfkz40K5C': 2023,
  '3XmZ0l700BJV3j2FLd0XZ': 2024,
  'D0gf6bklgl3RT-sTnue2n': 2025
};

// Try different possible database files
const possibleDbs = [
  './mppolice_local.db',
  './local_mppolice.db', 
  './local_test.db',
  './mppolice_local_dev.db'
];

function findDatabase() {
  for (const dbPath of possibleDbs) {
    if (fs.existsSync(dbPath)) {
      console.log(`Found database: ${dbPath}`);
      return dbPath;
    }
  }
  throw new Error('No database file found!');
}

function escapeCsvField(field) {
  if (!field) return '';
  // Convert to string and escape quotes
  const str = String(field).replace(/"/g, '""');
  // Wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str}"`;
  }
  return str;
}

function formatOptions(optionsJson) {
  try {
    const options = JSON.parse(optionsJson);
    if (Array.isArray(options)) {
      return options.map((opt, i) => `${opt.id || String.fromCharCode(65 + i)}) ${opt.text || opt.text_en || ''}`).join(' | ');
    }
  } catch (e) {
    console.error('Error parsing options:', e);
  }
  return optionsJson || '';
}

async function extractData() {
  const dbPath = findDatabase();
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
  
  return new Promise((resolve, reject) => {
    const testIdPlaceholders = testIds.map(() => '?').join(',');
    const query = `
      SELECT 
        q.id as question_id,
        q.test_id,
        q.question_text,
        q.question_text_en, 
        q.options,
        q.correct_answer,
        q.subject,
        q."order" as question_order
      FROM questions q
      WHERE q.test_id IN (${testIdPlaceholders})
        AND q.deleted_at IS NULL
      ORDER BY q.test_id, q."order"
    `;
    
    db.all(query, testIds, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`Found ${rows.length} questions`);
      
      // Create CSV content
      const csvHeader = 'year,question_id,question_text,options,correct_answer,subject';
      const csvRows = [csvHeader];
      
      rows.forEach(row => {
        const year = yearMap[row.test_id];
        const questionText = row.question_text || row.question_text_en || '';
        const options = formatOptions(row.options);
        const correctAnswer = row.correct_answer || '';
        const subject = row.subject || '';
        
        const csvRow = [
          year,
          escapeCsvField(row.question_id),
          escapeCsvField(questionText),
          escapeCsvField(options),
          escapeCsvField(correctAnswer),
          escapeCsvField(subject)
        ].join(',');
        
        csvRows.push(csvRow);
      });
      
      // Write CSV file
      const csvContent = csvRows.join('\n');
      fs.writeFileSync('pyq_6_years_data.csv', csvContent, 'utf8');
      
      console.log('\nCSV file created: pyq_6_years_data.csv');
      console.log(`Total records: ${rows.length}`);
      
      // Show sample data
      console.log('\nSample data (first 3 rows):');
      rows.slice(0, 3).forEach(row => {
        const year = yearMap[row.test_id];
        console.log(`${year}: ${(row.question_text || row.question_text_en || '').substring(0, 100)}...`);
      });
      
      db.close();
      resolve(rows.length);
    });
  });
}

extractData().catch(console.error);