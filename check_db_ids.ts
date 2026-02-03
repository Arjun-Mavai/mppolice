
import 'dotenv/config';
import { db } from '@/db';
import { syllabusTopics } from '@/db/schema';

async function check() {
    const topic = await db.select().from(syllabusTopics).limit(1);
    console.log("Sample ID:", topic[0]?.id);
    process.exit(0);
}

check();
