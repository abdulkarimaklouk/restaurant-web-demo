import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  UtensilsCrossed,
  Info,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Utensils,
  Salad,
  CupSoda,
  Coffee,
  Cake,
  Pizza,
  Sandwich,
  LayoutGrid,
  AlertCircle,
  AlertTriangle,
  X,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { ToastProps } from '../../../components/ui/Toast';
import {
  CategoryDefinition,
  CategoryIconType,
  CURATED_CATEGORY_ICONS,
} from '../../../types/menuSettings';
import { useMenuSettingsStore } from '../../../data/menuSettingsStore';
import { useMenuStore } from '../../../data/menuStore';
import './EditMenuSettings.css';

export interface EditMenuSettingsProps {
  onBack: () => void;
  onShowToast: (message: string, type?: ToastProps['type']) => void;
}

export const renderCategoryIcon = (
  icon: CategoryIconType,
  size = 18,
  className = ''
) => {
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

interface CategoryModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  category?: CategoryDefinition;
  onClose: () => void;
  onSave: (data: { nameAr: string; nameEn: string; icon: CategoryIconType }) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  mode,
  category,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation('settings');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<CategoryIconType>('utensils');
  const [errorAr, setErrorAr] = useState('');
  const [errorEn, setErrorEn] = useState('');

  useEffect(() => {
    if (category && mode === 'edit') {
      setNameAr(category.name.ar);
      setNameEn(category.name.en);
      setSelectedIcon(category.icon);
    } else {
      setNameAr('');
      setNameEn('');
      setSelectedIcon('utensils');
    }
    setErrorAr('');
    setErrorEn('');
  }, [category, mode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!nameAr.trim()) {
      setErrorAr(t('menuSettings.validation.nameArRequired'));
      hasError = true;
    } else {
      setErrorAr('');
    }

    if (!nameEn.trim()) {
      setErrorEn(t('menuSettings.validation.nameEnRequired'));
      hasError = true;
    } else {
      setErrorEn('');
    }

    if (hasError) return;

    onSave({
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      icon: selectedIcon,
    });
  };

  return (
    <div
      className="category-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="category-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="category-modal-header">
          <div className="category-modal-title-group">
            <div className="category-modal-icon-badge" aria-hidden="true">
              {renderCategoryIcon(selectedIcon, 19, 'modal-header-icon')}
            </div>
            <h2 id="category-modal-title" className="category-modal-title">
              {mode === 'add'
                ? t('menuSettings.addCategoryTitle')
                : t('menuSettings.editCategoryTitle')}
            </h2>
          </div>
          <button
            type="button"
            className="category-modal-close-btn"
            onClick={onClose}
            aria-label={t('menuSettings.cancelBtn')}
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-modal-form">
          {/* Arabic Name Input */}
          <div className={`modal-field-group ${errorAr ? 'has-error' : ''}`}>
            <label htmlFor="cat-name-ar" className="modal-field-label">
              <span>{t('menuSettings.nameArLabel')}</span>
              <span className="required-star">*</span>
            </label>
            <input
              id="cat-name-ar"
              type="text"
              dir="rtl"
              className="modal-text-input"
              value={nameAr}
              onChange={(e) => {
                setNameAr(e.target.value);
                if (errorAr) setErrorAr('');
              }}
              placeholder={t('menuSettings.nameArPlaceholder')}
              autoFocus
            />
            {errorAr && (
              <div className="modal-field-error" role="alert">
                <AlertCircle size={12} className="error-icon" />
                <span>{errorAr}</span>
              </div>
            )}
          </div>

          {/* English Name Input */}
          <div className={`modal-field-group ${errorEn ? 'has-error' : ''}`}>
            <label htmlFor="cat-name-en" className="modal-field-label">
              <span>{t('menuSettings.nameEnLabel')}</span>
              <span className="required-star">*</span>
            </label>
            <input
              id="cat-name-en"
              type="text"
              dir="ltr"
              className="modal-text-input"
              value={nameEn}
              onChange={(e) => {
                setNameEn(e.target.value);
                if (errorEn) setErrorEn('');
              }}
              placeholder={t('menuSettings.nameEnPlaceholder')}
            />
            {errorEn && (
              <div className="modal-field-error" role="alert">
                <AlertCircle size={12} className="error-icon" />
                <span>{errorEn}</span>
              </div>
            )}
          </div>

          {/* Icon Selection Grid */}
          <div className="modal-field-group">
            <label className="modal-field-label">
              <span>{t('menuSettings.iconLabel')}</span>
            </label>
            <div
              className="curated-icons-grid"
              role="radiogroup"
              aria-label={t('menuSettings.iconLabel')}
            >
              {CURATED_CATEGORY_ICONS.map((iconName) => {
                const isSelected = selectedIcon === iconName;
                const iconLabel = t(`menuSettings.icons.${iconName}`);
                return (
                  <button
                    key={iconName}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`icon-select-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedIcon(iconName)}
                    title={iconLabel}
                    aria-label={t('menuSettings.selectIconAria', { name: iconLabel })}
                  >
                    <div className="icon-select-inner">
                      {renderCategoryIcon(iconName, 18, 'icon-preview')}
                    </div>
                    {isSelected && (
                      <span className="icon-check-badge" aria-hidden="true">
                        <Check size={9} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions-row">
            <button type="submit" className="modal-btn-primary">
              {mode === 'add'
                ? t('menuSettings.addBtn')
                : t('menuSettings.saveBtn')}
            </button>
            <button
              type="button"
              className="modal-btn-secondary"
              onClick={onClose}
            >
              {t('menuSettings.cancelBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  category?: CategoryDefinition;
  itemCount: number;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
}

const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  isOpen,
  category,
  itemCount,
  onClose,
  onConfirmDelete,
}) => {
  const { t, i18n } = useTranslation('settings');
  const isArabic = (i18n.resolvedLanguage || i18n.language || 'ar').startsWith('ar');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !category) return null;

  const categoryName = isArabic ? category.name.ar : category.name.en;
  const isBlocked = itemCount > 0;

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
        aria-labelledby="delete-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-dialog-top">
          <div
            className={`delete-dialog-icon-circle ${isBlocked ? 'warning-circle' : 'danger-circle'}`}
            aria-hidden="true"
          >
            {isBlocked ? (
              <AlertTriangle size={24} strokeWidth={2.2} />
            ) : (
              <Trash2 size={24} strokeWidth={2.2} />
            )}
          </div>
          <h2 id="delete-dialog-title" className="delete-dialog-title">
            {isBlocked
              ? t('menuSettings.deleteBlockedTitle')
              : t('menuSettings.deleteConfirmTitle')}
          </h2>
          <p className="delete-dialog-desc">
            {isBlocked
              ? t('menuSettings.deleteBlockedDesc', { count: itemCount })
              : t('menuSettings.deleteConfirmDesc', { name: categoryName })}
          </p>
        </div>

        <div className="delete-dialog-actions">
          {isBlocked ? (
            <button
              type="button"
              className="modal-btn-primary"
              onClick={onClose}
              autoFocus
            >
              {t('menuSettings.deleteBlockedBtn')}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={() => onConfirmDelete(category.id)}
                autoFocus
              >
                {t('menuSettings.deleteConfirmBtn')}
              </button>
              <button
                type="button"
                className="modal-btn-secondary"
                onClick={onClose}
              >
                {t('menuSettings.cancelBtn')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const EditMenuSettings: React.FC<EditMenuSettingsProps> = ({
  onBack,
  onShowToast,
}) => {
  const { t, i18n } = useTranslation('settings');
  const isArabic = (i18n.resolvedLanguage || i18n.language || 'ar').startsWith('ar');

  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  } = useMenuSettingsStore();

  const { items } = useMenuStore();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    category?: CategoryDefinition;
  }>({
    isOpen: false,
    mode: 'add',
  });

  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    category?: CategoryDefinition;
    itemCount: number;
  }>({
    isOpen: false,
    itemCount: 0,
  });

  const getProductCountForCategory = (catId: string): number => {
    return items.filter((item) => item.category === catId).length;
  };

  const handleOpenAddModal = () => {
    setModalState({
      isOpen: true,
      mode: 'add',
    });
  };

  const handleOpenEditModal = (cat: CategoryDefinition) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      category: cat,
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSaveModal = (data: {
    nameAr: string;
    nameEn: string;
    icon: CategoryIconType;
  }) => {
    if (modalState.mode === 'add') {
      const result = addCategory({
        name: { ar: data.nameAr, en: data.nameEn },
        icon: data.icon,
      });

      if (result.success) {
        onShowToast(t('menuSettings.toasts.addSuccess'), 'success');
        handleCloseModal();
      } else {
        onShowToast(result.error || 'Failed to add category', 'warning');
      }
    } else if (modalState.mode === 'edit' && modalState.category) {
      const result = updateCategory(modalState.category.id, {
        name: { ar: data.nameAr, en: data.nameEn },
        icon: data.icon,
      });

      if (result.success) {
        onShowToast(t('menuSettings.toasts.editSuccess'), 'success');
        handleCloseModal();
      } else {
        onShowToast(result.error || 'Failed to update category', 'warning');
      }
    }
  };

  const handleOpenDelete = (cat: CategoryDefinition) => {
    if (cat.isDefault) {
      onShowToast(t('menuSettings.defaultCategoryProtected'), 'info');
      return;
    }
    const count = getProductCountForCategory(cat.id);
    setDeleteDialogState({
      isOpen: true,
      category: cat,
      itemCount: count,
    });
  };

  const handleCloseDelete = () => {
    setDeleteDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmDelete = (id: string) => {
    const result = deleteCategory(id);
    if (result.success) {
      onShowToast(t('menuSettings.toasts.deleteSuccess'), 'success');
      handleCloseDelete();
    } else {
      onShowToast(result.error || 'Failed to delete category', 'warning');
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[index - 1];
    newCategories[index - 1] = temp;

    const result = reorderCategories(newCategories.map((c) => c.id));
    if (result.success) {
      onShowToast(t('menuSettings.toasts.reorderSuccess'), 'success');
    }
  };

  const handleMoveDown = (index: number) => {
    if (index >= categories.length - 1) return;
    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[index + 1];
    newCategories[index + 1] = temp;

    const result = reorderCategories(newCategories.map((c) => c.id));
    if (result.success) {
      onShowToast(t('menuSettings.toasts.reorderSuccess'), 'success');
    }
  };

  return (
    <div className="edit-menu-settings-view" aria-label={t('menuSettings.pageTitle')}>
      {/* Demo Notice Banner */}
      <div className="demo-notice-bar" role="status">
        <Info size={11} className="notice-icon" aria-hidden="true" />
        <span className="notice-text">{t('demoNotice')}</span>
      </div>

      {/* Header */}
      <header className="edit-menu-header">
        <button
          type="button"
          className="edit-back-btn"
          onClick={onBack}
          aria-label={t('menuSettings.backAria')}
        >
          <ArrowLeft size={19} className="edit-back-icon" />
        </button>
        <h1 className="edit-menu-title">{t('menuSettings.pageTitle')}</h1>
      </header>

      {/* Scrollable Content */}
      <div className="edit-menu-scroll">
        {/* Info Banner Card */}
        <div className="info-banner-card">
          <div className="info-banner-icon-wrap" aria-hidden="true">
            <UtensilsCrossed size={16} />
          </div>
          <div className="info-banner-content">
            <h2 className="info-banner-title">
              {t('menuSettings.infoCardTitle')}
            </h2>
            <p className="info-banner-desc">
              {t('menuSettings.infoCardDesc')}
            </p>
          </div>
        </div>

        {/* Section 1: Categories Management Card */}
        <section
          className="menu-settings-card"
          aria-labelledby="section-categories-title"
        >
          <div className="card-header-row">
            <div className="card-title-group">
              <h2 id="section-categories-title" className="card-section-title">
                {t('menuSettings.categoriesSectionTitle')}
              </h2>
              <span className="card-badge count-badge">
                {t('menuSettings.activeCountBadge', { count: categories.length })}
              </span>
            </div>
            <button
              type="button"
              className="btn-add-category"
              onClick={handleOpenAddModal}
              aria-label={t('menuSettings.addCategoryBtn')}
            >
              <Plus size={14} strokeWidth={2.4} />
              <span>{t('menuSettings.addCategoryBtn')}</span>
            </button>
          </div>

          <div
            className="categories-list"
            role="list"
            aria-label={t('menuSettings.categoriesSectionTitle')}
          >
            {categories.map((cat, index) => {
              const primaryName = isArabic ? cat.name.ar : cat.name.en;
              const secondaryName = isArabic ? cat.name.en : cat.name.ar;
              const productCount = getProductCountForCategory(cat.id);
              const isFirst = index === 0;
              const isLast = index === categories.length - 1;

              return (
                <div
                  key={cat.id}
                  className="category-item-row"
                  role="listitem"
                  aria-label={`${primaryName} (${productCount})`}
                >
                  <div className="category-row-start">
                    {/* Sort Order Number Badge */}
                    <div className="category-order-num" aria-hidden="true">
                      {index + 1}
                    </div>

                    {/* Icon Container */}
                    <div className="category-icon-container" aria-hidden="true">
                      {renderCategoryIcon(cat.icon, 18, 'cat-svg-icon')}
                    </div>

                    {/* Names & Metadata */}
                    <div className="category-text-stack">
                      <div className="category-primary-line">
                        <span className="category-name-primary">{primaryName}</span>
                        {cat.isDefault && (
                          <span
                            className="category-default-badge"
                            title={t('menuSettings.defaultProtectedAria')}
                          >
                            <ShieldCheck size={11} className="badge-shield-icon" />
                            {t('menuSettings.defaultBadge')}
                          </span>
                        )}
                      </div>
                      <div className="category-secondary-line">
                        <span className="category-name-secondary">{secondaryName}</span>
                        <span className="category-item-count">
                          • {productCount === 1
                            ? t('menuSettings.itemCount_one')
                            : productCount === 0
                            ? t('menuSettings.itemCount_zero')
                            : t('menuSettings.itemCount', { count: productCount })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="category-row-end">
                    {/* Reordering Up/Down Buttons */}
                    <div className="reorder-controls" role="group" aria-label="Reorder">
                      <button
                        type="button"
                        className="btn-reorder"
                        disabled={isFirst}
                        onClick={() => handleMoveUp(index)}
                        aria-label={t('menuSettings.reorderUpAria')}
                        title={t('menuSettings.reorderUpAria')}
                      >
                        <ArrowUp size={13} strokeWidth={2.4} />
                      </button>
                      <button
                        type="button"
                        className="btn-reorder"
                        disabled={isLast}
                        onClick={() => handleMoveDown(index)}
                        aria-label={t('menuSettings.reorderDownAria')}
                        title={t('menuSettings.reorderDownAria')}
                      >
                        <ArrowDown size={13} strokeWidth={2.4} />
                      </button>
                    </div>

                    {/* Edit Button */}
                    <button
                      type="button"
                      className="btn-action-edit"
                      onClick={() => handleOpenEditModal(cat)}
                      aria-label={`${t('menuSettings.editBtn')} ${primaryName}`}
                      title={t('menuSettings.editBtn')}
                    >
                      <Pencil size={14} strokeWidth={2} />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      className={`btn-action-delete ${cat.isDefault ? 'disabled-default' : ''}`}
                      disabled={cat.isDefault}
                      onClick={() => handleOpenDelete(cat)}
                      aria-label={
                        cat.isDefault
                          ? t('menuSettings.defaultProtectedAria')
                          : `${t('menuSettings.deleteBtn')} ${primaryName}`
                      }
                      title={
                        cat.isDefault
                          ? t('menuSettings.defaultProtectedAria')
                          : t('menuSettings.deleteBtn')
                      }
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        category={modalState.category}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
      />

      {/* Delete Category Confirmation Dialog */}
      <DeleteCategoryDialog
        isOpen={deleteDialogState.isOpen}
        category={deleteDialogState.category}
        itemCount={deleteDialogState.itemCount}
        onClose={handleCloseDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
