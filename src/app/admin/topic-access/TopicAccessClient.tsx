'use client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎛️ TOPIC ACCESS CLIENT — Admin panel ka UI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Unit tabs se filter → topic list → switches se toggle
// Bulk actions: Free/Lite/Pro sab ek click me ON/OFF
// ScrollArea me wrap — proper height, smooth scroll
// Mobile: card layout — responsive admin experience
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BookOpen, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { toggleTopicAccess, bulkUpdateTopicAccess } from './actions';

interface TopicItem {
    id: string;
    unitId: string;
    title: string;
    titleEn: string | null;
    order: number;
    isFree: boolean | null;
    isLiteAccess: boolean | null;
    isProAccess: boolean | null;
}

export default function TopicAccessClient({ topics: initialTopics }: { topics: TopicItem[] }) {
    const [topics, setTopics] = useState(initialTopics);
    const [activeUnit, setActiveUnit] = useState('all');
    const [isPending, startTransition] = useTransition();

    // ── Unit tabs generate karo ─────────────────────────────────
    const units = Array.from(new Set(topics.map(t => t.unitId))).sort((a, b) => {
        const numA = parseInt(a.replace('unit_', ''));
        const numB = parseInt(b.replace('unit_', ''));
        return numA - numB;
    });

    // ── Filter by active unit ───────────────────────────────────
    const filteredTopics = activeUnit === 'all'
        ? topics
        : topics.filter(t => t.unitId === activeUnit);

    // ── Single toggle handler ───────────────────────────────────
    const handleToggle = async (topicId: string, field: 'isFree' | 'isLiteAccess' | 'isProAccess', value: boolean) => {
        // Optimistic update — switch turant flip hota h
        setTopics(prev => prev.map(t =>
            t.id === topicId ? { ...t, [field]: value } : t
        ));

        startTransition(async () => {
            const result = await toggleTopicAccess(topicId, field, value);
            if (!result.success) {
                // Rollback on failure
                setTopics(prev => prev.map(t =>
                    t.id === topicId ? { ...t, [field]: !value } : t
                ));
                toast.error('Failed to update');
            } else {
                toast.success(`Updated: ${field} → ${value ? 'ON' : 'OFF'}`);
            }
        });
    };

    // ── Bulk action — unit ke sab topics ka ek field set karo ───
    const handleBulk = async (unitId: string, field: 'isFree' | 'isLiteAccess' | 'isProAccess', value: boolean) => {
        // Optimistic update
        setTopics(prev => prev.map(t =>
            t.unitId === unitId ? { ...t, [field]: value } : t
        ));

        startTransition(async () => {
            const result = await bulkUpdateTopicAccess(unitId, field, value);
            if (!result.success) {
                toast.error('Bulk update failed');
            } else {
                toast.success(`${unitId}: All ${field} → ${value ? 'ON' : 'OFF'}`);
            }
        });
    };

    // ── Stats nikalo ────────────────────────────────────────────
    const stats = {
        total: filteredTopics.length,
        free: filteredTopics.filter(t => t.isFree).length,
        lite: filteredTopics.filter(t => t.isLiteAccess).length,
        pro: filteredTopics.filter(t => t.isProAccess !== false).length,
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
                        <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                        Topic Access Manager
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">
                        Unit wise topic access control — toggle karo, turant reflect hoga
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Free: {stats.free}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Lite: {stats.lite}
                    </Badge>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Pro: {stats.pro}
                    </Badge>
                </div>
            </div>

            {/* ── Unit Tabs ──────────────────────────────────────── */}
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                <button
                    onClick={() => setActiveUnit('all')}
                    className={`px-3 md:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                        activeUnit === 'all'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    All ({topics.length})
                </button>
                {units.map(unit => {
                    const count = topics.filter(t => t.unitId === unit).length;
                    return (
                        <button
                            key={unit}
                            onClick={() => setActiveUnit(unit)}
                            className={`px-3 md:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                                activeUnit === unit
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            U{unit.replace('unit_', '')} ({count})
                        </button>
                    );
                })}
            </div>

            {/* ── Bulk Actions (per-unit) ─────────────────────────── */}
            {activeUnit !== 'all' && (
                <Card className="border-dashed border-indigo-200 bg-indigo-50/30">
                    <CardContent className="p-3 md:p-4">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                            <Zap className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs md:text-sm font-bold text-indigo-700">Bulk:</span>
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                                <Button size="sm" variant="outline" className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                                    onClick={() => handleBulk(activeUnit, 'isFree', true)}>
                                    Free ✅
                                </Button>
                                <Button size="sm" variant="outline" className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                                    onClick={() => handleBulk(activeUnit, 'isFree', false)}>
                                    Free ❌
                                </Button>
                                <Button size="sm" variant="outline" className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                                    onClick={() => handleBulk(activeUnit, 'isLiteAccess', true)}>
                                    Lite ✅
                                </Button>
                                <Button size="sm" variant="outline" className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                                    onClick={() => handleBulk(activeUnit, 'isLiteAccess', false)}>
                                    Lite ❌
                                </Button>
                                <Button size="sm" variant="outline" className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                                    onClick={() => handleBulk(activeUnit, 'isProAccess', true)}>
                                    Pro ✅
                                </Button>
                                <Button size="sm" variant="outline" className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                                    onClick={() => handleBulk(activeUnit, 'isProAccess', false)}>
                                    Pro ❌
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Topic List (ScrollArea) ────────────────────────── */}
            <Card className="border-slate-200 shadow-sm relative">
                {isPending && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-lg">
                        <Loader2 className="animate-spin text-indigo-600" />
                    </div>
                )}
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
                    <CardTitle className="text-sm md:text-base font-semibold text-slate-700">
                        {activeUnit === 'all' ? 'All Topics' : `Unit ${activeUnit.replace('unit_', '')} Topics`}
                        <span className="text-slate-400 font-normal ml-2">({filteredTopics.length})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[60vh] md:h-[65vh]">
                        <div className="divide-y divide-slate-100">
                            {filteredTopics.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">No topics found</div>
                            ) : (
                                filteredTopics.map((topic) => (
                                    <div key={topic.id} className="p-3 md:p-4 hover:bg-slate-50/50 transition-colors">
                                        {/* ── Mobile: Card layout ──────────────── */}
                                        <div className="flex items-start gap-2 mb-2 md:mb-0">
                                            <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">
                                                {topic.unitId.replace('unit_', 'U')}#{topic.order}
                                            </Badge>
                                            <div className="min-w-0 flex-1">
                                                <span className="text-xs md:text-sm font-medium text-slate-900 line-clamp-2 md:truncate block">
                                                    {topic.title}
                                                </span>
                                                {topic.titleEn && (
                                                    <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                        {topic.titleEn}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Access Switches — horizontal row */}
                                        <div className="flex items-center gap-3 md:gap-5 mt-2 md:mt-0 ml-0 md:ml-16">
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <Switch
                                                    checked={!!topic.isFree}
                                                    onCheckedChange={(v) => handleToggle(topic.id, 'isFree', v)}
                                                    className="scale-90 md:scale-100"
                                                />
                                                <span className={`text-[10px] md:text-xs font-bold ${topic.isFree ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    Free
                                                </span>
                                            </label>

                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <Switch
                                                    checked={!!topic.isLiteAccess}
                                                    onCheckedChange={(v) => handleToggle(topic.id, 'isLiteAccess', v)}
                                                    className="scale-90 md:scale-100"
                                                />
                                                <span className={`text-[10px] md:text-xs font-bold ${topic.isLiteAccess ? 'text-blue-600' : 'text-slate-400'}`}>
                                                    Lite
                                                </span>
                                            </label>

                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <Switch
                                                    checked={topic.isProAccess !== false}
                                                    onCheckedChange={(v) => handleToggle(topic.id, 'isProAccess', v)}
                                                    className="scale-90 md:scale-100"
                                                />
                                                <span className={`text-[10px] md:text-xs font-bold ${topic.isProAccess !== false ? 'text-amber-600' : 'text-slate-400'}`}>
                                                    Pro
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
