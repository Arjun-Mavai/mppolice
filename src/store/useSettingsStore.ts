import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'hi';

export interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
  role?: string; // 'admin' | 'user'
  isSubscribed?: boolean; // Fixed: camelCase to match DB
  isPro?: boolean; // Legacy flag support
  planTier?: 'free' | 'lite' | 'pro'; // Fixed: camelCase to match DB
}

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  isLockModalOpen: boolean;
  setLockModalOpen: (isOpen: boolean) => void;
  authCheckStatus: 'idle' | 'loading' | 'checked';
  setAuthCheckStatus: (status: 'idle' | 'loading' | 'checked') => void;
  setUser: (user: User | null) => void;
  uiMode: 'classic' | 'modern';
  setUiMode: (mode: 'classic' | 'modern') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'hi',
      setLanguage: (lang) => set({ language: lang }),
      user: null,
      isLockModalOpen: false,
      authCheckStatus: 'idle',
      setAuthCheckStatus: (status) => set({ authCheckStatus: status }),
      setLockModalOpen: (isOpen) => set({ isLockModalOpen: isOpen }),
      // On logout: caller must also localStorage.removeItem('settings-storage')
      // setUser simplified: isSubscribed is now inside the user object itself
      setUser: (user) => set({ user, authCheckStatus: 'checked' }),
      uiMode: 'modern',
      setUiMode: (mode) => set({ uiMode: mode }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
