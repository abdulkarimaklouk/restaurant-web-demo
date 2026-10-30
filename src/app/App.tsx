import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MobileAppShell } from '../components/layout/MobileAppShell';
import { TopHeader } from '../components/layout/TopHeader';
import { BottomNavigation, NavTab } from '../components/layout/BottomNavigation';
import { OrdersPage } from '../features/orders/OrdersPage';
import { MenuPage } from '../features/menu/MenuPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { Toast, ToastProps } from '../components/ui/Toast';
import { useOrderStore } from '../data/mockStore';
import { useNotificationsStore } from '../data/notificationsStore';
import i18n from '../i18n';
import '../styles/global.css';

export function getNotificationMessage(
  pendingCount: number,
  translate?: (key: string, opts?: any) => string
): string {
  const t = translate || ((key: string, opts?: any) => String(i18n.t(key, opts)));

  if (pendingCount <= 0) {
    return String(t('common:notifications.none'));
  }
  if (pendingCount === 1) {
    return String(t('common:notifications.one'));
  }
  if (pendingCount === 2) {
    return String(t('common:notifications.two'));
  }
  if (pendingCount >= 3 && pendingCount <= 10) {
    return String(t('common:notifications.few', { count: pendingCount }));
  }
  return String(t('common:notifications.many', { count: pendingCount }));
}

export function App() {
  const { t } = useTranslation('common');
  const { counts } = useOrderStore();
  const { preferences } = useNotificationsStore();
  const [activeTab, setActiveTab] = useState<NavTab>('orders');
  const [toast, setToast] = useState<{
    message: string;
    type?: ToastProps['type'];
  } | null>(null);

  const showToast = (message: string, type: ToastProps['type'] = 'info') => {
    setToast({ message, type });
  };

  const handleSearchClick = () => {
    showToast(t('header.searchNotice'), 'info');
  };

  const handleNotificationsClick = () => {
    if (!preferences.newOrdersEnabled) {
      return;
    }
    showToast(getNotificationMessage(counts.pending, (k, o) => String(t(k, o))), 'info');
  };

  return (
    <MobileAppShell>
      {/* Top Bar with Restaurant Identity & Actions */}
      <TopHeader
        onSearchClick={handleSearchClick}
        onNotificationsClick={handleNotificationsClick}
        hasNotifications={preferences.newOrdersEnabled && counts.pending > 0}
      />

      {/* Primary Approved Screens */}
      {activeTab === 'orders' && <OrdersPage onShowToast={showToast} />}
      {activeTab === 'menu' && <MenuPage onShowToast={showToast} />}
      {activeTab === 'settings' && <SettingsPage onShowToast={showToast} />}

      {/* Full-width Edge-to-Edge Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onShowNotice={(msg) => showToast(msg, 'info')}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </MobileAppShell>
  );
}

export default App;
