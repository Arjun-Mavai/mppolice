import { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  language: 'en' | 'hi';
  setLanguage: (language: 'en' | 'hi') => void;
}

export const LanguageSwitcher = memo(function LanguageSwitcher({
  language,
  setLanguage,
}: LanguageSwitcherProps) {
  const handleEnglish = useCallback(() => setLanguage('en'), [setLanguage]);
  const handleHindi = useCallback(() => setLanguage('hi'), [setLanguage]);

  return (
    <div className="relative flex items-center rounded-full border border-slate-200 bg-slate-100 p-1 select-none">
      {/* Animated Background Pill */}
      <div
        className={cn(
          'ease-[var(--ease-spring-smooth)] pointer-events-none absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-transform duration-300',
          language === 'hi' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
        )}
      />

      <button
        type="button"
        onClick={handleEnglish}
        className={cn(
          'relative z-10 flex-1 rounded-full px-3 py-1.5 text-xs font-bold transition-colors duration-200 sm:px-4',
          language === 'en' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
        )}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={handleHindi}
        className={cn(
          'relative z-10 flex-1 rounded-full px-3 py-1.5 text-xs font-bold transition-colors duration-200 sm:px-4',
          language === 'hi' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
        )}
        aria-label="Switch to Hindi"
        aria-pressed={language === 'hi'}
      >
        HI
      </button>
    </div>
  );
});
