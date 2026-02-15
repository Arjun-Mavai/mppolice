'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Loader2 } from 'lucide-react';
import { getTopicTestStats, TopicStat } from '@/actions/getTopicTestStats';

export function TopicCoverageMatrix() {
  const [stats, setStats] = useState<Record<string, TopicStat[]> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopicTestStats().then((res) => {
      if (res.success && res.data) {
        setStats(res.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border text-slate-400">
        <Loader2 className="mr-2 animate-spin" /> Loading Matrix...
      </div>
    );
  if (!stats)
    return <div className="rounded-xl border p-6 text-slate-500">Failed to load coverage.</div>;

  const units = Object.keys(stats).sort((a, b) => {
    const numA = parseInt(a.replace('unit_', '')) || 0;
    const numB = parseInt(b.replace('unit_', '')) || 0;
    return numA - numB;
  });

  return (
    <Card className="border-slate-200 shadow-sm lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Topic Coverage Matrix</span>
          <Badge variant="outline" className="font-normal">
            Real-time DB Sync
          </Badge>
        </CardTitle>
        <CardDescription>Expand units to see uploaded questions count per topic.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px] w-full px-6">
          <Accordion type="single" collapsible className="pb-6">
            {units.map((unitId) => {
              const topics = stats[unitId] || [];
              const totalTopics = topics.length;
              const coveredTopics = topics.filter((t) => t.questionCount > 0).length;
              const coveragePercent =
                totalTopics > 0 ? Math.round((coveredTopics / totalTopics) * 100) : 0;
              const isComplete = coveragePercent === 100;

              return (
                <AccordionItem key={unitId} value={unitId} className="border-slate-100">
                  <AccordionTrigger className="py-4 hover:no-underline">
                    <div className="flex w-full items-center justify-between pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-12 w-2 rounded-full ${coveragePercent > 0 ? (isComplete ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-slate-200'}`}
                        />
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800">
                            Unit {unitId.replace('unit_', '')}
                          </p>
                          <p className="line-clamp-1 w-48 text-xs text-slate-500 md:w-auto">
                            {coveredTopics} / {totalTopics} Topics Ready
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden text-right md:block">
                          <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-amber-400'}`}
                              style={{ width: `${coveragePercent}%` }}
                            />
                          </div>
                        </div>
                        <Badge
                          variant={isComplete ? 'default' : 'outline'}
                          className={isComplete ? 'bg-emerald-600' : 'text-slate-400'}
                        >
                          {coveragePercent}%
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-2 py-2 pl-4 md:grid-cols-2">
                      {topics.map((topic) => {
                        const hasQuestions = topic.questionCount > 0;
                        return (
                          <div
                            key={topic.topicId}
                            className={`flex items-center justify-between gap-2 rounded border p-3 ${hasQuestions ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-100 bg-slate-50'}`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div
                                className={`h-2 w-2 shrink-0 rounded-full ${hasQuestions ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              />
                              <div className="space-y-0.5">
                                <p
                                  className={`max-w-[200px] truncate text-xs font-medium ${hasQuestions ? 'text-emerald-900' : 'text-slate-500'}`}
                                >
                                  {topic.topicTitle}
                                </p>
                              </div>
                            </div>
                            {hasQuestions ? (
                              <Badge
                                variant="secondary"
                                className="h-5 bg-emerald-100 text-[10px] text-emerald-700"
                              >
                                {topic.questionCount} Q
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="h-5 text-[10px] text-slate-300">
                                Empty
                              </Badge>
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
