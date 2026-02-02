"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, BookOpen, Layers, Lock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/components/SyllabusLockModal';
import { useRouter } from 'next/navigation';

export default function QuizSelectionPage() {
  const router = useRouter();
  const { language, isSubscribed } = useSettingsStore(); // Assuming useSettingsStore availability
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  const handleFullLengthClick = () => {
    if (!isSubscribed) {
        setUnlockModalOpen(true);
    } else {
        // Proceed to full length test list
        router.push('/syllabus/quiz/full-length');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6">
       
       <div className="max-w-6xl mx-auto space-y-8">
           {/* Header */}
           <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" onClick={() => router.back()}>
                   <ArrowLeft className="w-6 h-6 text-slate-600" />
               </Button>
               <h1 className="text-2xl font-bold text-slate-900 font-display">
                   {language === 'hi' ? 'अभ्यास टेस्ट चुनें' : 'Select Practice Test'}
               </h1>
           </div>

           <div className="grid md:grid-cols-3 gap-6">
               
               {/* Option 1: Topic Wise */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.05 }}
               >
                   <Card className="h-full border-2 border-rose-100 bg-white hover:border-rose-300 hover:shadow-xl transition-all cursor-pointer group" onClick={() => router.push('/syllabus/quiz/topic')}>
                       <CardContent className="p-8 space-y-6 flex flex-col h-full items-center text-center">
                           <div className="w-20 h-20 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                               <Sparkles className="w-10 h-10" />
                           </div>
                           <div className="space-y-2">
                               <h2 className="text-xl font-bold text-slate-900">
                                   {language === 'hi' ? 'टॉपिक वार टेस्ट' : 'Topic Quick Check'} 
                               </h2>
                               <p className="text-slate-500 text-sm">
                                   {language === 'hi' 
                                     ? 'किसी विशिष्ट टॉपिक पर 10 प्रश्नों का क्विक टेस्ट दें।' 
                                     : 'Quick 10-question check on specific syllabus topics.'}
                               </p>
                           </div>
                           <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white mt-auto rounded-xl h-12 font-bold shadow-rose-200 shadow-lg">
                               {language === 'hi' ? 'टॉपिक चुनें' : 'Select Topic'}
                           </Button>
                       </CardContent>
                   </Card>
               </motion.div>

               {/* Option 2: Unit Wise */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
               >
                   <Card className="h-full border-2 border-indigo-100 bg-white hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer group">
                       <CardContent className="p-8 space-y-6 flex flex-col h-full items-center text-center">
                           <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                               <BookOpen className="w-10 h-10" />
                           </div>
                           <div className="space-y-2">
                               <h2 className="text-xl font-bold text-slate-900">
                                   {language === 'hi' ? 'यूनिट वार टेस्ट' : 'Unit-wise Test'} 
                               </h2>
                               <p className="text-slate-500 text-sm">
                                   {language === 'hi' 
                                     ? 'विशिष्ट विषयों का अभ्यास करें और अपनी समझ को मजबूत करें।' 
                                     : 'Deep dive into complete units with comprehensive tests.'}
                               </p>
                           </div>
                           <div className="flex flex-col sm:flex-row gap-4 justify-center mt-auto w-full">
                             <Button asChild size="lg" className="h-12 px-8 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 font-bold transition-all hover:scale-105">
                                 <Link href="/syllabus/quiz/units">
                                    <Play className="w-5 h-5 mr-2 fill-white" /> {language === 'hi' ? 'यूनिट चुनें' : 'Start Unit Test'}
                                 </Link>
                             </Button>
                             <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full border-2 border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 font-bold bg-transparent transition-all hover:scale-105">
                                 <Link href="/syllabus/quiz/topic">
                                    <BookOpen className="w-5 h-5 mr-2" /> {language === 'hi' ? 'टॉपिक वार टेस्ट' : 'Topic Wise Tests'}
                                 </Link>
                             </Button>
                           </div>
                       </CardContent>
                   </Card>
               </motion.div>

               {/* Option 3: Full Length Mock */}
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
                               <h2 className="text-xl font-bold text-slate-900">
                                   {language === 'hi' ? 'फुल लेंथ मॉक टेस्ट' : 'Full Length Mock'}
                               </h2>
                               <p className="text-slate-500 text-sm">
                                   {language === 'hi' 
                                     ? 'सभी 10 यूनिट्स को कवर करने वाला पूरा परीक्षा अनुभव।' 
                                     : 'The complete exam experience covering all 10 units with timer.'}
                               </p>
                           </div>
                           <Button 
                             className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-auto rounded-xl h-12 font-bold gap-2 shadow-purple-200 shadow-lg"
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
