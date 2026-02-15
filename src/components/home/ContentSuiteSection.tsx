'use client';

/**
 * ContentSuiteSection — Numbers/Stats section bhai!
 * Yeh dikhata hai kitne Unit Tests, Topic Tests, FLTs, PYQs aur CSAT Mocks hain.
 * Dynamic topicCount server action se fetch hota hai.
 */

import React from 'react';
import { BookOpen, Target, Trophy, Brain, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getTopicTestStats } from '@/actions/getTopicTestStats';

export function ContentSuiteSection() {
  const { language } = useSettingsStore();
  const [topicCount, setTopicCount] = React.useState(0);

  React.useEffect(() => {
    getTopicTestStats().then((res) => {
      if (res.success && res.data) {
        let total = 0;
        Object.values(res.data).forEach((topics) => {
          total += topics.filter((t) => t.questionCount > 0).length;
        });
        setTopicCount(total);
      }
    });
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="absolute top-0 right-0 -mt-40 -mr-40 h-[500px] w-[500px] rounded-full bg-slate-50 blur-3xl"></div>
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            {language === 'hi' ? 'सब कुछ एक जगह।' : 'Everything You Need.'}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            {language === 'hi'
              ? 'यूनिट टेस्ट से लेकर फुल लेंथ मॉक तक, आपकी तैयारी का पूरा भंडार।'
              : 'From Unit Tests to Full Length Mocks, we have structured content to take you from Zero to Hero.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          {/* Unit Tests */}
          <Card className="border-slate-200 bg-slate-50/50 transition-all hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="space-y-4 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <BookOpen size={24} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900">10</div>
                <div className="text-sm font-bold tracking-wide text-slate-500 uppercase">
                  Units Covered
                </div>
              </div>
              <Badge className="bg-slate-100 text-[10px] text-slate-700 hover:bg-slate-100 sm:text-xs">
                {/* {language === 'hi' ? '5 प्रयास / टेस्ट' : '5 Attempts / Test'} */}
                {language === 'hi' ? 'यूनिट वाइज' : 'Unit Wise'}
              </Badge>
            </CardContent>
          </Card>

          {/* Topic Tests */}
          <Card className="border-rose-200 bg-rose-50/30 transition-all hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="space-y-4 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Target size={24} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900">
                  {topicCount > 0 ? topicCount : '100+'}
                </div>
                <div className="text-sm font-bold tracking-wide text-slate-500 uppercase">
                  Topic Wise Tests
                </div>
              </div>
              <Badge className="bg-rose-100 text-[10px] text-rose-700 hover:bg-rose-100 sm:text-xs">
                {language === 'hi' ? 'टॉपिक वार' : 'Topic Wise'}
              </Badge>
            </CardContent>
          </Card>

          {/* FLTs */}
          <Card className="border-emerald-200 bg-emerald-50/30 transition-all hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="space-y-4 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Trophy size={24} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900">10</div>
                <div className="text-sm font-bold tracking-wide text-slate-500 uppercase">
                  Full Length Tests
                </div>
              </div>
              <Badge className="bg-emerald-100 text-[10px] text-emerald-700 hover:bg-emerald-100 sm:text-xs">
                {language === 'hi' ? '5 प्रयास / टेस्ट' : '5 Attempts / Test'}
              </Badge>
            </CardContent>
          </Card>

          {/* PYQ */}
          <Card className="border-amber-200 bg-amber-50/30 transition-all hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="space-y-4 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <History size={24} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900">5+</div>
                <div className="text-sm font-bold tracking-wide text-slate-500 uppercase">
                  Years PYQ
                </div>
              </div>
              <p className="pt-1 text-xs font-medium text-slate-500">
                {language === 'hi' ? '2020 से अब तक' : '2020 Onwards'}
              </p>
            </CardContent>
          </Card>

          {/* CSAT */}
          <Card className="border-purple-200 bg-purple-50/30 transition-all hover:-translate-y-1 hover:shadow-xl md:col-span-2 lg:col-span-1 lg:col-start-auto">
            <CardContent className="space-y-4 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Brain size={24} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900">5</div>
                <div className="text-sm font-bold tracking-wide text-slate-500 uppercase">
                  CSAT Mocks
                </div>
              </div>
              <p className="pt-1 text-xs font-medium text-slate-500">
                {language === 'hi' ? 'अभ्यास के लिए' : 'For Practice'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
