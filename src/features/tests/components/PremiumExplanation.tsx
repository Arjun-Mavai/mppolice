'use client';

import React from 'react';
import { CheckCircle2, Lightbulb, Brain, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PremiumExplanationProps {
  explanation: string;
  explanationEn?: string | null;
  language?: 'hi' | 'en';
  /** When true, Core Logic renders without a border-box — plain text, more space on small screens */
  compact?: boolean;
  /** Adapts text colors for dark backgrounds (e.g. PYQ Analysis pages) */
  darkMode?: boolean;
}

import { useSettingsStore } from '@/store/useSettingsStore';

export const PremiumExplanation: React.FC<PremiumExplanationProps> = ({
  explanation,
  explanationEn,
  language,
  compact = false,
  darkMode = false,
}) => {
  const storeLanguage = useSettingsStore((state) => state.language);
  const finalLanguage = language || storeLanguage;

  const DEFAULT_MSG =
    finalLanguage === 'hi'
      ? 'यह प्रश्न सीधे अवधारणात्मक (Conceptual) है। यदि यह गलत हुआ है, तो कृपया संबंधित विषय के मूल तथ्यों (Basics) को दोहराएं।'
      : 'This question addresses core concepts. If answered incorrectly, please review the fundamental facts of this topic.';

  const textToParse =
    (finalLanguage === 'en' && explanationEn ? explanationEn : explanation) || DEFAULT_MSG;

  const extractSection = (text: string, marker: string, nextMarkers: string[]) => {
    if (!text) return null;
    const startIndex = text.indexOf(marker);
    if (startIndex === -1) return null;

    let content = text.slice(startIndex + marker.length);
    let minIndex = content.length;
    nextMarkers.forEach((nm) => {
      const idx = content.indexOf(nm);
      if (idx !== -1 && idx < minIndex) {
        minIndex = idx;
      }
    });

    return content.slice(0, minIndex).trim();
  };

  const MARKERS = {
    FACT: '**💡 Exam Fact',
    TIP: '**🧠 Memory Tip',
    SCAM: '**🚫 Scam Alert',
  };

  const examFact = extractSection(textToParse, MARKERS.FACT, [MARKERS.TIP, MARKERS.SCAM]);
  const memoryTip = extractSection(textToParse, MARKERS.TIP, [MARKERS.FACT, MARKERS.SCAM]);
  const scamAlert = extractSection(textToParse, MARKERS.SCAM, [MARKERS.FACT, MARKERS.TIP]);

  let coreLogic = textToParse;
  const allMarkers = [MARKERS.FACT, MARKERS.TIP, MARKERS.SCAM];
  let firstMarkerIndex = coreLogic.length;

  allMarkers.forEach((m) => {
    const idx = coreLogic.indexOf(m);
    if (idx !== -1 && idx < firstMarkerIndex) {
      firstMarkerIndex = idx;
    }
  });

  coreLogic = coreLogic.slice(0, firstMarkerIndex).trim();

  const cleanContent = (s: string | null) => {
    if (!s) return null;
    return s
      .replace(/^(\s*(\(High Value\)|\(Mnemonic\)|\(Elimination\))?\s*)?(\*\*|:)?\s*:?\s*/, '')
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/---+/g, '')
      .replace(/^\s*[-*]\s+/gm, '• ')
      .trim();
  };

  const sections = {
    logic: coreLogic,
    fact: cleanContent(examFact),
    tip: cleanContent(memoryTip),
    scam: cleanContent(scamAlert),
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3.5 text-left font-sans"
    >
      {/* 1. Core Logic */}
      {sections.logic && (
        <motion.div variants={item}>
          {compact ? (
            /* Compact mode: no border-box — full-width plain text with generous line height */
            <div className={cn(
              "space-y-2 text-[15px] leading-loose font-bold tracking-tight sm:text-[16px]",
              darkMode ? "text-slate-300 [text-shadow:none]" : "text-slate-800 [text-shadow:1px_1px_2px_rgba(0,0,0,0.08)]"
            )}>
              {sections.logic
                ?.split('\n')
                .filter((l) => l.trim())
                .map((line, i) => (
                  <p key={i}>{cleanContent(line)}</p>
                ))}
            </div>
          ) : (
            /* Default: left accent border */
            <div className="border-l-2 border-emerald-500 pl-3">
              <h4 className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-widest text-emerald-600 uppercase">
                <CheckCircle2 size={12} className="shrink-0" />{' '}
                {finalLanguage === 'hi' ? 'तर्क' : 'Core Logic'}
              </h4>
              <div className={cn(
                "space-y-2 text-[14px] leading-relaxed font-bold tracking-tight sm:text-[15px]",
                darkMode ? "text-slate-300 [text-shadow:none]" : "text-slate-800 [text-shadow:1px_1px_2px_rgba(0,0,0,0.05)]"
              )}>
                {sections.logic
                  ?.split('\n')
                  .filter((l) => l.trim())
                  .map((line, i) => (
                    <p key={i}>{cleanContent(line)}</p>
                  ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 2. Exam Fact */}
      {sections.fact && (
        <motion.div variants={item} className="border-l-2 border-slate-700 pl-3">
          <h4 className={cn(
            "mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase",
            darkMode ? "text-slate-400" : "text-slate-600"
          )}>
            <Lightbulb size={12} className="shrink-0" />{' '}
            {finalLanguage === 'hi' ? 'एग्जाम फैक्ट' : 'Exam Fact'}
          </h4>
          <p className={cn(
            "text-[14px] leading-relaxed font-bold tracking-tight sm:text-[15px]",
            darkMode ? "text-slate-300 [text-shadow:none]" : "text-slate-800 [text-shadow:1px_1px_2px_rgba(0,0,0,0.05)]"
          )}>
            {sections.fact}
          </p>
        </motion.div>
      )}

      {/* 3. Memory Tip */}
      {sections.tip && (
        <motion.div variants={item} className="border-l-2 border-amber-500 pl-3">
          <h4 className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-widest text-amber-600 uppercase">
            <Brain size={12} className="shrink-0" />{' '}
            {finalLanguage === 'hi' ? 'मेमोरी टिप' : 'Memory Tip'}
          </h4>
          <p className={cn(
            "rounded-xl border px-3 py-2 text-[14px] leading-relaxed font-bold tracking-tight italic sm:text-[15px]",
            darkMode 
              ? "border-amber-500/20 bg-amber-500/10 text-amber-200/90 [text-shadow:none]" 
              : "border-amber-100/50 bg-amber-50/40 text-slate-700 [text-shadow:1px_1px_2px_rgba(0,0,0,0.05)]"
          )}>
            {sections.tip}
          </p>
        </motion.div>
      )}

      {/* 4. Scam Alert */}
      {sections.scam && (
        <motion.div variants={item} className="border-l-2 border-red-500 pl-3">
          <h4 className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-widest text-red-600 uppercase">
            <AlertTriangle size={12} className="shrink-0" />{' '}
            {finalLanguage === 'hi' ? 'स्कैम अलर्ट' : 'Scam Alert'}
          </h4>
          <p className={cn(
            "text-[14px] leading-relaxed font-bold tracking-tight sm:text-[15px]",
            darkMode ? "text-slate-300 [text-shadow:none]" : "text-slate-800 [text-shadow:1px_1px_2px_rgba(0,0,0,0.05)]"
          )}>
            {sections.scam}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
