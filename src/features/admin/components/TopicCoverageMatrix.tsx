
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import { getTopicTestStats, TopicStat } from "@/actions/getTopicTestStats";

export function TopicCoverageMatrix() {
    const [stats, setStats] = useState<Record<string, TopicStat[]> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTopicTestStats().then(res => {
            if (res.success && res.data) {
                setStats(res.data);
            }
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="h-[600px] flex items-center justify-center text-slate-400 border rounded-xl"><Loader2 className="animate-spin mr-2" /> Loading Matrix...</div>;
    if (!stats) return <div className="p-6 text-slate-500 border rounded-xl">Failed to load coverage.</div>;

    const units = Object.keys(stats).sort((a, b) => {
        const numA = parseInt(a.replace('unit_', '')) || 0;
        const numB = parseInt(b.replace('unit_', '')) || 0;
        return numA - numB;
    });

    return (
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Topic Coverage Matrix</span>
                    <Badge variant="outline" className="font-normal">Real-time DB Sync</Badge>
                </CardTitle>
                <CardDescription>Expand units to see uploaded questions count per topic.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[600px] w-full px-6">
                    <Accordion type="single" collapsible className="pb-6">
                        {units.map((unitId) => {
                            const topics = stats[unitId] || [];
                            const totalTopics = topics.length;
                            const coveredTopics = topics.filter(t => t.questionCount > 0).length;
                            const coveragePercent = totalTopics > 0 ? Math.round((coveredTopics / totalTopics) * 100) : 0;
                            const isComplete = coveragePercent === 100;

                            return (
                                <AccordionItem key={unitId} value={unitId} className="border-slate-100">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex justify-between items-center w-full pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-12 rounded-full ${coveragePercent > 0 ? (isComplete ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-slate-200'}`} />
                                                <div className="text-left">
                                                    <p className="font-bold text-slate-800 text-sm">Unit {unitId.replace('unit_', '')}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-1 w-48 md:w-auto">{coveredTopics} / {totalTopics} Topics Ready</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <div className="text-right hidden md:block">
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                        <div className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${coveragePercent}%` }} />
                                                    </div>
                                                </div>
                                                <Badge variant={isComplete ? 'default' : 'outline'} className={isComplete ? 'bg-emerald-600' : 'text-slate-400'}>
                                                    {coveragePercent}%
                                                </Badge>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid md:grid-cols-2 gap-2 pl-4 py-2">
                                            {topics.map((topic) => {
                                                const hasQuestions = topic.questionCount > 0;
                                                return (
                                                    <div key={topic.topicId} className={`flex items-center justify-between gap-2 p-3 rounded border ${hasQuestions ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <div className={`shrink-0 w-2 h-2 rounded-full ${hasQuestions ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                            <div className="space-y-0.5">
                                                                 <p className={`text-xs font-medium truncate max-w-[200px] ${hasQuestions ? 'text-emerald-900' : 'text-slate-500'}`}>{topic.topicTitle}</p>
                                                            </div>
                                                        </div>
                                                        {hasQuestions ? (
                                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 h-5 text-[10px]">{topic.questionCount} Q</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-slate-300 h-5 text-[10px]">Empty</Badge>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
