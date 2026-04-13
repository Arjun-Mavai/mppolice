'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { AppFooter } from '@/components/layout/AppFooter';
import { MainContentWrapper } from '@/components/layout/MainContentWrapper';

type NavbarUser =
  | {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      is_subscribed?: boolean;
      plan_tier?: 'free' | 'lite' | 'pro';
    }
  | null;

export function AppShell({
  navbarUser,
  children,
}: {
  navbarUser: NavbarUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isAdminRoute = useMemo(() => {
    return (pathname ?? '').startsWith('/admin');
  }, [pathname]);

  // Make language toggles (store-only) feel instant across the app.
  // We keep this here (instead of inside LanguageSwitcher) so it can work
  // even when the switcher is not currently mounted.
  useEffect(() => {
    // no-op: placeholder for future global shell effects
  }, []);

  const navbarProps = useMemo(() => ({ user: navbarUser }), [navbarUser]);

  const handleRouteRefresh = useCallback(() => {
    // Refresh RSC + client data dependencies.
    router.refresh();
  }, [router]);

  if (isAdminRoute) {
    // Admin has its own layout (header/sidebar). Avoid double fixed headers/overlays.
    return <>{children}</>;
  }

  return (
    <>
      <AppNavbar {...navbarProps} onAfterLanguageChange={handleRouteRefresh} />
      <MainContentWrapper>{children}</MainContentWrapper>
      <AppFooter />
    </>
  );
}

