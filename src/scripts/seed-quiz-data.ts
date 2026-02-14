import 'dotenv/config';
import { db } from '@/db';
import { tests, questions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Real MPPSC Data for Unit 1 (History, Culture & Literature of MP)
const realUnit1Questions = [
  {
    question:
      'The Arab writer Al-Biruni has provided a description of which Kalachuri ruler and his capital Tripuri?',
    options: ['Kokalla I', 'Gangeyadeva', 'Karna', 'Lakshmikarna'],
    correctAnswer: 1,
    explanation:
      'Al-Biruni mentioned the Kalachuri ruler Gangeyadeva and his capital Tripuri. Gangeyadeva assumed titles like Paramabhattaraka Maharajadhiraja Parameshvara.',
  },
  {
    question:
      'Who among the following was an Indian revolutionary who fought against the British in the Indian Rebellion of 1857 and was hanged in Port Blair on December 29, 1876?',
    options: ['Tantia Tope', 'Bhima Nayak', 'Raghunath Shah', 'Shankar Shah'],
    correctAnswer: 1,
    explanation:
      'Bhima Nayak was a significant revolutionary during the 1857 Rebellion. He was convicted and hanged in Port Blair on December 29, 1876.',
  },
  {
    question:
      "In inscriptions, the ruler Ashoka is mentioned in the form of 'Piyadasi and Devanampriyra'. In the Puranas, Ashoka is known as which of the following?",
    options: ['Samudragupta', 'Chandragupta', 'Ashok Vardhan', 'Bindusara'],
    correctAnswer: 2,
    explanation: 'In the Puranas, The Mauryan King Ashoka is identified as Ashok Vardhan.',
  },
  {
    question: 'Bhimbetka rock shelters were discovered by?',
    options: ['V.S. Wakankar', 'H.D. Sankalia', 'R.B. Daya Ram Sahni', 'R.D. Banerji'],
    correctAnswer: 0,
    explanation: 'Bhimbetka rock shelters were discovered by Dr. Vishnu Shridhar Wakankar in 1957.',
  },
  {
    question: 'Where is the headquarters of MPPSC located?',
    options: ['Bhopal', 'Gwalior', 'Indore', 'Jabalpur'],
    correctAnswer: 2,
    explanation: 'The headquarters of MPPSC is located in Indore, Madhya Pradesh.',
  },
  {
    question: 'Which Dynasty built the famous Khajuraho Temples?',
    options: ['Paramara', 'Chandela', 'Kalachuri', 'Bundela'],
    correctAnswer: 1,
    explanation:
      'The Khajuraho Group of Monuments was built by the Chandela dynasty between 950 AD and 1050 AD.',
  },
  {
    question: 'Who was the founder of the Paramara Dynasty of Malwa?',
    options: ['Raja Bhoj', 'Upendra/Krishnaraja', 'Siyaka II', 'Vakpati Munja'],
    correctAnswer: 1,
    explanation:
      'Upendra (also known as Krishnaraja) was the founder of the Paramara dynasty in the early 9th century.',
  },
  {
    question: "The 'Baghelkhand Agency' was merged into which state in 1948?",
    options: ['Vindhya Pradesh', 'Madhya Bharat', 'Bhopal State', 'Central Provinces'],
    correctAnswer: 0,
    explanation:
      'Baghelkhand Agency was merged with Bundelkhand Agency to form Vindhya Pradesh in 1948.',
  },
  {
    question: "Which tribal personality of MP is known as 'Robin Hood of Nimar'?",
    options: ['Tantia Bhil', 'Bhima Nayak', 'Khajya Nayak', 'Ganjan Singh Korku'],
    correctAnswer: 1,
    explanation:
      'Bhima Nayak is often referred to as the Robin Hood of Nimar for his role in the 1857 revolt.',
  },
  {
    question: "The famous 'Matki Dance' is associated with which region of Madhya Pradesh?",
    options: ['Bundelkhand', 'Baghelkhand', 'Malwa', 'Nimar'],
    correctAnswer: 2,
    explanation:
      'Matki Dance is a popular folk dance of the Malwa region, usually performed on weddings and festivals.',
  },
  {
    question: "Who wrote 'Bikhare Moti'?",
    options: [
      'Subhadra Kumari Chauhan',
      'Makhanlal Chaturvedi',
      'Harishankar Parsai',
      'Sharad Joshi',
    ],
    correctAnswer: 0,
    explanation:
      "Subhadra Kumari Chauhan is the author of the famous poem collection 'Bikhare Moti'.",
  },
  {
    question: 'Where is the tomb of Tansen located?',
    options: ['Bhopal', 'Gwalior', 'Agra', 'Rewa'],
    correctAnswer: 1,
    explanation: 'The tomb of Great Musician Tansen is located in Gwalior.',
  },
  {
    question: "The 'Ujjain Kumbh Mela' is held on the banks of which river?",
    options: ['Narmada', 'Kshipra', 'Betwa', 'Chambal'],
    correctAnswer: 1,
    explanation: 'The Simhastha Kumbh Mela in Ujjain is held on the banks of the Kshipra river.',
  },
  {
    question: 'Which of the following is the Folk Drama of Bhil Tribe?',
    options: ['Gavri', 'Swang', 'Nautanki', 'Maach'],
    correctAnswer: 0,
    explanation: 'Gavri is a famous religious folk drama of the Bhil tribe.',
  },
  {
    question: "'Phadke Studio' for sculpture is located in which district?",
    options: ['Indore', 'Dhar', 'Ujjain', 'Ratlam'],
    correctAnswer: 1,
    explanation: 'Phadke Studio is a famous center for sculpture art located in Dhar district.',
  },
  // Adding more questions to reach ~20-30...
  {
    question: "The 'Hinglajgarh Fort' is located in which district of MP?",
    options: ['Mandsaur', 'Neemuch', 'Ratlam', 'Rajgarh'],
    correctAnswer: 0,
    explanation: 'Hinglajgarh Fort is an ancient fort located in the Mandsaur district.',
  },
  {
    question: 'Who was the first woman ruler of Bhopal?',
    options: ['Sultan Jahan Begum', 'Sikandar Jahan Begum', 'Qudsia Begum', 'Shah Jahan Begum'],
    correctAnswer: 2,
    explanation:
      'Qudsia Begum (also known as Gohar Begum) was the first female ruler of Bhopal (1819–1837).',
  },
  {
    question: "The 'Jahangir Mahal' is located at?",
    options: ['Mandu', 'Orchha', 'Gwalior', 'Chanderi'],
    correctAnswer: 1,
    explanation:
      'Jahangir Mahal is a citadel and garrison located in Orchha, built by Vir Singh Deo.',
  },
  {
    question:
      "Which poet is known as the 'Shakespeare of India' in Hindi Literature context (often compared)?",
    options: ['Kalidasa', 'Bhavabhuti', 'Banabhatta', 'Bhartrihari'],
    correctAnswer: 0,
    explanation:
      'Kalidasa is widely regarded as the greatest poet and dramatist in the Sanskrit language.',
  },
  {
    question: "Where is the 'Indira Gandhi Rashtriya Manav Sangrahalaya' situated?",
    options: ['New Delhi', 'Mumbai', 'Bhopal', 'Hyderabad'],
    correctAnswer: 2,
    explanation:
      'It is located in Bhopal and is the only museum of its kind in India dedicated to the evolution of man.',
  },
];

// Real MPPSC FLT Questions (Research Based 2024-25 Data)
const realFLTQuestions = [
  {
    question: "Which of the following creates the 'Satpura Thermal Power Station'?",
    options: ['NTPC', 'MPPGCL', 'NHPC', 'BHEL'],
    correctAnswer: 1,
    explanation:
      'Satpura Thermal Power Station is located in Sarni, Betul district and is operated by MPPGCL.',
    subject: 'MP Energy',
  },
  {
    question: 'The Tropic of Cancer passes through how many districts of Madhya Pradesh?',
    options: ['12', '14', '10', '16'],
    correctAnswer: 1,
    explanation: 'The Tropic of Cancer passes through 14 districts of Madhya Pradesh.',
    subject: 'MP Geography',
  },
  {
    question: 'According to Census 2011, which district of MP has the highest population?',
    options: ['Bhopal', 'Jabalpur', 'Indore', 'Sagar'],
    correctAnswer: 2,
    explanation:
      'Indore is the most populous district of Madhya Pradesh with a population of over 32 Lakhs (Census 2011).',
    subject: 'MP Demography',
  },
  {
    question: 'Which district of MP has the highest sex ratio as per Census 2011?',
    options: ['Alirajpur', 'Mandla', 'Dindori', 'Balaghat'],
    correctAnswer: 3,
    explanation: 'Balaghat has the highest sex ratio in MP with 1021 females per 1000 males.',
    subject: 'MP Demography',
  },
  {
    question: "Where is the new 'Veerangana Durgavati Tiger Reserve' located?",
    options: ['Sagar-Damoh-Narsinghpur', 'Panna-Chhatarpur', 'Seoni-Balaghat', 'Betul-Hoshangabad'],
    correctAnswer: 0,
    explanation:
      'The 7th Tiger Reserve of MP, Veerangana Durgavati, is spread across Sagar, Damoh, and Narsinghpur districts.',
    subject: 'MP Environment',
  },
  {
    question:
      "Madhya Pradesh government has announced which year to be observed as the 'Year of Agriculture'?",
    options: ['2024', '2025', '2026', '2027'],
    correctAnswer: 2,
    explanation:
      "The MP Government has decided to observe the year 2026 as the 'Year of Agriculture'.",
    subject: 'MP Current Affairs',
  },
  {
    question: "Where was the 'Global Investors Summit 2025' held in Madhya Pradesh?",
    options: ['Indore', 'Bhopal', 'Gwalior', 'Ujjain'],
    correctAnswer: 1,
    explanation: 'The Global Investors Summit 2025 was held in Bhopal on Feb 24-25, 2025.',
    subject: 'MP Current Affairs',
  },
  {
    question: "Which city is known as the 'Energy Capital' of Madhya Pradesh?",
    options: ['Singrauli', 'Bhopal', 'Indore', 'Jabalpur'],
    correctAnswer: 0,
    explanation:
      'Singrauli is known as the Energy Capital of MP due to its large coal reserves and thermal power plants.',
    subject: 'MP Energy',
  },
  {
    question:
      "The 'Laadli Behna Yojana' provides how much monthly financial assistance currently (Approx 2025)?",
    options: ['1000', '1250', '1500', '2000'],
    correctAnswer: 1,
    explanation:
      'Under the Mukhyamantri Laadli Behna Yojana, eligible women receive ₹1250 per month.',
    subject: 'MP Schemes',
  },
  {
    question: 'The river Narmada originates from?',
    options: ['Multai', 'Amarkantak', 'Jana-Paw', 'Kakri-Bardi'],
    correctAnswer: 1,
    explanation:
      'The Narmada River originates from the Amarkantak Plateau in Anuppur district of Madhya Pradesh.',
    subject: 'MP Geography',
  },
  {
    question: 'Who was the first Chairman of MPPSC?',
    options: ['D.B. Rege', 'H.C. Seth', 'S.P. Mushran', 'R.C.V.P. Noronha'],
    correctAnswer: 0,
    explanation:
      'D.B. Rege was the first Chairman of the Madhya Pradesh Public Service Commission.',
    subject: 'MP Polity',
  },
  {
    question: "Which of the following places is famous for 'Chanderi Sarees'?",
    options: ['Ashoknagar', 'Gwalior', 'Shivpuri', 'Morena'],
    correctAnswer: 0,
    explanation:
      'Chanderi in Ashoknagar district is world-famous for its traditional Chanderi Sarees (GI Tag).',
    subject: 'MP Culture',
  },
  {
    question: "In which year was the 'Madhya Pradesh State Election Commission' constituted?",
    options: ['1992', '1993', '1994', '1995'],
    correctAnswer: 2,
    explanation:
      'The Madhya Pradesh State Election Commission was constituted on 1st February 1994.',
    subject: 'MP Polity',
  },
  {
    question: "The 'Rani Durgavati' ruled which kingdom?",
    options: ['Gondwana', 'Malwa', 'Bundelkhand', 'Mahakoshal'],
    correctAnswer: 0,
    explanation: 'Rani Durgavati was a ruling Queen of Gondwana from 1550 until 1564.',
    subject: 'MP History',
  },
  {
    question:
      'Match the following: (Minerals - District)\n1. Diamond  - A. Balaghat\n2. Copper   - B. Panna\n3. Manganese- C. Singrauli\n4. Coal     - D. Balaghat',
    options: [
      '1-B, 2-A, 3-A, 4-C',
      '1-B, 2-A, 3-D, 4-C',
      '1-A, 2-B, 3-C, 4-D',
      '1-C, 2-D, 3-A, 4-B',
    ],
    correctAnswer: 0,
    explanation:
      'Diamond: Panna; Copper: Malanjkhand (Balaghat); Manganese: Bharveli (Balaghat); Coal: Singrauli.',
    subject: 'MP Geography',
  },
];

// PYQ Real Questions 2024 (Paper 1 - Set A context)
const realPYQ2024Questions = [
  {
    question: 'Which of the following rivers does NOT join the Chambal river?',
    options: ['Kshipra', 'Kali Sindh', 'Betwa', 'Parvati'],
    correctAnswer: 2,
    explanation:
      'Betwa joins the Yamuna river directly, not Chambal. Kshipra, Kali Sindh, and Parvati are tributaries of Chambal.',
    subject: 'MP Geography',
  },
  {
    question:
      'What is the minimum age prescribed for becoming a candidate for the Legislative Assembly in India?',
    options: ['21 Years', '25 Years', '30 Years', '35 Years'],
    correctAnswer: 1,
    explanation:
      'Article 173(b) of the Constitution prescribes a minimum age of 25 years for the Legislative Assembly.',
    subject: 'Polity',
  },
  {
    question: "The 'Puntamba' inscription is associated with which Satvahana Ruler?",
    options: [
      'Simuka',
      'Gautamiputra Satakarni',
      'Vashishthiputra Pulumavi',
      'Yagnashri Satakarni',
    ],
    correctAnswer: 1,
    explanation:
      'Gautamiputra Satakarni is associated with the Puntamba hoard/inscriptions found in Maharashtra.',
    subject: 'History',
  },
  {
    question:
      "Which Article of the Constitution of India provides for the 'Protection of Life and Personal Liberty'?",
    options: ['Article 19', 'Article 20', 'Article 21', 'Article 22'],
    correctAnswer: 2,
    explanation:
      'Article 21 states: No person shall be deprived of his life or personal liberty except according to procedure established by law.',
    subject: 'Polity',
  },
  {
    question: 'Who was the President of the Constituent Assembly of India?',
    options: [
      'Dr. B.R. Ambedkar',
      'Pt. Jawaharlal Nehru',
      'Dr. Rajendra Prasad',
      'Sardar Vallabhbhai Patel',
    ],
    correctAnswer: 2,
    explanation:
      'Dr. Rajendra Prasad was elected as the permanent President of the Constituent Assembly on Dec 11, 1946.',
    subject: 'Polity',
  },
];

// Helper to seed a test
async function seedTest(
  title: string,
  slug: string,
  type: 'FLT' | 'UNIT' | 'CSAT',
  unitId: string | null = null,
  questionData: any[]
) {
  console.log(`Seeding Test: ${title}...`);

  // Check if test exists
  const existing = await db.select().from(tests).where(eq(tests.slug, slug)).limit(1);
  let testId;

  if (existing.length > 0) {
    console.log(`Test ${title} already exists. Updating metadata and questions...`);
    testId = existing[0].id;

    // Update metadata for existing test to match new patterns (e.g. Total Marks 300)
    await db
      .update(tests)
      .set({
        title,
        durationMinutes: type === 'FLT' ? 120 : 20,
        totalMarks: type === 'FLT' ? 300 : questionData.length * 3,
        maxRetries: type === 'UNIT' ? 5 : type === 'FLT' ? 2 : null,
        updatedAt: new Date(),
      })
      .where(eq(tests.id, testId));
  } else {
    testId = uuidv4();
    await db.insert(tests).values({
      id: testId,
      title,
      slug,
      description: `Practice test for ${title}`,
      durationMinutes: type === 'FLT' ? 120 : 20,
      totalMarks: type === 'FLT' ? 300 : questionData.length * 3,
      type,
      unitId,
      tags: unitId ? [unitId] : ['practice'],
      isPro: false, // Default to free for seeded data
      maxRetries: type === 'UNIT' ? 5 : type === 'FLT' ? 2 : null, // 2026 Logic
    });
    console.log(`Created test: ${title}`);
  }

  // Insert Questions
  console.log(`Inserting ${questionData.length} questions for ${title}...`);

  // First, clear existing questions to ensure clean state (or valid updates)
  await db.delete(questions).where(eq(questions.testId, testId));

  const questionValues = questionData.map((q: any, idx: number) => ({
    id: uuidv4(),
    testId: testId,
    questionText: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer.toString(),
    explanation: q.explanation,
    marks: q.marks || 3, // 3 Marks per question (2026 Pattern)
    negativeMarks: q.negativeMarks || 1, // 1/3rd of 3 marks = 1 mark deduction
    order: idx + 1,
    subject: q.subject || 'General', // Fallback to 'General'
  }));

  if (questionValues.length > 0) {
    await db.insert(questions).values(questionValues);
  }

  console.log(`Done seeding ${title}.\n`);
}

async function main() {
  console.log('Starting Seed Process...');

  // 1. Seed Unit 1 Practice Test
  await seedTest(
    'Unit 1: History, Culture & Literature of MP',
    'unit-1-practice-1',
    'UNIT',
    'unit_1',
    realUnit1Questions
  );

  // 2. Seed Mock FLT
  await seedTest(
    'MPPSC Prelims - Full Length Mock Test 1',
    'mppsc-flt-mock-1',
    'FLT',
    null,
    realFLTQuestions
  );

  // 3. Create Placeholder Tests for PYQs (2022-2025)
  // We populate them with a subset of FLT questions just so they are playable for now
  const pyqs = [
    { year: '2022', title: 'MPPSC Prelims 2022 - Paper 1 (GS)' },
    { year: '2023', title: 'MPPSC Prelims 2023 - Paper 1 (GS)' },
    { year: '2024', title: 'MPPSC Prelims 2024 - Paper 1 (GS)' },
  ];

  for (const pyq of pyqs) {
    let qData = realFLTQuestions.slice(0, 10); // Default to FLT mix
    if (pyq.year === '2024') {
      qData = realPYQ2024Questions;
    }

    await seedTest(pyq.title, `mppsc-prelims-${pyq.year}-gs`, 'FLT', null, qData);
  }

  console.log('Seeding Complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
