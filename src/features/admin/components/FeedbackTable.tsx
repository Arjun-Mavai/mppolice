'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Feedback {
  id: string;
  userName?: string | null;
  userEmail?: string | null;
  testId?: string | null;
  testTitle?: string | null;
  comments?: string | null;
  overallRating: number;
  difficultyLevel: string;
  questionQuality: string;
  wouldRecommend: string;
  createdAt: string;
}

export function FeedbackTable() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/admin/test-feedbacks');
      if (res.ok) {
        const data = await res.json();
        // Sort by rating (5 stars first) then by date
        const sorted = data.feedbacks.sort((a: Feedback, b: Feedback) => {
          if (b.overallRating !== a.overallRating) {
            return b.overallRating - a.overallRating;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setFeedbacks(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch test feedbacks', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'too_hard':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'too_easy':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'just_right':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-600 bg-emerald-50';
    if (rating >= 3.5) return 'text-blue-600 bg-blue-50';
    if (rating >= 2.5) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  // Calculate stats
  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.overallRating, 0) / feedbacks.length).toFixed(1)
    : '0.0';
  
  const excellentCount = feedbacks.filter(f => f.overallRating >= 4).length;
  const needsImprovement = feedbacks.filter(f => f.overallRating < 3).length;

  if (loading) return <div className="p-8 text-center text-slate-500">Loading test feedbacks...</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Enhanced Header with Stats */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <h3 className="font-black text-slate-900">Test Series Feedback</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Average Rating */}
            <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 shadow-sm border border-slate-200">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-black text-slate-900">{avgRating}</span>
              <span className="text-xs font-medium text-slate-500">avg</span>
            </div>

            {/* Excellent Count */}
            {excellentCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 border border-emerald-200">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">{excellentCount} Excellent</span>
              </div>
            )}

            {/* Needs Improvement */}
            {needsImprovement > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 border border-rose-200">
                <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                <span className="text-xs font-bold text-rose-700">{needsImprovement} Low</span>
              </div>
            )}

            {/* Total Count */}
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <span className="text-xs font-bold text-slate-600">Total: {feedbacks.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="w-[140px] font-bold">User</TableHead>
              <TableHead className="w-[180px] font-bold">Test Name</TableHead>
              <TableHead className="font-bold">User Feedback</TableHead>
              <TableHead className="w-[90px] text-center font-bold">Rating</TableHead>
              <TableHead className="w-[100px] font-bold">Difficulty</TableHead>
              <TableHead className="w-[100px] font-bold">Quality</TableHead>
              <TableHead className="w-[110px] font-bold">Recommend?</TableHead>
              <TableHead className="w-[100px] text-right font-bold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-slate-300" />
                    <span>No feedback received yet.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((item, index) => (
                <TableRow 
                  key={item.id}
                  className={cn(
                    'transition-colors hover:bg-slate-50',
                    item.overallRating >= 4 && 'bg-emerald-50/30',
                    item.overallRating < 3 && 'bg-rose-50/30'
                  )}
                >
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-900">{item.userName || 'Anonymous'}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={item.userEmail || ''}>
                        {item.userEmail || 'No email'}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-bold text-slate-700 line-clamp-2 leading-tight" title={item.testTitle || ''}>
                        {item.testTitle || 'Unknown Test'}
                      </span>
                      {item.testId && (
                        <span className="text-[9px] text-slate-400 font-mono">ID: {item.testId.slice(0, 8)}</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="max-w-sm">
                    {item.comments ? (
                      <p className="text-[13px] leading-relaxed text-slate-700 line-clamp-2" title={item.comments}>
                        "{item.comments}"
                      </p>
                    ) : (
                      <span className="text-xs italic text-slate-400">No comment</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className={cn(
                      'flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 mx-auto w-fit',
                      getRatingColor(item.overallRating)
                    )}>
                      <span className="text-base font-black">{item.overallRating}</span>
                      <Star size={14} className="fill-current" />
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={cn(
                      'rounded-lg border text-[10px] font-bold uppercase',
                      getDifficultyColor(item.difficultyLevel)
                    )}>
                      {item.difficultyLevel.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={cn(
                      'rounded-lg border-0 text-[10px] font-bold uppercase',
                      item.questionQuality === 'excellent' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                      item.questionQuality === 'good' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      item.questionQuality === 'average' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                      'bg-rose-100 text-rose-700 border-rose-200'
                    )}>
                      {item.questionQuality}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={cn(
                      'rounded-lg border-0 text-[10px] font-bold uppercase',
                      item.wouldRecommend === 'definitely' ? 'bg-indigo-100 text-indigo-700' :
                      item.wouldRecommend === 'probably' ? 'bg-sky-100 text-sky-700' :
                      item.wouldRecommend === 'maybe' ? 'bg-slate-100 text-slate-700' : 
                      'bg-red-100 text-red-700'
                    )}>
                      {item.wouldRecommend}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-0.5 text-[10px] whitespace-nowrap">
                      <span className="font-bold text-slate-700">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="text-slate-400">
                        {new Date(item.createdAt).toLocaleTimeString('en-IN', {
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
