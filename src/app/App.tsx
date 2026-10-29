import { useState } from 'react';
import { MobileAppShell } from '../components/layout/MobileAppShell';
import { TopHeader } from '../components/layout/TopHeader';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { OrdersPage } from '../features/orders/OrdersPage';
import { Toast, ToastProps } from '../components/ui/Toast';
import '../styles/global.css';

export function App() {
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
    showToast('مركز التنبيهات: لديك طلبات جديدة بانتظار التأكيد', 'info');
  };

  return (
    <MobileAppShell>
      {/* Top Bar with Restaurant Identity & Actions */}
      <TopHeader
        onSearchClick={handleSearchClick}
        onNotificationsClick={handleNotificationsClick}
      />

      {/* Primary Approved Screen: Orders Dashboard */}
      <OrdersPage onShowToast={showToast} />

      {/* Floating Bottom Navigation */}
      <BottomNavigation onShowNotice={(msg) => showToast(msg, 'info')} />

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

