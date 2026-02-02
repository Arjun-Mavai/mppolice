import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function TopicLoading() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8 pt-32">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64 rounded-lg" />
                            <Skeleton className="h-4 w-48 rounded-lg" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-full md:w-64 rounded-xl" />
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Card key={i} className="h-full border-l-4 border-slate-200">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                </div>
                                <Skeleton className="h-12 w-full rounded-lg" />
                                <Skeleton className="h-4 w-24 rounded-lg" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
