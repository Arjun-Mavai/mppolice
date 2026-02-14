import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Quote } from '@/data/quotes';

interface AppState {
  viewedQuotes: string[];
  savedQuotes: Quote[];
  swipeCount: number;
  lastSwipeDate: string;
  isPro: boolean;
  isZenMode: boolean;

  // Actions
  markAsViewed: (id: string) => void;
  saveQuote: (quote: Quote) => void;
  removeQuote: (id: string) => void;
  incrementSwipe: () => void;
  upgradeToPro: () => void;
  resetSwipeCount: () => void;
  toggleZenMode: () => void;
  syncProStatus: (status: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      viewedQuotes: [], // Added
      savedQuotes: [],
      swipeCount: 0,
      lastSwipeDate: new Date().toDateString(),
      isPro: false,
      isZenMode: false,

      markAsViewed: (
        id // Added
      ) =>
        set((state) => {
          if (state.viewedQuotes.includes(id)) return state;
          return { viewedQuotes: [...state.viewedQuotes, id] };
        }),

      saveQuote: (quote) =>
        set((state) => {
          if (state.savedQuotes.some((q) => q.id === quote.id)) return state;
          return { savedQuotes: [...state.savedQuotes, quote] };
        }),

      removeQuote: (id) =>
        set((state) => ({
          savedQuotes: state.savedQuotes.filter((q) => q.id !== id),
        })),

      incrementSwipe: () =>
        set((state) => {
          const today = new Date().toDateString();
          // Reset if new day
          if (state.lastSwipeDate !== today) {
            return { swipeCount: 1, lastSwipeDate: today };
          }
          return { swipeCount: state.swipeCount + 1 };
        }),

      upgradeToPro: () => set({ isPro: true }),
      syncProStatus: (status) => set({ isPro: status }),
      toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
      resetSwipeCount: () => set((state) => ({ swipeCount: 0 })), // Modified
    }),
    {
      name: 'mindful-storage', // name of the item in localStorage
    }
  )
);
