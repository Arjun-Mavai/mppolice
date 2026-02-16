'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  BookOpen,
  BarChart2,
  Sparkles,
  Settings,
  Languages,
  Send,
  GraduationCap,
  Crown,
  Info,
  History,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useEffect } from 'react';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { usePwa } from '@/hooks/usePwa';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/actions/auth-actions';

interface PropUser {
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

export function AppNavbar({ user: initialUser }: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Use Global Store
  const {
    language,
    setLanguage,
    user: globalUser,
    setUser,
    authCheckStatus,
    setAuthCheckStatus,
  } = useSettingsStore();

  const { isInstallable, installPwa } = usePwa();

  // Create a merged user object (prop + global), favoring global if updated
  const rawUser = (globalUser || initialUser) as UnifiedUser | null;

  // Helper to normalize user object to store format (camelCase)
  const user = rawUser
    ? {
        ...rawUser,
        isSubscribed: rawUser.isSubscribed ?? rawUser.is_subscribed,
        planTier: rawUser.planTier ?? rawUser.plan_tier,
      }
    : null;

  // ------------------------------------------------------------------
  // QUERY: SESSION RESTORATION (The "Hydration") - NOW WITH SERVER ACTION!
  // ------------------------------------------------------------------
  // 🔒 SECURITY UPGRADE: Using Server Action instead of API route
  // Benefits: No userId visible in Network tab, automatic JWT handling
  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      // ✅ Server Action - No API endpoint visible!
      const result = await getCurrentUser();

      // Transform to match expected format
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
    // Only fetch if we don't have a user yet
    enabled: !initialUser && !globalUser,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    retry: false,
  });

  // Sync React Query result to Zustand Store
  useEffect(() => {
    if (sessionData) {
      if (sessionData.user) {
        logger.info('Session restored successfully for:', {
          category: 'auth',
          user: sessionData.user,
        });
        // Fix TypeScript: Convert null to undefined for role, isSubscribed, planTier
        const userToStore = {
          ...sessionData.user,
          role: sessionData.user.role ?? undefined,
          isSubscribed: sessionData.user.isSubscribed ?? undefined,
          planTier: sessionData.user.planTier ?? undefined,
        };
        setUser(userToStore, true);
      } else {
        logger.debug('No active session found during hydration.');
        setAuthCheckStatus('checked');
      }
    } else if (!isSessionLoading && authCheckStatus === 'idle' && !initialUser && !globalUser) {
      // Query finished but no data (error or empty)
      setAuthCheckStatus('checked');
    }

    if (isSessionLoading) {
      setAuthCheckStatus('loading');
    }
  }, [sessionData, isSessionLoading, setUser, setAuthCheckStatus]);

  const handleLogout = async () => {
    try {
      // 1. Clear Zustand store + localStorage immediately
      setUser(null, false);
      setAuthCheckStatus('checked');

      // 2. Nuke persisted Zustand state from localStorage so other tabs don't restore stale user
      if (typeof window !== 'undefined') {
        localStorage.removeItem('settings-storage');
      }

      // 3. Clear Service Worker cache to prevent stale HTML/API responses
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // 4. Hit server to delete httpOnly cookie
      await fetch('/api/auth/mppsc-logout', { method: 'POST' });

      // 5. Hard reload — flush Next.js router cache + RSC cache completely
      window.location.href = '/';
    } catch (error) {
      logger.error('Logout failed:', error);

      toast.error('Logout Error', {
        description: 'Failed to logout properly. Redirecting...',
        duration: 3000,
      });

      // Even if API fails, nuke everything and redirect
      localStorage.removeItem('settings-storage');
      if ('caches' in window) {
        caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
      }
      window.location.href = '/';
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-slate-700' },
    { name: 'Syllabus', href: '/syllabus', icon: BookOpen, color: 'text-emerald-600' },
    {
      name: 'Test Series',
      href: '/syllabus/quiz/pyq',
      icon: GraduationCap,
      color: 'text-amber-600',
    },
    { name: 'Blogs', href: '/blogs', icon: BookOpen, color: 'text-sky-600' },
    {
      name: 'Test History',
      href: '/syllabus/test-history',
      icon: History,
      color: 'text-violet-600',
    },
    { name: 'About Us', href: '/', icon: Info, color: 'text-slate-500' },
  ];

  // Only hide on the actual quiz play interface
  if (pathname.includes('/quiz/play')) return null;

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-slate-200 bg-white/90 py-2 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo — logged in users go to quiz, others go home */}
          <div
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              router.push(user ? '/syllabus/quiz/pyq' : '/');
            }}
            className="group flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 transition-transform group-hover:scale-105">
              <span className="text-xs font-bold tracking-tighter">MP</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg leading-none font-bold text-slate-900">
                MPPSC<span className="text-slate-500">26</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
                Mindful Prep
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 rounded-full border border-slate-200/50 bg-slate-100/50 p-1.5 backdrop-blur-md md:flex">
            {navItems
              .filter((item) => {
                // Hide Dashboard if user is not logged in
                if (item.name === 'Dashboard') return !!user;
                // Test History & About Us — sidebar only, not in desktop top nav
                if (item.name === 'Test History' || item.name === 'About Us') return false;
                return true;
              })
              .map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                    )}
                  >
                    <Icon size={16} className={cn(isActive && 'fill-slate-600/10')} />
                    {item.name}
                  </Link>
                );
              })}
            {user && user.isSubscribed && user.planTier === 'pro' ? (
              /* Pro Badge — seamless golden-red-pink conic border, no gap */
              <div className="relative overflow-hidden rounded-full p-[1.5px]">
                <div className="animate-spin-slow absolute inset-0 bg-[conic-gradient(from_0deg,#fbbf24,#f59e0b,#ef4444,#ec4899,#f59e0b,#fbbf24,#d97706,#ef4444,#ec4899,#fbbf24)]" />
                <div className="relative flex cursor-default items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-2 text-sm font-bold text-white">
                  <div className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent,25%,rgba(255,255,255,0.1),50%,transparent)] bg-[length:250%_100%]" />
                  <Sparkles size={12} className="relative z-10 fill-yellow-400 text-yellow-400" />
                  <span className="relative z-10 text-[10px] font-black tracking-wide uppercase">
                    Pro
                  </span>
                </div>
              </div>
            ) : user && user.isSubscribed && user.planTier === 'lite' ? (
              /* Lite Badge — tag style on desktop (no button), animated border */
              <div className="relative overflow-hidden rounded-full p-[1.5px]">
                <div className="animate-spin-slow absolute inset-0 bg-[conic-gradient(from_0deg,#ec4899,#ef4444,#f59e0b,#8b5cf6,#3b82f6,#ec4899,#ef4444,#f59e0b,#ec4899)]" />
                <div className="relative flex cursor-default items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-bold text-white">
                  <Sparkles size={12} className="fill-pink-500 text-pink-500" />
                  <span className="text-[10px] font-black tracking-wide uppercase">Lite</span>
                </div>
              </div>
            ) : user ? (
              /* Free user — Upgrade button with animated red-pink border */
              <div className="relative overflow-hidden rounded-full p-[1.5px]">
                <div className="animate-spin-slow absolute inset-0 bg-[conic-gradient(from_0deg,#ec4899,#ef4444,#f59e0b,#8b5cf6,#3b82f6,#ec4899,#ef4444,#f59e0b,#ec4899)]" />
                <Link
                  href="/upgrade"
                  className="relative flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-md"
                >
                  <Sparkles size={14} className="fill-white/20" />
                  Upgrade
                </Link>
              </div>
            ) : null}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Language Toggle - Visible on All Screens */}
            <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-100 p-1">
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  'rounded-full px-2 py-1 text-[10px] font-bold transition-all sm:px-3 sm:text-xs',
                  language === 'en'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={cn(
                  'rounded-full px-2 py-1 text-[10px] font-bold transition-all sm:px-3 sm:text-xs',
                  language === 'hi'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                HI
              </button>
            </div>

            <div className="hidden h-6 w-px bg-slate-200 sm:block"></div>

            {/* LOADING STATE FIX: Don't show login button while checking auth */}
            {authCheckStatus === 'idle' || authCheckStatus === 'loading' ? (
              // Show skeleton while checking auth to prevent flash
              <div className="hidden h-10 w-10 animate-pulse rounded-full bg-slate-100 md:flex" />
            ) : user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative hidden h-10 w-10 rounded-full p-0 ring-2 ring-slate-100 transition-all hover:ring-slate-200 md:flex"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                      <AvatarFallback className="border border-slate-100 bg-slate-50 font-bold text-slate-700">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">{user.name}</p>
                      <p className="text-muted-foreground truncate text-xs leading-none">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  {user && user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button
                  asChild
                  className="hidden rounded-full bg-slate-900 px-6 font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 sm:flex"
                >
                  <Link href="/login" prefetch={false}>
                    Log in
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                  <Menu className="h-6 w-6 text-slate-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[300px] flex-col p-0 sm:w-[360px]">
                <SheetHeader className="border-b border-slate-100 bg-slate-50/50 p-6 text-left">
                  <div className="flex items-center gap-3">
                    {/* LOADING STATE FIX: Show skeleton in mobile menu too */}
                    {authCheckStatus === 'idle' || authCheckStatus === 'loading' ? (
                      <>
                        <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                          <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                        </div>
                        <SheetTitle className="sr-only">Loading...</SheetTitle>
                      </>
                    ) : user ? (
                      <>
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
                        <div className="flex flex-col">
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
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                          <span className="text-xs font-bold">MP</span>
                        </div>
                        <SheetTitle className="font-display text-lg font-bold">Menu</SheetTitle>
                      </div>
                    )}
                  </div>
                </SheetHeader>

                <div className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
                  {navItems
                    .filter((item) => {
                      // Dashboard & Test History — logged-in users only
                      if (item.name === 'Dashboard' || item.name === 'Test History') return !!user;
                      // About Us — logged-in users only (they see home as about page)
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
                                : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                            )}
                          >
                            <Icon size={18} className={cn(isActive ? 'text-white' : item.color)} />
                            {item.name}
                          </Link>
                        </SheetClose>
                      );
                    })}

                  <SheetClose asChild>
                    <a
                      href="https://t.me/MPPSC2026_Mission"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-sky-50 hover:text-sky-600"
                    >
                      <Send size={18} />
                      Join Telegram
                    </a>
                  </SheetClose>

                  <div className="pt-3">
                    {user?.isSubscribed && user.planTier === 'pro' ? (
                      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
                        <div className="relative z-10 flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                            <Crown size={14} className="fill-yellow-400 text-yellow-400" />
                          </div>
                          <div>
                            <h4 className="text-sm leading-tight font-bold text-white">
                              Pro Active
                            </h4>
                            <p className="text-[10px] font-medium text-slate-400">
                              All Features Unlocked
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : user?.isSubscribed && user.planTier === 'lite' ? (
                      <>
                        {/* Lite tag in mobile menu */}
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
                        {/* Animated Upgrade button — red/pink spinning border */}
                        <SheetClose asChild>
                          <Link href="/upgrade" className="mt-2 block">
                            <div className="relative overflow-hidden rounded-xl p-[1.5px]">
                              <div className="animate-spin-slow absolute inset-0 bg-[conic-gradient(from_0deg,#ec4899,#ef4444,#f59e0b,#8b5cf6,#3b82f6,#ec4899,#ef4444,#f59e0b,#ec4899)]" />
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
                            href="/upgrade"
                            className="flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 active:scale-[0.98]"
                          >
                            <Crown size={18} className="text-yellow-400" />
                            Become Premium Member
                          </Link>
                        </SheetClose>
                      </>
                    )}
                  </div>

                  {/* Admin Controls — single link to admin panel (sidebar handles rest) */}
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

                  {/* Install App Button */}
                  {isInstallable && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <SheetClose asChild>
                        <button
                          onClick={installPwa}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <Download size={18} />
                          Install App
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
          </div>
        </div>
      </div>
    </header>
  );
}
// trigger rebuild
