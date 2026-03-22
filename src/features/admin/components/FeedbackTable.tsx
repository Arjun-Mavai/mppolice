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
import { Star, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Types
interface Feedback {
  id: string;
  userName?: string | null;
  userEmail?: string | null;
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
        setFeedbacks(data.feedbacks);
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
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      case 'too_easy':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'just_right':
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200';
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading test feedbacks...</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
        <h3 className="flex items-center gap-2 font-bold text-slate-800">
          <MessageSquare className="h-4 w-4 text-indigo-600" /> Test Series Feedback
        </h3>
        <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500">
          Total: {feedbacks.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">User</TableHead>
              <TableHead className="w-[150px]">Test</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead className="w-[100px]">Rating</TableHead>
              <TableHead className="w-[100px]">Difficulty</TableHead>
              <TableHead className="w-[120px] text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  No test feedback received yet.
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{item.userName || 'Anonymous'}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {item.userEmail || 'No email'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-600 line-clamp-2" title={item.testTitle || ''}>
                      {item.testTitle || 'Unknown Test'}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate text-sm text-slate-700" title={item.comments || ''}>
                      {item.comments || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      <span className="mr-1 text-sm font-bold">{item.overallRating}</span>
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-md border-0 text-[10px] ${getDifficultyColor(item.difficultyLevel)}`}>
                      {item.difficultyLevel.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-[10px] text-slate-500">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
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
