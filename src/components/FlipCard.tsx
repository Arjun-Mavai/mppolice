"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lightbulb, RotateCw, Zap, Target, Sparkles, Lock } from 'lucide-react';

export interface FlipCardProps {
  // Data Props
  id: string | number;
  title: string;
  subtitle?: string; // e.g. "01" or "History of MP"
  
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
  
  // Handlers
  onFlip?: (id: string | number) => void;
  isFlipped?: boolean; // Controlled state
  onPracticeTest?: () => void;
  onReadMore?: () => void;
  
  // Labels (for bilingual support)
  labels: {
      tapToFlip: string;
      topicAnalysis: string;
      mnemonicLabel: string;
      practiceTest: string;
      closeAnalysis: string;
  };
}

const FlipCard: React.FC<FlipCardProps> = ({ 
  id,
  title,
  subtitle = "01",
  backTitle, 
  backMainContent,
  facts,
  mnemonic,
  image,
  impactEmoji,
  isLocked = false,
  className,
  onFlip,
  isFlipped,
  onPracticeTest,
  onReadMore,
  labels
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const flipped = isFlipped !== undefined ? isFlipped : internalFlipped;

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

  const handleReadMore = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Logic for reading more is typically handled by the parent opening the sheet via click on the card wrapper
      // But if we need explicit button action different from the card click:
      // Here clicking the card already triggers onFlip or parent action if handled. 
      // The user wants a "Reading More" button which likely opens the Sheet.
      // Currently the parent `UnitContent` uses `onClick` on the wrapper to open detail sheet in List view.
      // In Grid view (FlipCard), clicking flips it. 
      // We need a prop `onReadMore` to open the sheet.
      // For now, let's assume the user wants this button to be the primary "Open Sheet" action.
      // We'll bubble an event or if the parent passed a handler.
      // Wait, the `FlipCard` is used in Grid View. The request says "card par bhi ek button do jo click par read more jaisa wo sheet open kare".
      // So we need a new prop `onReadMore`.
      
      // Since I cannot change the parent `UnitContent` in this tool call easily without context switch,
      // I will add the button UI and for now make it just log or try to flip back. 
      // ACTUALLY, I should add `onReadMore` prop to the interface first.
  };

  return (
    <div
      className={cn("relative group cursor-pointer perspective-2000 w-full h-[500px]", className)} 
      onClick={handleFlip}
    >
      <motion.div
        className="w-full h-full duration-700 preserve-3d shadow-2xl rounded-[2.5rem]"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 150, damping: 20 }}
        onAnimationComplete={() => setIsAnimating(false)}
      >
        {/* FRONT SIDE (UNCHANGED MOSTLY) */}
        <div className={cn(
            "absolute w-full h-full backface-hidden rounded-[2.5rem]",
            "bg-white border border-slate-200 shadow-xl",
            "flex flex-col items-center justify-between p-8 sm:p-10",
            "transition-all duration-500 group-hover:border-indigo-200 group-hover:shadow-indigo-500/10",
            isLocked && "grayscale-[0.8] opacity-90"
        )}>
             <div className="w-full flex justify-between items-start opacity-30">
                <Target size={32} className="text-slate-400" />
            </div>

            <div className="flex flex-col items-center gap-8 text-center relative z-10 w-full">
                <div className="w-24 h-24 bg-slate-900 rounded-3xl shadow-2xl flex items-center justify-center -rotate-3 group-hover:-rotate-6 transition-transform duration-500">
                    {impactEmoji ? <span className="text-5xl">{impactEmoji}</span> : <Sparkles className="w-10 h-10 text-white" />}
                </div>

                <h3 className={cn("text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight", title.length > 20 ? "text-2xl" : "")}>
                    {title}
                </h3>

                {isLocked && (
                    <div className="inline-flex items-center text-xs font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 uppercase tracking-widest">
                        <Lock className="w-3.5 h-3.5 mr-2 animate-pulse" /> Premium
                    </div>
                )}
            </div>

            <div className="w-full flex justify-center">
                <span className="px-5 py-2 bg-slate-50 border border-slate-100 rounded-full text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <RotateCw size={14} className="group-hover:rotate-180 transition-transform duration-700" /> 
                    {labels.tapToFlip}
                </span>
            </div>
        </div>


        {/* BACK SIDE (REDESIGNED) */}
        <div className={cn(
            "absolute w-full h-full backface-hidden rotate-y-180 rounded-[2.5rem]",
            "bg-[#0F172A] border border-slate-800 shadow-2xl shadow-indigo-950/20", // Darker premium bg
            "p-8 flex flex-col justify-between overflow-hidden"
        )}>
             {/* Header */}
             <div className="relative z-10 space-y-2 shrink-0">
                 <div className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    {labels.topicAnalysis}
                 </div>
                 <h4 className="text-2xl font-bold text-white tracking-tight leading-snug line-clamp-1">
                    {backTitle || title}
                 </h4>
             </div>
             
             {/* Main Content - SCROLLABLE */}
             {/* Added h-0 and flex-grow to ensure it takes available space and scrolls properly */}
             <div className="relative z-10 flex-1 h-0 min-h-0 py-2 space-y-4 overflow-y-auto no-scrollbar [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]">
                 {/* Styled Points (Limited to first 3 to avoid scroll) */}
                 {facts && (
                    <ul className="space-y-3">
                        {facts.slice(0, 3).map((fact, idx) => (
                             <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-white/5 hover:bg-slate-800 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                <span className="text-sm text-slate-300 font-medium leading-relaxed">
                                    {fact.includes(':') ? (
                                        <>
                                            <span className="text-indigo-200 font-bold mr-1">{fact.split(':')[0]}:</span>
                                            {fact.substring(fact.indexOf(':') + 1)}
                                        </>
                                    ) : fact}
                                </span>
                            </li>
                        ))}
                    </ul>
                 )}
                 
                 {/* Mnemonic (Condensed) */}
                 {mnemonic && (
                    <div className="p-4 bg-amber-900/20 border border-amber-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-1">
                             <Lightbulb size={12} className="text-amber-500" />
                             <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">{labels.mnemonicLabel}</span>
                        </div>
                        <div className="text-sm font-bold text-amber-100/90 italic">
                             &quot;{mnemonic}&quot;
                        </div>
                    </div>
                 )}
             </div>

             {/* Footer Actions */}
             <div className="relative z-20 pt-4 mt-auto border-t border-white/5 flex flex-col gap-3">
                 {/* Read More Button (Triggers Sheet) */}
                  <button 
                    onClick={(e) => {
                         e.stopPropagation(); 
                         if (onReadMore) onReadMore();
                    }}
                    className="h-12 w-full rounded-xl bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider hover:bg-slate-700 transition-colors border border-white/10"
                  >
                      Read More
                  </button>

                  {/* Practice Button */}
                  <button 
                    onClick={handlePracticeClick}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <Zap size={14} className="fill-white" />
                    {labels.practiceTest}
                  </button>
             </div>
        </div>
      </motion.div>
    </div>
  );
};
export default FlipCard;
