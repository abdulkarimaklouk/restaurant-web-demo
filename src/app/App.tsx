import { useState } from 'react';
import { MobileAppShell } from '../components/layout/MobileAppShell';
import { TopHeader } from '../components/layout/TopHeader';
import { BottomNavigation, NavTab } from '../components/layout/BottomNavigation';
import { OrdersPage } from '../features/orders/OrdersPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { Toast, ToastProps } from '../components/ui/Toast';
import { useOrderStore } from '../data/mockStore';
import '../styles/global.css';

export function getNotificationMessage(pendingCount: number): string {
  if (pendingCount <= 0) {
    return 'لا توجد إشعارات جديدة';
  }
  if (pendingCount === 1) {
    return 'مركز التنبيهات: لديك طلب واحد جديد بانتظار تأكيد الدفع';
  }
  if (pendingCount === 2) {
    return 'مركز التنبيهات: لديك طلبان جديدان بانتظار تأكيد الدفع';
  }
  if (pendingCount >= 3 && pendingCount <= 10) {
    return `مركز التنبيهات: لديك ${pendingCount} طلبات جديدة بانتظار تأكيد الدفع`;
  }
  return `مركز التنبيهات: لديك ${pendingCount} طلباً جديداً بانتظار تأكيد الدفع`;
}

export function App() {
  const { counts } = useOrderStore();
  const [activeTab, setActiveTab] = useState<NavTab>('orders');
  const [toast, setToast] = useState<{
    message: string;
    type?: ToastProps['type'];
  } | null>(null);

  const showToast = (message: string, type: ToastProps['type'] = 'info') => {
    setToast({ message, type });
  };

  const handleSearchClick = () => {
    showToast('خاصية البحث السريع ستتوفر مع استكمال بقية الشاشات', 'info');
  };

  const handleNotificationsClick = () => {
    showToast(getNotificationMessage(counts.pending), 'info');
  };

  return (
    <MobileAppShell>
      {/* Top Bar with Restaurant Identity & Actions */}
      <TopHeader
        onSearchClick={handleSearchClick}
        onNotificationsClick={handleNotificationsClick}
        hasNotifications={counts.pending > 0}
      />

      {/* Primary Approved Screens */}
      {activeTab === 'orders' && <OrdersPage onShowToast={showToast} />}
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
