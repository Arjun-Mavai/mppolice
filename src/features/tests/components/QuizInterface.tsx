"use client"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 QUIZ INTERFACE - Ekdum Malaai-Style Component 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 
// Bhai yeh component hai Quiz ka full UI handler! 
// - Questions dikhata hai ek ek karke
// - Timer chalta hai, options select hote hain
// - Instant feedback dikha sakte ho (on/off toggle se)
// - Guest user bhi khel sakte hain (without login)
// - Submit karne pe result ya teaser dikhta hai
//
// Props ka chakkar:
// - questions: Saare sawaal array me
// - mode: 'topic' | 'full' | 'pyq' - kis type ka test hai
// - userId: Agar null hai toh guest hai bhai, DB save nahi hoga
// - testId: Test ki unique ID (result/leaderboard ke liye)
//
// Principal Engineer Note:
// - State management clean hai, hook-based abstraction
// - Guest flow properly separated (no DB pollution)
// - Proper loading states, error boundaries add kar sakte ho agar production tight ho
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { createGuestEntry as createGuestUser } from '@/actions/guest-actions';
import { GuestResultTeaser } from '@/app/syllabus/quiz/play/GuestResultTeaser';

// ─────────────────────────────────────────────────────────────
// 📋 INTERFACE DEFINITION
// ─────────────────────────────────────────────────────────────
interface QuizInterfaceProps {
    questions: Question[];              // Saare questions ka data
    mode: 'topic' | 'full' | 'pyq';    // Test ka type
    timeLimitInMinutes: number;         // 10 minutes (topic) ya 60 minutes (full)
    testId: string;                     // Database me test ki ID
    title?: string;                     // Test ka naam (display ke liye)
    userId: string | null;              // User ID (null for guest) CRITICAL: null = guest, value = logged-in
    onExit: () => void;                 // Exit handler  Exit button ka callback
    onRetry?: () => void;               // Retry handlerne ka option Retry karne ka option
    isInstantMode?: boolean;            // Instant feedback chahiye ki nahi
    disablePalette?: boolean;           // Question palette hide karna hai?
}

export function QuizInterface(props: QuizInterfaceProps) {
    // ─────────────────────────────────────────────────────────────
    // 📦 PROPS DESTRUCTURING (Clean Variable Names)
    // ─────────────────────────────────────────────────────────────
    const { 
        questions,          // Saare questions
        mode,              // Test type
        timeLimitInMinutes, // Time limit
        title,             // Display naam
        onExit,            // Exit callback
        disablePalette = false, // Default: palette dikhao
        testId,            // Test ID (result/leaderboard ke liye)
        userId             // 🚨 CRITICAL: null = guest user (DB save NAHI hoga)
    } = props;

    // ─────────────────────────────────────────────────────────────
    // 🧠 QUIZ LOGIC HOOK (Sab heavy-lifting yahan hai)
    // ─────────────────────────────────────────────────────────────
    // Bhai, useQuizLogic hook me sab kuch hai:
    // - Navigation (Next/Prev/Jump)
    // - Answers tracking (user ne kya select kiya)
    // - Timer countdown
    // - Submit logic (DB save sirf logged-in users ke liye)
    // - Mark for review
    // Dekho: src/hooks/useQuizLogic.ts
    const {
        currentQuestionIndex,    // Konsa question dikha rahe ho (0-based index)
        answers,                 // User ke answers { questionId: optionIndex }
        markedforReview,         // Review ke liye marked questions ka array
        isSubmitted,             // Test submit ho gaya?
        timeLeft,                // Kitna time bacha (seconds me)
        instantModeEnabled,      // Instant feedback on/off
        language,                // 'hi' | 'en' - current language
        
        // Action handlers (user interactions)
        setInstantModeEnabled,   // Instant mode toggle
        handleOptionSelect,      // Option click kiya
        handleNext,              // Next button
        handlePrev,              // Previous button
        handleJump,              // Question palette se jump
        toggleMarkForReview,     // Mark/Unmark for review
        handleSubmit,            // Submit quiz (hook internally checks userId)
        handleRetry,             // Retry attempt
        
        // Helper functions
        getParsedOptions,        // Options parse karna (string/object handle karta hai)
        
        // Computed values
        currentQuestion,         // Current question object
        isAnswered,              // Current question answered hai?
        totalQuestions          // Total kitne questions hain
    } = useQuizLogic(props);

    // ─────────────────────────────────────────────────────────────
    // 🎨 UI LOCAL STATE (Sirf UI ke liye, business logic nahi)
    // ─────────────────────────────────────────────────────────────
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);         // Question palette drawer
    const [showExitConfirm, setShowExitConfirm] = useState(false);   // Exit confirmation dialog
    
    // ─────────────────────────────────────────────────────────────
    // 👤 GUEST USER STATE (Lead Generation Logic)
    // ─────────────────────────────────────────────────────────────
    // Bhai, guest users se naam/email/mobile lenge (optional)
    // Lead generation ke liye - marketing team khush hogi 😎
    const [showGuestTeaser, setShowGuestTeaser] = useState(false);   // Result teaser dikhaana hai?
    const [guestName, setGuestName] = useState("");                  // Guest ka naam
    const [guestEmail, setGuestEmail] = useState("");                // Email (optional)
    const [guestMobile, setGuestMobile] = useState("");              // Mobile (optional)
    const [showGuestEntryDialog, setShowGuestEntryDialog] = useState(false); // Entry dialog
    const [isSubmittingGuest, setIsSubmittingGuest] = useState(false); // Loading state

    // ─────────────────────────────────────────────────────────────
    // 🚀 GUEST ENTRY EFFECT
    // ─────────────────────────────────────────────────────────────
    // Jab component load ho aur userId nahi hai (guest user)
    // AND guest ne abhi tak naam nahi diya -> Dialog dikhaao
    useEffect(() => {
        if (!userId && !guestName) {
            setShowGuestEntryDialog(true);
        }
    }, [userId, guestName]);

    // ─────────────────────────────────────────────────────────────
    // 📝 GUEST ENTRY SUBMIT HANDLER
    // ─────────────────────────────────────────────────────────────
    // Guest user ne naam enter kiya, dialog close karo
    // Email/Mobile optional hai, bas naam mandatory
    // Note: Yeh data DB me guest_entries table me save hota hai
    const handleGuestEntrySubmit = async () => {
        if (!guestName.trim()) return; // Validation: Naam toh do bhai!
        
        setIsSubmittingGuest(true);
        
        // Save to DB (for marketing/lead gen)
        await createGuestUser({ 
            name: guestName, 
            email: guestEmail, 
            mobile: guestMobile 
        }); 
        
        // Close dialog, user test shuru kar sakta hai
        setShowGuestEntryDialog(false);
        setIsSubmittingGuest(false);
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 GUEST RESULT TEASER (Non-logged users ke liye)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Agar guest user ne test submit kiya aur showGuestTeaser true hai
    // toh unko limited result dikhate hain with CTA to login/signup
    // 
    // Why separate teaser?
    // - Full result sirf logged-in users ke liye (DB me save hota hai)
    // - Guest ko taste dete hain, full access ke liye login karwate hain
    // - Conversion funnel: Free test → Show teaser → Login → Full access
    if (showGuestTeaser) {
        // ─────────────────────────────────────────────────────────────
        // 📊 LOCAL SCORE CALCULATION (DB nahi, client-side)
        // ─────────────────────────────────────────────────────────────
        // Principal Engineer Note: Yeh calculation client-side hai
        // Server-side wala calculation useQuizLogic > submitTestAttempt me hai
        // Dono same logic use karte hain (SCORING_CONFIG)
        
        // Calculate earned score with negative marking
        let earnedScore = 0;
        Object.entries(answers).forEach(([qId, ansIdx]) => {
            const q = questions.find(q => q.id === qId);
            if (q) {
                if (q.correctAnswer === ansIdx) {
                    // Correct answer: Add marks (default 3 from SCORING_CONFIG)
                    earnedScore += (q.marks || 3);
                } else {
                    // Wrong answer: Deduct negative marks (default 1)
                    const negative = q.negativeMarks !== undefined ? q.negativeMarks : 1;
                    earnedScore -= negative;
                }
            }
        });

        // Time taken calculation
        const timeTaken = (timeLimitInMinutes * 60) - timeLeft;

        return (
            <GuestResultTeaser 
                score={earnedScore} 
                totalQuestions={questions.length} 
                timeTaken={timeTaken}
                guestName={guestName}
                onLogin={() => window.location.href = '/login'}
                onHome={() => window.location.href = '/'} 
            />
        );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ LOGGED-IN USER RESULT (Full detailed result)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Agar test submit ho gaya HAI aur userId PRESENT hai
    // toh QuizResult component dikhao (full analysis ke saath)
    // 
    // QuizResult shows:
    // - Detailed score breakdown
    // - Question-wise analysis
    // - Time spent per question
    // - Leaderboard rank
    // - Explanations for all questions
    if (isSubmitted && userId) {
        return <QuizResult 
            questions={questions} 
            answers={answers} 
            mode={mode} 
            timeTaken={(timeLimitInMinutes * 60) - timeLeft}
            onRetry={handleRetry}
            title={title}
            testId={testId}    // Leaderboard ke liye chahiye
            userId={userId}    // User ki ranking dikhane ke liye
        />;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎬 SUBMIT HANDLER WRAPPER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Submit button click karne pe yeh function call hota hai
    // Guest vs Logged-in user ka logic yahan handle karte hain
    //
    // Flow:
    // 1. Guest user (!userId) → Just show teaser (no DB save)
    // 2. Logged-in user → Call hook's handleSubmit (saves to DB)
    const handleQuizSubmitAction = () => {
        if (!userId) {
            // 🚨 GUEST USER PATH
            // Bas local state set karo, teaser dikhaao
            // useQuizLogic me bhi early return hai (!userId check)
            // So DB save NAHI hoga - design is solid!
            setShowGuestTeaser(true);
        } else {
            // ✅ LOGGED-IN USER PATH
            // Hook ka handleSubmit call karo
            // Woh internally submitTestAttempt() call karega
            // DB me userAttempts + attemptAnswers save hoga
            handleSubmit();
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌐 TRANSLATIONS (Hindi/English)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // UI text ko language ke according show karte hain
    // Language state useQuizLogic hook se aa raha hai
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⏱️ TIME FORMATTER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Seconds ko MM:SS format me convert karta hai
    // Example: 125 seconds → "02:05"
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 MAIN UI RENDER (Quiz Interface ka pura layout)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Layout structure:
    // 1. Header: Exit button, Timer, Instant mode toggle, Question palette trigger
    // 2. Main: Current question + options
    // 3. Footer: Prev/Next navigation buttons
    // 4. Dialogs: Exit confirmation, Guest entry form
    return (
        <div className="flex flex-col h-[100dvh] bg-slate-50 relative overflow-hidden font-sans">
            
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 🎯 HEADER BAR - Top sticky header with controls */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
                {/* Left side: Exit button + Title */}
                <div className="flex items-center gap-2">
                    {/* Exit button - Shows confirmation dialog */}
                    <Button variant="ghost" size="icon" onClick={() => setShowExitConfirm(true)} className="text-slate-500 hover:text-slate-900 -ml-2">
                        <X className="w-6 h-6" />
                    </Button>
                    
                    {/* Test title and badge */}
                    <div className="flex items-center gap-2 hidden sm:flex">
                        <div className="h-6 w-px bg-slate-200 mx-2"></div>
                        <span className="font-display font-bold text-slate-900 tracking-tight">{title || <>MPPSC<span className="text-indigo-600">26</span></>}</span>
                        <Badge variant="outline" className="ml-2 border-slate-200 text-slate-500 font-medium hidden sm:inline-flex">
                            {mode === 'full' ? t.fullTest : t.topicPractice}
                        </Badge>
                    </div>
                </div>

                {/* Right side: Instant Mode + Timer + Question Palette */}
                <div className="flex items-center gap-3">
                     {/* ─────────────────────────────────────────────── */}
                     {/* ⚡ INSTANT MODE TOGGLE (Real-time feedback) */}
                     {/* ─────────────────────────────────────────────── */}
                     {/* Bhai yeh toggle ON karne se answer select karte hi
                          turant correct/wrong dikhega + explanation */}
                     {!isSubmitted && (
                        <div className="p-[2px] rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 shadow-sm animate-in fade-in zoom-in duration-300">
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
                        </div>
                     )}

                    {/* ─────────────────────────────────────────────── */}
                    {/* ⏱️ COUNTDOWN TIMER (Auto-submits at 0) */}
                    {/* ─────────────────────────────────────────────── */}
                    {/* Last 60 seconds me red + pulse animation */}
                    <div className={cn(
                        "px-3 py-1.5 rounded-lg font-mono font-bold text-lg flex items-center gap-2 transition-colors min-w-[100px] justify-center",
                        timeLeft < 60 ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-100 text-slate-900"
                    )}>
                        <Clock className="w-4 h-4 text-slate-400" />
                        {formatTime(timeLeft)}
                    </div>

                    {/* ─────────────────────────────────────────────── */}
                    {/* 🎨 QUESTION PALETTE (Side drawer trigger) */}
                    {/* ─────────────────────────────────────────────── */}
                    {/* Mobile/Desktop drawer - Shows all questions at once
                         Answered = Green, Marked = Yellow, Current = Blue */}
                     {!disablePalette && (
                        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-slate-100 relative text-slate-700">
                                <Menu className="w-6 h-6" />
                                {/* Pulse dot - attracts user attention */}
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[85vw] sm:w-[400px] flex flex-col p-0">
                            {/* Palette Header */}
                            <SheetHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <SheetTitle className="flex justify-between items-center">
                                    <span>{t.questionPalette}</span>
                                    {/* Progress badge - Shows attempted count */}
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                        {Object.keys(answers).length}/{totalQuestions} {t.attempted}
                                    </span>
                                </SheetTitle>
                            </SheetHeader>
                            
                            {/* ─────────────────────────────────────────────── */}
                            {/* 📊 QUESTION GRID (Click to jump) */}
                            {/* ─────────────────────────────────────────────── */}
                            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-5 content-start gap-3">
                                {questions.map((q, idx) => {
                                    const isAns = answers[q.id] !== undefined;       // Answered?
                                    const isMarked = markedforReview.includes(q.id); // Marked for review?
                                    const isCurrent = idx === currentQuestionIndex;  // Current question?
                                    
                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => {
                                                handleJump(idx);       // Jump to question
                                                setIsDrawerOpen(false); // Close drawer
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
                                            {/* Flag icon for marked questions */}
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
                                <Button className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/10" onClick={handleQuizSubmitAction}>
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
                         
                         {/* Matching Questions - Standard Exam Layout */}
                         {currentQuestion.type === 'matching' && currentQuestion.matchPairs && (
                            <div className="mb-8 mt-4 pl-1">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-2xl">
                                    {/* Headers */}
                                    <div className="font-bold text-slate-800 border-b-2 border-slate-800 pb-1 mb-2">
                                        {language === 'hi' ? 'सूची-I' : 'List-I'}
                                    </div>
                                    <div className="font-bold text-slate-800 border-b-2 border-slate-800 pb-1 mb-2">
                                        {language === 'hi' ? 'सूची-II' : 'List-II'}
                                    </div>

                                    {/* Content Column 1 */}
                                    <div className="space-y-3">
                                        {currentQuestion.matchPairs.map((pair, idx) => (
                                            <div key={`col1-${idx}`} className="flex gap-2 items-start text-base sm:text-lg">
                                                <span className="font-semibold text-slate-900 min-w-[24px]">{pair.id}</span>
                                                <span className="text-slate-800">
                                                    {language === 'en' && pair.labelEn ? pair.labelEn : pair.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Content Column 2 */}
                                    <div className="space-y-3">
                                        {currentQuestion.matchPairs.map((pair, idx) => (
                                            <div key={`col2-${idx}`} className="flex gap-2 items-start text-base sm:text-lg">
                                                <span className="font-semibold text-slate-900 min-w-[24px]">{pair.matchId}</span>
                                                <span className="text-slate-800">
                                                    {language === 'en' && pair.matchEn ? pair.matchEn : pair.match}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                         )}

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
                        onClick={handleQuizSubmitAction} 
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

         {/* Guest Entry Dialog (Lead Gen) */}
         <Dialog open={showGuestEntryDialog} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900">
                         Welcome to MPPSC 2026! 🚀
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        Please enter your name to start the test. We value your time!
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Name <span className="text-red-500">*</span></label>
                        <Input 
                            placeholder="e.g. Rahul Sharma" 
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="h-11 border-slate-200 focus:border-indigo-500"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email (Optional)</label>
                        <Input 
                             type="email"
                             placeholder="Get results via email" 
                             value={guestEmail}
                             onChange={(e) => setGuestEmail(e.target.value)}
                             className="h-11 border-slate-200 focus:border-indigo-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mobile (Optional)</label>
                         <Input 
                             type="tel"
                             placeholder="For update alerts" 
                             value={guestMobile}
                             onChange={(e) => setGuestMobile(e.target.value)}
                             className="h-11 border-slate-200 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button 
                        onClick={handleGuestEntrySubmit} 
                        disabled={!guestName.trim() || isSubmittingGuest}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl"
                    >
                        {isSubmittingGuest ? "Starting..." : "Start Test"}
                    </Button>
                </DialogFooter>
            </DialogContent>
         </Dialog>

    </div>
  );
}
