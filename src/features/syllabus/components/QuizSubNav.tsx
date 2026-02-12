"use client"

import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

import { Album, BookOpen, Layers, Clock, BrainCircuit } from 'lucide-react';

const NAV_ITEMS = [
    { id: 'pyq', label: { en: 'PYQ', hi: 'PYQ' }, icon: Clock, href: '/syllabus/quiz/pyq', color: 'bg-slate-900 border-slate-900', activeText: 'text-slate-900' },
    { id: 'topic', label: { en: 'Topics', hi: 'टॉपिक' }, icon: Layers, href: '/syllabus/quiz/topic', color: 'bg-indigo-600 border-indigo-600', activeText: 'text-indigo-600' },
    { id: 'units', label: { en: 'Units', hi: 'यूनिट' }, icon: BookOpen, href: '/syllabus/quiz/units', color: 'bg-emerald-500 border-emerald-500', activeText: 'text-emerald-600' },
    { id: 'full-length', label: { en: 'FLT', hi: 'FLT' }, icon: Album, href: '/syllabus/quiz/full-length', color: 'bg-amber-500 border-amber-500', activeText: 'text-amber-600' },
    { id: 'csat', label: { en: 'CSAT', hi: 'CSAT' }, icon: BrainCircuit, href: '/syllabus/quiz/csat', color: 'bg-pink-500 border-pink-500', activeText: 'text-pink-600' },
];

export function QuizSubNav() {
    const router = useRouter();
    const pathname = usePathname();
    const { language, user } = useSettingsStore();
    const hi = language === 'hi';

    const springConfig: any = { type: "spring", stiffness: 400, damping: 40 };

    return (
        <>
            {/* 🖥️ DESKTOP NAV (Hidden on Mobile) */}
            <div className="hidden md:flex items-center justify-center w-full mb-12">
                <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-x-auto no-scrollbar max-w-full">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <button
                                key={item.id}
                                onClick={() => router.push(item.href)}
                                className={cn(
                                    "relative px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap outline-none",
                                    isActive ? "text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <span className="relative z-10">
                                    {hi ? item.label.hi : item.label.en}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="quiz-subnav-active-desktop"
                                        className={cn("absolute inset-0 rounded-full shadow-lg shadow-black/5", item.color)}
                                        transition={springConfig}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 📱 MOBILE BOTTOM NAV (Sticky) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-slate-200/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] safe-area-bottom">
                <div className="flex items-center justify-around gap-1 max-w-md mx-auto px-4 py-3">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <button
                                key={item.id}
                                onClick={() => router.push(item.href)}
                                className={cn(
                                    "relative flex flex-col items-center gap-1 transition-all shrink-0 min-w-[64px]",
                                    isActive ? item.activeText : "text-slate-400"
                                )}
                            >
                                <div className={cn(
                                    "flex flex-col items-center justify-center w-full h-full"
                                )}>
                                    <div className={cn(
                                        "p-1.5 rounded-2xl transition-all duration-300 mb-0.5",
                                        isActive ? cn("bg-slate-100/50 shadow-sm", item.activeText) : "text-slate-400"
                                    )}>
                                        <item.icon className={cn("w-5 h-5", isActive && "fill-current")} />
                                    </div>
                                    
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-tight transition-all leading-none",
                                        isActive ? "text-slate-900 scale-105" : "text-slate-400"
                                    )}>
                                        {hi ? item.label.hi : item.label.en}
                                    </span>
                                </div>

                                {isActive && (
                                    <motion.div
                                        layoutId="quiz-subnav-active-mobile"
                                        className={cn("absolute -bottom-1 h-1 w-8 rounded-t-full opacity-50", item.color.split(' ')[0])}
                                        transition={springConfig}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
