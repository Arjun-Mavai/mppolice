'use client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏢 ADMIN LAYOUT — Sidebar + Content Area
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Mobile-first: hamburger menu → slide-out sidebar
// Desktop: fixed sidebar left + content right
// Sidebar links: sab admin routes ek jagah
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, Shield, BookOpen, FileText, Upload, 
    Brain, HelpCircle, Menu, X, ChevronLeft, UserPlus, KeyRound,
    Users, IndianRupee, CreditCard
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ── Admin routes — sidebar me ye dikhenge ───────────────────
const ADMIN_ROUTES = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & stats' },
    { href: '/admin/test-access', label: 'Test Access', icon: Shield, description: 'FLT/PYQ/CSAT access flags' },
    { href: '/admin/topic-access', label: 'Topic Access', icon: BookOpen, description: 'Syllabus topic access flags' },
    { href: '/admin/blog-access', label: 'Blog Access', icon: FileText, description: 'Blog tier access flags' },
    { href: '/admin/blogs', label: 'Blog Management', icon: FileText, description: 'Create, edit, delete blogs' },
    { href: '/admin/content-manager', label: 'Content Upload', icon: Upload, description: 'Upload test content' },
    { href: '/admin/syllabus-upload', label: 'Syllabus Upload', icon: BookOpen, description: 'Upload syllabus data' },
    { href: '/admin/syllabus-enrichment', label: 'AI Enrichment', icon: Brain, description: 'Enrich topics with AI' },
    { href: '/admin/bulk-question-upload', label: 'Bulk Questions', icon: HelpCircle, description: 'Bulk upload questions' },
    { href: '/admin/create-user', label: 'Create User', icon: UserPlus, description: 'Admin signup — new user banao' },
    { href: '/admin/users', label: 'User Manager', icon: Users, description: 'Users, extend access, upgrade tier' },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard, description: 'Revenue analytics & orders' },
    { href: '/admin/pricing', label: 'Pricing', icon: IndianRupee, description: 'Update prices — no deploy needed' },
    { href: '/admin/reset-password', label: 'Reset Password', icon: KeyRound, description: 'Direct password reset' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ── Mobile Header ────────────────────────────────── */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                    <Menu className="w-5 h-5" />
                </Button>
                <Link href="/admin/dashboard" className="font-bold text-slate-900 text-sm">
                    Admin Panel
                </Link>
                <div className="ml-auto">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/" className="text-xs text-slate-500">
                            <ChevronLeft className="w-3 h-3 mr-1" /> Back to Site
                        </Link>
                    </Button>
                </div>
            </div>

            {/* ── Mobile Sidebar Overlay ───────────────────────── */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                        onClick={() => setSidebarOpen(false)} 
                    />
                    {/* Sidebar panel */}
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                        <SidebarContent pathname={pathname} onClose={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* ── Desktop Layout: Sidebar + Content ────────────── */}
            <div className="flex">
                {/* Desktop Sidebar — fixed left */}
                <div className="hidden lg:block w-64 shrink-0">
                    <div className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 overflow-y-auto">
                        <SidebarContent pathname={pathname} />
                    </div>
                </div>

                {/* Content Area */}
                <main className="flex-1 min-h-screen pt-14 lg:pt-0">
                    {children}
                </main>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 SIDEBAR CONTENT — Reusable for mobile + desktop
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
    return (
        <div className="flex flex-col h-full">
            {/* ── Logo/Header ─────────────────────────────────── */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={onClose}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm text-slate-900">Admin Panel</h2>
                        <p className="text-[10px] text-slate-500">MPPSC 2026</p>
                    </div>
                </Link>
                {/* Close button (mobile only) */}
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* ── Navigation Links ─────────────────────────────── */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {ADMIN_ROUTES.map((route) => {
                    const isActive = pathname === route.href;
                    const Icon = route.icon;
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                            <div className="min-w-0">
                                <div className="truncate">{route.label}</div>
                                <div className={cn("text-[10px] truncate", isActive ? "text-indigo-500" : "text-slate-400")}>
                                    {route.description}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* ── Footer ──────────────────────────────────────── */}
            <div className="p-4 border-t border-slate-100">
                <Link 
                    href="/"
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Site
                </Link>
            </div>
        </div>
    );
}
