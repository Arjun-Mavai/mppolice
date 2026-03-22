'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  feedbackFormSchema,
  feedbackQuestions,
  type FeedbackFormType,
} from '@/lib/schemas/feedback';

interface TestSeriesFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: FeedbackFormType) => Promise<void>;
  testSeriesId?: string;
}

/**
 * BEAUTIFUL FEEDBACK MODAL COMPONENT
 *
 * This component collects feedback for test series with:
 * - Radio buttons for multiple choice questions
 * - Star ratings for numeric feedback
 * - Fully validated with Zod + React Hook Form
 * - Easily customizable (see lib/schemas/feedback.ts)
 *
 * USAGE:
 * const [isOpen, setIsOpen] = useState(false)
 * <TestSeriesFeedbackModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSubmit={async (data) => {
 *     await submitFeedbackToAPI(data)
 *   }}
 * />
 */

export function TestSeriesFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  testSeriesId,
}: TestSeriesFeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FeedbackFormType>({
    resolver: zodResolver(feedbackFormSchema),
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: FeedbackFormType) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      // Here you can also save to database directly:
      // await saveFeedbackToDatabase({ ...data, testSeriesId })
      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsCompleted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-black">
            {isCompleted ? 'Thank You!' : 'Share Your Feedback'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 transition-colors hover:text-black"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-5">
          {!isCompleted ? (
            <>
              {/* INTRO MESSAGE */}
              <p className="mb-6 text-sm text-gray-600">
                We value your time. Your feedback helps us improve the test series.
              </p>

              {/* FORM */}
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {feedbackQuestions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    {/* QUESTION LABEL */}
                    <label className="block text-sm font-medium text-black">{question.label}</label>

                    {/* RADIO BUTTON QUESTIONS */}
                    {question.type === 'radio' && (
                      <Controller
                        name={question.name}
                        control={control}
                        render={({ field }) => (
                          <RadioGroup value={field.value as string} onValueChange={field.onChange}>
                            <div className="space-y-2">
                              {question.options?.map((option) => (
                                <div key={option.value} className="flex items-center space-x-3">
                                  <RadioGroupItem
                                    value={option.value}
                                    id={`${question.id}-${option.value}`}
                                  />
                                  <Label
                                    htmlFor={`${question.id}-${option.value}`}
                                    className="cursor-pointer text-sm font-normal text-gray-700"
                                  >
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        )}
                      />
                    )}

                    {/* STAR RATING QUESTIONS */}
                    {question.type === 'stars' && (
                      <Controller
                        name={question.name}
                        control={control}
                        render={({ field }) => (
                          <div className="flex gap-2">
                            {Array.from({ length: question.maxStars || 5 }, (_, i) => i + 1).map(
                              (star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => field.onChange(star)}
                                  className="transition-all duration-200 hover:scale-110 focus:outline-none"
                                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                                >
                                  <Star
                                    size={28}
                                    className={`${
                                      star <= (field.value as number)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-200'
                                    }`}
                                  />
                                </button>
                              )
                            )}
                          </div>
                        )}
                      />
                    )}

                    {/* TEXTAREA QUESTIONS */}
                    {question.type === 'textarea' && (
                      <Controller
                        name={question.name}
                        control={control}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            value={field.value as string || ''}
                            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black min-h-[100px] resize-y"
                            placeholder="Share your thoughts..."
                          />
                        )}
                      />
                    )}

                    {/* ERROR MESSAGE */}
                    {errors[question.name as keyof FeedbackFormType] && (
                      <p className="text-xs text-red-500">
                        {errors[question.name as keyof FeedbackFormType]?.message}
                      </p>
                    )}
                  </div>
                ))}

                {/* SUBMIT BUTTON */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 border-gray-300 text-black hover:bg-gray-50"
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-black text-white hover:bg-gray-900 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* SUCCESS STATE */}
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-black/10 p-3">
                    <Star size={32} className="fill-black text-black" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-base font-semibold text-black">
                    Thank you for your feedback!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your response helps us create better test series for you.
                  </p>
                </div>
                <Button
                  onClick={handleClose}
                  className="w-full bg-black text-white hover:bg-gray-900"
                >
                  View Results
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * HOW TO USE IN YOUR COMPONENT:
 *
 * const [feedbackOpen, setFeedbackOpen] = useState(false)
 *
 * <TestSeriesFeedbackModal
 *   isOpen={feedbackOpen}
 *   onClose={() => setFeedbackOpen(false)}
 *   onSubmit={async (data) => {
 *     const response = await fetch('/api/feedback', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(data)
 *     })
 *     if (!response.ok) throw new Error('Failed to submit')
 *   }}
 * />
 */
