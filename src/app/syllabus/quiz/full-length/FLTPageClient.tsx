'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Play, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { useRouter } from 'next/navigation';

export interface TestWithAccess {
    id: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    totalMarks: number;
    totalQuestions: number;
    maxRetries: number | null;
    
    // Server-computed access control & state
    isLocked: boolean;
    isCompleted: boolean;
    attemptsCount: number;
    attemptsLeft: number;
    showFreeBadge: boolean;
}

interface FLTPageClientProps {
    tests: TestWithAccess[];
}

export default function FLTPageClient({ tests }: FLTPageClientProps) {
    const router = useRouter();
    const [paywallOpen, setPaywallOpen] = useState(false);

    const handleTestClick = (testId: string, isLocked: boolean, attemptsLeft: number) => {
        if (isLocked) {
            setPaywallOpen(true);
            return;
        }

        if (attemptsLeft > 0) {
            router.push(`/syllabus/quiz/play?mode=full&testId=${testId}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6 pb-20">
             <div className="max-w-4xl mx-auto space-y-8">
                 {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/syllabus/quiz">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 font-display">
                           Full Length Tests
                        </h1>
                        <p className="text-slate-500">Simulate the real exam environment.</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {tests.length > 0 ? tests.map((test) => {
                        const { 
                            id, 
                            title, 
                            description, 
                            isLocked, 
                            isCompleted, 
                            attemptsLeft, 
                            maxRetries, 
                            attemptsCount, 
                            showFreeBadge 
                        } = test;

                        // Default retries if null (though server should handle this, good fallback)
                        const safeMaxRetries = maxRetries || 3;

                        return (
                            <Card 
                                key={id}
                                className={cn(
                                    "transition-all hover:shadow-lg border-2 cursor-pointer",
                                    isLocked ? "border-slate-200 bg-slate-50 opacity-90" : 
                                    isCompleted ? "border-indigo-200 bg-indigo-50/20" :
                                    "border-slate-200 bg-white hover:border-indigo-400"
                                )}
                                onClick={() => handleTestClick(id, isLocked, attemptsLeft)}
                            >
                                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-start justify-between md:justify-start gap-3">
                                            <h3 className={cn("font-bold text-lg flex items-center gap-2", isLocked ? "text-slate-500" : "text-slate-900")}>
                                                {title}
                                            </h3>
                                            {isLocked && <Lock className="w-4 h-4 text-slate-400 mt-1" />}
                                            {showFreeBadge && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Free</Badge>}
                                            {isCompleted && <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">Completed</Badge>}
                                        </div>
                                        
                                        <p className="text-sm text-slate-500 line-clamp-2">{description || "Comprehensive mock test covering all units."}</p>
                                        
                                        {!isLocked && (
                                            <div className="flex items-center gap-4 text-xs font-medium text-slate-400 pt-1">
                                                <span>{test.durationMinutes} Mins</span>
                                                <span>•</span>
                                                <span>{test.totalMarks} Marks</span>
                                            </div>
                                        )}

                                        {!isLocked && (
                                            <div className="max-w-[200px] space-y-1.5 pt-2">
                                                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                                                    <span className={attemptsLeft > 0 ? "text-slate-500" : "text-red-500"}>
                                                        Attempts
                                                    </span>
                                                    <span className={cn(
                                                        "bg-slate-100 px-1.5 py-0.5 rounded text-slate-600",
                                                        attemptsLeft === 0 && "bg-red-100 text-red-600"
                                                    )}>
                                                        {attemptsLeft} / {safeMaxRetries}
                                                    </span>
                                                </div>
                                                <Progress value={(attemptsCount / safeMaxRetries) * 100} className="h-1.5 bg-slate-100" 
                                                    indicatorClassName={cn(attemptsLeft > 0 ? "bg-indigo-500" : "bg-red-500")}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex md:flex-col gap-3 shrink-0">
                                        {isLocked ? (
                                            <Button className="w-full md:w-32 bg-slate-200 text-slate-400 hover:bg-slate-300 cursor-pointer">
                                                <Lock className="w-4 h-4 mr-2" /> Locked
                                            </Button>
                                        ) : isCompleted ? (
                                             <Button className="w-full md:w-32 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold shadow-none">
                                                Review
                                            </Button>
                                        ) : (
                                            <Button className="w-full md:w-32 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200">
                                                <Play className="w-4 h-4 mr-2" /> Start Test
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    }) : (
                        <div className="text-center py-12 text-slate-400">
                            No Full Length Tests available at the moment.
                        </div>
                    )}
                </div>
             </div>
             
             <SyllabusLockModal open={paywallOpen} onOpenChange={setPaywallOpen} />
        </div>
    );
}
