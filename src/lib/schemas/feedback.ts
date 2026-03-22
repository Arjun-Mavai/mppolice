import { z } from 'zod';

/**
 * FEEDBACK FORM SCHEMA
 *
 * HOW TO ADD NEW FIELDS:
 * 1. Add the field to the schema below (e.g., z.string(), z.number(), z.enum([...]))
 * 2. Add the field to FeedbackFormType (TypeScript interface will auto-generate)
 * 3. Add the field to the form in TestSeriesFeedbackModal component
 * 4. Update the API endpoint to save the new field to your database
 *
 * FIELD TYPES:
 * - z.string() → text input
 * - z.number() → numeric input (for ratings)
 * - z.enum([...]) → radio buttons or select
 * - z.boolean() → checkbox or toggle
 * - z.number().min(1).max(5) → rating scale (1-5 stars)
 */

export const feedbackFormSchema = z.object({
  overallRating: z
    .number()
    .min(1, 'Please provide an overall rating')
    .max(5, 'Rating must be between 1 and 5'),

  difficultyLevel: z.enum(['too_easy', 'just_right', 'too_hard'] as const),

  wouldRecommend: z.enum(['definitely', 'probably', 'maybe', 'no'] as const),

  comments: z.string().max(500, 'Comments cannot exceed 500 characters').optional(),
});

export type FeedbackFormType = z.infer<typeof feedbackFormSchema>;

export const feedbackQuestions = [
  {
    id: 'overallRating',
    name: 'overallRating' as const,
    label: 'How would you rate the overall test quality?',
    type: 'stars' as const,
    maxStars: 5,
  },
  {
    id: 'difficultyLevel',
    name: 'difficultyLevel' as const,
    label: 'How was the difficulty level of the questions?',
    type: 'radio' as const,
    options: [
      { value: 'too_easy', label: 'Too Easy' },
      { value: 'just_right', label: 'Just Right (Exam Level)' },
      { value: 'too_hard', label: 'Too Hard' },
    ],
  },
  {
    id: 'wouldRecommend',
    name: 'wouldRecommend' as const,
    label: 'Would you recommend this test to other aspirants?',
    type: 'radio' as const,
    options: [
      { value: 'definitely', label: 'Definitely' },
      { value: 'probably', label: 'Probably' },
      { value: 'maybe', label: 'Maybe' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'comments',
    name: 'comments' as const,
    label: 'Any additional comments? (Optional)',
    type: 'textarea' as const,
  },
];
