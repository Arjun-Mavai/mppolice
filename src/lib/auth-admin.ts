import { verifyAuth } from './auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function requireAdmin() {
  const user = await verifyAuth();

  if (!user) {
    redirect('/login');
  }

  try {
    // Fetch fresh user data to check role
    const dbUser = await db.select().from(mppscUsers).where(eq(mppscUsers.id, user.id)).get();

    if (!dbUser || dbUser.role !== 'admin') {
      redirect('/');
    }

    return dbUser;
  } catch (error) {
    console.error('Admin Check Error:', error);
    redirect('/');
  }
}
