'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, BookOpen } from 'lucide-react';
import { getRandomFact, type CurrentAffairsFact } from '@/data/current-affairs-data';
import { cn } from '@/lib/utils';

interface GlobalLoaderProps {
  isLoading?: boolean;
}

export default function GlobalLoader({ isLoading = true }: GlobalLoaderProps) {
  const [mounted, setMounted] = useState(false);
  const [currentFact, setCurrentFact] = useState<CurrentAffairsFact | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set initial fact
    setCurrentFact(getRandomFact());

    // Rotate facts every 4 seconds
    const interval = setInterval(() => {
      // Trigger fade out
      setIsFadingOut(true);
      
      // Wait for fade out, then swap fact and fade in
      setTimeout(() => {
        setCurrentFact(getRandomFact());
        setIsFadingOut(false);
      }, 300); // 300ms transition match
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted || !isLoading) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/5 backdrop-blur-sm transition-opacity duration-300",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div
        className="relative flex flex-col items-center max-w-lg px-6 animate-fade-in-up"
        style={{ animationDuration: '0.4s' }}
      >
        {/* Outer rotating ring - CSS Spin */}
        <div
          className="absolute inset-0 rounded-xl border-2 border-transparent border-t-electric-blue border-r-electric-blue animate-spin"
          style={{
            width: '72px',
            height: '72px',
            margin: 'auto',
            animationDuration: '2s',
          }}
        />

        {/* Core logo box - CSS Pulse/Glow */}
        <div
          className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-electric-blue to-[#00D0E0] flex items-center justify-center shadow-lg animate-pulse"
          style={{
            boxShadow: '0 0 20px 0 rgba(0, 240, 255, 0.3)',
            animationDuration: '2s',
          }}
        >
          <span className="text-white font-bold text-xl tracking-tighter">MP</span>
        </div>

        {/* Loading text */}
        <div
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap animate-fade-in-up"
          style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm uppercase tracking-widest">
            <div className="animate-spin" style={{ animationDuration: '1.5s' }}>
              <Loader2 className="w-4 h-4 text-electric-blue" />
            </div>
            <span>Loading...</span>
          </div>
        </div>

        {/* Current Affairs Fact Card */}
        {currentFact && (
          <div
            key={currentFact.id}
            className={cn(
              "mt-24 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-200 max-w-md transition-all duration-300 transform",
              isFadingOut ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-electric-blue" />
              <span className="text-xs font-bold text-electric-blue uppercase tracking-wider">
                {currentFact.subject}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">{currentFact.tag}</span>
            </div>
            
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {currentFact.title}
            </h3>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              {currentFact.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
