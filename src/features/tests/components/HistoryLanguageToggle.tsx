'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

export const HistoryLanguageToggle = () => {
  const { language, setLanguage } = useSettingsStore();

  return (
    <div className="relative flex items-center rounded-full border border-slate-200 bg-slate-100 p-1 select-none">
        {/* Animated Background Pill */}
        <div
        className={cn(
            'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-spring-smooth',
            language === 'hi' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
        )}
        />
        
        <button
        onClick={() => setLanguage('en')}
        className={cn(
            'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200',
            language === 'en' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
        )}
        aria-label="Switch to English"
        >
        EN
        </button>
        <button
        onClick={() => setLanguage('hi')}
        className={cn(
            'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200',
            language === 'hi' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
        )}
        aria-label="Switch to Hindi"
        >
        HI
        </button>
    </div>
  );
};
