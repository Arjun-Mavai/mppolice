import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tests } from '@/db/schema';
import { desc } from 'drizzle-orm';

// export const dynamic = 'force-dynamic'; // Ensure no caching

export async function GET() {
    try {
        // Fetch raw data directly from DB without any caching
        const allTests = await db.select().from(tests).orderBy(desc(tests.updatedAt)).limit(10);
        
        return NextResponse.json({
            message: "Direct DB Fetch (No Cache)",
            tests: allTests.map(t => ({
                id: t.id,
                title: t.title,
                type: t.type,
                displayOrder: t.displayOrder
            }))
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
