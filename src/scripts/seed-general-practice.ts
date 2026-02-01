
import 'dotenv/config';
import { db } from '../db';
import { tests } from '../db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const GENERAL_TEST_ID = 'general-practice-v1';
    
    console.log("Seeding General Practice Test...");

    const existing = await db.select().from(tests).where(eq(tests.id, GENERAL_TEST_ID)).limit(1);

    if (existing.length === 0) {
        await db.insert(tests).values({
            id: GENERAL_TEST_ID,
            title: "General Practice Session",
            slug: "general-practice-session",
            description: "Adaptive practice across all subjects",
            durationMinutes: 20,
            totalMarks: 60,
            type: 'UNIT',
            isPro: false,
            maxRetries: 9999
        });
        console.log("Created General Practice Test.");
    } else {
        console.log("General Practice Test already exists.");
    }
}

main().catch(console.error);
