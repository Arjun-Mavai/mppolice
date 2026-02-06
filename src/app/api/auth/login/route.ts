import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Verify user
    const { data: user, error } = await supabase
      .from('card_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password match
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // create cookie logic is async in Next.js 15+ (App Router)
    // cookies() is an async function in newer Next versions, let's wait for it
    const cookieStore = await cookies();
    
    // Set a simple session cookie
    cookieStore.set('auth_token', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    logger.error("Login error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
