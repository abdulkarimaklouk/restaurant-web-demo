import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, AlertTriangle } from 'lucide-react';
import { MenuItem } from '../../../types/menu';
import { MenuProductImage } from './MenuProductImage';
import { formatCurrency } from '../../../utils/formatCurrency';
import './DeleteProductDialog.css';

export interface DeleteProductDialogProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (item: MenuItem) => void;
}

export const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  item,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const { t, i18n } = useTranslation('menu');
  const currentLang = i18n.resolvedLanguage || i18n.language || 'ar';
  const isEn = currentLang.startsWith('en');

  // Dismiss on Escape key
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
      className="delete-dialog-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="delete-dialog-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
        aria-describedby="delete-product-desc"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Danger Header Icon & Title */}
        <div className="delete-dialog-top">
          <div className="delete-dialog-icon-circle" aria-hidden="true">
            <Trash2 size={24} strokeWidth={2.4} />
          </div>
          <h2 id="delete-product-title" className="delete-dialog-title">
            {t('deleteProduct.dialogTitle')}
          </h2>
          <p id="delete-product-desc" className="delete-dialog-desc">
            {t('deleteProduct.dialogMessage', { name: productName })}
          </p>
        </div>

        {/* Product Visual Card Preview */}
        <div className="delete-dialog-product-preview">
          <MenuProductImage
            type={item.imageType}
            name={productName}
            isAvailable={item.isAvailable}
          />
          <div className="delete-preview-info">
            <span className="delete-preview-name">{productName}</span>
            <span className="delete-preview-meta">
              {categoryName} • {formatCurrency(item.price)}
            </span>
          </div>
        </div>

        {/* Warning Note */}
        <div className="delete-dialog-warning-box">
          <AlertTriangle size={13} className="delete-warning-icon" aria-hidden="true" />
          <span>{t('deleteProduct.warningNote')}</span>
        </div>

        {/* Action Buttons: Confirm Delete & Cancel */}
        <div className="delete-dialog-actions">
          <button
            type="button"
            className="btn-confirm-delete"
            onClick={() => onConfirmDelete(item)}
          >
            <Trash2 size={16} strokeWidth={2.4} />
            <span>{t('deleteProduct.confirmBtn')}</span>
          </button>
          <button
            type="button"
            className="btn-cancel-delete"
            onClick={onClose}
          >
            {t('deleteProduct.cancelBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

