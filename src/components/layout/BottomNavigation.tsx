import React from 'react';
import { ClipboardList, UtensilsCrossed, SlidersHorizontal } from 'lucide-react';
import './BottomNavigation.css';

interface BottomNavigationProps {
  onShowNotice: (message: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ onShowNotice }) => {
  const handleNavClick = (dest: 'orders' | 'menu' | 'tools') => {
    if (dest === 'menu') {
      onShowNotice('سيتم تفعيل قسم إدارة القائمة في المرحلة التالية');
    } else if (dest === 'tools') {
      onShowNotice('سيتم تفعيل قسم أدوات العرض التوضيحي في المرحلة التالية');
    }
  };

  return (
    <nav className="bottom-nav-container" aria-label="شريط التنقل الرئيسي">
      <div className="bottom-nav-pill">
        {/* Orders Tab (Always Active in this phase) */}
        <button
          type="button"
          className="nav-item active"
          onClick={() => handleNavClick('orders')}
          aria-current="page"
        >
          <ClipboardList size={18} className="nav-icon" />
          <span className="nav-label">الطلبات</span>
        </button>

        {/* Menu Tab */}
        <button
          type="button"
          className="nav-item"
          onClick={() => handleNavClick('menu')}
        >
          <UtensilsCrossed size={18} className="nav-icon" />
          <span className="nav-label">القائمة</span>
        </button>

        {/* Demo Tools Tab */}
        <button
          type="button"
          className="nav-item"
          onClick={() => handleNavClick('tools')}
        >
          <SlidersHorizontal size={18} className="nav-icon" />
          <span className="nav-label">أدوات العرض</span>
        </button>
      </div>
    </nav>
  );
};
