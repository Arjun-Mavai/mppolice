"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syllabusData } from '@/data/syllabusData';
import { useSettingsStore } from '@/store/useSettingsStore';
import { QuizListItem } from '@/components/QuizListItem';
import { QuizSubNav } from '@/features/syllabus/components/QuizSubNav';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { QUIZ_CONSTANTS } from '@/config/quiz';

interface QuizUnitSelectionClientProps {
    availableTests: {
        id: string; // real test id
        unitId: string | null;
        title: string;
        titleEn?: string | null;
        maxRetries: number | null;
        attempts: number;
        attemptsLeft: number | null;
        totalQuestions: number | null;
        isFree: boolean;
        isFreeAccess: boolean;
    }[];
}

export default function QuizUnitSelectionClient({ availableTests }: QuizUnitSelectionClientProps) {
  const router = useRouter();
  const { language, user } = useSettingsStore();
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  const isAdmin = (user as any)?.role === 'admin';
  const isSubscribed = user?.isSubscribed || false;
  const userTier = user?.planTier || 'free';
  const effectiveTier = !user ? 'guest' : (isSubscribed ? (userTier === 'free' ? 'lite' : userTier) : 'free');
  const hasActivePlan = effectiveTier === 'lite' || effectiveTier === 'pro';

  const handleUnitClick = (testId: string, isLocked: boolean) => {
      if (isLocked) {
          setUnlockModalOpen(true);
      } else {
          router.push(`/syllabus/quiz/play?mode=topic&testId=${testId}`);
      }
  };

  const hi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans pb-20 relative overflow-hidden">
        {/* 🎭 PREMIUM BACKGROUND BLURS */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-100/30 to-transparent pointer-events-none" />
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-150px] w-[400px] h-[400px] bg-emerald-50/30 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10 pt-32">
            
            {/* Header */}
            <div className="mb-8">
                 {/* Back button removed as requested */}
            </div>

            {/* 🧭 CONSOLIDATED SUB-NAV */}
            <QuizSubNav />
            
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 space-y-2 text-center"
            >
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                    {hi ? 'यूनिट टेस्ट' : 'Unit Tests'}
                </h1>
                <p className="text-slate-500 font-medium max-w-xl mx-auto">
                    {hi ? 'अपनी तैयारी को मजबूत करने के लिए यूनिट चुनें।' : 'Select a unit to strengthen your preparation and score.'}
                </p>
            </motion.div>

            {/* 📝 LIST VIEW */}
            <div className="space-y-4 pb-32 md:pb-20">
                <AnimatePresence mode="popLayout">
                    {availableTests.map((test, idx) => {
                        const unitData = test.unitId ? syllabusData.units[test.unitId] : null;

                        const title = hi   
                            ? (test.title || unitData?.title || unitData?.title_en || 'Unknown Unit')
                            : (test.titleEn || unitData?.title_en || test.title || unitData?.title || 'Unknown Unit');                    
                        
                        // Backend-only: lock if NOT free access AND no active plan AND not admin
                        const isLocked = !test.isFreeAccess && !hasActivePlan && !isAdmin;

                        const totalQuestions = test.totalQuestions || unitData?.topics?.length || 0;
                        const totalMarks = totalQuestions * QUIZ_CONSTANTS.MARKS_PER_QUESTION;

                        return (
                            <QuizListItem
                                key={test.id}
                                index={idx}
                                title={title}
                                questions={totalQuestions}
                                itemLabel={hi ? 'प्रश्न' : 'Questions'}
                                marks={totalMarks} // Dynamic Marks
                                isLocked={isLocked}
                                isFree={test.isFree}
                                attemptsLeft={test.attemptsLeft}
                                language={language}
                                colorVariant={(['amber', 'emerald', 'pink', 'blue', 'indigo'] as const)[idx % 5]}
                                onClick={() => handleUnitClick(test.id, isLocked)}
                            />
                        );
                    })}
                </AnimatePresence>
                
                {availableTests.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm border-dashed">
                        <p className="text-slate-500 font-medium">
                            {hi ? 'अभी कोई यूनिट टेस्ट उपलब्ध नहीं है।' : 'No Unit Tests available at the moment.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
        
        <SyllabusLockModal open={unlockModalOpen} onOpenChange={setUnlockModalOpen} />
    </div>
  );
}
