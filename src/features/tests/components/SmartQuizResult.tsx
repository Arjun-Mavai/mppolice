'use client';

import React, { useEffect, useState } from 'react';
import { 
  BrainCircuit, 
  Trophy,
  Lightbulb,
  ShieldAlert,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { calculateMPPSCResult, SmartResultResponse } from '@/features/tests/actions/test-result';
import { useSettingsStore } from '@/store/useSettingsStore';

interface SmartQuizResultProps {
  testId: string;
  userId?: string;
  title?: string;
  onRetry?: () => void;
  onExit?: () => void;
}

export function SmartQuizResult({ testId, userId, title, onRetry, onExit }: SmartQuizResultProps) {
  const [result, setResult] = useState<SmartResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useSettingsStore();
  const isHi = language === 'hi';

  useEffect(() => {
    async function fetchResult() {
      if (!testId) return;
      try {
        const res = await calculateMPPSCResult(testId);
        if ('error' in res) {
          console.error(res.error);
        } else {
          setResult(res as SmartResultResponse);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [testId]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <h2 className="text-xl font-semibold text-slate-800">Analyzing Performance...</h2>
          <p className="text-slate-500">Calculating negative marking impact & topic trends</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return <div className="p-8 text-center">Failed to load results. Please try again.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 line-clamp-1">{title || 'Test Result'}</h1>
          <p className="text-xs text-slate-500">MPPSC Prelims Analysis</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          {isHi ? 'बाहर जाएं' : 'Exit'}
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        
        {/* Score Card */}
        <Card className="border-none shadow-md bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Net Score (New Pattern)</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl font-bold text-slate-900">{result.net_score}</h2>
                  <span className="text-slate-400">/ {result.max_score}</span>
                </div>
                {result.qualification && (
                   <Badge variant={result.qualification.status === 'Qualified' ? 'default' : 'destructive'} className="mt-2">
                     {result.qualification.status === 'Qualified' ? 'Qualified' : 'Missed Cutoff'}
                   </Badge>
                )}
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getGradeColor(result.attempt_intelligence.strategy_grade)}`}>
                  Grade {result.attempt_intelligence.strategy_grade}
                </div>
                <p className="text-xs text-slate-500">Strategy Score</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                <div className="text-2xl font-bold text-green-700">{result.correct}</div>
                <div className="text-xs text-green-600 font-medium">Correct (+3)</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                <div className="text-2xl font-bold text-red-700">{result.wrong}</div>
                <div className="text-xs text-red-600 font-medium">Wrong (-1)</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-700">{result.skipped}</div>
                <div className="text-xs text-slate-600 font-medium">Skipped</div>
              </div>
            </div>

            {/* Attempt Intelligence */}
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <div className="flex items-start gap-3">
                <BrainCircuit className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 text-sm">Attempt Intelligence</h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    You lost <span className="font-bold">{result.attempt_intelligence.wasted_points} marks</span> due to negative marking.
                    If you had skipped those wrong answers, your score would be <span className="font-bold">{result.attempt_intelligence.could_have_scored}</span>.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for detailed view */}
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
            <TabsTrigger value="facts">Flashcards</TabsTrigger>
          </TabsList>

          {/* ANALYSIS TAB */}
          <TabsContent value="analysis" className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Subject Performance</h3>
            {result.subject_breakdown.map((sub) => (
              <div key={sub.subject} className="bg-white p-4 rounded-xl shadow-sm border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-slate-800">{sub.subject}</span>
                  <span className={`text-sm font-bold ${sub.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {sub.score} pts
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div style={{ width: `${(sub.correct / sub.total) * 100}%` }} className="bg-green-500 h-full" />
                  <div style={{ width: `${(sub.wrong / sub.total) * 100}%` }} className="bg-red-500 h-full" />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>{sub.correct} Correct</span>
                  <span>{sub.wrong} Wrong</span>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* MISTAKES TAB */}
          <TabsContent value="mistakes" className="space-y-4">
            {result.missed_questions.length === 0 ? (
               <div className="text-center py-10 text-slate-500">Awesome! No mistakes found.</div>
            ) : (
              result.missed_questions.map((q: any, idx: number) => (
                <Card key={idx} className="border-l-4 border-l-red-500 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-xs">{q.subject}</Badge>
                      <span className="text-xs font-bold text-red-500">-1 Mark</span>
                    </div>
                    {/* We rely on questionText from API, if missing use fallback */}
                    <p className="text-sm text-slate-800 font-medium mb-3 line-clamp-2">{q.questionText || 'Question Text'}</p>
                    <div className="bg-slate-50 p-3 rounded text-xs text-slate-600">
                      <p><span className="font-semibold">Correct:</span> {q.correctAnswer}</p>
                      <p><span className="font-semibold">Your Answer:</span> {q.userAnswer}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* FACTS TAB (Flashcards) */}
          <TabsContent value="facts" className="space-y-4">
             {result.pyq_facts.length === 0 ? (
               <div className="text-center py-10 text-slate-500">
                 No high-yield facts linked to your mistakes.
               </div>
             ) : (
               <div className="grid gap-4">
                 {result.pyq_facts.map((fact: any) => (
                   <Card key={fact.id} className="overflow-hidden border-l-4 border-l-amber-400 shadow-sm">
                     <CardContent className="p-5">
                       <div className="flex items-center gap-2 mb-3">
                         <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                           {fact.subject}
                         </Badge>
                         {fact.importanceScore > 8 && (
                           <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                             <Trophy className="w-3 h-3" /> High Yield
                           </span>
                         )}
                       </div>
                       
                       <p className="text-sm font-medium text-slate-800 mb-4 leading-relaxed">
                         {isHi && fact.factText ? fact.factText : (fact.factTextEn || fact.factText)}
                       </p>

                       {(fact.memoryTip || fact.memoryTipEn) && (
                         <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-3">
                           <div className="flex items-center gap-2 mb-1 text-blue-800">
                             <Lightbulb className="w-4 h-4" />
                             <span className="text-xs font-bold uppercase">Memory Tip</span>
                           </div>
                           <p className="text-xs text-blue-700">
                             {isHi && fact.memoryTip ? fact.memoryTip : (fact.memoryTipEn || fact.memoryTip)}
                           </p>
                         </div>
                       )}

                       {(fact.scamAlert || fact.scamAlertEn) && (
                         <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                           <div className="flex items-center gap-2 mb-1 text-red-800">
                             <ShieldAlert className="w-4 h-4" />
                             <span className="text-xs font-bold uppercase">Scam Alert</span>
                           </div>
                           <p className="text-xs text-red-700">
                             {isHi && fact.scamAlert ? fact.scamAlert : (fact.scamAlertEn || fact.scamAlert)}
                           </p>
                         </div>
                       )}
                     </CardContent>
                   </Card>
                 ))}
               </div>
             )}
          </TabsContent>
        </Tabs>

      </div>
      
      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex gap-3 shadow-lg z-20">
        <Button variant="outline" className="flex-1" onClick={onRetry}>
          <Repeat className="w-4 h-4 mr-2" /> Retry
        </Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={onExit}>
          Finish Analysis
        </Button>
      </div>
    </div>
  );
}

function getGradeColor(grade: string) {
  switch (grade) {
    case 'A': return 'text-green-600';
    case 'B': return 'text-blue-600';
    case 'C': return 'text-amber-600';
    default: return 'text-red-600';
  }
}
