import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnalyticsDatePreset } from '../types';
import { DateFilterTabs } from './DateFilterTabs';
import './AnalyticsHeader.css';

interface AnalyticsHeaderProps {
  activePreset: AnalyticsDatePreset;
  onSelectPreset: (preset: AnalyticsDatePreset) => void;
  onOpenCustomModal: () => void;
  customRangeLabel?: string;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  activePreset,
  onSelectPreset,
  onOpenCustomModal,
  customRangeLabel,
}) => {
  const { t } = useTranslation('analytics');

  return (
    <header className="analytics-header">
      <div className="analytics-title-wrap">
        <h1 className="analytics-title">{t('title')}</h1>
        {activePreset === 'custom' && customRangeLabel && (
          <span className="analytics-custom-badge" data-testid="analytics-custom-badge">
            {customRangeLabel}
          </span>
        )}
      </div>

      <DateFilterTabs
        activePreset={activePreset}
        onSelectPreset={onSelectPreset}
        onOpenCustomModal={onOpenCustomModal}
        customRangeLabel={customRangeLabel}
      />
    </header>
  );
};

