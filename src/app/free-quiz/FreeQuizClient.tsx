'use client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🆓 FREE QUIZ CLIENT — Test listing + subject/unit filter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// QuizListItem reuse — same look as PYQ page
// Filter modal — subject + unit wise filter (compact)
// Hindi/English bilingual — useSettingsStore se language
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Sparkles, Filter, X, BookOpen, Clock, ChevronRight, Zap } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { QuizListItem } from '@/components/QuizListItem';
import { ConnectSocials } from '@/components/ConnectSocials';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { MP_Police_SECTIONS, MP_Police_SUBJECTS } from './constants';
import { notifyInstantModeGuideClick } from './actions';

interface FreeQuiz {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  description: string | null;
  totalQuestions: number | null;
  unitId: string | null;
  tags: unknown;
  createdAt: Date | string | null;
  isInstantMode?: boolean | null;
}

export default function FreeQuizClient({ quizzes, isLoggedIn }: { quizzes: FreeQuiz[], isLoggedIn?: boolean }) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  // Filter state — subject aur section wise
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [loadingTestId, setLoadingTestId] = useState<string | null>(null);
  const [instantModeOnly, setInstantModeOnly] = useState(false);
  const [showInstantGuide, setShowInstantGuide] = useState(false);

  // Tags se subject nikalo — har test ke tags me subject hoga
  const getTestSubject = (quiz: FreeQuiz): string | null => {
    const tags = quiz.tags as string[] | null;
    if (!tags || !Array.isArray(tags)) return null;
    // Tags me se subject match karo. Tag can be 'ui_bucket:general_knowledge' or just 'general_knowledge'
    const match = MP_Police_SUBJECTS.find((s) => tags.includes(s.value) || tags.includes(`ui_bucket:${s.value}`));
    return match?.value || tags[0] || null;
  };

  // Filter logic — subject + section se match karo
  const filteredQuizzes = useMemo(() => {
    let result = quizzes;
    if (instantModeOnly) {
      result = result.filter((q) => q.isInstantMode === true);
    } else {
      result = result.filter((q) => !q.isInstantMode);
    }
    if (selectedSubject) {
      result = result.filter((q) => getTestSubject(q) === selectedSubject);
    }
    if (selectedSection) {
      result = result.filter((q) => q.unitId === selectedSection);
    }
    return result;
  }, [quizzes, selectedSubject, selectedSection, instantModeOnly]);

  // Active filter count — badge me dikhega
  const activeFilters = (selectedSubject ? 1 : 0) + (selectedSection ? 1 : 0);

  // Clear all filters ek click me
  const clearFilters = () => {
    setSelectedSubject(null);
    setSelectedSection(null);
    setInstantModeOnly(false);
  };

  const handleQuizClick = (quiz: FreeQuiz) => {
    setLoadingTestId(quiz.id);
    router.push(`/free-quiz/play?testId=${quiz.id}`);
  };

  // Prefetch quiz data
  useEffect(() => {
    filteredQuizzes.slice(0, 10).forEach((quiz) => {
      router.prefetch(`/free-quiz/play?testId=${quiz.id}`);
    });
  }, [filteredQuizzes, router]);

  const renderSectionBadge = (unitId: string | null) => {
    if (!unitId) return null;
    const section = MP_Police_SECTIONS.find((u) => u.id === unitId);
    if (section) {
      return `🏛️ ${hi ? section.subjectHi : section.subject}`;
    }
    
    // Human readable fallback for sec_ tags
    let label = unitId;
    if (unitId.startsWith('sec_')) {
      label = unitId.replace('sec_', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    } else if (unitId.startsWith('unit_')) {
      label = `Unit ${unitId.replace('unit_', '')}`;
    }
    return `🏛️ ${label}`;
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50">
      {/* ── Header — sticky, same style as PYQ page ───────────── */}
      <div className="sticky top-14 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-2">
            {/* Title row — Compact on mobile */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight text-slate-900 sm:text-xl">
                    {hi ? 'MP Police फ्री डेली क्विज़' : 'Free Daily Quiz'}
                  </h1>
                  <p className="text-[10px] text-slate-500 sm:text-xs">
                    {hi ? 'हर रोज़ नए प्रश्न' : 'Fresh questions daily'}
                  </p>
                </div>
              </div>
 
              {/* ── Connect with Us — Minimal Social Icons ──────────────── */}
              <ConnectSocials minimal className="shrink-0 scale-90 sm:scale-100" />
            </div>

            {/* ── Filter Button + Active Filters ──────────────── */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterOpen(true)}
                className="gap-2 rounded-full border-slate-200 px-4 text-xs font-bold transition-transform active:scale-95"
              >
                <Filter className="h-3.5 w-3.5" />
                {hi ? 'फ़िल्तर' : 'Filter'}
                {activeFilters > 0 && (
                  <Badge className="ml-1 h-5 w-5 rounded-full bg-indigo-600 p-0 text-[10px] text-white">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
              {selectedSubject && (
                <Badge
                  variant="outline"
                  className="gap-1 rounded-full border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700"
                >
                  {hi
                    ? MP_Police_SUBJECTS.find((s) => s.value === selectedSubject)?.labelHi
                    : MP_Police_SUBJECTS.find((s) => s.value === selectedSubject)?.label || selectedSubject}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSubject(null)} />
                </Badge>
              )}
              {selectedSection && (
                <Badge
                  variant="outline"
                  className="gap-1 rounded-full border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700"
                >
                  {renderSectionBadge(selectedSection)?.replace('🏛️ ', '')}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSection(null)} />
                </Badge>
              )}
              {activeFilters > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium text-slate-400 transition-transform hover:text-red-500 active:scale-90"
                >
                  {hi ? 'सब हटाओ' : 'Clear'}
                </button>
              )}
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setShowInstantGuide(true);
                    notifyInstantModeGuideClick();
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-amber-200/50 bg-[#0f172a] px-2.5 py-1 shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  <Zap size={12} className="fill-amber-400 text-amber-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">
                    {hi ? 'गाइड देखें' : 'How to use'}
                  </span>
                </button>

                <div className="flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 px-2 py-1">
                  <Switch 
                    checked={instantModeOnly} 
                    onCheckedChange={setInstantModeOnly} 
                    className="scale-75 data-[state=checked]:bg-indigo-600"
                  />
                  <span className="text-[10px] font-bold text-indigo-700 tracking-wide uppercase">
                    ⚡ Instant Mode
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quiz List ────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-8 sm:px-6">
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold">
            {filteredQuizzes.length} {hi ? 'टेस्ट उपलब्ध' : 'Tests Available'}
          </span>
        </div>

        <div className="space-y-4">
          {filteredQuizzes.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="font-medium text-slate-400">
                {hi ? 'कोई टेस्ट नहीं मिला' : 'No tests found'}
              </p>
              {activeFilters > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-indigo-500 hover:underline"
                >
                  {hi ? 'फ़िल्टर हटाओ' : 'Clear filters'}
                </button>
              )}
            </div>
          ) : (
            filteredQuizzes.map((quiz, idx) => {
              const subject = getTestSubject(quiz);

              return (
                <div key={quiz.id} className="relative">
                  <QuizListItem
                    index={idx}
                    title={hi ? quiz.title : quiz.titleEn || quiz.title}
                    questions={quiz.totalQuestions || undefined}
                    itemLabel={hi ? 'प्रश्न' : 'Questions'}
                    marks={(quiz.totalQuestions || 0) * QUIZ_CONSTANTS.MARKS_PER_QUESTION}
                    duration={Math.ceil(
                      (quiz.totalQuestions || 0) * QUIZ_CONSTANTS.TIME_PER_QUESTION_MINUTES
                    )}
                    isLocked={false}
                    isFree={true}
                    language={language}
                    colorVariant={
                      (['emerald', 'blue', 'amber', 'pink', 'indigo'] as const)[idx % 5]
                    }
                    isLoading={loadingTestId === quiz.id}
                    onClick={() => handleQuizClick(quiz)}
                    onMouseEnter={() => router.prefetch(`/free-quiz/play?testId=${quiz.id}`)}
                  />
                  <div className="mt-1.5 flex items-center gap-2 pl-16 sm:pl-20">
                    {subject && (
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        📚{' '}
                        {hi
                          ? MP_Police_SUBJECTS.find((s) => s.value === subject)?.labelHi || subject
                          : MP_Police_SUBJECTS.find((s) => s.value === subject)?.label || subject}
                      </span>
                    )}
                    {quiz.unitId && (
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {renderSectionBadge(quiz.unitId)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Filter Modal — Subject + Unit select ─────────────── */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black">
              <Filter className="h-4 w-4 text-indigo-600" />
              {hi ? 'टेस्ट फ़िल्टर करो' : 'Filter Tests'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                {hi ? 'विषय चुनो' : 'Select Subject'}
              </p>
              <div className="flex flex-wrap gap-2">
                {MP_Police_SUBJECTS.map((sub) => (
                  <button
                    key={sub.value}
                    onClick={() =>
                      setSelectedSubject(selectedSubject === sub.value ? null : sub.value)
                    }
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-bold transition-all active:scale-95',
                      selectedSubject === sub.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {hi ? sub.labelHi : sub.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                {hi ? 'सेक्शन चुनो' : 'Select Section'}
              </p>
              <div className="flex flex-wrap gap-2">
                {MP_Police_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-bold transition-all active:scale-95',
                      selectedSection === section.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {hi ? section.subjectHi : section.subject}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-full text-xs font-bold active:scale-95"
                onClick={clearFilters}
              >
                {hi ? 'सब हटाओ' : 'Clear All'}
              </Button>
              <Button
                size="sm"
                className="flex-1 rounded-full bg-indigo-600 text-xs font-bold hover:bg-indigo-700 active:scale-95"
                onClick={() => setFilterOpen(false)}
              >
                {hi ? 'लागू करो' : 'Apply'}
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* ── Instant Mode Guide Modal ───────────────────────── */}
      <Dialog open={showInstantGuide} onOpenChange={setShowInstantGuide}>
        <DialogContent className="max-w-md gap-0 overflow-hidden border-slate-200 p-0 sm:rounded-[2rem]">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 p-6 sm:p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl shadow-indigo-500/10 ring-4 ring-indigo-50">
              <Zap className="h-8 w-8 text-indigo-600 fill-indigo-100" />
            </div>
            <h2 className="text-center text-xl font-black text-slate-900 sm:text-2xl">
              {hi ? 'इंस्टेंट मोड क्या है?' : 'What is Instant Mode?'}
            </h2>
            <p className="mt-2 text-center text-[10px] font-black uppercase tracking-widest text-indigo-600">
              {hi ? 'टेस्ट सबमिट करने का इंतज़ार खत्म!' : 'No need to wait for submit!'}
            </p>
          </div>
          
          <div className="space-y-6 bg-white p-6 sm:p-8">
            <p className="text-[13px] font-semibold leading-relaxed text-slate-600">
              {hi 
                ? "इस मोड में आपको पूरा टेस्ट खत्म करके 'Submit' करने की ज़रूरत नहीं है। बस किसी भी सवाल का जवाब चुनें, और तुरंत नीचे दिए गए बटन पर क्लिक करके उसका सही उत्तर और डिटेल में व्याख्या (Explanation) पढ़ें।" 
                : "In this mode, you don't need to finish the test and submit. Just select an answer and click the button below to instantly see the correct answer and detailed explanation."}
            </p>

            {/* MOCK UI OF THE QUIZ WITH CSS ANIMATION */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes pointerFlow {
                0% { transform: translate(140px, 160px) scale(1); opacity: 0; }
                10% { transform: translate(140px, 160px) scale(1); opacity: 1; }
                20% { transform: translate(190px, 20px) scale(1); opacity: 1; }
                25% { transform: translate(190px, 20px) scale(0.85); opacity: 1; }
                30% { transform: translate(190px, 20px) scale(1); opacity: 1; }
                45% { transform: translate(100px, 110px) scale(1); opacity: 1; }
                50% { transform: translate(100px, 110px) scale(0.85); opacity: 1; }
                55% { transform: translate(100px, 110px) scale(1); opacity: 1; }
                70% { transform: translate(140px, 240px) scale(1); opacity: 1; }
                80% { transform: translate(140px, 240px) scale(0.85); opacity: 1; }
                90% { transform: translate(140px, 240px) scale(1); opacity: 0; }
                100% { transform: translate(140px, 160px) scale(1); opacity: 0; }
              }
              @keyframes toggleSwitch {
                0%, 25% { transform: translateX(0); background-color: #cbd5e1; }
                30%, 100% { transform: translateX(100%); background-color: #4f46e5; }
              }
              @keyframes optionWrong {
                0%, 50% { background-color: #f8fafc; border-color: #e2e8f0; }
                55%, 100% { background-color: #fff1f2; border-color: #fecdd3; }
              }
              @keyframes optionWrongDot {
                0%, 50% { background-color: #f1f5f9; border-color: #cbd5e1; }
                55%, 100% { background-color: #ffe4e6; border-color: #fda4af; }
              }
              @keyframes optionRight {
                0%, 50% { background-color: #f8fafc; border-color: #e2e8f0; }
                55%, 100% { background-color: #ecfdf5; border-color: #10b981; }
              }
              @keyframes optionRightDot {
                0%, 50% { background-color: #f1f5f9; border-color: #cbd5e1; }
                55%, 100% { background-color: #10b981; border-color: #10b981; }
              }
              @keyframes pillGlow {
                0%, 75% { transform: scale(1); box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
                80%, 100% { transform: scale(1.05); box-shadow: 0 0 20px 0px rgba(16, 185, 129, 0.4); }
              }
            `}} />
            <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
              
              {/* TOP HEADER / TOGGLE */}
              <div className="flex items-center justify-end border-b border-slate-200 bg-white p-2 px-3">
                <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5">
                  <div className="flex h-3 w-[22px] rounded-full bg-slate-300 p-[2px] transition-colors" style={{ animation: 'toggleSwitch 6s infinite' }}>
                    <div className="h-2 w-2 rounded-full bg-white shadow-sm" />
                  </div>
                  <span className="text-[6px] font-bold text-slate-500">⚡ INSTANT</span>
                </div>
              </div>

              {/* QUIZ CONTENT */}
              <div className="bg-white p-4">
                <div className="mb-3 h-2 w-3/4 rounded-full bg-slate-200" />
                <div className="mb-4 h-2 w-1/2 rounded-full bg-slate-200" />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition-colors" style={{ animation: 'optionWrong 6s infinite' }}>
                    <div className="h-3 w-3 rounded-full border border-slate-300 bg-slate-100 transition-colors" style={{ animation: 'optionWrongDot 6s infinite' }} />
                    <div className="h-1.5 w-1/2 rounded-full bg-slate-300" />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition-colors" style={{ animation: 'optionRight 6s infinite' }}>
                    <div className="flex h-3 w-3 items-center justify-center rounded-full border border-slate-300 bg-slate-100 transition-colors" style={{ animation: 'optionRightDot 6s infinite' }}>
                      <div className="h-1 w-1 rounded-full bg-white" />
                    </div>
                    <div className="h-1.5 w-2/3 rounded-full bg-slate-300" />
                  </div>
                </div>
              </div>

              {/* CHECK ANSWER PILL */}
              <div className="relative border-t border-slate-200 bg-slate-100 p-4 py-5 text-center">
                <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all" style={{ animation: 'pillGlow 6s infinite' }}>
                  <Zap size={14} className="fill-emerald-400 text-emerald-400" />
                  {hi ? 'जवाब चेक करें' : 'Check Answer'}
                </div>
              </div>

              {/* THE ANIMATED POINTER */}
              <div className="pointer-events-none absolute left-0 top-0 z-50 text-3xl drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]" style={{ animation: 'pointerFlow 6s infinite' }}>
                👆🏽
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-amber-50/80 p-4 border border-amber-100">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs font-bold leading-relaxed text-amber-900/80">
                {hi 
                  ? "यह मोड आपके रिवीज़न को 10x फ़ास्ट बनाता है। आप अपनी गलतियों को तुरंत पकड़ सकते हैं और सीखते हुए आगे बढ़ सकते हैं।" 
                  : "This mode makes your revision 10x faster. You can catch your mistakes instantly and learn as you go."}
              </p>
            </div>

            <button
              onClick={() => setShowInstantGuide(false)}
              className="w-full rounded-full bg-gradient-to-r from-slate-900 to-slate-800 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-transform active:scale-95 hover:shadow-2xl"
            >
              {hi ? 'मुझे समझ आ गया' : 'Got it, let\'s go'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
