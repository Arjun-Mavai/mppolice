import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { recomputePyqTopicTrends } from '@/features/tests/actions/pyq-insights';
import { getAdminUserFromRequest } from '../_lib';

export const dynamic = 'force-dynamic';

const recomputeSchema = z.object({
  years: z.array(z.number().int().min(1990).max(2100)).optional(),
});

export async function POST(request: Request) {
  const adminUser = await getAdminUserFromRequest();
  if (!adminUser) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const payload = recomputeSchema.parse(await request.json());
    const result = await recomputePyqTopicTrends(payload.years);

    revalidateTag('pyq-insights', { expire: 0 });
    revalidateTag('pyq-trends', { expire: 0 });

    return NextResponse.json({
      success: true,
      rows_written: result.rowsWritten,
      years_refreshed: result.yearsRefreshed,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload', details: error.issues.map((issue) => issue.message) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Recompute failed' },
      { status: 500 }
    );
  }
}
