"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, BookOpen, Layers, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/components/SyllabusLockModal';

export default function QuizSelectionPage() {
  const router = useRouter();
  const { language, isSubscribed } = useSettingsStore(); // Assuming useSettingsStore availability
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  const handleFullLengthClick = () => {
    if (!isSubscribed) {
        setUnlockModalOpen(true);
    } else {
        // Proceed to full length test
        router.push('/syllabus/quiz/play?mode=full');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6">
       
       <div className="max-w-4xl mx-auto space-y-8">
           {/* Header */}
           <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" onClick={() => router.back()}>
                   <ArrowLeft className="w-6 h-6 text-slate-600" />
               </Button>
               <h1 className="text-2xl font-bold text-slate-900 font-display">
                   {language === 'hi' ? 'अभ्यास क्विज़ चुनें' : 'Select Practice Quiz'}
               </h1>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
               
               {/* Option 1: Topic/Unit Wise */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
               >
                   <Card className="h-full border-2 border-indigo-100 bg-white hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer group" onClick={() => router.push('/syllabus/quiz/units')}>
                       <CardContent className="p-8 space-y-6 flex flex-col h-full items-center text-center">
                           <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                               <BookOpen className="w-10 h-10" />
                           </div>
                           <div className="space-y-2">
                               <h2 className="text-2xl font-bold text-slate-900">
                                   {language === 'hi' ? 'विषयवार क्विज़' : 'Topic-wise Quiz'}
                               </h2>
                               <p className="text-slate-500">
                                   {language === 'hi' 
                                     ? 'विशिष्ट विषयों का अभ्यास करें और अपनी समझ को मजबूत करें।' 
                                     : 'Practice specific topics and strengthen your understanding unit by unit.'}
                               </p>
                           </div>
                           <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-auto rounded-xl h-12 font-bold">
                               {language === 'hi' ? 'विषय चुनें' : 'Select Topic'}
                           </Button>
                       </CardContent>
                   </Card>
               </motion.div>

               {/* Option 2: Full Length Mock */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
               >
                   <Card 
                     className="h-full border-2 border-purple-100 bg-white hover:border-purple-300 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden" 
                     onClick={handleFullLengthClick}
                   >
                       {/* Premium Badge */}
                       {!isSubscribed && (
                           <div className="absolute top-4 right-4 z-10">
                               <Badge className="bg-slate-900 text-white hover:bg-slate-800 gap-1.5 py-1.5 px-3">
                                   <Lock className="w-3 h-3" /> Premium
                               </Badge>
                           </div>
                       )}

                       <CardContent className="p-8 space-y-6 flex flex-col h-full items-center text-center relative z-0">
                           <div className="w-20 h-20 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                               <Layers className="w-10 h-10" />
                           </div>
                           <div className="space-y-2">
                               <h2 className="text-2xl font-bold text-slate-900">
                                   {language === 'hi' ? 'फुल लेंथ मॉक टेस्ट' : 'Full Length Mock Test'}
                               </h2>
                               <p className="text-slate-500">
                                   {language === 'hi' 
                                     ? 'सभी 10 यूनिट्स को कवर करने वाला पूरा परीक्षा अनुभव।' 
                                     : 'The complete exam experience covering all 10 units with timer.'}
                               </p>
                           </div>
                           <Button 
                             className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-auto rounded-xl h-12 font-bold gap-2"
                             disabled={!isSubscribed}
                           >
                               {!isSubscribed && <Lock className="w-4 h-4" />}
                               {language === 'hi' ? 'टेस्ट शुरू करें' : 'Start Mock Test'}
                           </Button>
                       </CardContent>
                   </Card>
               </motion.div>
           </div>
       </div>

       <SyllabusLockModal open={unlockModalOpen} onOpenChange={setUnlockModalOpen} />
    </div>
  );
}
