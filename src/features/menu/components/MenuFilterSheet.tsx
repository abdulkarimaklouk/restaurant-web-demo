import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, SlidersHorizontal, Check, RotateCcw } from 'lucide-react';
import './MenuFilterSheet.css';

export type AvailabilityFilterOption = 'all' | 'available' | 'unavailable';

export interface MenuFilterSheetProps {
  isOpen: boolean;
  currentFilter: AvailabilityFilterOption;
  onApply: (filter: AvailabilityFilterOption) => void;
  onClose: () => void;
}

export const MenuFilterSheet: React.FC<MenuFilterSheetProps> = ({
  isOpen,
  currentFilter,
  onApply,
  onClose,
}) => {
  const { t } = useTranslation('menu');
  const [selected, setSelected] = useState<AvailabilityFilterOption>(currentFilter);

  // Sync internal selection with external prop when opened
  useEffect(() => {
    if (isOpen) {
      setSelected(currentFilter);
    }
  }, [isOpen, currentFilter]);

  // Dismiss on Escape key
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

  const handleReset = () => {
    setSelected('all');
    onApply('all');
    onClose();
  };

  const handleApply = () => {
    onApply(selected);
    onClose();
  };

  const options: { id: AvailabilityFilterOption; labelKey: string; descKey: string }[] = [
    {
      id: 'all',
      labelKey: 'filter.allProducts',
      descKey: 'filter.allProductsDesc',
    },
    {
      id: 'available',
      labelKey: 'filter.availableOnly',
      descKey: 'filter.availableOnlyDesc',
    },
    {
      id: 'unavailable',
      labelKey: 'filter.unavailableOnly',
      descKey: 'filter.unavailableOnlyDesc',
    },
  ];

  return (
    <div
      className="filter-sheet-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="filter-sheet-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="filter-sheet-header">
          <div className="filter-sheet-title-group">
            <SlidersHorizontal size={18} className="filter-sheet-header-icon" />
            <h2 id="filter-sheet-title" className="filter-sheet-title">
              {t('filter.title')}
            </h2>
          </div>
          <button
            type="button"
            className="filter-sheet-close-btn"
            onClick={onClose}
            aria-label={t('filter.closeAria')}
          >
            <X size={17} />
          </button>
        </div>

        {/* Filter Section: Availability */}
        <div className="filter-sheet-body">
          <span className="filter-section-label">
            {t('filter.availabilitySection')}
          </span>

          <div className="filter-options-list" role="radiogroup">
            {options.map((opt) => {
              const isSelected = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`filter-option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelected(opt.id)}
                >
                  <div className="filter-option-radio">
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div className="filter-option-content">
                    <span className="filter-option-label">{t(opt.labelKey)}</span>
                    <span className="filter-option-desc">{t(opt.descKey)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Apply & Reset */}
        <div className="filter-sheet-actions">
          <button
            type="button"
            className="btn-apply-filter"
            onClick={handleApply}
          >
            {t('filter.applyBtn')}
          </button>
          <button
            type="button"
            className="btn-reset-filter"
            onClick={handleReset}
          >
            <RotateCcw size={14} />
            <span>{t('filter.resetBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

