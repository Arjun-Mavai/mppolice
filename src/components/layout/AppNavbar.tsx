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
import { MP_POLICE_TELEGRAM_CHANNEL_URL } from '@/config/social-links';

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

// ✅ PERFORMANCE: Unified utility function to normalize user object
// Handles camelCase (Store) and snake_case (API/Props)
const normalizeUser = (rawUser: any): StoreUser | null => {
  if (!rawUser) return null;
  return {
    ...rawUser,
    id: rawUser.id || rawUser.userId,
    isSubscribed: rawUser.isSubscribed ?? rawUser.is_subscribed ?? false,
    planTier: rawUser.planTier ?? rawUser.plan_tier ?? 'free',
    role: rawUser.role ?? undefined,
  };
};

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
  const user = useMemo(() => normalizeUser(globalUser ?? initialUser), [globalUser, initialUser]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 CROSS-TAB SYNC
  // Listen for changes in other tabs (like logout)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'settings-storage') {
        if (!e.newValue) {
          // Store was cleared in another tab (Logout)
          setUser(null);
          window.location.href = '/login?reason=session_ended';
        } else {
          // Store updated in another tab (Login/Profile Update)
          // The persist middleware usually handles this, but a refresh is safer for auth
          router.refresh();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setUser, router]);

  // ✅ PERFORMANCE: Memoized navigation items
  const navItems = useMemo(() => [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-indigo-600' },
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
  // PERFORMANCE: DEFER GUEST AUTH CALL
  // ------------------------------------------------------------------
  const [shouldFetchAuth, setShouldFetchAuth] = useState(false);

  useEffect(() => {
    if (globalUser) {
      setShouldFetchAuth(true);
    } else {
      const timer = setTimeout(() => {
        setShouldFetchAuth(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [globalUser]);

  // ------------------------------------------------------------------
  // QUERY: SESSION RESTORATION (The "Hydration")
  // Pure data fetching only — no side effects inside queryFn.
  // Side effects (logout, toast) are handled in the Master useEffect below.
  // ------------------------------------------------------------------
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ['me'],
    enabled: shouldFetchAuth,
    queryFn: async () => {
      const result = await getCurrentUser();
      logger.debug('NAVBAR auth query result', {
        category: 'auth',
        userId: result.user?.id,
        metadata: {
          authenticated: Boolean(result.user),
          reason: 'reason' in result ? result.reason || null : null,
        },
      });
      if (result.user) {
        return {
          user: {
            ...result.user,
            isSubscribed: result.user.isSubscribed,
            planTier: result.user.planTier,
          },
        };
      }
      // Pass reason through so useEffect can react
      return result;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    void refetchSession();
  }, [pathname, refetchSession]);

  useEffect(() => {
    logger.debug('NAVBAR render auth state', {
      category: 'auth',
      userId: user?.id,
      metadata: {
        hasInitialUser: Boolean(initialUser),
        hasGlobalUser: Boolean(globalUser),
        authenticated: Boolean(user),
        authCheckStatus,
        isMounted,
        isSessionLoading,
      },
    });
  }, [user, initialUser, globalUser, authCheckStatus, isMounted, isSessionLoading]);


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // handleLogout — defined BEFORE useEffect so it's stable reference
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleLogout = useCallback(async (reason?: string | any) => {
    try {
      setUser(null);
      setAuthCheckStatus('checked');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('settings-storage');
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      try {
        await fetch('/api/auth/mppolice-logout', {
          method: 'POST',
          credentials: 'include',
          keepalive: true,
          signal: controller.signal,
        });
      } catch {
        // Proceed even if network timed out
      } finally {
        clearTimeout(timeoutId);
      }
      // Clear non-httpOnly auth cookie fallbacks directly if any
      if (typeof document !== 'undefined') {
        document.cookie = '_app_sid=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'mppolice_token=; path=/; max-age=0; SameSite=Lax';
      }
      const safeReason = typeof reason === 'string' ? reason : 'logged_out';
      window.location.href = `/login?reason=${encodeURIComponent(safeReason)}`;
    } catch (error) {
      localStorage.removeItem('settings-storage');
      window.location.href = '/login?reason=logged_out';
    }
  }, [setUser, setAuthCheckStatus]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 MOUNT STATE + 🛡️ INDEXEDDB CRYPTOGRAPHIC VAULT CHECK
  // On mount: detect if session cookie was pasted into Incognito
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    setIsMounted(true);

    // 🛡️ Client Device Integrity & Cryptographic Proof-of-Possession Check
    import('@/lib/device-client').then(async ({ getOrCreateDeviceId, verifyClientVaultPossession }) => {
      // Vault possession is required only for the new WebCrypto device cookie.
      // Legacy IDs predate the IndexedDB key and must remain compatible.
      const didMatch = document.cookie.match(/(?:^|;\s*)_app_cid=([^;]+)/);
      const cookieDid = didMatch ? decodeURIComponent(didMatch[1]) : null;
      if (cookieDid) {
        const isPossessionValid = await verifyClientVaultPossession(cookieDid);
        if (!isPossessionValid) {
          // Cryptographic private key is absent from IndexedDB!
          // (Cookie was copied into Incognito or another machine)
          try {
            fetch('/api/auth/security-alert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reason: 'client_vault_missing',
                detail: 'Device cookie present but non-extractable IndexedDB cryptographic key is absent',
                path: window.location.pathname,
              }),
              keepalive: true,
            }).catch(() => {});
          } catch {}
          handleLogout('unauthorized_device');
          return;
        }
      }
      // Ensure device ID is generated & persisted for new sessions
      getOrCreateDeviceId().catch(() => {});
    });
  }, [handleLogout]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 MASTER AUTHENTICATION SYNC
  // Single effect = no race conditions, no effect chaining
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    // 1. React Query returned data → trust server state first
    if (sessionData) {
      // 🚨 Security: kicked by new device login
      if ((sessionData as any).reason === 'multi_device') {
        toast.error('Security Alert', {
          description: 'This session was logged out because your account was opened on another device.',
          duration: 10000,
        });
        handleLogout('multi_device');
        return;
      }

      // 🚨 Security: device binding mismatch (cookie theft detection)
      if ((sessionData as any).reason === 'device_mismatch' || (sessionData as any).reason === 'unauthorized_device') {
        toast.error('Security Alert', {
          description: 'This session is tied to another browser or device. Please log in directly.',
          duration: 10000,
        });
        handleLogout('device_mismatch');
        return;
      }

      if (sessionData.user) {
        const newUser = normalizeUser(sessionData.user);
        
        // PERFORMANCE: Deep compare to prevent unnecessary re-renders/loops
        if (JSON.stringify(newUser) !== JSON.stringify(globalUser)) {
          logger.info('Session refreshed from server');
          setUser(newUser);
        } else if (authCheckStatus !== 'checked') {
          setAuthCheckStatus('checked');
        }
      } else if (!initialUser) {
        // Only clear client state when the server-rendered layout also confirms
        // that there is no authenticated session. A transient client query
        // response must not turn an authenticated navbar into a login button.
        if (globalUser) {
          logger.info('No active session, clearing stale data');
          setUser(null);
        } else if (authCheckStatus !== 'checked') {
          setAuthCheckStatus('checked');
        }
      } else if (authCheckStatus !== 'checked') {
        setAuthCheckStatus('checked');
      }
      return;
    }

    // 2. React Query still fetching → show loading only if we don't have local data
    if (isSessionLoading) {
      if (!globalUser && authCheckStatus !== 'loading') {
        setAuthCheckStatus('loading');
      }
      return;
    }

    // 3. Fallback for guest/offline or hydration
    if (authCheckStatus === 'idle') {
      if (initialUser && !globalUser) {
        setUser(normalizeUser(initialUser));
      } else if (!isSessionLoading) {
        setAuthCheckStatus('checked');
      }
    }
  }, [
    globalUser,
    initialUser,
    sessionData,
    isSessionLoading,
    authCheckStatus,
    setUser,
    setAuthCheckStatus,
    handleLogout,
  ]);

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
                      <div className="space-y-1">
                        <div className="tap-scale-96">
                          <SheetClose asChild>
                            <a
                              href={MP_POLICE_TELEGRAM_CHANNEL_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-sky-50 hover:text-sky-600"
                            >
                              <Send size={18} className="text-sky-500" />
                              Join Telegram
                            </a>
                          </SheetClose>
                        </div>
                        <div className="tap-scale-96">
                          <SheetClose asChild>
                            <a
                              href="https://www.youtube.com/@MPPOLICEZen-h2s"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                stroke="none"
                                width="18"
                                height="18"
                                className="text-red-500"
                              >
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                              </svg>
                              YouTube Channel
                            </a>
                          </SheetClose>
                        </div>
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
                          onClick={() => handleLogout()}
                        >
                          <LogOut size={16} className="mr-2" />
                          Logout
                        </Button>
                      </SheetClose>
                    ) : (
                      <SheetClose asChild>
                        <Button
                          asChild
                          className="w-full cursor-pointer rounded-xl bg-slate-900 font-bold text-white hover:bg-slate-800"
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
