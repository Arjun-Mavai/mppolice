
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
  Upload
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
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

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
  
  // Create a merged user object (prop + global), favoring global if updated
  // Actually, usually global store should be source of truth if we set it on mount in layout
  const user = globalUser || initialUser;

  // ------------------------------------------------------------------
  // EFFECT 1: SCROLL LISTENER (The "Visuals")
  // ------------------------------------------------------------------
  // Why: Toggles the background style of the navbar when the user scrolls down.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    // Add listener on mount
    window.addEventListener("scroll", handleScroll);
    
    // Cleanup on unmount to prevent memory leaks
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            });
    }
  }, [initialUser, globalUser, setUser, authCheckStatus, setAuthCheckStatus]);

  const handleLogout = async () => {
      try {
        // Clear Client Store FIRST to update UI immediately
        setUser(null, false);
        
        const response = await fetch('/api/auth/mppsc-logout', { method: 'POST' });
        
        if (response.ok) {
          // Redirect to login without callback to prevent auto-redirect loop
          router.push('/login');
          // Force a hard refresh to clear any cached state
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      } catch (error) {
        logger.error('Logout failed:', error);
        // Even if API fails, redirect to login
        window.location.href = '/login';
      }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Syllabus", href: "/syllabus", icon: BookOpen },
    { name: "Test Series", href: "/syllabus/quiz", icon: GraduationCap },
    { name: "Blogs", href: "/blogs", icon: BookOpen },
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
          {/* Logo */}
          <div 
            onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                router.push('/');
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20 transition-transform group-hover:scale-105">
                 <span className="font-bold text-xs tracking-tighter">MP</span>
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg font-display text-slate-900 leading-none">MPPSC<span className="text-indigo-600">26</span></span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Mindful Prep</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50 backdrop-blur-md">
            {navItems
              .filter(item => {
                // Hide Dashboard if user is not logged in
                if (item.name === "Dashboard") {
                  return !!user;
                }
                return true;
              })
              .map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    isActive
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  )}
                >
                  <Icon size={16} className={cn(isActive && "fill-indigo-600/10")} />
                  {item.name}
                </Link>
              );
            })}
                  {(user && user.is_subscribed) ? (
                    <div className="px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-slate-700 shadow-lg cursor-default relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,25%,rgba(255,255,255,0.1),50%,transparent)] bg-[length:250%_100%] animate-shimmer" />
                        <Sparkles size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="tracking-wide uppercase text-[10px] relative z-10 font-black">Premium</span>
                    </div>
                  ) : user ? (
                    <Link
                        href="/upgrade"
                        className={cn(
                        "px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-md hover:scale-105",
                        )}
                    >
                        <Sparkles size={14} className="fill-white/20" />
                        Upgrade
                    </Link>
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

            {user ? (
               <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-slate-100 hover:ring-indigo-100 transition-all p-0 hidden md:flex">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={(user as any)?.image || ""} alt={user.name || "User"} />
                      <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/app/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  
                  {(user && user.role === 'admin') && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Admin</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/admin/upload')}>
                            <Upload className="mr-2 h-4 w-4" />
                            <span>Upload Content</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/admin/upload-syllabus')}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>Upload Syllabus</span>
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
                        <Link href="/login">Log in</Link>
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
                            {user ? (
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
                    
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
                         {navItems
                            .filter(item => {
                                // Hide Dashboard if user is not logged in
                                if (item.name === "Dashboard") {
                                    return !!user;
                                }
                                return true;
                            })
                            .map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3",
                                        isActive
                                        ? "bg-slate-100 text-indigo-600"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                    >
                                    <Icon size={18} />
                                    {item.name}
                                    </Link>
                                );
                            })}
                        
                        <a
                            href="https://t.me/MPPSC2026_Mission"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 flex items-center gap-3"
                        >
                            <Send size={18} />
                            Join Telegram Mission
                        </a>

                        {!(user as any)?.is_subscribed ? (
                            <Link
                                href="/upgrade"
                                className="px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-3 bg-slate-900 text-white mt-4 shadow-lg shadow-slate-900/20"
                            >
                                <Crown size={18} className="text-yellow-400" />
                                Become Premium Member
                            </Link>
                        ) : (
                             <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group">
                                <div className="relative z-10 flex items-center gap-3 mb-2">
                                     <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shadow-sm">
                                         <Crown size={14} className="text-yellow-400 fill-yellow-400" />
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-white text-sm leading-tight">Premium Active</h4>
                                         <p className="text-[10px] text-slate-400 font-medium">All Features Unlocked</p>
                                     </div>
                                </div>
                            </div>
                        )}

                        {/* Admin Mobile Menu - Explicitly for Admin Role */}
                        {(user as any)?.role === 'admin' && (
                            <div className="pt-4 border-t border-slate-100 mt-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Controls</p>
                                <div className="space-y-1">
                                    <Link
                                        href="/admin/dashboard"
                                        className="px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-3"
                                        onClick={() => document.body.click()}
                                    >
                                        <LayoutDashboard size={18} />
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/admin/upload"
                                        className="px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-3"
                                        onClick={() => document.body.click()}
                                    >
                                        <Upload size={18} />
                                        Upload Center
                                    </Link>
                                    <Link
                                        href="/admin/upload-syllabus"
                                        className="px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-3"
                                        onClick={() => document.body.click()}
                                    >
                                        <BookOpen size={18} />
                                        Syllabus Manager
                                    </Link>
                                    {/* Admin-only Signup Access (if manual route needed, though we disabled the page redirect) 
                                        Since we redirected /signup to /login, this link would also just go to login. 
                                        If admin needs to create user, they should use DB as per guide. 
                                        But if we wanted a UI, we'd need a separate admin-only creation page. 
                                        For now, user asked to see the button, but the page is redirected.
                                        I will remove the specific "Sign up" button for clean UI as per first interpretation, 
                                        but if "admin user ko signup ka button dikhe" means they need a way to create users UI, 
                                        that contradicts "endpoint only admin...". 
                                        Let's stick to the Guide for creation and hide the button for public. 
                                    */}
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                         {user ? (
                             <div className="flex items-center gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Logout
                                </Button>
                             </div>
                         ) : (
                             <div className="grid grid-cols-2 gap-3">
                                 <Button variant="outline" asChild className="rounded-xl">
                                     <Link href="/login">Log in</Link>
                                 </Button>
                                 {/* Only show Sign up if we decide to allow it later or for admins finding a backdoor, 
                                     but effectively disabling it for regular users as per request. 
                                     However, the prompt says "endpoint only admin user ke liye open hoga... mobile me signup ka button h use hata do".
                                     So we remove it entirely for guest users. */}
                                 {/* <Button asChild className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                                     <Link href="/signup">Sign up</Link>
                                 </Button> */}
                             </div>
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
