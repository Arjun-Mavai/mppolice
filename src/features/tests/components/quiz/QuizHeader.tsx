"use client"

import React from 'react';
import { Clock, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuizHeaderProps {
  title?: string;
  mode: 'topic' | 'full' | 'pyq';
  timeLeft: number;
  instantModeEnabled: boolean;
  isSubmitted: boolean;
  onInstantModeToggle: () => void;
  onExit: () => void;
  translations: {
    instantMode: string;
    fullTest: string;
    topicPractice: string;
  };
  paletteButton?: React.ReactNode;
}

export function QuizHeader({
  title,
  mode,
  timeLeft,
  instantModeEnabled,
  isSubmitted,
  onInstantModeToggle,
  onExit,
  translations: t,
  paletteButton,
}: QuizHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-14 sm:h-16 bg-white/95 backdrop-blur-lg border-b border-slate-200/80 flex items-center justify-between px-3 sm:px-4 shrink-0 shadow-sm z-20">
      {/* Left: Exit + Title */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="text-slate-500 hover:text-slate-900 -ml-2 transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>

        <div className="hidden sm:flex items-center gap-2">
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <span className="font-display font-bold text-slate-900 tracking-tight text-sm sm:text-base">
            {title || <>MPPSC<span className="text-slate-700">26</span></>}
          </span>
          <Badge
            variant="outline"
            className="ml-2 border-slate-200 text-slate-500 font-medium hidden md:inline-flex text-xs"
          >
            {mode === 'full' ? t.fullTest : t.topicPractice}
          </Badge>
        </div>
      </div>

      {/* Right: Instant Mode + Timer + Palette */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Instant Mode Toggle */}
        {!isSubmitted && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 border-2 transition-all cursor-pointer select-none",
              instantModeEnabled
                ? "bg-amber-50 border-amber-400 shadow-sm shadow-amber-100"
                : "bg-slate-50 border-slate-300 hover:bg-slate-100 hover:border-slate-400"
            )}
            onClick={onInstantModeToggle}
            title="Toggle Instant Feedback"
          >
            <span className={cn(
              "text-xs font-bold uppercase flex items-center gap-1",
              instantModeEnabled ? "text-amber-700" : "text-slate-400"
            )}>
              <Zap className={cn(
                "w-3.5 h-3.5",
                instantModeEnabled ? "fill-amber-700" : "fill-slate-300 text-slate-300"
              )} />
              <span className="hidden sm:inline">{t.instantMode}</span>
            </span>
            <div className={cn(
              "w-7 h-4 rounded-full relative transition-colors bg-slate-300 shadow-inner",
              instantModeEnabled && "bg-amber-500"
            )}>
              <div className={cn(
                "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm",
                instantModeEnabled ? "left-3.5" : "left-0.5"
              )} />
            </div>
          </div>
        )}

        {/* Timer */}
        <div className={cn(
          "px-3 py-1.5 rounded-lg font-mono font-bold text-lg flex items-center gap-2 transition-colors min-w-[100px] justify-center",
          timeLeft < 60 ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-100 text-slate-900"
        )}>
          <Clock className="w-4 h-4 text-slate-400" />
          {formatTime(timeLeft)}
        </div>

        {/* Focus Mode Indicator - subtle pink dot */}
        <div className="relative hidden sm:flex items-center" title="Focus Mode Active">
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-[pulse_3s_ease-in-out_infinite] opacity-70" />
        </div>

        {/* Palette button slot (mobile only - desktop shows sidebar) */}
        <div className="lg:hidden">
          {paletteButton}
        </div>
      </div>
    </header>
  );
}
