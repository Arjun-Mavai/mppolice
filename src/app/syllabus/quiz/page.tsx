"use client"

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { useRouter } from 'next/navigation';
import { SyllabusTopicCard } from '@/components/SyllabusTopicCard';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

export default function QuizSelectionPage() {
  const router = useRouter();
  const { language, isSubscribed, user } = useSettingsStore();

  // 🚀 REDIRECT TO NEW PRIMARY VIEW (PYQ)
  useEffect(() => {
    router.replace('/syllabus/quiz/pyq');
  }, [router]);

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
            ? (isHindi ? 'आपकी प्रीमियम मेंबरशिप सक्रिय है।' : 'Your Premium Membership is Active.')
            : (isHindi ? 'अपनी तैयारी को एक नई दिशा दें।' : 'Kickstart your preparation today!')
    });
  }, [language, isSubscribed, user]);

  const hi = language === 'hi';

  const categories = [
    {
        id: 'pyq',
        title: hi ? 'विगत वर्षों के प्रश्न' : 'Previous Year Papers',
        desc: hi ? 'पिछले पेपर्स का विश्लेषण' : 'Analysis of actual MPPSC papers',
        emoji: '📜',
        color: 'slate',
        href: '/syllabus/quiz/pyq'
    },
    {
        id: 'topic',
        title: hi ? 'टॉपिक वाइज़' : 'Topic Quick Check',
        desc: hi ? '10 प्रश्नों का क्विक टेस्ट' : 'Quick 10-question pulse check',
        emoji: '✨',
        color: 'indigo',
        href: '/syllabus/quiz/topic'
    },
    {
        id: 'units',
        title: hi ? 'यूनिट वाइज़' : 'Unit Deep Dive',
        desc: hi ? 'पूरी यूनिट का मास्टर टेस्ट' : 'Comprehensive practice on full units',
        emoji: '🏷️',
        color: 'emerald',
        href: '/syllabus/quiz/units'
    },
    {
        id: 'full-length',
        title: hi ? 'फुल लेंथ मॉक' : 'Full Length Mock',
        desc: hi ? '100+ प्रश्नों का असली अनुभव' : '100 questions simulation',
        emoji: '🏆',
        color: 'amber',
        href: '/syllabus/quiz/full-length'
    },
    {
        id: 'csat',
        title: hi ? 'सीसैट (CSAT)' : 'CSAT Practice',
        desc: hi ? 'रीज़निंग और एप्टीट्यूड' : 'Reasoning & Aptitude',
        emoji: '🧠',
        color: 'pink',
        href: '/syllabus/quiz/csat'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans pb-20 relative overflow-hidden">
        {/* 🎭 PREMIUM BACKGROUND BLURS */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-100/50 to-transparent pointer-events-none" />
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-100px] w-[400px] h-[400px] bg-emerald-50/30 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-32">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => router.push('/syllabus')}
                            className="group -ml-3 text-slate-500 hover:text-slate-900 hover:bg-transparent p-0"
                        >
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all mr-3">
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">{hi ? 'पीछे' : 'Back'}</span>
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none" suppressHydrationWarning>
                            {isMounted ? welcomeMsg.title : '...'}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl" suppressHydrationWarning>
                            {isMounted ? welcomeMsg.subtitle : '...'}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* MCQ SELECTION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
                <AnimatePresence mode="popLayout">
                    {categories.map((item, index) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <SyllabusTopicCard
                                id={item.id}
                                title={item.title}
                                subtitle={item.desc}
                                impactEmoji={item.emoji}
                                colorVariant={(['blue', 'pink', 'emerald', 'amber'][index % 4] || 'blue') as any}
                                hideBadge
                                onClick={() => router.push(item.href)}
                                labels={{
                                    search: hi ? 'खोजें' : 'Search',
                                    topic: hi ? 'टॉपिक' : 'Topic',
                                    unit: hi ? 'यूनिट' : 'Unit'
                                }}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
       </div>

       <SyllabusLockModal open={unlockModalOpen} onOpenChange={setUnlockModalOpen} />

       <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
         <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-[2.5rem] overflow-hidden p-0">
           <div className="p-10 space-y-6">
               <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                   <AlertCircle className="w-10 h-10" />
               </div>
               
               <div className="space-y-2">
                 <h2 className="text-3xl font-black text-slate-900">
                    {hi ? 'क्विज़ छोड़ें?' : 'Leave Quiz?'}
                 </h2>
                 <p className="text-slate-500 font-medium leading-relaxed">
                   {hi
                     ? 'क्या आप वाकई क्विज़ सेक्शन से बाहर जाना चाहते हैं?'
                     : 'Are you sure you want to leave? Practicing regularly is key.'}
                 </p>
               </div>
               
               <div className="flex flex-col gap-3">
                 <Button 
                   onClick={() => setShowExitModal(false)}
                   className="h-16 font-black bg-slate-900 text-white hover:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200"
                 >
                   {hi ? 'नहीं, यहीं रहें' : 'Stay & Practice'}
                 </Button>
                 <Button 
                   variant="ghost" 
                   onClick={handleConfirmExit}
                   className="h-14 font-black text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl"
                 >
                   {hi ? 'हाँ, बाहर जाओ' : 'Yes, Leave Section'}
                 </Button>
               </div>
           </div>
         </DialogContent>
       </Dialog>
    </div>
  );
}
