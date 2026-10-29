import React, { useState, useRef, useEffect } from 'react';
import { X, ShoppingBag, Coins, Clock, CheckCircle2, ChefHat, Package, Check } from 'lucide-react';
import { Order } from '../../types/order';
import { formatCurrency } from '../../utils/formatCurrency';
import { getModalActionInfo } from '../../features/orders/orderTransitions';
import { MockReceipt, ReceiptReviewModal } from './MockReceipt';
import './SummaryModal.css';

interface SummaryModalProps {
  order: Order | null;
  onClose: () => void;
  onAction: (order: Order) => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  order,
  onClose,
  onAction,
}) => {
  if (!order) return null;

  const [isReceiptReviewActive, setIsReceiptReviewActive] = useState(false);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);

  // Reset review modal if order changes
  useEffect(() => {
    setIsReceiptReviewActive(false);
  }, [order.id]);

  const modalAction = getModalActionInfo(order);

  const handleActionClick = () => {
    if (!modalAction.disabled) {
      onAction(order);
      onClose(); // Close modal after successful state advancement
    }
  };

  const handleOpenReceiptReview = () => {
    if (modalBodyRef.current) {
      scrollPosRef.current = modalBodyRef.current.scrollTop;
    }
    setIsReceiptReviewActive(true);
  };

  const handleCloseReceiptReview = () => {
    setIsReceiptReviewActive(false);
    // Restore previous scroll position
    requestAnimationFrame(() => {
      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTop = scrollPosRef.current;
      }
    });
  };

  const renderStatusBadge = () => {
    if (order.paymentStatus === 'pendingConfirmation') {
      return (
        <span className="modal-status-badge pending">
          <Clock size={12} />
          <span>بانتظار تأكيد الدفع</span>
        </span>
      );
    }

    switch (order.operationalStatus) {
      case 'newOrder':
        return (
          <span className="modal-status-badge new">
            <CheckCircle2 size={12} />
            <span>طلب جديد • الدفع مؤكد</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="modal-status-badge preparing">
            <ChefHat size={12} />
            <span>قيد التحضير في المطبخ</span>
          </span>
        );
      case 'ready':
        return (
          <span className="modal-status-badge ready">
            <CheckCircle2 size={12} />
            <span>جاهز للاستلام الفوري</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="modal-status-badge delivered">
            <Package size={12} />
            <span>تم تسليم الطلب بنجاح</span>
          </span>
        );
    }
  };

  const renderActionIcon = () => {
    if (order.paymentStatus === 'pendingConfirmation') {
      return <Check size={18} className="btn-icon" />;
    }
    switch (order.operationalStatus) {
      case 'newOrder':
        return <ChefHat size={18} className="btn-icon" />;
      case 'preparing':
        return <CheckCircle2 size={18} className="btn-icon" />;
      case 'ready':
        return <Package size={18} className="btn-icon" />;
      case 'delivered':
        return <Check size={18} className="btn-icon" />;
    }
  };

  const totalItemsCount = order.items.reduce((s, it) => s + it.quantity, 0);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      {/* Primary Order Details Modal */}
      <div
        className={`summary-modal ${isReceiptReviewActive ? 'hidden-for-review' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Hidden while receipt review is active */}
        {!isReceiptReviewActive && (
          <div className="modal-header">
            <div className="modal-title-group">
              <div className="modal-order-headline">
                <span className="modal-order-number">{order.orderNumber}</span>
                {renderStatusBadge()}
              </div>
              {/* Student name without faculty or academic specialization */}
              <span className="modal-student-name">الطالب: {order.studentName}</span>
            </div>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="إغلاق مراجعة الطلب"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div ref={modalBodyRef} className="modal-body">
          {/* Order Items Heading */}
          <div className="summary-section-title">
            <ShoppingBag size={16} />
            <span>عناصر الطلب ({totalItemsCount} {totalItemsCount === 1 ? 'عنصر' : 'عناصر'})</span>
          </div>

          {/* Line items list */}
          <div className="items-list">
            {order.items.map((it) => (
              <div key={it.id} className="item-row">
                <div className="item-info">
                  <span className="item-name">{it.name}</span>
                  <span className="item-qty-price">
                    {it.quantity} × {formatCurrency(it.unitPrice)}
                  </span>
                </div>
                <span className="item-line-total">{formatCurrency(it.lineTotal)}</span>
              </div>
            ))}
          </div>

          {/* Student Preparation Note */}
          {order.studentNote && (
            <div className="student-note-box">
              <span className="note-label">ملاحظات التحضير من الطالب:</span>
              <p className="note-text">{order.studentNote}</p>
            </div>
          )}

          {/* Order Totals & Coins */}
          <div className="modal-totals">
            <div className="total-row">
              <span className="total-label">الإجمالي المطلوب:</span>
              <span className="total-value">{formatCurrency(order.total)}</span>
            </div>
            <div className="coins-row">
              <span className="coins-label">
                <Coins size={14} className="coin-icon" />
                <span>العملات المكتسبة للطالب:</span>
              </span>
              <span className="coins-value">+{order.coins} عملة</span>
            </div>
          </div>

          {/* Payment Receipt Inspection Section */}
          <MockReceipt order={order} onOpenReview={handleOpenReceiptReview} />
        </div>

        {/* Modal Fixed Footer Action - Hidden while receipt review is active */}
        {!isReceiptReviewActive && (
          <div className="modal-footer">
            <button
              type="button"
              className={`modal-primary-btn ${modalAction.variant}`}
              onClick={handleActionClick}
              disabled={modalAction.disabled}
            >
              {renderActionIcon()}
              <span>{modalAction.label}</span>
            </button>
          </div>
        )}
      </div>

      {/* Standalone Receipt Review Modal */}
      {isReceiptReviewActive && (
        <ReceiptReviewModal
          order={order}
          onClose={handleCloseReceiptReview}
        />
      )}
    </div>
  );
};
