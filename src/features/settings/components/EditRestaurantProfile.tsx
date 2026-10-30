import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Store, ShieldCheck, Info } from 'lucide-react';
import { ToastProps } from '../../../components/ui/Toast';
import './EditRestaurantProfile.css';

export interface EditRestaurantProfileProps {
  onBack: () => void;
  onShowToast: (message: string, type?: ToastProps['type']) => void;
}

export const EditRestaurantProfile: React.FC<EditRestaurantProfileProps> = ({
  onBack,
  onShowToast,
}) => {
  const { t } = useTranslation('settings');

  // Form local state initialized with current restaurant values
  const [restaurantName, setRestaurantName] = useState(t('profile.name'));
  const [branchLocation, setBranchLocation] = useState(t('editProfile.initialBranch'));
  const [isOpen, setIsOpen] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantName.trim()) {
      onShowToast(t('editProfile.nameRequired'), 'warning');
      return;
    }

    if (!branchLocation.trim()) {
      onShowToast(t('editProfile.branchRequired'), 'warning');
      return;
    }

    // Phase 1: UI implementation only. Notify user that full app-wide sync will be wired in Phase 2
    onShowToast(t('editProfile.saveNotice'), 'info');
    onBack();
  };

  return (
    <div className="edit-profile-view" aria-label={t('editProfile.pageTitle')}>
      {/* Demo Notice Banner */}
      <div className="demo-notice-bar" role="status">
        <Info size={11} className="notice-icon" aria-hidden="true" />
        <span className="notice-text">{t('demoNotice')}</span>
      </div>

      {/* View Header with Back button and Page Title */}
      <header className="edit-profile-header">
        <button
          type="button"
          className="edit-back-btn"
          onClick={onBack}
          aria-label={t('editProfile.backAria')}
        >
          <ArrowLeft size={19} className="edit-back-icon" />
        </button>
        <h1 className="edit-profile-title">{t('editProfile.pageTitle')}</h1>
      </header>

      {/* Scrollable Form Content */}
      <div className="edit-profile-scroll">
        <form onSubmit={handleSubmit} className="edit-profile-form" noValidate>
          {/* Read-only Verification & Brand Card */}
          <div className="profile-identity-card">
            <div className="profile-logo-wrap">
              <Store size={22} className="profile-store-icon" />
            </div>
            <div className="profile-identity-info">
              <span className="profile-preview-name">{restaurantName || t('profile.name')}</span>
              <div className="verification-pill-badge">
                <ShieldCheck size={13} className="shield-icon" />
                <span>{t('editProfile.verificationBadge')}</span>
              </div>
            </div>
          </div>

          <p className="verification-caption">
            <Info size={12} className="caption-icon" />
            <span>{t('editProfile.verificationNote')}</span>
          </p>

          {/* Form Fields Card */}
          <div className="edit-form-card">
            {/* Field 1: Restaurant Name */}
            <div className="form-field-group">
              <label htmlFor="restaurant-name-field" className="form-field-label">
                {t('editProfile.nameLabel')}
                <span className="field-required-mark">*</span>
              </label>
              <input
                id="restaurant-name-field"
                type="text"
                className="form-text-input"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder={t('editProfile.namePlaceholder')}
                required
              />
            </div>

            {/* Field 2: Branch / Location */}
            <div className="form-field-group">
              <label htmlFor="restaurant-branch-field" className="form-field-label">
                {t('editProfile.branchLabel')}
                <span className="field-required-mark">*</span>
              </label>
              <input
                id="restaurant-branch-field"
                type="text"
                className="form-text-input"
                value={branchLocation}
                onChange={(e) => setBranchLocation(e.target.value)}
                placeholder={t('editProfile.branchPlaceholder')}
                required
              />
            </div>

            {/* Field 3: Operational Status */}
            <div className="form-field-group">
              <label className="form-field-label">
                {t('editProfile.statusLabel')}
                <span className="field-required-mark">*</span>
              </label>
              <div
                className="status-toggle-card"
                role="radiogroup"
                aria-label={t('editProfile.statusLabel')}
              >
                {/* Open Option */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={isOpen}
                  className={`status-option-btn ${isOpen ? 'selected open' : ''}`}
                  onClick={() => setIsOpen(true)}
                >
                  <span className="status-indicator-dot open-dot" />
                  <div className="status-option-text">
                    <span className="status-option-title">{t('editProfile.statusOpen')}</span>
                    <span className="status-option-sub">{t('editProfile.statusOpenSubtext')}</span>
                  </div>
                </button>

                {/* Closed Option */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={!isOpen}
                  className={`status-option-btn ${!isOpen ? 'selected closed' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="status-indicator-dot closed-dot" />
                  <div className="status-option-text">
                    <span className="status-option-title">{t('editProfile.statusClosed')}</span>
                    <span className="status-option-sub">{t('editProfile.statusClosedSubtext')}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="edit-actions-container">
            <button type="submit" className="btn-save-changes">
              {t('editProfile.saveBtn')}
            </button>
            <button
              type="button"
              className="btn-cancel-edit"
              onClick={onBack}
            >
              {t('editProfile.cancelBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

