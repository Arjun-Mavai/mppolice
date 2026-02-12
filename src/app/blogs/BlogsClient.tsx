"use client"
import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, BookOpen, Loader2 } from "lucide-react";
import { BlogCard } from "@/components/blog/BlogCard";
import { SearchInput } from "@/components/blog/SearchInput";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getBlogs } from "@/actions/blog-actions";

interface BlogsClientProps {
    initialBlogs: any[];
    initialPagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
    initialCounts: Record<string, number>;
}

export default function BlogsClient({ initialBlogs, initialPagination, initialCounts }: BlogsClientProps) {
    const { user: currentUser } = useSettingsStore();
    
    // State
    const [blogs, setBlogs] = useState<any[]>(initialBlogs);
    const [pagination, setPagination] = useState(initialPagination);
    const [activeUnit, setActiveUnit] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isPending, startTransition] = useTransition();
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const isGuest = !(currentUser as any)?.is_subscribed;

    // Units: Free tab first for non-subscribed users
    const units = isGuest
        ? ['All', 'Free', ...Array.from({ length: 10 }, (_, i) => `unit_${i + 1}`)]
        : ['All', ...Array.from({ length: 10 }, (_, i) => `unit_${i + 1}`)];

    // Initial Fetch / Filter Change
    const fetchBlogs = async (reset = false) => {
        startTransition(async () => {
            const result = await getBlogs({
                page: 1,
                limit: 10,
                unitId: activeUnit === 'Free' ? 'All' : activeUnit,
                search: searchQuery
            });
            
            setBlogs(result.blogs);
            setPagination(result.pagination);
        });
    };

    // Load More Action
    const handleLoadMore = async () => {
        if (!pagination.hasMore || isLoadingMore) return;
        setIsLoadingMore(true);

        const nextPage = pagination.page + 1;
        const result = await getBlogs({
            page: nextPage,
            limit: 10,
            unitId: activeUnit === 'Free' ? 'All' : activeUnit,
            search: searchQuery
        });

        setBlogs(prev => [...prev, ...result.blogs]);
        setPagination(result.pagination);
        setIsLoadingMore(false);
    };

    // Debounce Search & Filter Effect
    useEffect(() => {
        // Debounce search to prevent rapid server calls
        const timer = setTimeout(() => {
            fetchBlogs(true);
        }, 300);
        return () => clearTimeout(timer);
    }, [activeUnit, searchQuery]); // Re-fetch when unit or search changes

    const handleUnitChange = (unit: string) => {
        setActiveUnit(unit);
        // Effect will trigger fetch
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-slate-500" asChild>
                                <Link href="/"><ArrowLeft size={20} /></Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
                                   MPPSC Knowledge
                                </h1>
                                <p className="text-xs text-slate-500 font-medium">Exam-focused articles & strategies</p>
                            </div>
                         </div>
                         
                         {/* Desktop Search */}
                         <div className="w-full md:w-96">
                             <SearchInput 
                                value={searchQuery} 
                                onChange={setSearchQuery} 
                                className="bg-slate-50 border-slate-200 focus:bg-white transition-all" 
                            />
                         </div>
                    </div>

                    {/* Unit Tabs (Scrollable) — clean slate style */}
                    <div className="flex overflow-x-auto pb-2 mt-4 -mx-4 px-4 md:mx-0 md:px-0 gap-2 no-scrollbar snap-x pt-2">
                        {units.map((unit) => {
                            const count = initialCounts[unit] || 0;
                            return (
                                <button 
                                    key={unit}
                                    onClick={() => handleUnitChange(unit)}
                                    className={`
                                        group flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap snap-start border transition-all
                                        ${unit === 'Free' && activeUnit === 'Free'
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200 scale-105'
                                            : unit === 'Free' && activeUnit !== 'Free'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                            : activeUnit === unit 
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-300 scale-105' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                                    `}
                                >
                                    <span>{unit === 'All' ? 'All Units' : unit === 'Free' ? '🎁 Free' : `Unit ${unit.split('_')[1]}`}</span>
                                    {count > 0 && (
                                        <span className={`
                                            flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-black transition-colors
                                            ${activeUnit === unit ? 'bg-white text-slate-900' : 'bg-emerald-500 text-white group-hover:bg-emerald-600'}
                                        `}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                
                    {/* Active Unit Breadcrumb */}
                    {activeUnit !== 'All' && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 animate-in fade-in slide-in-from-top-1">
                             <span className="font-bold text-slate-800">Unit {activeUnit.split('_')[1]}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 px-4 md:px-8 py-8">
                
                {/* Sidebar (Desktop Only) — clean dark style */}
                <div className="hidden lg:col-span-1 lg:block space-y-6">
                    <div className="sticky top-44 space-y-6">
                         <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <BookOpen size={80} />
                            </div>
                            <h3 className="font-bold text-lg mb-2 relative z-10">Ace MPPSC 2026</h3>
                            {(currentUser as any)?.is_subscribed ? (
                                <>
                                    <p className="text-slate-300 text-sm mb-4 relative z-10">Premium access active! Master your preparation with full mock tests.</p>
                                    <Button variant="secondary" className="w-full text-slate-900 font-bold hover:bg-white shadow-lg" asChild>
                                        <Link href="/syllabus/quiz">Start Practicing</Link>
                                    </Button>
                                </>
                            ) : (currentUser as any)?.plan_tier === 'lite' ? (
                                <>
                                    <p className="text-slate-300 text-sm mb-4 relative z-10">Upgrade to Pro for full Mock Tests.</p>
                                    <Button variant="secondary" className="w-full text-slate-900 font-bold hover:bg-white shadow-lg" asChild>
                                        <Link href="/upgrade">Upgrade to Pro</Link>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <p className="text-slate-300 text-sm mb-4 relative z-10">Unlock premium mock tests, analytics, and exclusive content.</p>
                                    <Button variant="secondary" className="w-full text-slate-900 font-bold hover:bg-white shadow-lg" asChild>
                                        <Link href="/upgrade">Get Premium</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                     <>
                        {/* BLOG LIST VIEW */}
                         {isPending && blogs.length === 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {[1,2,3,4].map(i => (
                                     <div key={i} className="h-[300px] rounded-xl bg-slate-100 animate-pulse" />
                                 ))}
                             </div>
                         ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                                {(() => {
                                    const displayBlogs = activeUnit === 'Free' 
                                        ? blogs.filter(b => b.isFreeAccess === true)
                                        : blogs;
                                    
                                    if (displayBlogs.length === 0) return (
                                        <div className="col-span-2 py-20 text-center text-slate-400 flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                                <Search className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-600">
                                                {activeUnit === 'Free' ? 'No free articles yet' : 'No content found'}
                                            </h3>
                                            <p className="max-w-xs mx-auto">
                                                {activeUnit === 'Free' 
                                                    ? 'Free articles will appear here soon.'
                                                    : <>No articles found for <span className="font-bold text-slate-800">
                                                        {activeUnit === 'All' ? 'any unit' : `Unit ${activeUnit.split('_')[1]}`}
                                                      </span>
                                                      {searchQuery && <span> matching &quot;{searchQuery}&quot;</span>}.</>
                                                }
                                            </p>
                                            {(activeUnit !== 'All' || searchQuery) && (
                                                <Button variant="outline" onClick={() => { setActiveUnit('All'); setSearchQuery(''); }}>
                                                    Clear Filters
                                                </Button>
                                            )}
                                        </div>
                                    );

                                    return displayBlogs.map((blog, i) => {
                                        const userTier = (currentUser as any)?.plan_tier || 'free';
                                        const isUserSubscribed = (currentUser as any)?.is_subscribed;
                                        const isAdmin = (currentUser as any)?.role === 'admin';
                                        
                                        let isLocked = true;
                                        if (isAdmin) {
                                            isLocked = false;
                                        } else if (isUserSubscribed && userTier === 'pro') {
                                            isLocked = blog.isProAccess === false;
                                        } else if (isUserSubscribed && userTier === 'lite') {
                                            isLocked = !(blog.isLiteAccess || blog.isFreeAccess);
                                        } else {
                                            isLocked = !blog.isFreeAccess;
                                        }

                                        return (
                                            <BlogCard 
                                                key={blog.id} 
                                                blog={blog} 
                                                featured={i === 0 && activeUnit === 'All' && !searchQuery} 
                                                isLocked={isLocked}
                                            />
                                        );
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
                                    className="min-w-[160px] rounded-full font-bold text-slate-600 hover:text-slate-900 hover:border-slate-400"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <Loader2 size={16} className="mr-2 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        "Load More Articles"
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



