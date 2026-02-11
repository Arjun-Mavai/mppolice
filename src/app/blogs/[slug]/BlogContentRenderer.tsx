'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/useSettingsStore";

// Format inline text: bold quoted text, bold **text**, handle Key: Value
function formatText(text: string): React.ReactNode {
    if (!text) return text;

    // Process markdown bold (**text**) into actual bold, then quoted text
    // Split by **bold** markers first
    const boldParts = text.split(/(\*{2}[^*]+\*{2})/g);
    if (boldParts.length > 1) {
        return boldParts.map((part, i) => {
            if (/^\*{2}[^*]+\*{2}$/.test(part)) {
                const inner = part.replace(/\*{2}/g, '');
                return <strong key={i} className="text-slate-900 font-semibold">{inner}</strong>;
            }
            // Remove stray single stars
            const clean = part.replace(/\*([^*]+)\*/g, '$1');
            // Check for quoted text in this segment
            const quoteParts = clean.split(/(["'][^"']+["'])/g);
            if (quoteParts.length > 1) {
                return quoteParts.map((qp, j) => {
                    if (/^["'][^"']+["']$/.test(qp)) {
                        return <strong key={`${i}-${j}`} className="text-slate-900 font-semibold">{qp}</strong>;
                    }
                    return <span key={`${i}-${j}`}>{qp}</span>;
                });
            }
            return <span key={i}>{clean}</span>;
        });
    }

    // Remove remaining stars
    let cleaned = text.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1');

    // Bold quoted text
    const parts = cleaned.split(/(["'][^"']+["'])/g);
    if (parts.length > 1) {
        return parts.map((part, i) => {
            if (/^["'][^"']+["']$/.test(part)) {
                return <strong key={i} className="text-slate-900 font-semibold">{part}</strong>;
            }
            return <span key={i}>{part}</span>;
        });
    }

    return cleaned;
}

// Render a single list item that may contain "Label: description" pattern
function renderListItem(item: string, num: number | string, i: number): React.ReactNode {
    const trimmed = item.trim();
    // Check for "**Label:** content" or "Label: content" pattern
    const boldLabelMatch = trimmed.match(/^\*{0,2}([^:*]{2,30})\*{0,2}:\s*(.+)/);
    if (boldLabelMatch) {
        return (
            <li key={i} className="flex items-start gap-3 text-slate-700 leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {num}
                </span>
                <span className="flex-1 text-base">
                    <strong className="text-slate-900 font-semibold">{boldLabelMatch[1].replace(/\*/g, '')}:</strong>{' '}
                    {formatText(boldLabelMatch[2])}
                </span>
            </li>
        );
    }
    return (
        <li key={i} className="flex items-start gap-3 text-slate-700 leading-relaxed">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center mt-0.5">
                {num}
            </span>
            <span className="flex-1 text-base">{formatText(trimmed)}</span>
        </li>
    );
}

// Detect numbered items, bullet dots, key:value, or plain paragraph
function renderParagraphOrList(text: string, idx: number): React.ReactNode {
    if (!text) return null;

    // Remove stars for detection (but keep original for formatText)
    const cleaned = text.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1');

    // Check for bullet dot pattern: "• item1 • item2" or lines starting with •
    if (cleaned.includes('•')) {
        const bulletItems = cleaned.split(/•/).map(s => s.trim()).filter(Boolean);
        if (bulletItems.length > 0) {
            // Check if there's text before the first bullet
            const beforeBullet = cleaned.substring(0, cleaned.indexOf('•')).trim();
            return (
                <div key={idx} className="my-4">
                    {beforeBullet && (
                        <p className="text-slate-800 font-semibold text-base mb-2">{formatText(beforeBullet)}</p>
                    )}
                    <ul className="space-y-1.5 ml-1">
                        {bulletItems.map((item, i) => {
                            // Check for "Label: value" inside bullet
                            const colonMatch = item.match(/^([^:]{2,40}):\s*(.+)/);
                            if (colonMatch) {
                                return (
                                    <li key={i} className="flex items-start gap-2.5 text-slate-700 text-base leading-relaxed">
                                        <span className="text-emerald-500 mt-1 flex-shrink-0">•</span>
                                        <span>
                                            <strong className="text-slate-900 font-semibold">{colonMatch[1]}:</strong>{' '}
                                            {formatText(colonMatch[2])}
                                        </span>
                                    </li>
                                );
                            }
                            return (
                                <li key={i} className="flex items-start gap-2.5 text-slate-700 text-base leading-relaxed">
                                    <span className="text-emerald-500 mt-1 flex-shrink-0">•</span>
                                    <span>{formatText(item)}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            );
        }
    }

    // Check for numbered list pattern: "1. xxx 2. xxx" or inline "1. **Bold:** text 2. ..."
    const numberedPattern = /(?:^|\s)(\d+)[.)]\s+/;
    if (numberedPattern.test(cleaned)) {
        const items = cleaned.split(/(?:^|\s)\d+[.)]\s+/).filter(Boolean);
        const numbers = cleaned.match(/\d+(?=[.)]\s)/g) || [];

        if (items.length > 1) {
            // Check if there's intro text before first number
            const firstNumIdx = cleaned.search(/\d+[.)]\s/);
            const intro = firstNumIdx > 0 ? cleaned.substring(0, firstNumIdx).trim() : '';
            
            return (
                <div key={idx} className="my-4">
                    {intro && (
                        <p className="text-slate-800 font-semibold text-base mb-2">{formatText(intro)}</p>
                    )}
                    <ol className="space-y-2">
                        {items.map((item, i) => renderListItem(item, numbers[i] || i + 1, i))}
                    </ol>
                </div>
            );
        }
    }

    // Check for "Key: Value" pattern (key facts)
    const colonMatch = cleaned.match(/^([^:]{3,40}):\s*(.+)/);
    if (colonMatch && !cleaned.startsWith('http')) {
        return (
            <p key={idx} className="text-slate-700 leading-relaxed mb-4 text-base">
                <strong className="text-slate-900 font-semibold">{colonMatch[1]}:</strong>{' '}
                {formatText(colonMatch[2])}
            </p>
        );
    }

    return (
        <p key={idx} className="text-slate-700 leading-relaxed mb-5 text-base">
            {formatText(cleaned)}
        </p>
    );
}

export default function BlogContentRenderer({ blog }: { blog: any }) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const { language, setLanguage } = useSettingsStore();
    
    const content = Array.isArray(blog.content) 
        ? blog.content 
        : (blog.content[language] || blog.content['hi'] || []);

    const renderContent = (blocks: any[]) => {
        if (!blocks || !Array.isArray(blocks)) return null;
        
        return blocks.map((block: any, idx: number) => {
            switch (block.type) {
                case 'h2': {
                    const text = (block.text || '').replace(/\*{1,2}/g, '');
                    return (
                        <h2 key={idx} className="text-xl md:text-2xl font-bold text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-100">
                            {text}
                        </h2>
                    );
                }
                case 'h3': {
                    const text = (block.text || '').replace(/\*{1,2}/g, '');
                    return (
                        <h3 key={idx} className="text-lg md:text-xl font-semibold text-slate-800 mt-7 mb-3">
                            {text}
                        </h3>
                    );
                }
                case 'p':
                    return renderParagraphOrList(block.text, idx);

                case 'img':
                    return (
                        <div key={idx} className="my-6 rounded-xl overflow-hidden shadow-md border border-slate-100 relative">
                             <div className="relative aspect-video w-full">
                                <NextImage 
                                    src={block.src} 
                                    alt={block.alt || "Blog image"} 
                                    fill 
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 800px"
                                />
                             </div>
                             {block.caption && <p className="text-center text-sm text-slate-500 py-2 italic bg-slate-50">{block.caption}</p>}
                        </div>
                    );
                case 'ul':
                    return (
                        <ul key={idx} className="my-4 space-y-2 ml-1">
                            {block.items.map((item: string, i: number) => {
                                const cleaned = (item || '').replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1');
                                return (
                                    <li key={i} className="flex items-start gap-2.5 text-slate-700 text-base leading-relaxed">
                                        <span className="text-emerald-500 mt-1.5 flex-shrink-0">•</span>
                                        <span>{formatText(cleaned)}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    );
                case 'table':
                    return (
                        <div key={idx} className="my-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto -mx-px">
                                <table className="w-full border-collapse bg-white text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            {block.head.map((header: string, i: number) => (
                                                <th 
                                                    key={i} 
                                                    className="px-3 sm:px-5 py-3 text-left text-xs sm:text-sm font-bold text-slate-900 border-b-2 border-slate-200 whitespace-nowrap"
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {block.body.map((row: string[], rowIdx: number) => (
                                            <tr key={rowIdx} className="hover:bg-slate-50/50">
                                                {row.map((cell: string, cellIdx: number) => (
                                                    <td key={cellIdx} className="px-3 sm:px-5 py-2.5 text-xs sm:text-sm text-slate-700">
                                                        {formatText(cell)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {block.instruction && (
                                <p className="text-xs text-slate-500 italic px-3 py-2 bg-slate-50 border-t border-slate-100">
                                    {block.instruction}
                                </p>
                            )}
                        </div>
                    );
                case 'quote':
                    return (
                        <blockquote key={idx} className="border-l-4 border-emerald-500 pl-5 py-3 my-6 bg-emerald-50/40 rounded-r-lg">
                            <p className="text-base font-medium text-slate-800 italic leading-relaxed">
                                {formatText(block.text)}
                            </p>
                        </blockquote>
                    );
                
                case 'highlight': {
                    const levelColors: Record<string, string> = {
                        critical: 'bg-amber-50 border-amber-300 text-amber-900',
                        important: 'bg-yellow-50 border-yellow-300 text-yellow-900',
                        note: 'bg-blue-50 border-blue-300 text-blue-900'
                    };
                    const levelIcons: Record<string, string> = {
                        critical: '⚠️',
                        important: '💡',
                        note: 'ℹ️'
                    };
                    return (
                        <div
                            key={idx}
                            className={`my-5 p-4 rounded-xl border-l-4 ${levelColors[block.level] || levelColors.important}`}
                        >
                            <div className="flex items-start gap-2.5">
                                <span className="text-xl flex-shrink-0">{block.icon || levelIcons[block.level]}</span>
                                <p className="font-medium leading-relaxed text-sm">{formatText(block.text)}</p>
                            </div>
                        </div>
                    );
                }
                
                case 'pyq':
                    return (
                        <div key={idx} className="my-6 p-5 bg-slate-900 rounded-xl shadow-lg text-white">
                            <div className="flex items-center gap-2.5 mb-3">
                                <span className="text-lg">📝</span>
                                <div>
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{block.exam}</p>
                                    <p className="text-xs text-slate-400">{block.year}</p>
                                </div>
                            </div>
                            <p className="text-base font-medium mb-3 leading-relaxed">{formatText(block.question)}</p>
                            {block.options && (
                                <div className="space-y-1.5 mb-3">
                                    {block.options.map((opt: string, i: number) => (
                                        <div 
                                            key={i} 
                                            className={`px-3 py-2 rounded-lg text-sm ${opt === block.correct ? 'bg-emerald-600/20 border border-emerald-500/50' : 'bg-slate-800/60'}`}
                                        >
                                            <span className="font-mono text-xs mr-1.5">{String.fromCharCode(65 + i)}.</span>{opt}
                                            {opt === block.correct && <span className="ml-1.5 text-emerald-400 text-xs">✓</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {block.strategy && (
                                <div className="mt-3 pt-3 border-t border-slate-700">
                                    <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Strategy</p>
                                    <p className="text-sm text-slate-300">{block.strategy}</p>
                                </div>
                            )}
                        </div>
                    );
                
                case 'mnemonic':
                    return (
                        <div key={idx} className="my-6 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                            <div className="flex items-center gap-2.5 mb-3">
                                <span className="text-2xl">{block.visual || '🧠'}</span>
                                <div>
                                    <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Memory Trick</p>
                                    <p className="text-sm font-semibold text-slate-800">{block.topic}</p>
                                </div>
                            </div>
                            <div className="bg-white/70 rounded-lg p-3 mb-2">
                                {renderParagraphOrList(block.trick || '', idx * 1000)}
                            </div>
                            {block.explanation && (
                                <div className="text-sm text-slate-600">
                                    {renderParagraphOrList(block.explanation || '', idx * 1000 + 1)}
                                </div>
                            )}
                        </div>
                    );
                
                case 'fact_card':
                    return (
                        <div key={idx} className="my-6 p-5 bg-emerald-50/80 rounded-xl border border-emerald-200">
                            <div className="flex items-center gap-2.5 mb-3">
                                <span className="text-2xl">{block.icon || '📊'}</span>
                                <p className="text-base font-bold text-emerald-900">{block.title}</p>
                            </div>
                            <ul className="space-y-1.5">
                                {block.facts.map((fact: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                                        <span className="text-emerald-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                                        <span>{formatText(fact)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                
                case 'case_study':
                    return (
                        <div key={idx} className="my-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-start gap-2.5 mb-3">
                                <span className="text-2xl flex-shrink-0">⚖️</span>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">{block.title}</p>
                                    {block.year && <p className="text-xs text-slate-500">{block.year}</p>}
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-3 mb-3">
                                <p className="text-xs font-semibold text-slate-500 mb-1">Significance</p>
                                <p className="text-sm text-slate-800">{block.significance}</p>
                            </div>
                            <ul className="space-y-1 mb-3">
                                {block.keyPoints.map((point: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                                        <span className="text-slate-400 mt-0.5">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                            {block.examRelevance && (
                                <p className="text-xs text-emerald-600 font-semibold pt-2 border-t border-slate-200">
                                    📌 {block.examRelevance}
                                </p>
                            )}
                        </div>
                    );
                
                case 'exam_pattern':
                    return (
                        <div key={idx} className="my-6 p-5 bg-indigo-900 rounded-xl text-white">
                            <div className="flex items-center gap-2.5 mb-3">
                                <span className="text-2xl">📊</span>
                                <div>
                                    <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Exam Pattern</p>
                                    <p className="text-base font-bold">{block.topic}</p>
                                </div>
                            </div>
                            <p className="text-sm text-indigo-200 mb-3">{block.analysis}</p>
                            <div className="bg-white/10 rounded-lg p-3 mb-2">
                                <ul className="space-y-1.5">
                                    {block.stats.map((stat: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <span className="text-indigo-300">▸</span>
                                            <span>{stat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {block.trend && (
                                <div className="pt-2 border-t border-white/20">
                                    <p className="text-[11px] text-indigo-300 uppercase tracking-wider mb-1">Trend</p>
                                    <p className="text-sm">{block.trend}</p>
                                </div>
                            )}
                        </div>
                    );
                
                default:
                    return null;
            }
        });
    };

    return (
        <div className="min-h-screen bg-white">
             {/* Reading Progress Bar */}
             <motion.div
                className="fixed top-[64px] left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 origin-left z-50"
                style={{ scaleX }}
            />

            {/* Hero Section — compact */}
            <div className="relative min-h-[280px] sm:min-h-[360px] w-full flex items-end bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    {blog.imageUrl ? (
                         <NextImage 
                            src={blog.imageUrl} 
                            alt={blog.title} 
                            fill 
                            priority 
                            className="object-cover"
                            sizes="100vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
                </div>
                
                <div className="relative z-10 w-full max-w-3xl mx-auto px-5 pb-8 pt-20 text-white">
                    <Badge className="bg-emerald-600/90 hover:bg-emerald-700 px-3 py-1 text-xs uppercase tracking-widest pointer-events-none mb-3">
                        {blog.category.replace(/_/g, ' ')}
                    </Badge>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight mb-3">
                        {blog.title}
                    </h1>
                    <div className="flex items-center gap-4 text-slate-400 text-sm">
                        <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {blog.readingTime || 5} min
                        </span>
                        <span className="flex items-center gap-1.5">
                             <Calendar size={14} />
                             {new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <article className="max-w-3xl mx-auto px-5 py-8 sm:py-12">
                 {/* Back Button & Language Toggle */}
                 <div className="mb-8 flex justify-between items-center">
                     <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 -ml-3 text-sm" asChild>
                         <Link href="/blogs"><ArrowLeft size={14} className="mr-1.5" /> Back</Link>
                     </Button>
                     
                     {!Array.isArray(blog.content) && (
                        <div className="flex bg-slate-100 rounded-lg p-0.5">
                            <button 
                                onClick={() => setLanguage('hi')}
                                className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${language === 'hi' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                हिंदी
                            </button>
                            <button 
                                onClick={() => setLanguage('en')}
                                className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${language === 'en' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                EN
                            </button>
                        </div>
                     )}
                 </div>

                 {/* Description — larger with more space */}
                 {blog.description && (
                     <div className="mb-8 pb-6 border-b border-slate-100">
                         <p className="text-lg text-slate-600 leading-relaxed font-medium">
                             {blog.description}
                         </p>
                     </div>
                 )}

                 {/* Render JSON Content */}
                 <div className="max-w-none">
                     {renderContent(content)}
                 </div>

                 {/* Footer */}
                 <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center">
                     <div>
                         <p className="text-slate-400 text-xs font-medium">Published by</p>
                         <p className="font-bold text-slate-800 text-sm">MPPSC 2026</p>
                     </div>
                 </div>
            </article>
        </div>
    );
}
