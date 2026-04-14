'use client';

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { DashboardHeader } from './DashboardHeader';
import { SubjectMasteryWidget } from '@/features/analytics/components/SubjectMasteryWidget';
import { DashboardActionCard } from './DashboardActionCard';
import { RevisionHeroCard } from './RevisionHeroCard';
import AnalyticsDashboardWrapper from '@/app/syllabus/analytics/AnalyticsDashboardWrapper';

interface DashboardClientProps {
  user: {
    name: string | null;
    planTier: string | null;
  };
  analyticsData: any;
  syllabusProgress: any;
  totalTopics: number;
}

export function DashboardClient({ user, analyticsData, syllabusProgress }: DashboardClientProps) {
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 pb-24 font-sans text-slate-900 selection:bg-indigo-500/30">
      {/* 🎓 SOFT SCHOLAR BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-0 h-[600px] w-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_70%)]" />
        <div className="absolute top-[-100px] right-[-100px] h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>

      {/* 🏷️ BILINGUAL HEADER */}
      <DashboardHeader user={user} />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* 📝 STUDY PROGRESS — LEFT HUB */}
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
                {isHindi ? 'आपका डैशबोर्ड' : 'Your Dashboard'}
              </h1>
              <div className="flex items-center gap-3">
                <div className="h-1 w-10 rounded-full bg-indigo-500/20" />
                <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                  {isHindi ? 'परीक्षा तैयारी पोर्टल' : 'Exam Preparation Portal'}
                </p>
              </div>
            </div>

            {/* 🏅 TOP PRIORITY: One-Liner Revision Progress (Hero Card) */}
            <RevisionHeroCard stats={syllabusProgress?.oneLinerStats} />
            
            <AnalyticsDashboardWrapper 
              analytics={analyticsData} 
              actionCard={<DashboardActionCard totalTests={analyticsData?.totalTests || 0} />}
            />
          </div>

          {/* 📊 ANALYTICS — RIGHT SIDEBAR */}
          <div className="lg:col-span-4 lg:pl-4">
            <div className="lg:sticky lg:top-32 space-y-10">
              {/* Subject Mastery — Desktop Optimized */}
              <div className="hidden lg:block">
                <div className="mb-4 space-y-2">
                  <h3 className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
                    {isHindi ? 'विषयवार प्रवीणता' : 'Subject Mastery'}
                  </h3>
                  <div className="h-1 w-6 rounded-full bg-indigo-500/20" />
                </div>
                <SubjectMasteryWidget mastery={analyticsData?.mastery || []} />
              </div>

              {/* Tips / Achievements Column */}
              <div className="rounded-[2rem] bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-200">
                  <h4 className="flex items-center gap-2 text-lg font-black tracking-tight">
                     <Sparkles className="h-5 w-5 text-indigo-300" />
                     {isHindi ? 'आज का मंत्र' : 'Daily Mantra'}
                  </h4>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-indigo-100 opacity-90">
                     {isHindi 
                       ? 'कोशिश करने वालों की कभी हार नहीं होती। अपनी रिवीजन जर्नी को जारी रखें और रोजाना कम से कम 50 वन-लाइनर्स पूरे करें।' 
                       : 'Keep pushing! Completing just 50 one-liners a day can significantly boost your final exam performance.'}
                  </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { Sparkles } from 'lucide-react';
