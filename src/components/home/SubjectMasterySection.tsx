'use client';

/**
 * SubjectMasterySection — Analytics preview section bhai!
 * Yeh dikhata hai ki AI kaise subject-wise performance track karta hai.
 * Dark card mein progress bars — History, Polity, Geography sab dikhaate hain.
 */

import React from 'react';
import { BarChart3, BrainCircuit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSettingsStore } from '@/store/useSettingsStore';

export function SubjectMasterySection() {
  const { language } = useSettingsStore();

  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-20 lg:grid-cols-2">
          <div className="space-y-8">
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 px-4 py-1 text-sm text-emerald-700"
            >
              {language === 'hi' ? 'गहरी अंतर्दृष्टि' : 'Deep Insights'}
            </Badge>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              {language === 'hi' ? 'विषयवार प्रवीणता' : 'Subject-wise Mastery.'}
            </h2>
            <p className="text-lg leading-relaxed font-medium text-slate-600">
              {language === 'hi'
                ? 'सिर्फ मेहनत नहीं, स्मार्ट स्टडी करें। हमारा Smart Coach हर विषय में आपकी परफॉरमेंस को ट्रैक करता है, ताकि आप अपनी कमजोरियों को ताकत बना सकें।'
                : "Don't just study hard, study smart. Our Smart Coach analyzes your performance in every subject to tell you exactly where to focus."}
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'History (इतिहास)',
                'Polity (राजव्यवस्था)',
                'Geography (भूगोल)',
                'Science (विज्ञान)',
              ].map((tag) => (
                <div
                  key={tag}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur-xl"></div>
              <Card className="relative z-10 space-y-8 rounded-[2rem] border-slate-800 bg-slate-900 p-8 text-white shadow-2xl">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="mb-1 font-medium text-slate-400">
                      {language === 'hi' ? 'कुल स्कोर' : 'Overall Strength'}
                    </div>
                    <div className="flex items-center gap-2 text-4xl font-bold text-white">
                      74%{' '}
                      <span className="rounded bg-emerald-500/10 px-2 py-1 text-sm font-bold text-emerald-400">
                        +12%
                      </span>
                    </div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-slate-600" />
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-300">
                        {language === 'hi' ? 'MP इतिहास' : 'MP History'}
                      </span>
                      <span className="font-bold text-emerald-400">
                        {language === 'hi' ? 'उत्कृष्ट (85%)' : 'Excellent (85%)'}
                      </span>
                    </div>
                    <Progress
                      value={85}
                      className="h-3 bg-slate-800"
                      indicatorClassName="bg-gradient-to-r from-emerald-500 to-emerald-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-300">
                        {language === 'hi' ? 'भारतीय राजव्यवस्था' : 'Indian Polity'}
                      </span>
                      <span className="font-bold text-amber-400">
                        {language === 'hi' ? 'अच्छा (65%)' : 'Good (65%)'}
                      </span>
                    </div>
                    <Progress
                      value={65}
                      className="h-3 bg-slate-800"
                      indicatorClassName="bg-gradient-to-r from-amber-500 to-amber-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-300">
                        {language === 'hi' ? 'भूगोल' : 'Geography'}
                      </span>
                      <span className="font-bold text-red-400">
                        {language === 'hi' ? 'कमजोर (42%)' : 'Weak (42%)'}
                      </span>
                    </div>
                    <Progress
                      value={42}
                      className="h-3 bg-slate-800"
                      indicatorClassName="bg-gradient-to-r from-red-500 to-red-400"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <BrainCircuit className="h-6 w-6 shrink-0 text-purple-400" />
                  <p className="text-sm leading-relaxed text-slate-300">
                    <span className="font-bold text-purple-400">Smart Suggestion:</span>{' '}
                    {language === 'hi' ? 'यूनिट 3 के  भूगोल' : 'Focus on Geography'}{' '}
                    {language === 'hi'
                      ? 'प्रश्नों पर ध्यान दें। "नदियां और पर्वत" में आपकी सटीकता औसत से कम है।'
                      : 'questions. Your accuracy is below average in "Rivers & Mountains".'}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
