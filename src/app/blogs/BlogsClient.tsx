'use client';
import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { BlogCard } from '@/components/blog/BlogCard';
import { SearchInput } from '@/components/blog/SearchInput';
import { useSettingsStore } from '@/store/useSettingsStore';
import { canAccessBlog } from '@/lib/access-control';
import { getBlogs } from '@/actions/blog-actions';
import { redirect } from 'next/navigation';

interface BlogsClientProps {
  initialBlogs: any[];
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
}

export default function BlogsClient({
  initialBlogs,
  initialPagination,
  initialCounts,
}: BlogsClientProps) {
  const { user: currentUser } = useSettingsStore();
  const router = useRouter();

  // State
  const [blogs, setBlogs] = useState<any[]>(initialBlogs);
  const [pagination, setPagination] = useState(initialPagination);
  const [activeUnit, setActiveUnit] = useState<string>('Free');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isGuest = !currentUser?.isSubscribed;

  // Tabs: Free first, then General (Subjects), then Unit 1-10
  const tabs = isGuest
    ? ['Free', 'General', 'All', ...Array.from({ length: 10 }, (_, i) => `unit_${i + 1}`)]
    : ['General', 'All', ...Array.from({ length: 10 }, (_, i) => `unit_${i + 1}`)];

  // Subject options (categories) - mapping database categories to readable names
  const subjects = [
    { id: 'All', label: 'All Subjects' },
    { id: 'general', label: 'General / Exam Info' }, // (Syllabus, Result, Notifications)
    { id: 'history', label: 'History' },
    { id: 'geography', label: 'Geography' },
    { id: 'polity', label: 'Polity' },
    { id: 'economy', label: 'Economy' },
    { id: 'science_tech', label: 'Science & Tech' },
    { id: 'tribal_culture', label: 'Tribal Culture' },
    { id: 'mp_general', label: 'MP General' },
    { id: 'current_affairs', label: 'Current Affairs' },
  ];

  // Mount prefetching for initial blogs to ensure "light speed"
  useEffect(() => {
    initialBlogs.slice(0, 5).forEach((blog) => {
      router.prefetch(`/blogs/${blog.slug}`);
    });
  }, [initialBlogs, router]);

  // Initial Fetch / Filter Change
  const fetchBlogs = async (reset = false) => {
    startTransition(async () => {
      try {
        const result = await getBlogs({
          page: 1,
          limit: 10,
          unitId: activeUnit === 'Free' || activeUnit === 'General' ? 'All' : activeUnit,
          category: activeUnit === 'General' ? activeCategory : 'All',
          search: searchQuery,
          isFreeAccess: activeUnit === 'Free' ? true : undefined,
        });

        setBlogs(result.blogs);
        setPagination(result.pagination);
      } catch (error) {
        logger.error('Failed to fetch blogs', error, {
          category: 'content',
          metadata: { unit: activeUnit, search: searchQuery },
        });
      }
    });
  };

  // Load More Action
  const handleLoadMore = async () => {
    if (!pagination.hasMore || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = pagination.page + 1;
      const result = await getBlogs({
        page: nextPage,
        limit: 10,
        unitId: activeUnit === 'Free' || activeUnit === 'General' ? 'All' : activeUnit,
        category: activeUnit === 'General' ? activeCategory : 'All',
        search: searchQuery,
        isFreeAccess: activeUnit === 'Free' ? true : undefined,
      });

      setBlogs((prev) => [...prev, ...result.blogs]);
      setPagination(result.pagination);
    } catch (error) {
      logger.error('Failed to load more blogs', error, {
        category: 'content',
        metadata: { page: pagination.page + 1, unit: activeUnit },
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Debounce Search & Filter Effect
  useEffect(() => {
    // Debounce search to prevent rapid server calls
    const timer = setTimeout(() => {
      fetchBlogs(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeUnit, activeCategory, searchQuery]); // Re-fetch when unit, category or search changes

  const handleUnitChange = (unit: string) => {
    setActiveUnit(unit);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
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

          <div className="no-scrollbar -mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pt-2 pb-2 md:mx-0 md:px-0">
            {tabs.map((tab) => {
              const count =
                tab === 'General'
                  ? initialCounts.categories['general'] || 0
                  : initialCounts.units[tab] || 0;
              return (
                <button
                  key={tab}
                  onClick={() => handleUnitChange(tab)}
                  className={`group flex snap-start items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
                    tab === 'Free' && activeUnit === 'Free'
                      ? 'scale-105 border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                      : tab === 'Free' && activeUnit !== 'Free'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : activeUnit === tab
                          ? 'scale-105 border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  } `}
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
                  {tab !== 'General' && count > 0 && (
                    <span
                      className={`flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-black transition-colors ${activeUnit === tab ? 'bg-white text-slate-900' : 'bg-emerald-500 text-white group-hover:bg-emerald-600'} `}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Subject Tabs (Visible only when General is active) */}
          {activeUnit === 'General' && (
            <div className="animate-in fade-in slide-in-from-top-2 no-scrollbar -mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
              {subjects.map((subject) => {
                const count = initialCounts.categories[subject.id] || 0;
                const isActive = activeCategory === subject.id;
                return (
                  <button
                    key={subject.id}
                    onClick={() => setActiveCategory(subject.id)}
                    className={`group flex snap-start items-center gap-2 rounded-lg border px-4 py-2 text-[11px] font-black tracking-tight whitespace-nowrap transition-all ${
                      isActive
                        ? 'border-slate-900 bg-slate-100 text-slate-900'
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
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

          {/* Active Unit Breadcrumb */}
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
            <div className="group relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <BookOpen size={80} />
              </div>
              <h3 className="relative z-10 mb-2 text-lg font-bold">Ace MPPSC 2026</h3>
              {(currentUser as any)?.is_subscribed ? (
                <>
                  <p className="relative z-10 mb-4 text-sm text-slate-300">
                    Premium access active! Master your preparation with full mock tests.
                  </p>
                  <Button
                    variant="secondary"
                    className="w-full font-bold text-slate-900 shadow-lg hover:bg-white"
                    asChild
                  >
                    <Link href="/syllabus/quiz/pyq">Start Practicing</Link>
                  </Button>
                </>
              ) : (currentUser as any)?.plan_tier === 'lite' ? (
                <>
                  <p className="relative z-10 mb-4 text-sm text-slate-300">
                    Upgrade to Pro for full Mock Tests.
                  </p>
                  <Button
                    variant="secondary"
                    className="w-full font-bold text-slate-900 shadow-lg hover:bg-white"
                    asChild
                  >
                    <Link href="/upgrade">Upgrade to Pro</Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="relative z-10 mb-4 text-sm text-slate-300">
                    Unlock premium mock tests, analytics, and exclusive content.
                  </p>
                  <Button
                    variant="secondary"
                    className="w-full font-bold text-slate-900 shadow-lg hover:bg-white"
                    asChild
                  >
                    <Link href="/upgrade">Get Premium</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 lg:col-span-3">
          <>
            {/* BLOG LIST VIEW */}
            {isPending && blogs.length === 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[300px] animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in grid grid-cols-1 gap-6 md:grid-cols-2">
                {(() => {
                  const displayBlogs = blogs;

                  if (displayBlogs.length === 0)
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
                                {activeUnit === 'All'
                                  ? 'any unit'
                                  : `Unit ${activeUnit.split('_')[1]}`}
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

                  return displayBlogs.map((blog, i) => {
                    const hasAccess = canAccessBlog(
                      {
                        isFreeAccess: blog.isFreeAccess,
                        isLiteAccess: blog.isLiteAccess,
                        isProAccess: blog.isProAccess,
                      },
                      currentUser as Parameters<typeof canAccessBlog>[1]
                    );
                    const isLocked = !hasAccess;

                    return <BlogCard key={blog.id} blog={blog} index={i} isLocked={isLocked} />;
                  });
                })()}
              </div>
            )}

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="flex justify-center pt-8 pb-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="min-w-[160px] rounded-full font-bold text-slate-600 hover:border-slate-400 hover:text-slate-900"
                >
                  {isLoadingMore ? (
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
          </>
        </div>
      </div>
    </div>
  );
}
