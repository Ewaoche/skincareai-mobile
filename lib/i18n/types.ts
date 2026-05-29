import { en } from './locales/en';

export type AppLanguage = 'en' | 'el';
export type TranslationKey = keyof typeof en;
export type TranslationDictionary = Partial<Record<TranslationKey, string>>;
