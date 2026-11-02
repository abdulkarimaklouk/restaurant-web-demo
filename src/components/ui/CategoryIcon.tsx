import React from 'react';
import {
  Utensils,
  Salad,
  CupSoda,
  Coffee,
  Cake,
  Pizza,
  Sandwich,
  LayoutGrid,
} from 'lucide-react';
import { CategoryIconType } from '../../types/menuSettings';

export interface CategoryIconProps {
  icon: CategoryIconType | string;
  size?: number;
  className?: string;
}

export const renderCategoryIcon = (
  icon: CategoryIconType | string,
  size = 18,
  className = ''
): React.ReactElement => {
  switch (icon) {
    case 'utensils':
      return <Utensils size={size} className={className} />;
    case 'salad':
      return <Salad size={size} className={className} />;
    case 'cup-soda':
      return <CupSoda size={size} className={className} />;
    case 'coffee':
      return <Coffee size={size} className={className} />;
    case 'cake':
      return <Cake size={size} className={className} />;
    case 'pizza':
      return <Pizza size={size} className={className} />;
    case 'sandwich':
      return <Sandwich size={size} className={className} />;
    case 'layout-grid':
    default:
      return <LayoutGrid size={size} className={className} />;
  }
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon,
  size = 18,
  className = '',
}) => {
  return renderCategoryIcon(icon, size, className);
};

