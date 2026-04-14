import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers, pricingConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { logger } from '@/lib/logger';
import { PRICING_DEFAULTS } from '@/config/pricing';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 PRICING API — GET (public) + PUT (admin-only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// GET: Fetch pricing for ?examType= (cached with tag 'pricing')
// PUT: Admin updates specific exam's pricing
//
// Primary key: examType ('mppsc' | 'mppolice' | 'upsc')
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const EXAMS = ['mppsc', 'mppolice', 'upsc'] as const;

// ── GET — Public, cached ────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examType = (searchParams.get('examType') || 'mppolice') as any;

    const rows = await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.examType, examType))
      .limit(1);
    
    let pricing = rows[0];

    // Auto-initialize if missing (for the transition)
    if (!pricing) {
      pricing = { examType, ...PRICING_DEFAULTS } as any;
    }

    return NextResponse.json(
      { pricing },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    logger.error('Pricing GET error:', error);
    return NextResponse.json({ pricing: { examType: 'mppolice', ...PRICING_DEFAULTS } });
  }
}

// ── PUT — Admin-only, updates pricing + busts cache ─────────
export async function PUT(request: Request) {
  try {
    // Admin auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('mppolice_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { verifyToken } = await import('@/lib/jwt');
    const decoded: any = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const adminUser = await db.query.mppscUsers.findFirst({
      where: (u, { eq }) => eq(u.id, decoded.userId),
    });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { examType, ...data } = body;

    if (!examType || !EXAMS.includes(examType)) {
      return NextResponse.json({ error: 'Invalid exam type' }, { status: 400 });
    }

    // Upsert — check if exists
    const existing = await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.examType, examType))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(pricingConfig).values({ examType, ...data, updatedAt: new Date() });
    } else {
      await db
        .update(pricingConfig)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(pricingConfig.examType, examType));
    }

    // Bust pricing cache
    revalidateTag('pricing',{expire:0});

    logger.info(`Pricing updated for ${examType} by admin`);

    return NextResponse.json({
      success: true,
      message: `Pricing for ${examType.toUpperCase()} updated!`,
    });
  } catch (error) {
    logger.error('Pricing PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
