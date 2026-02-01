
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
  Crown
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

interface AppNavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function AppNavbar({ user: initialUser }: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = React.useState(false);
  
  // Use Global Store
  const { language, setLanguage, user: globalUser } = useSettingsStore();
  
  // Create a merged user object (prop + global), favoring global if updated
  // Actually, usually global store should be source of truth if we set it on mount in layout
  const user = globalUser || initialUser;

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
      } catch (error) {
        console.error('Logout failed:', error);
      }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Syllabus", href: "/syllabus", icon: BookOpen },
    { name: "Test Series", href: "/syllabus/quiz", icon: GraduationCap },
    { name: "Analytics", href: "/syllabus/analytics", icon: BarChart2 },
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
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20 transition-transform group-hover:scale-105">
                 <span className="font-bold text-xs tracking-tighter">MP</span>
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg font-display text-slate-900 leading-none">MPPSC<span className="text-indigo-600">26</span></span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Mindful Prep</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50 backdrop-blur-md">
            {navItems.map((item) => {
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
                  {(user as any)?.is_pro ? (
                    <div className="px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-100 text-amber-900 border border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)] cursor-default relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,25%,rgba(255,255,255,0.7),50%,transparent)] bg-[length:250%_100%] animate-shimmer" />
                        <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-sm relative z-10">
                            <Crown size={12} className="text-white fill-white" />
                        </div>
                        <span className="tracking-wide uppercase text-[10px] relative z-10 font-black text-amber-950">Royal Member</span>
                    </div>
                  ) : (
                    <Link
                        href="/#pricing"
                        onClick={(e) => {
                            if (pathname === '/' || pathname === '/upgrade') {
                                e.preventDefault();
                                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className={cn(
                        "px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-md hover:scale-105",
                        )}
                    >
                        <Sparkles size={14} className="fill-white/20" />
                        Upgrade
                    </Link>
                  )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
             {/* Language Toggle - Visible on Mobile too as per request */}
             <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
                <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold transition-all",
                        language === 'en' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    English
                </button>
                <button
                    onClick={() => setLanguage('hi')}
                    className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold transition-all",
                        language === 'hi' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    हिंदी
                </button>
             </div>

             <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

            {user ? (
               <DropdownMenu>
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
                  {/* <DropdownMenuItem onClick={() => router.push('/settings')}>
                     <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem> */}
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
                         {navItems.map((item) => {
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

                        {!(user as any)?.is_pro ? (
                            <Link
                                href="/upgrade"
                                className="px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 mt-4"
                            >
                                <Sparkles size={18} />
                                Upgrade Plan
                            </Link>
                        ) : (
                             <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-yellow-200/40 to-transparent rounded-full -mr-8 -mt-8 opacity-50" />
                                <div className="relative z-10 flex items-center gap-3 mb-2">
                                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-sm">
                                         <Crown size={14} className="text-white fill-white" />
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-amber-950 text-sm leading-tight">Royal Member</h4>
                                         <p className="text-[10px] text-amber-700 font-medium">Top Tier Access Active</p>
                                     </div>
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
                                 <Button asChild className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                                     <Link href="/signup">Sign up</Link>
                                 </Button>
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
