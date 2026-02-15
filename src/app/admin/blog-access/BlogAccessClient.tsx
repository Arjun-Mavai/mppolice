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
  const unitIds = Array.from(new Set(blogs.map((b) => b.unitId || 'no_unit'))).sort((a, b) => {
    if (a === 'no_unit') return 1;
    if (b === 'no_unit') return -1;
    const numA = parseInt(a.replace('unit_', ''));
    const numB = parseInt(b.replace('unit_', ''));
    return numA - numB;
  });

  // ── Filter by unit + search ─────────────────────────────────
  let filteredBlogs = blogs;
  if (activeUnit !== 'all') {
    filteredBlogs = filteredBlogs.filter((b) =>
      activeUnit === 'no_unit' ? !b.unitId : b.unitId === activeUnit
    );
  }
  if (searchQuery) {
    filteredBlogs = filteredBlogs.filter(
      (b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // ── Single toggle handler ───────────────────────────────────
  const handleToggle = async (
    blogId: string,
    field: 'isFreeAccess' | 'isLiteAccess' | 'isProAccess',
    value: boolean
  ) => {
    setBlogs((prev) => prev.map((b) => (b.id === blogId ? { ...b, [field]: value } : b)));

    startTransition(async () => {
      const result = await toggleBlogAccess(blogId, field, value);
      if (!result.success) {
        setBlogs((prev) => prev.map((b) => (b.id === blogId ? { ...b, [field]: !value } : b)));
        toast.error('Failed to update');
      } else {
        toast.success(`Updated: ${field} → ${value ? 'ON' : 'OFF'}`);
      }
    });
  };

  // ── Hidden toggle handler ───────────────────────────────────
  const handleToggleHidden = async (blogId: string, isHidden: boolean) => {
    setBlogs((prev) => prev.map((b) => (b.id === blogId ? { ...b, isHidden } : b)));

    startTransition(async () => {
      const result = await toggleBlogHidden(blogId, isHidden);
      if (!result.success) {
        setBlogs((prev) => prev.map((b) => (b.id === blogId ? { ...b, isHidden: !isHidden } : b)));
        toast.error('Failed to update');
      } else {
        toast.success(isHidden ? 'Blog hidden!' : 'Blog visible!');
      }
    });
  };

  // ── Bulk action — unit wise ─────────────────────────────────
  const handleBulk = async (
    field: 'isFreeAccess' | 'isLiteAccess' | 'isProAccess',
    value: boolean,
    unitId?: string
  ) => {
    const targetUnit = unitId || activeUnit;
    // Optimistic: update matching blogs
    setBlogs((prev) =>
      prev.map((b) => {
        if (targetUnit === 'all') return { ...b, [field]: value };
        if (targetUnit === 'no_unit' && !b.unitId) return { ...b, [field]: value };
        if (b.unitId === targetUnit) return { ...b, [field]: value };
        return b;
      })
    );

    startTransition(async () => {
      const result = await bulkUpdateBlogAccess(field, value, targetUnit);
      if (!result.success) {
        toast.error('Bulk update failed');
      } else {
        toast.success(
          `${targetUnit === 'all' ? 'All blogs' : targetUnit}: ${field} → ${value ? 'ON' : 'OFF'}`
        );
      }
    });
  };

  // ── Stats ───────────────────────────────────────────────────
  const stats = {
    total: filteredBlogs.length,
    free: filteredBlogs.filter((b) => b.isFreeAccess).length,
    lite: filteredBlogs.filter((b) => b.isLiteAccess).length,
    pro: filteredBlogs.filter((b) => b.isProAccess !== false).length,
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight md:text-2xl">
            <FileText className="h-5 w-5 text-indigo-600 md:h-6 md:w-6" />
            Blog Access Manager
          </h1>
          <p className="mt-1 text-xs text-slate-500 md:text-sm">
            Blog access control — Free/Lite/Pro flags toggle karo
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            Free: {stats.free}
          </Badge>
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
            Lite: {stats.lite}
          </Badge>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
            Pro: {stats.pro}
          </Badge>
        </div>
      </div>

      {/* ── Unit Tabs ──────────────────────────────────────── */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveUnit('all')}
          className={`rounded-full border px-3 py-2 text-xs font-bold whitespace-nowrap transition-all md:px-4 ${
            activeUnit === 'all'
              ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          All ({blogs.length})
        </button>
        {unitIds.map((unit) => {
          const count = blogs.filter((b) =>
            unit === 'no_unit' ? !b.unitId : b.unitId === unit
          ).length;
          return (
            <button
              key={unit}
              onClick={() => setActiveUnit(unit)}
              className={`rounded-full border px-3 py-2 text-xs font-bold whitespace-nowrap transition-all md:px-4 ${
                activeUnit === unit
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {unit === 'no_unit' ? 'General' : `U${unit.replace('unit_', '')}`} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Search ─────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by title, slug, category..."
          className="h-9 bg-white pl-9 text-sm md:h-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ── Bulk Actions ────────────────────────────────────── */}
      <Card className="border-dashed border-indigo-200 bg-indigo-50/30">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Zap className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 md:text-sm">
              Bulk
              {activeUnit !== 'all'
                ? ` (${activeUnit === 'no_unit' ? 'General' : activeUnit.replace('unit_', 'Unit ')})`
                : ''}
              :
            </span>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[10px] md:h-8 md:px-3 md:text-xs"
                onClick={() => handleBulk('isFreeAccess', true)}
              >
                Free ✅
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[10px] md:h-8 md:px-3 md:text-xs"
                onClick={() => handleBulk('isFreeAccess', false)}
              >
                Free ❌
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[10px] md:h-8 md:px-3 md:text-xs"
                onClick={() => handleBulk('isLiteAccess', true)}
              >
                Lite ✅
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[10px] md:h-8 md:px-3 md:text-xs"
                onClick={() => handleBulk('isLiteAccess', false)}
              >
                Lite ❌
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[10px] md:h-8 md:px-3 md:text-xs"
                onClick={() => handleBulk('isProAccess', true)}
              >
                Pro ✅
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[10px] md:h-8 md:px-3 md:text-xs"
                onClick={() => handleBulk('isProAccess', false)}
              >
                Pro ❌
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Blog List (ScrollArea) ─────────────────────────── */}
      <Card className="relative border-slate-200 shadow-sm">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/60">
            <Loader2 className="animate-spin text-indigo-600" />
          </div>
        )}
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
          <CardTitle className="text-sm font-semibold text-slate-700 md:text-base">
            {activeUnit === 'all'
              ? 'All Blogs'
              : activeUnit === 'no_unit'
                ? 'General Blogs'
                : `Unit ${activeUnit.replace('unit_', '')} Blogs`}
            <span className="ml-2 font-normal text-slate-400">({filteredBlogs.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh] md:h-[65vh]">
            <div className="divide-y divide-slate-100">
              {filteredBlogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No blogs found</div>
              ) : (
                filteredBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className={cn(
                      'p-3 transition-colors hover:bg-slate-50/50 md:p-4',
                      blog.isHidden && 'bg-red-50/30 opacity-60'
                    )}
                  >
                    {/* Blog Info */}
                    <div className="mb-2 flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5 shrink-0 text-[10px] capitalize">
                        {blog.unitId
                          ? `U${blog.unitId.replace('unit_', '')}`
                          : blog.category.replace(/_/g, ' ')}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-xs font-medium text-slate-900 md:truncate md:text-sm">
                          {blog.title}
                        </span>
                        <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500 md:text-xs">
                          /{blog.slug}
                        </p>
                        {blog.createdAt && (
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            ,{' '}
                            {new Date(blog.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                      {blog.isHidden && (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-red-200 bg-red-50 text-[10px] text-red-600"
                        >
                          <EyeOff className="mr-1 h-3 w-3" /> Hidden
                        </Badge>
                      )}
                    </div>

                    {/* Access Switches + Hidden */}
                    <div className="mt-2 ml-0 flex items-center gap-3 md:ml-16 md:gap-5">
                      <label className="flex cursor-pointer items-center gap-1.5">
                        <Switch
                          checked={!!blog.isHidden}
                          onCheckedChange={(v) => handleToggleHidden(blog.id, v)}
                          className="scale-90 data-[state=checked]:bg-red-500 md:scale-100"
                        />
                        <span
                          className={`text-[10px] font-bold md:text-xs ${blog.isHidden ? 'text-red-600' : 'text-slate-400'}`}
                        >
                          Hide
                        </span>
                      </label>

                      <div className="h-4 w-px bg-slate-200" />

                      <label className="flex cursor-pointer items-center gap-1.5">
                        <Switch
                          checked={!!blog.isFreeAccess}
                          onCheckedChange={(v) => handleToggle(blog.id, 'isFreeAccess', v)}
                          className="scale-90 md:scale-100"
                        />
                        <span
                          className={`text-[10px] font-bold md:text-xs ${blog.isFreeAccess ? 'text-emerald-600' : 'text-slate-400'}`}
                        >
                          Free
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-1.5">
                        <Switch
                          checked={!!blog.isLiteAccess}
                          onCheckedChange={(v) => handleToggle(blog.id, 'isLiteAccess', v)}
                          className="scale-90 md:scale-100"
                        />
                        <span
                          className={`text-[10px] font-bold md:text-xs ${blog.isLiteAccess ? 'text-blue-600' : 'text-slate-400'}`}
                        >
                          Lite
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-1.5">
                        <Switch
                          checked={blog.isProAccess !== false}
                          onCheckedChange={(v) => handleToggle(blog.id, 'isProAccess', v)}
                          className="scale-90 md:scale-100"
                        />
                        <span
                          className={`text-[10px] font-bold md:text-xs ${blog.isProAccess !== false ? 'text-amber-600' : 'text-slate-400'}`}
                        >
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
