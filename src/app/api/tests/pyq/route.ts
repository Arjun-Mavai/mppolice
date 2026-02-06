import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tests } from '@/db/schema';
import { eq, asc, desc } from 'drizzle-orm';

export async function GET() {
    try {
        const pyqTests = await db.select({
            id: tests.id,
            title: tests.title,
            description: tests.description,
            totalQuestions: tests.totalQuestions,
            durationMinutes: tests.durationMinutes,
            createdAt: tests.createdAt
        })
        .from(tests)
        .where(eq(tests.type, 'PYQ'))
        .orderBy(desc(tests.createdAt));

        // Extract year from title or createdAt
        const testsWithYear = pyqTests.map(test => ({
            ...test,
            year: test.title.match(/\d{4}/)?.[0] || new Date(test.createdAt!).getFullYear().toString()
        }));

        return NextResponse.json({ 
            success: true, 
            tests: testsWithYear 
        });
    } catch (error) {
        console.error('PYQ fetch error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch PYQ tests',
            tests: []
        }, { status: 500 });
    }
}
