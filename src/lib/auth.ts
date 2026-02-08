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
        // CRITICAL FIX: Don't treat DB errors as "user not logged in"
        // If DB is down/slow, we should throw an error, not logout the user
        logger.error("Database error during auth verification:", error);
        throw new Error("Database connection failed during authentication");
    }
});
