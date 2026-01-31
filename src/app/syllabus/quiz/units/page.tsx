"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, BookOpen, Lock, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { syllabusData } from '@/data/syllabusData';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/components/SyllabusLockModal';
import { cn } from '@/lib/utils';

export default function QuizUnitSelectionPage() {
  const router = useRouter();
  const { language, isSubscribed } = useSettingsStore();
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  const handleUnitClick = (unitKey: string, isLocked: boolean) => {
      if (isLocked) {
          setUnlockModalOpen(true);
      } else {
          // Navigate to quiz play with unitId (for now assume "all topics in unit" or "random topics from unit")
          // Logic: passing unitId allows filtering questions by unit
          router.push(`/syllabus/quiz/play?mode=topic&unitId=${unitKey}`);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
       
        {/* Simple Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-20">
             <div className="flex items-center gap-3">
                 <Button variant="ghost" size="icon" onClick={() => router.back()}>
                     <ArrowLeft className="w-5 h-5 text-slate-600" />
                 </Button>
                 <div>
                     <h1 className="text-lg font-bold text-slate-900 leading-none">
                         {language === 'hi' ? 'यूनिट चुनें' : 'Select Unit'}
                     </h1>
                     <p className="text-xs text-slate-500 mt-1">
                         {language === 'hi' ? 'क्विज़ के लिए एक विषय चुनें' : 'Pick a topic for your quiz'}
                     </p>
                 </div>
             </div>
        </header>

       <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(syllabusData.units).map(([key, unit], index) => {
                    const title = language === 'en' && unit.title_en ? unit.title_en : (unit.unit_title || unit.title);
                    const isLocked = key !== "unit_1" && !isSubscribed;
                    const displayIndex = index + 1;
                    
                    return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card 
                                onClick={() => handleUnitClick(key, isLocked)}
                                className={cn(
                                    "cursor-pointer hover:shadow-lg transition-all border-2 overflow-hidden relative group active:scale-[0.98]",
                                    isLocked ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-900"
                                )}
                            >
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-display shrink-0 transition-colors",
                                        isLocked ? "bg-slate-200 text-slate-400" : "bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-white"
                                    )}>
                                        {isLocked ? <Lock className="w-5 h-5" /> : displayIndex}
                                    </div>
                                    
                                    <div className="min-w-0 flex-1">
                                        <h3 className={cn(
                                            "font-bold text-base mb-1 truncate",
                                            isLocked ? "text-slate-500" : "text-slate-900"
                                        )}>
                                            {title}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {unit.topics.length} {language === 'hi' ? 'टॉपिक्स' : 'Topics'}
                                        </p>
                                    </div>

                                    {!isLocked && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 text-[10px] uppercase tracking-wider px-2">
                                            Free
                                        </Badge>
                                    )}
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
