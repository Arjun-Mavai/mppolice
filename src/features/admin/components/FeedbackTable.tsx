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
  name: string;
  email?: string;
  phone?: string;
  message: string;
  rating: number;
  category: string;
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
      const res = await fetch('/api/admin/feedbacks'); // We need to create this API endpoint to fetch data
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks);
      }
    } catch (error) {
      console.error('Failed to fetch feedbacks', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug':
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      case 'feature':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
      case 'content':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'ui':
        return 'bg-pink-100 text-pink-700 hover:bg-pink-200';
      default:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200';
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading feedbacks...</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
        <h3 className="flex items-center gap-2 font-bold text-slate-800">
          <MessageSquare className="h-4 w-4 text-indigo-600" /> User Feedback
        </h3>
        <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500">
          Total: {feedbacks.length}
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">User</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="w-[100px]">Rating</TableHead>
            <TableHead className="w-[100px]">Category</TableHead>
            <TableHead className="w-[120px] text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbacks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                No feedback received yet.
              </TableCell>
            </TableRow>
          ) : (
            feedbacks.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{item.name}</span>
                    <span className="text-xs text-slate-500">
                      {item.email || item.phone || 'Anonymous'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="truncate text-sm text-slate-700" title={item.message}>
                    {item.message}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    <span className="mr-1 text-sm font-bold">{item.rating}</span>
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`rounded-md border-0 ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-slate-500">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
