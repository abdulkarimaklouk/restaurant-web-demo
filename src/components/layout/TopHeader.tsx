import React from 'react';
import { Store, ChevronDown, Search, Bell } from 'lucide-react';
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
  return (
    <header className="top-header">
      {/* Restaurant Info (Right side in RTL) */}
      <div className="header-brand">
        <div className="brand-logo-container">
          <Store size={22} className="brand-icon" />
        </div>
        <div className="brand-details">
          <div className="brand-title-row">
            <span className="brand-name">مطعم الأطايب</span>
            <ChevronDown size={15} className="brand-chevron" />
          </div>
          <div className="brand-status-row">
            <span className="status-dot"></span>
            <span className="status-text">مفتوح • يغلق 11:00 م</span>
          </div>
        </div>
      </div>

      {/* Header Actions (Left side in RTL) */}
      <div className="header-actions">
        <button
          type="button"
          className="header-action-btn"
          aria-label="بحث"
          onClick={onSearchClick}
        >
          <Search size={21} className="action-icon" />
        </button>
        <button
          type="button"
          className="header-action-btn bell-btn"
          aria-label="الإشعارات"
          onClick={onNotificationsClick}
        >
          <Bell size={21} className="action-icon" />
          {hasNotifications && <span className="notification-badge-dot"></span>}
        </button>
      </div>
    </header>
  );
};

