'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { QuestionList, QuestionData } from './QuestionItem';

interface SubjectCardProps {
  subjectId: string;
  subjectTitle: string;
  questionCount: number;
  totalQuestions: number;
  questions: QuestionData[];
  isHindi: boolean;
  getRepeatCount?: (questionId: string) => number;
  defaultExpanded?: boolean;
  groupQuestionsByYear?: boolean;
  colorClass: string;
}

// Subject color mapping
const SUBJECT_COLORS = {
  'mp-gk': 'bg-rose-500',
  'indian-history': 'bg-orange-500', 
  'geography': 'bg-amber-400',
  'indian-polity': 'bg-emerald-500',
  'economy': 'bg-blue-500',
  'general-science': 'bg-indigo-500',
  'current-affairs': 'bg-purple-500',
  'ict': 'bg-pink-500',
  'general-studies': 'bg-slate-600',
} as const;

export function SubjectCard({
  subjectId,
  subjectTitle,
  questionCount,
  totalQuestions,
  questions,
  isHindi,
  getRepeatCount,
  defaultExpanded = false,
  groupQuestionsByYear = false,
  colorClass,
}: SubjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const percentage = totalQuestions > 0 ? Math.round((questionCount / totalQuestions) * 100) : 0;
  
  // Get subject color
  const subjectColor = SUBJECT_COLORS[subjectId as keyof typeof SUBJECT_COLORS] || 'bg-slate-600';
  
  // Build View All URL - redirect to main topic-wise page with subject filter
  const getSubjectViewAllUrl = (subjectTitle: string): string => {
    // Map to the topic-wise page with subject pre-selected
    const subjectMapping: Record<string, string> = {
      'MP GK': 'MP GK',
      'History': 'History', 
      'Geography': 'Geography',
      'Polity': 'Polity',
      'Economy': 'Economy',
      'Science': 'Science',
      'ICT': 'ICT',
      'Current Affairs': 'Current Affairs',
      'Misc': 'Misc'
    };
    
    const mappedSubject = subjectMapping[subjectTitle] || subjectTitle;
    // Redirect to main PYQ page in topic-wise mode
    return `/syllabus/quiz/pyq?mode=subject&subject=${encodeURIComponent(mappedSubject)}`;
  };
  
  const viewAllUrl = getSubjectViewAllUrl(subjectTitle);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <motion.div
      layout
      className="group rounded-xl border border-slate-800/50 bg-slate-900/40 transition-all hover:border-slate-700/50 hover:bg-slate-800/50"
      initial={false}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Subject Badge */}
            <div className={cn('h-3 w-3 rounded-full', subjectColor)} />
            <div className="flex flex-col">
              <div className="font-medium text-white">{subjectTitle}</div>
              <div className="text-sm text-slate-400">
                {questionCount} {isHindi ? 'प्रश्न' : 'questions'} • {percentage}%
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Question Count */}
            <div className="text-right">
              <div className="text-lg font-bold text-white">{questionCount}</div>
              <div className="text-xs text-slate-400">{percentage}%</div>
            </div>
            
            {/* Expand Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
              className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 rounded-full bg-slate-800/50">
          <div
            className={cn('h-full rounded-full transition-all duration-500', subjectColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-800/50 px-4 pb-4 pt-4">
              {/* Questions List */}
              <QuestionList
                questions={questions}
                isHindi={isHindi}
                getRepeatCount={getRepeatCount}
                showAllExpanded={showAllQuestions}
                groupByYear={groupQuestionsByYear}
              />

              {/* Show More/Less Toggle */}
              {questions.length > 5 && (
                <div className="mt-4 flex items-center justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllQuestions(!showAllQuestions)}
                    className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700"
                  >
                    {showAllQuestions 
                      ? (isHindi ? 'कम दिखाएं' : 'Show Less')
                      : (isHindi ? `सभी ${questions.length} प्रश्न देखें` : `Show All ${questions.length} Questions`)
                    }
                  </Button>
                </div>
              )}

              {/* View All Link */}
              <div className="mt-4 flex justify-center">
                <Link href={viewAllUrl}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white',
                      'transition-all duration-200'
                    )}
                  >
                    <Eye size={14} className="mr-2" />
                    {isHindi ? 'सभी प्रश्न देखें' : 'View All Questions'}
                    <ExternalLink size={12} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}