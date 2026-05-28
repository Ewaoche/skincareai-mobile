import { useMemo } from 'react';
import { useLanguageStore } from '@/stores/language-store';
import { en } from './locales/en';
import { el } from './locales/el';
import { AppLanguage, TranslationDictionary, TranslationKey } from './types';

const dictionaries: Record<AppLanguage, TranslationDictionary> = {
  en,
  el,
};

const fallbackLanguage: AppLanguage = 'en';

export function translate(
  language: AppLanguage,
  key: TranslationKey,
  variables?: Record<string, string | number>,
): string {
  const selectedDictionary = dictionaries[language] ?? dictionaries[fallbackLanguage];
  const fallbackDictionary = dictionaries[fallbackLanguage];
  const template = selectedDictionary[key] ?? fallbackDictionary[key] ?? key;

  if (!variables) {
    return template;
  }

  return Object.entries(variables).reduce<string>(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

export function useI18n() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return useMemo(
    () => ({
      language,
      setLanguage,
      t: (
        key: TranslationKey,
        variables?: Record<string, string | number>,
      ) => translate(language, key, variables),
    }),
    [language, setLanguage],
  );
}
