
import 'dotenv/config';
import { db } from '../db';
import { tests } from '../db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log("Verifying Tests in DB...");
    
    const allTests = await db.select().from(tests);
    console.log(`Found ${allTests.length} tests.`);
    
    allTests.forEach(t => {
        console.log(`- [${t.type}] ${t.title} (ID: ${t.id}, Unit: ${t.unitId})`);
    });

    if (allTests.length === 0) {
        console.error("No tests found! Seeding is likely required.");
    }
}

main().catch(console.error);
