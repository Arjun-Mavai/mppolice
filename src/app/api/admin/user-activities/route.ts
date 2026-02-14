import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUserActivities } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('mppsc_token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { verifyToken } = await import('@/lib/jwt');
    const decoded: any = verifyToken(token);

    if (!decoded?.userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const adminUser = await db.query.mppscUsers.findFirst({
      where: (users, { eq }) => eq(users.id, decoded.userId)
    });

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const logs = await db.select()
      .from(mppscUserActivities)
      .orderBy(desc(mppscUserActivities.createdAt))
      .limit(100);

    return NextResponse.json({ logs });

  } catch (error) {
    console.error("Fetch activities error:", error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
