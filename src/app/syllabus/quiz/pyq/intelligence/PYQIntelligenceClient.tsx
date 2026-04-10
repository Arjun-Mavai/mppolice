'use client';

import { useSettingsStore } from '@/store/useSettingsStore';
import { UnitDistributionStats, RepeatedQuestion, TopicStat, SubjectDistributionStats, OverallWeightageSubjectData } from '@/actions/pyq-analytics';
import PYQIntelligenceClassic from './PYQIntelligenceClassic';
import ModernIntelligenceClient from './components/modern/ModernIntelligenceClient';
import { Moon, Sun, Sparkles, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface PYQIntelligenceClientProps {
  subjectStats: SubjectDistributionStats[];
  stats: UnitDistributionStats[];
  repeatedQuestions: RepeatedQuestion[];
  topicStats: Record<string, TopicStat[]>;
  simpleSubjectStats: Record<string, number>;
  subjectQuestionsData: OverallWeightageSubjectData[];
}

export default function PYQIntelligenceClient(props: PYQIntelligenceClientProps) {
  const { uiMode, setUiMode } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative">
      {/* Universal Floating Toggle */}
      <div className="fixed top-24 right-6 z-[100] sm:top-28">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center gap-2 rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur-xl shadow-2xl"
        >
          <button
            onClick={() => setUiMode('classic')}
            className={cn(
              "flex h-8 w-12 items-center justify-center rounded-full transition-all duration-300",
              uiMode === 'classic' 
                ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                : "text-slate-400 hover:text-white"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setUiMode('modern')}
            className={cn(
              "flex h-8 w-12 items-center justify-center rounded-full transition-all duration-300",
              uiMode === 'modern' 
                ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                : "text-slate-400 hover:text-white"
            )}
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {uiMode === 'modern' ? (
          <motion.div
            key="modern"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ModernIntelligenceClient {...props} />
          </motion.div>
        ) : (
          <motion.div
            key="classic"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <PYQIntelligenceClassic {...props} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
