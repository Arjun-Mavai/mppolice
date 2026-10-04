import { Suspense } from 'react';
import { verifyAuth } from '@/lib/auth';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { logger } from '@/lib/logger';

export async function AppHeader() {
  const user = await verifyAuth();
  logger.debug('APP HEADER auth result', {
    category: 'auth',
    userId: user?.id,
    metadata: { authenticated: Boolean(user), email: user?.email || null },
  });

  // Transform user object if needed to match AppNavbar props
  const userData = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        image: null,
        role: user.role ?? undefined,
        is_subscribed: !!user.isSubscribed,
        plan_tier: user.planTier || 'free',
      }
    : null;

  return (
    <Suspense fallback={null}>
      <AppNavbar user={userData} />
    </Suspense>
  );
}
