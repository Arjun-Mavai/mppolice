'use server';

import { db } from '@/db';
import { testFeedback } from '@/db/schema';
import { type FeedbackFormType } from '@/lib/schemas/feedback';
import { randomUUID } from 'crypto';

interface SubmitFeedbackParams {
  testId: string;
  userId?: string | null;
  testType: 'free' | 'premium' | 'pyq';
  data: FeedbackFormType;
}

export async function submitTestFeedback(params: SubmitFeedbackParams) {
  try {
    const { testId, userId, testType, data } = params;
    
    // Convert to DB format with proper types
    const newFeedback = {
      id: randomUUID(),
      testId,
      userId: userId || null,
      testType,
      overallRating: data.overallRating,
      difficultyLevel: data.difficultyLevel,
      questionQuality: 'good' as const, // Not collected in UI yet, defaulting to good
      wouldRecommend: data.wouldRecommend,
      comments: data.comments || null,
    };

    await db.insert(testFeedback).values(newFeedback);

    return { success: true };
  } catch (error) {
    console.error('Error in submitTestFeedback:', error);
    return { success: false, error: 'Failed to save feedback' };
  }
}
