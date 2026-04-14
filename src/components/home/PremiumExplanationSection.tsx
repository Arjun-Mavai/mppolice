'use client';

/**
 * PremiumExplanationSection — GK/GS Mastery with structured context!
 * Mimics the "Instant Mode" from the quiz interface for a real prep feel.
 */

import React from 'react';
import {
  CheckCircle2,
  Lightbulb,
  Brain,
  ArrowRight,
  Sparkles,
  BookOpen,
  ListOrdered,
  Route,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

export function PremiumExplanationSection() {
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  return (
    <section className="relative overflow-hidden border-t border-slate-200 bg-white py-24 md:py-32">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 h-96 w-96 bg-emerald-500/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-96 w-96 bg-amber-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <Badge
            variant="outline"
            className="mb-6 rounded-full border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-black tracking-widest text-emerald-700 uppercase"
          >
            {hi ? 'प्रीमियम कंटेंट' : 'Premium Content'}
          </Badge>
          <h2 className="mb-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
            {hi ? (
              <>
                सिर्फ जवाब नहीं, <span className="text-emerald-600">सटीक समाधान।</span>
              </>
            ) : (
              <>
                Not Just Answers, <span className="text-emerald-600">Precision Logic.</span>
              </>
            )}
          </h2>
          <p className="text-lg leading-relaxed font-medium text-slate-600 md:text-xl">
            {hi
              ? 'हर प्रश्न के पीछे की गहराई को समझें। हमने हर उत्तर के साथ स्टेप-बाय-स्टेप लॉजिक और याद रखने की ट्रिक्स जोड़ी हैं।'
              : 'Understand the depth behind every question. We provide step-by-step logic, pattern analysis, and memory tricks for every answer.'}
          </p>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Card: The Deep Dive Explanation (Mocking Quiz Interface) */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-teal-600/20 opacity-40 blur-2xl" />
            <Card className="relative z-10 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)]">
              {/* Question Header (Mocking QuizQuestion header) */}
              <div className="border-b border-slate-100 bg-slate-50/50 p-6 md:p-8">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                      <span>{hi ? 'प्रश्न' : 'Question'} 1/1</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black tracking-tight text-slate-500 shadow-sm">
                        <Clock className="h-2.5 w-2.5 text-indigo-500" />
                        0:45
                      </span>
                    </div>
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                      {hi ? 'GK / GS · मध्य प्रदेश' : 'GK / GS · Madhya Pradesh'}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-black leading-tight text-slate-900 md:text-2xl">
                    {hi
                      ? 'सांची का स्तूप भारत के किस राज्य में स्थित है?'
                      : 'In which state of India is the Sanchi Stupa located?'}
                  </h3>
                </div>
              </div>

              {/* Options (Mocking QuizQuestion options) */}
              <div className="space-y-3 p-6 md:px-10 md:pt-8 md:pb-4">
                {[
                  { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' },
                  { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश', correct: true },
                  { en: 'Bihar', hi: 'बिहार' },
                  { en: 'Maharashtra', hi: 'महाराष्ट्र' },
                ].map((opt, idx) => {
                  const isCorrect = opt.correct;
                  const isSelected = opt.correct; // Show as if user selected correct one
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'relative flex items-center justify-between rounded-xl border-2 p-4 transition-all',
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-md'
                          : 'border-slate-200 opacity-40'
                      )}
                    >
                      <span
                        className={cn(
                          'text-base sm:text-lg',
                          isCorrect ? 'font-bold text-emerald-800' : 'text-slate-700'
                        )}
                      >
                        {hi ? opt.hi : opt.en}
                      </span>
                      {isCorrect && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                      )}
                      {isCorrect && (
                        <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-emerald-500" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Structured Explanation (Mocking StructuredExplanationBlock) */}
              <div className="px-6 pb-10 md:px-10">
                <div
                  className={cn(
                    'mt-4 overflow-hidden rounded-2xl border shadow-sm',
                    'border-amber-200/70 bg-gradient-to-b from-amber-50/80 via-white to-orange-50/25'
                  )}
                >
                  <div className="border-b border-amber-100/90 bg-amber-500/[0.08] px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2 text-amber-950">
                      <BookOpen className="h-5 w-5 shrink-0 text-amber-700" />
                      <span className="text-xs font-black uppercase tracking-widest text-amber-950">
                        {hi ? 'GK / GS · समझ के साथ' : 'GK / GS · with context'}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-700 sm:text-sm">
                      {hi
                        ? 'सिर्फ याद नहीं — समझ भी। तथ्य + याद रखने का तरीका + आगे क्या पढ़ना है, सब यहीं है।'
                        : 'Not just facts — context + how to remember + what to revise next, in one place.'}
                    </p>
                  </div>

                  <div className="space-y-4 p-4 sm:p-5">
                    {/* Logic Section */}
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/90 shadow-sm ring-1 ring-black/[0.04]">
                          <Brain className="h-3.5 w-3.5 text-amber-700" />
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-950">
                          {hi ? 'तर्क एवं विश्लेषण' : 'Core Logic'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        {hi
                          ? 'सांची का महान स्तूप मध्य प्रदेश के रायसेन जिले में है। इसका निर्माण सम्राट अशोक ने करवाया था।'
                          : 'The Great Stupa at Sanchi is in the Raisen district of Madhya Pradesh, built by Emperor Ashoka.'}
                      </p>
                    </div>

                    {/* Main Points */}
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/90 shadow-sm ring-1 ring-black/[0.04]">
                          <ListOrdered className="h-3.5 w-3.5 text-amber-700" />
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-950">
                          {hi ? 'मुख्य बातें (एक-एक करके)' : 'Main points (one by one)'}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {(hi
                          ? [
                              'सांची का स्तूप भारत की सबसे पुरानी पत्थर की इमारतों में से एक है। इसे मौर्य सम्राट अशोक ने तीसरी शताब्दी ईसा पूर्व में बनवाया था।',
                              'यह बौद्ध धर्म का एक प्रमुख केंद्र है, लेकिन दिलचस्प बात यह है कि भगवान बुद्ध कभी खुद सांची नहीं गए थे!',
                              'इसे 1989 में यूनेस्को (UNESCO) विश्व धरोहर स्थल घोषित किया गया था, इसलिए यह एमपी पुलिस परीक्षा का फेवरेट सवाल है।',
                            ]
                          : [
                              'Sanchi Stupa is one of India\'s oldest stone structures, commissioned by the Mauryan Emperor Ashoka in the 3rd century BCE.',
                              'It\'s a massive hub for Buddhism, yet surprisingly, Lord Buddha himself never actually visited Sanchi during his lifetime!',
                              'UNESCO tagged it as a World Heritage Site back in 1989, making it a highly frequent question in state exams.',
                            ]
                        ).map((s, i) => (
                          <li
                            key={i}
                            className="flex gap-3 rounded-xl border border-amber-100/90 bg-white/95 px-3 py-2.5"
                          >
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500 text-[11px] font-black text-white">
                              ✓
                            </span>
                            <span className="text-[13px] leading-[1.55] text-slate-800 sm:text-[14px]">
                              {s}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Mnemonic Section */}
                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 p-3 sm:p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/90 shadow-sm ring-1 ring-black/[0.04]">
                          <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-950">
                          {hi ? 'दिमाग में बैठ जाए (हुक)' : 'Sticky hooks (mnemonics)'}
                        </span>
                      </div>
                      <p className="text-[13px] font-medium leading-relaxed text-amber-950 sm:text-[14px]">
                        {hi
                          ? "'सांची' में 'शांति' है, और शांति भारत के 'मध्य' (मध्य प्रदेश) में मिलती है।"
                          : "Sanchi = Sanctuary of peace in the 'Middle' (Madhya) of India."}
                      </p>
                    </div>

                    {/* Also Revise */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 sm:p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/90 shadow-sm ring-1 ring-black/[0.04]">
                          <Route className="h-3.5 w-3.5 text-slate-600" />
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">
                          {hi ? 'आगे ये भी देख लो' : 'Also revise'}
                        </span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-slate-700 sm:text-[14px]">
                        {hi
                          ? 'रायसेन जिला · सम्राट अशोक · ₹200 के नोट पर तस्वीर'
                          : 'Raisen District · Emperor Ashoka · Motif on the ₹200 note'}
                      </p>
                    </div>

                    {/* Exam Tip */}
                    <div className="rounded-xl border border-sky-200/80 bg-sky-50/90 p-3 sm:p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/90 shadow-sm ring-1 ring-black/[0.04]">
                          <Lightbulb className="h-3.5 w-3.5 text-sky-600" />
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-900">
                          {hi ? 'एग्जाम वाली टिप' : 'Exam-day tip'}
                        </span>
                      </div>
                      <p className="text-[13px] font-medium leading-relaxed text-sky-950 sm:text-[14px]">
                        {hi
                          ? 'यूनेस्को साइट्स की लिस्ट में सांची का क्रम और उसका निर्माण काल अक्सर जोड़ी मिलाने (matching) में पूछा जाता है।'
                          : 'The order of Sanchi in the UNESCO sites list and its construction period are frequently asked in matching-type questions.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side Description */}
          <div className="flex flex-col justify-center space-y-12 lg:pl-10">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 shadow-sm">
                <Brain className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {hi ? 'सिर्फ उत्तर नहीं, गहरी समझ' : 'Beyond Answers: Deep Context'}
              </h3>
              <p className="text-lg font-medium text-slate-500">
                {hi
                  ? 'हमारा "इंस्टेंट मोड" आपको हर प्रश्न के पीछे की कहानी बताता है। तथ्य, तर्क और याद रखने की ट्रिक्स — सब एक साथ।'
                  : 'Our "Instant Mode" tells you the story behind every question. Facts, logic, and memory tricks—all in one place.'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {hi ? 'स्मार्ट मेमोरी हुक्स' : 'Smart Memory Hooks'}
              </h3>
              <p className="text-lg font-medium text-slate-500">
                {hi
                  ? 'कठिन तथ्यों को याद रखना अब आसान है। हमारे विशेष Mnemonics सुनिश्चित करते हैं कि आप परीक्षा के दिन कुछ न भूलें।'
                  : 'Retaining complex facts is now easy. Our specialized Mnemonics ensure you don’t forget anything on exam day.'}
              </p>
            </div>

            <div className="pt-4">
              <button className="group flex items-center gap-3 text-lg font-black text-emerald-600 transition-all hover:gap-5">
                {hi ? 'सभी प्रीमियम फीचर्स देखें' : 'Explore All Premium Features'}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
