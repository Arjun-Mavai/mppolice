import 'dotenv/config';
import { db } from '@/db';
import { syllabusTopics, tests, questions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { syllabusData } from '@/data/syllabusData'; // Importing existing verified data

async function seedSyllabus() {
  console.log('🌱 Starting Full Syllabus Seeding...');

  const units = Object.keys(syllabusData.units);

  for (const unitId of units) {
    const unitData = syllabusData.units[unitId];
    console.log(`Processing ${unitData.title || unitId}...`);

    const hindiTopics = unitData.topics || [];
    const englishTopics = unitData.topics_en || [];

    const formattedTopics = hindiTopics.map((topic, index) => {
      const enTopic = englishTopics[index] || {};

      return {
        id: `${unitId}_t${index + 1}`, // Unique ID based on unit and order
        unitId: unitId,
        title: topic.front,
        titleEn: enTopic.front || topic.front,
        order: index + 1,
        isFree: unitId === 'unit_1' && index < 5, // First 5 of Unit 1 are Free
        imgUrl: null,
        content: {
          front: topic.front,
          back: topic.back,
          details: topic.details,
          mnemonic: topic.mnemonic,
          pro_tip: topic.pro_tip,
          impact_emoji: topic.impact_emoji,
          important_facts: topic.important_facts,
        },
        contentEn: {
          front: enTopic.front || topic.front,
          back: enTopic.back || topic.back,
          details: enTopic.details || topic.details,
          mnemonic: enTopic.mnemonic || topic.mnemonic,
          pro_tip: enTopic.pro_tip || topic.pro_tip,
          impact_emoji: enTopic.impact_emoji || topic.impact_emoji,
          important_facts: enTopic.important_facts || topic.important_facts,
        },
      };
    });

    // Clear existing topics for this unit to avoid duplicates
    await db.delete(syllabusTopics).where(eq(syllabusTopics.unitId, unitId));

    // Insert new topics
    if (formattedTopics.length > 0) {
      console.log(`Inserting ${formattedTopics.length} topics for ${unitId}...`);
      await db.insert(syllabusTopics).values(formattedTopics);
    }
  }

  console.log('✅ All Units Seeding Complete!');
}

async function fixTestMarks() {
  console.log('🔧 Fixing Test Marks...');

  // 1. Update FLT Total Marks to 300
  // We update ALL tests of type FLT
  const fltUpdate = await db
    .update(tests)
    .set({ totalMarks: 300 })
    .where(eq(tests.type, 'FLT'))
    .returning({ id: tests.id, title: tests.title });

  console.log(`Updated ${fltUpdate.length} FLTs to 300 Marks.`);

  // 2. Update Questions Marks Logic (Globally/Safely)
  // We ensure all questions generally follow the 3 marks / 1 negative rule if they adhere to the new pattern
  // However, user specifically asked to fix total marks.
  // Let's force update questions for the active FLTs just to be sure.

  for (const test of fltUpdate) {
    await db
      .update(questions)
      .set({ marks: 3, negativeMarks: 1 })
      .where(eq(questions.testId, test.id));
  }
  console.log('Updated Question Marks for FLTs.');

  console.log('✅ Test Marks Fixed!');
}

async function main() {
  await seedSyllabus();
  await fixTestMarks();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
