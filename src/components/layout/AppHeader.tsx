import { Suspense } from 'react';
import { verifyAuth } from '@/lib/auth';
import { AppNavbar } from '@/components/layout/AppNavbar';

export async function AppHeader() {
  const user = await verifyAuth();

  // Transform user object if needed to match AppNavbar props
  const userData = user
    ? {
        name: user.name,
        email: user.email, // Ensure email is available in user object from verifyAuth
        image: null, // Add image if available in DB
      }
    : null;

  return (
    <Suspense fallback={null}>
      <AppNavbar user={userData} />
    </Suspense>
  );
}
