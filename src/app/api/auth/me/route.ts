import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await verifyAuth();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_subscribed: user.isSubscribed,
        plan_tier: user.planTier,
      }
    });
  } catch (error) {
    console.error('Session check failed:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
