import React, { useState } from 'react';
import { Order, OrderViewTab } from '../../types/order';
import { useOrderStore } from '../../data/mockStore';
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
  const { getOrdersByTab, counts, advanceOrder } = useOrderStore();
  const [activeTab, setActiveTab] = useState<OrderViewTab>('pending');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const currentOrders = getOrdersByTab(activeTab);

  const handleAdvance = (order: Order) => {
    const prevPayment = order.paymentStatus;
    const prevOperational = order.operationalStatus;

    const result = advanceOrder(order.id);
    if (result.success) {
      if (prevPayment === 'pendingConfirmation') {
        onShowToast(`تم تأكيد دفع الطلب ${order.orderNumber} بنجاح وتم نقله إلى الطلبات الجديدة`, 'success');
      } else if (prevOperational === 'newOrder') {
        onShowToast(`تم بدء تحضير الطلب ${order.orderNumber} في المطبخ`, 'success');
      } else if (prevOperational === 'preparing') {
        onShowToast(`أصبح الطلب ${order.orderNumber} جاهزاً للاستلام الآن`, 'success');
      } else if (prevOperational === 'ready') {
        onShowToast(`تم تسليم الطلب ${order.orderNumber} للطالب بنجاح`, 'success');
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
      <aside className="demo-notice-bar" aria-label="تنبيه النسخة التجريبية">
        <Info size={14} className="notice-icon" />
        <span className="notice-text">
          نسخة تجريبية لجامعة المستقبل • جميع بيانات الطلاب والمدفوعات افتراضية
        </span>
      </aside>

      {/* Main Page Title */}
      <div className="orders-page-header">
        <h1 className="orders-title">الطلبات</h1>
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

