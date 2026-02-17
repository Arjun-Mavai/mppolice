'use client';

import React, { useEffect, useState } from 'react';
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
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // ⚡ LIGHT SPEED PREFETCH: First 6 units on mount
  useEffect(() => {
    availableTests.slice(0, 6).forEach((test) => {
      // Only prefetch free ones for guests, or all for users
      if (!user && !test.isFreeAccess) return;
      router.prefetch(`/syllabus/quiz/play?mode=topic&testId=${test.id}`);
    });
  }, [availableTests, router, user]);

  const isAdmin = (user as any)?.role === 'admin';
  const isSubscribed = user?.isSubscribed || false;
  const userTier = user?.planTier || 'free';
  const effectiveTier = !user
    ? 'guest'
    : isSubscribed
      ? userTier === 'free'
        ? 'lite'
        : userTier
      : 'free';
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
    <div className="relative min-h-screen overflow-hidden bg-[#fafbfc] pb-20 font-sans">
      {/* 🎭 PREMIUM BACKGROUND BLURS */}
      <div className="pointer-events-none absolute top-0 left-0 h-[500px] w-full bg-gradient-to-b from-slate-100/30 to-transparent" />
      <div className="pointer-events-none absolute top-[-100px] right-[-100px] h-[500px] w-[500px] rounded-full bg-indigo-50/40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[-150px] h-[400px] w-[400px] rounded-full bg-emerald-50/30 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-10 md:pt-8">
        {/* Header */}
        <div className="mb-8">{/* Back button removed as requested */}</div>

        {/* 🧭 CONSOLIDATED SUB-NAV - Moved to Layout */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 space-y-2 text-center"
        >
          <h1 className="text-4xl leading-none font-black tracking-tight text-slate-900 md:text-5xl">
            {hi ? 'यूनिट टेस्ट' : 'Unit Tests'}
          </h1>
          <p className="mx-auto max-w-xl font-medium text-slate-500">
            {hi
              ? 'अपनी तैयारी को मजबूत करने के लिए यूनिट चुनें।'
              : 'Select a unit to strengthen your preparation and score.'}
          </p>
        </motion.div>

        {/* 📝 LIST VIEW */}
        <div className="space-y-4 pb-32 md:pb-20">
          <AnimatePresence mode="popLayout">
            {availableTests.map((test, idx) => {
              const unitData = test.unitId ? syllabusData.units[test.unitId] : null;

              const title = hi
                ? test.title || unitData?.title || unitData?.title_en || 'Unknown Unit'
                : test.titleEn ||
                  unitData?.title_en ||
                  test.title ||
                  unitData?.title ||
                  'Unknown Unit';

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
                  isLoading={loadingId === test.id}
                  onClick={() => {
                    if (!isLocked) setLoadingId(test.id);
                    handleUnitClick(test.id, isLocked);
                  }}
                  onMouseEnter={() => {
                    if (!isLocked)
                      router.prefetch(`/syllabus/quiz/play?mode=topic&testId=${test.id}`);
                  }}
                  onTouchStart={() => {
                    if (!isLocked)
                      router.prefetch(`/syllabus/quiz/play?mode=topic&testId=${test.id}`);
                  }}
                />
              );
            })}
          </AnimatePresence>

          {availableTests.length === 0 && (
            <div className="rounded-[2.5rem] border border-dashed border-slate-100 bg-white py-20 text-center shadow-sm">
              <p className="font-medium text-slate-500">
                {hi
                  ? 'अभी कोई यूनिट टेस्ट उपलब्ध नहीं है।'
                  : 'No Unit Tests available at the moment.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <SyllabusLockModal open={unlockModalOpen} onOpenChange={setUnlockModalOpen} />
    </div>
  );
}
