import { getBlogs } from "@/actions/blog-actions";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookOpen, ChevronRight, ArrowLeft } from "lucide-react";

export default async function BlogsPage() {
    const blogs = await getBlogs();

    // Group by category could be done here or in SQL, but for now simple list
    const categories = ['history', 'geography', 'polity', 'current_affairs_mp', 'current_affairs_india', 'strategy','mP_gK'];

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Sidebar (Desktop) / Topbar (Mobile) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="sticky top-24 space-y-4">
                        <h2 className="text-xl font-display font-bold text-slate-900">Categories</h2>
                        <div className="flex flex-wrap lg:flex-col gap-2">
                             <Button variant="secondary" className="justify-start font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 w-full lg:w-auto">
                                All Topics
                             </Button>
                             {categories.map(cat => (
                                 <Button key={cat} variant="ghost" className="justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-white w-full lg:w-auto capitalize">
                                     {cat.replace(/_/g, ' ')}
                                 </Button>
                             ))}
                        </div>

                         <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-lg mt-8 hidden lg:block">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-bold text-lg">MPPSC Mission 2026</h3>
                                <p className="text-indigo-100 text-sm">Get premium study material and mock tests to ace your exam.</p>
                                <Button variant="secondary" className="w-full text-indigo-700 font-bold" asChild>
                                    <Link href="/syllabus/quiz">Start Practicing</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="space-y-2">
                             <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="rounded-full -ml-2" asChild>
                                    <Link href="/">
                                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                                    </Link>
                                </Button>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 font-display tracking-tight">Study Material</h1>
                             </div>
                            <p className="text-slate-500">Expert curated articles and notes for MPPSC.</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {blogs.length === 0 ? (
                            <div className="col-span-2 py-20 text-center text-slate-400">
                                No articles found. Check back soon!
                            </div>
                        ) : blogs.map((blog) => (
                            <Link href={`/blogs/${blog.slug}`} key={blog.id} className="group">
                                <Card className="h-full border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                                        {blog.imageUrl ? (
                                            <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-300">
                                                <BookOpen size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <Badge className="bg-white/90 backdrop-blur text-slate-900 font-bold shadow-sm hover:bg-white capitalize">
                                                {blog.category.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                            <Clock size={12} />
                                            <span>{blog.readingTime || 5} min read</span>
                                            <span>•</span>
                                            <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'Recently'}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                            {blog.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm line-clamp-2">
                                            {blog.description}
                                        </p>
                                        <div className="pt-2 flex items-center text-indigo-600 font-bold text-sm">
                                            Read Article <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                     </div>
                </div>

            </div>
        </div>
    );
}
