'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, CheckCircle2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  feedbackFormSchema,
  feedbackQuestions,
  type FeedbackFormType,
  type FeedbackResponse,
} from '@/lib/schemas/feedback';
import { toast } from 'sonner';

interface TestSeriesFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: FeedbackFormType) => Promise<FeedbackResponse | void>;
  testSeriesId?: string;
  userName?: string;
}

export function TestSeriesFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  userName,
}: TestSeriesFeedbackModalProps) {

  const {
    control,
    handleSubmit,
    watch,
  } = useForm<FeedbackFormType>({
    resolver: zodResolver(feedbackFormSchema),
    mode: 'onChange',
    defaultValues: {
      overallRating: 0,
    },
  });

  const formData = watch();
  const rating = formData.overallRating;

  const getRatingEmoji = (val: number) => {
    switch (val) {
      case 1: return { emoji: '😞', color: 'text-rose-400' };
      case 2: return { emoji: '😐', color: 'text-amber-400' };
      case 3: return { emoji: '😊', color: 'text-emerald-400' };
      case 4: return { emoji: '🌟', color: 'text-blue-400' };
      case 5: return { emoji: '🔥', color: 'text-orange-400' };
      default: return null;
    }
  };

  const ratingInfo = getRatingEmoji(rating);

  const handleFormSubmit = async (data: FeedbackFormType) => {
    // 1. Immediately close the modal for a snappy UX
    onClose();
    
    // 2. Perform submission in background using a toast for status
    if (onSubmit) {
      // Create a wrapper to ensure toast.promise catches non-throwing errors (e.g. { success: false })
      const wrappedSubmit = async () => {
        const result = await onSubmit(data);
        // Check for common error patterns in returned objects
        if (result && typeof result === 'object' && 'success' in result && result.success === false) {
          throw new Error(result.message || result.error || 'Submission failed');
        }
        return result;
      };

      toast.promise(wrappedSubmit(), {
        loading: 'Sharing your feedback...',
        success: 'Feedback sent! Thank you.',
        error: (err) => err instanceof Error ? err.message : 'Failed to send feedback',
      });
    }
  };

  const isReadyToSubmit = 
    formData.overallRating > 0 && 
    formData.difficultyLevel && 
    formData.wouldRecommend &&
    (formData.overallRating !== 1 || (formData.comment && formData.comment.trim() !== ''));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md transition-all duration-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[380px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl"
      >
        {/* TOP RIGHT EMOJI EXPERIENCE */}
        <AnimatePresence>
          {ratingInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: 20, y: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-6 right-8 z-20 flex flex-col items-center"
            >
              <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                {ratingInfo.emoji}
              </span>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={cn("mt-1 h-1 w-4 rounded-full bg-current opacity-40 blur-[2px]", ratingInfo.color)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow Effects */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Zap className="h-6 w-6 fill-emerald-500" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              {userName ? `Thanks ${userName.split(' ')[0]}!` : 'Quick Feedback'}
            </h2>
            <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
               improvement in 3 clicks
            </p>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
                {feedbackQuestions.slice(0, 3).map((question) => (
                  <div key={question.id} className="space-y-4">
                    <label className="block text-center text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                      {question.label}
                    </label>

                    {/* STARS */}
                    {question.type === 'stars' && (
                      <Controller
                        name={question.name}
                        control={control}
                        render={({ field }) => (
                          <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => field.onChange(star)}
                                className="group relative transition-all duration-300 hover:scale-125 active:scale-95"
                              >
                                {star <= field.value && (
                                  <motion.div
                                    layoutId="star-glow"
                                    className="absolute inset-0 rounded-full bg-amber-400/20 blur-md"
                                  />
                                )}
                                <Star
                                  size={32}
                                  className={cn(
                                    'transition-all duration-300',
                                    star <= field.value
                                      ? 'scale-110 fill-amber-400 text-amber-400'
                                      : 'text-slate-700 group-hover:text-slate-500'
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
                          <div className="flex flex-wrap justify-center gap-2">
                            {question.options?.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={cn(
                                  'relative flex h-11 items-center justify-center rounded-2xl border px-4 text-xs font-black transition-all duration-300 active:scale-95',
                                  field.value === option.value
                                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                    : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                )}
                              >
                                {option.label}
                                {field.value === option.value && (
                                  <motion.div
                                    layoutId={`${question.id}-active`}
                                    className="absolute inset-0 rounded-2xl border-2 border-emerald-500/50"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    )}
                  </div>
                ))}

                {/* CONDITIONAL COMMENT FOR 1 STAR */}
                <AnimatePresence>
                  {rating === 1 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 py-2 border-t border-white/5 mt-4">
                        <label className="block text-center text-[10px] font-black tracking-[0.2em] text-rose-500 uppercase">
                          How can we improve? (Required)
                        </label>
                        <Controller
                          name="comment"
                          control={control}
                          render={({ field }) => (
                            <div className="group relative">
                              <textarea
                                {...field}
                                value={field.value || ''}
                                placeholder="Please share what went wrong or how we can improve your experience..."
                                className="w-full min-h-[100px] resize-none rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-[13px] leading-relaxed text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:bg-white/[0.07] focus:outline-none transition-all duration-300 font-bold"
                              />
                              <div className="absolute inset-0 pointer-events-none rounded-[1.5rem] bg-gradient-to-b from-rose-500/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            </div>
                          )}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!isReadyToSubmit}
                  className={cn(
                    "group relative h-14 w-full overflow-hidden rounded-[1.25rem] font-black transition-all duration-300 active:scale-95",
                    isReadyToSubmit 
                      ? "bg-white text-slate-900 shadow-[0_20px_40px_-12px_rgba(255,255,255,0.2)]" 
                      : "bg-white/5 text-slate-600 border border-white/5 pointer-events-none"
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Submit Feedback</span>
                    <CheckCircle2 size={18} className={cn(isReadyToSubmit ? "text-emerald-500" : "text-slate-600")} />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-center text-xs font-bold text-slate-500 hover:text-white transition-colors"
                >
                  Skip for now
                </button>
              </form>
        </div>
      </motion.div>
    </div>
  );
}
