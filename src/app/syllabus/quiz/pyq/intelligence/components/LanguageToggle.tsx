'use client';

import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useSettingsStore();
  const isHindi = language === 'hi';

  const toggleLanguage = () => {
    setLanguage(isHindi ? 'en' : 'hi');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200"
    >
      <Languages className="h-4 w-4 mr-2" />
      {isHindi ? 'English' : 'हिंदी'}
    </Button>
  );
}