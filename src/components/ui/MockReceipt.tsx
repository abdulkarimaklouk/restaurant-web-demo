import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, ZoomIn, X, ShieldCheck } from 'lucide-react';
import { Order } from '../../types/order';
import { formatCurrency } from '../../utils/formatCurrency';
import './MockReceipt.css';

export interface ReceiptTicketProps {
  order: Order;
  isLightbox?: boolean;
}

export const ReceiptTicket: React.FC<ReceiptTicketProps> = ({
  order,
  isLightbox = false,
}) => {
  const formattedRef = order.transactionRef.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');

  return (
    <div className={`receipt-ticket ${isLightbox ? 'enlarged' : 'thumbnail'}`}>
      {/* Top Brand Banner */}
      <div className="receipt-banner">
        <div className="instapay-brand">
          <span className="instapay-en">InstaPay</span>
          <span className="instapay-ar">إنستاباي</span>
        </div>
        <div className="demo-pill-badge">
          <ShieldCheck size={12} />
          <span>إيصال تجريبي</span>
        </div>
      </div>

      {/* Success Hero */}
      <div className="receipt-hero">
        <div className="success-icon-wrap">
          <CheckCircle2 size={isLightbox ? 36 : 24} className="success-check" />
        </div>
        <span className="success-label">تم التحويل بنجاح</span>
        <span className="receipt-amount">{formatCurrency(order.total)}</span>
      </div>

      {/* Transaction Details */}
      <div className="receipt-details-grid">
        <div className="receipt-row">
          <span className="row-label">المستفيد:</span>
          <span className="row-value font-bold">مطعم الأطايب الجامعي</span>
        </div>
        <div className="receipt-row">
          <span className="row-label">الراسل:</span>
          <span className="row-value">{order.studentName}</span>
        </div>
        <div className="receipt-row">
          <span className="row-label">معرف الحساب:</span>
          <span className="row-value dir-ltr">{order.senderHandle}</span>
        </div>
        <div className="receipt-row">
          <span className="row-label">الرقم المرجعي:</span>
          <span className="row-value font-mono">{formattedRef}</span>
        </div>
        <div className="receipt-row">
          <span className="row-label">رقم الطلب:</span>
          <span className="row-value font-bold">{order.orderNumber}</span>
        </div>
        <div className="receipt-row">
          <span className="row-label">تاريخ التحويل:</span>
          <span className="row-value">اليوم، {order.formattedRelativeTime}</span>
        </div>
      </div>

      {/* Watermark note */}
      <div className="receipt-footer-watermark">
        <span>إشعار تحويل افتراضي صادر لأغراض الفحص والاعتماد اليدوي</span>
      </div>
    </div>
  );
};

export interface MockReceiptProps {
  order: Order;
  onOpenReview?: () => void;
}

export const MockReceipt: React.FC<MockReceiptProps> = ({ order, onOpenReview }) => {
  return (
    <div className="receipt-section">
      <div className="receipt-section-header">
        <span className="section-title">إيصال التحويل الإلكتروني (إنستاباي)</span>
        <span className="inspection-hint">فحص يدوي مطلوب</span>
      </div>

      {/* Interactive Thumbnail */}
      <div
        className="receipt-thumbnail-wrapper"
        onClick={onOpenReview}
        role="button"
        tabIndex={0}
        aria-label="تكبير إيصال الدفع للفحص"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onOpenReview?.();
          }
        }}
      >
        <ReceiptTicket order={order} isLightbox={false} />
        <div className="thumbnail-zoom-overlay">
          <ZoomIn size={18} />
          <span>انقر لتكبير الإيصال والفحص</span>
        </div>
      </div>
    </div>
  );
};

export interface ReceiptReviewModalProps {
  order: Order;
  onClose: () => void;
}

export const ReceiptReviewModal: React.FC<ReceiptReviewModalProps> = ({
  order,
  onClose,
}) => {
  const modalContent = (
    <div
      className="receipt-lightbox-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="فحص إيصال الدفع"
    >
      <div className="receipt-lightbox-card" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-header">
          <span className="lightbox-title">فحص إيصال الدفع</span>
          <button
            type="button"
            className="lightbox-close-btn"
            onClick={onClose}
            aria-label="إغلاق معاينة الإيصال"
          >
            <X size={20} />
          </button>
        </div>
        <div className="lightbox-body">
          <ReceiptTicket order={order} isLightbox={true} />
        </div>
        <div className="lightbox-footer">
          <button
            type="button"
            className="lightbox-done-btn"
            onClick={onClose}
          >
            العودة لتفاصيل الطلب
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};
