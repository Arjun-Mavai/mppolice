'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { BlogCard } from "@/components/blog/BlogCard";
import { SearchInput } from "@/components/blog/SearchInput";
import { getBlogs } from "@/actions/blog-actions";
import { useSettingsStore } from "@/store/useSettingsStore";
import { PLAN_LIMITS } from "@/config/plans";

export default function BlogsPage() {
    const { user: currentUser } = useSettingsStore();
    const [allBlogs, setAllBlogs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    const categories = ['All', 'history', 'geography', 'polity', 'strategy', 'current_affairs_mp', 'current_affairs_india', 'economics', 'science', 'mp_gk'];

    useEffect(() => {
        getBlogs().then(blogs => {
            setAllBlogs(blogs);
            setIsLoading(false);
        });
    }, []);

    // Client-side filtering
    const blogs = allBlogs.filter(blog => {
        const matchesCategory = activeCategory === 'All' ? true : blog.category === activeCategory;
        const matchesQuery = searchQuery ? blog.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
        return matchesCategory && matchesQuery;
    });

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between mb-4 md:mb-0">
                         <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-slate-500" asChild>
                                <Link href="/"><ArrowLeft size={20} /></Link>
                            </Button>
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 font-display tracking-tight">
                                Study Material
                            </h1>
                         </div>
                         
                         {/* Desktop Search */}
                         <div className="hidden md:block w-72">
                             <SearchInput value={searchQuery} onChange={setSearchQuery} />
                         </div>
                    </div>

                    {/* Mobile Horizontal Scroll Categories */}
                    <div className="flex md:hidden overflow-x-auto pb-2 -mx-4 px-4 gap-2 no-scrollbar snap-x">
                        {categories.map((cat) => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`
                                    px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap snap-start border transition-colors
                                    ${activeCategory === cat 
                                        ? 'bg-slate-900 text-white border-slate-900' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}
                                `}
                            >
                                {cat.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 px-4 md:px-8 py-8">
                
                {/* Sidebar (Desktop Only) */}
                <div className="hidden lg:col-span-1 lg:block space-y-6">
                    <div className="sticky top-40 space-y-6">
                        <div>
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Browse Topics</h2>
                            <div className="space-y-1">
                                {categories.map((cat) => (
                                     <Button 
                                        key={cat} 
                                        variant={activeCategory === cat ? "secondary" : "ghost"} 
                                        className={`w-full justify-start font-bold capitalize ${activeCategory === cat ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-600'}`}
                                        onClick={() => setActiveCategory(cat)}
                                     >
                                         {cat.replace(/_/g, ' ')}
                                     </Button>
                                ))}
                            </div>
                        </div>

                         <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-200">
                            <h3 className="font-bold text-lg mb-2">MPPSC Mission 2026</h3>
                            <p className="text-indigo-100 text-sm mb-4">Unlock premium mock tests and analytics.</p>
                            <Button variant="secondary" className="w-full text-indigo-700 font-bold hover:bg-white" asChild>
                                <Link href="/syllabus/quiz">Start Practicing</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                     {/* Mobile Search */}
                     <div className="md:hidden relative mb-4">
                         <SearchInput value={searchQuery} onChange={setSearchQuery} className="h-12" />
                     </div>

                     {isLoading ? (
                         <div className="col-span-2 py-20 text-center text-slate-400">
                             <p>Loading articles...</p>
                         </div>
                     ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blogs.length === 0 ? (
                                <div className="col-span-2 py-20 text-center text-slate-400 flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Search className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p>No {activeCategory !== 'All' ? activeCategory : ''} articles found.</p>
                                    {(activeCategory !== 'All' || searchQuery) && (
                                        <Button variant="outline" onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}>
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {blogs.map((blog, i) => {
                                        // Determine if locked
                                        // Free users: see only first 4
                                        // Paying users (Lite/Pro): see all (limit is very high)
                                        const userTier = (currentUser as any)?.plan_tier || 'free';
                                        
                                        // Special case: If user is "subscribed" in old logic, assume at least Lite equivalent for now, 
                                        // but ideally we rely on plan_tier. Fallback to 'lite' if isSubscribed is true but tier is free?
                                        // Let's stick to plan_tier if available, or fallback.
                                        const effectiveTier = (currentUser as any)?.is_subscribed ? ((currentUser as any)?.plan_tier === 'free' ? 'lite' : (currentUser as any)?.plan_tier) : 'free';
                                        
                                        const limit = PLAN_LIMITS[effectiveTier as 'free'|'lite'|'pro']?.blog_limit || 4;
                                        const isLocked = i >= limit;

                                        return (
                                            <BlogCard 
                                                key={blog.id} 
                                                blog={blog} 
                                                featured={i === 0 && !isLocked} 
                                                isLocked={isLocked}
                                            />
                                        );
                                    })}
                                </>
                            )}
                         </div>
                     )}
                </div>

            </div>
        </div>
    );
}
