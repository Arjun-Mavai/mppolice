import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // clear the cookie
  cookieStore.delete('mppsc_token');

  return NextResponse.json({ success: true });
}
