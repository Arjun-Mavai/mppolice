'use client';

/**
 * InstantFeedbackSection — Instant Mode ka demo bhai!
 * Yeh section dikhata hai ki Instant Mode ON karo toh har question ke baad
 * turant correct answer aur explanation mil jaata hai. No waiting!
 */

import React from 'react';
import { Zap, CheckCircle2, BookOpen, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

export function InstantFeedbackSection() {
  const { language } = useSettingsStore();

  return (
    <section className="relative border-y border-slate-200 bg-slate-50 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-20 lg:grid-cols-2">
          {/* Visual First on Desktop */}
          <div className="relative order-2 flex justify-center lg:order-1 lg:justify-start">
            <div className="relative mx-auto w-full max-w-lg lg:mx-0">
              <div className="animate-pulse-slow absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-amber-500 to-orange-500 opacity-20 blur-xl"></div>
              <Card className="relative z-10 overflow-hidden rounded-[2rem] border-0 shadow-2xl">
                <div className="space-y-6 bg-white p-6 md:p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase">
                        {language === 'hi' ? 'यूनिट 1 टेस्ट' : 'Unit 1 Test'}
                      </div>
                      <h3 className="font-bold text-slate-900">
                        {language === 'hi' ? 'MP इतिहास क्विज़' : 'MP History Quiz'}
                      </h3>
                    </div>
                    <Badge className="gap-1 bg-amber-100 pr-2 pl-1 text-amber-700 hover:bg-amber-100">
                      <Zap size={12} className="fill-amber-700" />{' '}
                      {language === 'hi' ? 'इंस्टेंट मोड' : 'Instant Mode'}
                    </Badge>
                  </div>

                  {/* Question */}
                  <div className="space-y-4">
                    <p className="text-lg font-bold text-slate-900">
                      {language === 'hi'
                        ? 'चेदी साम्राज्य का सबसे पहला उल्लेख किस ग्रंथ में मिलता है?'
                        : 'Which text provides the earliest mention of the Chedi Kingdom?'}
                    </p>

                    <div className="space-y-3">
                      {/* Wrong Option */}
                      <div className="flex cursor-not-allowed items-center justify-between rounded-xl border-2 border-red-100 bg-red-50/50 p-4 opacity-80">
                        <span className="font-medium text-slate-700">
                          {language === 'hi' ? 'महाभारत' : 'Mahabharata'}
                        </span>
                        <X className="h-5 w-5 text-red-500" />
                      </div>

                      {/* Correct Option */}
                      <div className="relative rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {language === 'hi' ? 'ऋग्वेद' : 'Rigveda'}
                          </span>
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="animate-in slide-in-from-top-4 fade-in rounded-xl border border-slate-200 bg-slate-50 p-5 duration-700">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                        {language === 'hi' ? 'व्याख्या' : 'Explanation'}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {language === 'hi' ? (
                        <span>
                          <strong>ऋग्वेद</strong> में चेदी साम्राज्य का सबसे पहला संदर्भ (दानस्तुति
                          सूक्ति) मिलता है।
                        </span>
                      ) : (
                        <span>
                          The **Rigveda** contains the earliest reference to the Chedi kingdom
                          (Danastuti hymn).
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="order-1 space-y-8 lg:order-2 lg:pl-10">
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 px-4 py-1 text-sm text-amber-700"
            >
              {language === 'hi' ? 'अभ्यास मोड' : 'Practice Mode'}
            </Badge>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              {language === 'hi' ? 'तुरंत फीडबैक।' : 'Instant Feedback.'}
            </h2>
            <p className="text-lg leading-relaxed font-medium text-slate-600">
              {language === 'hi' ? (
                <span>
                  रिजल्ट का इंतजार क्यों? <strong>इंस्टेंट मोड</strong> ऑन करें और हर सवाल के तुरंत
                  बाद सही जवाब और व्याख्या देखें।
                </span>
              ) : (
                <span>
                  Why wait for the results? Turn on <strong>Instant Mode</strong> to see the correct
                  answer and detailed explanation immediately after every question.
                </span>
              )}
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-lg font-medium text-slate-700">
                  {language === 'hi' ? 'गलतियों का तुरंत सुधार' : 'Real-time correction'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <BookOpen className="h-4 w-4 text-slate-600" />
                </div>
                <span className="text-lg font-medium text-slate-700">
                  {language === 'hi' ? 'प्रमाणिक स्रोतों से संदर्भ' : 'Detailed Source References'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
