import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { extractAuthToken } from '@/lib/auth-constants';

/**
 * 🛡️ Validate Admin Session
 * 
 * Centralized security check for all /api/admin routes.
 * Returns the admin user object if valid, throws error otherwise.
 */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = extractAuthToken(cookieStore);

  if (!token) {
    throw new Error('Unauthorized');
  }

  const decoded: any = verifyToken(token);
  if (!decoded?.userId) {
    throw new Error('Invalid session');
  }

  const adminUser = await db.query.mppscUsers.findFirst({
    where: (u, { eq }) => eq(mppscUsers.id, decoded.userId),
  });

  if (!adminUser || adminUser.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return adminUser;
}
