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

interface Test {
  id: string;
  title: string;
  titleEn?: string | null;
  description: string | null;
  type: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number | null;
  maxRetries: number | null;
  isPro: boolean | null;
  createdAt: Date | null;
  isLocked: boolean;
  isFree: boolean;
  attemptsLeft: number | null;
}

interface CSATPageClientProps {
  initialTests: Test[];
}

export default function CSATPageClient({ initialTests }: CSATPageClientProps) {
  const router = useRouter();
  const { language, user } = useSettingsStore();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const handleTestClick = (test: Test) => {
    if (test.isLocked) {
      setPaywallOpen(true);
      return;
    }
    router.push(`/syllabus/quiz/play?mode=full&testId=${test.id}`);
  };

  const hi = language === 'hi';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafbfc] pb-20 font-sans">
      {/* 🎭 PREMIUM BACKGROUND BLURS */}
      <div className="pointer-events-none absolute top-0 left-0 h-[500px] w-full bg-gradient-to-b from-slate-100/30 to-transparent" />
      <div className="pointer-events-none absolute top-[-100px] right-[-100px] h-[500px] w-[500px] rounded-full bg-indigo-50/40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[-150px] h-[400px] w-[400px] rounded-full bg-emerald-50/30 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-32">
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
          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            {hi ? 'सीसैट (CSAT)' : 'CSAT Practice'}
          </h1>
          <p className="mx-auto max-w-xl font-medium text-slate-500">
            {hi
              ? 'सिविल सेवा अभिरुचि परीक्षण के लिए सटीक अभ्यास।'
              : 'Civil Services Aptitude Test practice with balanced reasoning and aptitude.'}
          </p>
        </motion.div>

        {/* 📝 LIST VIEW */}
        <div className="space-y-4 pb-32 md:pb-20">
          <AnimatePresence mode="popLayout">
            {initialTests.map((test, idx) => (
              <QuizListItem
                key={test.id}
                index={idx}
                title={hi ? test.title : test.titleEn || test.title}
                questions={test.totalQuestions || undefined}
                itemLabel={hi ? 'प्रश्न' : 'Questions'}
                marks={(test.totalQuestions || 0) * 2} // CSAT usually 2 marks/question
                duration={test.durationMinutes}
                isLocked={test.isLocked}
                isFree={test.isFree}
                attemptsLeft={test.attemptsLeft}
                maxAttempts={test.maxRetries}
                language={language}
                colorVariant={(['amber', 'emerald', 'pink', 'blue', 'indigo'] as const)[idx % 5]}
                onClick={() => handleTestClick(test)}
              />
            ))}
          </AnimatePresence>

          {initialTests.length === 0 && (
            <div className="rounded-[2.5rem] border border-dashed border-slate-100 bg-white py-20 text-center shadow-sm">
              <p className="font-medium text-slate-400">
                {hi ? 'कोई CSAT टेस्ट उपलब्ध नहीं।' : 'No CSAT Tests available at the moment.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <SyllabusLockModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
