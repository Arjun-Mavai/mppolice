"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, 
    Menu, 
    ChevronLeft, 
    ChevronRight, 
    CheckCircle2, 
    Flag, 
    X,
    Zap,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Question } from '@/types/quiz';
import { QuizResult } from './QuizResult';
import { useQuizLogic } from '@/hooks/useQuizLogic';
import { PremiumExplanation } from './PremiumExplanation';

interface QuizInterfaceProps {
    questions: Question[];
    mode: 'topic' | 'full' | 'pyq';
    timeLimitInMinutes: number; // 10 or 60
    testId: string;
    userId: string;
    onExit: () => void;
    onRetry?: () => void;
    isInstantMode?: boolean;
    disablePalette?: boolean;
}

export function QuizInterface(props: QuizInterfaceProps) {
    const { 
        questions, 
        mode, 
        timeLimitInMinutes, 
        onExit, 
        disablePalette = false 
    } = props;

    // Use Custom Hook for Logic
    const {
        currentQuestionIndex,
        answers,
        markedforReview,
        isSubmitted,
        timeLeft,
        instantModeEnabled,
        language,
        
        setInstantModeEnabled,
        handleOptionSelect,
        handleNext,
        handlePrev,
        handleJump,
        toggleMarkForReview,
        handleSubmit,
        handleRetry,
        
        getParsedOptions,
        
        currentQuestion,
        isAnswered,
        totalQuestions
    } = useQuizLogic(props);

    // UI Local State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // Translations
    const t = {
        exit: language === 'hi' ? 'बाहर जाएं' : 'Exit',
        instantMode: language === 'hi' ? 'इंस्टेंट मोड' : 'Instant Mode',
        fullTest: language === 'hi' ? 'पूर्ण टेस्ट' : 'Full Length Test',
        topicPractice: language === 'hi' ? 'टॉपिक अभ्यास' : 'Topic Practice',
        questionPalette: language === 'hi' ? 'प्रश्न पैलेट' : 'Question Palette',
        attempted: language === 'hi' ? 'प्रयास किया' : 'Attempted',
        submitTest: language === 'hi' ? 'टेस्ट जमा करें' : 'Submit Test',
        submit: language === 'hi' ? 'जमा करें' : 'Submit',
        next: language === 'hi' ? 'अगला' : 'Next',
        prev: language === 'hi' ? 'पिछा' : 'Prev',
        question: language === 'hi' ? 'प्रश्न' : 'Question',
        markReview: language === 'hi' ? 'समीक्षा के लिए मार्क करें' : 'Mark for Review',
        unmark: language === 'hi' ? 'अनमार्क' : 'Unmark',
        explanation: language === 'hi' ? 'व्याख्या' : 'Explanation',
        quitConfirm: language === 'hi' ? 'क्विज़ छोड़ें?' : 'Quit Quiz?',
        quitDesc: language === 'hi' ? 'क्या आप निश्चित रूप से बाहर निकलना चाहते हैं? आपकी प्रगति खो जाएगी।' : 'Are you sure you want to exit? Your progress will be lost and this session will not be saved.',
        cancel: language === 'hi' ? 'रद्द करें' : 'Cancel',
        yesExit: language === 'hi' ? 'हां, बाहर जाएं' : 'Yes, Exit',
        answered: language === 'hi' ? 'उत्तर दिया' : 'Answered',
        notAnswered: language === 'hi' ? 'उत्तर नहीं दिया' : 'Not Answered',
        review: language === 'hi' ? 'समीक्षा' : 'Review',
        current: language === 'hi' ? 'वर्तमान' : 'Current',
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isSubmitted) {
        return <QuizResult 
            questions={questions} 
            answers={answers} 
            mode={mode} 
            timeTaken={(timeLimitInMinutes * 60) - timeLeft}
            onRetry={handleRetry}
            onExit={onExit}
        />;
    }

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-50 relative overflow-hidden font-sans">
            
            {/* Header / Timer Bar */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowExitConfirm(true)} className="text-slate-500 hover:text-slate-900 -ml-2">
                        <X className="w-6 h-6" />
                    </Button>
                    
                    <div className="flex items-center gap-2 hidden sm:flex">
                        <div className="h-6 w-px bg-slate-200 mx-2"></div>
                        <span className="font-display font-bold text-slate-900 tracking-tight">MPPSC<span className="text-indigo-600">26</span></span>
                        <Badge variant="outline" className="ml-2 border-slate-200 text-slate-500 font-medium hidden sm:inline-flex">
                            {mode === 'full' ? t.fullTest : t.topicPractice}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                     {/* Instant Mode Toggle */}
                     {!isSubmitted && (
                        <div 
                            className={cn(
                                "flex items-center gap-2 rounded-full px-3 py-1.5 border transition-all cursor-pointer select-none",
                                instantModeEnabled ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                            )}
                            onClick={() => setInstantModeEnabled(!instantModeEnabled)}
                            title="Toggle Instant Feedback"
                        >
                            <span className={cn("text-xs font-bold uppercase flex items-center gap-1", instantModeEnabled ? "text-amber-700" : "text-slate-400")}>
                                <Zap className={cn("w-3.5 h-3.5", instantModeEnabled ? "fill-amber-700" : "fill-slate-300 text-slate-300")} />
                                <span className="hidden sm:inline">{t.instantMode}</span>
                            </span>
                            <div className={cn(
                                "w-7 h-4 rounded-full relative transition-colors bg-slate-300 shadow-inner",
                                instantModeEnabled && "bg-amber-500"
                            )}>
                                <div className={cn(
                                    "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm",
                                    instantModeEnabled ? "left-3.5" : "left-0.5"
                                )} />
                            </div>
                        </div>
                     )}

                    <div className={cn(
                        "px-3 py-1.5 rounded-lg font-mono font-bold text-lg flex items-center gap-2 transition-colors min-w-[100px] justify-center",
                        timeLeft < 60 ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-100 text-slate-900"
                    )}>
                        <Clock className="w-4 h-4 text-slate-400" />
                        {formatTime(timeLeft)}
                    </div>

                    {/* Mobile Menu Trigger */}
                     {!disablePalette && (
                        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-slate-100 relative text-slate-700">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[85vw] sm:w-[400px] flex flex-col p-0">
                            <SheetHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <SheetTitle className="flex justify-between items-center">
                                    <span>{t.questionPalette}</span>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                        {Object.keys(answers).length}/{totalQuestions} {t.attempted}
                                    </span>
                                </SheetTitle>
                            </SheetHeader>
                            
                            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-5 content-start gap-3">
                                {questions.map((q, idx) => {
                                    const isAns = answers[q.id] !== undefined;
                                    const isMarked = markedforReview.includes(q.id);
                                    const isCurrent = idx === currentQuestionIndex;
                                    
                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => {
                                                handleJump(idx);
                                                setIsDrawerOpen(false);
                                            }}
                                            className={cn(
                                                "aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition-all border-2 relative select-none",
                                                isCurrent ? "border-indigo-600 bg-indigo-600 text-white shadow-md scale-105 z-10" 
                                                : isAns ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                                : isMarked ? "bg-amber-50 border-amber-300 text-amber-700"
                                                : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:bg-slate-50"
                                            )}
                                        >
                                            {idx + 1}
                                            {isMarked && !isCurrent && (
                                                <div className="absolute -top-1.5 -right-1.5 bg-amber-100 rounded-full p-0.5 border border-amber-200">
                                                    <Flag className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
                                <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-50 border border-emerald-500" /> {t.answered}</span>
                                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-slate-300 bg-white" /> {t.notAnswered}</span>
                                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-50 border border-amber-300" /> {t.review}</span>
                                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600" /> {t.current}</span>
                                </div>
                                <Button className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/10" onClick={handleSubmit}>
                                    {t.submitTest}
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                    )}
                </div>
            </header>

            {/* Main Question Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 max-w-3xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                         {/* Question Marker Tags */}
                         <div className="flex justify-between items-center">
                             <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                {t.question} {currentQuestionIndex + 1}
                             </div>
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={toggleMarkForReview}
                                className={cn(
                                    "gap-2 font-medium transition-colors hover:bg-transparent",
                                    markedforReview.includes(currentQuestion.id) ? "text-amber-600" : "text-slate-400 hover:text-slate-600"
                                )}
                             >
                                 <Flag className={cn("w-4 h-4", markedforReview.includes(currentQuestion.id) && "fill-current")} />
                                 {markedforReview.includes(currentQuestion.id) ? t.unmark : t.markReview}
                             </Button>
                         </div>

                         {/* Question Text */}
                         <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-normal">
                             {language === 'en' && currentQuestion.questionEn 
                                 ? currentQuestion.questionEn 
                                 : currentQuestion.question}
                         </h2>

                          <div className="space-y-3">
                              {/* Support Hindi Options if available */}
                              {(() => {
                                    const rawOptions = (language === 'hi' && (currentQuestion as any).options_hi) 
                                        ? (currentQuestion as any).options_hi 
                                        : currentQuestion.options;
                                        
                                    return getParsedOptions(rawOptions);
                                })().map((opt: any, idx: number) => {
                                  
                                  const isSelected = answers[currentQuestion.id] === idx;
                                  const isCorrect = currentQuestion.correctAnswer === idx;
                                  const showFeedback = instantModeEnabled && isAnswered;
                                  
                                  // Handle object options (e.g., { id, text, textEn })
                                  let optionText = opt;
                                  if (typeof opt === 'object' && opt !== null) {
                                      // Prefer Hindi text if language is Hindi, otherwise English/Default
                                      // Assuming 'text' is default/Hindi and 'textEn' is English based on usage context
                                      // Or if 'text' matches the current language requirement
                                      if (language === 'hi') {
                                          optionText = opt.text || opt.textEn || opt.text_en || JSON.stringify(opt);
                                      } else {
                                          optionText = opt.textEn || opt.text_en || opt.text || JSON.stringify(opt);
                                      }
                                  }

                                  return (
                                      <div 
                                         key={idx}
                                         onClick={() => handleOptionSelect(idx)}
                                         className={cn(
                                             "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden group",
                                             // Base State
                                             !isAnswered && "hover:border-slate-300 hover:bg-slate-50",
                                             !isAnswered && isSelected && "border-slate-900 bg-slate-50 font-semibold",
                                             
                                             // Feedback State
                                             showFeedback && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium", // Correct
                                             showFeedback && isSelected && !isCorrect && "border-red-200 bg-red-50 text-red-900 font-medium", // Wrong selection
                                             
                                             // Disabled State (if answered but not instant mode, or non-selected options in instant mode)
                                             isAnswered && !showFeedback && isSelected && "border-slate-900 bg-slate-100",
                                             isAnswered && !isSelected && !(showFeedback && isCorrect) && "opacity-60 border-slate-100",
                                         )}
                                      >
                                          <div className="flex justify-between items-center relative z-10">
                                              <span className={cn(
                                                  "text-lg leading-relaxed pr-8",
                                                  isSelected ? "text-slate-900 font-semibold" : "text-slate-700"
                                              )}>
                                                  {optionText}
                                              </span>
                                              
                                              {/* Icons based on state */}
                                              <div className="shrink-0">
                                                 {showFeedback ? (
                                                     isCorrect ? (
                                                         <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                                             <CheckCircle2 className="w-4 h-4 text-white" />
                                                         </div>
                                                     ) : isSelected ? (
                                                         <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                                             <X className="w-4 h-4 text-white" />
                                                         </div>
                                                     ) : null
                                                 ) : (
                                                     <div className={cn(
                                                         "w-6 h-6 rounded-full border-2 transition-colors",
                                                         isSelected ? "border-slate-900 bg-slate-900" : "border-slate-200 group-hover:border-slate-300"
                                                     )}>
                                                         {isSelected && <div className="w-full h-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"/></div>}
                                                     </div>
                                                 )}
                                              </div>
                                          </div>
                                          
                                          {/* Feedback Background Highlight */}
                                          {showFeedback && isCorrect && (
                                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500" />
                                          )}
                                      </div>
                                  );
                              })}
                          </div>

                         {/* Instant Explanation Card - MATCHING UPGRADE PAGE EXACTLY */}
                         {instantModeEnabled && isAnswered && (
                             <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ring-1 ring-slate-100"
                             >
                                 <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                     <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                         {t.explanation}
                                     </span>
                                     <span className="text-xs text-slate-400 font-medium">
                                        {language === 'hi' ? 'विस्तृत विश्लेषण' : 'Detailed Analysis'}
                                     </span>
                                 </div>
                                 
                                 <PremiumExplanation 
                                    explanation={(currentQuestion as any).explanation_hi || currentQuestion.explanation} 
                                    explanationEn={currentQuestion.explanationEn}
                                    language={language as 'hi' | 'en'}
                                 />
                             </motion.div>
                         )}

                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Nav Bar */}
            <div className="h-20 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 absolute bottom-0 left-0 right-0 z-20 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
                <Button 
                    variant="ghost" 
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="h-12 px-6 rounded-xl font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" /> {t.prev}
                </Button>

                <div className="flex gap-2">
                    {/* On Desktop/Larger screens we could show Submit here too */}
                    
                </div>
                
                {currentQuestionIndex === totalQuestions - 1 ? (
                   <Button 
                        onClick={handleSubmit} 
                        className="h-12 px-8 rounded-xl font-bold bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                    >
                        {t.submit}
                    </Button>
                ) : (
                    <Button 
                        onClick={handleNext}
                        className="h-12 px-8 rounded-xl font-bold bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                    >
                        {t.next} <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                )}
            </div>
        <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
           <DialogContent className="sm:max-w-md">
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-red-600">
                   <AlertCircle className="w-5 h-5" /> {t.quitConfirm}
               </DialogTitle>
               <DialogDescription>
                 {t.quitDesc}
               </DialogDescription>
             </DialogHeader>
             <DialogFooter className="flex gap-2 sm:justify-end">
               <Button variant="outline" onClick={() => setShowExitConfirm(false)} className="flex-1 sm:flex-none">
                 {t.cancel}
               </Button>
               <Button 
                 variant="destructive" 
                 onClick={onExit}
                 className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
               >
                 {t.yesExit}
               </Button>
             </DialogFooter>
           </DialogContent>
        </Dialog>
    </div>
  );
}
