import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, AlertCircle } from 'lucide-react';
import './CustomDateRangeModal.css';

interface CustomDateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

export function formatIsoDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const CustomDateRangeModal: React.FC<CustomDateRangeModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialStartDate,
  initialEndDate,
}) => {
  const { t } = useTranslation('analytics');

  const todayStr = formatIsoDateString(new Date());
  const [startDate, setStartDate] = useState(initialStartDate || todayStr);
  const [endDate, setEndDate] = useState(initialEndDate || todayStr);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setStartDate(initialStartDate || todayStr);
      setEndDate(initialEndDate || todayStr);
      setError(null);
    }
  }, [isOpen, initialStartDate, initialEndDate, todayStr]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    if (endDate && newStart > endDate) {
      setError(t('customModal.invalidRange'));
    } else {
      setError(null);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    setEndDate(newEnd);
    if (startDate && newEnd < startDate) {
      setError(t('customModal.invalidRange'));
    } else {
      setError(null);
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError(t('customModal.invalidRange'));
      return;
    }
    if (endDate < startDate) {
      setError(t('customModal.invalidRange'));
      return;
    }

    onApply(startDate, endDate);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="custom-range-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-range-modal-title"
    >
      <div className="custom-range-modal">
        {/* Header */}
        <div className="custom-range-header">
          <div className="custom-range-title-wrap">
            <span className="custom-range-icon-wrap" aria-hidden="true">
              <Calendar size={18} strokeWidth={2.2} />
            </span>
            <h2 id="custom-range-modal-title" className="custom-range-title">
              {t('customModal.title')}
            </h2>
          </div>
          <button
            type="button"
            className="custom-range-close-btn"
            onClick={onClose}
            aria-label={t('customModal.cancel')}
            data-testid="custom-range-close"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleApply} className="custom-range-form">
          <div className="custom-range-inputs">
            {/* Start Date */}
            <div className="custom-range-field">
              <label htmlFor="custom-start-date" className="custom-range-label">
                {t('customModal.startDate')}
              </label>
              <input
                id="custom-start-date"
                type="date"
                className={`custom-range-input ${error ? 'has-error' : ''}`}
                value={startDate}
                onChange={handleStartDateChange}
                required
                data-testid="custom-start-input"
              />
            </div>

            {/* End Date */}
            <div className="custom-range-field">
              <label htmlFor="custom-end-date" className="custom-range-label">
                {t('customModal.endDate')}
              </label>
              <input
                id="custom-end-date"
                type="date"
                className={`custom-range-input ${error ? 'has-error' : ''}`}
                value={endDate}
                onChange={handleEndDateChange}
                required
                data-testid="custom-end-input"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="custom-range-error" role="alert" data-testid="custom-range-error">
              <AlertCircle size={14} className="error-icon" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="custom-range-actions">
            <button
              type="button"
              className="custom-range-cancel-btn"
              onClick={onClose}
              data-testid="custom-range-cancel"
            >
              {t('customModal.cancel')}
            </button>
            <button
              type="submit"
              className="custom-range-apply-btn"
              disabled={Boolean(error) || !startDate || !endDate}
              data-testid="custom-range-apply"
            >
              {t('customModal.apply')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

