import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    // --- SECURITY CHECK: RATE LIMITING ---
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { loginLimiter, checkRateLimit } = await import('@/lib/rate-limit');
    
    const { success, limit, remaining, reset } = await checkRateLimit(loginLimiter, ip);
    
    if (!success) {
        return NextResponse.json({ 
            error: 'Too many login attempts. Please try again after 15 minutes.' 
        }, { 
            status: 429,
            headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toString()
            }
        });
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Verify user against mppsc_users table
    const users = await db.select().from(mppscUsers).where(eq(mppscUsers.email, email)).limit(1);
    const user = users[0];

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password match
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check subscription status - We allow login even if not subscribed now, as we have a free tier
    // if (!user.isSubscribed) {
    //    return NextResponse.json({ error: 'Subscription not active. Please contact support.' }, { status: 403 });
    // }


    // Create JWT payload
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };

    // "Bhai sign kar raha hai token"
    const { signToken } = await import('@/lib/jwt'); // Dynamic import to avoid build time issues if any
    const token = signToken(payload);

    if (!token) {
        throw new Error('Token generation failed');
    }

    // Set session cookie
    const cookieStore = await cookies();
    
    // Using a specific cookie name for this syllabus app section
    cookieStore.set('mppsc_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax'
    });


    return NextResponse.json({ 
        success: true, 
        user: { 
            email: user.email, 
            name: user.name,
            is_subscribed: user.isSubscribed,
            plan_tier: user.planTier,
            role: user.role
        } 
    });
  } catch (error) {
    logger.error("Login error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
