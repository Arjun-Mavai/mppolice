import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = await cookies();

  // ✅ FIX: Delete the CORRECT cookie name!
  // Login sets 'mppolice_token', so logout should delete 'mppolice_token'
  cookieStore.delete('mppolice_token');

  return NextResponse.json({ success: true });
}
