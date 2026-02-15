import { NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentExitReasons } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { reason, customReason } = await request.json();

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    await db.insert(paymentExitReasons).values({
      id: uuidv4(),
      reason,
      customReason: customReason || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to save exit survey:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
