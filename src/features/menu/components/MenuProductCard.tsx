import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Edit3, MoreVertical } from 'lucide-react';
import { MenuItem } from '../../../types/menu';
import { formatCurrency } from '../../../utils/formatCurrency';
import { MenuProductImage } from './MenuProductImage';
import './MenuProductCard.css';

interface MenuProductCardProps {
  item: MenuItem;
  onToggleAvailability: (item: MenuItem) => void;
  onEditItem: (item: MenuItem) => void;
  onMoreActions: (item: MenuItem) => void;
}

export const MenuProductCard: React.FC<MenuProductCardProps> = ({
  item,
  onToggleAvailability,
  onEditItem,
  onMoreActions,
}) => {
  const { t } = useTranslation('menu');
  const productName = t(`items.${item.nameKey}`);
  const categoryName = t(`categories.${item.category}`);

  return (
    <article
      className={`menu-product-card ${item.isAvailable ? 'available' : 'unavailable'}`}
      aria-label={productName}
    >
      {/* Top Main Section: Image + Details + Badge/Price */}
      <div className="product-card-main">
        {/* Product Image Thumbnail */}
        <MenuProductImage
          type={item.imageType}
          name={productName}
          isAvailable={item.isAvailable}
        />

        {/* Product Information */}
        <div className="product-info-col">
          <span className="product-category-text">{categoryName}</span>
          <h2 className="product-name-text">{productName}</h2>
          <div className="product-price-row">
            <span className="product-price-value">{formatCurrency(item.price)}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="product-status-col">
          <span
            className={`product-status-badge ${item.isAvailable ? 'available' : 'unavailable'}`}
          >
            {item.isAvailable && <Check size={11} strokeWidth={3} className="status-badge-icon" />}
            <span>{item.isAvailable ? t('status.available') : t('status.unavailable')}</span>
          </span>
        </div>
      </div>

      {/* Bottom Actions Row: Divider + Toggle Switch + Edit + More */}
      <div className="product-card-actions">
        {/* Availability Toggle Control */}
        <div className="availability-toggle-group">
          <button
            type="button"
            role="switch"
            aria-checked={item.isAvailable}
            className={`menu-toggle-switch ${item.isAvailable ? 'active' : ''}`}
            onClick={() => onToggleAvailability(item)}
            aria-label={t('actions.toggleAvailabilityAria', { name: productName })}
          >
            <span className="menu-toggle-knob" />
          </button>
          <span className="toggle-label-text">
            {item.isAvailable ? t('status.available') : t('status.unavailable')}
          </span>
        </div>

        {/* Action Buttons: Edit and More */}
        <div className="card-buttons-group">
          <button
            type="button"
            className="btn-card-action btn-edit-item"
            onClick={() => onEditItem(item)}
            aria-label={t('actions.editItemAria', { name: productName })}
          >
            <Edit3 size={14} className="action-icon" />
            <span className="action-label">{t('actions.edit')}</span>
          </button>

          <button
            type="button"
            className="btn-card-action btn-more-actions"
            onClick={() => onMoreActions(item)}
            aria-label={t('actions.moreActionsAria', { name: productName })}
          >
            <MoreVertical size={16} className="action-icon" />
          </button>
        </div>
      </div>
    </article>
  );
};

