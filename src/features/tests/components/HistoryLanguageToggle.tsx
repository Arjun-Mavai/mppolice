'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

export const HistoryLanguageToggle = () => {
  const { language, setLanguage } = useSettingsStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
      className="flex items-center gap-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
    >
      <Languages className="h-4 w-4" />

      {/* Mobile Text (Abbreviated) */}
      <span className="text-xs font-bold tracking-wider uppercase sm:hidden">
        {language === 'en' ? 'HI' : 'EN'}
      </span>

      {/* Desktop Text (Full) */}
      <span className="hidden text-xs font-bold tracking-wider uppercase sm:inline">
        {language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
      </span>
    </Button>
  );
};
