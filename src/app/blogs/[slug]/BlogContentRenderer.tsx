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
                        <ul key={idx} className="list-disc list-inside space-y-2 mb-6 ml-4 text-slate-700 marker:text-emerald-500">
                            {block.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                    );
                case 'table':
                    return (
                        <div key={idx} className="my-8 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                            <table className="w-full border-collapse bg-white">
                                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                                    <tr>
                                        {block.head.map((header: string, i: number) => (
                                            <th 
                                                key={i} 
                                                className="px-6 py-4 text-left text-sm font-bold text-slate-900 border-b-2 border-slate-200"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {block.body.map((row: string[], rowIdx: number) => (
                                        <tr 
                                            key={rowIdx}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            {row.map((cell: string, cellIdx: number) => (
                                                <td 
                                                    key={cellIdx}
                                                    className="px-6 py-4 text-sm text-slate-700"
                                                >
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {block.instruction && (
                                <p className="text-xs text-slate-500 italic px-4 py-2 bg-slate-50 border-t border-slate-100">
                                    {block.instruction}
                                </p>
                            )}
                        </div>
                    );
                case 'quote':
                    return (
                        <blockquote key={idx} className="border-l-4 border-emerald-500 pl-6 py-2 my-8 italic text-xl text-slate-700 bg-emerald-50/50 rounded-r-lg">
                            "{block.text}"
                        </blockquote>
                    );
                
                // ===== NEW PREMIUM BLOCKS =====
                
                case 'highlight':
                    const levelColors = {
                        critical: 'bg-amber-50 border-amber-400 text-amber-900',
                        important: 'bg-yellow-50 border-yellow-400 text-yellow-900',
                        note: 'bg-blue-50 border-blue-400 text-blue-900'
                    };
                    const levelIcons = {
                        critical: '⚠️',
                        important: '💡',
                        note: 'ℹ️'
                    };
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`my-6 p-6 rounded-xl border-2 ${levelColors[block.level as keyof typeof levelColors] || levelColors.important} shadow-sm`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl flex-shrink-0">{block.icon || levelIcons[block.level as keyof typeof levelIcons]}</span>
                                <p className="font-semibold leading-relaxed text-base">{block.text}</p>
                            </div>
                        </motion.div>
                    );
                
                case 'pyq':
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="my-8 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl border border-slate-700 text-white"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">📝</span>
                                <div>
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{block.exam}</p>
                                    <p className="text-sm text-slate-400">Year: {block.year}</p>
                                </div>
                            </div>
                            <p className="text-lg font-semibold mb-4 leading-relaxed">{block.question}</p>
                            {block.options && (
                                <div className="space-y-2 mb-4">
                                    {block.options.map((opt: string, i: number) => (
                                        <div 
                                            key={i} 
                                            className={`px-4 py-2 rounded-lg ${opt === block.correct ? 'bg-emerald-600/20 border border-emerald-500' : 'bg-slate-800/50'}`}
                                        >
                                            <span className="font-mono text-sm">{String.fromCharCode(65 + i)}.</span> {opt}
                                            {opt === block.correct && <span className="ml-2 text-emerald-400">✓</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Strategy to Solve</p>
                                <p className="text-sm text-slate-300 italic">{block.strategy}</p>
                            </div>
                        </motion.div>
                    );
                
                case 'mnemonic':
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="my-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">{block.visual || '🧠'}</span>
                                <div>
                                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Memory Trick</p>
                                    <p className="text-sm font-semibold text-slate-800">{block.topic}</p>
                                </div>
                            </div>
                            <div className="bg-white/60 rounded-xl p-4 mb-3">
                                <p className="text-lg font-bold text-purple-900 font-mono">{block.trick}</p>
                            </div>
                            {block.explanation && (
                                <p className="text-sm text-slate-600 italic">{block.explanation}</p>
                            )}
                        </motion.div>
                    );
                
                case 'fact_card':
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="my-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 shadow-md"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">{block.icon || '📊'}</span>
                                <p className="text-lg font-bold text-emerald-900">{block.title}</p>
                            </div>
                            <ul className="space-y-2">
                                {block.facts.map((fact: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-700">
                                        <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                                        <span>{fact}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    );
                
                case 'case_study':
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="my-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-300 shadow-lg"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <span className="text-3xl flex-shrink-0">⚖️</span>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{block.title}</p>
                                    {block.year && <p className="text-sm text-slate-500">Year: {block.year}</p>}
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 mb-4">
                                <p className="text-sm font-semibold text-slate-600 mb-2">Significance:</p>
                                <p className="text-base text-slate-800">{block.significance}</p>
                            </div>
                            <div className="space-y-2 mb-4">
                                <p className="text-sm font-semibold text-slate-600">Key Points:</p>
                                <ul className="space-y-1">
                                    {block.keyPoints.map((point: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-slate-700">
                                            <span className="text-slate-400">•</span>
                                            <span className="text-sm">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {block.examRelevance && (
                                <div className="pt-3 border-t border-slate-200">
                                    <p className="text-xs text-emerald-600 font-semibold">📌 Exam Relevance: {block.examRelevance}</p>
                                </div>
                            )}
                        </motion.div>
                    );
                
                case 'exam_pattern':
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="my-8 p-6 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl shadow-2xl text-white"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">📊</span>
                                <div>
                                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Exam Pattern Analysis</p>
                                    <p className="text-lg font-bold">{block.topic}</p>
                                </div>
                            </div>
                            <p className="text-sm text-indigo-200 mb-3">{block.analysis}</p>
                            <div className="bg-white/10 rounded-xl p-4 mb-3">
                                <ul className="space-y-2">
                                    {block.stats.map((stat: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-indigo-300">▸</span>
                                            <span className="text-sm">{stat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {block.trend && (
                                <div className="pt-3 border-t border-white/20">
                                    <p className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Trend</p>
                                    <p className="text-sm italic">{block.trend}</p>
                                </div>
                            )}
                        </motion.div>
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
                className="fixed top-[64px] left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 origin-left z-50"
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
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-sm uppercase tracking-widest pointer-events-none">
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
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${language === 'hi' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                हिंदी
                            </button>
                            <button 
                                onClick={() => setLanguage('en')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${language === 'en' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
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
