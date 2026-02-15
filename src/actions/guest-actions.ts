'use server';

import { db } from '@/db';
import { guests } from '@/db/schema';
import { logger } from '@/lib/logger';

export async function createGuestEntry(data: { name: string; email?: string; mobile?: string }) {
  try {
    const guestId = crypto.randomUUID();

    await db.insert(guests).values({
      id: guestId,
      name: data.name,
      email: data.email || null,
      mobile: data.mobile || null,
    });

    return { success: true, guestId };
  } catch (error) {
    logger.error('Failed to create guest entry:', error);
    return { error: 'Failed to save guest details' };
  }
}
