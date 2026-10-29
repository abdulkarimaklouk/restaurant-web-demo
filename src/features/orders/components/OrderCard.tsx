import React from 'react';
import {
  ShoppingBag,
  User,
  Coins,
  Clock,
  FileSearch,
  ChefHat,
  CheckCircle2,
  Package,
  Check,
} from 'lucide-react';
import { Order } from '../../../types/order';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getCardActionInfo } from '../orderTransitions';
import './OrderCard.css';

interface OrderCardProps {
  order: Order;
  onAdvance: (order: Order) => void;
  onCardClick: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onAdvance,
  onCardClick,
}) => {
  const actionInfo = getCardActionInfo(order);

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent duplicate card click event
    if (actionInfo.opensModal) {
      // Pending-payment orders: open the order review modal
      onCardClick(order);
    } else if (!actionInfo.disabled) {
      // Confirmed operational transitions: advance state directly
      onAdvance(order);
    }
  };

  const renderStatusBadge = () => {
    if (order.paymentStatus === 'pendingConfirmation') {
      return (
        <span className="status-badge new">
          <Clock size={12} className="badge-icon" />
          <span>جديد</span>
        </span>
      );
    }

    switch (order.operationalStatus) {
      case 'newOrder':
        return (
          <span className="status-badge new">
            <Clock size={12} className="badge-icon" />
            <span>مؤكد</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="status-badge preparing">
            <ChefHat size={12} className="badge-icon" />
            <span>تحضير</span>
          </span>
        );
      case 'ready':
        return (
          <span className="status-badge ready">
            <CheckCircle2 size={12} className="badge-icon" />
            <span>جاهز</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="status-badge delivered">
            <Package size={12} className="badge-icon" />
            <span>مستلم</span>
          </span>
        );
    }
  };

  const renderActionIcon = () => {
    if (order.paymentStatus === 'pendingConfirmation') {
      return <FileSearch size={17} className="btn-icon" />;
    }
    switch (order.operationalStatus) {
      case 'newOrder':
        return <ChefHat size={17} className="btn-icon" />;
      case 'preparing':
        return <CheckCircle2 size={17} className="btn-icon" />;
      case 'ready':
        return <Package size={17} className="btn-icon" />;
      case 'delivered':
        return <Check size={17} className="btn-icon" />;
    }
  };

  const totalItemsCount = order.items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <article
      className="order-card"
      onClick={() => onCardClick(order)}
      tabIndex={0}
      role="button"
      aria-label={`تفاصيل الطلب رقم ${order.orderNumber}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onCardClick(order);
        }
      }}
    >
      {/* Top 3-Zone Row */}
      <div className="card-top-row">
        {/* Zone 1: Order Metadata (Right in RTL) */}
        <div className="zone-metadata">
          <span className="order-time">{order.formattedRelativeTime}</span>
          <span className="order-number">{order.orderNumber}</span>
          <div className="order-items-count">
            <ShoppingBag size={12} className="bag-icon" />
            <span>{totalItemsCount} {totalItemsCount === 1 ? 'عنصر' : 'عناصر'}</span>
          </div>
        </div>

        {/* Zone 2: Customer Information (Center) - Student specialization removed */}
        <div className="zone-customer">
          <div className="avatar-circle">
            <User size={18} className="avatar-icon" />
          </div>
          <div className="customer-text">
            <span className="customer-name">{order.studentName}</span>
            <div className="coins-pill">
              <Coins size={11} className="coins-icon" />
              <span>+{order.coins} عملة</span>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="zone-divider"></div>

        {/* Zone 3: Status & Total (Left in RTL) */}
        <div className="zone-pricing">
          {renderStatusBadge()}
          <div className="pricing-box">
            <span className="total-label">الإجمالي</span>
            <span className="total-amount">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="card-action-row">
        <button
          type="button"
          className={`card-action-btn ${actionInfo.variant}`}
          onClick={handleActionClick}
          disabled={actionInfo.disabled}
        >
          {renderActionIcon()}
          <span>{actionInfo.label}</span>
        </button>
      </div>
    </article>
  );
};
