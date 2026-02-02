import { useState, useEffect, useRef, useCallback } from 'react';
import { useSettingsStore } from "@/store/useSettingsStore";
import { Question } from '@/types/quiz';

interface UseQuizLogicProps {
    questions: Question[];
    mode: 'topic' | 'full' | 'pyq';
    timeLimitInMinutes: number;
    testId: string;
    userId: string;
    onRetry?: () => void;
    isInstantMode?: boolean;
}

export function useQuizLogic({
    questions,
    mode,
    timeLimitInMinutes,
    testId,
    userId,
    onRetry,
    isInstantMode = false,
}: UseQuizLogicProps) {
    // Language State
    const { language } = useSettingsStore();

    // Game State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({}); // questionId -> selectedOptionIndex
    const [markedforReview, setMarkedForReview] = useState<string[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [instantModeEnabled, setInstantModeEnabled] = useState(isInstantMode);
    
    // Timer State
    const [timeLeft, setTimeLeft] = useState(timeLimitInMinutes * 60);
    
    // Per Question Time Tracking
    const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
    const questionStartTimeRef = useRef<number>(Date.now());

    // --- Helpers ---

    const saveCurrentQuestionTime = useCallback(() => {
        const now = Date.now();
        const duration = (now - questionStartTimeRef.current) / 1000;
        const qId = questions[currentQuestionIndex].id;
        
        setQuestionTimes(prev => ({
            ...prev,
            [qId]: (prev[qId] || 0) + duration
        }));
        
        questionStartTimeRef.current = now;
    }, [questions, currentQuestionIndex]);

    const getParsedOptions = useCallback((opts: any) => {
        if (!opts) return [];
        if (Array.isArray(opts)) return opts;
        if (typeof opts === 'string') {
            try {
                const parsed = JSON.parse(opts);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    }, []);

    // --- Actions ---

    const handleSubmit = useCallback(async () => {
        setIsSubmitted(true);
        
        // If guest (no userId), don't save to DB, just show results locally
        if (!userId) {
            return;
        }

        try {
            const { submitTestAttempt } = await import('@/actions/test-actions');
            
            // Mapping answers to string format
            const formattedAnswers: Record<string, string> = {};
            Object.entries(answers).forEach(([qId, optIdx]) => {
                formattedAnswers[qId] = String(optIdx);
            });
            
            // Calculate final time for the last question active
            const now = Date.now();
            // ... (rest of logic)
            const duration = (now - questionStartTimeRef.current) / 1000;
            const currentQId = questions[currentQuestionIndex].id;
            
            const finalTimes = { ...questionTimes };
            finalTimes[currentQId] = (finalTimes[currentQId] || 0) + duration;

            await submitTestAttempt(
                testId,
                userId,
                formattedAnswers,
                (timeLimitInMinutes * 60) - timeLeft,
                finalTimes
            );
        } catch (error) {
            console.error("Failed to save test attempt:", error);
        }
    }, [answers, questions, currentQuestionIndex, questionTimes, testId, userId, timeLimitInMinutes, timeLeft]);

    const handleOptionSelect = useCallback((optionIndex: number) => {
        // Remove the lock to allow changing answers
        setAnswers(prev => ({
            ...prev,
            [questions[currentQuestionIndex].id]: optionIndex
        }));
    }, [questions, currentQuestionIndex]);

    const handleNext = useCallback(() => {
        saveCurrentQuestionTime();
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, [currentQuestionIndex, questions.length, saveCurrentQuestionTime]);

    const handlePrev = useCallback(() => {
        saveCurrentQuestionTime(); // Also save time when going back? logic in original code only saved on next/jump?
        // Original code: handlePrev didn't call saveCurrentQuestionTime? 
        // Wait, line 89 in original: "When switching questions (handleNext, handlePrev, jump), we call a helper 'saveTime()'."
        // But in original code `handlePrev` implementation (line 175) does NOT call saveCurrentQuestionTime. 
        // However, `handleNext` DOES (line 169).
        // And the Jump function (in the palette onClick) DOES (line 332).
        // It's inconsistent in original code. I should probably add it to handlePrev too for correctness.
        // User asked for "best skills", so I'll fix this inconsistency.
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    }, [currentQuestionIndex, saveCurrentQuestionTime]);

    const handleJump = useCallback((index: number) => {
        saveCurrentQuestionTime();
        setCurrentQuestionIndex(index);
    }, [saveCurrentQuestionTime]);

    const toggleMarkForReview = useCallback(() => {
        const currentId = questions[currentQuestionIndex].id;
        setMarkedForReview(prev => 
            prev.includes(currentId) 
                ? prev.filter(id => id !== currentId)
                : [...prev, currentId]
        );
    }, [questions, currentQuestionIndex]);

    const handleRetry = useCallback(() => {
        if (onRetry) {
            onRetry();
        } else {
             // Fallback local reset
            setAnswers({});
            setMarkedForReview([]);
            setTimeLeft(timeLimitInMinutes * 60);
            setCurrentQuestionIndex(0);
            setIsSubmitted(false);
            setQuestionTimes({});
            questionStartTimeRef.current = Date.now();
        }
    }, [onRetry, timeLimitInMinutes]);

    // --- Effects ---

    // Timer Logic
    useEffect(() => {
        if (isSubmitted) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isSubmitted, handleSubmit]);


    return {
        // State
        currentQuestionIndex,
        answers,
        markedforReview,
        isSubmitted,
        timeLeft,
        instantModeEnabled,
        language,
        
        // Actions
        setInstantModeEnabled,
        handleOptionSelect,
        handleNext,
        handlePrev,
        handleJump,
        toggleMarkForReview,
        handleSubmit,
        handleRetry,
        
        // Helpers
        getParsedOptions,
        
        // Derived
        currentQuestion: questions[currentQuestionIndex],
        isAnswered: answers[questions[currentQuestionIndex].id] !== undefined,
        totalQuestions: questions.length,
    };
}
