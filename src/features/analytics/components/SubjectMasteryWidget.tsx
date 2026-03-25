'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

interface SubjectMasteryWidgetProps {
  mastery: {
    id: string;
    name: string;
    nameEn?: string;
    percentage: number;
  }[];
  className?: string;
}

export function SubjectMasteryWidget({ mastery, className }: SubjectMasteryWidgetProps) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  const strongSubjects = mastery.filter((m) => m.percentage >= 70);
  const weakSubjects = mastery.filter((m) => m.percentage < 60);

  return (
    <Card className={cn("overflow-hidden border border-slate-800 bg-[#020617] text-white shadow-2xl shadow-indigo-500/10", className)}>
      <CardHeader className="border-b border-white/5 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-sm font-black tracking-tight text-white/90">
              {hi ? 'विषयवार प्रवीणता' : 'Subject Mastery'}
            </CardTitle>
          </div>
          <Badge className="h-5 border-emerald-500/30 bg-emerald-500/10 text-[9px] font-black uppercase text-emerald-400">
            {hi ? 'सभी प्रयास' : 'All Attempts'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <Tabs defaultValue="strong" className="w-full">
          <TabsList className="mb-5 grid w-full grid-cols-2 bg-white/10 p-1">
            <TabsTrigger
              value="strong"
              className="rounded-lg text-[9px] font-black tracking-widest uppercase transition-all text-slate-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-white hover:text-white/80"
            >
              {hi ? 'मजबूत विषय' : 'Strong'}
            </TabsTrigger>
            <TabsTrigger
              value="weak"
              className="rounded-lg text-[9px] font-black tracking-widest uppercase transition-all text-slate-400 data-[state=active]:bg-rose-500 data-[state=active]:text-white hover:text-white/80"
            >
              {hi ? 'कमजोर विषय' : 'Weak'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strong">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-5">
                {strongSubjects.length > 0 ? (
                  strongSubjects.map((sub) => (
                    <div key={sub.id} className="group space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-400 transition-colors group-hover:text-white">
                          {hi ? sub.name : sub.nameEn || sub.name}
                        </span>
                        <span className="font-black text-emerald-400">{sub.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${sub.percentage}%` }}
                          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-[200px] flex-col items-center justify-center text-center text-[10px] text-slate-600 italic">
                    {hi ? 'अभी कोई मजबूत विषय नहीं मिला है।' : 'No strong areas identified yet.'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="weak">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-5">
                {weakSubjects.length > 0 ? (
                  weakSubjects.map((sub) => (
                    <div key={sub.id} className="group space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-400 transition-colors group-hover:text-white">
                          {hi ? sub.name : sub.nameEn || sub.name}
                        </span>
                        <span className="font-black text-rose-400">{sub.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${sub.percentage}%` }}
                          className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-[200px] flex-col items-center justify-center text-center text-[10px] text-slate-600 italic">
                    {hi ? 'शानदार! कोई कमजोर विषय नहीं है।' : 'Great! No weak areas identified.'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
