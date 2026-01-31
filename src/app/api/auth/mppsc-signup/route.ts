import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
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
    const { data: existingUser } = await supabaseAdmin
      .from('mppsc_users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    // Note: is_subscribed defaults to false in DB schema usually, but we can be explicit
    const { data: newUser, error } = await supabaseAdmin
      .from('mppsc_users')
      .insert([
        { 
            email, 
            password: hashedPassword, 
            name,
            is_subscribed: false // Default to false, they must pay manually
        }
      ])
      .select()
      .single();

    if (error) {
        console.error("Signup DB Error:", error);
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Account created successfully. Please log in.' });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
