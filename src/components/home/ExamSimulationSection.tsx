'use client';

/**
 * ExamSimulationSection — Real Exam Simulation wala dark section bhai!
 * Updated to reflect Three Sections. One Paper. Full Syllabus logic.
 */

import React from 'react';
import { Trophy, CheckCircle2, X, Loader2, Sparkles, Zap, Brain, Sigma } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { calculateScore } from '@/lib/quiz-scoring';

export function ExamSimulationSection() {
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  const [mockStep, setMockStep] = React.useState<'intro' | 'active' | 'result'>('intro');
  const [mockQIndex, setMockQIndex] = React.useState(0);
  const [correctCount, setCorrectCount] = React.useState(0);
  const [wrongCount, setWrongCount] = React.useState(0);
  const [mockSelected, setMockSelected] = React.useState<number | null>(null);
  const [isPreparing, setIsPreparing] = React.useState(false);

  const mockQuestions = [
    {
      id: 1,
      type: 'GK',
      q: 'Which ruler of the Holkar dynasty moved the capital from Indore to Maheshwar?',
      q_hi: 'होल्कर वंश के किस शासक ने राजधानी को इंदौर से महेश्वर स्थानांतरित किया था?',
      options: ['Ahilyabai Holkar', 'Malhar Rao Holkar', 'Yashwant Rao Holkar', 'Tukoji Rao Holkar'],
      options_hi: ['अहिल्याबाई होल्कर', 'मल्हार राव होल्कर', 'यशवंत राव होल्कर', 'तुकोजी राव होल्कर'],
      correct: 0,
      explanation: hi ? 'देवी अहिल्याबाई होल्कर ने 1767 में महेश्वर को अपनी राजधानी बनाया और इसे एक सांस्कृतिक केंद्र के रूप में विकसित किया।' : 'Devi Ahilyabai Holkar made Maheshwar her capital in 1767 and developed it as a cultural center.'
    },
    {
      id: 2,
      type: 'Reasoning',
      q: 'If South-East becomes North, North-East becomes West and so on. What will West become?',
      q_hi: 'यदि दक्षिण-पूर्व उत्तर बन जाता है, उत्तर-पूर्व पश्चिम बन जाता है और इसी तरह। तो पश्चिम क्या बन जाएगा?',
      options: ['South-East', 'South-West', 'North-East', 'North-West'],
      options_hi: ['दक्षिण-पूर्व', 'दक्षिण-पश्चिम', 'उत्तर-पूर्व', 'उत्तर-पश्चिम'],
      correct: 0,
      explanation: hi ? 'दिशाओं को 135° वामावर्त (anti-clockwise) घुमाया जा रहा है। पश्चिम 135° घूमने पर दक्षिण-पूर्व बन जाएगा।' : 'Directions are rotated 135° anti-clockwise. West rotated 135° becomes South-East.'
    },
    {
      id: 3,
      type: 'Maths',
      q: 'A train 150m long is running at 54 km/hr. How much time will it take to cross a platform 250m long?',
      q_hi: '150 मीटर लंबी एक ट्रेन 54 किमी/घंटा की गति से चल रही है। 250 मीटर लंबे प्लेटफॉर्म को पार करने में उसे कितना समय लगेगा?',
      options: ['20 sec', '26.6 sec', '24 sec', '28 sec'],
      options_hi: ['20 सेकंड', '26.6 सेकंड', '24 सेकंड', '28 सेकंड'],
      correct: 1,
      explanation: hi ? 'कुल दूरी = 150+250 = 400m. गति = 54 * 5/18 = 15 m/s. समय = 400/15 = 26.6 सेकंड।' : 'Total Distance = 150+250 = 400m. Speed = 54 * 5/18 = 15 m/s. Time = 400/15 = 26.6 sec.'
    }
  ];

  const handleMockStart = () => {
    setIsPreparing(true);
    setTimeout(() => {
      setIsPreparing(false);
      setMockStep('active');
      setMockQIndex(0);
      setCorrectCount(0);
      setWrongCount(0);
      setMockSelected(null);
    }, 600);
  };

  const handleMockAnswer = (idx: number) => {
    if (mockSelected !== null) return;
    setMockSelected(idx);

    setTimeout(() => {
      if (idx === mockQuestions[mockQIndex].correct) {
        setCorrectCount((s) => s + 1);
      } else {
        setWrongCount((s) => s + 1);
      }

      if (mockQIndex < mockQuestions.length - 1) {
        setMockQIndex((prev) => prev + 1);
        setMockSelected(null);
      } else {
        setMockStep('result');
      }
    }, 1500); // More time to show feedback
  };

  const results = calculateScore(mockQuestions.length, correctCount, wrongCount);

  return (
    <section className="relative overflow-hidden bg-[#0F172A] py-32 text-white">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-[#0F172A] to-[#020617]"></div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-20 lg:grid-cols-2">
          {/* Interactive Mock Preview */}
          <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <div className="relative w-full max-w-lg">
              <div className="absolute -inset-1 animate-pulse rounded-[2.5rem] bg-gradient-to-r from-emerald-500 to-teal-600 opacity-50 blur-lg"></div>
              <Card className="relative z-10 flex min-h-[550px] flex-col overflow-hidden rounded-[2.5rem] border-0 bg-white text-slate-900 shadow-2xl">
                {/* HEADER */}
                <div className="flex shrink-0 items-center justify-between bg-slate-950 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-2 w-2 rounded-full bg-emerald-500 animate-pulse')} />
                    <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">
                      {mockStep === 'result' ? (hi ? 'परिणाम' : 'Result') : (hi ? 'लाइव सिम्युलेटर' : 'Live Simulator')}
                    </span>
                  </div>
                  {mockStep === 'active' && (
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                       Question {mockQIndex + 1}/3
                    </div>
                  )}
                </div>

                {/* BODY */}
                <div className="flex flex-1 flex-col justify-center p-8">
                  {mockStep === 'intro' && (
                    <div className="space-y-8 text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 rotate-3 shadow-inner">
                        <Zap className="h-10 w-10 text-emerald-600 fill-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">
                          {hi ? 'एग्जाम मोड ऑन करें?' : 'Turn on Exam Mode?'}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
                          {hi
                            ? 'GK, रीजनिंग और मैथ्स के चुनिंदा प्रश्नों के साथ अपनी गति और सटीकता को अभी परखें।'
                            : 'Test your speed and accuracy with curated questions from GK, Reasoning, and Maths.'}
                        </p>
                      </div>
                      <Button
                        onClick={handleMockStart}
                        className="h-14 w-full rounded-2xl bg-emerald-600 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
                      >
                        {isPreparing ? <Loader2 className="h-5 w-5 animate-spin" /> : (hi ? 'सिम्युलेटर शुरू करें' : 'Start Simulator')}
                      </Button>
                    </div>
                  )}

                  {mockStep === 'active' && (
                    <div className="w-full space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                         {mockQuestions[mockQIndex].type === 'GK' && <Brain className="h-4 w-4 text-purple-500" />}
                         {mockQuestions[mockQIndex].type === 'Reasoning' && <Zap className="h-4 w-4 text-amber-500" />}
                         {mockQuestions[mockQIndex].type === 'Maths' && <Sigma className="h-4 w-4 text-blue-500" />}
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{mockQuestions[mockQIndex].type}</span>
                      </div>

                      <h3 className="text-lg leading-snug font-black text-slate-900">
                        {hi ? mockQuestions[mockQIndex].q_hi : mockQuestions[mockQIndex].q}
                      </h3>

                      <div className="grid gap-3">
                        {(hi ? mockQuestions[mockQIndex].options_hi : mockQuestions[mockQIndex].options).map((opt: string, idx: number) => (
                          <div
                            key={idx}
                            onClick={() => handleMockAnswer(idx)}
                            className={cn(
                              'relative cursor-pointer overflow-hidden rounded-2xl border-2 p-4 text-sm font-bold transition-all',
                              mockSelected === null
                                ? 'border-slate-100 hover:border-emerald-500 hover:bg-emerald-50'
                                : mockSelected === idx
                                  ? idx === mockQuestions[mockQIndex].correct
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-inner'
                                    : 'border-rose-500 bg-rose-50 text-rose-900 shadow-inner'
                                  : 'opacity-50 border-slate-50'
                            )}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>

                      {mockSelected !== null && (
                         <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-100 animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-xs font-bold leading-relaxed text-slate-600">
                               <span className="text-emerald-600 font-black uppercase tracking-tighter mr-2">{hi ? 'व्याख्या:' : 'Expl:'}</span>
                               {mockQuestions[mockQIndex].explanation}
                            </p>
                         </div>
                      )}
                    </div>
                  )}

                  {mockStep === 'result' && (
                    <div className="space-y-8 text-center">
                      <div className="relative inline-block">
                        <Trophy className="h-20 w-20 text-amber-500 mx-auto" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">
                           {correctCount === 3 ? (hi ? 'शानदार स्कोर!' : 'Perfect Score!') : (hi ? 'अच्छा प्रयास!' : 'Good Effort!')}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                           {hi ? 'MP Police 2026 के नए पैटर्न के लिए आप तैयार हैं।' : 'You are getting ready for the new MP Police 2026 pattern.'}
                        </p>
                      </div>
                      <div className="flex gap-4">
                         <div className="flex-1 rounded-2xl bg-slate-50 p-4 text-center">
                            <div className="text-xl font-black text-slate-900">{results.percentage}%</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{hi ? 'सटीकता' : 'Accuracy'}</div>
                         </div>
                         <div className="flex-1 rounded-2xl bg-emerald-600 p-4 text-center text-white">
                            <div className="text-xl font-black">{correctCount}/3</div>
                            <div className="text-[10px] font-black opacity-80 uppercase tracking-widest">{hi ? 'सही' : 'Correct'}</div>
                         </div>
                      </div>
                      <Button
                        onClick={() => setMockStep('intro')}
                        variant="ghost"
                        className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
                      >
                        {hi ? 'पुनः प्रयास करें' : 'Try Again'}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Text Content */}
          <div className="order-1 space-y-10 lg:order-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-1.5 text-xs font-black tracking-widest uppercase">
               <Sparkles size={14} className="mr-2" />
               {hi ? 'पूर्ण पाठ्यक्रम' : 'Full Syllabus Coverage'}
            </Badge>
            <h2 className="text-5xl font-black tracking-tight text-white md:text-7xl">
              {hi ? (
                <>
                  तीन सेक्शन। <br />
                  एक पेपर। <br />
                  <span className="text-emerald-500">पूरा सिलेबस।</span>
                </>
              ) : (
                <>
                  Three Sections. <br />
                  One Paper. <br />
                  <span className="text-emerald-500">Full Syllabus.</span>
                </>
              )}
            </h2>
            <p className="text-lg leading-relaxed font-medium text-slate-400 md:text-xl">
              {hi
                ? 'MP Police के नए 300-अंकों वाले पैटर्न के हर पहलू को कवर करता है। GK-Science, Reasoning और Maths के लिए विशेष रूप से तैयार किया गया कंटेंट।'
                : "Covers every aspect of the new 300-mark MP Police pattern. Specialized content tailored for GK-Science, Reasoning, and Maths."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/10">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                     <Brain className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-300">{hi ? '1000+ वन-लाइनर्स' : '1000+ One-Liners'}</span>
               </div>
               <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/10">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                     <Sigma className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-300">{hi ? 'गणित समाधान' : 'Maths Solutions'}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
