"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Trophy, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { syllabusData } from '@/data/syllabusData';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PLAN_LIMITS } from '@/config/plans';
import { SyllabusLockModal } from '@/components/SyllabusLockModal';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface QuizUnitSelectionClientProps {
    stats: Record<string, { attempts: number, maxRetries: number }>;
}

export default function QuizUnitSelectionClient({ stats }: QuizUnitSelectionClientProps) {
  const router = useRouter();
  const { language, isSubscribed } = useSettingsStore();
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  const handleUnitClick = (unitKey: string, isLocked: boolean, attemptsLeft: number) => {
      if (isLocked) {
          setUnlockModalOpen(true);
      } else if (attemptsLeft <= 0) {
          // Optional: Show alert if no attempts left, but allowing review/practice might be desired.
          // For now, let them proceed but quiz logic might block or show 'Practice Mode'.
          router.push(`/syllabus/quiz/play?mode=topic&unitId=${unitKey}`);
      } else {
          router.push(`/syllabus/quiz/play?mode=topic&unitId=${unitKey}`);
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
                {Object.entries(syllabusData.units).map(([key, unit], index) => {
                    const title = language === 'en' && unit.title_en ? unit.title_en : (unit.unit_title || unit.title);
                    
                    const user = (useSettingsStore.getState().user as any);
                    const userTier = user?.plan_tier || 'free';
                    const effectiveTier = !user ? 'guest' : (user?.is_subscribed ? (userTier === 'free' ? 'lite' : userTier) : 'free');
                    const limit = PLAN_LIMITS[effectiveTier as keyof typeof PLAN_LIMITS]?.unit_tests_limit || 0;
                    
                    // index is 0-based. So if limit is 5, indices 0,1,2,3,4 are allowed.
                    const isLocked = index >= limit;
                    const displayIndex = index + 1;
                    
                    const unitStats = stats[key] || { attempts: 0, maxRetries: 5 }; // Default if not found
                    const attemptsLeft = Math.max(0, unitStats.maxRetries - unitStats.attempts);
                    const isCompleted = attemptsLeft === 0;

                    return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card 
                                onClick={() => handleUnitClick(key, isLocked, attemptsLeft)}
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
                                                    {unit.topics.length} {language === 'hi' ? 'टॉपिक्स' : 'Topics'}
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
                                                            {attemptsLeft} / {unitStats.maxRetries}
                                                        </span>
                                                    </div>
                                                    <Progress value={(unitStats.attempts / unitStats.maxRetries) * 100} className="h-1.5 bg-slate-100" 
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
                                             UNIT {displayIndex}
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
