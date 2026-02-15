'use server';

import { verifyAuth } from '@/lib/auth';

/**
 * 🔐 Get Current User (Server Action)
 *
 * Bhai, ye function JWT se user data nikalta hai.
 * Frontend ko userId bhejne ki zaroorat nahi — sab server pe hota hai!
 *
 * Benefits:
 * - No API endpoint visible in Network tab
 * - userId never exposed to client
 * - Automatic cookie handling
 */
export async function getCurrentUser() {
  const user = await verifyAuth();

  if (!user) {
    return { user: null };
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? undefined,
      role: user.role,
      is_subscribed: user.isSubscribed,
      plan_tier: user.planTier,
      access_expires_at: user.accessExpiresAt,
    },
  };
}
