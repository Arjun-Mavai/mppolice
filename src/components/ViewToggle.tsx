"use client";

import { LayoutGrid, List, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewToggleProps {
    viewMode: 'grid' | 'list' | 'revision';
    setViewMode: (mode: 'grid' | 'list' | 'revision') => void;
    className?: string; // Allow custom styling/positioning
}

export function ViewToggle({ viewMode, setViewMode, className }: ViewToggleProps) {
  return (
    <div className={className}>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
            <TabsList className="bg-slate-200/50 p-1 rounded-2xl h-12">
                <TabsTrigger value="grid" className="px-5 py-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=active]:shadow-lg shadow-slate-500/10 transition-all font-black text-[10px] uppercase tracking-widest">
                    <LayoutGrid className="w-4 h-4 mr-2" /> Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="px-5 py-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=active]:shadow-lg shadow-slate-500/10 transition-all font-black text-[10px] uppercase tracking-widest">
                    <List className="w-4 h-4 mr-2" /> List
                </TabsTrigger>
                <TabsTrigger value="revision" className="px-5 py-2 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-slate-500/20 transition-all font-black text-[10px] uppercase tracking-widest">
                    <Sparkles className="w-4 h-4 mr-2" /> Revision
                </TabsTrigger>
            </TabsList>
        </Tabs>
    </div>
  );
}

