import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface GuestResultData {
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeTaken: number; // in seconds
  questions: any[]; // Store questions for result display
  answers: Record<string, number>;
  testId?: string; // Add testId for feedback submission
  title?: string; // Add title for display
  timestamp: number; // When the test was completed
}

interface GuestResultStore {
  result: GuestResultData | null;
  setResult: (data: GuestResultData) => void;
  clearResult: () => void;
  clearOldResults: () => void; // Cleanup old results
}

// Helper function to generate storage key based on testId
const getStorageKey = (testId?: string) => {
  return testId ? `guest-result-${testId}` : 'guest-result-store';
};

// Cleanup function to remove old results (older than 24 hours)
const cleanupOldResults = () => {
  if (typeof window === 'undefined') return;
  
  const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
  
  // Get all localStorage keys that start with 'guest-result-'
  const keysToDelete: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('guest-result-')) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          const timestamp = parsed.state?.result?.timestamp || 0;
          if (timestamp < cutoff) {
            keysToDelete.push(key);
          }
        }
      } catch (e) {
        // Invalid data, delete it
        keysToDelete.push(key);
      }
    }
  }
  
  keysToDelete.forEach(key => {
    localStorage.removeItem(key);
  });
};

export const useGuestResultStore = create<GuestResultStore>()(
  persist(
    (set) => ({
      result: null,
      setResult: (data) => {
        // Add timestamp when storing
        const resultWithTimestamp = {
          ...data,
          timestamp: Date.now()
        };
        set({ result: resultWithTimestamp });
      },
      clearResult: () => set({ result: null }),
      clearOldResults: () => {
        cleanupOldResults();
      }
    }),
    {
      name: 'guest-result-store', // Keep same name for backward compatibility
      // Only persist essential data
      partialize: (state) => ({ 
        result: state.result ? {
          ...state.result,
          // Persist questions but only essential fields to reduce memory usage
          questions: state.result.questions?.map(q => ({
            id: q.id,
            question: q.question,
            questionEn: q.questionEn,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            explanationEn: q.explanationEn,
            marks: q.marks,
            negativeMarks: q.negativeMarks,
            type: q.type,
            subject: q.subject
          }))
        } : null 
      }),
      // Custom storage implementation for smarter key management
      storage: createJSONStorage(() => ({
        getItem: (name: string): string | null => {
          if (typeof window === 'undefined') return null;

          // First try the default storage
          const defaultItem = localStorage.getItem(name);
          if (defaultItem) {
            return defaultItem;
          }
          
          // If no default, try to find the most recent result
          let mostRecent: string | null = null;
          let mostRecentTime = 0;
          
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('guest-result-')) {
              try {
                const data = localStorage.getItem(key);
                if (data) {
                  const parsed = JSON.parse(data);
                  const timestamp = parsed.state?.result?.timestamp || 0;
                  if (timestamp > mostRecentTime) {
                    mostRecentTime = timestamp;
                    mostRecent = data;
                  }
                }
              } catch (e) {
                // Skip invalid data
              }
            }
          }
          
          return mostRecent;
        },
        setItem: (name: string, value: string): void => {
          if (typeof window === 'undefined') return;

          // Parse the value to get testId if available
          try {
            const parsed = JSON.parse(value);
            const testId = parsed.state?.result?.testId;
            
            // If testId exists, use dynamic key
            if (testId) {
              const dynamicKey = getStorageKey(testId);
              localStorage.setItem(dynamicKey, value);
            }
            
            // Always also set the default key for backward compatibility
            localStorage.setItem(name, value);
            
            // Cleanup old results periodically
            cleanupOldResults();
          } catch (e) {
            // Fallback to default storage
            localStorage.setItem(name, value);
          }
        },
        removeItem: (name: string): void => {
          if (typeof window === 'undefined') return;
          
          localStorage.removeItem(name);
          
          // Also remove all guest-result-* keys
          const keysToDelete: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('guest-result-')) {
              keysToDelete.push(key);
            }
          }
          keysToDelete.forEach(key => localStorage.removeItem(key));
        }
      }))
    }
  )
);

