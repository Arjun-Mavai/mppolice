'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { useRouter } from 'next/navigation';
import { QuizListItem } from '@/components/QuizListItem';
import { QuizSubNav } from '@/features/syllabus/components/QuizSubNav';
import { QUIZ_CONSTANTS } from '@/config/quiz';

export interface TestWithAccess {
    id: string;
    title: string;
    titleEn?: string | null;
    description: string | null;
    durationMinutes: number;
    totalMarks: number;
    totalQuestions: number;
    maxRetries: number | null;
    
    isLocked: boolean;
    isCompleted: boolean;
    attemptsCount: number;
    attemptsLeft: number | null;
    isFree: boolean;
}

interface FLTPageClientProps {
    tests: TestWithAccess[];
}

export default function FLTPageClient({ tests }: FLTPageClientProps) {
    const router = useRouter();
    const { language } = useSettingsStore();
    const [paywallOpen, setPaywallOpen] = useState(false);

    const handleTestClick = (testId: string, isLocked: boolean, attemptsLeft: number | null) => {
        if (isLocked) {
            setPaywallOpen(true);
            return;
        }

        if (attemptsLeft !== null && attemptsLeft > 0) {
            router.push(`/syllabus/quiz/play?mode=full&testId=${testId}`);
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
                
                {/* Header Row */}
                {/* <div className="flex items-center justify-between mb-8">
                     <Button 
                        variant="ghost" 
                        onClick={() => router.push('/syllabus/quiz')}
                        className="group -ml-3 text-slate-500 hover:text-slate-900 hover:bg-transparent p-0"
                    >
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all mr-3">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest">{hi ? 'क्विज़ हब' : 'Quiz Hub'}</span>
                    </Button>
                </div> */}

                {/* 🧭 CONSOLIDATED SUB-NAV */}
                <QuizSubNav />
                
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 space-y-2 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        {hi ? 'फुल लेंथ टेस्ट' : 'Full Length Tests'}
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">
                        {hi ? 'असली परीक्षा जैसा माहौल और पूरी तैयारी।' : 'Simulate the real exam environment with comprehensive mocks.'}
                    </p>
                </motion.div>

                {/* 📝 LIST VIEW */}
                <div className="space-y-4 pb-32 md:pb-20">
                    <AnimatePresence mode="popLayout">
                        {tests.map((test, idx) => (
                            <QuizListItem
                                key={test.id}
                                index={idx}
                                title={hi ? test.title : (test.titleEn || test.title)}
                                questions={test.totalQuestions}
                                itemLabel={hi ? 'प्रश्न' : 'Questions'}
                                marks={test.totalQuestions * QUIZ_CONSTANTS.MARKS_PER_QUESTION}
                                duration={test.durationMinutes}
                                isLocked={test.isLocked}
                                isCompleted={test.isCompleted}
                                attemptsLeft={test.attemptsLeft}
                                maxAttempts={test.maxRetries}
                                isFree={test.isFree}
                                language={language}
                                colorVariant={(['amber', 'emerald', 'pink', 'blue', 'indigo'] as const)[idx % 5]}
                                onClick={() => handleTestClick(test.id, test.isLocked, test.attemptsLeft)}
                            />
                        ))}
                    </AnimatePresence>
                    
                    {tests.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm border-dashed">
                            <p className="text-slate-400 font-medium">
                                {hi ? 'इस कैटेगरी में अभी कोई टेस्ट नहीं हैं।' : 'No tests available in this category yet.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            <SyllabusLockModal open={paywallOpen} onOpenChange={setPaywallOpen} />
        </div>
    );
}
