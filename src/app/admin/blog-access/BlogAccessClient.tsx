'use client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎛️ BLOG ACCESS CLIENT — Admin se blog access flags toggle karo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Unit tabs se categorize → blog list → switches se toggle
// Bulk actions per unit — "Unit 1 ke sab free karo" type
// ScrollArea me wrap, mobile card layout
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Loader2, FileText, Zap, Search, EyeOff, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { toggleBlogAccess, bulkUpdateBlogAccess, toggleBlogHidden } from './actions';

interface BlogItem {
    id: string;
    slug: string;
    title: string;
    category: string;
    unitId: string | null;
    isPremium: boolean | null;
    isFreeAccess: boolean | null;
    isLiteAccess: boolean | null;
    isProAccess: boolean | null;
    isPublished: boolean | null;
    isHidden: boolean | null;
    createdAt: Date | null;
}

export default function BlogAccessClient({ blogs: initialBlogs }: { blogs: BlogItem[] }) {
    const [blogs, setBlogs] = useState(initialBlogs);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeUnit, setActiveUnit] = useState('all');
    const [isPending, startTransition] = useTransition();

    // ── Unit tabs — blogs ko unit wise group karo ───────────────
    const unitIds = Array.from(new Set(blogs.map(b => b.unitId || 'no_unit'))).sort((a, b) => {
        if (a === 'no_unit') return 1;
        if (b === 'no_unit') return -1;
        const numA = parseInt(a.replace('unit_', ''));
        const numB = parseInt(b.replace('unit_', ''));
        return numA - numB;
    });

    // ── Filter by unit + search ─────────────────────────────────
    let filteredBlogs = blogs;
    if (activeUnit !== 'all') {
        filteredBlogs = filteredBlogs.filter(b =>
            activeUnit === 'no_unit' ? !b.unitId : b.unitId === activeUnit
        );
    }
    if (searchQuery) {
        filteredBlogs = filteredBlogs.filter(b =>
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // ── Single toggle handler ───────────────────────────────────
    const handleToggle = async (blogId: string, field: 'isFreeAccess' | 'isLiteAccess' | 'isProAccess', value: boolean) => {
        setBlogs(prev => prev.map(b =>
            b.id === blogId ? { ...b, [field]: value } : b
        ));

        startTransition(async () => {
            const result = await toggleBlogAccess(blogId, field, value);
            if (!result.success) {
                setBlogs(prev => prev.map(b =>
                    b.id === blogId ? { ...b, [field]: !value } : b
                ));
                toast.error('Failed to update');
            } else {
                toast.success(`Updated: ${field} → ${value ? 'ON' : 'OFF'}`);
            }
        });
    };

    // ── Hidden toggle handler ───────────────────────────────────
    const handleToggleHidden = async (blogId: string, isHidden: boolean) => {
        setBlogs(prev => prev.map(b =>
            b.id === blogId ? { ...b, isHidden } : b
        ));

        startTransition(async () => {
            const result = await toggleBlogHidden(blogId, isHidden);
            if (!result.success) {
                setBlogs(prev => prev.map(b =>
                    b.id === blogId ? { ...b, isHidden: !isHidden } : b
                ));
                toast.error('Failed to update');
            } else {
                toast.success(isHidden ? 'Blog hidden!' : 'Blog visible!');
            }
        });
    };

    // ── Bulk action — unit wise ─────────────────────────────────
    const handleBulk = async (field: 'isFreeAccess' | 'isLiteAccess' | 'isProAccess', value: boolean, unitId?: string) => {
        const targetUnit = unitId || activeUnit;
        // Optimistic: update matching blogs
        setBlogs(prev => prev.map(b => {
            if (targetUnit === 'all') return { ...b, [field]: value };
            if (targetUnit === 'no_unit' && !b.unitId) return { ...b, [field]: value };
            if (b.unitId === targetUnit) return { ...b, [field]: value };
            return b;
        }));

        startTransition(async () => {
            const result = await bulkUpdateBlogAccess(field, value, targetUnit);
            if (!result.success) {
                toast.error('Bulk update failed');
            } else {
                toast.success(`${targetUnit === 'all' ? 'All blogs' : targetUnit}: ${field} → ${value ? 'ON' : 'OFF'}`);
            }
        });
    };

    // ── Stats ───────────────────────────────────────────────────
    const stats = {
        total: filteredBlogs.length,
        free: filteredBlogs.filter(b => b.isFreeAccess).length,
        lite: filteredBlogs.filter(b => b.isLiteAccess).length,
        pro: filteredBlogs.filter(b => b.isProAccess !== false).length,
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FileText className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                        Blog Access Manager
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">
                        Blog access control — Free/Lite/Pro flags toggle karo
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Free: {stats.free}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Lite: {stats.lite}
                    </Badge>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Pro: {stats.pro}
                    </Badge>
                </div>
            </div>

            {/* ── Unit Tabs ──────────────────────────────────────── */}
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                <button
                    onClick={() => setActiveUnit('all')}
                    className={`px-3 md:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                        activeUnit === 'all'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    All ({blogs.length})
                </button>
                {unitIds.map(unit => {
                    const count = blogs.filter(b => unit === 'no_unit' ? !b.unitId : b.unitId === unit).length;
                    return (
                        <button
                            key={unit}
                            onClick={() => setActiveUnit(unit)}
                            className={`px-3 md:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                                activeUnit === unit
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            {unit === 'no_unit' ? 'General' : `U${unit.replace('unit_', '')}`} ({count})
                        </button>
                    );
                })}
            </div>

            {/* ── Search ─────────────────────────────────────────── */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search by title, slug, category..."
                    className="pl-9 bg-white h-9 md:h-10 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* ── Bulk Actions ────────────────────────────────────── */}
            <Card className="border-dashed border-indigo-200 bg-indigo-50/30">
                <CardContent className="p-3 md:p-4">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <Zap className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs md:text-sm font-bold text-indigo-700">
                            Bulk{activeUnit !== 'all' ? ` (${activeUnit === 'no_unit' ? 'General' : activeUnit.replace('unit_', 'Unit ')})` : ''}:
                        </span>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                            <Button size="sm" variant="outline" className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                                onClick={() => handleBulk('isFreeAccess', true)}>
                                Free ✅
                            </Button>
                            <Button size="sm" variant="outline" className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                                onClick={() => handleBulk('isFreeAccess', false)}>
                                Free ❌
                            </Button>
                            <Button size="sm" variant="outline" className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                                onClick={() => handleBulk('isLiteAccess', true)}>
                                Lite ✅
                            </Button>
                            <Button size="sm" variant="outline" className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                                onClick={() => handleBulk('isLiteAccess', false)}>
                                Lite ❌
                            </Button>
                            <Button size="sm" variant="outline" className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                                onClick={() => handleBulk('isProAccess', true)}>
                                Pro ✅
                            </Button>
                            <Button size="sm" variant="outline" className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                                onClick={() => handleBulk('isProAccess', false)}>
                                Pro ❌
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Blog List (ScrollArea) ─────────────────────────── */}
            <Card className="border-slate-200 shadow-sm relative">
                {isPending && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-lg">
                        <Loader2 className="animate-spin text-indigo-600" />
                    </div>
                )}
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
                    <CardTitle className="text-sm md:text-base font-semibold text-slate-700">
                        {activeUnit === 'all' ? 'All Blogs' : activeUnit === 'no_unit' ? 'General Blogs' : `Unit ${activeUnit.replace('unit_', '')} Blogs`}
                        <span className="text-slate-400 font-normal ml-2">({filteredBlogs.length})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[60vh] md:h-[65vh]">
                        <div className="divide-y divide-slate-100">
                            {filteredBlogs.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">No blogs found</div>
                            ) : (
                                filteredBlogs.map((blog) => (
                                    <div key={blog.id} className={cn(
                                        "p-3 md:p-4 hover:bg-slate-50/50 transition-colors",
                                        blog.isHidden && "opacity-60 bg-red-50/30"
                                    )}>
                                        {/* Blog Info */}
                                        <div className="flex items-start gap-2 mb-2">
                                            <Badge variant="outline" className="text-[10px] shrink-0 capitalize mt-0.5">
                                                {blog.unitId ? `U${blog.unitId.replace('unit_', '')}` : blog.category.replace(/_/g, ' ')}
                                            </Badge>
                                            <div className="min-w-0 flex-1">
                                                <span className="text-xs md:text-sm font-medium text-slate-900 line-clamp-2 md:truncate block">
                                                    {blog.title}
                                                </span>
                                                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 font-mono truncate">
                                                    /{blog.slug}
                                                </p>
                                                {blog.createdAt && (
                                                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(blog.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(blog.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                )}
                                            </div>
                                            {blog.isHidden && (
                                                <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 bg-red-50 shrink-0">
                                                    <EyeOff className="w-3 h-3 mr-1" /> Hidden
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Access Switches + Hidden */}
                                        <div className="flex items-center gap-3 md:gap-5 mt-2 ml-0 md:ml-16">
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <Switch
                                                    checked={!!blog.isHidden}
                                                    onCheckedChange={(v) => handleToggleHidden(blog.id, v)}
                                                    className="scale-90 md:scale-100 data-[state=checked]:bg-red-500"
                                                />
                                                <span className={`text-[10px] md:text-xs font-bold ${blog.isHidden ? 'text-red-600' : 'text-slate-400'}`}>
                                                    Hide
                                                </span>
                                            </label>

                                            <div className="w-px h-4 bg-slate-200" />

                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <Switch
                                                    checked={!!blog.isFreeAccess}
                                                    onCheckedChange={(v) => handleToggle(blog.id, 'isFreeAccess', v)}
                                                    className="scale-90 md:scale-100"
                                                />
                                                <span className={`text-[10px] md:text-xs font-bold ${blog.isFreeAccess ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    Free
                                                </span>
                                            </label>

                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <Switch
                                                    checked={!!blog.isLiteAccess}
                                                    onCheckedChange={(v) => handleToggle(blog.id, 'isLiteAccess', v)}
                                                    className="scale-90 md:scale-100"
                                                />
                                                <span className={`text-[10px] md:text-xs font-bold ${blog.isLiteAccess ? 'text-blue-600' : 'text-slate-400'}`}>
                                                    Lite
                                                </span>
                                            </label>

                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <Switch
                                                    checked={blog.isProAccess !== false}
                                                    onCheckedChange={(v) => handleToggle(blog.id, 'isProAccess', v)}
                                                    className="scale-90 md:scale-100"
                                                />
                                                <span className={`text-[10px] md:text-xs font-bold ${blog.isProAccess !== false ? 'text-amber-600' : 'text-slate-400'}`}>
                                                    Pro
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
