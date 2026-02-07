import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    // --- RATE LIMITING ---
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    // Dynamic import to avoid build issues if redis/ratelimit not setup perfectly yet
    const { resetLimiter, checkRateLimit } = await import('@/lib/rate-limit');
    
    // We limit by IP here to prevent abuse, but logically could also limit by Email if we extracted it first.
    // Limiting by IP is safer for anonymous attacks.
    const { success, limit, remaining, reset } = await checkRateLimit(resetLimiter, ip);
    
    if (!success) {
        return NextResponse.json({ 
            error: 'Too many requests. Please try again later.' 
        }, { status: 429 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // --- CHECK EMAIL EXISTENCE EFFICIENTLY ---
    const users = await db
        .select({ id: mppscUsers.id })
        .from(mppscUsers)
        .where(eq(mppscUsers.email, email))
        .limit(1);

    const user = users[0];

    if (!user) {
        // SECURITY: Don't reveal if user exists or not. 
        // Always return success to prevent Email Enumeration.
        // Fake delay to mimic processing time
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        return NextResponse.json({ success: true, message: 'If this email is registered, you will receive a reset link.' });
    }

    // --- SEND EMAIL LOGIC (Simulated) ---
    // In a real app, you would generate a token, save to DB, and send email via Resend/SendGrid.
    // For now, logging it as requested.
    
    logger.info(`[Password Reset] Requested for user: ${user.id} (${email})`);
    
    // Simulate Email Sending Delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ 
        success: true, 
        message: 'If this email is registered, you will receive a reset link.' 
    });

  } catch (error) {
    logger.error("Forgot Password Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
