import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Edit3, Trash2 } from 'lucide-react';
import { MenuItem } from '../../../types/menu';
import { MenuProductImage } from './MenuProductImage';
import { formatCurrency } from '../../../utils/formatCurrency';
import './ProductActionsSheet.css';

export interface ProductActionsSheetProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export const ProductActionsSheet: React.FC<ProductActionsSheetProps> = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { t, i18n } = useTranslation('menu');
  const currentLang = i18n.resolvedLanguage || i18n.language || 'ar';
  const isEn = currentLang.startsWith('en');

  // Escape key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const productName = item.name
    ? isEn
      ? item.name.en || item.name.ar
      : item.name.ar || item.name.en
    : item.nameKey
      ? t(`items.${item.nameKey}`)
      : '';

  const categoryName = t(`categories.${item.category}`);

  return (
    <div
      className="product-actions-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="product-actions-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={t('deleteProduct.actionMenuTitle')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Product Preview & Close Button */}
        <div className="actions-sheet-header">
          <MenuProductImage
            type={item.imageType}
            name={productName}
            isAvailable={item.isAvailable}
          />
          <div className="actions-sheet-info">
            <h3 className="actions-sheet-title">{productName}</h3>
            <span className="actions-sheet-subtitle">
              {categoryName} • {formatCurrency(item.price)}
            </span>
          </div>
          <button
            type="button"
            className="actions-sheet-close-btn"
            onClick={onClose}
            aria-label={t('deleteProduct.cancelBtn')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Options List */}
        <div className="actions-sheet-list">
          <button
            type="button"
            className="action-sheet-btn edit-action-btn"
            onClick={() => {
              onClose();
              onEdit(item);
            }}
          >
            <Edit3 size={17} />
            <span>{t('deleteProduct.editOption')}</span>
          </button>

          <button
            type="button"
            className="action-sheet-btn delete-action-btn"
            onClick={() => {
              onClose();
              onDelete(item);
            }}
          >
            <Trash2 size={17} />
            <span>{t('deleteProduct.deleteOption')}</span>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          className="action-sheet-cancel-btn"
          onClick={onClose}
        >
          {t('deleteProduct.cancelBtn')}
        </button>
      </div>
    </div>
  );
};

