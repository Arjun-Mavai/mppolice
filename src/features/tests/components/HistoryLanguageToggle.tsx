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
            className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
            <Languages className="w-4 h-4" />
            
            {/* Mobile Text (Abbreviated) */}
            <span className="text-xs font-bold uppercase tracking-wider sm:hidden">
                {language === 'en' ? 'HI' : 'EN'}
            </span>
            
            {/* Desktop Text (Full) */}
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
                {language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            </span>
        </Button>
    );
};
