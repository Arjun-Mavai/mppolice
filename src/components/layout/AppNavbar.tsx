'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSettingsStore, User as StoreUser } from '@/store/useSettingsStore';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { usePwa } from '@/hooks/usePwa';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/actions/auth-actions';

import './navbar-animations.css';

// Optimized imports - tree-shakeable
import {
  Menu,
  Send,
  Crown,
  Sparkles,
  RefreshCw,
  Download,
  LogOut,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Zap,
  History,
  Info,
} from './icons';

// Import optimized sub-components
import { NavbarLogo } from './NavbarLogo';
import { DesktopNavigation } from './DesktopNavigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserSection } from './UserSection';

interface PropUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  is_subscribed?: boolean;
  plan_tier?: 'free' | 'lite' | 'pro';
}

interface AppNavbarProps {
  user: PropUser | null;
}

// Helper type to handle both Store (camelCase) and API/Prop (snake_case) user shapes
type UnifiedUser = StoreUser & PropUser;

// ✅ PERFORMANCE: Utility function to normalize user object
const normalizeUser = (rawUser: UnifiedUser | null) => {
  return rawUser
    ? {
        ...rawUser,
        isSubscribed: rawUser.isSubscribed ?? rawUser.is_subscribed,
        planTier: rawUser.planTier ?? rawUser.plan_tier,
      }
    : null;
};

// ✅ PERFORMANCE: Utility function to convert user to store format
const createUserToStore = (user: any) => ({
  ...user,
  role: user.role ?? undefined,
  isSubscribed: user.isSubscribed ?? user.is_subscribed ?? undefined,
  planTier: user.planTier ?? user.plan_tier ?? undefined,
});

export function AppNavbar({ user: initialUser }: AppNavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Use Global Store
  const {
    language,
    setLanguage,
    user: globalUser,
    setUser,
    authCheckStatus,
    setAuthCheckStatus,
  } = useSettingsStore();

  const { isInstallable, installPwa, isIos } = usePwa();

  // Create a merged user object (prop + global), favoring global if updated
  const rawUser = (globalUser || initialUser) as UnifiedUser | null;
  const user = normalizeUser(rawUser);

  // ✅ PERFORMANCE: Memoized navigation items (Reverted to ce94fbf version)
  const navItems = useMemo(() => [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-slate-700' },
    {
      name: 'Test Series',
      href: '/syllabus/quiz/pyq',
      icon: GraduationCap,
      color: 'text-amber-600',
    },
    { name: 'Free Daily Quiz', href: '/free-quiz', icon: Zap, color: 'text-orange-500' },
    { name: 'Blogs', href: '/blogs', icon: BookOpen, color: 'text-sky-600' },
    {
      name: 'Test History',
      href: '/syllabus/test-history',
      icon: History,
      color: 'text-violet-600',
    },
    { name: 'About Us', href: '/', icon: Info, color: 'text-slate-500' },
  ], []);

  // ------------------------------------------------------------------
  // QUERY: SESSION RESTORATION (The "Hydration")
  // ------------------------------------------------------------------
  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const result = await getCurrentUser();
      if (result.user) {
        return {
          user: {
            ...result.user,
            isSubscribed: result.user.isSubscribed,
            planTier: result.user.planTier,
          },
        };
      }
      return result;
    },
    enabled: !initialUser && !globalUser,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const needsSync = initialUser && (authCheckStatus === 'idle' || (initialUser.id && !globalUser?.id));
    if (needsSync) {
      const userToStore = createUserToStore(initialUser);
      setUser(userToStore, true);
    }
  }, [initialUser, authCheckStatus, globalUser, setUser]);

  useEffect(() => {
    if (globalUser && authCheckStatus === 'idle') {
      setAuthCheckStatus('checked');
    }
  }, [globalUser, authCheckStatus, setAuthCheckStatus]);

  useEffect(() => {
    if (globalUser) return;

    if (sessionData) {
      if (sessionData.user) {
        logger.info('Session restored successfully');
        const userToStore = createUserToStore(sessionData.user);
        setUser(userToStore, true);
      } else {
        setAuthCheckStatus('checked');
      }
    } else if (!isSessionLoading && authCheckStatus === 'idle' && !initialUser) {
      setAuthCheckStatus('checked');
    }

    if (isSessionLoading) {
      setAuthCheckStatus('loading');
    }
  }, [sessionData, isSessionLoading, authCheckStatus, initialUser, globalUser, setUser, setAuthCheckStatus]);

  const handleLogout = useCallback(async () => {
    try {
      setUser(null, false);
      setAuthCheckStatus('checked');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('settings-storage');
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      await fetch('/api/auth/mppolice-logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      localStorage.removeItem('settings-storage');
      window.location.href = '/';
    }
  }, [setUser, setAuthCheckStatus]);

  const handleManualRefresh = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      window.location.reload();
    } catch (error) {
      window.location.reload();
    }
  }, []);

  const handleAdminDashboard = useCallback(() => {
    router.push('/admin/dashboard');
  }, [router]);

  const isCompleted = searchParams.get('completed') === 'true';
  const isQuizPlay = (pathname.includes('/quiz/play') || pathname.includes('/free-quiz/play')) && !isCompleted;
  
  if (isQuizPlay) return null;

  return (
    <header className="fixed top-0 right-0 left-0 z-50 [animation:navbar-scroll_linear_both] border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-md transition-all duration-300 [animation-range:0px_50px] [animation-timeline:scroll()]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <NavbarLogo user={user} />

          <DesktopNavigation 
            navItems={navItems}
            pathname={pathname}
            user={user}
          />

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher 
              language={language}
              setLanguage={setLanguage}
            />

            <div className="hidden h-6 w-px bg-slate-200 sm:block"></div>

            <UserSection 
              user={user}
              authCheckStatus={authCheckStatus}
              isMounted={isMounted}
              onLogout={handleLogout}
              onAdminDashboard={handleAdminDashboard}
            />

            {isMounted && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                    <Menu className="h-6 w-6 text-slate-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="z-[150] flex w-[300px] flex-col p-0 sm:w-[360px]"
                >
                  <SheetHeader className="border-b border-slate-100 bg-slate-50/50 p-6 text-left">
                    <div className="flex flex-col gap-4">
                      {(authCheckStatus === 'idle' || authCheckStatus === 'loading') && !user ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                            <div className="flex flex-1 flex-col gap-2">
                              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                              <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                            </div>
                          </div>
                        </div>
                      ) : user ? (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage src={user.image || ''} />
                                <AvatarFallback className="bg-slate-900 font-bold text-white">
                                  {user.name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex flex-1 flex-col">
                              <span className="text-sm font-bold text-slate-900">{user.name}</span>
                              <span className="mt-1 truncate text-xs text-slate-500">{user.email}</span>
                            </div>
                          </div>
                          <SheetTitle className="sr-only">Menu</SheetTitle>
                        </>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                              <span className="text-xs font-bold">MP</span>
                            </div>
                            <SheetTitle className="font-display text-lg font-bold">Menu</SheetTitle>
                          </div>
                        </div>
                      )}
                    </div>
                  </SheetHeader>

                  <div className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
                    {navItems
                      .filter((item) => {
                        if (item.name === 'Dashboard' || item.name === 'Test History') return !!user;
                        if (item.name === 'About Us') return !!user;
                        return true;
                      })
                      .map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <SheetClose asChild key={item.href}>
                            <Link
                              href={item.href}
                              className={cn(
                                'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200',
                                isActive
                                  ? 'bg-slate-900 text-white shadow-sm'
                                  : 'text-slate-700 hover:bg-slate-100'
                              )}
                            >
                              <Icon size={18} className={cn(isActive ? 'text-white' : item.color)} />
                              {item.name}
                            </Link>
                          </SheetClose>
                        );
                      })}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
