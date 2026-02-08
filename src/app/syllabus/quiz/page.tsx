"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, BookOpen, Layers, Play, BrainCircuit, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function QuizSelectionPage() {
  const router = useRouter();
  const { language, isSubscribed, user } = useSettingsStore();
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const popStateRef = useRef<(() => void) | null>(null);

  // Bhai browser ka back button dabaye to modal dikhao - user galti se bahar na chala jaaye
  useEffect(() => {
    window.history.pushState({ quizSection: true }, '');
    
    const handlePopState = () => {
      window.history.pushState({ quizSection: true }, '');
      setShowExitModal(true);
    };

    popStateRef.current = handlePopState;
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Confirm exit → remove the exact listener ref, then navigate back once
  const handleConfirmExit = useCallback(() => {
    setShowExitModal(false);
    if (popStateRef.current) {
      window.removeEventListener('popstate', popStateRef.current);
      popStateRef.current = null;
    }
    router.back();
  }, [router]);

  // Bhai greeting SSR-safe rakhna h - server par kuch mat render karo
  // Client mount hone ke baad hi time-based greeting dikhao
  // Warna React hydration error deta h (server ne kuch aur bheja, client ne kuch aur)
  const [isMounted, setIsMounted] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState({ title: '', subtitle: '' });

  useEffect(() => {
    setIsMounted(true);
    const hour = new Date().getHours();
    const isHindi = language === 'hi';
    const name = user?.name ? user.name.split(' ')[0] : (isHindi ? 'विद्यार्थी' : 'Aspirant');

    // Time ke hisab se greeting - subah/dopahar/shaam/raat
    let greeting = '';
    if (hour >= 4 && hour < 12) greeting = isHindi ? 'सुप्रभात' : 'Good Morning';
    else if (hour >= 12 && hour < 17) greeting = isHindi ? 'दोपहर की नमस्ते' : 'Good Afternoon';
    else if (hour >= 17 && hour < 22) greeting = isHindi ? 'शुभ संध्या' : 'Good Evening';
    else greeting = isHindi ? 'शुभ रात्रि' : 'Good Night';

    setWelcomeMsg({
        title: `${greeting}, ${name}! ${isHindi ? '🙏' : '👋'}`,
        subtitle: isSubscribed 
            ? (isHindi ? 'आपकी प्रीमियम मेंबरशिप सक्रिय है। अपनी तैयारी को अगले स्तर पर ले जाएं!' : 'Your Premium Membership is Active. Let\'s ace this exam!')
            : (isHindi ? 'अपनी तैयारी को एक नई दिशा दें। अभी शुरू करें!' : 'Kickstart your preparation today!')
    });
  }, [language, isSubscribed, user]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6">
       
       <div className="max-w-6xl mx-auto space-y-8">
           {/* Header with Personalization */}
           <div className="flex flex-col gap-4">
               <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display pt-40 mb-2" suppressHydrationWarning>
                            {isMounted ? welcomeMsg.title : '\u00A0'}
                        </h1>
                        <p className={`text-sm sm:text-base font-medium ${isSubscribed ? 'text-slate-700' : 'text-slate-500'}`} suppressHydrationWarning>
                            {isMounted ? welcomeMsg.subtitle : '\u00A0'}
                        </p>
                    </div>
               </div>
               
               {/* Marketing Nudge for Non-Subscribed */}
               {!isSubscribed && (
                   <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-slate-200 ">
                       <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                           <div>
                               <h3 className="font-bold text-lg mb-1">
                                   {language === 'hi' ? 'फुल एक्सेस अनलॉक करें' : 'Unlock Full Access'}
                               </h3>
                               <p className="text-slate-200 text-sm max-w-md">
                                   {language === 'hi' 
                                     ? 'सभी टेस्ट सीरीज़, विस्तृत विश्लेषण और अधिक के लिए प्रो बनें।' 
                                     : 'Get unlimited access to all Test Series, Detailed Analysis and more.'}
                               </p>
                           </div>
                           <Button asChild className="bg-white text-slate-700 hover:bg-slate-50 font-bold border-0 shadow-lg">
                               <Link href="/upgrade">
                                   {language === 'hi' ? 'अभी अपग्रेड करें' : 'Upgrade Now'}
                               </Link>
                           </Button>
                       </div>
                       
                       {/* Abstract Shapes */}
                       <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-32" />
                       <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-500/30 rounded-full blur-xl -ml-10 -mb-10" />
                   </div>
               )}
           </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Option 1: Topic Wise */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                    <Card className="h-full border-2 border-slate-100 bg-white hover:border-slate-300 hover:shadow-xl transition-all cursor-pointer group" onClick={() => router.push('/syllabus/quiz/topic')}>
                        <CardContent className="p-8 space-y-6 flex flex-col h-full items-center text-center">
                            <div className="w-20 h-20 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
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
                            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-auto rounded-xl h-12 font-bold shadow-lg shadow-slate-900/10 border border-slate-900">
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
                    <Card className="h-full border-2 border-slate-100 bg-white hover:border-slate-300 hover:shadow-xl transition-all cursor-pointer group">
                        <CardContent className="p-8 space-y-6 flex flex-col h-full items-center text-center">
                            <div className="w-20 h-20 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
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
                            <div className="flex flex-col gap-3 justify-center mt-auto w-full">
                              <Button asChild size="lg" className="h-12 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 font-bold transition-all border border-slate-900">
                                  <Link href="/syllabus/quiz/units">
                                     <Play className="w-4 h-4 mr-2 fill-white" /> {language === 'hi' ? 'यूनिट चुनें' : 'Start Unit Test'}
                                  </Link>
                              </Button>
                              {/* <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-xl border-2 border-slate-200 text-slate-700 hover:border-slate-900 hover:bg-white hover:text-slate-900 font-bold transition-all">
                                  <Link href="/syllabus/quiz/topic">
                                     {language === 'hi' ? 'टॉपिक वार' : 'Topic Wise'}
                                  </Link>
                              </Button> */}
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
                      className="h-full border-2 border-slate-100 bg-white hover:border-slate-300 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden" 
                      onClick={() => router.push('/syllabus/quiz/full-length')}
                    >
                        <CardContent className="p-8 space-y-6 flex flex-col h-full items-center text-center relative z-0">
                            <div className="w-20 h-20 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
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
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-auto rounded-xl h-12 font-bold gap-2 shadow-lg shadow-slate-900/10 border border-slate-900"
                            >
                                {language === 'hi' ? 'टेस्ट देखें' : 'View Tests'}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* CSAT Tests */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                >
                    <Card 
                      className="h-full border-2 border-slate-100 bg-white hover:border-slate-300 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden" 
                      onClick={() => router.push('/syllabus/quiz/csat')}
                    >
                        <CardContent className="p-8 space-y-6 flex flex-col h-full items-center text-center relative z-0">
                            <div className="w-20 h-20 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BrainCircuit className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {language === 'hi' ? 'सीसैट (CSAT)' : 'CSAT Practice'}
                                </h2>
                                <p className="text-slate-500 text-sm">
                                    {language === 'hi' 
                                      ? 'सामान्य अभिरुचि परीक्षण और तार्किक क्षमता।' 
                                      : 'Aptitude, logical reasoning and comprehension.'}
                                </p>
                            </div>
                            <Button 
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-auto rounded-xl h-12 font-bold gap-2 shadow-lg shadow-slate-900/10 border border-slate-900"
                            >
                                {language === 'hi' ? 'अभ्यास करें' : 'Practice Now'}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Option 4: PYQs */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                    <Card 
                      className="h-full border-2 border-slate-100 bg-white hover:border-slate-300 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden" 
                      onClick={() => router.push('/syllabus/quiz/pyq')}
                    >
                         <CardContent className="p-8 space-y-6 flex flex-col h-full items-center text-center relative z-0">
                            <div className="w-20 h-20 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-xl font-black">PYQ</span>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {language === 'hi' ? 'विगत वर्षों के प्रश्न' : 'Previous Years Qs'}
                                </h2>
                                <p className="text-slate-500 text-sm">
                                    {language === 'hi' 
                                      ? 'पिछले वर्षों के पेपर्स के साथ वास्तविक परीक्षा का अभ्यास करें।' 
                                      : 'Practice with actual questions from previous year papers.'}
                                </p>
                            </div>
                            <Button 
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-auto rounded-xl h-12 font-bold gap-2 shadow-lg shadow-slate-900/10 border border-slate-900"
                            >
                                {language === 'hi' ? 'अभ्यास करें' : 'Practice Now'}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
       </div>

       <SyllabusLockModal open={unlockModalOpen} onOpenChange={setUnlockModalOpen} />

       {/* Back button exit confirmation modal */}
       <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2 text-amber-600">
               <AlertCircle className="w-5 h-5" />
               {language === 'hi' ? 'क्विज़ सेक्शन छोड़ें?' : 'Leave Quiz Section?'}
             </DialogTitle>
             <DialogDescription className="text-slate-600 pt-2">
               {language === 'hi'
                 ? 'क्या आप वाकई क्विज़ सेक्शन से बाहर जाना चाहते हैं?'
                 : 'Are you sure you want to leave the quiz section?'}
             </DialogDescription>
           </DialogHeader>
           <DialogFooter className="flex gap-2 sm:justify-end mt-4">
             <Button variant="outline" onClick={() => setShowExitModal(false)} className="flex-1 sm:flex-none">
               {language === 'hi' ? 'रहने दो' : 'Stay Here'}
             </Button>
             <Button variant="destructive" onClick={handleConfirmExit} className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700">
               {language === 'hi' ? 'हाँ, बाहर जाओ' : 'Yes, Leave'}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}
