import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/db/schema';
import fs from 'fs';
import path from 'path';
import { sql, eq, and } from 'drizzle-orm';

// Setup local DB connection directly to bypass env validation
const client = createClient({
  url: 'file:mppsc_local_dev.db',
});
const db = drizzle(client, { schema });

async function main() {
  console.log('🚀 Starting Demo Data Import...');

  try {
    const dataPath = path.join(process.cwd(), 'scripts/demo-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);

    for (const topic of data.topics) {
      console.log(`Processing Topic: ${topic.name}`);

      // 1. Insert Topic
      const slug = topic.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
      await db.insert(schema.pyqTopics).values({
        id: topic.id,
        subject: topic.subject,
        topicSlug: slug,
        topicTitle: topic.name,
        topicTitleEn: topic.name,
        description: topic.description,
        isActive: true
      }).onConflictDoUpdate({
        target: schema.pyqTopics.id,
        set: { topicTitle: topic.name, description: topic.description }
      });

      // 2. Link Questions
      for (const qId of topic.questions) {
        // Only insert if question exists (optional check, but good for safety)
        await db.insert(schema.pyqQuestionTopics).values({
          id: `qt_${topic.id}_${qId}`,
          questionId: qId,
          topicId: topic.id,
          confidence: 1.0,
          isPrimary: true
        }).onConflictDoNothing();
      }

      // 3. Insert Facts
      // Clear existing facts for this topic to avoid dupes on re-run
      await db.delete(schema.pyqFactBank).where(eq(schema.pyqFactBank.topicId, topic.id));

      let factIdx = 0;
      for (const fact of topic.facts) {
        factIdx++;
        // Normalize the subject properly during insertion to match frontend logic
        let normalizedSubject = topic.subject;
        if (topic.subject === 'MP Geography') normalizedSubject = 'MP GK';
        if (topic.subject === 'Indian Geography') normalizedSubject = 'Geography';

        await db.insert(schema.pyqFactBank).values({
            id: `fact_${topic.id}_${factIdx}`,
            topicId: topic.id,
            subject: normalizedSubject,
            factText: fact.content,
            tags: fact.tags,
            pyqRefs: [{ questionId: topic.questions[0], year: 2022 }], // Dummy ref
            status: 'published',
            importanceScore: fact.type === 'Exam Fact' ? 10 : 5
        });
      }

      // 4. Insert Trend (Fake Trend for Demo)
      // Also normalize subject for trends
      let normalizedSubjectForTrend = topic.subject;
      if (topic.subject === 'MP Geography') normalizedSubjectForTrend = 'MP GK';
      if (topic.subject === 'Indian Geography') normalizedSubjectForTrend = 'Geography';

      // Clear existing trends for this topic to fix subject mismatch
      await db.delete(schema.pyqTopicTrends).where(eq(schema.pyqTopicTrends.topicId, topic.id));

      await db.insert(schema.pyqTopicTrends).values({
        id: `trend_${topic.id}_2022`,
        topicId: topic.id,
        subject: normalizedSubjectForTrend,
        year: 2022,
        questionCount: Math.floor(Math.random() * 3) + 1,
        weightPercent: 5.0
      }).onConflictDoNothing();
      
       await db.insert(schema.pyqTopicTrends).values({
        id: `trend_${topic.id}_2023`,
        topicId: topic.id,
        subject: normalizedSubjectForTrend,
        year: 2023,
        questionCount: Math.floor(Math.random() * 3) + 1,
        weightPercent: 4.5
      }).onConflictDoNothing();

      console.log(`✅ Imported ${topic.name}`);
    }

    console.log('🎉 Demo Data Setup Complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
