import React from 'react';
import {
  Sandwich,
  Drumstick,
  Utensils,
  Pizza,
  Salad,
  CupSoda,
  Citrus,
} from 'lucide-react';
import { MenuItem } from '../../../types/menu';
import './MenuProductCard.css';

interface MenuProductImageProps {
  type: MenuItem['imageType'];
  name: string;
  isAvailable: boolean;
}

export const MenuProductImage: React.FC<MenuProductImageProps> = ({
  type,
  name,
  isAvailable,
}) => {
  const renderIcon = () => {
    switch (type) {
      case 'burger':
        return <Sandwich size={26} strokeWidth={2.2} className="product-svg-icon" />;
      case 'chicken':
        return <Drumstick size={26} strokeWidth={2.2} className="product-svg-icon" />;
      case 'pasta':
        return <Utensils size={26} strokeWidth={2.2} className="product-svg-icon" />;
      case 'fries':
        return <Pizza size={26} strokeWidth={2.2} className="product-svg-icon" />;
      case 'salad':
        return <Salad size={26} strokeWidth={2.2} className="product-svg-icon" />;
      case 'cola':
        return <CupSoda size={26} strokeWidth={2.2} className="product-svg-icon" />;
      case 'juice':
        return <Citrus size={26} strokeWidth={2.2} className="product-svg-icon" />;
      default:
        return <Utensils size={26} strokeWidth={2.2} className="product-svg-icon" />;
    }
  };

  return (
    <div
      className={`product-image-container type-${type} ${isAvailable ? 'available' : 'unavailable'}`}
      role="img"
      aria-label={name}
    >
      <div className="product-image-backdrop" />
      <div className="product-image-icon-wrap">{renderIcon()}</div>
    </div>
  );
};

