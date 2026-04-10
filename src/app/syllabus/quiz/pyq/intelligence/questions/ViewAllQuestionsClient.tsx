'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import dynamic from 'next/dynamic';

import ViewAllQuestionsClassic from './ViewAllQuestionsClassic';
import ModernViewAllQuestionsClient from './ModernViewAllQuestionsClient';

interface ViewAllQuestionsClientProps {
  unitId: string;
  unitTitle: string;
  questions: any[];
  source: 'paper' | 'overall' | 'topic' | 'subject';
  topicTitle?: string;
  year?: number;
  subject?: string;
}

export default function ViewAllQuestionsClient(props: ViewAllQuestionsClientProps) {
  const { uiMode, language } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const isHindi = language === 'hi';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={uiMode === 'modern' ? 'min-h-screen bg-[#F5F5F7]' : 'min-h-screen bg-[#080510]'} />
    );
  }

  if (uiMode === 'modern') {
    return <ModernViewAllQuestionsClient {...props} isHindi={isHindi} />;
  }

  return <ViewAllQuestionsClassic {...props} />;
}
