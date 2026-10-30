import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bell, CheckCircle2, Info } from 'lucide-react';
import { ToastProps } from '../../../components/ui/Toast';
import { useNotificationsStore } from '../../../data/notificationsStore';
import './EditNotifications.css';

export interface EditNotificationsProps {
  onBack: () => void;
  onShowToast: (message: string, type?: ToastProps['type']) => void;
}

export const EditNotifications: React.FC<EditNotificationsProps> = ({
  onBack,
  onShowToast,
}) => {
  const { t } = useTranslation('settings');
  const { preferences, updatePreferences } = useNotificationsStore();

  // Local form state initialized with saved preferences from store
  const [newOrdersEnabled, setNewOrdersEnabled] = useState(
    preferences.newOrdersEnabled
  );
  const [paymentConfirmationsEnabled, setPaymentConfirmationsEnabled] = useState(
    preferences.paymentConfirmationsEnabled
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Persist preferences to store and localStorage
    updatePreferences({
      newOrdersEnabled,
      paymentConfirmationsEnabled,
    });

    onShowToast(t('notifications.saveSuccess'), 'success');
    onBack();
  };

  return (
    <div className="edit-notifications-view" aria-label={t('notifications.pageTitle')}>
      {/* Demo Notice Banner */}
      <div className="demo-notice-bar" role="status">
        <Info size={11} className="notice-icon" aria-hidden="true" />
        <span className="notice-text">{t('demoNotice')}</span>
      </div>

      {/* Header with Back button and Page Title */}
      <header className="edit-notifications-header">
        <button
          type="button"
          className="edit-back-btn"
          onClick={onBack}
          aria-label={t('notifications.backAria')}
        >
          <ArrowLeft size={19} className="edit-back-icon" />
        </button>
        <h1 className="edit-notifications-title">{t('notifications.pageTitle')}</h1>
      </header>

      {/* Scrollable Content */}
      <div className="edit-notifications-scroll">
        <form onSubmit={handleSubmit} className="edit-notifications-form">
          {/* Info Banner Card */}
          <div className="info-banner-card">
            <div className="info-banner-icon-wrap" aria-hidden="true">
              <Bell size={16} />
            </div>
            <div className="info-banner-content">
              <h2 className="info-banner-title">{t('notifications.infoCardTitle')}</h2>
              <p className="info-banner-desc">{t('notifications.infoCardDesc')}</p>
            </div>
          </div>

          {/* Notification Options Card */}
          <div className="notifications-options-card">
            {/* Option 1: New Orders Notifications */}
            <div className="notification-option-row">
              <div className="option-icon-wrap" aria-hidden="true">
                <Bell size={18} className="option-icon" />
              </div>
              <div className="option-text-group">
                <div className="option-title-row">
                  <span className="option-title">{t('notifications.newOrdersTitle')}</span>
                  <span
                    className={`option-status-badge ${newOrdersEnabled ? 'enabled' : 'disabled'}`}
                  >
                    {newOrdersEnabled
                      ? t('notifications.statusEnabled')
                      : t('notifications.statusDisabled')}
                  </span>
                </div>
                <p className="option-description">{t('notifications.newOrdersDesc')}</p>
              </div>
              <button
                type="button"
                role="switch"
                id="toggle-new-orders"
                aria-checked={newOrdersEnabled}
                className={`notification-toggle-switch ${newOrdersEnabled ? 'active' : ''}`}
                onClick={() => setNewOrdersEnabled((prev) => !prev)}
                aria-label={t('notifications.toggleAria', {
                  title: t('notifications.newOrdersTitle'),
                })}
              >
                <span className="toggle-knob" />
              </button>
            </div>

            <div className="option-divider" />

            {/* Option 2: Payment Confirmation Notifications */}
            <div className="notification-option-row">
              <div className="option-icon-wrap" aria-hidden="true">
                <CheckCircle2 size={18} className="option-icon" />
              </div>
              <div className="option-text-group">
                <div className="option-title-row">
                  <span className="option-title">
                    {t('notifications.paymentConfirmationsTitle')}
                  </span>
                  <span
                    className={`option-status-badge ${
                      paymentConfirmationsEnabled ? 'enabled' : 'disabled'
                    }`}
                  >
                    {paymentConfirmationsEnabled
                      ? t('notifications.statusEnabled')
                      : t('notifications.statusDisabled')}
                  </span>
                </div>
                <p className="option-description">
                  {t('notifications.paymentConfirmationsDesc')}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                id="toggle-payment-confirmations"
                aria-checked={paymentConfirmationsEnabled}
                className={`notification-toggle-switch ${
                  paymentConfirmationsEnabled ? 'active' : ''
                }`}
                onClick={() => setPaymentConfirmationsEnabled((prev) => !prev)}
                aria-label={t('notifications.toggleAria', {
                  title: t('notifications.paymentConfirmationsTitle'),
                })}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="edit-actions-container">
            <button type="submit" className="btn-save-changes">
              {t('notifications.saveBtn')}
            </button>
            <button
              type="button"
              className="btn-cancel-edit"
              onClick={onBack}
            >
              {t('notifications.cancelBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

