'use client';

/**
 * ExamSimulationSection — Real Exam Simulation wala dark section bhai!
 * Yeh ek interactive mock test demo hai — 4 questions ka mini quiz.
 * Intro → Active (answering) → Result — teen states hain.
 * All mock quiz state is self-contained inside this component.
 */

import React from 'react';
import { Trophy, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

export function ExamSimulationSection() {
  const { language } = useSettingsStore();

  const [mockStep, setMockStep] = React.useState<'intro' | 'active' | 'result'>('intro');
  const [mockQIndex, setMockQIndex] = React.useState(0);
  const [mockScore, setMockScore] = React.useState(0);
  const [mockSelected, setMockSelected] = React.useState<number | null>(null);

  const mockQuestions = [
    {
      id: 1,
      q: 'Which article of the Constitution deals with the Election Commission?',
      q_hi: 'संविधान का कौन सा अनुच्छेद चुनाव आयोग से संबंधित है?',
      options: ['Article 324', 'Article 325', 'Article 326', 'Article 328'],
      options_hi: ['अनुच्छेद 324', 'अनुच्छेद 325', 'अनुच्छेद 326', 'अनुच्छेद 328'],
      correct: 0,
    },
    {
      id: 2,
      q: 'Who was the first Governor of Madhya Pradesh?',
      q_hi: 'मध्य प्रदेश के प्रथम राज्यपाल कौन थे?',
      options: ['H.V. Pataskar', 'Pattabhi Sitaramayya', 'K.C. Reddy', 'S.N. Sinha'],
      options_hi: ['एच.वी. पाटस्कर', 'पट्टाभि सितारमैया', 'के.सी. रेड्डी', 'एस.एन. सिन्हा'],
      correct: 1,
    },
    {
      id: 3,
      q: 'Kalidas Samman is given in which text?',
      q_hi: 'कालिदास सम्मान किस क्षेत्र में दिया जाता है?',
      options: ['Folk Art', 'Classical Music', 'Literature', 'All of these'],
      options_hi: ['लोक कला', 'शास्त्रीय संगीत', 'साहित्य', 'ये सभी'],
      correct: 3,
    },
    {
      id: 4,
      q: 'River Narmada originates from?',
      q_hi: 'नर्मदा नदी का उद्गम स्थल है?',
      options: ['Multai', 'Amarkantak', 'Jana-Pava', 'Kakri-Bardi'],
      options_hi: ['मुलताई', 'अमरकंटक', 'जना-पावा', 'काकरी-बर्डी'],
      correct: 1,
    },
  ];

  const handleMockStart = () => {
    setMockStep('active');
    setMockQIndex(0);
    setMockScore(0);
    setMockSelected(null);
  };

  const handleMockAnswer = (idx: number) => {
    if (mockSelected !== null) return;
    setMockSelected(idx);

    setTimeout(() => {
      if (idx === mockQuestions[mockQIndex].correct) {
        setMockScore((s) => s + 1);
      }

      if (mockQIndex < mockQuestions.length - 1) {
        setMockQIndex((prev) => prev + 1);
        setMockSelected(null);
      } else {
        setMockStep('result');
      }
    }, 800);
  };

  return (
    <section className="relative overflow-hidden bg-slate-900 py-32 text-white">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950"></div>
      <div className="pointer-events-none absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-rose-500/10 blur-[100px]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-20 lg:grid-cols-2">
          <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <div className="relative w-full max-w-lg">
              <div className="absolute -inset-1 animate-pulse rounded-3xl bg-gradient-to-r from-rose-500 to-pink-600 opacity-75 blur-md"></div>
              <Card className="relative z-10 flex min-h-[500px] flex-col overflow-hidden rounded-3xl border-0 bg-white text-slate-900 shadow-2xl transition-all duration-300">
                {/* HEADER */}
                <div className="flex shrink-0 items-center justify-between bg-slate-950 bg-[url('/grid.svg')] p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        mockStep === 'active' ? 'animate-ping bg-red-500' : 'bg-slate-500'
                      )}
                    />
                    <span className="text-sm font-bold tracking-widest text-slate-300 uppercase">
                      {mockStep === 'result'
                        ? language === 'hi'
                          ? 'टेस्ट परिणाम'
                          : 'Test Result'
                        : language === 'hi'
                          ? 'लाइव मॉक टेस्ट'
                          : 'Live Mock Test'}
                    </span>
                  </div>
                </div>

                {/* BODY */}
                <div className="flex flex-1 flex-col justify-center p-8">
                  {/* INTRO STATE */}
                  {mockStep === 'intro' && (
                    <div className="animate-in fade-in zoom-in space-y-6 text-center duration-300">
                      <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
                        <Trophy className="h-10 w-10 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">
                          {language === 'hi' ? 'चुनौती के लिए तैयार हैं?' : 'Ready to Challenge?'}
                        </h3>
                        <p className="mt-2 text-slate-500">
                          {language === 'hi'
                            ? 'अपनी तैयारी के स्तर को जांचने के लिए 4-प्रश्नों का डेमो टेस्ट लें।'
                            : 'Take a quick 4-question demo to see your preparation level.'}
                        </p>
                      </div>
                      <Button
                        onClick={handleMockStart}
                        className="h-12 w-full rounded-xl bg-rose-600 font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-700"
                      >
                        {language === 'hi' ? 'डेमो टेस्ट शुरू करें' : 'Start Demo Test'}
                      </Button>
                    </div>
                  )}

                  {/* ACTIVE STATE */}
                  {mockStep === 'active' && (
                    <div className="animate-in slide-in-from-right fade-in w-full space-y-6 duration-300">
                      <div className="mb-2 flex gap-2">
                        {mockQuestions.map((_, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'h-1 flex-1 rounded-full transition-colors duration-300',
                              idx <= mockQIndex ? 'bg-rose-500' : 'bg-slate-100'
                            )}
                          />
                        ))}
                      </div>

                      <h3 className="flex min-h-[5rem] items-center text-lg leading-snug font-bold">
                        {language === 'hi'
                          ? (mockQuestions[mockQIndex] as any).q_hi
                          : mockQuestions[mockQIndex].q}
                      </h3>

                      <div className="grid grid-cols-1 gap-3">
                        {(language === 'hi'
                          ? (mockQuestions[mockQIndex] as any).options_hi
                          : mockQuestions[mockQIndex].options
                        ).map((opt: string, idx: number) => (
                          <div
                            key={idx}
                            onClick={() => handleMockAnswer(idx)}
                            className={cn(
                              'relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 p-4 text-sm font-medium transition-all',
                              mockSelected === null
                                ? 'hover:border-slate-900 hover:bg-slate-50'
                                : mockSelected === idx
                                  ? idx === mockQuestions[mockQIndex].correct
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                                    : 'border-red-500 bg-red-50 text-red-900'
                                  : 'opacity-50'
                            )}
                          >
                            {opt}
                            {mockSelected === idx && (
                              <div className="absolute top-3.5 right-3">
                                {idx === mockQuestions[mockQIndex].correct ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                ) : (
                                  <X className="h-5 w-5 text-red-600" />
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* RESULT STATE */}
                  {mockStep === 'result' && (
                    <div className="animate-in zoom-in fade-in space-y-6 text-center duration-500">
                      <div className="relative inline-block">
                        <div className="absolute -inset-4 animate-pulse rounded-full bg-emerald-500/20 blur-xl"></div>
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-900 shadow-xl">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-emerald-400">{mockScore}/4</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                              Score
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900">
                          {mockScore === 4
                            ? language === 'hi'
                              ? 'शानदार!'
                              : 'Outstanding!'
                            : mockScore >= 2
                              ? language === 'hi'
                                ? 'बहुत अच्छे!'
                                : 'Good Job!'
                              : language === 'hi'
                                ? 'सुधार की आवश्यकता है'
                                : 'Needs Work'}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {language === 'hi'
                            ? 'आप असली परीक्षा के लिए तैयार हैं। अब पूर्ण 100-प्रश्नों के मॉक टेस्ट अनलॉक करें।'
                            : "You're ready for the real deal. Unlock full 100-question mock tests now."}
                        </p>
                      </div>

                      <div className="flex justify-around rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                        <div>
                          <div className="text-xl font-bold text-slate-900">92%</div>
                          <div className="text-xs text-slate-500">
                            {language === 'hi' ? 'सटीकता' : 'Accuracy'}
                          </div>
                        </div>
                        <div className="w-px bg-slate-200"></div>
                        <div>
                          <div className="text-xl font-bold text-slate-900">Top 5%</div>
                          <div className="text-xs text-slate-500">
                            {language === 'hi' ? 'रैंक' : 'Rank'}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleMockStart}
                        variant="ghost"
                        className="text-sm text-slate-400 hover:text-slate-900"
                      >
                        {language === 'hi' ? 'पुनः प्रयास करें' : 'Try Again'}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <div className="order-1 space-y-8 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-sm font-bold text-rose-300">
              <Trophy size={14} /> {language === 'hi' ? 'परीक्षा तैयारी' : 'Exam Readiness'}
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {language === 'hi' ? 'वास्तविक परीक्षा सिमुलेशन।' : 'Real Exam Simulation.'}
            </h2>
            <p className="text-lg leading-relaxed font-medium text-slate-400">
              {language === 'hi'
                ? '2 घंटे के मैराथन के लिए अपने दिमाग को प्रशिक्षित करें। असली परीक्षा जैसा इंटरफ़ेस, टाइमर दबाव और कठिनाई स्तर — अब आपके हाथ में।'
                : 'Train your brain for the 2-hour marathon. Full-length mock tests with the exact same interface, timer pressure, and difficulty level as the real exam.'}
            </p>
            <Button className="h-14 rounded-full bg-rose-600 px-8 text-lg font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500">
              {language === 'hi' ? 'फ्री मॉक टेस्ट शुरू करें' : 'Start Free Mock Test'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
