import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import { getRepeatedQuestions } from '@/actions/pyq-analytics';
import RepeatedQuestionsClient from './RepeatedQuestionsClient';

export default async function RepeatedQuestionsPage() {
  const user = await verifyAuth();
  if (!user) {
    redirect('/pricing');
  }
  
  const tier = getUserTier(user);
  if (tier === 'free') {
    redirect('/pricing');
  }

  const repeatedQuestions = await getRepeatedQuestions();
  const isAdmin = user.role === 'admin';

  return (
    <RepeatedQuestionsClient
      questions={repeatedQuestions}
      isAdmin={isAdmin}
    />
  );
}
