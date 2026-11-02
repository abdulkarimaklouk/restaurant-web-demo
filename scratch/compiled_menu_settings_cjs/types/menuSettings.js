"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MENU_SETTINGS = exports.DEFAULT_PRICING_SETTINGS = exports.DEFAULT_AUTO_AVAILABILITY_SETTINGS = exports.DEFAULT_CATEGORY_DEFINITIONS = exports.CURATED_CATEGORY_ICONS = void 0;
exports.CURATED_CATEGORY_ICONS = [
    'utensils',
    'salad',
    'cup-soda',
    'coffee',
    'cake',
    'pizza',
    'sandwich',
    'layout-grid',
];
exports.DEFAULT_CATEGORY_DEFINITIONS = [
    {
        id: 'main',
        name: {
            ar: 'أطباق رئيسية',
            en: 'Main Dishes',
        },
        icon: 'utensils',
        sortOrder: 0,
        isDefault: true,
    },
    {
        id: 'appetizers',
        name: {
            ar: 'المقبلات',
            en: 'Appetizers',
        },
        icon: 'salad',
        sortOrder: 1,
        isDefault: true,
    },
    {
        id: 'drinks',
        name: {
            ar: 'المشروبات',
            en: 'Drinks',
        },
        icon: 'cup-soda',
        sortOrder: 2,
        isDefault: true,
    },
];
exports.DEFAULT_AUTO_AVAILABILITY_SETTINGS = {
    syncWithWorkingHours: false,
    dailyAutoReset: false,
};
exports.DEFAULT_PRICING_SETTINGS = {
    currency: 'EGP',
    isTaxInclusive: true,
    decimalPrecision: 0,
};
exports.DEFAULT_MENU_SETTINGS = {
    categories: exports.DEFAULT_CATEGORY_DEFINITIONS,
    autoAvailability: exports.DEFAULT_AUTO_AVAILABILITY_SETTINGS,
    pricing: exports.DEFAULT_PRICING_SETTINGS,
};
