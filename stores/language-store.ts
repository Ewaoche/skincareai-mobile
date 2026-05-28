import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppLanguage } from '@/lib/i18n/types';

type LanguageStore = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'skincareai-language',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
