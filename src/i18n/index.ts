import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { AppLanguage } from './types';

import arCommon from './locales/ar/common.json';
import arOrders from './locales/ar/orders.json';
import arSettings from './locales/ar/settings.json';
import arMenu from './locales/ar/menu.json';

import enCommon from './locales/en/common.json';
import enOrders from './locales/en/orders.json';
import enSettings from './locales/en/settings.json';
import enMenu from './locales/en/menu.json';

export const STORAGE_KEY_LANGUAGE = 'app_language';
export const DEFAULT_LANGUAGE: AppLanguage = 'ar';

export function getInitialLanguage(): AppLanguage {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (saved === 'ar' || saved === 'en') {
      return saved as AppLanguage;
    }
  }
  return DEFAULT_LANGUAGE;
}

export function applyDocumentLanguageDirection(lang: string): void {
  if (typeof document !== 'undefined') {
    const isArabic = lang.startsWith('ar');
    document.documentElement.lang = isArabic ? 'ar' : 'en';
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  }
}

const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        common: arCommon,
        orders: arOrders,
        settings: arSettings,
        menu: arMenu,
      },
      en: {
        common: enCommon,
        orders: enOrders,
        settings: enSettings,
        menu: enMenu,
      },
    },
    lng: initialLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: 'common',
    ns: ['common', 'orders', 'settings', 'menu'],
    interpolation: {
      escapeValue: false,
    },
  });

// Apply document language and direction immediately on module load
applyDocumentLanguageDirection(initialLanguage);

// Synchronize changes to localStorage and DOM document attributes
i18n.on('languageChanged', (lng: string) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY_LANGUAGE, lng);
  }
  applyDocumentLanguageDirection(lng);
});

export default i18n;

