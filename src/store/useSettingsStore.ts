
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'hi';

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: { name?: string; email?: string } | null;
  isSubscribed: boolean;
  setUser: (user: { name?: string; email?: string } | null, isSubscribed: boolean) => void;
  // We can add more settings here like 'theme'
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'hi', // Default to Hindi as per user implied preference or common use
      setLanguage: (lang) => set({ language: lang }),
      user: null,
      isSubscribed: false,
      setUser: (user, isSubscribed) => set({ user, isSubscribed }),
    }),
    {
      name: 'settings-storage', // name of the item in the storage (must be unique)
    }
  )
);
