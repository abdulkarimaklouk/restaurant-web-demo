import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, Info, Phone, MessageSquare, Mail } from 'lucide-react';
import { ToastProps } from '../../../components/ui/Toast';
import './EditRestaurantInfo.css';

export interface EditRestaurantInfoProps {
  onBack: () => void;
  onShowToast: (message: string, type?: ToastProps['type']) => void;
}

export const EditRestaurantInfo: React.FC<EditRestaurantInfoProps> = ({
  onBack,
  onShowToast,
}) => {
  const { t, i18n } = useTranslation('settings');
  const isArabic = (i18n.resolvedLanguage || i18n.language || 'ar').startsWith('ar');

  // Form local state initialized with reasonable demo values
  const [phoneNumber, setPhoneNumber] = useState(
    isArabic ? '0100 123 4567' : '+20 100 123 4567'
  );
  const [address, setAddress] = useState(
    isArabic
      ? 'مجمع الخدمات الطلابية - مبنى ج - كشك رقم 4'
      : 'Student Services Center, Building C - Counter #4'
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    isArabic ? '0100 123 4567' : '+20 100 123 4567'
  );
  const [emailAddress, setEmailAddress] = useState('contact@goodfood-campus.eg');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPhone = phoneNumber.trim();
    const trimmedAddress = address.trim();
    const trimmedWhatsapp = whatsappNumber.trim();
    const trimmedEmail = emailAddress.trim();

    if (!trimmedPhone) {
      onShowToast(t('restaurantInfo.phoneRequired'), 'warning');
      return;
    }

    if (!trimmedAddress) {
      onShowToast(t('restaurantInfo.addressRequired'), 'warning');
      return;
    }

    if (!trimmedWhatsapp) {
      onShowToast(t('restaurantInfo.whatsappRequired'), 'warning');
      return;
    }

    if (!trimmedEmail) {
      onShowToast(t('restaurantInfo.emailRequired'), 'warning');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      onShowToast(t('restaurantInfo.emailInvalid'), 'warning');
      return;
    }

    // In Phase 1, UI-only with local state: display success feedback and return
    onShowToast(t('restaurantInfo.saveSuccess'), 'success');
    onBack();
  };

  return (
    <div className="edit-info-view" aria-label={t('restaurantInfo.pageTitle')}>
      {/* Demo Notice Banner */}
      <div className="demo-notice-bar" role="status">
        <Info size={11} className="notice-icon" aria-hidden="true" />
        <span className="notice-text">{t('demoNotice')}</span>
      </div>

      {/* Header with Back button and Page Title */}
      <header className="edit-info-header">
        <button
          type="button"
          className="edit-back-btn"
          onClick={onBack}
          aria-label={t('restaurantInfo.backAria')}
        >
          <ArrowLeft size={19} className="edit-back-icon" />
        </button>
        <h1 className="edit-info-title">{t('restaurantInfo.pageTitle')}</h1>
      </header>

      {/* Scrollable Form Content */}
      <div className="edit-info-scroll">
        <form onSubmit={handleSubmit} className="edit-info-form" noValidate>
          {/* Info Banner Card */}
          <div className="info-banner-card">
            <div className="info-banner-icon-wrap" aria-hidden="true">
              <Building2 size={16} />
            </div>
            <div className="info-banner-content">
              <h2 className="info-banner-title">{t('restaurantInfo.infoCardTitle')}</h2>
              <p className="info-banner-desc">{t('restaurantInfo.infoCardDesc')}</p>
            </div>
          </div>

          {/* Form Fields Card */}
          <div className="edit-form-card">
            {/* Field 1: Phone Number */}
            <div className="form-field-group">
              <label htmlFor="restaurant-phone-field" className="form-field-label">
                <Phone size={13} className="field-icon" aria-hidden="true" />
                <span>{t('restaurantInfo.phoneLabel')}</span>
                <span className="field-required-mark">*</span>
              </label>
              <input
                id="restaurant-phone-field"
                type="tel"
                inputMode="tel"
                className="form-text-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t('restaurantInfo.phonePlaceholder')}
                required
              />
            </div>

            {/* Field 2: Restaurant Address */}
            <div className="form-field-group">
              <label htmlFor="restaurant-address-field" className="form-field-label">
                <Building2 size={13} className="field-icon" aria-hidden="true" />
                <span>{t('restaurantInfo.addressLabel')}</span>
                <span className="field-required-mark">*</span>
              </label>
              <input
                id="restaurant-address-field"
                type="text"
                className="form-text-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('restaurantInfo.addressPlaceholder')}
                required
              />
            </div>

            {/* Field 3: WhatsApp Number */}
            <div className="form-field-group">
              <label htmlFor="restaurant-whatsapp-field" className="form-field-label">
                <MessageSquare size={13} className="field-icon" aria-hidden="true" />
                <span>{t('restaurantInfo.whatsappLabel')}</span>
                <span className="field-required-mark">*</span>
              </label>
              <input
                id="restaurant-whatsapp-field"
                type="tel"
                inputMode="tel"
                className="form-text-input"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder={t('restaurantInfo.whatsappPlaceholder')}
                required
              />
            </div>

            {/* Field 4: Email Address */}
            <div className="form-field-group">
              <label htmlFor="restaurant-email-field" className="form-field-label">
                <Mail size={13} className="field-icon" aria-hidden="true" />
                <span>{t('restaurantInfo.emailLabel')}</span>
                <span className="field-required-mark">*</span>
              </label>
              <input
                id="restaurant-email-field"
                type="email"
                inputMode="email"
                className="form-text-input"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder={t('restaurantInfo.emailPlaceholder')}
                required
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="edit-actions-container">
            <button type="submit" className="btn-save-changes">
              {t('restaurantInfo.saveBtn')}
            </button>
            <button
              type="button"
              className="btn-cancel-edit"
              onClick={onBack}
            >
              {t('restaurantInfo.cancelBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

