import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    // --- SECURITY CHECK: RATE LIMITING ---
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { signupLimiter, checkRateLimit } = await import('@/lib/rate-limit');
    
    const { success, limit, remaining, reset } = await checkRateLimit(signupLimiter, ip);
    
    if (!success) {
        return NextResponse.json({ 
            error: 'Too many signup attempts. Please try again later.' 
        }, { 
            status: 429,
            headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toString()
            }
        });
    }

    // --- SECURITY CHECK: ONLY ADMINS CAN CREATE USERS ---
    const cookieStore = await cookies();
    const token = cookieStore.get('mppsc_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    // Verify session user is an admin
    // FIX: Decode token first! Previously we were comparing token string with user ID directly.
    const { verifyToken } = await import('@/lib/jwt');
    const decoded: any = verifyToken(token); // Using any temporarily, ideally typed

    if (!decoded || !decoded.userId) {
        return NextResponse.json({ error: 'Unauthorized: Invalid Admin session' }, { status: 401 });
    }

    const adminUser = await db.query.mppscUsers.findFirst({
        where: (users, { eq }) => eq(users.id, decoded.userId)
    });

    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Only admins can create new accounts.' }, { status: 403 });
    }

    // --- Proceed with Signup ---

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // --- Bhai Password Validation Start ---
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return NextResponse.json({ 
            error: 'Bhai password thoda strong rakho! Kam se kam 8 characters, ek bada akshar, ek chota akshar, ek number aur ek special character hona mangta hai.' 
        }, { status: 400 });
    }
    // --- Bhai Password Validation End ---

    // Check if user already exists
    const existingUsers = await db.select().from(mppscUsers).where(eq(mppscUsers.email, email));

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await db.insert(mppscUsers).values({
        id: randomUUID(), // Generate UUID
        email, 
        password: hashedPassword, 
        name,
        isSubscribed: false // Default to false
    });

    return NextResponse.json({ success: true, message: 'Account created successfully. User can now log in.' });
  } catch (error) {
    logger.error("Signup error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
