import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { DashboardView } from '@/features/analytics/components/DashboardView';

// Dashboard is user-specific — must NEVER serve cached/stale page
export const dynamic = 'force-dynamic';
import { getUserAnalytics } from '@/features/analytics/actions';

import AnalyticsDashboardWrapper from '@/app/syllabus/analytics/AnalyticsDashboardWrapper';
import { Badge } from '@/components/ui/badge';
import { syllabusData } from '@/data/syllabusData';
import { verifyAuth } from '@/lib/auth';
import { getUserSyllabusProgress } from '@/features/syllabus/actions/revision';
import { SyllabusProgressWidget } from '@/features/analytics/components/SyllabusProgressWidget';

export default async function DashboardPage() {
  const user = await verifyAuth();

  if (!user) {
    redirect('/login');
  }

  // Fetch Analytics
  const analyticsData = await getUserAnalytics(user.id);
  const syllabusProgress = await getUserSyllabusProgress();

  // Calculate Total Topics from Syllabus Data
  const totalTopics = Object.values(syllabusData.units).reduce((acc: number, unit: any) => {
    return acc + (unit.topics?.length || 0);
  }, 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafbfc] pt-24 pb-20 font-sans">
      {/* 🎭 PREMIUM BACKGROUND BLURS */}
      <div className="pointer-events-none absolute top-0 left-0 h-[500px] w-full bg-gradient-to-b from-slate-100/30 to-transparent" />
      <div className="pointer-events-none absolute top-[-100px] right-[-100px] h-[500px] w-[500px] rounded-full bg-indigo-50/40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[-150px] h-[400px] w-[400px] rounded-full bg-emerald-50/30 blur-[100px]" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-6">
        {/* Header Section */}
        <div className="mb-4 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                Welcome back, {user.name?.split(' ')[0]}! 👋
              </h1>
            </div>
            <p className="max-w-2xl text-lg font-medium text-slate-500 md:text-xl">
              Here is your performance snapshot and syllabus progress overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user.planTier === 'pro' ? (
              <div className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-indigo-200">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                PRO Member
              </div>
            ) : user.planTier === 'lite' ? (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-emerald-200">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                LITE Member
              </div>
            ) : (
              <Badge
                variant="outline"
                className="rounded-xl border-slate-200 bg-white/50 px-4 py-1.5 text-xs font-bold text-slate-400 backdrop-blur-sm"
              >
                Free Plan
              </Badge>
            )}
          </div>
        </div>

        {/* Dashboard Content — Full Analytics view */}
        <div className="w-full">
          <AnalyticsDashboardWrapper analytics={analyticsData} />
        </div>

        {/* Syllabus Progress — Side by side or stacked based on importance */}
        <div className="w-full">
          <SyllabusProgressWidget data={syllabusProgress} totalTopics={totalTopics} />
        </div>
      </div>
    </div>
  );
}
