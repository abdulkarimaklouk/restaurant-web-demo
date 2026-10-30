import React from 'react';
import { useTranslation } from 'react-i18next';
import { Store, ChevronDown, Search, Bell } from 'lucide-react';
import { useRestaurantProfileStore } from '../../data/restaurantProfileStore';
import { useWorkingHoursStore, formatTime12h } from '../../data/workingHoursStore';
import './TopHeader.css';

interface TopHeaderProps {
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
  hasNotifications?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onSearchClick,
  onNotificationsClick,
  hasNotifications = false,
}) => {
  const { t, i18n } = useTranslation('common');
  const { profile } = useRestaurantProfileStore();
  const { getEffectiveStatus } = useWorkingHoursStore();

  const isArabic = (i18n.resolvedLanguage || i18n.language || 'ar').startsWith('ar');
  const effectiveStatus = getEffectiveStatus(profile.isOpen);

  let statusText = '';
  if (!profile.isOpen) {
    statusText = t('brandStatusClosed');
  } else if (!effectiveStatus.isEffectiveOpen) {
    statusText = t('brandStatusOutsideHours');
  } else {
    const closeTimeStr = effectiveStatus.activeShiftClosingTime || '23:00';
    const formattedClose = formatTime12h(closeTimeStr, isArabic);
    statusText = t('brandStatusOpenDynamic', { time: formattedClose });
  }

  return (
    <header className="top-header">
      {/* Restaurant Info */}
      <div className="header-brand">
        <div className="brand-logo-container">
          <Store size={22} className="brand-icon" />
        </div>
        <div className="brand-details">
          <div className="brand-title-row">
            <span className="brand-name">{profile.name}</span>
            <ChevronDown size={15} className="brand-chevron" />
          </div>
          <div className="brand-status-row">
            <span className={`status-dot ${effectiveStatus.isEffectiveOpen ? 'open' : 'closed'}`}></span>
            <span className="status-text">{statusText}</span>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        <button
          type="button"
          className="header-action-btn"
          aria-label={t('header.searchAria')}
          onClick={onSearchClick}
        >
          <Search size={21} className="action-icon" />
        </button>
        <button
          type="button"
          className="header-action-btn bell-btn"
          aria-label={t('header.notificationsAria')}
          onClick={onNotificationsClick}
        >
          <Bell size={21} className="action-icon" />
          {hasNotifications && <span className="notification-badge-dot"></span>}
        </button>
      </div>
    </header>
  );
};
