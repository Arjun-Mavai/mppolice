'use server';

import { db } from '@/db';
import { mppscUsers, userAttempts, tests } from '@/db/schema';
import { eq, sql, desc, and, isNull } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-admin';

export interface UserWithStats {
  id: string;
  name: string | null;
  email: string;
  planTier: string | null;
  isSubscribed: boolean | null;
  createdAt: Date | null;
  totalAttempts: number;
  completedAttempts: number;
  avgScore: number | null;
  lastActiveAt: Date | null;
  // Category-wise breakdown
  fltCount: number;
  unitCount: number;
  csatCount: number;
  pyqCount: number;
  topicCount: number;
}

/**
 * getUserDashboardData — Sab users + unke test attempt stats
 */
export async function getUserDashboardData(): Promise<UserWithStats[]> {
  await requireAdmin();

  // Single optimized query: users + their attempt stats with category breakdown
  const rows = await db
    .select({
      id: mppscUsers.id,
      name: mppscUsers.name,
      email: mppscUsers.email,
      planTier: mppscUsers.planTier,
      isSubscribed: mppscUsers.isSubscribed,
      createdAt: mppscUsers.createdAt,
      totalAttempts: sql<number>`count(${userAttempts.id})`,
      completedAttempts: sql<number>`sum(case when ${userAttempts.isCompleted} = 1 then 1 else 0 end)`,
      avgScore: sql<number>`avg(case when ${userAttempts.isCompleted} = 1 then ${userAttempts.score} else null end)`,
      lastActiveAt: sql<Date>`max(${userAttempts.endTime})`,
      fltCount: sql<number>`sum(case when ${tests.type} = 'FLT' then 1 else 0 end)`,
      unitCount: sql<number>`sum(case when ${tests.type} = 'UNIT' then 1 else 0 end)`,
      csatCount: sql<number>`sum(case when ${tests.type} = 'CSAT' then 1 else 0 end)`,
      pyqCount: sql<number>`sum(case when ${tests.type} = 'PYQ' then 1 else 0 end)`,
      topicCount: sql<number>`sum(case when ${tests.type} = 'TOPIC' then 1 else 0 end)`,
    })
    .from(mppscUsers)
    .leftJoin(userAttempts, eq(mppscUsers.id, userAttempts.userId))
    .leftJoin(tests, eq(userAttempts.testId, tests.id))
    .where(
      and(
        isNull(mppscUsers.deletedAt),
        // Exclude admin
        sql`${mppscUsers.role} != 'admin'`
      )
    )
    .groupBy(mppscUsers.id)
    .orderBy(desc(sql`max(${userAttempts.endTime})`));

  return rows.map((r) => ({
    ...r,
    totalAttempts: Number(r.totalAttempts) || 0,
    completedAttempts: Number(r.completedAttempts) || 0,
    avgScore: r.avgScore != null ? Math.round(Number(r.avgScore) * 100) / 100 : null,
    lastActiveAt: r.lastActiveAt,
    fltCount: Number(r.fltCount) || 0,
    unitCount: Number(r.unitCount) || 0,
    csatCount: Number(r.csatCount) || 0,
    pyqCount: Number(r.pyqCount) || 0,
    topicCount: Number(r.topicCount) || 0,
  }));
}
