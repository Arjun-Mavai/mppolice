"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Trophy, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from "@/lib/logger";
import { Card, CardContent } from '@/components/ui/card';
import { syllabusData } from '@/data/syllabusData';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PLAN_LIMITS } from '@/config/plans';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface QuizUnitSelectionClientProps {
    availableTests: {
        id: string; // real test id
        unitId: string | null;
        title: string;
        titleEn?: string | null;
        maxRetries: number;
        attempts: number;
        totalQuestions: number | null;
    }[];
}

export default function QuizUnitSelectionClient({ availableTests }: QuizUnitSelectionClientProps) {
  const router = useRouter();
  const { language, user } = useSettingsStore();
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  // Check property names in your User type definition. Assuming snake_case based on lint errors.
  const userTier = user?.plan_tier || 'free';
  const isSubscribed = user?.is_subscribed || false;
  
  // Logic: 
  // If user is not logged in -> guest
  // If user is logged in but not subscribed -> lite (free tier usually maps to lite limits or strictly free)
  // If user is subscribed -> use their tier (pro, etc)
  const effectiveTier = !user ? 'guest' : (isSubscribed ? (userTier === 'free' ? 'lite' : userTier) : 'free');
  
  const limit = PLAN_LIMITS[effectiveTier as keyof typeof PLAN_LIMITS]?.unit_tests_limit || 0;

  const handleUnitClick = (testId: string, isLocked: boolean, attempts: number, maxRetries: number) => {
    logger.debug("testId helolllllllllll bhai", testId)
      // Logic: Allow if user has attempts left OR if we want to allow review
      const attemptsLeft = Math.max(0, maxRetries - attempts);

      if (isLocked) {
          setUnlockModalOpen(true);
      } else {
          // Navigate to Play with the REAL testId
          router.push(`/syllabus/quiz/play?mode=topic&testId=${testId}`);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 pb-20">
         <div className="max-w-6xl mx-auto space-y-8">
             {/* Header */}
             <div className="flex items-center gap-4">
                 <Button variant="ghost" size="icon" onClick={() => router.back()}>
                     <ArrowLeft className="w-6 h-6 text-slate-600" />
                 </Button>
                 <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-display">
                        {language === 'hi' ? 'यूनिट वार अभ्यास' : 'Unit Wise Practice'}
                    </h1>
                    <p className="text-slate-500">
                         {language === 'hi' ? 'अपनी तैयारी को मजबूत करने के लिए यूनिट चुनें' : 'Select a unit to strengthen your preparation'}
                    </p>
                 </div>
             </div>
         </div>

       <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTests.length === 0 && (
                     <div className="col-span-2 text-center py-12 text-slate-500">
                         No active unit tests found. Please check back later.
                     </div>
                )}
                {availableTests.map((test, index) => {
                    // logger.debug("test checking", test)
                    // Enrich with Syllabus Data if unitId matches
                    const unitData = test.unitId ? syllabusData.units[test.unitId] : null;

                    const title = (language === 'en' && test.titleEn) ? test.titleEn : (test.title || 'Unknown Unit');
                    
                    const topicCount = unitData?.topics?.length || test.totalQuestions || 0;

                    const isLocked = index >= limit;
                    
                    const displayIndex = index + 1;
                    const attemptsLeft = Math.max(0, test.maxRetries - test.attempts);
                    const isCompleted = attemptsLeft === 0;

                    return (
                        <motion.div
                            key={test.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card 
                                onClick={() => handleUnitClick(test.id, isLocked, test.attempts, test.maxRetries)}
                                className={cn(
                                    "cursor-pointer hover:shadow-xl transition-all border-2 overflow-hidden relative group active:scale-[0.98]",
                                    isLocked ? "border-slate-200 bg-slate-50 opacity-90" : 
                                    isCompleted ? "border-emerald-200 bg-emerald-50/30" :
                                    "border-slate-200 bg-white hover:border-indigo-500/50"
                                )}
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-display shrink-0 transition-colors shadow-sm",
                                            isLocked ? "bg-slate-200 text-slate-400" : 
                                            isCompleted ? "bg-emerald-100 text-emerald-600" :
                                            "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                                        )}>
                                            {isLocked ? <Lock className="w-5 h-5" /> : 
                                             isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                                             displayIndex}
                                        </div>
                                        
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div>
                                                <h3 className={cn(
                                                    "font-bold text-base truncate pr-2",
                                                    isLocked ? "text-slate-500" : "text-slate-900"
                                                )}>
                                                    {title}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    {topicCount} {language === 'hi' ? 'टॉपिक्स/प्रश्न' : 'Questions/Topics'}
                                                </p>
                                            </div>

                                            {!isLocked && (
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                                                        <span className={attemptsLeft > 0 ? "text-slate-500" : "text-red-500"}>
                                                            {language === 'hi' ? 'प्रयास शेष' : 'Attempts Left'}
                                                        </span>
                                                        <span className={cn(
                                                            "bg-slate-100 px-1.5 py-0.5 rounded text-slate-600",
                                                            attemptsLeft === 0 && "bg-red-100 text-red-600"
                                                        )}>
                                                            {attemptsLeft} / {test.maxRetries}
                                                        </span>
                                                    </div>
                                                    <Progress value={(test.attempts / test.maxRetries) * 100} className="h-1.5 bg-slate-100" 
                                                        indicatorClassName={cn(
                                                            attemptsLeft > 0 ? "bg-indigo-500" : "bg-red-500"
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                         <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-bold">
                                             {unitData ? "UNIT TEST" : "TEST"}
                                         </Badge>
                                         <Button 
                                            size="sm" 
                                            className={cn(
                                                "h-8 text-xs font-bold rounded-lg transition-colors",
                                                isLocked ? "bg-slate-200 text-slate-400 hover:bg-slate-200 cursor-not-allowed" :
                                                "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                                            )}
                                            disabled={isLocked}
                                         >
                                            {isLocked ? <Lock className="w-3 h-3 mr-1.5" /> : <Zap className="w-3 h-3 mr-1.5" />}
                                            {isLocked ? (language === 'hi' ? 'लॉक' : 'Locked') : 
                                             attemptsLeft === 0 ? (language === 'hi' ? 'रिव्यू करें' : 'Review') :
                                             (language === 'hi' ? 'प्रारंभ करें' : 'Start Test')}
                                         </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
           </div>
       </div>

       <SyllabusLockModal open={unlockModalOpen} onOpenChange={setUnlockModalOpen} />
    </div>
  );
}
