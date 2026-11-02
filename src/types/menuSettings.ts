import { LocalizedName } from './menu';

export const CURATED_CATEGORY_ICONS = [
  'utensils',
  'salad',
  'cup-soda',
  'coffee',
  'cake',
  'pizza',
  'sandwich',
  'layout-grid',
] as const;

export type CategoryIconType = (typeof CURATED_CATEGORY_ICONS)[number];

export interface CategoryDefinition {
  id: string;
  name: LocalizedName;
  icon: CategoryIconType;
  sortOrder: number;
  isDefault?: boolean;
}

export interface MenuAutoAvailabilitySettings {
  syncWithWorkingHours: boolean;
  dailyAutoReset: boolean;
  lastResetDate?: string; // YYYY-MM-DD
}

export interface MenuPricingSettings {
  readonly currency: 'EGP';
  readonly isTaxInclusive: true;
  readonly decimalPrecision: 0;
}

export interface MenuSettings {
  categories: CategoryDefinition[];
  autoAvailability: MenuAutoAvailabilitySettings;
  pricing: MenuPricingSettings;
}

export interface CreateCategoryInput {
  id?: string;
  name: {
    ar: string;
    en: string;
  };
  icon: CategoryIconType;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: {
    ar?: string;
    en?: string;
  };
  icon?: CategoryIconType;
  sortOrder?: number;
}

export interface CategoryOperationResult {
  success: boolean;
  error?: string;
  category?: CategoryDefinition;
}

export const DEFAULT_CATEGORY_DEFINITIONS: CategoryDefinition[] = [
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

export const DEFAULT_AUTO_AVAILABILITY_SETTINGS: MenuAutoAvailabilitySettings = {
  syncWithWorkingHours: false,
  dailyAutoReset: false,
};

export const DEFAULT_PRICING_SETTINGS: MenuPricingSettings = {
  currency: 'EGP',
  isTaxInclusive: true,
  decimalPrecision: 0,
};

export const DEFAULT_MENU_SETTINGS: MenuSettings = {
  categories: DEFAULT_CATEGORY_DEFINITIONS,
  autoAvailability: DEFAULT_AUTO_AVAILABILITY_SETTINGS,
  pricing: DEFAULT_PRICING_SETTINGS,
};

