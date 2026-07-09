import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import {
  getPublishedMppoliceOneLiners,
  getMppoliceOnelinerCountsBySubject,
} from '@/features/revision/actions/mppolice-one-liners';
import OneLinersModernClient from './OneLinersModernClient';

export const revalidate = 300;

interface PageProps {
  searchParams: Promise<{ subject?: string }>;
}

function OneLinersFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] text-sm text-[#86868B]">
      Loading…
    </div>
  );
}

export default async function GkOneLinersPage({ searchParams }: PageProps) {
  const user = await verifyAuth();
  if (!user) {
    redirect('/pricing');
  }
  const tier = getUserTier(user);
  if (tier === 'free') {
    redirect('/pricing');
  }

  const sp = await searchParams;
  const raw = sp.subject?.trim();
  const subject =
    raw === 'All' || raw === 'all'
      ? 'All'
      : raw && raw.length > 0
        ? raw
        : 'All';

  const [facts, counts] = await Promise.all([
    getPublishedMppoliceOneLiners(subject, 50, 0),
    getMppoliceOnelinerCountsBySubject(),
  ]);

  return (
    <Suspense fallback={<OneLinersFallback />}>
      <OneLinersModernClient key={subject} facts={facts} counts={counts} initialSubject={subject} />
    </Suspense>
  );
}
