import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Order, OrderViewTab } from '../../types/order';
import { useOrderStore } from '../../data/mockStore';
import { useNotificationsStore } from '../../data/notificationsStore';
import { OrderTabs } from './components/OrderTabs';
import { OrderCard } from './components/OrderCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { SummaryModal } from '../../components/ui/SummaryModal';
import { Info } from 'lucide-react';
import './OrdersPage.css';

interface OrdersPageProps {
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onShowToast }) => {
  const { t } = useTranslation('orders');
  const { getOrdersByTab, counts, advanceOrder } = useOrderStore();
  const { preferences } = useNotificationsStore();
  const [activeTab, setActiveTab] = useState<OrderViewTab>('pending');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const currentOrders = getOrdersByTab(activeTab);

  const handleAdvance = (order: Order) => {
    const prevPayment = order.paymentStatus;
    const prevOperational = order.operationalStatus;

    const result = advanceOrder(order.id);
    if (result.success) {
      if (prevPayment === 'pendingConfirmation') {
        if (preferences.paymentConfirmationsEnabled) {
          onShowToast(
            t('toasts.paymentConfirmed', { orderNumber: order.orderNumber }),
            'success'
          );
        }
      } else if (prevOperational === 'newOrder') {
        onShowToast(
          t('toasts.prepStarted', { orderNumber: order.orderNumber }),
          'success'
        );
      } else if (prevOperational === 'preparing') {
        onShowToast(
          t('toasts.orderReady', { orderNumber: order.orderNumber }),
          'success'
        );
      } else if (prevOperational === 'ready') {
        onShowToast(
          t('toasts.orderDelivered', { orderNumber: order.orderNumber }),
          'success'
        );
      }
    } else if (result.errorMessage) {
      onShowToast(result.errorMessage, 'warning');
    }
  };

  const handleCardClick = (order: Order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="orders-page">
      {/* Demo Notice Banner per WEB_DEMO_SPEC */}
      <aside className="demo-notice-bar" aria-label={t('demoNotice')}>
        <Info size={14} className="notice-icon" />
        <span className="notice-text">{t('demoNotice')}</span>
      </aside>

      {/* Main Page Title */}
      <div className="orders-page-header">
        <h1 className="orders-title">{t('pageTitle')}</h1>
      </div>

      {/* Status Filter Tabs */}
      <OrderTabs
        activeTab={activeTab}
        counts={counts}
        onTabChange={setActiveTab}
      />

      {/* Orders Scrollable List */}
      <main className="orders-list-scroll">
        {currentOrders.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="orders-cards-container">
            {currentOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAdvance={handleAdvance}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Order Review & Payment Inspection Modal */}
      <SummaryModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAction={handleAdvance}
      />
    </div>
  );
};
