
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { usePwa } from "@/hooks/usePwa";

interface AppNavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    is_subscribed?: boolean;
    plan_tier?: 'free' | 'lite' | 'pro';
  } | null;
}

export function AppNavbar({ user: initialUser }: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = React.useState(false);
  
  // Use Global Store
  const { language, setLanguage, user: globalUser, setUser, authCheckStatus, setAuthCheckStatus } = useSettingsStore();

  const { isInstallable, installPwa } = usePwa();

  
  // Create a merged user object (prop + global), favoring global if updated
  // Actually, usually global store should be source of truth if we set it on mount in layout
  const user = globalUser || initialUser;

  // ------------------------------------------------------------------
  // EFFECT 1: SCROLL LISTENER (The "Visuals")
  // ------------------------------------------------------------------
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // ------------------------------------------------------------------
  // EFFECT 1.5: CROSS-TAB LOGOUT SYNC
  // ------------------------------------------------------------------
  // When user logs out in one tab, localStorage is cleared.
  // This listener detects that change in other tabs and forces a reload
  // so stale auth state doesn't persist across browser tabs.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'settings-storage' && e.newValue === null) {
        // Another tab cleared auth — reload this tab to reflect logged-out state
        setUser(null, false);
        setAuthCheckStatus('checked');
        window.location.href = '/';
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setUser, setAuthCheckStatus]);

  // ------------------------------------------------------------------
  // EFFECT 2: SESSION RESTORATION (The "Hydration")
  // ------------------------------------------------------------------
  // Why: When a user reloads the page, the client side `user` prop might be null initially.
  // We need to fetch the session from the server to restore the specific user state.
  // CRITICAL OPTIMIZATION: We check `authCheckStatus === 'idle'` to ensure this ONLY runs once per session load.
  useEffect(() => {
    // Only fetch if:
    // 1. No initial user passed from server component
    // 2. Global store is empty
    // 3. We haven't already checked (status is 'idle')
    if (!initialUser && !globalUser && authCheckStatus === 'idle') {
        setAuthCheckStatus('loading');
        
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    logger.info("Session restored successfully for:", data.user.email);
                    setUser(data.user, true);
                } else {
                    // Important: Mark as checked even if no user found to prevent future loops
                    logger.debug("No active session found during hydration.");
                    setAuthCheckStatus('checked');
                }
            })
            .catch(err => {
                logger.error("Failed to restore session:", err);
                setAuthCheckStatus('checked'); // Stop retrying on error
                
                // Notify user about authentication error
                toast.error("Authentication Error", {
                    description: "Unable to verify your session. Please try refreshing the page.",
                    duration: 5000,
                });
            });
    }
  }, [initialUser, globalUser, setUser, authCheckStatus, setAuthCheckStatus]);

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
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }

        // 4. Hit server to delete httpOnly cookie
        await fetch('/api/auth/mppsc-logout', { method: 'POST' });
        
        // 5. Hard reload — flush Next.js router cache + RSC cache completely
        window.location.href = '/';
      } catch (error) {
        logger.error('Logout failed:', error);
        
        toast.error("Logout Error", {
            description: "Failed to logout properly. Redirecting...",
            duration: 3000,
        });
        
        // Even if API fails, nuke everything and redirect
        localStorage.removeItem('settings-storage');
        if ('caches' in window) {
          caches.keys().then(names => names.forEach(name => caches.delete(name)));
        }
        window.location.href = '/';
      }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-slate-700" },
    { name: "Syllabus", href: "/syllabus", icon: BookOpen, color: "text-emerald-600" },
    { name: "Test Series", href: "/syllabus/quiz/pyq", icon: GraduationCap, color: "text-amber-600" },
    { name: "Blogs", href: "/blogs", icon: BookOpen, color: "text-sky-600" },
    { name: "Test History", href: "/syllabus/test-history", icon: History, color: "text-violet-600" },
    { name: "About Us", href: "/", icon: Info, color: "text-slate-500" },
  ];

  // Only hide on the actual quiz play interface
  if (pathname.includes('/quiz/play')) return null;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-white/90 backdrop-blur-md border-slate-200 shadow-sm py-2"
          : "bg-white/50 backdrop-blur-sm border-transparent py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo — logged in users go to quiz, others go home */}
          <div 
            onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                router.push(user ? '/syllabus/quiz/pyq' : '/');
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20 transition-transform group-hover:scale-105">
                 <span className="font-bold text-xs tracking-tighter">MP</span>
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg font-display text-slate-900 leading-none">MPPSC<span className="text-slate-500">26</span></span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Mindful Prep</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50 backdrop-blur-md">
            {navItems
              .filter(item => {
                // Hide Dashboard if user is not logged in
                if (item.name === "Dashboard") return !!user;
                // Test History & About Us — sidebar only, not in desktop top nav
                if (item.name === "Test History" || item.name === "About Us") return false;
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
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    isActive
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  )}
                >
                  <Icon size={16} className={cn(isActive && "fill-slate-600/10")} />
                  {item.name}
                </Link>
              );
            })}
                  {user && user.is_subscribed && (user as any)?.plan_tier === 'pro' ? (
                    /* Pro Badge — seamless golden-red-pink conic border, no gap */
                    <div className="relative p-[1.5px] rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#fbbf24,#f59e0b,#ef4444,#ec4899,#f59e0b,#fbbf24,#d97706,#ef4444,#ec4899,#fbbf24)] animate-spin-slow" />
                        <div className="relative px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white cursor-default overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,25%,rgba(255,255,255,0.1),50%,transparent)] bg-[length:250%_100%] animate-shimmer" />
                            <Sparkles size={12} className="text-yellow-400 fill-yellow-400 relative z-10" />
                            <span className="tracking-wide uppercase text-[10px] relative z-10 font-black">Pro</span>
                        </div>
                    </div>
                  ) : user && user.is_subscribed && (user as any)?.plan_tier === 'lite' ? (
                    /* Lite Badge — tag style on desktop (no button), animated border */
                    <div className="relative p-[1.5px] rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ec4899,#ef4444,#f59e0b,#8b5cf6,#3b82f6,#ec4899,#ef4444,#f59e0b,#ec4899)] animate-spin-slow" />
                        <div className="relative px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 bg-black text-white cursor-default">
                            <Sparkles size={12} className="text-pink-500 fill-pink-500" />
                            <span className="tracking-wide uppercase text-[10px] font-black">Lite</span>
                        </div>
                    </div>
                  ) : user ? (
                    /* Free user — Upgrade button with animated red-pink border */
                    <div className="relative p-[1.5px] rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ec4899,#ef4444,#f59e0b,#8b5cf6,#3b82f6,#ec4899,#ef4444,#f59e0b,#ec4899)] animate-spin-slow" />
                        <Link
                            href="/upgrade"
                            className="relative px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 bg-slate-900 text-white hover:shadow-md hover:scale-105"
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
             <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-full border border-slate-200">
                <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                        "px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all",
                        language === 'en' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    EN
                </button>
                <button
                    onClick={() => setLanguage('hi')}
                    className={cn(
                        "px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all",
                        language === 'hi' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    HI
                </button>
             </div>

             <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

            {/* LOADING STATE FIX: Don't show login button while checking auth */}
            {authCheckStatus === 'idle' || authCheckStatus === 'loading' ? (
              // Show skeleton while checking auth to prevent flash
              <div className="hidden md:flex h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
               <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-slate-100 hover:ring-slate-200 transition-all p-0 hidden md:flex">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={(user as any)?.image || ""} alt={user.name || "User"} />
                      <AvatarFallback className="bg-slate-50 text-slate-700 font-bold border border-slate-100">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                 
                   
                  
                  {(user && user.role === 'admin') && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                        </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
                <div className="flex gap-2">
                    <Button asChild className="rounded-full bg-slate-900 text-white hover:bg-slate-800 hidden sm:flex px-6 font-bold shadow-lg shadow-slate-900/20">
                        <Link href="/login" prefetch={false}>Log in</Link>
                    </Button>
                </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                        <Menu className="h-6 w-6 text-slate-600" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0 flex flex-col">
                    <SheetHeader className="p-6 border-b border-slate-100 text-left bg-slate-50/50">
                         <div className="flex items-center gap-3">
                            {/* LOADING STATE FIX: Show skeleton in mobile menu too */}
                            {authCheckStatus === 'idle' || authCheckStatus === 'loading' ? (
                                <>
                                    <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                                        <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
                                    </div>
                                    <SheetTitle className="sr-only">Loading...</SheetTitle>
                                </>
                            ) : user ? (
                                <>
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                            <AvatarImage src={(user as any)?.image || ""} />
                                            <AvatarFallback className="bg-slate-900 text-white font-bold">
                                                {user.name?.charAt(0).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        {(user as any)?.is_pro && (
                                            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white p-0.5 rounded-full border-2 border-white" title="Premium">
                                                <Sparkles size={10} className="fill-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-slate-900 leading-none">{user.name}</span>
                                            {(user as any)?.is_pro && (
                                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200 uppercase tracking-wider">
                                                    Pro
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500 mt-1 truncate max-w-[180px]">{user.email}</span>
                                    </div>
                                    <SheetTitle className="sr-only">Menu</SheetTitle>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                     <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                                        <span className="font-bold text-xs">MP</span>
                                    </div>
                                    <SheetTitle className="text-lg font-display font-bold">Menu</SheetTitle>
                                </div>
                            )}
                        </div>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
                         {navItems
                            .filter(item => {
                                // Dashboard & Test History — logged-in users only
                                if (item.name === "Dashboard" || item.name === "Test History") return !!user;
                                // About Us — logged-in users only (they see home as about page)
                                if (item.name === "About Us") return !!user;
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
                                                "px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3",
                                                isActive
                                                    ? "bg-slate-900 text-white shadow-sm"
                                                    : "text-slate-700 hover:bg-slate-100 active:bg-slate-200"
                                            )}
                                        >
                                            <Icon size={18} className={cn(isActive ? "text-white" : item.color)} />
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
                                className="px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 flex items-center gap-3"
                            >
                                <Send size={18} />
                                Join Telegram
                            </a>
                        </SheetClose>

                        <div className="pt-3">
                            {(user as any)?.is_subscribed && (user as any)?.plan_tier === 'pro' ? (
                                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
                                    <div className="relative z-10 flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                             <Crown size={14} className="text-yellow-400 fill-yellow-400" />
                                         </div>
                                         <div>
                                             <h4 className="font-bold text-white text-sm leading-tight">Pro Active</h4>
                                             <p className="text-[10px] text-slate-400 font-medium">All Features Unlocked</p>
                                         </div>
                                    </div>
                                </div>
                            ) : (user as any)?.is_subscribed && (user as any)?.plan_tier === 'lite' ? (
                                <>
                                    {/* Lite tag in mobile menu */}
                                    <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                                                <Crown size={14} className="text-pink-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">Lite Member</h4>
                                                <p className="text-[10px] text-slate-500">Limited Access</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Animated Upgrade button — red/pink spinning border */}
                                    <SheetClose asChild>
                                        <Link href="/upgrade" className="mt-2 block">
                                            <div className="relative p-[1.5px] rounded-xl overflow-hidden">
                                                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ec4899,#ef4444,#f59e0b,#8b5cf6,#3b82f6,#ec4899,#ef4444,#f59e0b,#ec4899)] animate-spin-slow" />
                                                <div className="relative px-4 py-3.5 rounded-xl text-sm font-bold flex items-center gap-3 bg-slate-900 text-white">
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
                                        className="px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 text-slate-700 hover:bg-amber-50 active:bg-amber-100"
                                    >
                                        <Sparkles size={18} className="text-amber-500" />
                                        Pricing
                                    </Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link
                                        href="/upgrade"
                                        className="px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-3 bg-slate-900 text-white shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                                    >
                                        <Crown size={18} className="text-yellow-400" />
                                        Become Premium Member
                                    </Link>
                                </SheetClose>
                                </>
                            )}
                        </div>

                        {/* Admin Controls — single link to admin panel (sidebar handles rest) */}
                        {(user as any)?.role === 'admin' && (
                            <div className="pt-4 border-t border-slate-100 mt-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-4">Admin</p>
                                <div className="space-y-1">
                                    <SheetClose asChild>
                                        <Link href="/admin/dashboard" className="px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-3">
                                            <LayoutDashboard size={18} /> Admin Dashboard
                                        </Link>
                                    </SheetClose>
                                </div>
                            </div>
                        )}

                        {/* Install App Button */}
                        {isInstallable && (
                            <div className="pt-4 border-t border-slate-100 mt-4">
                                <SheetClose asChild>
                                    <button
                                        onClick={installPwa}
                                        className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 flex items-center gap-3"
                                    >
                                        <Download size={18} />
                                        Install App
                                    </button>
                                </SheetClose>
                            </div>
                        )}

                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                         {user ? (
                             <SheetClose asChild>
                                 <Button 
                                     variant="ghost" 
                                     size="sm"
                                     className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full justify-start"
                                     onClick={handleLogout}
                                 >
                                     <LogOut size={16} className="mr-2" />
                                     Logout
                                 </Button>
                             </SheetClose>
                         ) : (
                             <SheetClose asChild>
                                 <Button asChild className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 w-full font-bold">
                                     <Link href="/login" prefetch={false}>Log in</Link>
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
