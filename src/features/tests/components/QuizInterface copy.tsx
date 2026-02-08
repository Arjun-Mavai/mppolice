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
    AlertCircle,
    Maximize,
    Minimize,
    Lightbulb
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
    hideFooter?: boolean;               // Footer navigation bar hide karna hai? (Focus mode ke liye)
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
        hideFooter = true, // Default: footer HIDE (focus mode) - Quiz play page pe footer nahi chahiye
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
    const [isFullscreen, setIsFullscreen] = useState(false);         // 🎯 Focus mode - Fullscreen toggle (Bhai, distraction-free mode ke liye)
    const [hasAutoFullscreened, setHasAutoFullscreened] = useState(false); // Track kar rahe hain ki auto-fullscreen hua ya nahi
    
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
    // 🚀 GUEST ENTRY EFFECT (Load name + Show dialog logic)
    // ─────────────────────────────────────────────────────────────
    // Bhai, pehle localStorage check karo, phir decide karo dialog dikhana hai ya nahi
    // Runs only once on mount
    useEffect(() => {
        // Only for guest users
        if (!userId) {
            // Check localStorage for saved name
            if (typeof window !== 'undefined') {
                const savedName = localStorage.getItem('mppsc_guest_name');
                if (savedName) {
                    // Name mil gaya! Set kar do, dialog skip ho jayega
                    setGuestName(savedName);
                } else {
                    // Pehli baar aa rahe ho, dialog dikhaao
                    setShowGuestEntryDialog(true);
                }
            } else {
                // Server-side rendering, dialog dikhaao (client pe hide ho jayega agar name hai)
                setShowGuestEntryDialog(true);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // ─────────────────────────────────────────────────────────────
    // 📝 GUEST ENTRY SUBMIT HANDLER
    // ─────────────────────────────────────────────────────────────
    // Guest user ne naam enter kiya, dialog close karo
    // Email/Mobile optional hai, bas naam mandatory
    // Note: Yeh data DB me guest_entries table me save hota hai
    const handleGuestEntrySubmit = async () => {
        if (!guestName.trim()) return; // Validation: Naam toh do bhai!
        
        setIsSubmittingGuest(true);
        
        // Save to localStorage for future visits (skip modal next time)
        if (typeof window !== 'undefined') {
            localStorage.setItem('mppsc_guest_name', guestName.trim());
        }
        
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
    // 🎯 FULLSCREEN (FOCUS MODE) HANDLERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Bhai, yeh focus mode hai - full screen mein test dene ke liye
    // Distraction-free environment - exam jaise feel
    
    /**
     * requestFullscreenWithAnimation
     * ─────────────────────────────────────────────────────────────
     * Fullscreen mode ON karta hai with smooth animation
     * Bhai, exam jaisa immersive experience!
     * 
     * Flow:
     * 1. Browser fullscreen API call
     * 2. Success → State update (isFullscreen = true)
     * 3. LocalStorage mein save (remember user preference)
     * 
     * Browser Compatibility:
     * - document.documentElement.requestFullscreen() (Modern browsers)
     */
    const requestFullscreenWithAnimation = () => {
        if (!document.fullscreenElement) {
            // Enter fullscreen - Pura page ko fullscreen kar do
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
                // Remember user preference (next time auto-start)
                if (typeof window !== 'undefined') {
                    localStorage.setItem('mppsc_quiz_fullscreen', 'true');
                }
            }).catch(err => {
                console.error("Fullscreen nahi ho paya:", err);
            });
        }
    };

    /**
     * exitFullscreenWithConfirmation
     * ─────────────────────────────────────────────────────────────
     * PEHLE confirmation maango, PHIR fullscreen exit karo
     * 
     * Why?
     * - Accidental exit se bachao
     * - User ko warning do ki progress lost ho jayega
     * - Better UX - user informed decision le sakta hai
     */
    const exitFullscreenWithConfirmation = () => {
        // 🎯 KEY CHANGE: Confirmation PEHLE, exit BAAD mein
        setShowExitConfirm(true);
    };

    /**
     * handleConfirmedExit
     * ─────────────────────────────────────────────────────────────
     * User ne "Yes, Exit" confirm kiya
     * Ab fullscreen se bahar niklo aur quiz exit karo
     */
    const handleConfirmedExit = () => {
        // First exit fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
                localStorage.removeItem('mppsc_quiz_fullscreen');
            });
        }
        // Then call parent's onExit (navigate away)
        onExit();
    };

    /**
     * useEffect: Auto-Fullscreen on Start
     * ─────────────────────────────────────────────────────────────
     * Bhai, jaise hi test load ho, automatically fullscreen kar do!
     * 
     * Flow:
     * 1. Component mount → Check localStorage preference
     * 2. Delay 500ms (let UI settle)
     * 3. Request fullscreen automatically
     * 
     * Why delay?
     * - UI properly render hone do
     * - User ko smooth transition dikhe
     * - Browser security (user interaction required - we wait for mount as proxy)
     */
    useEffect(() => {
        // Auto-fullscreen sirf ek baar (component mount pe)
        if (!hasAutoFullscreened && !isSubmitted) {
            const timer = setTimeout(() => {
                requestFullscreenWithAnimation();
                setHasAutoFullscreened(true);
            }, 500); // 500ms delay for smooth entry

            return () => clearTimeout(timer);
        }
    }, [hasAutoFullscreened, isSubmitted]);

    /**
     * useEffect: Listen to Fullscreen Changes
     * ─────────────────────────────────────────────────────────────
     * Browser ke fullscreen change events ko track karo
     * User ne ESC press kiya ya F11 press kiya toh detect karo
     * 
     * Why needed?
     * - User ESC dabake fullscreen exit kar sakta hai (browser default)
     * - F11 se bhi exit ho sakta hai
     * - Humko state sync karna padega
     * 
     * 🎯 KEY CHANGE: ESC press pe PEHLE confirmation, PHIR exit
     */
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && isFullscreen) {
                // User ne ESC press kiya (fullscreen se nikalne ki koshish)
                setIsFullscreen(false);
                
                // 🎯 Show confirmation dialog IMMEDIATELY
                // Agar user exit karna chahta hai, confirm karo pehle
                setShowExitConfirm(true);
            }
        };

        // Browser events ko listen karo (different prefixes for browser compatibility)
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        
        // Cleanup on unmount
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        };
    }, [isFullscreen]);

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
        focusMode: language === 'hi' ? 'फोकस मोड' : 'Focus Mode',
        exitFocusMode: language === 'hi' ? 'फोकस मोड से बाहर' : 'Exit Focus Mode',
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
    // 1. Header: Exit button, Timer, Fullscreen toggle, Question palette
    // 2. Main: Current question + options (FIXED HEIGHT for no-scroll UX)
    // 3. Navigation: Inline Prev/Next (ALWAYS visible, no footer)
    // 4. Dialogs: Exit confirmation, Guest entry form
    // 
    // 🎯 UX PHILOSOPHY (20 Years Figma Master):
    // - NO SCROLLING in instant mode (everything fits in viewport)
    // - Buttery smooth animations (CSS transforms)
    // - Mobile-first immersive design
    // - Addictive experience (user ko dobara aana chahiye)
    return (
        <div className={cn(
            "flex flex-col h-[100dvh] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden font-sans",
            // 🎯 Fullscreen animation - Pure CSS magic!
            isFullscreen && "animate-in zoom-in duration-700 ease-out"
        )}>
            
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 🌟 FULLSCREEN ENTRY ANIMATION (Pure CSS) */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* Bhai, jab fullscreen activate ho, yeh animation chalega
                 Smooth fade + zoom effect - Apple jaisa polish! */}
            {isFullscreen && !hasAutoFullscreened && (
                <div className="fixed inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-pink-600/10 pointer-events-none animate-pulse z-0" />
            )}
            
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 🎯 HEADER BAR - Top sticky header with controls */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <header className="h-14 sm:h-16 bg-white/95 backdrop-blur-lg border-b border-slate-200/80 flex items-center justify-between px-3 sm:px-4 shrink-0 shadow-sm z-20">
                {/* Left side: Exit button + Title */}
                <div className="flex items-center gap-2">
                    {/* Exit button - Shows confirmation dialog FIRST, then exits */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={exitFullscreenWithConfirmation}
                        className="text-slate-500 hover:text-slate-900 -ml-2 transition-colors"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                    
                    {/* Test title and badge */}
                    <div className="flex items-center gap-2 hidden sm:flex">
                        <div className="h-6 w-px bg-slate-200 mx-2"></div>
                        <span className="font-display font-bold text-slate-900 tracking-tight text-sm sm:text-base">
                            {title || <>MPPSC<span className="text-indigo-600">26</span></>}
                        </span>
                        <Badge variant="outline" className="ml-2 border-slate-200 text-slate-500 font-medium hidden md:inline-flex text-xs">
                            {mode === 'full' ? t.fullTest : t.topicPractice}
                        </Badge>
                    </div>
                </div>

                {/* Right side: Instant Mode + Timer + Fullscreen + Question Palette */}
                <div className="flex items-center gap-2 sm:gap-3">
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
                    {/* 🎯 FULLSCREEN TOGGLE (Focus Mode) */}
                    {/* ─────────────────────────────────────────────── */}
                    {/* Bhai, yeh focus mode ka button hai - Exam jaisa feel!
                         Fullscreen me distractions nahi, sirf test dikhega 
                         Ab yeh HIDDEN hai kyunki auto-fullscreen hai! User manually control nahi kar sakta */}
                    {/* Hidden for now - Auto-fullscreen is the default experience */}

                    {/* ─────────────────────────────────────────────── */}
                    {/* 🎨 QUESTION PALETTE (Side drawer trigger) */}
                    {/* ─────────────────────────────────────────────── */}
                    {/* Mobile/Desktop drawer - Shows all questions at once
                         Answered = Green, Marked = Yellow, Current = Blue */}
                     {!disablePalette && (
                        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-slate-100 relative text-slate-700">
                                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                                {/* Pulse dot - attracts user attention */}
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>
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
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 📝 MAIN QUESTION AREA (FIXED HEIGHT - NO SCROLL UX) */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* Bhai, yeh main quiz content area hai - question + options
                 🎯 UX MASTER DESIGN:
                 - Fixed height container (no scrolling in instant mode)
                 - Flexbox layout (perfect vertical distribution)
                 - Navigation ALWAYS at bottom (thumb-friendly on mobile)
                 - Everything fits in ONE screen (buttery smooth!)
                 
                 Layout breakdown:
                 1. Question text (flex-shrink-0)
                 2. Options (flex-1, scrollable if needed on small screens)
                 3. Explanation (conditional, compact design)
                 4. Navigation bar (flex-shrink-0, ALWAYS visible)
            */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="max-w-3xl mx-auto space-y-3 sm:space-y-4"
                        >
                             {/* ─────────────────────────────────────────────── */}
                             {/* 🏷️ QUESTION HEADER (Compact design) */}
                             {/* ─────────────────────────────────────────────── */}
                             <div className="flex justify-between items-center">
                                 <div className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                                    {t.question} {currentQuestionIndex + 1}/{totalQuestions}
                                 </div>
                                 <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={toggleMarkForReview}
                                    className={cn(
                                        "gap-1.5 font-medium transition-colors hover:bg-transparent text-xs sm:text-sm h-8 px-2 sm:px-3",
                                    markedforReview.includes(currentQuestion.id) ? "text-amber-600" : "text-slate-400 hover:text-slate-600"
                                )}
                             >
                                 <Flag className={cn("w-3 h-3 sm:w-4 sm:h-4", markedforReview.includes(currentQuestion.id) && "fill-current")} />
                                 <span className="hidden sm:inline">{markedforReview.includes(currentQuestion.id) ? t.unmark : t.markReview}</span>
                             </Button>
                         </div>

                         {/* ─────────────────────────────────────────────── */}
                         {/* 📖 QUESTION TEXT (Readable, prominent) */}
                         {/* ─────────────────────────────────────────────── */}
                         <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 leading-relaxed">
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
                                             "relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden group active:scale-[0.98]",
                                             // Base State
                                             !isAnswered && "hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm",
                                             !isAnswered && isSelected && "border-indigo-600 bg-indigo-50 font-semibold shadow-sm",
                                             
                                             // Feedback State (Instant Mode)
                                             showFeedback && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium shadow-emerald-100/50 shadow-md", // Correct
                                             showFeedback && isSelected && !isCorrect && "border-red-400 bg-red-50 text-red-900 font-medium shadow-red-100/50 shadow-md", // Wrong selection
                                             
                                             // Disabled State
                                             isAnswered && !showFeedback && isSelected && "border-indigo-600 bg-indigo-50",
                                             isAnswered && !isSelected && !(showFeedback && isCorrect) && "opacity-50 border-slate-200",
                                         )}
                                      >
                                          <div className="flex justify-between items-center relative z-10">
                                              <span className={cn(
                                                  "text-sm sm:text-base leading-relaxed pr-4",
                                                  isSelected ? "text-slate-900 font-semibold" : "text-slate-700"
                                              )}>
                                                  {optionText}
                                              </span>
                                              
                                              {/* Icons based on state */}
                                              <div className="shrink-0">
                                                 {showFeedback ? (
                                                     // In instant mode, show feedback for all options
                                                     isCorrect ? (
                                                         // Always show green tick for correct answer
                                                         <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                                             <CheckCircle2 className="w-4 h-4 text-white" />
                                                         </div>
                                                     ) : isSelected ? (
                                                         // Show red X only for wrong selected answer
                                                         <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                                             <X className="w-4 h-4 text-white" />
                                                         </div>
                                                     ) : (
                                                         // Show empty circle for non-selected wrong answers
                                                         <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                                                     )
                                                 ) : (
                                                     // Normal mode - show selection indicator
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

                         {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                         {/* 💡 INSTANT MODE EXPLANATION (Compact, collapsible) */}
                         {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                         {/* Bhai, instant mode ON + answer diya = explanation dikha do
                              But compact rakhna hai - user ko scroll nahi karna chahiye!
                              Max height set karke overflow-y-auto - scrollable if needed */}
                         {instantModeEnabled && isAnswered && (
                             <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.2 }}
                                className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/50 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm max-h-[200px] overflow-y-auto"
                             >
                                 <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-200/50">
                                     <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                                     <span className="text-xs sm:text-sm font-bold text-indigo-900 uppercase tracking-wide">
                                         {t.explanation}
                                     </span>
                                 </div>
                                 
                                 <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                     <PremiumExplanation 
                                        explanation={(currentQuestion as any).explanation_hi || currentQuestion.explanation} 
                                        explanationEn={currentQuestion.explanationEn}
                                        language={language as 'hi' | 'en'}
                                     />
                                 </div>
                             </motion.div>
                         )}

                    </motion.div>
                </AnimatePresence>
                </div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {/* 🎮 BOTTOM NAVIGATION BAR (ALWAYS VISIBLE - Thumb Friendly) */}
                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {/* Bhai, yeh navigation bar HAMESHA bottom pe rahega
                     Mobile-first design - thumb reach ke andar
                     NO MORE SCROLLING to find buttons!
                     Fixed position - content scroll hoti hai, navigation nahi */}
                <div className="flex-shrink-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-3 sm:px-6 py-3 sm:py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                    <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
                        <Button 
                            variant="outline" 
                            onClick={handlePrev}
                            disabled={currentQuestionIndex === 0}
                            className="h-10 sm:h-11 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold disabled:opacity-50 text-sm sm:text-base transition-all active:scale-95"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> 
                            <span className="hidden xs:inline">{t.prev}</span>
                            <span className="xs:hidden">◀</span>
                        </Button>

                        {/* Progress indicator center mein */}
                        <div className="flex items-center gap-2">
                            <div className="text-xs sm:text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full">
                                {currentQuestionIndex + 1} / {totalQuestions}
                            </div>
                        </div>
                        
                        {currentQuestionIndex === totalQuestions - 1 ? (
                            <Button 
                                onClick={handleQuizSubmitAction} 
                                className="h-10 sm:h-11 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200/50 text-sm sm:text-base transition-all active:scale-95"
                            >
                                {t.submit}
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleNext}
                                className="h-10 sm:h-11 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md text-sm sm:text-base transition-all active:scale-95"
                            >
                                <span className="hidden xs:inline">{t.next}</span>
                                <span className="xs:hidden">▶</span>
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </main>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 🚪 EXIT CONFIRMATION DIALOG */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* Bhai, yeh modal dikhega jab:
             1. User X button dabaye
             2. User ESC dabaye (fullscreen exit attempt)
             3. User minimize icon dabaye
             
             🎯 KEY: Confirmation PEHLE, exit BAAD mein
             User ko /syllabus/quiz par redirect karega */}
        <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
           <DialogContent className="sm:max-w-md">
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-amber-600">
                   <AlertCircle className="w-5 h-5" /> {t.quitConfirm}
               </DialogTitle>
               <DialogDescription className="text-slate-600 pt-2">
                 {t.quitDesc}
               </DialogDescription>
             </DialogHeader>
             <DialogFooter className="flex gap-2 sm:justify-end mt-4">
               <Button 
                 variant="outline" 
                 onClick={() => {
                     setShowExitConfirm(false);
                     // Agar fullscreen nahi hai, wapas fullscreen kar do
                     if (!document.fullscreenElement && !isSubmitted) {
                         requestFullscreenWithAnimation();
                     }
                 }}
                 className="flex-1 sm:flex-none"
               >
                 {t.cancel}
               </Button>
               <Button 
                 variant="destructive" 
                 onClick={handleConfirmedExit}
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
                    <DialogTitle className="text-2xl font-bold text-slate-900 text-center">
                         Welcome to MPPSC 2026! 🚀
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 text-center pt-2">
                        We value your time and just need your name to get started!
                        <br />
                        <span className="text-sm text-slate-500 mt-1 inline-block">
                            Email and mobile are optional but help us serve you better.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <Input 
                            placeholder="e.g. MPPSC Aspirant" 
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="h-11 border-slate-200 focus:border-electric-blue focus:ring-electric-blue"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600">
                            Email <span className="text-xs text-slate-400">(Optional)</span>
                        </label>
                        <Input 
                             type="email"
                             placeholder="email" 
                             value={guestEmail}
                             onChange={(e) => setGuestEmail(e.target.value)}
                             className="h-11 border-slate-200 focus:border-electric-blue focus:ring-electric-blue"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600">
                            Mobile <span className="text-xs text-slate-400">(Optional)</span>
                        </label>
                         <Input 
                             type="tel"
                             placeholder="phone number" 
                             value={guestMobile}
                             onChange={(e) => setGuestMobile(e.target.value)}
                             className="h-11 border-slate-200 focus:border-electric-blue focus:ring-electric-blue"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button 
                        onClick={handleGuestEntrySubmit} 
                        disabled={!guestName.trim() || isSubmittingGuest}
                        className="w-full bg-[#00F0FF] hover:bg-[#00D1E0]  text-black font-bold h-12 rounded-xl shadow-lg transition-all"
                    >
                        {isSubmittingGuest ? "Starting..." : "Start Test →"}
                    </Button>
                </DialogFooter>
            </DialogContent>
         </Dialog>

    </div>
  );
}
