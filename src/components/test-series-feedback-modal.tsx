'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, CheckCircle2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
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
  userName?: string; // Add user name for personalization
}

export function TestSeriesFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  userName,
}: TestSeriesFeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid, errors },
  } = useForm<FeedbackFormType>({
    resolver: zodResolver(feedbackFormSchema),
    mode: 'onChange',
    defaultValues: {
      overallRating: 0,
      comment: '',
    },
  });

  const rating = watch('overallRating');

  const getRatingContent = (val: number) => {
    switch (val) {
      case 1:
        return { emoji: '😞', label: 'Disappointing', color: 'text-rose-400' };
      case 2:
        return { emoji: '😐', label: 'Average', color: 'text-amber-400' };
      case 3:
        return { emoji: '😊', label: 'Good', color: 'text-emerald-400' };
      case 4:
        return { emoji: '🌟', label: 'Excellent', color: 'text-blue-400' };
      case 5:
        return { emoji: '🔥', label: 'Outstanding!', color: 'text-orange-400' };
      default:
        return { emoji: '✨', label: 'Select Rating', color: 'text-slate-500' };
    }
  };

  const ratingContent = getRatingContent(rating);

  const handleFormSubmit = async (data: FeedbackFormType) => {
    // 1. TURANT BAND: Close modal immediately on click
    onClose();

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data); // Submit in background
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xl transition-all duration-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[420px] rounded-[3.5rem] border border-white/[0.08] bg-[#0B0F1A]/90 p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] backdrop-blur-3xl"
      >
        {/* Glow Backgrounds */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-amber-500/10 blur-[80px]" />

        <AnimatePresence mode="wait">
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] p-3 shadow-inner">
                <Zap className="h-full w-full fill-emerald-500 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                {userName ? `Thanks ${userName.split(' ')[0]}!` : 'Quick Feedback'}
              </h2>
              <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                {userName ? 'Your Opinion Matters' : 'Your Opinion Matters'}
              </p>
            </div>

            {/* RATING ORBIT */}
            <div className="flex flex-col items-center justify-center py-2">
              <motion.div
                initial={false}
                animate={{
                  scale: rating > 0 ? 1 : 0.9,
                  borderColor: rating > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                }}
                className="relative mb-4 flex h-24 w-24 flex-col items-center justify-center rounded-full border border-dashed text-center"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={rating}
                    initial={{ opacity: 0, y: 5, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.8 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-4xl">{ratingContent.emoji}</span>
                    {rating > 0 && (
                      <span className="mt-1 text-xs font-black text-white/50">{rating}/5</span>
                    )}
                  </motion.div>
                </AnimatePresence>

                {rating > 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full border border-emerald-500/20"
                  />
                )}
              </motion.div>
              <motion.span
                key={ratingContent.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn('text-xs font-black tracking-widest uppercase', ratingContent.color)}
              >
                {ratingContent.label}
              </motion.span>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              <div className="space-y-6">
                {feedbackQuestions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <label className="block text-[9px] font-black tracking-[0.25em] text-slate-500 uppercase">
                      {question.label}
                    </label>

                    {/* STARS */}
                    {question.type === 'stars' && (
                      <Controller
                        name={question.name}
                        control={control}
                        render={({ field }) => (
                          <div className="flex justify-between px-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => field.onChange(star)}
                                className="group relative transition-all duration-300 hover:scale-125 active:scale-90"
                              >
                                {star <= field.value && (
                                  <motion.div
                                    layoutId="star-glow"
                                    className="absolute inset-0 rounded-full bg-amber-400/20 blur-lg"
                                  />
                                )}
                                <Star
                                  size={36}
                                  className={cn(
                                    'stroke-[1.5] transition-all duration-300',
                                    star <= field.value
                                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                                      : 'text-slate-800 group-hover:text-slate-600'
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    )}

                    {/* RADIO CHIPS */}
                    {question.type === 'radio' && (
                      <Controller
                        name={question.name}
                        control={control}
                        render={({ field }) => (
                          <div className="grid grid-cols-3 gap-2">
                            {question.options?.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={cn(
                                  'relative flex h-12 flex-col items-center justify-center rounded-2xl border text-[10px] font-black transition-all duration-300',
                                  field.value === option.value
                                    ? 'border-white/10 bg-white/5 text-white shadow-xl'
                                    : 'border-white/[0.03] bg-white/[0.02] text-slate-500 hover:bg-white/[0.05] hover:text-slate-300'
                                )}
                              >
                                {option.label}
                                {field.value === option.value && (
                                  <motion.div
                                    layoutId={`${question.id}-active-glow`}
                                    className="absolute inset-0 rounded-2xl ring-2 ring-emerald-500/20"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    )}

                    {/* TEXTAREA */}
                    {question.type === 'textarea' && (
                      <Controller
                        name={question.name}
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <textarea
                              {...field}
                              placeholder={question.placeholder}
                              className={cn(
                                'min-h-[100px] w-full resize-none rounded-2xl border bg-white/[0.02] p-4 text-xs text-white transition-all placeholder:text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none',
                                errors.comment
                                  ? 'border-rose-500/50'
                                  : 'border-white/[0.05] focus:border-emerald-500/30'
                              )}
                            />
                          </div>
                        )}
                      />
                    )}

                    {errors[question.name as keyof typeof errors] && (
                      <p className="px-1 text-[10px] font-bold text-rose-500">
                        {errors[question.name as keyof typeof errors]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  disabled={!isValid || isSubmitting}
                  type="submit"
                  className={cn(
                    'group relative w-full overflow-hidden rounded-2xl py-4 transition-all duration-500 active:scale-95',
                    isValid && !isSubmitting
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)]'
                      : 'cursor-not-allowed bg-white/[0.05] opacity-50'
                  )}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.1),transparent)] transition-transform duration-1000 group-hover:translate-x-full" />
                  <span className="flex items-center justify-center gap-2 text-sm font-black tracking-widest text-white uppercase">
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                      />
                    ) : (
                      <>
                        Submit Feedback <CheckCircle2 size={18} className="text-white/80" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
