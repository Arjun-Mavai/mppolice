import { cookies } from 'next/headers';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cache } from 'react';

export const verifyAuth = cache(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('mppsc_token');

    if (!token) {
        return null;
    }

    const userId = token.value;

    try {
        const users = await db.select().from(mppscUsers).where(eq(mppscUsers.id, userId)).limit(1);
        return users[0] || null;
    } catch (error) {
        console.error("Auth verification failed:", error);
        return null;
    }
});
