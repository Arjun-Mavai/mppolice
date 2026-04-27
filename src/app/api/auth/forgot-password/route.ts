import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers, verificationTokens } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { Resend } from 'resend';
import PasswordResetTemplate from '@/components/password-reset-template';
import { appPath } from '@/lib/app-url';

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
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // --- CHECK USER EXISTENCE ---
    const user = await db.query.mppscUsers.findFirst({
      where: eq(sql`LOWER(${mppscUsers.email})`, normalizedEmail),
    });

    if (!user) {
      // SECURITY: Don't reveal if user exists or not.
      // Fake delay to mimic processing time
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, you will receive a reset link.',
      });
    }

    // --- GENERATE TOKEN & SEND EMAIL ---
    try {
      const token = uuidv4();
      const expires = addHours(new Date(), 24); // 24 hours for password reset

      await db.insert(verificationTokens).values({
        identifier: user.id,
        token,
        expires,
      });

      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromName = process.env.EMAIL_FROM_NAME || 'MP POLICE ZEN';
      const fromAddress = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS || 'mppolice@zenscroll.app';
      const fromEmail = `${fromName} <${fromAddress}>`;
      const actionUrl = `${appPath('auth/set-password')}?token=${token}`;

      const { error: emailError } = await resend.emails.send({
        from: fromEmail,
        to: [user.email],
        subject: '🔒 Reset Your MP POLICE ZEN Password',
        react: PasswordResetTemplate({ name: user.name || 'Student', actionUrl }),
      });

      if (emailError) {
        logger.error('Failed to send password reset email', emailError, { category: 'email', userId: user.id });
      } else {
        logger.info(`Password reset email sent to: ${normalizedEmail}`, { category: 'auth', userId: user.id });
      }
    } catch (err) {
      logger.error('Token generation or email delivery failed', err, { category: 'auth', userId: user.id });
      // We still return success to the user
    }

    return NextResponse.json({
      success: true,
      message: 'If this email is registered, you will receive a reset link.',
    });
  } catch (error) {
    logger.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
