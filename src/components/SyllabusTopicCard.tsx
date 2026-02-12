"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, Plus, Lock, Sparkles } from 'lucide-react';
import NextImage from 'next/image';

interface SyllabusTopicCardProps {
    id: string | number;
    title: string;
    subtitle?: string;
    impactEmoji?: string;
    imageUrl?: string;
    colorVariant: 'blue' | 'pink' | 'emerald' | 'amber';
    variant?: 'topic' | 'unit';
    isLocked?: boolean;
    isFree?: boolean;
    hideBadge?: boolean;
    hidePlus?: boolean;
    onClick: () => void;
    labels: {
        search: string;
        topic: string;
        unit: string;
    };
}

export const SyllabusTopicCard: React.FC<SyllabusTopicCardProps> = ({
    id,
    title,
    subtitle,
    impactEmoji,
    imageUrl,
    colorVariant,
    variant = 'topic',
    isLocked,
    isFree,
    hideBadge = false,
    hidePlus = false,
    onClick,
    labels
}) => {
    const variants = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            icon: 'text-blue-400',
            border: 'border-blue-100',
            shadow: 'shadow-blue-200/40'
        },
        pink: {
            bg: 'bg-pink-50',
            text: 'text-pink-600',
            icon: 'text-pink-400',
            border: 'border-pink-100',
            shadow: 'shadow-pink-200/40'
        },
        emerald: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            icon: 'text-emerald-400',
            border: 'border-emerald-100',
            shadow: 'shadow-emerald-200/40'
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            icon: 'text-amber-400',
            border: 'border-amber-100',
            shadow: 'shadow-amber-200/40'
        }
    };

    const style = variants[colorVariant];

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "relative group cursor-pointer w-full h-[320px] rounded-[2.5rem] p-6 flex flex-col justify-between overflow-hidden border transition-all duration-300",
                style.bg,
                style.border,
                "shadow-sm hover:shadow-xl",
                style.shadow,
                isLocked && "grayscale-[0.5] opacity-90"
            )}
        >
            {/* Top Bar: Search Pill + Plus Icon */}
            <div className="flex items-center justify-between relative z-10">
                {!hideBadge ? (
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white">
                        <Search className={cn("w-3.5 h-3.5", style.icon)} />
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
                            {variant === 'unit' ? `${labels.unit} ${id.toString().replace('unit_', '')}` : labels.search}
                        </span>
                    </div>
                ) : <div />}
                
                {!hidePlus && (
                    <div className={cn("p-2 rounded-full transition-colors group-hover:bg-white/50", style.text)}>
                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-500" />
                    </div>
                )}
            </div>

            {/* Centered Visual (Emoji or Image) */}
            <div className="flex-1 flex items-center justify-center relative -mt-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Floating Decorative Rings */}
                    <div className={cn("absolute inset-0 rounded-full blur-2xl opacity-20", style.bg)} />
                    
                    {imageUrl ? (
                        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                            <NextImage src={imageUrl} alt={title} fill className="object-cover" />
                        </div>
                    ) : (
                        <div className="relative text-7xl drop-shadow-2xl transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 animate-float">
                            {impactEmoji || "✨"}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Content: Title & Badges */}
            <div className="relative z-10 space-y-3">
                <h3 className="text-xl font-black text-slate-900 leading-[1.2] group-hover:text-slate-800 transition-colors line-clamp-2">
                    {title}
                </h3>
                
                <div className="flex items-center gap-2">
                    {isLocked ? (
                        <div className="inline-flex items-center text-[9px] font-black text-amber-600 bg-white/60 px-2.5 py-1 rounded-lg border border-white uppercase tracking-widest shadow-sm">
                            <Lock className="w-3 h-3 mr-1.5" /> Premium
                        </div>
                    ) : isFree ? (
                        <div className="inline-flex items-center text-[9px] font-black text-emerald-600 bg-white py-1 px-2.5 rounded-lg border border-white uppercase tracking-widest shadow-sm">
                            <Sparkles className="w-3 h-3 mr-1.5" /> Free
                        </div>
                    ) : subtitle ? (
                        <div className="inline-flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                            {subtitle}
                        </div>
                    ) : (
                        <div className="inline-flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Ready for deep dive
                        </div>
                    )}
                </div>
            </div>

            {/* Background Glows (Subtle) */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
        </motion.div>
    );
};
