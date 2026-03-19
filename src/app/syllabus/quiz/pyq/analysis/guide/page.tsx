import { requireAdmin } from '@/lib/auth-admin';
import PYQAnalysisGuideClient from '@/app/syllabus/quiz/pyq/analysis/guide/PYQAnalysisGuideClient';

export default async function PYQAnalysisGuidePage() {
  const user = await requireAdmin();
  
  return <PYQAnalysisGuideClient />;
}
