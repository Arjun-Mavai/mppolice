
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { submitTestAttempt } from '@/features/tests/actions/submission';
import { Clock, ChevronLeft, ChevronRight, Menu, X, Flag } from 'lucide-react';

// Types (simplified import or redefine)
type Question = {
  id: string;
  questionText: string;
  options: any; // JSON
  marks: number;
};

type Test = {
  id: string;
  title: string;
  durationMinutes: number;
  slug: string;
};

export default function TestInterface({ test, questions }: { test: Test, questions: Question[] }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [currentInfo, setCurrentInfo] = useState(true); // Show instructions first
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [userReview, setUserReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(test.durationMinutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false); // Mobile sidebar

  // Timer
  useEffect(() => {
    if (!started || submitting) return;
    if (timeLeft <= 0) {
       handleSubmit(); // Auto submit
       return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft, submitting]);

  const handleStart = () => {
    setCurrentInfo(false);
    setStarted(true);
    toast.success("Test Started! Good Luck.");
  };

  const handleAnswer = (option: string) => {
    const qId = questions[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleClear = () => {
    const qId = questions[currentQuestionIndex].id;
    const newAns = { ...answers };
    delete newAns[qId];
    setAnswers(newAns);
  };

  const toggleReview = () => {
    const qId = questions[currentQuestionIndex].id;
    setUserReview(prev => {
        const next = new Set(prev);
        if (next.has(qId)) next.delete(qId);
        else next.add(qId);
        return next;
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const confirm = window.confirm("Are you sure you want to submit the test?");
    if (!confirm && timeLeft > 0) return;

    setSubmitting(true);
    const timeTaken = (test.durationMinutes * 60) - timeLeft;

    // TODO: get user ID from session context if available, else 'anonymous'
    const res = await submitTestAttempt(test.id, 'user-123', answers, timeTaken, {});
    
    if (res.success) {
      toast.success("Test Submitted Successfully!");
      // Redirect to analysis
      // We assume /tests/[slug]/analysis?attemptId=...
      // Or just store attemptId in local storage and fetch latest
      router.push(`/tests/${test.slug}/analysis?attemptId=${res.attemptId}`);
    } else {
      toast.error("Submission Failed: " + res.error);
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (currentInfo) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-8 text-center">
            <h1 className="text-3xl font-bold">{test.title}</h1>
            <div className="text-left space-y-4 bg-neutral-50 dark:bg-neutral-900 p-8 rounded-2xl">
                <h3 className="font-semibold text-lg">Instructions:</h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>Total Duration: {test.durationMinutes} Minutes</li>
                    <li>Total Questions: {questions.length}</li>
                    <li>Each question carries marks. Negative marking applies.</li>
                    <li>Don't refresh the page.</li>
                </ul>
            </div>
            <Button size="lg" onClick={handleStart} className="w-full">Start Test Now</Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const qId = currentQ.id;
  const isAnswered = !!answers[qId];
  const isReviewed = userReview.has(qId);

  return (
    <div className="fixed inset-0 bg-neutral-50 dark:bg-neutral-950 flex flex-col z-50">
       {/* Header */}
       <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 lg:px-8 shadow-sm">
          <h2 className="font-bold truncate max-w-xs">{test.title}</h2>
          
          <div className="flex items-center gap-4">
             <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
             </div>
             <Button variant="destructive" size="sm" onClick={handleSubmit}>Submit Test</Button>
             <button className="lg:hidden" onClick={() => setIsPaletteOpen(true)}>
                <Menu className="w-6 h-6" />
             </button>
          </div>
       </header>

       <div className="flex-1 flex overflow-hidden">
          {/* Main Question Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-10">
             <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex justify-between items-center text-sm text-neutral-500">
                   <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                   <span>Marks: {currentQ.marks}</span>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 lg:p-10 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 min-h-[300px] flex flex-col justify-center">
                   <p className="text-lg lg:text-xl font-medium leading-relaxed mb-8">{currentQ.questionText}</p>
                   
                   <div className="space-y-3 w-full">
                      {(currentQ.options as string[]).map((opt, idx) => (
                         <button 
                            key={idx}
                            onClick={() => handleAnswer(opt)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                                answers[qId] === opt 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                : 'bg-neutral-50 dark:bg-neutral-800 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700'
                            }`}
                         >
                            <span className="inline-block w-6 font-bold opacity-70 mr-2">{String.fromCharCode(65 + idx)}.</span>
                            {opt}
                         </button>
                      ))}
                   </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pb-10">
                   <Button 
                      variant="secondary" 
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                   >
                     <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                   </Button>

                   <div className="flex gap-2">
                      <Button variant="ghost" onClick={handleClear} disabled={!isAnswered}>Clear</Button>
                      <Button 
                        variant={isReviewed ? "default" : "outline"} 
                        onClick={toggleReview}
                        className="gap-2"
                      >
                         <Flag className="w-4 h-4" /> {isReviewed ? 'Unmark' : 'Review'}
                      </Button>
                   </div>

                   <Button 
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                      disabled={currentQuestionIndex === questions.length - 1}
                   >
                     Next <ChevronRight className="w-4 h-4 ml-2" />
                   </Button>
                </div>
             </div>
          </main>

          {/* Question Palette Sidebar */}
          <aside className={`
             fixed inset-y-0 right-0 w-80 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 transform transition-transform duration-300 z-40
             ${isPaletteOpen ? 'translate-x-0' : 'translate-x-full'} 
             lg:relative lg:translate-x-0 lg:w-72 flex flex-col
          `}>
             <div className="p-4 border-b dark:border-neutral-800 flex justify-between items-center bg-gray-50 dark:bg-neutral-950">
                <h3 className="font-bold">Question Palette</h3>
                <button className="lg:hidden" onClick={() => setIsPaletteOpen(false)}>
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto content-start flex-1 auto-rows-[40px]">
                {questions.map((q, idx) => {
                   const ans = !!answers[q.id];
                   const rev = userReview.has(q.id);
                   let colorClass = "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"; // default not visited/answered
                   if (idx === currentQuestionIndex) {
                       // Highlight current
                       colorClass = "ring-2 ring-blue-500 ring-offset-2 z-10 font-bold bg-white dark:bg-neutral-700";
                   } else {
                       if (ans) colorClass = "bg-green-100 text-green-700 border border-green-300";
                       if (rev) colorClass = "bg-purple-100 text-purple-700 border border-purple-300";
                       if (ans && rev) colorClass = "bg-purple-100 text-purple-700 border-purple-500 border-2 relative";
                   }

                   return (
                      <button
                         key={q.id}
                         onClick={() => { setCurrentQuestionIndex(idx); setIsPaletteOpen(false); }}
                         className={`h-9 w-full rounded-md text-sm font-medium flex items-center justify-center transition-all ${colorClass}`}
                      >
                         {idx + 1}
                         {ans && rev && <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />}
                      </button>
                   );
                })}
             </div>
             
             <div className="p-4 text-xs space-y-2 bg-gray-50 dark:bg-neutral-950 border-t dark:border-neutral-800">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div> Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div> Review</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-neutral-100 rounded"></div> Not Answered</div>
             </div>
          </aside>
       </div>
    </div>
  );
}
