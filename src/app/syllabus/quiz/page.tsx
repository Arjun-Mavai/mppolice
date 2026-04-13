'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizSelectionPage() {
  const router = useRouter();

  // 🚀 REDIRECT TO NEW PRIMARY VIEW (PYQ)
  useEffect(() => {
    router.replace('/syllabus/quiz/full-tests');
  }, [router]);

  // Prevent UI flash during redirect
  return null;
}
