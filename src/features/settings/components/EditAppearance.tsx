import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Palette, Sun, Moon, Check, Info } from 'lucide-react';
import { ToastProps } from '../../../components/ui/Toast';
import { useTheme, Theme } from '../../../data/themeStore';
import './EditAppearance.css';

export interface EditAppearanceProps {
  onBack: () => void;
  onShowToast: (message: string, type?: ToastProps['type']) => void;
}

export const EditAppearance: React.FC<EditAppearanceProps> = ({
  onBack,
  onShowToast,
}) => {
  const { t } = useTranslation('settings');
  const { theme, setTheme } = useTheme();

  // Form local state initialized with currently applied theme
  const [selectedTheme, setSelectedTheme] = useState<Theme>(theme);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Persist and apply selected global theme
    setTheme(selectedTheme);
    onShowToast(t('theme.saveSuccess'), 'success');
    onBack();
  };

  return (
    <div className="edit-appearance-view" aria-label={t('theme.pageTitle')}>
      {/* Demo Notice Banner */}
      <div className="demo-notice-bar" role="status">
        <Info size={11} className="notice-icon" aria-hidden="true" />
        <span className="notice-text">{t('demoNotice')}</span>
      </div>

      {/* Header with Back button and Page Title */}
      <header className="edit-appearance-header">
        <button
          type="button"
          className="edit-back-btn"
          onClick={onBack}
          aria-label={t('theme.backAria')}
        >
          <ArrowLeft size={19} className="edit-back-icon" />
        </button>
        <h1 className="edit-appearance-title">{t('theme.pageTitle')}</h1>
      </header>

      {/* Scrollable Content */}
      <div className="edit-appearance-scroll">
        <form onSubmit={handleSubmit} className="edit-appearance-form">
          {/* Info Banner Card */}
          <div className="info-banner-card">
            <div className="info-banner-icon-wrap" aria-hidden="true">
              <Palette size={16} />
            </div>
            <div className="info-banner-content">
              <h2 className="info-banner-title">{t('theme.infoCardTitle')}</h2>
              <p className="info-banner-desc">{t('theme.infoCardDesc')}</p>
            </div>
          </div>

          {/* Theme Selection Radiogroup Card */}
          <div
            className="theme-options-card"
            role="radiogroup"
            aria-label={t('theme.pageTitle')}
          >
            {/* Option 1: Light Mode */}
            <button
              type="button"
              role="radio"
              id="theme-option-light"
              aria-checked={selectedTheme === 'light'}
              className={`theme-option-row ${selectedTheme === 'light' ? 'selected' : ''}`}
              onClick={() => setSelectedTheme('light')}
            >
              <div className="theme-icon-wrap light-icon-wrap" aria-hidden="true">
                <Sun size={18} className="theme-icon" />
              </div>
              <div className="theme-text-group">
                <div className="theme-title-row">
                  <span className="theme-title">{t('theme.lightTitle')}</span>
                  <span className="theme-badge light-badge">{t('theme.lightBadge')}</span>
                </div>
                <p className="theme-description">{t('theme.lightSubtitle')}</p>
              </div>
              <div
                className={`theme-radio-indicator ${selectedTheme === 'light' ? 'active' : ''}`}
                aria-hidden="true"
              >
                {selectedTheme === 'light' && <Check size={12} strokeWidth={2.8} />}
              </div>
            </button>

            <div className="theme-divider" />

            {/* Option 2: Dark Mode */}
            <button
              type="button"
              role="radio"
              id="theme-option-dark"
              aria-checked={selectedTheme === 'dark'}
              className={`theme-option-row ${selectedTheme === 'dark' ? 'selected' : ''}`}
              onClick={() => setSelectedTheme('dark')}
            >
              <div className="theme-icon-wrap dark-icon-wrap" aria-hidden="true">
                <Moon size={18} className="theme-icon" />
              </div>
              <div className="theme-text-group">
                <div className="theme-title-row">
                  <span className="theme-title">{t('theme.darkTitle')}</span>
                  <span className="theme-badge dark-badge">{t('theme.darkBadge')}</span>
                </div>
                <p className="theme-description">{t('theme.darkSubtitle')}</p>
              </div>
              <div
                className={`theme-radio-indicator ${selectedTheme === 'dark' ? 'active' : ''}`}
                aria-hidden="true"
              >
                {selectedTheme === 'dark' && <Check size={12} strokeWidth={2.8} />}
              </div>
            </button>
          </div>

          {/* Form Action Buttons */}
          <div className="edit-actions-container">
            <button type="submit" className="btn-save-changes">
              {t('theme.saveBtn')}
            </button>
            <button
              type="button"
              className="btn-cancel-edit"
              onClick={onBack}
            >
              {t('theme.cancelBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

