import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  
  // ✅ FIX: Delete the CORRECT cookie name!
  // Login sets 'mppsc_token', so logout should delete 'mppsc_token'
  cookieStore.delete('mppsc_token');

  return NextResponse.json({ success: true });
}
