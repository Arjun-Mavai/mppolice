import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, TrendingUp, Brain, ArrowRight } from 'lucide-react';
import { getPyqInsightSubjects } from '@/features/tests/actions/pyq-insights';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';

export default async function PYQIntelligencePage() {
  const user = await verifyAuth();
  if (!user) {
    redirect('/pricing');
  }
  
  const tier = getUserTier(user);
  if (tier === 'free' && user.email !== 'arjun@gmail.com') {
    redirect('/pricing');
  }

  const subjects = await getPyqInsightSubjects();
  const topSubjects = subjects.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 pb-16 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> PYQ Intelligence
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Pattern se Selection तक</h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-slate-500">
            Subject-wise trends, topic-wise frequency, and memory-first facts. This is your premium revision cockpit
            for MPPSC PYQs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/syllabus/quiz/pyq/analysis"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] hover:bg-slate-800"
            >
              <TrendingUp className="h-4 w-4" /> Open Analysis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/syllabus/quiz/pyq/facts"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Brain className="h-4 w-4" /> Open Facts Library
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topSubjects.map((subject) => (
            <div key={subject.subject} className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-50 text-slate-300 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-500 flex items-center justify-center">
                 <ArrowRight className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Subject</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">{subject.subject}</h3>
              <div className="mt-4 flex items-center gap-4 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                   <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                   {subject.factCount} facts
                </span>
                <span className="flex items-center gap-1.5">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                   {subject.topicCount} topics
                </span>
              </div>
              <Link
                href={`/syllabus/quiz/pyq/analysis?subject=${encodeURIComponent(subject.subject)}`}
                className="absolute inset-0 z-10"
              >
                <span className="sr-only">Explore {subject.subject}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

