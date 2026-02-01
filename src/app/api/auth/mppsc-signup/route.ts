import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

// --- CONFIGURATION ---
// Set this to false to disable new signups globally
const SIGNUP_ENABLED = true; 
// ---------------------

export async function POST(request: Request) {
  try {
    if (!SIGNUP_ENABLED) {
        return NextResponse.json({ error: 'Signups are currently disabled.' }, { status: 403 });
    }

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



    return NextResponse.json({ success: true, message: 'Account created successfully. Please log in.' });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
