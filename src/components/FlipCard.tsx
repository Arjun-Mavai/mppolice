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
  backTitle, // Default to props or fallback
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
  labels
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Use controlled state if provided, otherwise internal
  const flipped = isFlipped !== undefined ? isFlipped : internalFlipped;

  const handleFlip = (e: React.MouseEvent) => {
    // Safety check: if clicked element is a button or inside a button, ignore
    if ((e.target as HTMLElement).closest('button')) return;
    
    if (isLocked || isAnimating) return;

    if (onFlip) {
      onFlip(id);
    } else {
      setInternalFlipped(!internalFlipped);
    }
    
    setIsAnimating(true);
  };

  const handlePracticeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // CRITICAL: Stop the event from bubbling to the card wrapper
      
    console.log("Practice Test Clicked for ID:", id);
    if (onPracticeTest) {
        onPracticeTest();
      }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onFlip) {
          onFlip(id); // Toggle back
      } else {
          setInternalFlipped(false);
      }
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
        transition={{ 
          duration: 0.8, 
          type: "spring", 
          stiffness: 150, 
          damping: 20 
        }}
        onAnimationComplete={() => setIsAnimating(false)}
      >
        {/* --- FRONT SIDE (White Premium) --- */}
        <div className={cn(
            "absolute w-full h-full backface-hidden rounded-[2.5rem]",
            "bg-white border border-slate-200 shadow-xl",
            "flex flex-col items-center justify-between p-8 sm:p-10",
            "transition-all duration-500 group-hover:border-indigo-200 group-hover:shadow-indigo-500/10",
            isLocked && "grayscale-[0.8] opacity-90"
        )}>
             {/* Header: Icon & Number */}
             <div className="w-full flex justify-between items-start opacity-30">
                <Target size={32} className="text-slate-400" />
                {/* <span className="text-5xl font-serif font-black text-slate-200">{subtitle}</span> */}
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center gap-8 text-center relative z-10 w-full">
                {/* Visual Icon/Image */}
                <div className="w-24 h-24 bg-slate-900 rounded-3xl shadow-2xl flex items-center justify-center -rotate-3 group-hover:-rotate-6 transition-transform duration-500">
                    {impactEmoji ? (
                         <span className="text-5xl">{impactEmoji}</span>
                    ) : (
                         <Sparkles className="w-10 h-10 text-white" />
                    )}
                </div>

                <h3 className={cn(
                    "text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight", 
                    title.length > 20 ? "text-2xl" : ""
                )}>
                    {title}
                </h3>

                {isLocked && (
                    <div className="inline-flex items-center text-xs font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 uppercase tracking-widest">
                        <Lock className="w-3.5 h-3.5 mr-2 animate-pulse" /> Premium
                    </div>
                )}
            </div>

            {/* Footer: Tap Indicator */}
            <div className="w-full flex justify-center">
                <span className="px-5 py-2 bg-slate-50 border border-slate-100 rounded-full text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <RotateCw size={14} className="group-hover:rotate-180 transition-transform duration-700" /> 
                    {labels.tapToFlip}
                </span>
            </div>
            
             {/* Decorative Blur */}
             {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-50/50 rounded-full blur-[60px] -z-0 pointer-events-none" /> */}
        </div>


        {/* --- BACK SIDE (Premium Dark "Topic Analysis") --- */}
        <div className={cn(
            "absolute w-full h-full backface-hidden rotate-y-180 rounded-[2.5rem]",
            "bg-[#0a0f1d] border border-slate-800 shadow-2xl shadow-indigo-950/20",
            "p-8 flex flex-col justify-between overflow-hidden"
        )}>
             {/* Background Gradients */}
             {/* <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" /> */}
             {/* <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" /> */}
             
             {/* 1. Header */}
             <div className="relative z-10 space-y-4 shrink-0">
                 <div>
                     <div className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        {labels.topicAnalysis}
                     </div>
                     <h4 className="text-2xl font-bold text-white tracking-tight leading-snug line-clamp-2">
                        {backTitle || title}
                     </h4>
                 </div>
             </div>
             
             {/* 2. Scrollable Content (Facts) */}
             <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2 my-4 space-y-4">
                 {/* Optional Main Summary */}
                 {backMainContent && (
                    <p className="text-slate-400 text-sm italic border-l-2 border-slate-700 pl-3">
                        {backMainContent}
                    </p>
                 )}

                 {/* Facts List */}
                 {facts && (
                    <ul className="space-y-3">
                        {facts.map((fact, idx) => (
                             <li key={idx} className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                <span className="text-sm text-slate-300 font-medium leading-relaxed">
                                    {/* Simple highlighting logic: text before colon is bold/white */}
                                    {fact.includes(':') ? (
                                        <>
                                            <span className="text-white font-bold">{fact.split(':')[0]}:</span>
                                            {fact.substring(fact.indexOf(':') + 1)}
                                        </>
                                    ) : fact}
                                </span>
                            </li>
                        ))}
                    </ul>
                 )}
                 
                 {/* Mnemonic */}
                 {mnemonic && (
                    <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl group/mnemonic">
                        <div className="text-[10px] text-amber-500 font-black uppercase mb-2 flex items-center gap-2">
                            <Lightbulb size={12} className="fill-amber-500/80" /> {labels.mnemonicLabel}
                        </div>
                        <div className="text-sm font-bold text-amber-100/90 tracking-wide leading-relaxed">
                             &quot;{mnemonic}&quot;
                        </div>
                    </div>
                 )}
             </div>

             {/* 3. Action Footer */}
             <div className="relative z-20 pt-4 mt-auto border-t border-white/5 space-y-3">
                <button 
                    type="button"
                    onClick={(e)=>{
                      console.log("Practice Test Clicked for ID:", id);
                      handlePracticeClick(e)}}
                    className="w-full h-12 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group/btn border border-indigo-400/20"
                >
                    <Zap size={14} className="fill-white group-hover/btn:animate-pulse" />
                    {labels.practiceTest}
                </button>
                
                <div 
                   onClick={handleCloseClick}
                   className="text-center text-[9px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest cursor-pointer transition-colors p-2"
                >
                    {labels.closeAnalysis}
                </div>
             </div>

             {/* Progress Bar (Top) */}
             <motion.div 
               className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500"
               initial={{ scaleX: 0 }}
               animate={{ scaleX: flipped ? 1 : 0 }}
               transition={{ delay: 0.3, duration: 0.8 }}
             />
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
