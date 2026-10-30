export type AppLanguage = 'ar' | 'en';

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  nativeName: string;
  direction: 'rtl' | 'ltr';
}

export const SUPPORTED_LANGUAGES: Record<AppLanguage, LanguageOption> = {
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
  },
};

