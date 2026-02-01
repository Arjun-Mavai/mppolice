
import 'dotenv/config';
import { db } from '@/db';
import { syllabusTopics } from '@/db/schema';
import { syllabusData } from '@/data/syllabusData';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function seedSyllabus() {
    console.log("Starting Syllabus Seeding...");

    try {
        // Option to clear existing topics if needed, but for now we might want to just upsert or delete all first.
        // Given the user said "data hata diya h" (data removed), we assume we can start fresh or overwrite.
        // It's safer to delete all topics first to ensure clean state matching the file.
        console.log("Clearing existing syllabus topics...");
        await db.delete(syllabusTopics);
        console.log("Cleared.");

        const units = Object.entries(syllabusData.units);
        let totalTopicsSeeded = 0;

        for (const [unitKey, unitData] of units) {
            console.log(`Processing ${unitKey} ("${unitData.title}")...`);

            const hindiTopics = unitData.topics || [];
            const englishTopics = unitData.topics_en || [];

            // We iterate over Hindi topics as the primary source of truth for IDs
            for (const hTopic of hindiTopics) {
                // Find matching English topic
                const eTopic = englishTopics.find(t => t.id === hTopic.id);

                // Prepare Content JSONs (excluding flat fields like id, front)
                // Hindi Content
                const contentHi = {
                    back: hTopic.back,
                    details: hTopic.details,
                    mnemonic: hTopic.mnemonic,
                    pro_tip: hTopic.pro_tip,
                    impact_emoji: hTopic.impact_emoji,
                    important_facts: hTopic.important_facts,
                    image_url: hTopic.image_url
                };

                // English Content (if linked)
                const contentEn = eTopic ? {
                    back: eTopic.back,
                    details: eTopic.details,
                    mnemonic: eTopic.mnemonic,
                    pro_tip: eTopic.pro_tip,
                    impact_emoji: eTopic.impact_emoji,
                    important_facts: eTopic.important_facts,
                    image_url: eTopic.image_url
                } : null;

                // Insert Row
                await db.insert(syllabusTopics).values({
                    id: uuidv4(),
                    unitId: unitKey, // 'unit_1', 'unit_2' etc.
                    title: hTopic.front, // Hindi Title
                    titleEn: eTopic?.front || null, // English Title
                    content: contentHi,
                    contentEn: contentEn,
                    order: hTopic.id,
                    isFree: unitKey === 'unit_1', // Unit 1 is free as per current logic
                    imgUrl: hTopic.image_url || eTopic?.image_url || null,
                    createdAt: new Date()
                });

                totalTopicsSeeded++;
            }
            console.log(`Seeded ${hindiTopics.length} topics for ${unitKey}.`);
        }

        console.log(`\n✅ Syllabus Seeding Complete! Total Topics: ${totalTopicsSeeded}`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding Failed:", error);
        process.exit(1);
    }
}

seedSyllabus().catch(console.error);
