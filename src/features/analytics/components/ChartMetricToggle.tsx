import React from 'react';
import { useTranslation } from 'react-i18next';
import { MetricMode } from '../types';
import './ChartMetricToggle.css';

interface ChartMetricToggleProps {
  mode: MetricMode;
  onChange: (mode: MetricMode) => void;
}

export const ChartMetricToggle: React.FC<ChartMetricToggleProps> = ({ mode, onChange }) => {
  const { t } = useTranslation('analytics');

  return (
    <div className="chart-metric-toggle" role="tablist" aria-label={t('chart.title')}>
      <button
        type="button"
        role="tab"
        id="chart-mode-sales-tab"
        aria-selected={mode === 'sales'}
        className={`chart-metric-btn ${mode === 'sales' ? 'active' : ''}`}
        onClick={() => onChange('sales')}
        data-testid="chart-mode-sales"
      >
        {t('chart.modes.sales')}
      </button>

      <button
        type="button"
        role="tab"
        id="chart-mode-orders-tab"
        aria-selected={mode === 'orders'}
        className={`chart-metric-btn ${mode === 'orders' ? 'active' : ''}`}
        onClick={() => onChange('orders')}
        data-testid="chart-mode-orders"
      >
        {t('chart.modes.orders')}
      </button>
    </div>
  );
};

