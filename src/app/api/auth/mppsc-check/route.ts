import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('mppsc_token');

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    // Verify user exists and is subscribed
    const { data: user, error } = await supabaseAdmin
        .from('mppsc_users')
        .select('name, email, is_subscribed')
        .eq('id', token.value)
        .single();
    
    if (error || !user) {
         return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ 
        authenticated: true, 
        user: { name: user.name, email: user.email, is_subscribed: user.is_subscribed } 
    });

  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
