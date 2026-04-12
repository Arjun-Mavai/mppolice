const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

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

function cleanCsvField(field) {
  if (!field) return '';
  // Remove newlines and trim
  return String(field).replace(/\n/g, ' ').replace(/\r/g, '').trim().replace(/"/g, '""');
}

function formatOptions(optionsJson) {
  try {
    const options = JSON.parse(optionsJson);
    if (Array.isArray(options)) {
      return options.map((opt, i) => {
        const letter = opt.id || String.fromCharCode(65 + i);
        const text = (opt.text || opt.text_en || '').replace(/\n/g, ' ').trim();
        return `${letter}) ${text}`;
      }).join(' | ');
    }
  } catch (e) {
    // If JSON parsing fails, return as is
    return (optionsJson || '').replace(/\n/g, ' ').trim();
  }
  return '';
}

async function extractData() {
  const dbPath = './mppolice_local.db';
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
      
      // Create simplified CSV for AI analysis
      const csvRows = ['year,question_id,question_text,options,correct_answer,subject'];
      
      let yearCounts = {};
      
      rows.forEach(row => {
        const year = yearMap[row.test_id];
        const questionText = cleanCsvField(row.question_text || row.question_text_en || '');
        const options = cleanCsvField(formatOptions(row.options));
        const correctAnswer = cleanCsvField(row.correct_answer || '');
        const subject = cleanCsvField(row.subject || '');
        
        // Skip if essential data is missing
        if (!questionText || !options) {
          console.log(`Skipping question ${row.question_id} - missing data`);
          return;
        }
        
        // Count by year
        yearCounts[year] = (yearCounts[year] || 0) + 1;
        
        const csvRow = `${year},"${questionText}","${options}","${correctAnswer}","${subject}"`;
        csvRows.push(csvRow);
      });
      
      // Write CSV file
      const csvContent = csvRows.join('\n');
      fs.writeFileSync('pyq_6_years_analysis.csv', csvContent, 'utf8');
      
      console.log('\n✅ CSV file created: pyq_6_years_analysis.csv');
      console.log(`📊 Total questions: ${csvRows.length - 1}`);
      
      console.log('\n📈 Questions per year:');
      Object.keys(yearCounts).sort().forEach(year => {
        console.log(`  ${year}: ${yearCounts[year]} questions`);
      });
      
      // Show sample data
      console.log('\n🔍 Sample questions:');
      rows.slice(0, 2).forEach((row, i) => {
        const year = yearMap[row.test_id];
        const text = (row.question_text || row.question_text_en || '').substring(0, 80);
        console.log(`  ${i+1}. [${year}] ${text}...`);
      });
      
      console.log('\n🎯 CSV ready for Gemini AI analysis!');
      console.log('📁 File: pyq_6_years_analysis.csv');
      
      db.close();
      resolve(csvRows.length - 1);
    });
  });
}

extractData().catch(console.error);