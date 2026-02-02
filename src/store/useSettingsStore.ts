
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'hi';

export interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string; // 'admin' | 'user'
  is_subscribed?: boolean;
  plan_tier?: 'free' | 'lite' | 'pro';
}

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  isSubscribed: boolean;
  isLockModalOpen: boolean;
  setLockModalOpen: (isOpen: boolean) => void;
  setUser: (user: User | null, isSubscribed: boolean) => void;
  // We can add more settings here like 'theme'
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'hi', // Default to Hindi as per user implied preference or common use
      setLanguage: (lang) => set({ language: lang }),
      user: null,
      isSubscribed: false,
      isLockModalOpen: false,
      setLockModalOpen: (isOpen) => set({ isLockModalOpen: isOpen }),
      setUser: (user, isSubscribed) => set({ user, isSubscribed }),
    }),
    {
      name: 'settings-storage', // name of the item in the storage (must be unique)
    }
  )
);
