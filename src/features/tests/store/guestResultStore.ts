import { create } from 'zustand';

interface GuestResultData {
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeTaken: number; // in seconds
  questions: any[]; // simpler type to avoid circular deps, or import Question type
  answers: Record<string, number>;
}

interface GuestResultStore {
  result: GuestResultData | null;
  setResult: (data: GuestResultData) => void;
  clearResult: () => void;
}

export const useGuestResultStore = create<GuestResultStore>((set) => ({
  result: null,
  setResult: (data) => set({ result: data }),
  clearResult: () => set({ result: null }),
}));
