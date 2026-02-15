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
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/5 backdrop-blur-sm transition-opacity duration-300',
        isLoading ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div
        className="animate-fade-in-up relative flex max-w-lg flex-col items-center px-6"
        style={{ animationDuration: '0.4s' }}
      >
        {/* Outer rotating ring - CSS Spin */}
        <div
          className="border-t-electric-blue border-r-electric-blue absolute inset-0 animate-spin rounded-xl border-2 border-transparent"
          style={{
            width: '72px',
            height: '72px',
            margin: 'auto',
            animationDuration: '2s',
          }}
        />

        {/* Core logo box - CSS Pulse/Glow */}
        <div
          className="from-electric-blue relative flex h-16 w-16 animate-pulse items-center justify-center rounded-xl bg-gradient-to-br to-[#00D0E0] shadow-lg"
          style={{
            boxShadow: '0 0 20px 0 rgba(0, 240, 255, 0.3)',
            animationDuration: '2s',
          }}
        >
          <span className="text-xl font-bold tracking-tighter text-white">MP</span>
        </div>

        {/* Loading text */}
        <div
          className="animate-fade-in-up absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
          style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold tracking-widest text-slate-900 uppercase">
            <div className="animate-spin" style={{ animationDuration: '1.5s' }}>
              <Loader2 className="text-electric-blue h-4 w-4" />
            </div>
            <span>Loading...</span>
          </div>
        </div>

        {/* Current Affairs Fact Card */}
        {currentFact && (
          <div
            key={currentFact.id}
            className={cn(
              'mt-24 max-w-md transform rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur-md transition-all duration-300',
              isFadingOut ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
            )}
          >
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="text-electric-blue h-4 w-4" />
              <span className="text-electric-blue text-xs font-bold tracking-wider uppercase">
                {currentFact.subject}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">{currentFact.tag}</span>
            </div>

            <h3 className="mb-2 text-base font-bold text-slate-900">{currentFact.title}</h3>

            <p className="text-sm leading-relaxed text-slate-600">{currentFact.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
