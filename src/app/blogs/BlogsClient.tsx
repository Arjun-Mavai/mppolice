'use client';

// 1. External Imports
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Search, BookOpen, Sparkles, Crown } from 'lucide-react';

// 2. Internal Imports (Components)
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogSkeleton } from '@/components/skeletons/BlogSkeleton';
import { BlogCard } from '@/components/blog/BlogCard';
import { SearchInput } from '@/components/blog/SearchInput';

// 3. Internal Imports (Utils/Stores/Actions)
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { canAccessBlog } from '@/lib/access-control';
import { getBlogs } from '@/actions/blog-actions';
import type { mppscUsers, contentBlogs } from '@/db/schema';

// Type Definitions derived from Drizzle Schema
type User = typeof mppscUsers.$inferSelect;
type Blog = typeof contentBlogs.$inferSelect;

interface BlogsClientProps {
  initialBlogs: Blog[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  initialCounts: {
    units: Record<string, number>;
    categories: Record<string, number>;
  };
  user: User | null;
}

/**
 * BlogsClient — Main client component for the Blogs page.
 * Handles:
 * - Infinite scrolling (Load More)
 * - Filtering by Unit/Category/Free
 * - Search with debouncing
 * - Access control & locking UI
 */
export default function BlogsClient({
  initialBlogs,
  initialPagination,
  initialCounts,
  user,
}: BlogsClientProps) {
  // ------------------------------------------------------------------
  // 🪝 HOOKS (Strict Order: Store -> Router -> State -> Effects -> Query)
  // ------------------------------------------------------------------

  // 1. Store Hooks
  const { user: storeUser, authCheckStatus } = useSettingsStore();

  // 2. Router Hooks
  // const router = useRouter();

  // 3. State Hooks
  const [activeUnit, setActiveUnit] = useState<string>('Free');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // 4. Effect Hooks (Debounce Search)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 5. Query Hooks (Data Fetching)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isBlogsLoading,
  } = useInfiniteQuery({
    queryKey: ['blogs', activeUnit, activeCategory, debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      return await getBlogs({
        page: pageParam as number,
        limit: 10,
        unitId: activeUnit === 'Free' || activeUnit === 'General' ? 'All' : activeUnit,
        category: activeUnit === 'General' ? activeCategory : 'All',
        search: debouncedSearch,
        // STRICT FILTERING: If tab is 'Free', explicitly request only isFreeAccess=true
        isFreeAccess: activeUnit === 'Free' ? true : undefined,
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    // Hydrate initial data ONLY if it matches the default 'Free' tab state
    initialData:
      activeUnit === 'Free' && activeCategory === 'All' && !debouncedSearch
        ? {
            pages: [{ blogs: initialBlogs, pagination: initialPagination }],
            pageParams: [1],
          }
        : undefined,
    // ⚡ PERFORMANCE: Cache for 5 minutes prevents "White Screen" on back navigation
    staleTime: 5 * 60 * 1000,
  });

  // ------------------------------------------------------------------
  // 🧠 DERIVED STATE & CONSTANTS
  // ------------------------------------------------------------------

  // User resolution: Server prop > Store fallback
  // Both sources use camelCase (Drizzle Schema & Zustand Store)
  const effectiveUser = user || (storeUser as unknown as User);
  const currentUser = effectiveUser;
  const isGuest = !currentUser?.isSubscribed;

  // Flatten infinite query pages
  const blogs = data?.pages.flatMap((page) => page.blogs) || [];
  const hasMore = hasNextPage;

  // Strict Loading Sync: Wait for auth check if no server user is present
  const isAuthLoading = !user && (authCheckStatus === 'idle' || authCheckStatus === 'loading');

  // Tab Definitions
  const tabs = isGuest
    ? ['Free', 'General', 'All', ...Array.from({ length: 10 }, (_, i) => `unit_${i + 1}`)]
    : ['General', 'All', ...Array.from({ length: 10 }, (_, i) => `unit_${i + 1}`)];

  const subjects = [
    { id: 'All', label: 'All Subjects' },
    { id: 'general', label: 'General / Exam Info' },
    { id: 'history', label: 'History' },
    { id: 'geography', label: 'Geography' },
    { id: 'polity', label: 'Polity' },
    { id: 'economy', label: 'Economy' },
    { id: 'science_tech', label: 'Science & Tech' },
    { id: 'tribal_culture', label: 'Tribal Culture' },
    { id: 'mp_general', label: 'MP General' },
    { id: 'current_affairs', label: 'Current Affairs' },
  ];

  // ------------------------------------------------------------------
  // 🧨 EVENT HANDLERS
  // ------------------------------------------------------------------
  const handleUnitChange = (unit: string) => setActiveUnit(unit);
  const handleLoadMore = () => fetchNextPage();

  // ------------------------------------------------------------------
  // 💀 SKELETON / LOADING UI
  // ------------------------------------------------------------------
  if (isAuthLoading || (isBlogsLoading && !data)) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header Skeleton */}
        <div className="sticky top-16 z-30 border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg md:w-96" />
            </div>
            <div className="mt-6 flex gap-2 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 md:px-8 lg:grid-cols-4">
          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-44">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
          <div className="space-y-6 lg:col-span-3">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <BlogSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 🎨 MAIN RENDER
  // ------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            {/* Logo/Back + Mobile Nav */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2 text-slate-500 md:hidden"
                asChild
              >
                <Link href="/">
                  <ArrowLeft size={20} />
                </Link>
              </Button>
              <div>
                <h1 className="font-display text-2xl font-black tracking-tight text-slate-900">
                  MPPSC Knowledge
                </h1>
                <p className="text-xs font-medium text-slate-500">
                  Exam-focused articles & strategies
                </p>
              </div>
            </div>

            {/* Desktop Search */}
            <div className="w-full md:w-96">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                className="border-slate-200 bg-slate-50 transition-all focus:bg-white"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="no-scrollbar -mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pt-2 pb-2 md:mx-0 md:px-0">
            {tabs.map((tab) => {
              const count =
                tab === 'General'
                  ? initialCounts.categories['general'] || 0
                  : initialCounts.units[tab] || 0;
              const isActive = activeUnit === tab;
              const isFreeTab = tab === 'Free';

              return (
                <button
                  key={tab}
                  onClick={() => handleUnitChange(tab)}
                  className={cn(
                    'group flex snap-start items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold whitespace-nowrap transition-all',
                    isFreeTab && isActive
                      ? 'scale-105 border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                      : isFreeTab && !isActive
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : isActive
                          ? 'scale-105 border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <span>
                    {tab === 'All'
                      ? 'All Units'
                      : tab === 'Free'
                        ? '🎁 Free'
                        : tab === 'General'
                          ? '📚 Subjects'
                          : `Unit ${tab.split('_')[1]}`}
                  </span>
                  {count > 0 && (
                    <span
                      className={cn(
                        'flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-black transition-colors',
                        isActive
                          ? 'bg-white text-slate-900'
                          : 'bg-emerald-500 text-white group-hover:bg-emerald-600'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub-Category Tabs (Only for General) */}
          {activeUnit === 'General' && (
            <div className="animate-in fade-in slide-in-from-top-2 no-scrollbar -mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
              {subjects.map((subject) => {
                const count =
                  subject.id === 'All'
                    ? Object.values(initialCounts.categories || {}).reduce(
                        (sum, value) => (typeof value === 'number' ? sum + value : sum),
                        0
                      )
                    : initialCounts.categories[subject.id] || 0;
                const isActive = activeCategory === subject.id;
                return (
                  <button
                    key={subject.id}
                    onClick={() => setActiveCategory(subject.id)}
                    className={cn(
                      'group flex snap-start items-center gap-2 rounded-lg border px-4 py-2 text-[11px] font-black tracking-tight whitespace-nowrap transition-all',
                      isActive
                        ? 'border-slate-900 bg-slate-100 text-slate-900'
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    )}
                  >
                    <span>{subject.label}</span>
                    {count > 0 && (
                      <span
                        className={cn(
                          'flex h-4 min-w-[1rem] items-center justify-center rounded-md px-1 text-[9px]',
                          isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Breadcrumbs */}
          {activeUnit !== 'All' && activeUnit !== 'General' && activeUnit !== 'Free' && (
            <div className="animate-in fade-in slide-in-from-top-1 mt-3 flex items-center gap-2 text-sm text-slate-600">
              <span className="font-bold text-slate-800">Unit {activeUnit.split('_')[1]}</span>
            </div>
          )}
          {activeUnit === 'General' && activeCategory !== 'All' && (
            <div className="animate-in fade-in slide-in-from-top-1 mt-3 flex items-center gap-2 text-sm text-slate-600">
              <span className="font-bold text-slate-800">
                {subjects.find((s) => s.id === activeCategory)?.label}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 md:px-8 lg:grid-cols-4">
        {/* Sidebar (Desktop Only) — clean dark style */}
        <div className="hidden space-y-6 lg:col-span-1 lg:block">
          <div className="sticky top-44 space-y-6">
            <div className="group relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-2xl shadow-indigo-500/10">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl transition-all duration-700 group-hover:bg-indigo-500/30" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl transition-all duration-700 group-hover:bg-pink-500/30" />

              <div className="relative z-10 mb-6 flex items-center justify-between">
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-md">
                  <BookOpen size={24} className="text-white" />
                </div>
                {/* Pro Badge */}
                {currentUser?.isSubscribed && (
                  <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                    <Crown size={10} className="fill-amber-300" /> Pro Active
                  </span>
                )}
              </div>

              <h3 className="font-display relative z-10 mb-2 text-xl font-bold tracking-tight">
                Ace MPPSC 2026
              </h3>

              {currentUser?.isSubscribed ? (
                <>
                  <p className="relative z-10 mb-6 text-sm leading-relaxed text-slate-300">
                    Premium access active! Master your preparation with full mock tests & exclusive
                    content.
                  </p>
                  {/* Premium Button */}
                  <div className="relative overflow-hidden rounded-xl p-[1.5px]">
                    <div className="animate-spin-slow absolute inset-0 bg-[conic-gradient(from_0deg,#10b981,#34d399,#059669,#10b981)]" />
                    <Link
                      href="/syllabus/quiz/pyq"
                      className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800"
                    >
                      <Sparkles size={16} className="text-emerald-400" />
                      Start Practicing
                    </Link>
                  </div>
                </>
              ) : currentUser?.planTier === 'lite' ? (
                <>
                  <p className="relative z-10 mb-6 text-sm leading-relaxed text-slate-300">
                    Upgrade to <span className="font-bold text-white">Pro</span> for unlimited Full
                    Mock Tests & Analytics.
                  </p>
                  {/* Premium Button */}
                  <div className="relative overflow-hidden rounded-xl p-[1.5px] shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] hover:shadow-purple-500/40">
                    <div className="animate-spin-slow absolute inset-0 bg-[conic-gradient(from_0deg,#d946ef,#f43f5e,#fbbf24,#8b5cf6,#3b82f6,#d946ef)]" />
                    <Link
                      href="/upgrade"
                      className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-900/90"
                    >
                      <Sparkles size={16} className="text-purple-400" />
                      Upgrade to Pro
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="relative z-10 mb-6 text-sm leading-relaxed text-slate-300">
                    Unlock premium mock tests, detailed analytics, and exclusive content.
                  </p>
                  {/* Premium Button */}
                  <div className="relative overflow-hidden rounded-xl p-[1.5px] shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40">
                    <div className="animate-spin-slow absolute inset-0 bg-[conic-gradient(from_0deg,#d946ef,#f43f5e,#fbbf24,#8b5cf6,#3b82f6,#d946ef)]" />
                    <Link
                      href="/upgrade"
                      className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-900/90"
                    >
                      <Sparkles size={16} className="fill-white/20 text-yellow-400" />
                      Get Premium Access
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6 lg:col-span-3">
          {/* Blog Grid */}
          <div className="animate-in fade-in grid grid-cols-1 gap-6 md:grid-cols-2">
            {(() => {
              // 1. Loading State (and no pre-fetched data)
              if (isBlogsLoading && !data) {
                return (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <BlogSkeleton key={i} />
                    ))}
                  </>
                );
              }

              // 2. Empty State
              if (blogs.length === 0) {
                return (
                  <div className="col-span-2 flex flex-col items-center gap-4 py-20 text-center text-slate-400">
                    <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                      <Search className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-600">
                      {activeUnit === 'Free' ? 'No free articles yet' : 'No content found'}
                    </h3>
                    <p className="mx-auto max-w-xs">
                      {activeUnit === 'Free' ? (
                        'Free articles will appear here soon.'
                      ) : (
                        <>
                          No articles found for{' '}
                          <span className="font-bold text-slate-800">
                            {activeUnit === 'All' ? 'any unit' : `Unit ${activeUnit.split('_')[1]}`}
                          </span>
                          {searchQuery && <span> matching &quot;{searchQuery}&quot;</span>}.
                        </>
                      )}
                    </p>
                    {(activeUnit !== 'All' || searchQuery) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActiveUnit('All');
                          setSearchQuery('');
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                );
              }

              // 3. Render Blogs
              return blogs.map((blog: Blog, i: number) => {
                const hasAccess = canAccessBlog(
                  {
                    isFreeAccess: blog.isFreeAccess,
                    isLiteAccess: blog.isLiteAccess,
                    isProAccess: blog.isProAccess,
                  },
                  currentUser
                );

                // Note: If a blog is in the 'Free' tab, logic dictates it must be free.
                // We enforce this access=true visually for free blogs.
                const isLocked = blog.isFreeAccess ? false : !hasAccess;

                return <BlogCard key={blog.id} blog={blog} index={i} isLocked={isLocked} />;
              });
            })()}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-8 pb-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
                className="min-w-[160px] rounded-full font-bold text-slate-600 hover:border-slate-400 hover:text-slate-900"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Articles'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
