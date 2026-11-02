import { CategoryIconType } from './menuSettings';

export type MenuCategoryType = 'main' | 'appetizers' | 'drinks' | string;
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

export type CreateMenuItemInput = Omit<MenuItem, 'id'> & { id?: string };

export interface CategoryInfo {
  id: MenuCategoryId;
  labelKey?: string;
  name?: LocalizedName;
  icon?: CategoryIconType;
  count: number;
}
