export const CURATED_CATEGORY_ICONS = [
    'utensils',
    'salad',
    'cup-soda',
    'coffee',
    'cake',
    'pizza',
    'sandwich',
    'layout-grid',
];
export const DEFAULT_CATEGORY_DEFINITIONS = [
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
export const DEFAULT_AUTO_AVAILABILITY_SETTINGS = {
    syncWithWorkingHours: false,
    dailyAutoReset: false,
};
export const DEFAULT_PRICING_SETTINGS = {
    currency: 'EGP',
    isTaxInclusive: true,
    decimalPrecision: 0,
};
export const DEFAULT_MENU_SETTINGS = {
    categories: DEFAULT_CATEGORY_DEFINITIONS,
    autoAvailability: DEFAULT_AUTO_AVAILABILITY_SETTINGS,
    pricing: DEFAULT_PRICING_SETTINGS,
};
