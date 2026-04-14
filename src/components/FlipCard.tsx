'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lightbulb, RotateCw, Zap, Target, Sparkles, Lock } from 'lucide-react';

export interface FlipCardProps {
  // Data Props
  id: string | number;
  title?: string; // Optional if stemHi is provided
  subtitle?: string; // e.g. "01" or "History of MP"

  // One-Liner Specific (Optional)
  stemHi?: string;
  stemEn?: string;
  answerHi?: string;
  answerEn?: string;
  extendedData?: any;

  // Back Side Data
  backTitle?: string; // e.g. "Topic Analysis"
  backMainContent?: string; // Summary text
  facts?: string[]; // Bullet points
  mnemonic?: string;

  // Visuals
  image?: string;
  impactEmoji?: string;

  // State / Logic
  isLocked?: boolean;
  className?: string; // Wrapper class
  showFooter?: boolean;
  frontClassName?: string;
  backClassName?: string;

  // Handlers
  onFlip?: (id: string | number) => void;
  isFlipped?: boolean; // Controlled state
  onPracticeTest?: () => void;
  onReadMore?: () => void;

  // Labels (for bilingual support)
  language?: 'hi' | 'en';
  labels?: {
    tapToFlip: string;
    topicAnalysis: string;
    mnemonicLabel: string;
    practiceTest: string;
    closeAnalysis: string;
  };
  frontActions?: React.ReactNode;
}

const FlipCard: React.FC<FlipCardProps> = ({
  id,
  title,
  subtitle = '01',
  stemHi,
  stemEn,
  answerHi,
  answerEn,
  extendedData,
  backTitle,
  backMainContent,
  facts,
  mnemonic,
  image,
  impactEmoji,
  isLocked = false,
  className,
  showFooter = true,
  onFlip,
  isFlipped,
  onPracticeTest,
  onReadMore,
  labels = {
    tapToFlip: 'Tap to Flip',
    topicAnalysis: 'Fact Analysis',
    mnemonicLabel: 'Memory Tip',
    practiceTest: 'Practice Mode',
    closeAnalysis: 'Close',
  },
  frontClassName,
  backClassName,
  language = 'hi',
  frontActions,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const flipped = isFlipped !== undefined ? isFlipped : internalFlipped;

  // content resolution
  const isLanguageHindi = language === 'hi';
  const displayTitle = isLanguageHindi 
    ? (title || stemHi || 'MP Police Fact')
    : (stemEn || title || 'MP Police Fact');
    
  const displayAnswer = isLanguageHindi ? (answerHi || '') : (answerEn || answerHi || '');
  
  const finalFacts = isLanguageHindi 
    ? (facts || extendedData?.facts || [])
    : (extendedData?.factsEn || facts || extendedData?.facts || []);
    
  const finalMnemonic = isLanguageHindi
    ? (mnemonic || extendedData?.memoryTip || '')
    : (extendedData?.memoryTipEn || mnemonic || extendedData?.memoryTip || '');

  const handleFlip = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    // If locked, clicking acts as "Read More" (which handles lock check in parent -> opens modal)
    if (isLocked) {
      if (onReadMore) onReadMore();
      return;
    }

    if (isAnimating) return;

    if (onFlip) {
      onFlip(id);
    } else {
      setInternalFlipped(!internalFlipped);
    }
    setIsAnimating(true);
  };

  const handlePracticeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPracticeTest) onPracticeTest();
  };

  return (
    <div
      className={cn('group perspective-2000 relative h-[500px] w-full cursor-pointer', className)}
      onClick={handleFlip}
    >
      <motion.div
        className="preserve-3d h-full w-full rounded-[2.5rem] shadow-2xl duration-700"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 150, damping: 20 }}
        onAnimationComplete={() => setIsAnimating(false)}
      >
        {/* FRONT SIDE (UNCHANGED MOSTLY) */}
        <div
          className={cn(
            'absolute h-full w-full rounded-[2.5rem] backface-hidden',
            'border border-slate-200 bg-white shadow-xl',
            'flex flex-col items-center justify-between p-8 sm:p-10',
            'transition-all duration-500 group-hover:border-slate-200 group-hover:shadow-slate-500/10',
            isLocked && 'opacity-90 grayscale-[0.8]',
            flipped && 'pointer-events-none', // 🛡️ Prevent click-through when flipped
            frontClassName
          )}
        >
          <div className="flex w-full items-start justify-between opacity-30">
            <Target size={32} className="text-slate-400" />
          </div>

          <div className="relative z-10 flex w-full flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 -rotate-3 items-center justify-center rounded-3xl bg-slate-900 shadow-2xl transition-transform duration-500 group-hover:-rotate-6">
              {impactEmoji ? (
                <span className="text-4xl">{impactEmoji}</span>
              ) : (
                <Sparkles className="h-8 w-8 text-white" />
              )}
            </div>

            <h3
              className={cn(
                'text-2xl leading-tight font-black tracking-tight text-slate-900 md:text-3xl',
                displayTitle.length > 20 ? 'text-xl md:text-2xl' : ''
              )}
            >
              {displayTitle}
            </h3>

            {isLocked && (
              <div className="inline-flex items-center rounded-lg border border-pink-200 bg-gradient-to-r from-red-100 via-pink-100 to-amber-100 px-3 py-1.5 text-xs font-black tracking-widest text-amber-600 uppercase">
                <Lock className="mr-2 h-3.5 w-3.5 animate-pulse" /> Premium
              </div>
            )}
            
            {/* FRONT ACTIONS (e.g. Mark Revised) */}
            {frontActions && (
              <div className="mt-4 flex w-full justify-center">
                {frontActions}
              </div>
            )}
          </div>

          <div className="flex w-full justify-center">
            <span className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-5 py-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase transition-colors group-hover:bg-slate-50 group-hover:text-slate-700">
              <RotateCw
                size={12}
                className="transition-transform duration-700 group-hover:rotate-180"
              />
              {labels.tapToFlip}
            </span>
          </div>
        </div>

        {/* BACK SIDE (REDESIGNED) */}
        <div
          className={cn(
            'absolute h-full w-full rotate-y-180 rounded-[2.5rem] backface-hidden',
            'border border-slate-800 bg-[#0F172A] shadow-2xl shadow-slate-950/20', // Darker premium bg
            'flex flex-col justify-between overflow-hidden p-8',
            !flipped && 'pointer-events-none', // 🛡️ Prevent accidental clicks when showing front
            backClassName
          )}
        >
          {/* Header & Answer Section */}
          <div className="relative z-10 shrink-0 space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
              {labels.topicAnalysis}
            </div>
            
            <h4 className="line-clamp-3 text-xl leading-snug font-bold tracking-tight text-white/90">
              {backTitle || displayTitle}
            </h4>
            
            {/* BIG BOLD HIGHLIGHTED ANSWER */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 shadow-inner">
               <p className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                 {displayAnswer}
               </p>
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50 mt-1 block">{isLanguageHindi ? 'जवाब' : 'ANSWER'}</span>
            </div>
            
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Main Content - SCROLLABLE ANALYSIS */}
          <div className="no-scrollbar relative z-10 h-0 min-h-0 flex-1 space-y-4 overflow-y-auto pt-4 pb-8">
            {finalFacts.length > 0 && (
              <ul className="space-y-3">
                {finalFacts.map((fact: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-4 rounded-2xl border border-white/5 bg-slate-800/50 p-4 transition-colors hover:bg-slate-800"
                  >
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    <span className="text-sm leading-relaxed font-medium text-slate-300">
                      {fact}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {finalMnemonic && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-900/20 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Lightbulb size={12} className="text-amber-500" />
                  <span className="text-[10px] font-black tracking-wider text-amber-500 uppercase">
                    {labels.mnemonicLabel}
                  </span>
                </div>
                <div className="text-sm font-bold text-amber-100/90 italic">
                  &quot;{finalMnemonic}&quot;
                </div>
              </div>
            )}

            {!finalFacts.length && !finalMnemonic && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Zap className="h-8 w-8 text-slate-700 mb-2" />
                    <p className="text-sm text-slate-500 italic">No extra analysis for this fact</p>
                </div>
            )}
          </div>

          {/* Footer Actions */}
          {showFooter && (
            <div className="relative z-20 mt-auto flex flex-col gap-3 border-t border-white/5 pt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onReadMore) onReadMore();
                }}
                className="h-12 w-full rounded-xl border border-white/10 bg-slate-800 text-[10px] font-black tracking-wider text-white uppercase transition-colors hover:bg-slate-700"
              >
                Read More
              </button>

              <button
                onClick={handlePracticeClick}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-indigo-600 text-[10px] font-black tracking-wider text-white uppercase shadow-lg shadow-slate-600/20 transition-all hover:scale-[1.02] hover:shadow-slate-600/40"
              >
                <Zap size={14} className="fill-white" />
                {labels.practiceTest}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default FlipCard;
