import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Info,
  DollarSign,
  Utensils,
  Salad,
  CupSoda,
  Check,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { MenuCategoryType, MenuProductImageType } from '../../../types/menu';
import { MenuProductImage } from './MenuProductImage';
import { formatCurrency } from '../../../utils/formatCurrency';
import { ToastProps } from '../../../components/ui/Toast';
import './AddProductScreen.css';

export interface AddProductScreenProps {
  onBack: () => void;
  onShowToast: (message: string, type?: ToastProps['type']) => void;
}

interface FormErrors {
  nameAr?: string;
  nameEn?: string;
  category?: string;
  price?: string;
}

const SUPPORTED_IMAGE_TYPES: MenuProductImageType[] = [
  'burger',
  'chicken',
  'pasta',
  'fries',
  'salad',
  'cola',
  'juice',
];

export const AddProductScreen: React.FC<AddProductScreenProps> = ({
  onBack,
  onShowToast,
}) => {
  const { t, i18n } = useTranslation('menu');
  const isArabic = (i18n.resolvedLanguage || i18n.language || 'ar').startsWith('ar');

  // Form local state (initialized with empty values, except availability = true)
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState<MenuCategoryType | ''>('');
  const [price, setPrice] = useState('');
  const [imageType, setImageType] = useState<MenuProductImageType>('burger');
  const [isAvailable, setIsAvailable] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedAr = nameAr.trim();
    const trimmedEn = nameEn.trim();
    const parsedPrice = parseFloat(price);

    if (!trimmedAr) {
      newErrors.nameAr = t('addProduct.errors.nameArRequired');
    }

    if (!trimmedEn) {
      newErrors.nameEn = t('addProduct.errors.nameEnRequired');
    }

    if (!category) {
      newErrors.category = t('addProduct.errors.categoryRequired');
    }

    if (!price || isNaN(parsedPrice)) {
      newErrors.price = t('addProduct.errors.priceRequired');
    } else if (parsedPrice <= 0) {
      newErrors.price = t('addProduct.errors.priceNegative');
    }

    setErrors(newErrors);

    // If errors exist, surface the first relevant warning message
    if (newErrors.nameAr) {
      onShowToast(newErrors.nameAr, 'warning');
      return false;
    }
    if (newErrors.nameEn) {
      onShowToast(newErrors.nameEn, 'warning');
      return false;
    }
    if (newErrors.category) {
      onShowToast(newErrors.category, 'warning');
      return false;
    }
    if (newErrors.price) {
      onShowToast(newErrors.price, 'warning');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Phase 3A: UI only, placeholder feedback, do not mutate store yet
    onShowToast(t('addProduct.placeholderSaveSuccess'), 'info');
    onBack();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Disallow negative values directly in input
    if (val.startsWith('-')) return;
    setPrice(val);
    if (errors.price) {
      setErrors((prev) => ({ ...prev, price: undefined }));
    }
  };

  const previewName = isArabic
    ? nameAr.trim() || nameEn.trim() || (isArabic ? 'اسم العنصر' : 'Product Name')
    : nameEn.trim() || nameAr.trim() || 'Product Name';

  const previewPrice = parseFloat(price) > 0 ? parseFloat(price) : 0;

  return (
    <div className="add-product-view" aria-label={t('addProduct.pageTitle')}>
      {/* 1. Demo Notice Banner */}
      <aside className="demo-notice-bar" role="status">
        <Info size={11} className="notice-icon" aria-hidden="true" />
        <span className="notice-text">{t('demoNotice')}</span>
      </aside>

      {/* 2. Page Header with Back Button */}
      <header className="add-product-header">
        <button
          type="button"
          className="edit-back-btn"
          onClick={onBack}
          aria-label={t('addProduct.backAria')}
        >
          <ArrowLeft size={19} className="edit-back-icon" />
        </button>
        <h1 className="add-product-title">{t('addProduct.pageTitle')}</h1>
      </header>

      {/* 3. Form Content */}
      <div className="add-product-scroll">
        <form onSubmit={handleSubmit} className="add-product-form" noValidate>
          {/* Live Preview Card */}
          <section className="product-preview-card" aria-label={t('addProduct.imagePreview')}>
            <div className="preview-header">
              <span className="preview-badge-label">{t('addProduct.imagePreview')}</span>
              <span
                className={`preview-status-pill ${isAvailable ? 'available' : 'unavailable'}`}
              >
                {isAvailable && <Check size={10} strokeWidth={3} />}
                <span>{isAvailable ? t('status.available') : t('status.unavailable')}</span>
              </span>
            </div>

            <div className="preview-body">
              <MenuProductImage
                type={imageType}
                name={previewName}
                isAvailable={isAvailable}
              />
              <div className="preview-details">
                <span className="preview-category">
                  {category ? t(`categories.${category}`) : t('addProduct.categoryPlaceholder')}
                </span>
                <h3 className="preview-name">{previewName}</h3>
                <span className="preview-price">
                  {previewPrice > 0 ? formatCurrency(previewPrice) : '0 ' + (isArabic ? 'ج.م' : 'EGP')}
                </span>
              </div>
            </div>
          </section>

          {/* Section A: Product Name */}
          <div className="form-section-card">
            <h2 className="section-title">
              {isArabic ? 'بيانات التسمية' : 'Product Names'}
            </h2>

            {/* Arabic Name Input */}
            <div className={`form-field-group ${errors.nameAr ? 'has-error' : ''}`}>
              <label htmlFor="product-name-ar" className="form-field-label">
                <span>{t('addProduct.nameArLabel')}</span>
                <span className="field-required-mark">*</span>
              </label>
              <input
                id="product-name-ar"
                type="text"
                dir="rtl"
                className="form-text-input"
                value={nameAr}
                onChange={(e) => {
                  setNameAr(e.target.value);
                  if (errors.nameAr) setErrors((prev) => ({ ...prev, nameAr: undefined }));
                }}
                placeholder={t('addProduct.nameArPlaceholder')}
                required
              />
              {errors.nameAr && (
                <div className="field-error-text" role="alert">
                  <AlertCircle size={12} className="error-icon" />
                  <span>{errors.nameAr}</span>
                </div>
              )}
            </div>

            {/* English Name Input */}
            <div className={`form-field-group ${errors.nameEn ? 'has-error' : ''}`}>
              <label htmlFor="product-name-en" className="form-field-label">
                <span>{t('addProduct.nameEnLabel')}</span>
                <span className="field-required-mark">*</span>
              </label>
              <input
                id="product-name-en"
                type="text"
                dir="ltr"
                className="form-text-input"
                value={nameEn}
                onChange={(e) => {
                  setNameEn(e.target.value);
                  if (errors.nameEn) setErrors((prev) => ({ ...prev, nameEn: undefined }));
                }}
                placeholder={t('addProduct.nameEnPlaceholder')}
                required
              />
              {errors.nameEn && (
                <div className="field-error-text" role="alert">
                  <AlertCircle size={12} className="error-icon" />
                  <span>{errors.nameEn}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section B & C: Category & Price */}
          <div className="form-section-card">
            {/* Category Selector */}
            <div className={`form-field-group ${errors.category ? 'has-error' : ''}`}>
              <label className="form-field-label">
                <span>{t('addProduct.categoryLabel')}</span>
                <span className="field-required-mark">*</span>
              </label>

              <div className="category-select-buttons" role="radiogroup" aria-label={t('addProduct.categoryLabel')}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={category === 'main'}
                  className={`category-select-btn ${category === 'main' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('main');
                    if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                >
                  <Utensils size={15} className="cat-btn-icon" />
                  <span>{t('categories.main')}</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={category === 'appetizers'}
                  className={`category-select-btn ${category === 'appetizers' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('appetizers');
                    if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                >
                  <Salad size={15} className="cat-btn-icon" />
                  <span>{t('categories.appetizers')}</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={category === 'drinks'}
                  className={`category-select-btn ${category === 'drinks' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('drinks');
                    if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                >
                  <CupSoda size={15} className="cat-btn-icon" />
                  <span>{t('categories.drinks')}</span>
                </button>
              </div>

              {errors.category && (
                <div className="field-error-text" role="alert">
                  <AlertCircle size={12} className="error-icon" />
                  <span>{errors.category}</span>
                </div>
              )}
            </div>

            {/* Price Input */}
            <div className={`form-field-group ${errors.price ? 'has-error' : ''}`}>
              <label htmlFor="product-price-input" className="form-field-label">
                <DollarSign size={13} className="field-icon" aria-hidden="true" />
                <span>{t('addProduct.priceLabel')}</span>
                <span className="field-required-mark">*</span>
              </label>
              <div className="price-input-wrapper">
                <input
                  id="product-price-input"
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="0.5"
                  className="form-text-input price-input"
                  value={price}
                  onChange={handlePriceChange}
                  placeholder={t('addProduct.pricePlaceholder')}
                  required
                />
                <span className="price-currency-suffix">
                  {isArabic ? 'ج.م' : 'EGP'}
                </span>
              </div>
              {errors.price && (
                <div className="field-error-text" role="alert">
                  <AlertCircle size={12} className="error-icon" />
                  <span>{errors.price}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section D: Product Image Selector */}
          <div className="form-section-card">
            <div className="form-field-group">
              <label className="form-field-label">
                <ImageIcon size={13} className="field-icon" aria-hidden="true" />
                <span>{t('addProduct.imageLabel')}</span>
              </label>

              <div className="image-type-selector-grid" role="radiogroup" aria-label={t('addProduct.imageLabel')}>
                {SUPPORTED_IMAGE_TYPES.map((type) => {
                  const isSelected = imageType === type;
                  const label = t(`addProduct.images.${type}`);

                  return (
                    <button
                      key={type}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`image-choice-tile ${isSelected ? 'selected' : ''}`}
                      onClick={() => setImageType(type)}
                      aria-label={label}
                    >
                      <MenuProductImage
                        type={type}
                        name={label}
                        isAvailable={true}
                      />
                      <span className="image-choice-label">{label}</span>
                      {isSelected && (
                        <span className="choice-check-badge">
                          <CheckCircle2 size={13} strokeWidth={2.8} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section E: Availability Toggle */}
          <div className="form-section-card availability-section-card">
            <div className="availability-row">
              <div className="availability-info">
                <div className="availability-title-wrap">
                  <span className="availability-title">{t('addProduct.availabilityLabel')}</span>
                  <span
                    className={`product-status-badge ${isAvailable ? 'available' : 'unavailable'}`}
                  >
                    {isAvailable && <Check size={10} strokeWidth={3} />}
                    <span>{isAvailable ? t('status.available') : t('status.unavailable')}</span>
                  </span>
                </div>
                <p className="availability-hint">{t('addProduct.availabilityHint')}</p>
              </div>

              {/* Accessible Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isAvailable}
                className={`menu-toggle-switch add-toggle ${isAvailable ? 'active' : ''}`}
                onClick={() => setIsAvailable((prev) => !prev)}
                aria-label={t('addProduct.availabilityLabel')}
              >
                <span className="menu-toggle-knob" />
              </button>
            </div>
          </div>

          {/* Action Buttons: Save & Cancel */}
          <div className="add-product-actions">
            <button type="submit" className="btn-save-product">
              {t('addProduct.saveBtn')}
            </button>
            <button
              type="button"
              className="btn-cancel-product"
              onClick={onBack}
            >
              {t('addProduct.cancelBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

