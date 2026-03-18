import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { pyqContentImportJobs } from '@/db/schema';
import { getAdminUserFromRequest } from '../_lib';

export const dynamic = 'force-dynamic';

export async function GET() {
  const adminUser = await getAdminUserFromRequest();
  if (!adminUser) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const jobs = await db
    .select({
      id: pyqContentImportJobs.id,
      uploadedBy: pyqContentImportJobs.uploadedBy,
      totalRecords: pyqContentImportJobs.totalRecords,
      successCount: pyqContentImportJobs.successCount,
      failureCount: pyqContentImportJobs.failureCount,
      status: pyqContentImportJobs.status,
      errorReport: pyqContentImportJobs.errorReport,
      createdAt: pyqContentImportJobs.createdAt,
    })
    .from(pyqContentImportJobs)
    .orderBy(desc(pyqContentImportJobs.createdAt))
    .limit(100);

  return NextResponse.json({ success: true, jobs });
}
