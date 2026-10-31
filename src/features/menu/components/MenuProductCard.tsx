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
  const { t, i18n } = useTranslation('menu');
  const currentLang = i18n.resolvedLanguage || i18n.language || 'ar';
  const isEn = currentLang.startsWith('en');
  const productName = item.name
    ? isEn
      ? item.name.en || item.name.ar
      : item.name.ar || item.name.en
    : item.nameKey
      ? t(`items.${item.nameKey}`)
      : '';
  const categoryName = t(`categories.${item.category}`);

  return (
    <article
      className={`menu-product-card ${item.isAvailable ? 'available' : 'unavailable'}`}
      aria-label={productName}
    >
      <div className="product-card-body">
        {/* Right side (in RTL): Image + Details */}
        <div className="product-main-content">
          {/* Product Image Thumbnail */}
          <MenuProductImage
            type={item.imageType}
            name={productName}
            isAvailable={item.isAvailable}
          />

          {/* Product Information */}
          <div className="product-info-col">
            <span className="product-category-text">{categoryName}</span>
            <h2 className="product-name-text" title={productName}>{productName}</h2>
            <div className="product-price-badge-row">
              <span className="product-price-value">{formatCurrency(item.price)}</span>
              <span
                className={`product-status-badge ${item.isAvailable ? 'available' : 'unavailable'}`}
              >
                {item.isAvailable && <Check size={10} strokeWidth={3} className="status-badge-icon" />}
                <span>{item.isAvailable ? t('status.available') : t('status.unavailable')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Opposite side (Left in RTL, Right in LTR): Switch + Action Buttons */}
        <div className="product-actions-col">
          {/* Availability Toggle Switch (Blue active per Reference Image 1) */}
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

          {/* Subtle Outlined Action Buttons */}
          <div className="card-buttons-group">
            <button
              type="button"
              className="btn-card-action btn-edit-item"
              onClick={() => onEditItem(item)}
              aria-label={t('actions.editItemAria', { name: productName })}
              title={t('actions.edit')}
            >
              <Edit3 size={15} className="action-icon" />
            </button>

            <button
              type="button"
              className="btn-card-action btn-more-actions"
              onClick={() => onMoreActions(item)}
              aria-label={t('actions.moreActionsAria', { name: productName })}
              title={t('actions.more')}
            >
              <MoreVertical size={15} className="action-icon" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
