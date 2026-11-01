import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { AnalyticsDatePreset } from '../types';
import './DateFilterTabs.css';

interface DateFilterTabsProps {
  activePreset: AnalyticsDatePreset;
  onSelectPreset: (preset: AnalyticsDatePreset) => void;
  onOpenCustomModal: () => void;
  customRangeLabel?: string;
}

export const DateFilterTabs: React.FC<DateFilterTabsProps> = ({
  activePreset,
  onSelectPreset,
  onOpenCustomModal,
  customRangeLabel,
}) => {
  const { t } = useTranslation('analytics');

  return (
    <div className="date-filter-row" role="region" aria-label={t('presets.today')}>
      {/* Segmented Pill Group (Today, This Week, This Month) */}
      <div className="date-filter-segmented" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activePreset === 'today'}
          className={`date-preset-tab ${activePreset === 'today' ? 'active' : ''}`}
          onClick={() => onSelectPreset('today')}
          data-testid="preset-today"
        >
          {t('presets.today')}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activePreset === 'week'}
          className={`date-preset-tab ${activePreset === 'week' ? 'active' : ''}`}
          onClick={() => onSelectPreset('week')}
          data-testid="preset-week"
        >
          {t('presets.week')}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activePreset === 'month'}
          className={`date-preset-tab ${activePreset === 'month' ? 'active' : ''}`}
          onClick={() => onSelectPreset('month')}
          data-testid="preset-month"
        >
          {t('presets.month')}
        </button>
      </div>

      {/* Standalone Custom Calendar Action Button */}
      <button
        type="button"
        className={`custom-calendar-btn ${activePreset === 'custom' ? 'active' : ''}`}
        onClick={onOpenCustomModal}
        aria-label={
          activePreset === 'custom' && customRangeLabel
            ? `${t('presets.custom')}: ${customRangeLabel}`
            : t('presets.custom')
        }
        title={t('presets.custom')}
        data-testid="preset-custom-btn"
      >
        <Calendar size={16} strokeWidth={2.2} className="calendar-icon" aria-hidden="true" />
      </button>
    </div>
  );
};

