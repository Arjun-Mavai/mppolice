import { cookies } from 'next/headers';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq, isNull, and, sql } from 'drizzle-orm';
import { cache } from 'react';
import { logger } from '@/lib/logger';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 AUTH VERIFICATION — har server component me use hota h
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// React cache() wrapper — ek request me multiple baar call
// hone par bhi DB query sirf EK baar chalega (dedup magic!)
//
// Checks:
//   1. Cookie exists? → nahi to null (not logged in)
//   2. JWT valid? → nahi to null (tampered/expired token)
//   3. User exists in DB? → nahi to null
//   4. User soft-deleted? → haan to null (deactivated account)
//
// Note: Expiry check is NOT done here — it's done at login time.
// Once logged in, user stays logged in until cookie expires (30 days).
// This prevents mid-session kicks which is bad UX.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const verifyAuthWithMismatch = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('mppolice_token');

  if (!token) {
    return { user: null, _mismatch: false };
  }

  const { verifyToken } = await import('@/lib/jwt');
  const decoded: any = verifyToken(token.value);

  if (!decoded || !decoded.userId) {
    return { user: null, _mismatch: false };
  }

  const userId = decoded.userId;
  const tokenVersion = decoded.sessionVersion;

  try {
    // Only fetch active users — soft-deleted + inactive users are treated as non-existent
    const dbUsers = await db
      .select()
      .from(mppscUsers)
      .where(
        and(
          eq(mppscUsers.id, userId),
          isNull(mppscUsers.deletedAt),
          eq(mppscUsers.isActive, true),
          sql`(${mppscUsers.examType} = 'mppolice' OR ${mppscUsers.examType} = 'all')`
        )
      )
      .limit(1);
    
    const user = dbUsers[0] || null;

    if (user) {
      const dbVersion = user.sessionVersion || 1;
      const tokVersion = tokenVersion || 1;
      
      if (dbVersion !== tokVersion) {
        return { user: null, _mismatch: true };
      }
    }

    return { user, _mismatch: false };
  } catch (error) {
    // DB errors → null (graceful degradation, user redirected to login)
    logger.error('Database error during auth verification:', error, {
      category: 'auth',
      userId,
    });
    return { user: null, _mismatch: false };
  }
});

export const verifyAuth = cache(async () => {
  const result = await verifyAuthWithMismatch();
  return result.user;
});
