import { z } from 'zod';

export const feedbackFormSchema = z.object({
  overallRating: z.number().min(1, 'Please provide a rating (1-5 stars)').max(5),

  difficultyLevel: z.enum(['too_easy', 'just_right', 'too_hard'] as const),

  wouldRecommend: z.enum(['yes', 'no', 'definitely', 'probably', 'maybe'] as const).optional(),

  comment: z
    .string()
    .max(500, 'Comment too long (max 500 chars)')
    .optional(),
});

export type FeedbackFormType = z.infer<typeof feedbackFormSchema>;

export const feedbackQuestions = [
  {
    id: 'overallRating',
    name: 'overallRating' as const,
    label: 'How was the test quality?',
    type: 'stars' as const,
    maxStars: 5,
  },
  {
    id: 'difficultyLevel',
    name: 'difficultyLevel' as const,
    label: 'Test Difficulty?',
    type: 'radio' as const,
    options: [
      { value: 'too_easy', label: 'Easy 😊' },
      { value: 'just_right', label: 'Balanced ⚖️' },
      { value: 'too_hard', label: 'Hard 🤯' },
    ],
  },
  {
    id: 'wouldRecommend',
    name: 'wouldRecommend' as const,
    label: 'Recommend to others?',
    type: 'radio' as const,
    options: [
      { value: 'yes', label: 'Yes! 👍' },
      { value: 'no', label: 'Not really 👎' },
    ],
  },
  {
    id: 'comment',
    name: 'comment' as const,
    label: 'Your Detailed Feedback',
    type: 'textarea' as const,
    placeholder: 'Tell us more about your experience...',
  },
];
