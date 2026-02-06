import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // --- SECURITY CHECK: ONLY ADMINS CAN CREATE USERS ---
    const cookieStore = await cookies();
    const token = cookieStore.get('mppsc_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    // Verify session user is an admin
    const adminUser = await db.query.mppscUsers.findFirst({
        where: (users, { eq }) => eq(users.id, token)
    });

    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Only admins can create new accounts.' }, { status: 403 });
    }

    // --- Proceed with Signup ---

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

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
    console.error("Signup error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
