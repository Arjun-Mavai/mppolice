import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteAuthCookies } from '@/lib/auth-constants';

// Logout must never be cached
export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = await cookies();
  const { extractAuthToken } = await import('@/lib/auth-constants');
  const tokenValue = extractAuthToken(cookieStore);

  if (tokenValue) {
    try {
      const { verifyToken } = await import('@/lib/jwt');
      const decoded: any = verifyToken(tokenValue);
      if (decoded && decoded.userId) {
        const { db } = await import('@/db');
        const { mppscUsers } = await import('@/db/schema');
        const { eq } = await import('drizzle-orm');
        const { touchAuthLogoutMetadata } = await import('@/lib/auth-session-metadata');

        const users = await db.select({ 
          metadata: mppscUsers.metadata,
          sessionVersion: mppscUsers.sessionVersion 
        }).from(mppscUsers).where(eq(mppscUsers.id, decoded.userId)).limit(1);
        
        if (users[0]) {
          const dbVersion = users[0].sessionVersion || 1;
          const tokenVersion = decoded.sessionVersion || 1;
          
          // Only update metadata and log out globally if this is the active session
          if (dbVersion === tokenVersion) {
            await db.update(mppscUsers)
              .set({ metadata: touchAuthLogoutMetadata(users[0].metadata) })
              .where(eq(mppscUsers.id, decoded.userId));
          }
        }
      }
    } catch (e) {
      // Ignore token verification errors on logout
    }
  }

  // 🛡️ Clear ALL auth & device cookies (new stealth names + legacy fallbacks)
  deleteAuthCookies(cookieStore);

  // Set no-cache headers to prevent browser/CDN from caching logout response
  const response = NextResponse.json({ success: true });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}
