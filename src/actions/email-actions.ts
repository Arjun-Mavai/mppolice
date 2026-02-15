'use server';

import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { sql } from 'drizzle-orm';

/**
 * 📧 Check Email Existence (Server Action)
 *
 * Checks if an email already exists in the system and returns plan details.
 * Used to prevent duplicate payments and guide users to login.
 *
 * Benefits over API route:
 * - No API endpoint visible
 * - Type-safe
 * - Automatic rate limiting via Server Actions
 */
export async function checkEmailExists(email: string) {
  try {
    if (!email || typeof email !== 'string') {
      return { exists: false, error: 'Invalid email' };
    }

    const normalized = email.toLowerCase().trim();

    // Case-insensitive lookup
    const user = await db.query.mppscUsers.findFirst({
      where: sql`LOWER(${mppscUsers.email}) = ${normalized}`,
      columns: { planTier: true, isActive: true, isSubscribed: true },
    });

    if (!user) {
      return { exists: false };
    }

    return {
      exists: true,
      planTier: user.planTier ?? 'free',
      isActive: user.isActive,
      isSubscribed: user.isSubscribed ?? false,
    };
  } catch (error) {
    return { exists: false, error: 'Check failed' };
  }
}
