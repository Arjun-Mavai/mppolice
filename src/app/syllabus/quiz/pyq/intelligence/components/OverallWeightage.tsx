'use client';

import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { ExpandableCard } from './shared/ExpandableCard';
import { UnitCard } from './UnitCard';
import { UnitDistributionStats, RepeatedQuestion, SubjectDistributionStats } from '@/actions/pyq-analytics';
import { QuestionData } from './QuestionItem';

interface OverallWeightageProps {
  subjectStats: SubjectDistributionStats[];
  stats: UnitDistributionStats[];
  repeatedQuestions: RepeatedQuestion[];
  isHindi: boolean;
}

interface CombinedSubjectStat {
  subjectId: string;
  subjectTitle: string;
  count: number;
  questions: QuestionData[];
}

// Subject color mapping like topic analysis page
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

export function OverallWeightage({ subjectStats, stats, repeatedQuestions, isHindi }: OverallWeightageProps) {
  // Aggregate subject stats across all years  
  const combinedStats = subjectStats.reduce((acc, curr) => {
    if (!acc[curr.subjectId]) {
      acc[curr.subjectId] = {
        subjectId: curr.subjectId,
        subjectTitle: curr.subjectTitle,
        count: 0,
        questions: [],
      };
    }
    acc[curr.subjectId].count += curr.count;
    // Map questions to QuestionData format (including year mapping)
    const mappedQuestions: QuestionData[] = curr.questions.map((q) => ({
      id: q.id,
      text: q.text,
      textEn: '', // Will be filled from stats if needed
      year: curr.year,
      qNo: q.order,
    }));
    acc[curr.subjectId].questions.push(...mappedQuestions);
    return acc;
  }, {} as Record<string, CombinedSubjectStat>);

  const sortedCombined = Object.values(combinedStats).sort((a, b) => b.count - a.count);
  const totalQuestions = sortedCombined.reduce((acc, curr) => acc + curr.count, 0);

  // Helper to find repeat count
  const getRepeatCount = (questionId: string): number => {
    const match = repeatedQuestions.find((rq) => rq.questionId === questionId);
    return match?.count || 0;
  };

  // Helper to get subject color
  const getSubjectColor = (subjectId: string): string => {
    return SUBJECT_COLORS[subjectId as keyof typeof SUBJECT_COLORS] || 'bg-slate-600';
  };

  const header = (
    <div className="flex flex-col gap-1">
      <div className="mb-1 flex items-center gap-2 text-sm font-medium tracking-wider text-slate-400 uppercase">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {isHindi ? 'विषयवार वितरण 2020-2025' : 'Subject Distribution 2020-2025'}
      </div>
      <h3 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        {isHindi ? 'समग्र महत्व' : 'Overall Weightage'}
        <Badge
          variant="outline"
          className="hidden rounded-full border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-400 sm:inline-flex"
        >
          {totalQuestions} {isHindi ? 'प्रश्न' : 'Questions'}
        </Badge>
      </h3>
    </div>
  );

  return (
    <ExpandableCard
      id="overall-weightage"
      header={header}
      gradientFrom="from-amber-500/20"
      gradientTo="to-yellow-500/20"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {sortedCombined.map((subjectStat) => {
            const percentage = ((subjectStat.count / totalQuestions) * 100).toFixed(1);
            
            return (
              <div
                key={subjectStat.subjectId}
                className="group rounded-xl border border-slate-800/50 bg-slate-900/40 p-4 transition-all hover:border-slate-700/50 hover:bg-slate-800/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${getSubjectColor(subjectStat.subjectId)}`} />
                    <div>
                      <div className="font-medium text-white">{subjectStat.subjectTitle}</div>
                      <div className="text-sm text-slate-400">
                        {subjectStat.count} questions • {percentage}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{subjectStat.count}</div>
                    <div className="text-xs text-slate-400">{percentage}%</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3 h-2 rounded-full bg-slate-800/50">
                  <div
                    className={`h-full rounded-full ${getSubjectColor(subjectStat.subjectId)} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </ExpandableCard>
  );
}
