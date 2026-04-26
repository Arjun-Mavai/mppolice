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

  // ✅ PERFORMANCE: Memoized navigation items (Synchronized with ce94fbf but removed Syllabus per request)
  const navItems = useMemo(() => [
    { name: 'Dashboard', href: '/syllabus/analytics', icon: LayoutDashboard, color: 'text-indigo-600' },
    { name: 'Test Hub', href: '/syllabus/quiz/full-tests', icon: GraduationCap, color: 'text-slate-700' },
    { name: 'Free Daily Quiz', href: '/free-quiz', icon: Zap, color: 'text-orange-500' },
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
      toast.loading('Refreshing app...', { description: 'Clearing cache and reloading...' });
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

          <DesktopNavigation navItems={navItems} pathname={pathname} user={user} />

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher language={language} setLanguage={setLanguage} />

            <div className="hidden h-6 w-px bg-slate-200 sm:block"></div>

            <UserSection 
              user={user}
              authCheckStatus={authCheckStatus}
              isMounted={isMounted}
              onLogout={handleLogout}
              onAdminDashboard={handleAdminDashboard}
            />

            {isMounted ? (
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
                          <div className="h-9 w-full animate-pulse rounded-xl bg-slate-200" />
                          <SheetTitle className="sr-only">Loading...</SheetTitle>
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
                              {user.isPro && (
                                <div
                                  className="absolute -right-1 -bottom-1 rounded-full border-2 border-white bg-amber-400 p-0.5 text-white"
                                  title="Premium"
                                >
                                  <Sparkles size={10} className="fill-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-1 flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-sm leading-none font-bold text-slate-900">
                                  {user.name}
                                </span>
                                {user.isPro && (
                                  <span className="rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase">
                                    Pro
                                  </span>
                                )}
                              </div>
                              <span className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                                {user.email}
                              </span>
                            </div>
                          </div>

                          <div className="w-full">
                            <button
                              onClick={handleManualRefresh}
                              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50/50 py-2.5 text-xs font-bold text-orange-700 transition-all hover:bg-orange-100 hover:border-orange-300 active:scale-95"
                              title={language === 'hi' ? 'ऐप रिफ्रेश करें / लोडिंग समस्या ठीक करें' : 'Refresh App / Fix Loading Issues'}
                            >
                              <RefreshCw size={14} className="transition-transform group-hover:rotate-180 duration-300" />
                              <span>
                                {language === 'hi' ? 'ऐप रिफ्रेश करें (लोडिंग समस्या ठीक करें)' : 'Refresh App / Fix Loading'}
                              </span>
                            </button>
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
                          
                          <button
                            onClick={handleManualRefresh}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50/50 py-2.5 text-xs font-bold text-orange-700 transition-all hover:bg-orange-100 hover:border-orange-300 active:scale-95"
                            title={language === 'hi' ? 'ऐप रिफ्रेश करें / लोडिंग समस्या ठीक करें' : 'Refresh App / Fix Loading Issues'}
                          >
                            <RefreshCw size={14} className="transition-transform group-hover:rotate-180 duration-300" />
                            <span>
                              {language === 'hi' ? 'ऐप रिफ्रेश करें (लोडिंग समस्या ठीक करें)' : 'Refresh App / Fix Loading'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </SheetHeader>


                  <div className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
                    {navItems
                      .filter((item) => {
                        if (item.name === 'Dashboard' || item.name === 'Test History')
                          return !!user;
                        if (item.name === 'About Us') return !!user;
                        return true;
                      })
                      .map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <div key={item.href} className="tap-scale-96">
                            <SheetClose asChild>
                              <Link
                                href={item.href}
                                className={cn(
                                  'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200',
                                  isActive
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                                )}
                              >
                                <Icon
                                  size={18}
                                  className={cn(isActive ? 'text-white' : item.color)}
                                />
                                {item.name}
                              </Link>
                            </SheetClose>
                          </div>
                        );
                      })}

                    {!user && (
                      <div className="tap-scale-96">
                        <SheetClose asChild>
                          <a
                            href="https://t.me/MP Police2026_Mission"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-sky-50 hover:text-sky-600"
                          >
                            <Send size={18} />
                            Join Telegram
                          </a>
                        </SheetClose>
                      </div>
                    )}

                    <div className="pt-3">
                      {user?.isSubscribed && user.planTier === 'pro' ? (
                        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-[1.5px] shadow-lg shadow-amber-200/40">
                          <div className="relative z-10 flex items-center gap-3 rounded-[11px] bg-slate-900 p-4 transition-all group-hover:bg-slate-800">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                              <Crown size={14} className="fill-amber-400 text-amber-400 shadow-sm" />
                            </div>
                            <div className="relative">
                              <h4 className="text-sm leading-tight font-black text-white uppercase tracking-wider">
                                Pro Active
                              </h4>
                              <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">
                                Premium Access Unlocked
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : user?.isSubscribed && user.planTier === 'lite' ? (
                        <>
                          <div className="rounded-xl border border-slate-200 bg-slate-100 p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200">
                                <Crown size={14} className="text-pink-500" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">Lite Member</h4>
                                <p className="text-[10px] text-slate-500">Limited Access</p>
                              </div>
                            </div>
                          </div>
                          <SheetClose asChild>
                            <Link href="/pricing" className="mt-2 block">
                              <div className="relative overflow-hidden rounded-xl p-[1.5px]">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-red-500 to-purple-500" />
                                <div className="relative flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white">
                                  <Sparkles size={18} className="text-pink-400" />
                                  Upgrade to Pro
                                </div>
                              </div>
                            </Link>
                          </SheetClose>
                        </>
                      ) : (
                        <>
                          <SheetClose asChild>
                            <Link
                              href="/pricing"
                              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-amber-50 active:bg-amber-100"
                            >
                              <Sparkles size={18} className="text-amber-500" />
                              Pricing
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              href="/pricing"
                              className="flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 tap-scale-98"
                            >
                              <Crown size={18} className="text-yellow-400" />
                              Become Premium Member
                            </Link>
                          </SheetClose>
                        </>
                      )}
                    </div>

                    {user?.role === 'admin' && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="mb-2 px-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          Admin
                        </p>
                        <div className="space-y-1">
                          <SheetClose asChild>
                            <Link
                              href="/admin/dashboard"
                              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100"
                            >
                              <LayoutDashboard size={18} /> Admin Dashboard
                            </Link>
                          </SheetClose>
                        </div>
                      </div>
                    )}

                    {isInstallable && (
                      <div className="mt-1 border-t-0 pt-0">
                        <SheetClose asChild>
                          <button
                            onClick={() => {
                              if (isIos) {
                                window.dispatchEvent(new CustomEvent('show-ios-install-prompt'));
                              } else {
                                installPwa();
                              }
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600"
                          >
                            <Download size={18} />
                            {isIos ? (language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App') : (language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App')}
                          </button>
                        </SheetClose>
                      </div>
                    )}

                  </div>

                  <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                    {user ? (
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} className="mr-2" />
                          Logout
                        </Button>
                      </SheetClose>
                    ) : (
                      <SheetClose asChild>
                        <Button
                          asChild
                          className="w-full rounded-xl bg-slate-900 font-bold text-white hover:bg-slate-800"
                        >
                          <Link href="/login" prefetch={false}>
                            Log in
                          </Link>
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                <Menu className="h-6 w-6 text-slate-600" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
