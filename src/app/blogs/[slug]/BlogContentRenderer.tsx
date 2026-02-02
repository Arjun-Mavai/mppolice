'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/useSettingsStore";


export default function BlogContentRenderer({ blog }: { blog: any }) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const { language, setLanguage } = useSettingsStore();
    
    // Determine content based on structure
    // If it's a flat array (old format), just use it.
    // If it's an object with keys (hi/en), pick based on language. default to 'hi' if selected lang missing.
    const content = Array.isArray(blog.content) 
        ? blog.content 
        : (blog.content[language] || blog.content['hi'] || []);

    const renderContent = (blocks: any[]) => {
        if (!blocks || !Array.isArray(blocks)) return null;
        
        return blocks.map((block: any, idx: number) => {
            switch (block.type) {
                case 'h2':
                    return <h2 key={idx} className="text-2xl md:text-3xl font-bold text-slate-900 mt-12 mb-6 font-display">{block.text}</h2>;
                case 'h3':
                    return <h3 key={idx} className="text-xl md:text-2xl font-bold text-slate-800 mt-8 mb-4">{block.text}</h3>;
                case 'p':
                    return <p key={idx} className="text-slate-700 leading-relaxed mb-6 text-lg">{block.text}</p>;
                case 'img':
                    return (
                        <div key={idx} className="my-8 rounded-xl overflow-hidden shadow-lg border border-slate-100">
                             <img src={block.src} alt={block.alt} className="w-full h-auto" />
                             {block.caption && <p className="text-center text-sm text-slate-500 mt-2 italic">{block.caption}</p>}
                        </div>
                    );
                case 'ul':
                    return (
                        <ul key={idx} className="list-disc list-inside space-y-2 mb-6 ml-4 text-slate-700 marker:text-indigo-500">
                            {block.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                    );
                case 'quote':
                    return (
                        <blockquote key={idx} className="border-l-4 border-indigo-500 pl-6 py-2 my-8 italic text-xl text-slate-700 bg-indigo-50/50 rounded-r-lg">
                            "{block.text}"
                        </blockquote>
                    );
                default:
                    return null;
            }
        });
    };

    return (
        <div className="min-h-screen bg-white font-sans">
             {/* Reading Progress Bar - Positioned below fixed header (h-16 = 64px) */}
             <motion.div
                className="fixed top-[64px] left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 origin-left z-50"
                style={{ scaleX }}
            />

            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[400px] w-full flex items-center justify-center bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-50">
                    {blog.imageUrl ? (
                         <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                </div>
                
                <div className="relative z-10 container max-w-4xl mx-auto px-6 text-center text-white space-y-6 mt-16">
                    <Badge className="bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 text-sm uppercase tracking-widest pointer-events-none">
                        {blog.category.replace(/_/g, ' ')}
                    </Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight leading-tight">
                        {blog.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-slate-300 font-medium pt-4">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-indigo-400" />
                            {blog.readingTime || 5} min read
                        </div>
                        <div className="flex items-center gap-2">
                             <Calendar size={16} className="text-indigo-400" />
                             {new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <article className="max-w-3xl mx-auto px-6 py-16">
                 {/* Back Button & Language Toggle */}
                 <div className="mb-12 flex justify-between items-center">
                     <Button variant="ghost" className="text-slate-500 hover:text-slate-900 -ml-4" asChild>
                         <Link href="/blogs"><ArrowLeft size={16} className="mr-2" /> Back to Articles</Link>
                     </Button>
                     
                     {!Array.isArray(blog.content) && (
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            <button 
                                onClick={() => setLanguage('hi')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${language === 'hi' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                हिंदी
                            </button>
                            <button 
                                onClick={() => setLanguage('en')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${language === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                English
                            </button>
                        </div>
                     )}
                 </div>

                 {/* Render JSON Content */}
                 <div className="prose prose-lg prose-slate max-w-none">
                     {renderContent(content)}
                 </div>

                 {/* Footer / Share / Next */}
                 <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
                     <div>
                         <p className="text-slate-500 text-sm font-medium">Published by</p>
                         <p className="font-bold text-slate-900">MPPSC 2026 Admin</p>
                     </div>
                     {/* Can add share buttons here */}
                 </div>
            </article>
        </div>
    );
}
