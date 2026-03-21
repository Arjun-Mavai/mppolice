'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Eye, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { OverallWeightageSubjectData } from '@/actions/pyq-analytics';
import { SUBJECTS, SUBJECT_VARIANTS } from '@/lib/pyq-ui-constants';
import { TransitionLink } from '@/components/ui/transition-link';

interface OverallWeightageProps {
  simpleSubjectStats: Record<string, number>;
  subjectQuestionsData: OverallWeightageSubjectData[];
  isHindi: boolean;
}

export function OverallWeightage({ simpleSubjectStats, subjectQuestionsData, isHindi }: OverallWeightageProps) {
  const router = useRouter();
  const [isMainExpanded, setIsMainExpanded] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);

  // Get total questions from simple stats (same as PYQ page)
  const totalQuestions = useMemo(
    () => Object.values(simpleSubjectStats).reduce((sum, count) => sum + count, 0),
    [simpleSubjectStats]
  );
  
  // 🔧 PERF FIX: Memoize expensive array operations (map/filter/sort)
  // This prevents recalculation on every expandedSubjects or isMainExpanded change
  const subjectsWithCounts = useMemo(() => 
    SUBJECTS.map(sub => ({
      ...sub,
      count: simpleSubjectStats[sub.name] || 0,
      percentage: totalQuestions > 0 ? Math.round(((simpleSubjectStats[sub.name] || 0) / totalQuestions) * 100) : 0,
    })).filter(sub => sub.count > 0).sort((a, b) => b.count - a.count),
    [simpleSubjectStats, totalQuestions]
  );

  const toggleMainSection = () => {
    setIsMainExpanded(!isMainExpanded);
  };

  const toggleSubject = (subjectName: string) => {
    setExpandedSubjects(prev =>
      prev.includes(subjectName) ? prev.filter(s => s !== subjectName) : [...prev, subjectName]
    );
  };

  useEffect(() => {
    router.prefetch('/syllabus/quiz/pyq/intelligence/questions?subject=All&source=subject');
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-1">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          {isHindi ? 'समग्र महत्व (2020-2025)' : 'Overall Weightage (2020-2025)'}
        </h2>
      </div>

      {/* Main Overall Weightage Section - Same style as Paper Analysis */}
      <div className="relative">
        <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-amber-500/20 to-yellow-500/20 opacity-20 blur-xl" />
        
        <Card className="relative z-10 overflow-hidden rounded-[2rem] border-slate-800 bg-slate-900 shadow-2xl">
          {/* Main Header - Same style as Paper Analysis year header */}
          <div
            className="flex cursor-pointer items-center justify-between border-b border-white/5 bg-transparent px-6 py-6"
            onClick={toggleMainSection}
          >
            <div className="flex flex-col gap-1">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium tracking-wider text-slate-400 uppercase">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                MPPSC Prelims
              </div>
              <h3 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Overall Weightage (2020-2025)
                <Badge
                  variant="outline"
                  className="hidden rounded-full border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-400 sm:inline-flex"
                >
                  {totalQuestions} {isHindi ? 'प्रश्न' : 'Questions'}
                </Badge>
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="h-8 border border-slate-700 bg-slate-800 px-3 font-mono text-sm text-slate-300 sm:inline-flex"
              >
                {subjectsWithCounts.length} {isHindi ? 'विषय' : 'Subjects'}
              </Badge>
              
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 shadow-inner">
                {isMainExpanded ? (
                  <ChevronUp className="h-5 w-5 text-amber-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Main Expanded Content */}
          <AnimatePresence>
            {isMainExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* All Subject Cards Inside */}
                    {subjectsWithCounts.map((sub) => {
                      const variant = SUBJECT_VARIANTS[sub.color];
                      const Icon = sub.icon;
                      const isSubjectExpanded = expandedSubjects.includes(sub.name);
                      
                      return (
                        <div key={sub.name} className="rounded-xl border border-slate-800/50 bg-slate-800/30 transition-colors hover:bg-slate-800/50">
                          {/* Subject Header */}
                          <div
                            className="flex cursor-pointer items-center gap-4 p-4 sm:p-5"
                            onClick={() => toggleSubject(sub.name)}
                          >
                            <div className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
                              variant.bg
                            )}>
                              <Icon className={cn("h-5 w-5", variant.text)} />
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white truncate">
                                  {sub.name}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className="h-5 shrink-0 border border-slate-700 bg-slate-900 px-2 font-mono text-[10px] text-slate-400"
                                >
                                  {sub.count}
                                </Badge>
                              </div>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {sub.percentage}% {isHindi ? 'कुल प्रश्नों का' : 'of total questions'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <TransitionLink
                                href={`/syllabus/quiz/pyq/intelligence/questions?subject=${encodeURIComponent(sub.name)}&source=subject`}
                                onClick={(e) => e.stopPropagation()}
                                transitionTypes={['slide']}
                                className="inline-flex h-7 items-center gap-1.5 rounded-md bg-indigo-500/10 px-3 text-xs font-bold text-indigo-400 transition-colors hover:bg-indigo-500/20 hover:text-indigo-300"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                {isHindi ? 'सभी देखें' : 'View All'}
                              </TransitionLink>

                              <div className="shrink-0">
                                {isSubjectExpanded ? (
                                  <ChevronUp className={cn("h-5 w-5", variant.text)} />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-slate-600" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Subject Expanded content */}
                          <AnimatePresence>
                            {isSubjectExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-slate-800/50 p-4">
                                  {(() => {
                                    // Find questions for this subject
                                    const subjectData = subjectQuestionsData.find(data => data.subject === sub.name);
                                    const subjectQuestions = subjectData?.questions || [];
                                    const limitedQuestions = subjectQuestions.slice(0, 5); // Show first 5 questions

                                    return limitedQuestions.length > 0 ? (
                                      <div className="space-y-3">
                                        {limitedQuestions.map((q, idx) => (
                                          <div key={q.id} className="rounded-lg border border-slate-800/50 bg-slate-900/50 p-3">
                                            <div className="flex items-start gap-3">
                                              {/* Question Number */}
                                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300">
                                                {q.qNo}
                                              </div>
                                              
                                              {/* Question Content */}
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white leading-relaxed mb-1">
                                                  {isHindi ? q.text : q.textEn || q.text}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                  <span>{q.testTitle}</span>
                                                  <span>•</span>
                                                  <span>{q.year}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-6">
                                        <p className="text-sm text-slate-400">
                                          {isHindi ? 'कोई प्रश्न उपलब्ध नहीं' : 'No questions available'}
                                        </p>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Overall View All Button */}
      <div className="flex justify-center pt-4">
        <TransitionLink href="/syllabus/quiz/pyq/intelligence/questions?subject=All&source=subject" transitionTypes={['slide']}>
          <Button
            variant="outline"
            size="lg"
            className="border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
          >
            <Eye className="mr-2 h-4 w-4" />
            {isHindi ? 'सभी विषय प्रश्न देखें' : 'View All Subject Questions'}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </TransitionLink>
      </div>
    </div>
  );
}
