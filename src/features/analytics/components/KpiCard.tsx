import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricComparison, AnalyticsDatePreset } from '../types';
import './KpiCard.css';

export type KpiTheme = 'green' | 'blue' | 'purple' | 'orange';

export interface KpiCardProps {
  id: string;
  title: string;
  value: string | number;
  comparison: MetricComparison;
  preset: AnalyticsDatePreset;
  theme: KpiTheme;
  icon: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  id,
  title,
  value,
  comparison,
  preset,
  theme,
  icon,
}) => {
  const { t } = useTranslation('analytics');

  const getComparisonLabel = (): string => {
    switch (preset) {
      case 'today':
        return t('kpis.vsYesterday');
      case 'week':
        return t('kpis.vsLastWeek');
      case 'month':
        return t('kpis.vsLastMonth');
      case 'custom':
      default:
        return t('kpis.vsPriorPeriod');
    }
  };

  const renderComparison = () => {
    if (comparison.status === 'no_prior_data' || comparison.percentageChange === null) {
      return (
        <div className="kpi-comparison-row neutral" data-testid={`${id}-comparison-no-data`}>
          <Minus size={12} strokeWidth={2.5} className="kpi-comp-icon" aria-hidden="true" />
          <span className="kpi-comp-text">{t('kpis.noPriorData')}</span>
        </div>
      );
    }

    if (comparison.status === 'neutral' || comparison.percentageChange === 0) {
      return (
        <div className="kpi-comparison-row neutral" data-testid={`${id}-comparison-neutral`}>
          <Minus size={12} strokeWidth={2.5} className="kpi-comp-icon" aria-hidden="true" />
          <span className="kpi-comp-text">0.0% {getComparisonLabel()}</span>
        </div>
      );
    }

    const isPositive = comparison.isPositive;
    const sign = isPositive ? '+' : '';
    const formattedPct = `${sign}${comparison.percentageChange.toFixed(1)}%`;

    return (
      <div
        className={`kpi-comparison-row ${isPositive ? 'positive' : 'negative'}`}
        data-testid={`${id}-comparison`}
      >
        {isPositive ? (
          <TrendingUp size={12} strokeWidth={2.5} className="kpi-comp-icon" aria-hidden="true" />
        ) : (
          <TrendingDown size={12} strokeWidth={2.5} className="kpi-comp-icon" aria-hidden="true" />
        )}
        <span className="kpi-comp-text">
          {formattedPct} {getComparisonLabel()}
        </span>
      </div>
    );
  };

  return (
    <article
      className={`kpi-card kpi-card-${theme}`}
      data-testid={`kpi-card-${id}`}
      aria-labelledby={`kpi-title-${id}`}
    >
      <div className="kpi-card-header">
        <span className="kpi-icon-badge" aria-hidden="true">
          {icon}
        </span>
        <h2 id={`kpi-title-${id}`} className="kpi-card-title">
          {title}
        </h2>
      </div>

      <div className="kpi-card-value" data-testid={`${id}-value`}>
        {value}
      </div>

      {renderComparison()}
    </article>
  );
};

