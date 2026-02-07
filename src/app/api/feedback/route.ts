import { NextResponse } from 'next/server';
import { db } from '@/db';
import { feedbacks } from '@/db/schema';
import { randomUUID } from 'crypto';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, rating, category, userId } = body;

    // Basic Validation
    if (!name || !message || !rating) {
      return NextResponse.json({ error: 'Name, message, and rating are required' }, { status: 400 });
    }

    await db.insert(feedbacks).values({
      id: randomUUID(),
      userId: userId || null,
      name,
      email: email || null,
      phone: phone || null,
      message,
      rating: parseInt(rating),
      category: category || 'other',
    });

    logger.info("Feedback received from:", name);

    return NextResponse.json({ success: true, message: 'Feedback submitted successfully' });

  } catch (error) {
    logger.error("Feedback submission error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
