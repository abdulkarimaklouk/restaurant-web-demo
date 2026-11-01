import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { AnalyticsDataSet, AnalyticsDatePreset } from '../types';
import { generateAnalyticsInsights } from '../utils/insightsGenerator';
import './AnalyticsInsights.css';

interface AnalyticsInsightsProps {
  dataSet: AnalyticsDataSet;
  preset: AnalyticsDatePreset;
}

export const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ dataSet, preset }) => {
  const { t } = useTranslation('analytics');

  const insightMessage = generateAnalyticsInsights(dataSet, { t, preset });

  return (
    <aside
      className="analytics-insights-card"
      data-testid="analytics-insights-card"
      aria-labelledby="analytics-insights-title"
    >
      <div className="analytics-insights-header">
        <Sparkles size={18} strokeWidth={2.2} className="analytics-insights-icon" aria-hidden="true" />
        <h3 id="analytics-insights-title" className="analytics-insights-title">
          {t('performance.insights.title')}
        </h3>
      </div>

      <p className="analytics-insights-text" data-testid="analytics-insights-text">
        {insightMessage}
      </p>
    </aside>
  );
};

