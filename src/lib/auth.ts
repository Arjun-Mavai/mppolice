import { cookies } from 'next/headers';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cache } from 'react';
import { logger } from '@/lib/logger';

export const verifyAuth = cache(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('mppsc_token');

    if (!token) {
        return null;
    }


    // "Bhai token verify kar raha hai"
    const { verifyToken } = await import('@/lib/jwt');
    const decoded: any = verifyToken(token.value);

    if (!decoded || !decoded.userId) {
        // "Nakli maal ya expired"
        return null;
    }

    const userId = decoded.userId;


    try {
        const users = await db.select().from(mppscUsers).where(eq(mppscUsers.id, userId)).limit(1);
        return users[0] || null;
    } catch (error) {
        logger.error("Auth verification failed:", error);
        return null;
    }
});
