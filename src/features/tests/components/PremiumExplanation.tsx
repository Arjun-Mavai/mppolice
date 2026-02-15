'use client';

import React from 'react';
import { CheckCircle2, Lightbulb, Brain, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PremiumExplanationProps {
  explanation: string;
  explanationEn?: string | null;
  language?: 'hi' | 'en';
}

import { useSettingsStore } from '@/store/useSettingsStore';

export const PremiumExplanation: React.FC<PremiumExplanationProps> = ({
  explanation,
  explanationEn,
  language,
}) => {
  const storeLanguage = useSettingsStore((state) => state.language);
  const finalLanguage = language || storeLanguage;
  // Choose the right explanation text based on language
  // Default to 'explanation' (Hindi/Primary) if specific logic not met
  const DEFAULT_MSG =
    finalLanguage === 'hi'
      ? 'यह प्रश्न सीधे अवधारणात्मक (Conceptual) है। यदि यह गलत हुआ है, तो कृपया संबंधित विषय के मूल तथ्यों (Basics) को दोहराएं।'
      : 'This question addresses core concepts. If answered incorrectly, please review the fundamental facts of this topic.';

  const textToParse =
    (finalLanguage === 'en' && explanationEn ? explanationEn : explanation) || DEFAULT_MSG;
  // Helper to extract sections
  const extractSection = (text: string, marker: string, nextMarkers: string[]) => {
    if (!text) return null;
    const startIndex = text.indexOf(marker);
    if (startIndex === -1) return null;

    let content = text.slice(startIndex + marker.length);

    // Find the earliest next marker to end this section
    let minIndex = content.length;
    nextMarkers.forEach((nm) => {
      const idx = content.indexOf(nm);
      if (idx !== -1 && idx < minIndex) {
        minIndex = idx;
      }
    });

    return content.slice(0, minIndex).trim();
  };

  // Markers
  const MARKERS = {
    FACT: '**💡 Exam Fact',
    TIP: '**🧠 Memory Tip',
    SCAM: '**🚫 Scam Alert',
  };

  // Extract Sections
  const examFact = extractSection(textToParse, MARKERS.FACT, [MARKERS.TIP, MARKERS.SCAM]);
  const memoryTip = extractSection(textToParse, MARKERS.TIP, [MARKERS.FACT, MARKERS.SCAM]);
  const scamAlert = extractSection(textToParse, MARKERS.SCAM, [MARKERS.FACT, MARKERS.TIP]);

  // Core Logic is everything before the first marker
  // We remove the keys we found to isolate the start
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

  // Bhai markdown ke ## hashes aur ** bold markers hatao - clean text dikhao user ko
  const cleanContent = (s: string | null) => {
    if (!s) return null;
    return s
      .replace(/^(\s*(\(High Value\)|\(Mnemonic\)|\(Elimination\))?\s*)?(\*\*|:)?\s*:?\s*/, '')
      .replace(/#{1,6}\s*/g, '') // ## heading markers hatao
      .replace(/\*\*([^*]+)\*\*/g, '$1') // **bold** se sirf text rakho
      .replace(/\*([^*]+)\*/g, '$1') // *italic* se sirf text rakho
      .replace(/`([^`]+)`/g, '$1') // `code` se sirf text rakho
      .replace(/---+/g, '') // horizontal rules hatao
      .replace(/^\s*[-*]\s+/gm, '• ') // list markers ko bullet me badlo
      .trim();
  };

  const sections = {
    logic: coreLogic,
    fact: cleanContent(examFact),
    tip: cleanContent(memoryTip),
    scam: cleanContent(scamAlert),
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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
      className="space-y-5 text-left font-sans"
    >
      {/* 1. Core Logic — left accent bar flush, generous line-height */}
      {sections.logic && (
        <motion.div variants={item} className="border-l-[3px] border-emerald-500 pl-3.5 sm:pl-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-emerald-600 uppercase">
            <CheckCircle2 size={13} className="shrink-0" />{' '}
            {finalLanguage === 'hi' ? 'तर्क' : 'Core Logic'}
          </h4>
          <div className="space-y-2.5 text-[14px] leading-[1.8] font-normal tracking-[-0.005em] text-slate-800 sm:text-[15px]">
            {cleanContent(sections.logic)
              ?.split('\n')
              .filter((l) => l.trim())
              .map((line, i) => (
                <p key={i}>{line}</p>
              ))}
          </div>
        </motion.div>
      )}

      {/* 2. Exam Fact */}
      {sections.fact && (
        <motion.div variants={item} className="border-l-[3px] border-slate-700 pl-3.5 sm:pl-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-slate-600 uppercase">
            <Lightbulb size={13} className="shrink-0" />{' '}
            {finalLanguage === 'hi' ? 'एग्जाम फैक्ट' : 'Exam Fact'}
          </h4>
          <p className="text-[14px] leading-[1.8] tracking-[-0.005em] text-slate-800 sm:text-[15px]">
            {sections.fact}
          </p>
        </motion.div>
      )}

      {/* 3. Memory Tip */}
      {sections.tip && (
        <motion.div variants={item} className="border-l-[3px] border-amber-500 pl-3.5 sm:pl-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-amber-600 uppercase">
            <Brain size={13} className="shrink-0" />{' '}
            {finalLanguage === 'hi' ? 'मेमोरी टिप' : 'Memory Tip'}
          </h4>
          <p className="rounded-lg border border-amber-100/80 bg-amber-50/60 px-3 py-2.5 text-[14px] leading-[1.8] tracking-[-0.005em] text-slate-700 italic sm:text-[15px]">
            {sections.tip}
          </p>
        </motion.div>
      )}

      {/* 4. Scam Alert */}
      {sections.scam && (
        <motion.div variants={item} className="border-l-[3px] border-red-500 pl-3.5 sm:pl-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-red-600 uppercase">
            <AlertTriangle size={13} className="shrink-0" />{' '}
            {finalLanguage === 'hi' ? 'स्कैम अलर्ट' : 'Scam Alert'}
          </h4>
          <p className="text-[14px] leading-[1.8] tracking-[-0.005em] text-slate-800 sm:text-[15px]">
            {sections.scam}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
