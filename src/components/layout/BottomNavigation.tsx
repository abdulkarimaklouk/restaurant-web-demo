import React from 'react';
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
  const { counts } = useOrderStore();
  const unreadCount =
    unreadOrdersCount !== undefined ? unreadOrdersCount : counts.pending + counts.new;

  const handleNavClick = (dest: NavTab) => {
    if (dest === 'menu') {
      onShowNotice('سيتم تفعيل قسم إدارة القائمة في المرحلة التالية');
    } else if (dest === 'analytics') {
      onShowNotice('سيتم تفعيل قسم أدوات العرض التوضيحي في المرحلة التالية');
    } else {
      onTabChange(dest);
    }
  };

  return (
    <footer className="bottom-nav-footer" aria-label="شريط التنقل الرئيسي">
      {/* 1. Orders */}
      <button
        type="button"
        className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
        onClick={() => handleNavClick('orders')}
        aria-label="الطلبات"
        aria-current={activeTab === 'orders' ? 'page' : undefined}
      >
        <span className="nav-icon-wrap">
          <ClipboardList size={22} strokeWidth={2} className="nav-icon" />
          {unreadCount > 0 && (
            <span className="nav-orders-badge" aria-label={`${unreadCount} طلبات جديدة`}>
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
        aria-label="القائمة"
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
        aria-label="التحليلات"
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
        aria-label="الإعدادات"
        aria-current={activeTab === 'settings' ? 'page' : undefined}
      >
        <span className="nav-icon-wrap">
          <Settings size={22} strokeWidth={2} className="nav-icon" />
        </span>
      </button>
    </footer>
  );
};
