import { createClient } from '@libsql/client';
import fs from 'fs';

// Production Turso connection
const client = createClient({
  url: 'libsql://mppsc-test-series-arjun-gurjar.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njk5MTg1MjAsImlkIjoiNmZjZWY3MGEtNDZmYi00OWY5LWE4ZGQtYTMxNDk3MWFjOTlhIiwicmlkIjoiMjVkYTUxNjUtNWM1Yi00Mjc1LWEyNTYtZjlhNDhiNjQyZjA4In0.Uat6fTihImcWMjdZHXe2lmhq2tEfI7hj7TApkWgXdhLIVHnhCXB1yB56kuDpwi51m6f9LHbytvWkNlXHb1znCA'
});

const CANONICAL_TEST_IDS = {
  2023: 'mQ1a9hZoTdfSRfkz40K5C',
};

// Function to generate unique ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Function to create topic slug
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Enhanced topic detection based on question content
function detectTopicFromQuestion(questionText, subject, explanation = '') {
  const text = (questionText + ' ' + explanation).toLowerCase();
  
  // Topic mapping rules based on keywords and patterns
  const topicMaps = {
    // Indian History
    'ancient-indian-history': ['vedic', 'harappa', 'indus valley', 'maurya', 'gupta', 'चंद्रगुप्त', 'अशोक', 'महावीर', 'बुद्ध', 'वैदिक'],
    'medieval-indian-history': ['mughal', 'delhi sultanate', 'akbar', 'aurangzeb', 'शाहजहाँ', 'बाबर', 'हुमायूँ', 'sultan'],
    'modern-indian-history': ['british', 'freedom struggle', 'gandhi', 'nehru', '1857', 'independence', 'महात्मा गांधी', 'स्वतंत्रता'],
    
    // Indian Polity & Constitution  
    'fundamental-rights': ['fundamental rights', 'article 14', 'article 19', 'article 21', 'मौलिक अधिकार', 'अनुच्छेद'],
    'directive-principles': ['directive principles', 'dpsp', 'article 36', 'article 51', 'नीति निदेशक तत्व'],
    'parliament': ['lok sabha', 'rajya sabha', 'parliament', 'लोकसभा', 'राज्यसभा', 'संसद'],
    'president': ['president', 'article 52', 'emergency', 'राष्ट्रपति', 'आपातकाल'],
    'supreme-court': ['supreme court', 'chief justice', 'judicial review', 'उच्चतम न्यायालय'],
    
    // Geography
    'physical-geography': ['mountain', 'river', 'climate', 'monsoon', 'पर्वत', 'नदी', 'जलवायु'],
    'indian-geography': ['western ghats', 'eastern ghats', 'ganga', 'brahmaputra', 'deccan', 'himalayas'],
    'mp-geography': ['narmada', 'chambal', 'betwa', 'satpura', 'vindhya', 'malwa', 'bundelkhand', 'baghelkhand'],
    
    // General Science
    'physics': ['newton', 'light', 'sound', 'electricity', 'प्रकाश', 'ध्वनि', 'विद्युत'],
    'chemistry': ['periodic table', 'acid', 'base', 'carbon', 'रसायन', 'अम्ल', 'क्षार'],
    'biology': ['cell', 'dna', 'photosynthesis', 'evolution', 'कोशिका', 'प्रकाश संश्लेषण'],
    
    // Economy
    'indian-economy': ['gdp', 'inflation', 'reserve bank', 'rbi', 'budget', 'fiscal policy'],
    'economic-planning': ['five year plan', 'planning commission', 'niti aayog'],
    
    // Current Affairs
    'government-schemes': ['scheme', 'yojana', 'योजना', 'mission', 'abhiyan', 'अभियान'],
    'awards-honors': ['award', 'prize', 'honour', 'bharat ratna', 'padma', 'पुरस्कार'],
    
    // MP GK
    'mp-history': ['raja bhoj', 'devi ahilya', 'rani durgavati', 'chanderi', 'mandu', 'bhojpur'],
    'mp-polity': ['madhya pradesh', 'governor', 'chief minister', 'मध्यप्रदेश', 'राज्यपाल'],
    'mp-culture': ['folk dance', 'festival', 'handicrafts', 'लोकनृत्य', 'त्योहार']
  };
  
  // Subject-based default topics
  const subjectDefaults = {
    'Indian History': 'modern-indian-history',
    'Indian Polity': 'fundamental-rights', 
    'Geography': 'indian-geography',
    'General Science': 'biology',
    'Economy': 'indian-economy',
    'Current Affairs': 'government-schemes',
    'MP GK': 'mp-geography',
    'Environment': 'environmental-issues',
    'General Studies': 'miscellaneous'
  };
  
  // Find best matching topic
  for (const [topicSlug, keywords] of Object.entries(topicMaps)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return topicSlug;
      }
    }
  }
  
  // Fallback to subject default
  return subjectDefaults[subject] || 'general-studies';
}

// Function to get topic title from slug
function getTopicTitle(slug) {
  const titleMap = {
    'ancient-indian-history': 'Ancient Indian History',
    'medieval-indian-history': 'Medieval Indian History', 
    'modern-indian-history': 'Modern Indian History',
    'fundamental-rights': 'Fundamental Rights',
    'directive-principles': 'Directive Principles',
    'parliament': 'Parliament',
    'president': 'President',
    'supreme-court': 'Supreme Court',
    'physical-geography': 'Physical Geography',
    'indian-geography': 'Indian Geography',
    'mp-geography': 'MP Geography',
    'physics': 'Physics',
    'chemistry': 'Chemistry',
    'biology': 'Biology',
    'indian-economy': 'Indian Economy',
    'economic-planning': 'Economic Planning',
    'government-schemes': 'Government Schemes',
    'awards-honors': 'Awards & Honours',
    'mp-history': 'MP History',
    'mp-polity': 'MP Polity',
    'mp-culture': 'MP Culture',
    'environmental-issues': 'Environmental Issues',
    'miscellaneous': 'Miscellaneous',
    'general-studies': 'General Studies'
  };
  
  return titleMap[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

async function create2023TopicMappings() {
  console.log('🚀 Creating 2023 PYQ topic mappings...');
  
  try {
    // Get 2023 unmapped questions
    console.log('🔍 Fetching 2023 questions...');
    const questionsResult = await client.execute({
      sql: `
        SELECT 
          q.id,
          q.question_text,
          q.question_text_en,
          q.subject,
          q.explanation,
          q.explanation_en,
          q."order"
        FROM questions q
        LEFT JOIN pyq_question_topics pqt ON q.id = pqt.question_id
        WHERE q.test_id = ?
          AND q.deleted_at IS NULL
          AND pqt.question_id IS NULL
        ORDER BY q."order"
      `,
      args: [CANONICAL_TEST_IDS[2023]]
    });

    const questions = questionsResult.rows;
    console.log(`Found ${questions.length} unmapped 2023 questions`);

    if (questions.length === 0) {
      console.log('✅ All 2023 questions are already mapped!');
      return;
    }

    // Normalize subjects
    const normalizeSubject = (subject) => {
      const subjectMap = {
        'Indian History': ['history', 'इतिहास'],
        'Indian Polity': ['polity', 'constitution', 'संविधान'],  
        'Geography': ['geography', 'भूगोल'],
        'General Science': ['science', 'विज्ञान'],
        'Economy': ['economy', 'अर्थव्यवस्था'],
        'MP GK': ['mp gk', 'madhya pradesh', 'मध्यप्रदेश'],
        'Current Affairs': ['current affairs', 'समसामयिक'],
        'Environment': ['environment', 'पर्यावरण'],
        'General Studies': ['general studies', 'सामान्य अध्ययन']
      };
      
      if (!subject) return 'General Studies';
      const subjectLower = subject.toLowerCase();
      
      for (const [normalized, keywords] of Object.entries(subjectMap)) {
        if (keywords.some(keyword => subjectLower.includes(keyword))) {
          return normalized;
        }
      }
      return subject;
    };

    // Process questions and detect topics
    const topicMappings = [];
    const topicsToCreate = new Map();
    
    for (const question of questions) {
      const normalizedSubject = normalizeSubject(question.subject);
      const questionText = question.question_text || question.question_text_en || '';
      const explanation = question.explanation || question.explanation_en || '';
      
      // Detect topic
      const topicSlug = detectTopicFromQuestion(questionText, normalizedSubject, explanation);
      const topicTitle = getTopicTitle(topicSlug);
      
      // Store topic info
      if (!topicsToCreate.has(topicSlug)) {
        topicsToCreate.set(topicSlug, {
          id: generateId(),
          slug: topicSlug,
          title: topicTitle,
          subject: normalizedSubject
        });
      }
      
      // Store mapping
      topicMappings.push({
        id: generateId(),
        questionId: question.id,
        topicId: topicsToCreate.get(topicSlug).id,
        confidence: 0.8,
        isPrimary: true,
        source: 'ai'
      });
    }

    console.log(`\n📊 Analysis Results:`);
    console.log(`  Topics to create: ${topicsToCreate.size}`);
    console.log(`  Question mappings: ${topicMappings.length}`);

    // Show topic breakdown
    const topicCounts = {};
    topicMappings.forEach(mapping => {
      const topic = Array.from(topicsToCreate.values()).find(t => t.id === mapping.topicId);
      if (topic) {
        topicCounts[topic.title] = (topicCounts[topic.title] || 0) + 1;
      }
    });

    console.log(`\n🏷️ Topic distribution:`);
    Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([topic, count]) => {
        console.log(`    ${topic}: ${count} questions`);
      });

    // Start transaction
    console.log('\n💾 Inserting data...');
    
    // Create topics
    for (const topic of topicsToCreate.values()) {
      try {
        await client.execute({
          sql: `
            INSERT OR IGNORE INTO pyq_topics 
            (id, subject, topic_slug, topic_title, topic_title_en, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            topic.id,
            topic.subject,
            topic.slug,
            topic.title,
            topic.title, // English same as main for now
            1, // is_active
            Math.floor(Date.now() / 1000), // created_at
            Math.floor(Date.now() / 1000)  // updated_at
          ]
        });
      } catch (error) {
        console.log(`⚠️ Topic ${topic.slug} might already exist: ${error.message}`);
      }
    }

    // Create question-topic mappings
    let successCount = 0;
    for (const mapping of topicMappings) {
      try {
        await client.execute({
          sql: `
            INSERT OR IGNORE INTO pyq_question_topics
            (id, question_id, topic_id, confidence, is_primary, source, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            mapping.id,
            mapping.questionId,
            mapping.topicId,
            mapping.confidence,
            mapping.isPrimary ? 1 : 0,
            mapping.source,
            Math.floor(Date.now() / 1000)
          ]
        });
        successCount++;
      } catch (error) {
        console.log(`⚠️ Mapping error for question ${mapping.questionId}: ${error.message}`);
      }
    }

    console.log(`\n✅ Successfully created:`);
    console.log(`    Topics: ${topicsToCreate.size}`);
    console.log(`    Question mappings: ${successCount}/${topicMappings.length}`);

    // Verify final status
    const verifyResult = await client.execute({
      sql: `
        SELECT COUNT(*) as mapped_count
        FROM pyq_question_topics pqt
        JOIN questions q ON pqt.question_id = q.id  
        WHERE q.test_id = ?
      `,
      args: [CANONICAL_TEST_IDS[2023]]
    });

    const mappedCount = verifyResult.rows[0].mapped_count;
    console.log(`\n🎯 Final status: ${mappedCount}/100 questions mapped for 2023`);

    return {
      topicsCreated: topicsToCreate.size,
      mappingsCreated: successCount,
      finalMappedCount: mappedCount
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.close();
  }
}

// Run the update
create2023TopicMappings().catch(console.error);