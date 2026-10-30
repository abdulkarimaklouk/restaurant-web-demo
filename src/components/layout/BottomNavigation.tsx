import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, UtensilsCrossed, SlidersHorizontal, Settings } from 'lucide-react';
import { useOrderStore } from '../../data/mockStore';
import './BottomNavigation.css';

export type NavTab = 'orders' | 'menu' | 'analytics' | 'settings';

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onShowNotice: (message: string) => void;
  unreadOrdersCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  onShowNotice,
  unreadOrdersCount,
}) => {
  const { t } = useTranslation('common');
  const { counts } = useOrderStore();
  const unreadCount =
    unreadOrdersCount !== undefined ? unreadOrdersCount : counts.pending + counts.new;

  const handleNavClick = (dest: NavTab) => {
    if (dest === 'analytics') {
      onShowNotice(t('nav.analyticsNotice'));
    } else {
      onTabChange(dest);
    }
  };

  return (
    <footer className="bottom-nav-footer" aria-label={t('nav.mainNavAria')}>
      {/* 1. Orders */}
      <button
        type="button"
        className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
        onClick={() => handleNavClick('orders')}
        aria-label={t('nav.orders')}
        aria-current={activeTab === 'orders' ? 'page' : undefined}
      >
        <span className="nav-icon-wrap">
          <ClipboardList size={22} strokeWidth={2} className="nav-icon" />
          {unreadCount > 0 && (
            <span
              className="nav-orders-badge"
              aria-label={t('nav.newOrdersBadge', { count: unreadCount })}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>
      </button>

      {/* 2. Menu */}
      <button
        type="button"
        className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
        onClick={() => handleNavClick('menu')}
        aria-label={t('nav.menu')}
        aria-current={activeTab === 'menu' ? 'page' : undefined}
      >
        <span className="nav-icon-wrap">
          <UtensilsCrossed size={22} strokeWidth={2} className="nav-icon" />
        </span>
      </button>

      {/* 3. Analytics */}
      <button
        type="button"
        className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => handleNavClick('analytics')}
        aria-label={t('nav.analytics')}
        aria-current={activeTab === 'analytics' ? 'page' : undefined}
      >
        <span className="nav-icon-wrap">
          <SlidersHorizontal size={22} strokeWidth={2} className="nav-icon" />
        </span>
      </button>

      {/* 4. Settings */}
      <button
        type="button"
        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => handleNavClick('settings')}
        aria-label={t('nav.settings')}
        aria-current={activeTab === 'settings' ? 'page' : undefined}
      >
        <span className="nav-icon-wrap">
          <Settings size={22} strokeWidth={2} className="nav-icon" />
        </span>
      </button>
    </footer>
  );
};
