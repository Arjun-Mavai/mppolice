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

export const PremiumExplanation: React.FC<PremiumExplanationProps> = ({ explanation, explanationEn, language }) => {
    const storeLanguage = useSettingsStore((state) => state.language);
    const finalLanguage = language || storeLanguage;
    // Choose the right explanation text based on language
    // Default to 'explanation' (Hindi/Primary) if specific logic not met
    const DEFAULT_MSG = finalLanguage === 'hi'
        ? "यह प्रश्न सीधे अवधारणात्मक (Conceptual) है। यदि यह गलत हुआ है, तो कृपया संबंधित विषय के मूल तथ्यों (Basics) को दोहराएं।"
        : "This question addresses core concepts. If answered incorrectly, please review the fundamental facts of this topic.";
        
    const textToParse = ((finalLanguage === 'en' && explanationEn) ? explanationEn : explanation) || DEFAULT_MSG;
    // Helper to extract sections
    const extractSection = (text: string, marker: string, nextMarkers: string[]) => {
        if (!text) return null;
        const startIndex = text.indexOf(marker);
        if (startIndex === -1) return null;

        let content = text.slice(startIndex + marker.length);
        
        // Find the earliest next marker to end this section
        let minIndex = content.length;
        nextMarkers.forEach(nm => {
            const idx = content.indexOf(nm);
            if (idx !== -1 && idx < minIndex) {
                minIndex = idx;
            }
        });

        return content.slice(0, minIndex).trim();
    };

    // Markers
    const MARKERS = {
        FACT: "**💡 Exam Fact",
        TIP: "**🧠 Memory Tip",
        SCAM: "**🚫 Scam Alert"
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
    
    allMarkers.forEach(m => {
        const idx = coreLogic.indexOf(m);
        if (idx !== -1 && idx < firstMarkerIndex) {
            firstMarkerIndex = idx;
        }
    });
    
    coreLogic = coreLogic.slice(0, firstMarkerIndex).trim();

    // Clean up markdown bolding from the extracted values if present (e.g. "**:**" artifacts)
    // The regex strategy in planning was robust, but simple string slicing is safer against slight variations in AI output often.
    // However, AI usually outputs `**💡 Exam Fact**: Content`. Our slice removed `**💡 Exam Fact`. 
    // We might still have `**: Content` or `: Content`.
    const cleanContent = (s: string | null) => {
        if (!s) return null;
        return s.replace(/^(\s*(\(High Value\)|\(Mnemonic\)|\(Elimination\))?\s*)?(\*\*|:)?\s*:?\s*/, '').trim();
    };

    const sections = {
        logic: coreLogic,
        fact: cleanContent(examFact),
        tip: cleanContent(memoryTip),
        scam: cleanContent(scamAlert)
    };

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4 font-sans text-left"
        >
            {/* 1. Core Logic */}
            {sections.logic && (
                <motion.div variants={item} className="flex gap-4">
                    <div className="w-1 bg-emerald-500 rounded-full shrink-0 mt-1.5 h-auto min-h-[1.5rem]" />
                    <div className="flex-1">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-700 mb-1 uppercase tracking-wider">
                            <CheckCircle2 size={16} /> {finalLanguage === 'hi' ? 'तर्क' : 'Core Logic'}
                        </h4>
                        <div className="text-sm text-slate-700 leading-relaxed font-medium">
                            {/* Render simple newlines as breaks */}
                            {sections.logic.split('\n').map((line, i) => (
                                <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 2. Exam Fact */}
            {sections.fact && (
                <motion.div variants={item} className="flex gap-4">
                    <div className="w-1 bg-blue-500 rounded-full shrink-0 mt-1.5 h-auto min-h-[1.5rem]" />
                    <div className="flex-1">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-1 uppercase tracking-wider">
                            <Lightbulb size={16} /> {finalLanguage === 'hi' ? 'एग्जाम फैक्ट' : 'Exam Fact'}
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            {sections.fact}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* 3. Memory Tip */}
            {sections.tip && (
                <motion.div variants={item} className="flex gap-4">
                    <div className="w-1 bg-amber-500 rounded-full shrink-0 mt-1.5 h-auto min-h-[1.5rem]" />
                    <div className="flex-1">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-amber-700 mb-1 uppercase tracking-wider">
                            <Brain size={16} /> {finalLanguage === 'hi' ? 'मेमोरी टिप' : 'Memory Tip'}
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed italic bg-amber-50 p-2 rounded-lg border border-amber-100">
                            {sections.tip}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* 4. Scam Alert */}
            {sections.scam && (
                <motion.div variants={item} className="flex gap-4">
                    <div className="w-1 bg-red-500 rounded-full shrink-0 mt-1.5 h-auto min-h-[1.5rem]" />
                    <div className="flex-1">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-1 uppercase tracking-wider">
                            <AlertTriangle size={16} /> {finalLanguage === 'hi' ? 'स्कैम अलर्ट' : 'Scam Alert'}
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            {sections.scam}
                        </p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};
