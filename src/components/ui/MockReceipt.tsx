import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ZoomIn, X, ShieldCheck } from 'lucide-react';
import { Order } from '../../types/order';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { getLocalizedStudentName } from '../../utils/localizeOrder';
import './MockReceipt.css';

export interface ReceiptTicketProps {
  order: Order;
  isLightbox?: boolean;
}

export const ReceiptTicket: React.FC<ReceiptTicketProps> = ({
  order,
  isLightbox = false,
}) => {
  const { t } = useTranslation('orders');
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
          <span>{t('receipt.bannerPill')}</span>
        </div>
      </div>

      {/* Success Hero */}
      <div className="receipt-hero">
        <div className="success-icon-wrap">
          <CheckCircle2 size={isLightbox ? 36 : 24} className="success-check" />
        </div>
        <span className="success-label">{t('receipt.successHero')}</span>
        <span className="receipt-amount">{formatCurrency(order.total)}</span>
      </div>

      {/* Transaction Details */}
      <div className="receipt-details-grid">
        <div className="receipt-row">
          <span className="row-label">{t('receipt.beneficiary')}</span>
          <span className="row-value font-bold">{t('receipt.beneficiaryName')}</span>
        </div>
        <div className="receipt-row">
          <span className="row-label">{t('receipt.sender')}</span>
          <span className="row-value">{getLocalizedStudentName(order.studentName, t)}</span>
        </div>
        <div className="receipt-row">
          <span className="row-label">{t('receipt.accountHandle')}</span>
          <span className="row-value dir-ltr">{order.senderHandle}</span>
        </div>
        <div className="receipt-row">
          <span className="row-label">{t('receipt.refNumber')}</span>
          <span className="row-value font-mono">{formattedRef}</span>
        </div>
        <div className="receipt-row">
          <span className="row-label">{t('receipt.orderNumber')}</span>
          <span className="row-value font-bold">{order.orderNumber}</span>
        </div>
        <div className="receipt-row">
          <span className="row-label">{t('receipt.transferDate')}</span>
          <span className="row-value">
            {t('receipt.today', { time: formatRelativeTime(order.createdAt) })}
          </span>
        </div>
      </div>

      {/* Watermark note */}
      <div className="receipt-footer-watermark">
        <span>{t('receipt.watermark')}</span>
      </div>
    </div>
  );
};

export interface MockReceiptProps {
  order: Order;
  onOpenReview?: () => void;
}

export const MockReceipt: React.FC<MockReceiptProps> = ({ order, onOpenReview }) => {
  const { t } = useTranslation('orders');

  return (
    <div className="receipt-section">
      <div className="receipt-section-header">
        <span className="section-title">{t('receipt.sectionTitle')}</span>
        <span className="inspection-hint">{t('receipt.inspectionHint')}</span>
      </div>

      {/* Interactive Thumbnail */}
      <div
        className="receipt-thumbnail-wrapper"
        onClick={onOpenReview}
        role="button"
        tabIndex={0}
        aria-label={t('receipt.zoomAria')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onOpenReview?.();
          }
        }}
      >
        <ReceiptTicket order={order} isLightbox={false} />
        <div className="thumbnail-zoom-overlay">
          <ZoomIn size={18} />
          <span>{t('receipt.zoomOverlay')}</span>
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
  const { t } = useTranslation('orders');

  const modalContent = (
    <div
      className="receipt-lightbox-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('receipt.lightboxTitle')}
    >
      <div className="receipt-lightbox-card" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-header">
          <span className="lightbox-title">{t('receipt.lightboxTitle')}</span>
          <button
            type="button"
            className="lightbox-close-btn"
            onClick={onClose}
            aria-label={t('receipt.lightboxCloseAria')}
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
            {t('receipt.doneBtn')}
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
