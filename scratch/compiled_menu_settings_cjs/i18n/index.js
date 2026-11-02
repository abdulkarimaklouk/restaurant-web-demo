"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LANGUAGE = exports.STORAGE_KEY_LANGUAGE = void 0;
exports.getInitialLanguage = getInitialLanguage;
exports.applyDocumentLanguageDirection = applyDocumentLanguageDirection;
const i18next_1 = require("i18next");
const react_i18next_1 = require("react-i18next");
const common_json_1 = require("./locales/ar/common.json");
const orders_json_1 = require("./locales/ar/orders.json");
const settings_json_1 = require("./locales/ar/settings.json");
const menu_json_1 = require("./locales/ar/menu.json");
const analytics_json_1 = require("./locales/ar/analytics.json");
const common_json_2 = require("./locales/en/common.json");
const orders_json_2 = require("./locales/en/orders.json");
const settings_json_2 = require("./locales/en/settings.json");
const menu_json_2 = require("./locales/en/menu.json");
const analytics_json_2 = require("./locales/en/analytics.json");
exports.STORAGE_KEY_LANGUAGE = 'app_language';
exports.DEFAULT_LANGUAGE = 'ar';
function getInitialLanguage() {
    if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(exports.STORAGE_KEY_LANGUAGE);
        if (saved === 'ar' || saved === 'en') {
            return saved;
        }
    }
    return exports.DEFAULT_LANGUAGE;
}
function applyDocumentLanguageDirection(lang) {
    if (typeof document !== 'undefined') {
        const isArabic = lang.startsWith('ar');
        document.documentElement.lang = isArabic ? 'ar' : 'en';
        document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    }
}
const initialLanguage = getInitialLanguage();
i18next_1.default
    .use(react_i18next_1.initReactI18next)
    .init({
    resources: {
        ar: {
            common: common_json_1.default,
            orders: orders_json_1.default,
            settings: settings_json_1.default,
            menu: menu_json_1.default,
            analytics: analytics_json_1.default,
        },
        en: {
            common: common_json_2.default,
            orders: orders_json_2.default,
            settings: settings_json_2.default,
            menu: menu_json_2.default,
            analytics: analytics_json_2.default,
        },
    },
    lng: initialLanguage,
    fallbackLng: exports.DEFAULT_LANGUAGE,
    defaultNS: 'common',
    ns: ['common', 'orders', 'settings', 'menu', 'analytics'],
    interpolation: {
        escapeValue: false,
    },
});
// Apply document language and direction immediately on module load
applyDocumentLanguageDirection(initialLanguage);
// Synchronize changes to localStorage and DOM document attributes
i18next_1.default.on('languageChanged', (lng) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(exports.STORAGE_KEY_LANGUAGE, lng);
    }
    applyDocumentLanguageDirection(lng);
});
exports.default = i18next_1.default;
