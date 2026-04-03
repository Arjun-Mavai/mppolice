import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GuestResultData {
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeTaken: number; // in seconds
  // ❌ Don't store heavy questions array - causes memory leaks
  // questions: any[]; 
  answers: Record<string, number>;
  testId?: string; // Add testId for feedback submission
  title?: string; // Add title for display
}

interface GuestResultStore {
  result: GuestResultData | null;
  setResult: (data: GuestResultData) => void;
  clearResult: () => void;
}

export const useGuestResultStore = create<GuestResultStore>()(
  persist(
    (set) => ({
      result: null,
      setResult: (data) => set({ result: data }),
      clearResult: () => set({ result: null }),
    }),
    {
      name: 'guest-result-store',
      // Only persist essential data, not heavy objects
      partialize: (state) => ({ 
        result: state.result ? {
          ...state.result,
          // Don't persist questions array
        } : null 
      }),
    }
  )
);
