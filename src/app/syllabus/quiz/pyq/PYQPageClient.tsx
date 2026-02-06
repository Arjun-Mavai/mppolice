'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from '@/store/useSettingsStore';
import { PLAN_LIMITS } from '@/config/plans';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';

interface PYQTest {
    id: string;
    title: string;
    year: string;
    totalQuestions: number | null;
    durationMinutes: number;
    description: string | null;
}

interface PYQPageClientProps {
    initialTests: PYQTest[];
}

export default function PYQPageClient({ initialTests }: PYQPageClientProps) {
    const router = useRouter();
    const { language, user: currentUser } = useSettingsStore();
    const [paywallOpen, setPaywallOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 font-display">
                            {language === 'hi' ? 'विगत वर्षों के प्रश्न पत्र' : 'Previous Year Question Papers'}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {language === 'hi' 
                                ? 'पिछले वर्षों के वास्तविक परीक्षा प्रश्नों के साथ अभ्यास करें' 
                                : 'Practice with actual questions from previous year exams'}
                        </p>
                    </div>
                </div>

                {/* PYQ Tests Grid */}
                {initialTests.length === 0 ? (
                    <Card className="border-2 border-dashed border-slate-200">
                        <CardContent className="p-12 text-center">
                            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-600 mb-2">
                                {language === 'hi' ? 'कोई PYQ उपलब्ध नहीं' : 'No PYQs Available'}
                            </h3>
                            <p className="text-slate-400 text-sm">
                                {language === 'hi' 
                                    ? 'जल्द ही विगत वर्षों के प्रश्न पत्र जोड़े जाएंगे' 
                                    : 'Previous year papers will be added soon'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {initialTests.map((test, index) => {
                            const userTier = (currentUser as any)?.plan_tier || 'free';
                            const effectiveTier = !currentUser ? 'guest' : ((currentUser as any)?.is_subscribed ? (userTier === 'free' ? 'lite' : userTier) : 'free');
                            const limit = PLAN_LIMITS[effectiveTier as keyof typeof PLAN_LIMITS]?.pyq_limit || 0;
                            const isLocked = index >= limit;

                            return (
                                <Card 
                                    key={test.id} 
                                    className={cn(
                                        "border-2 transition-all cursor-pointer group relative overflow-hidden",
                                        isLocked 
                                            ? "border-slate-200 bg-slate-50 opacity-90" 
                                            : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-xl"
                                    )}
                                    onClick={() => {
                                        if (isLocked) {
                                            setPaywallOpen(true);
                                        } else {
                                            router.push(`/syllabus/quiz/play?mode=pyq&testId=${test.id}`)
                                        }
                                    }}
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <Badge className={cn("bg-slate-900 text-white", isLocked && "bg-slate-400")}>
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {test.year}
                                            </Badge>
                                            <span className="text-xs text-slate-400">
                                                {test.durationMinutes} {language === 'hi' ? 'मिनट' : 'min'}
                                            </span>
                                        </div>
                                        <CardTitle className={cn("text-lg transition-colors", !isLocked && "group-hover:text-indigo-600")}>
                                            {test.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {test.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">
                                                {test.totalQuestions} {language === 'hi' ? 'प्रश्न' : 'Questions'}
                                            </span>
                                            {isLocked ? (
                                                <Button size="sm" variant="secondary" className="gap-2 bg-slate-200 text-slate-500 cursor-not-allowed">
                                                    <Lock className="w-3 h-3" /> Locked
                                                </Button>
                                            ) : (
                                                <Button 
                                                    className="bg-slate-900 hover:bg-slate-800 text-white"
                                                    size="sm"
                                                >
                                                    {language === 'hi' ? 'शुरू करें' : 'Start Test'}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                    
                                    {isLocked && (
                                        <div className="absolute inset-0 z-10 bg-white/10 backdrop-blur-[1px]" />
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
            
            <SyllabusLockModal open={paywallOpen} onOpenChange={setPaywallOpen} />
        </div>
    );
}
