export type MenuCategoryId = 'all' | 'main' | 'appetizers' | 'drinks';

export interface MenuItem {
  id: string;
  nameKey: string;
  category: MenuCategoryId;
  price: number;
  isAvailable: boolean;
  imageType: 'burger' | 'chicken' | 'pasta' | 'fries' | 'salad' | 'cola' | 'juice';
}

export interface CategoryInfo {
  id: MenuCategoryId;
  labelKey: string;
  count: number;
}

