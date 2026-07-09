'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Loader2, Database, Zap, BookOpen, Layers } from 'lucide-react';
import { getTopicTestStats, ExamCoverageStats } from '@/actions/getTopicTestStats';
import { getSectionLabel } from '@/data/mppoliceSyllabus';

export function TopicCoverageMatrix() {
  const { data, isLoading: loading } = useQuery<ExamCoverageStats | null>({
    queryKey: ['admin-topic-coverage'],
    queryFn: async () => {
      const res = await getTopicTestStats();
      if (res.success && res.data) {
        return res.data as ExamCoverageStats;
      }
      return null;
    }
  });

  if (loading)
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border text-slate-400">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-800">Syncing Constable Syllabus...</p>
        </div>
      </div>
    );

  if (!data)
    return <div className="rounded-xl border p-6 text-slate-500">Failed to load coverage.</div>;

  const sections = data.sections;
  const unitIds = Object.keys(sections).sort();

  return (
    <div className="space-y-6">
      {/* 🚀 Specialized Test Trackers */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 px-6 pt-6">
        <TrackerCard 
          icon={<Database className="h-4 w-4 text-amber-500" />} 
          title="PYP / Official" 
          value={data.pypCount} 
          subtitle="Past Year Papers"
        />
        <TrackerCard 
          icon={<Zap className="h-4 w-4 text-emerald-500" />} 
          title="Memory Based" 
          value={data.memoryCount} 
          subtitle="Mock / Recall Tests"
        />
        <TrackerCard 
          icon={<Layers className="h-4 w-4 text-indigo-500" />} 
          title="Subject-wise" 
          value={data.subjectWiseCount} 
          subtitle="Variety / Unit Tests"
        />
      </div>

      <Card className="border-none shadow-none lg:col-span-2">
        <CardHeader className="px-6">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              Chapter-wise Progress (Constable Syllabus)
            </span>
            <Badge variant="outline" className="font-bold border-emerald-100 text-emerald-700 bg-emerald-50">
              MP Police 2024 Ingestion
            </Badge>
          </CardTitle>
          <CardDescription>Expand subjects to track completion of individual chapters.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[550px] w-full px-6">
            <Accordion type="single" collapsible className="pb-6">
              {unitIds.map((unitId) => {
                const topics = sections[unitId] || [];
                const totalTopics = topics.length;
                const coveredTopics = topics.filter((t) => t.questionCount > 0).length;
                const coveragePercent =
                  totalTopics > 0 ? Math.round((coveredTopics / totalTopics) * 100) : 0;
                const isComplete = coveragePercent === 100;
                const sectionNameHi = getSectionLabel(unitId, 'hi');
                const sectionNameEn = getSectionLabel(unitId, 'en');

                return (
                  <AccordionItem key={unitId} value={unitId} className="border-slate-100">
                    <AccordionTrigger className="py-4 hover:no-underline px-2 rounded-lg hover:bg-slate-50/50 transition-all">
                      <div className="flex w-full items-center justify-between pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-12 w-2 rounded-full transition-all ${coveragePercent > 0 ? (isComplete ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-400') : 'bg-slate-200'}`}
                          />
                          <div className="text-left">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                              {sectionNameEn}
                            </p>
                            <p className="line-clamp-1 text-sm font-bold text-slate-800">
                              {sectionNameHi}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500">
                              {coveredTopics} / {totalTopics} Chapters Ready
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="hidden text-right md:block">
                            <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full transition-all duration-700 ${isComplete ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                style={{ width: `${coveragePercent}%` }}
                              />
                            </div>
                          </div>
                          <Badge
                            variant={isComplete ? 'default' : 'outline'}
                            className={`min-w-[45px] justify-center ${isComplete ? 'bg-emerald-600' : 'text-slate-400 border-slate-200 font-bold'}`}
                          >
                            {coveragePercent}%
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <div className="grid gap-2 py-2 pl-4 md:grid-cols-2">
                        {topics.map((topic) => {
                          const hasQuestions = topic.questionCount > 0;
                          return (
                            <div
                              key={topic.topicId}
                              className={`flex items-center justify-between gap-2 rounded-xl border p-3 transition-all ${hasQuestions ? 'border-emerald-100 bg-emerald-50/50 shadow-sm' : 'border-slate-100 bg-slate-50/50'}`}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div
                                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${hasQuestions ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-100' : 'bg-slate-300'}`}
                                />
                                <div className="space-y-0.5">
                                  <p
                                    className={`line-clamp-1 text-[11px] font-bold ${hasQuestions ? 'text-emerald-900' : 'text-slate-400 font-medium'}`}
                                  >
                                    {topic.topicTitle}
                                  </p>
                                </div>
                              </div>
                              {hasQuestions ? (
                                <Badge
                                  className="h-5 bg-emerald-600 text-[10px] font-black text-white hover:bg-emerald-700"
                                >
                                  {topic.questionCount} Q
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="h-5 text-[9px] font-bold text-slate-300 border-slate-200">
                                  EMPTY
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
    </div>
  );
}

function TrackerCard({ icon, title, value, subtitle }: { icon: React.ReactNode, title: string, value: number, subtitle: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-black text-slate-900">{value}</p>
          <p className="text-[9px] font-bold text-emerald-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
