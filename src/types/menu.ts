export type MenuCategoryType = 'main' | 'appetizers' | 'drinks';
export type MenuCategoryId = 'all' | MenuCategoryType;

export type MenuProductImageType =
  | 'burger'
  | 'chicken'
  | 'pasta'
  | 'fries'
  | 'salad'
  | 'cola'
  | 'juice';

export interface LocalizedName {
  ar: string;
  en: string;
}

export interface MenuItem {
  id: string;
  name: LocalizedName;
  category: MenuCategoryType;
  price: number;
  currency: string;
  imageType: MenuProductImageType;
  isAvailable: boolean;
  nameKey?: string;
}

export interface CategoryInfo {
  id: MenuCategoryId;
  labelKey: string;
  count: number;
}
