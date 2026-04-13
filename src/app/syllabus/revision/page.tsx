import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPublishedMppoliceOneLiners } from '@/features/revision/actions/mppolice-one-liners';
import { getUserOneLinerProgress, getOneLinerRevisionMap } from '@/features/revision/actions/mppolice-one-liner-revisions';
import { RevisionHubClient } from './RevisionHubClient';

export const dynamic = 'force-dynamic';

export default async function RevisionHubPage() {
  const user = await verifyAuth();
  if (!user) {
    redirect('/login');
  }

  // Fetch all published one-liners (max 3000) and user progress
  const [allFacts, oneLinerStats] = await Promise.all([
    getPublishedMppoliceOneLiners('All', 3000),
    getUserOneLinerProgress()
  ]);

  // Load initial revision map for the first set of facts
  const initialRevisionMap = await getOneLinerRevisionMap(allFacts.map(f => f.id));

  return (
    <RevisionHubClient 
      allFacts={allFacts as any}
      initialRevisionMap={initialRevisionMap}
      stats={oneLinerStats}
    />
  );
}

