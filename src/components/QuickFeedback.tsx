'use client';

import React, { useState, useOptimistic, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Lightbulb, ThumbsDown, HelpCircle, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { submitIntelligenceFeedback, type IntelligenceReaction } from '@/actions/intelligence-actions';
import { toast } from 'sonner';
import { useSettingsStore } from '@/store/useSettingsStore';

interface QuickFeedbackProps {
  questionId: string;
  questionText: string;
  source?: string; 
  className?: string;
  unitInfo?: string;
}

export function QuickFeedback({
  questionId,
  questionText,
  source,
  className,
  unitInfo,
}: QuickFeedbackProps) {
  
  const { user } = useSettingsStore();
  const isSubscribed = user?.isSubscribed || user?.planTier === 'pro'; 

  const [reaction, setReaction] = useState<IntelligenceReaction | null>(null);
  const [isPending, startTransition] = useTransition();
  
  const [optimisticReaction, setOptimisticReaction] = useOptimistic<IntelligenceReaction | null, IntelligenceReaction | null>(
    reaction,
    (_, newState) => newState
  );

  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const onReact = async (type: IntelligenceReaction) => {
    if (type === 'unhelpful' || type === 'doubt') {
      if (reaction === type) {
        setShowFeedbackBox(!showFeedbackBox);
        return;
      }
      setReaction(type);
      setShowFeedbackBox(true);
      return;
    }

    if (reaction === type) return;

    startTransition(() => {
      setOptimisticReaction(type);
      setReaction(type);
      toast.success('Thanks for the feedback!', {
        icon: <Check className="h-4 w-4 text-emerald-500" />,
      });
    });

    submitIntelligenceFeedback({
      questionId,
      questionText,
      reaction: type,
      isPro: isSubscribed,
      source,
      unitInfo,
      userId: user?.id,
      userName: user?.name || undefined,
      userEmail: user?.email || undefined,
      guestMobile: typeof localStorage !== 'undefined' ? (localStorage.getItem('APP_guest_name') || undefined) : undefined,
    }).catch(e => console.error('Reaction failed', e));
  };

  const submitWithComment = async () => {
    if (isPending) return;
    
    setShowFeedbackBox(false);
    toast.success('Feedback saved. We will improve this!', {
      icon: <Check className="h-4 w-4 text-rose-500" />,
    });

    submitIntelligenceFeedback({
      questionId,
      questionText,
      reaction: reaction || 'doubt',
      message: feedbackMsg,
      isPro: isSubscribed,
      source,
      unitInfo,
      userId: user?.id,
      userName: user?.name || undefined,
      userEmail: user?.email || undefined,
      guestMobile: typeof localStorage !== 'undefined' ? (localStorage.getItem('APP_guest_name') || undefined) : undefined,
    }).catch(e => console.error('Comment failed', e));
    
    setFeedbackMsg('');
  };

  return (
    <div className={cn('mt-6 flex flex-col items-center gap-3', className)}>
      <div className="flex items-center gap-1.5 rounded-full border border-slate-400/20 bg-slate-400/10 p-1.5 shadow-sm">
        <p className="px-2 text-[9px] font-black tracking-widest text-slate-500 uppercase">
          Helpful?
        </p>
        
        <div className="flex items-center gap-1">
          <ReactionButton
            icon={<ThumbsUp className="h-3.5 w-3.5" />}
            active={optimisticReaction === 'helpful'}
            onClick={() => onReact('helpful')}
            activeColor="bg-emerald-500"
          />
          <ReactionButton
            icon={<Lightbulb className="h-3.5 w-3.5" />}
            active={optimisticReaction === 'insightful'}
            onClick={() => onReact('insightful')}
            activeColor="bg-amber-400"
          />
          <ReactionButton
            icon={<ThumbsDown className="h-3.5 w-3.5" />}
            active={optimisticReaction === 'unhelpful'}
            onClick={() => onReact('unhelpful')}
            activeColor="bg-rose-500"
          />
          <ReactionButton
            icon={<HelpCircle className="h-3.5 w-3.5" />}
            active={optimisticReaction === 'doubt'}
            onClick={() => onReact('doubt')}
            activeColor="bg-blue-500"
          />
        </div>
      </div>

      <AnimatePresence>
        {showFeedbackBox && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-rose-900 uppercase tracking-tight">How can we improve this?</p>
              <button 
                onClick={() => setShowFeedbackBox(false)} 
                className="rounded-full p-1 text-slate-300 hover:bg-slate-100 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={feedbackMsg}
              onChange={(e) => setFeedbackMsg(e.target.value)}
              placeholder="Tell us what's missing or wrong..."
              className="min-h-[70px] w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-rose-200"
            />
            <Button
              size="sm"
              disabled={!feedbackMsg.trim()}
              onClick={submitWithComment}
              className="h-9 w-full rounded-xl bg-rose-600 text-[10px] font-black uppercase text-white hover:bg-rose-700"
            >
              Submit Feedback
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReactionButton({ icon, active, onClick, activeColor }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 active:scale-90',
        active ? cn(activeColor, 'text-white shadow-md') : 'text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm'
      )}
    >
      {icon}
      {active && (
        <motion.span
          layoutId="reaction-ring"
          className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-current"
        />
      )}
    </button>
  );
}
