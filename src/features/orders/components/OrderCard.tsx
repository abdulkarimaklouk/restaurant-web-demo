import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { formatRelativeTime } from '../../../utils/formatRelativeTime';
import { getLocalizedStudentName } from '../../../utils/localizeOrder';
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
  const { t } = useTranslation(['orders', 'common']);
  const actionInfo = getCardActionInfo(order, (k) => t(k as any));

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (actionInfo.opensModal) {
      onCardClick(order);
    } else if (!actionInfo.disabled) {
      onAdvance(order);
    }
  };

  const renderStatusBadge = () => {
    if (order.paymentStatus === 'pendingConfirmation') {
      return (
        <span className="status-badge new">
          <Clock size={12} className="badge-icon" />
          <span>{t('orders:card.status.new')}</span>
        </span>
      );
    }

    switch (order.operationalStatus) {
      case 'newOrder':
        return (
          <span className="status-badge new">
            <Clock size={12} className="badge-icon" />
            <span>{t('orders:card.status.confirmed')}</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="status-badge preparing">
            <ChefHat size={12} className="badge-icon" />
            <span>{t('orders:card.status.preparing')}</span>
          </span>
        );
      case 'ready':
        return (
          <span className="status-badge ready">
            <CheckCircle2 size={12} className="badge-icon" />
            <span>{t('orders:card.status.ready')}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="status-badge delivered">
            <Package size={12} className="badge-icon" />
            <span>{t('orders:card.status.delivered')}</span>
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
  const itemsText =
    totalItemsCount === 1
      ? t('common:units.itemCount_one')
      : t('common:units.itemCount_other', { count: totalItemsCount });

  return (
    <article
      className="order-card"
      onClick={() => onCardClick(order)}
      tabIndex={0}
      role="button"
      aria-label={t('orders:card.ariaDetails', { orderNumber: order.orderNumber })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onCardClick(order);
        }
      }}
    >
      {/* Top 3-Zone Row */}
      <div className="card-top-row">
        {/* Zone 1: Order Metadata */}
        <div className="zone-metadata">
          <span className="order-time">{formatRelativeTime(order.createdAt)}</span>
          <span className="order-number">{order.orderNumber}</span>
          <div className="order-items-count">
            <ShoppingBag size={12} className="bag-icon" />
            <span>{itemsText}</span>
          </div>
        </div>

        {/* Zone 2: Customer Information */}
        <div className="zone-customer">
          <div className="avatar-circle">
            <User size={18} className="avatar-icon" />
          </div>
          <div className="customer-text">
            <span className="customer-name">{getLocalizedStudentName(order.studentName, t)}</span>
            <div className="coins-pill">
              <Coins size={11} className="coins-icon" />
              <span>{t('common:units.coins', { count: order.coins })}</span>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="zone-divider"></div>

        {/* Zone 3: Status & Total */}
        <div className="zone-pricing">
          {renderStatusBadge()}
          <div className="pricing-box">
            <span className="total-label">{t('orders:card.total')}</span>
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
