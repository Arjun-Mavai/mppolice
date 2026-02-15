'use client';

import { LayoutGrid, List, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ViewToggleProps {
  viewMode: 'grid' | 'list' | 'revision';
  setViewMode: (mode: 'grid' | 'list' | 'revision') => void;
  className?: string; // Allow custom styling/positioning
}

export function ViewToggle({ viewMode, setViewMode, className }: ViewToggleProps) {
  return (
    <div className={className}>
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
        <TabsList className="h-12 rounded-2xl bg-slate-200/50 p-1">
          <TabsTrigger
            value="grid"
            className="rounded-xl px-5 py-2 text-[10px] font-black tracking-widest uppercase shadow-slate-500/10 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=active]:shadow-lg"
          >
            <LayoutGrid className="mr-2 h-4 w-4" /> Grid
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="rounded-xl px-5 py-2 text-[10px] font-black tracking-widest uppercase shadow-slate-500/10 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=active]:shadow-lg"
          >
            <List className="mr-2 h-4 w-4" /> List
          </TabsTrigger>
          <TabsTrigger
            value="revision"
            className="rounded-xl px-5 py-2 text-[10px] font-black tracking-widest uppercase shadow-slate-500/20 transition-all data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <Sparkles className="mr-2 h-4 w-4" /> Revision
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
