'use client';

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
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  questions: Question[]; // Saare questions ka data
  mode: 'topic' | 'full' | 'pyq'; // Test ka type
  timeLimitInMinutes: number; // 10 minutes (topic) ya 60 minutes (full)
  testId: string; // Database me test ki ID
  title?: string; // Test ka naam (display ke liye)
  userId: string | null; // User ID (null for guest) CRITICAL: null = guest, value = logged-in
  onExit: () => void; // Exit handler  Exit button ka callback
  onRetry?: () => void; // Retry handlerne ka option Retry karne ka option
  isInstantMode?: boolean; // Instant feedback chahiye ki nahi
  disablePalette?: boolean; // Question palette hide karna hai?
  hideFooter?: boolean; // Footer navigation bar hide karna hai? (Focus mode ke liye)
}

export function QuizInterface(props: QuizInterfaceProps) {
  // ─────────────────────────────────────────────────────────────
  // 📦 PROPS DESTRUCTURING (Clean Variable Names)
  // ─────────────────────────────────────────────────────────────
  const {
    questions, // Saare questions
    mode, // Test type
    timeLimitInMinutes, // Time limit
    title, // Display naam
    onExit, // Exit callback
    disablePalette = false, // Default: palette dikhao
    hideFooter = true, // Default: footer HIDE (focus mode) - Quiz play page pe footer nahi chahiye
    testId, // Test ID (result/leaderboard ke liye)
    userId, // 🚨 CRITICAL: null = guest user (DB save NAHI hoga)
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
    currentQuestionIndex, // Konsa question dikha rahe ho (0-based index)
    answers, // User ke answers { questionId: optionIndex }
    markedforReview, // Review ke liye marked questions ka array
    isSubmitted, // Test submit ho gaya?
    timeLeft, // Kitna time bacha (seconds me)
    instantModeEnabled, // Instant feedback on/off
    language, // 'hi' | 'en' - current language

    // Action handlers (user interactions)
    setInstantModeEnabled, // Instant mode toggle
    handleOptionSelect, // Option click kiya
    handleNext, // Next button
    handlePrev, // Previous button
    handleJump, // Question palette se jump
    toggleMarkForReview, // Mark/Unmark for review
    handleSubmit, // Submit quiz (hook internally checks userId)
    handleRetry, // Retry attempt

    // Helper functions
    getParsedOptions, // Options parse karna (string/object handle karta hai)

    // Computed values
    currentQuestion, // Current question object
    isAnswered, // Current question answered hai?
    totalQuestions, // Total kitne questions hain
  } = useQuizLogic(props);

  // ─────────────────────────────────────────────────────────────
  // 🎨 UI LOCAL STATE (Sirf UI ke liye, business logic nahi)
  // ─────────────────────────────────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Question palette drawer
  const [showExitConfirm, setShowExitConfirm] = useState(false); // Exit confirmation dialog
  const [isFullscreen, setIsFullscreen] = useState(false); // 🎯 Focus mode - Fullscreen toggle (Bhai, distraction-free mode ke liye)
  const [hasAutoFullscreened, setHasAutoFullscreened] = useState(false); // Track kar rahe hain ki auto-fullscreen hua ya nahi

  // ─────────────────────────────────────────────────────────────
  // 👤 GUEST USER STATE (Lead Generation Logic)
  // ─────────────────────────────────────────────────────────────
  // Bhai, guest users se naam/email/mobile lenge (optional)
  // Lead generation ke liye - marketing team khush hogi 😎
  const [showGuestTeaser, setShowGuestTeaser] = useState(false); // Result teaser dikhaana hai?
  const [guestName, setGuestName] = useState(''); // Guest ka naam
  const [guestEmail, setGuestEmail] = useState(''); // Email (optional)
  const [guestMobile, setGuestMobile] = useState(''); // Mobile (optional)
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
      mobile: guestMobile,
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
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          // Remember user preference (next time auto-start)
          if (typeof window !== 'undefined') {
            localStorage.setItem('mppsc_quiz_fullscreen', 'true');
          }
        })
        .catch((err) => {
          console.error('Fullscreen nahi ho paya:', err);
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
      const q = questions.find((q) => q.id === qId);
      if (q) {
        if (q.correctAnswer === ansIdx) {
          // Correct answer: Add marks (default 3 from SCORING_CONFIG)
          earnedScore += q.marks || 3;
        } else {
          // Wrong answer: Deduct negative marks (default 1)
          const negative = q.negativeMarks !== undefined ? q.negativeMarks : 1;
          earnedScore -= negative;
        }
      }
    });

    // Time taken calculation
    const timeTaken = timeLimitInMinutes * 60 - timeLeft;

    return (
      <GuestResultTeaser
        score={earnedScore}
        totalQuestions={questions.length}
        timeTaken={timeTaken}
        guestName={guestName}
        onHome={() => (window.location.href = '/')}
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
    return (
      <QuizResult
        questions={questions}
        answers={answers}
        mode={mode}
        timeTaken={timeLimitInMinutes * 60 - timeLeft}
        onRetry={handleRetry}
        title={title}
        testId={testId} // Leaderboard ke liye chahiye
        userId={userId} // User ki ranking dikhane ke liye
        userName={undefined} // No userName available in this context
        showFeedbackModal={true}  // Always show feedback modal
      />
    );
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
  };

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
    quitDesc:
      language === 'hi'
        ? 'क्या आप निश्चित रूप से बाहर निकलना चाहते हैं? आपकी प्रगति खो जाएगी।'
        : 'Are you sure you want to exit? Your progress will be lost and this session will not be saved.',
    cancel: language === 'hi' ? 'रद्द करें' : 'Cancel',
    yesExit: language === 'hi' ? 'हां, बाहर जाएं' : 'Yes, Exit',
    answered: language === 'hi' ? 'उत्तर दिया' : 'Answered',
    notAnswered: language === 'hi' ? 'उत्तर नहीं दिया' : 'Not Answered',
    review: language === 'hi' ? 'समीक्षा' : 'Review',
    current: language === 'hi' ? 'वर्तमान' : 'Current',
  };

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
    <div
      className={cn(
        'relative flex h-[100dvh] flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 font-sans',
        // 🎯 Fullscreen animation - Pure CSS magic!
        isFullscreen && 'animate-in zoom-in duration-700 ease-out'
      )}
    >
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 🌟 FULLSCREEN ENTRY ANIMATION (Pure CSS) */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Bhai, jab fullscreen activate ho, yeh animation chalega
                 Smooth fade + zoom effect - Apple jaisa polish! */}
      {isFullscreen && !hasAutoFullscreened && (
        <div className="pointer-events-none fixed inset-0 z-0 animate-pulse bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-pink-600/10" />
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 🎯 HEADER BAR - Top sticky header with controls */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 shadow-sm backdrop-blur-lg sm:h-16 sm:px-4">
        {/* Left side: Exit button + Title */}
        <div className="flex items-center gap-2">
          {/* Exit button - Shows confirmation dialog FIRST, then exits */}
          <Button
            variant="ghost"
            size="icon"
            onClick={exitFullscreenWithConfirmation}
            className="-ml-2 text-slate-500 transition-colors hover:text-slate-900"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {/* Test title and badge */}
          <div className="flex hidden items-center gap-2 sm:flex">
            <div className="mx-2 h-6 w-px bg-slate-200"></div>
            <span className="font-display text-sm font-bold tracking-tight text-slate-900 sm:text-base">
              {title || (
                <>
                  MPPSC<span className="text-indigo-600">26</span>
                </>
              )}
            </span>
            <Badge
              variant="outline"
              className="ml-2 hidden border-slate-200 text-xs font-medium text-slate-500 md:inline-flex"
            >
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
            <div className="animate-in fade-in zoom-in rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 p-[2px] shadow-sm duration-300">
              <div
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 transition-all select-none',
                  instantModeEnabled
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-amber-200 bg-slate-50 hover:bg-slate-100'
                )}
                onClick={() => setInstantModeEnabled(!instantModeEnabled)}
                title="Toggle Instant Feedback"
              >
                <span
                  className={cn(
                    'flex items-center gap-1 text-xs font-bold uppercase',
                    instantModeEnabled ? 'text-amber-700' : 'text-slate-400'
                  )}
                >
                  <Zap
                    className={cn(
                      'h-3.5 w-3.5',
                      instantModeEnabled ? 'fill-amber-700' : 'fill-slate-300 text-slate-300'
                    )}
                  />
                  <span className="hidden sm:inline">{t.instantMode}</span>
                </span>
                <div
                  className={cn(
                    'relative h-4 w-7 rounded-full bg-slate-300 shadow-inner transition-colors',
                    instantModeEnabled && 'bg-amber-500'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all',
                      instantModeEnabled ? 'left-3.5' : 'left-0.5'
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────── */}
          {/* ⏱️ COUNTDOWN TIMER (Auto-submits at 0) */}
          {/* ─────────────────────────────────────────────── */}
          {/* Last 60 seconds me red + pulse animation */}
          <div
            className={cn(
              'flex min-w-[100px] items-center justify-center gap-2 rounded-lg px-3 py-1.5 font-mono text-lg font-bold transition-colors',
              timeLeft < 60 ? 'animate-pulse bg-red-50 text-red-600' : 'bg-slate-100 text-slate-900'
            )}
          >
            <Clock className="h-4 w-4 text-slate-400" />
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-slate-700 hover:bg-slate-100"
                >
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  {/* Pulse dot - attracts user attention */}
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 animate-pulse rounded-full border-2 border-white bg-emerald-500 shadow-sm sm:h-2.5 sm:w-2.5"></span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[85vw] flex-col p-0 sm:w-[400px]">
                {/* Palette Header */}
                <SheetHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
                  <SheetTitle className="flex items-center justify-between">
                    <span>{t.questionPalette}</span>
                    {/* Progress badge - Shows attempted count */}
                    <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                      {Object.keys(answers).length}/{totalQuestions} {t.attempted}
                    </span>
                  </SheetTitle>
                </SheetHeader>

                {/* ─────────────────────────────────────────────── */}
                {/* 📊 QUESTION GRID (Click to jump) */}
                {/* ─────────────────────────────────────────────── */}
                <div className="grid flex-1 grid-cols-5 content-start gap-3 overflow-y-auto p-6">
                  {questions.map((q, idx) => {
                    const isAns = answers[q.id] !== undefined; // Answered?
                    const isMarked = markedforReview.includes(q.id); // Marked for review?
                    const isCurrent = idx === currentQuestionIndex; // Current question?

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          handleJump(idx); // Jump to question
                          setIsDrawerOpen(false); // Close drawer
                        }}
                        className={cn(
                          'relative flex aspect-square items-center justify-center rounded-xl border-2 text-sm font-bold transition-all select-none',
                          isCurrent
                            ? 'z-10 scale-105 border-indigo-600 bg-indigo-600 text-white shadow-md'
                            : isAns
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : isMarked
                                ? 'border-amber-300 bg-amber-50 text-amber-700'
                                : 'border-slate-100 bg-white text-slate-400 hover:border-indigo-200 hover:bg-slate-50'
                        )}
                      >
                        {idx + 1}
                        {/* Flag icon for marked questions */}
                        {isMarked && !isCurrent && (
                          <div className="absolute -top-1.5 -right-1.5 rounded-full border border-amber-200 bg-amber-100 p-0.5">
                            <Flag className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4 border-t border-slate-100 bg-slate-50 p-6">
                  <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full border border-emerald-500 bg-emerald-50" />{' '}
                      {t.answered}
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full border border-slate-300 bg-white" />{' '}
                      {t.notAnswered}
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full border border-amber-300 bg-amber-50" />{' '}
                      {t.review}
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-indigo-600" /> {t.current}
                    </span>
                  </div>
                  <Button
                    className="h-12 w-full bg-slate-900 text-lg font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800"
                    onClick={handleQuizSubmitAction}
                  >
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
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mx-auto max-w-3xl space-y-3 sm:space-y-4"
            >
              {/* ─────────────────────────────────────────────── */}
              {/* 🏷️ QUESTION HEADER (Compact design) */}
              {/* ─────────────────────────────────────────────── */}
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold tracking-wider text-slate-400 uppercase sm:text-sm">
                  {t.question} {currentQuestionIndex + 1}/{totalQuestions}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMarkForReview}
                  className={cn(
                    'h-8 gap-1.5 px-2 text-xs font-medium transition-colors hover:bg-transparent sm:px-3 sm:text-sm',
                    markedforReview.includes(currentQuestion.id)
                      ? 'text-amber-600'
                      : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <Flag
                    className={cn(
                      'h-3 w-3 sm:h-4 sm:w-4',
                      markedforReview.includes(currentQuestion.id) && 'fill-current'
                    )}
                  />
                  <span className="hidden sm:inline">
                    {markedforReview.includes(currentQuestion.id) ? t.unmark : t.markReview}
                  </span>
                </Button>
              </div>

              {/* ─────────────────────────────────────────────── */}
              {/* 📖 QUESTION TEXT (Readable, prominent) */}
              {/* ─────────────────────────────────────────────── */}
              <h2 className="text-base leading-relaxed font-semibold text-slate-900 sm:text-lg md:text-xl">
                {language === 'en' && currentQuestion.questionEn
                  ? currentQuestion.questionEn
                  : currentQuestion.question}
              </h2>

              {/* Matching Questions - Standard Exam Layout */}
              {currentQuestion.type === 'matching' && currentQuestion.matchPairs && (
                <div className="mt-4 mb-8 pl-1">
                  <div className="grid max-w-2xl grid-cols-2 gap-x-8 gap-y-4">
                    {/* Headers */}
                    <div className="mb-2 border-b-2 border-slate-800 pb-1 font-bold text-slate-800">
                      {language === 'hi' ? 'सूची-I' : 'List-I'}
                    </div>
                    <div className="mb-2 border-b-2 border-slate-800 pb-1 font-bold text-slate-800">
                      {language === 'hi' ? 'सूची-II' : 'List-II'}
                    </div>

                    {/* Content Column 1 */}
                    <div className="space-y-3">
                      {currentQuestion.matchPairs.map((pair, idx) => (
                        <div
                          key={`col1-${idx}`}
                          className="flex items-start gap-2 text-base sm:text-lg"
                        >
                          <span className="min-w-[24px] font-semibold text-slate-900">
                            {pair.id}
                          </span>
                          <span className="text-slate-800">
                            {language === 'en' && pair.labelEn ? pair.labelEn : pair.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Content Column 2 */}
                    <div className="space-y-3">
                      {currentQuestion.matchPairs.map((pair, idx) => (
                        <div
                          key={`col2-${idx}`}
                          className="flex items-start gap-2 text-base sm:text-lg"
                        >
                          <span className="min-w-[24px] font-semibold text-slate-900">
                            {pair.matchId}
                          </span>
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
                  const rawOptions =
                    language === 'hi' && (currentQuestion as any).options_hi
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
                        'group relative cursor-pointer overflow-hidden rounded-lg border-2 p-3 transition-all duration-200 active:scale-[0.98] sm:rounded-xl sm:p-4',
                        // Base State
                        !isAnswered && 'hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm',
                        !isAnswered &&
                          isSelected &&
                          'border-indigo-600 bg-indigo-50 font-semibold shadow-sm',

                        // Feedback State (Instant Mode)
                        showFeedback &&
                          isCorrect &&
                          'border-emerald-500 bg-emerald-50 font-medium text-emerald-900 shadow-md shadow-emerald-100/50', // Correct
                        showFeedback &&
                          isSelected &&
                          !isCorrect &&
                          'border-red-400 bg-red-50 font-medium text-red-900 shadow-md shadow-red-100/50', // Wrong selection

                        // Disabled State
                        isAnswered &&
                          !showFeedback &&
                          isSelected &&
                          'border-indigo-600 bg-indigo-50',
                        isAnswered &&
                          !isSelected &&
                          !(showFeedback && isCorrect) &&
                          'border-slate-200 opacity-50'
                      )}
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <span
                          className={cn(
                            'pr-4 text-sm leading-relaxed sm:text-base',
                            isSelected ? 'font-semibold text-slate-900' : 'text-slate-700'
                          )}
                        >
                          {optionText}
                        </span>

                        {/* Icons based on state */}
                        <div className="shrink-0">
                          {showFeedback ? (
                            // In instant mode, show feedback for all options
                            isCorrect ? (
                              // Always show green tick for correct answer
                              <div className="animate-in zoom-in flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 duration-300">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              </div>
                            ) : isSelected ? (
                              // Show red X only for wrong selected answer
                              <div className="animate-in zoom-in flex h-6 w-6 items-center justify-center rounded-full bg-red-500 duration-300">
                                <X className="h-4 w-4 text-white" />
                              </div>
                            ) : (
                              // Show empty circle for non-selected wrong answers
                              <div className="h-6 w-6 rounded-full border-2 border-slate-200" />
                            )
                          ) : (
                            // Normal mode - show selection indicator
                            <div
                              className={cn(
                                'h-6 w-6 rounded-full border-2 transition-colors',
                                isSelected
                                  ? 'border-slate-900 bg-slate-900'
                                  : 'border-slate-200 group-hover:border-slate-300'
                              )}
                            >
                              {isSelected && (
                                <div className="flex h-full w-full items-center justify-center">
                                  <div className="h-2 w-2 rounded-full bg-white" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Feedback Background Highlight */}
                      {showFeedback && isCorrect && (
                        <div className="absolute top-0 right-0 bottom-0 w-1 bg-emerald-500" />
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
                  className="max-h-[200px] overflow-y-auto rounded-lg border border-indigo-200/50 bg-gradient-to-br from-indigo-50 to-purple-50 p-3 shadow-sm sm:rounded-xl sm:p-4"
                >
                  <div className="mb-2 flex items-center gap-2 border-b border-indigo-200/50 pb-2">
                    <Lightbulb className="h-3.5 w-3.5 text-indigo-600 sm:h-4 sm:w-4" />
                    <span className="text-xs font-bold tracking-wide text-indigo-900 uppercase sm:text-sm">
                      {t.explanation}
                    </span>
                  </div>

                  <div className="text-xs leading-relaxed text-slate-700 sm:text-sm">
                    <PremiumExplanation
                      explanation={
                        (currentQuestion as any).explanation_hi || currentQuestion.explanation
                      }
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
        <div className="flex-shrink-0 border-t border-slate-200/80 bg-white/95 px-3 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] backdrop-blur-lg sm:px-6 sm:py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="h-10 rounded-lg px-4 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 sm:h-11 sm:rounded-xl sm:px-6 sm:text-base"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span className="xs:inline hidden">{t.prev}</span>
              <span className="xs:hidden">◀</span>
            </Button>

            {/* Progress indicator center mein */}
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-900 sm:text-sm">
                {currentQuestionIndex + 1} / {totalQuestions}
              </div>
            </div>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={handleQuizSubmitAction}
                className="h-10 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-200/50 transition-all hover:from-emerald-700 hover:to-teal-700 active:scale-95 sm:h-11 sm:rounded-xl sm:px-6 sm:text-base"
              >
                {t.submit}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 sm:h-11 sm:rounded-xl sm:px-6 sm:text-base"
              >
                <span className="xs:inline hidden">{t.next}</span>
                <span className="xs:hidden">▶</span>
                <ChevronRight className="ml-1 h-4 w-4" />
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
              <AlertCircle className="h-5 w-5" /> {t.quitConfirm}
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-600">{t.quitDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
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
              className="flex-1 bg-red-600 hover:bg-red-700 sm:flex-none"
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
            <DialogTitle className="text-center text-2xl font-bold text-slate-900">
              Welcome to MPPSC 2026! 🚀
            </DialogTitle>
            <DialogDescription className="pt-2 text-center text-slate-600">
              We value your time and just need your name to get started!
              <br />
              <span className="mt-1 inline-block text-sm text-slate-500">
                Email and mobile are optional but help us serve you better.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. MPPSC Aspirant"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="focus:border-electric-blue focus:ring-electric-blue h-11 border-slate-200"
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
                className="focus:border-electric-blue focus:ring-electric-blue h-11 border-slate-200"
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
                className="focus:border-electric-blue focus:ring-electric-blue h-11 border-slate-200"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleGuestEntrySubmit}
              disabled={!guestName.trim() || isSubmittingGuest}
              className="h-12 w-full rounded-xl bg-[#00F0FF] font-bold text-black shadow-lg transition-all hover:bg-[#00D1E0]"
            >
              {isSubmittingGuest ? 'Starting...' : 'Start Test →'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
