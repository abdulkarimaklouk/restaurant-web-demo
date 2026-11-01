import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';
import { ChartAggregationResult, MetricMode, AnalyticsDatePreset } from '../types';
import { ChartMetricToggle } from './ChartMetricToggle';
import {
  calculateYAxisTicks,
  buildSmoothBezierPath,
  buildAreaPath,
  localizeChartLabel,
  formatDetailedBucketTime,
} from '../utils/svgChartUtils';
import { formatCurrency } from '../../../utils/formatCurrency';
import './SalesOverviewChart.css';

export interface SalesOverviewChartProps {
  chartData: ChartAggregationResult;
  metricMode: MetricMode;
  onMetricModeChange: (mode: MetricMode) => void;
  preset: AnalyticsDatePreset;
}

export const SalesOverviewChart: React.FC<SalesOverviewChartProps> = ({
  chartData,
  metricMode,
  onMetricModeChange,
  preset,
}) => {
  const { t, i18n } = useTranslation('analytics');
  const [userSelectedIdx, setUserSelectedIdx] = useState<number | null>(null);

  const buckets = chartData.buckets;

  // Find default active peak index
  const defaultPeakIdx = useMemo(() => {
    if (!buckets || buckets.length === 0) return 0;
    if (chartData.peakBucket) {
      const idx = buckets.findIndex((b) => b.key === chartData.peakBucket?.key);
      if (idx !== -1) return idx;
    }
    // For Today preset matching the reference design, default to 8 PM (index 5)
    if (preset === 'today' && buckets.length === 7) {
      return 5;
    }
    return Math.max(0, buckets.length - 1);
  }, [buckets, chartData.peakBucket, preset]);

  // Reset user selection when preset or metric mode changes
  const activeIdx = useMemo(() => {
    if (userSelectedIdx !== null && userSelectedIdx >= 0 && userSelectedIdx < buckets.length) {
      return userSelectedIdx;
    }
    return defaultPeakIdx;
  }, [userSelectedIdx, defaultPeakIdx, buckets.length]);

  // Determine maximum value for Y-axis scale
  const maxValue = useMemo(() => {
    return metricMode === 'sales'
      ? chartData.maxSalesBucketValue
      : chartData.maxOrdersBucketValue;
  }, [chartData, metricMode]);

  // Compute Y-axis scale ticks
  const { ticks, formattedTicks, maxTick } = useMemo(() => {
    return calculateYAxisTicks(maxValue, metricMode, i18n.language);
  }, [maxValue, metricMode, i18n.language]);

  // SVG dimensions and layout coordinates
  const viewBoxWidth = 350;
  const viewBoxHeight = 190;
  const marginLeft = 60;
  const marginRight = 16;
  const marginTop = 34;
  const marginBottom = 26;
  const plotWidth = viewBoxWidth - marginLeft - marginRight;
  const plotHeight = viewBoxHeight - marginTop - marginBottom;
  const baselineY = marginTop + plotHeight;

  // Calculate coordinates for all data points
  const pointCoords = useMemo(() => {
    if (!buckets || buckets.length === 0) return [];
    const count = buckets.length;

    return buckets.map((bucket, i) => {
      const x =
        count > 1
          ? marginLeft + i * (plotWidth / (count - 1))
          : marginLeft + plotWidth / 2;

      const val = metricMode === 'sales' ? bucket.sales : bucket.orders;
      const normalizedVal = maxTick > 0 ? val / maxTick : 0;
      const y = baselineY - normalizedVal * plotHeight;

      return { x, y, bucket, index: i, value: val };
    });
  }, [buckets, maxTick, metricMode, marginLeft, plotWidth, baselineY, plotHeight]);

  // Build SVG paths
  const linePath = useMemo(() => {
    return buildSmoothBezierPath(pointCoords, baselineY, marginTop);
  }, [pointCoords, baselineY, marginTop]);

  const areaPath = useMemo(() => {
    return buildAreaPath(linePath, pointCoords, baselineY);
  }, [linePath, pointCoords, baselineY]);

  // Active point details
  const activePoint = pointCoords[activeIdx] || pointCoords[0];

  const formattedActiveValue = useMemo(() => {
    if (!activePoint) return '';
    if (metricMode === 'sales') {
      return formatCurrency(activePoint.value);
    }
    return `${activePoint.value} ${t('units.orders')}`;
  }, [activePoint, metricMode, t]);

  const activeTimeLabel = useMemo(() => {
    if (!activePoint) return '';
    return formatDetailedBucketTime(activePoint.bucket, i18n.language);
  }, [activePoint, i18n.language]);

  // Calculate dynamic tooltip box width
  const tooltipWidth = useMemo(() => {
    const len = formattedActiveValue.length;
    return Math.max(92, len * 8 + 26);
  }, [formattedActiveValue]);

  const tooltipHeight = 36;
  const tooltipX = useMemo(() => {
    if (!activePoint) return marginLeft;
    const rawX = activePoint.x - tooltipWidth / 2;
    return Math.max(
      marginLeft,
      Math.min(viewBoxWidth - marginRight - tooltipWidth, rawX)
    );
  }, [activePoint, tooltipWidth, marginLeft, marginRight, viewBoxWidth]);

  const tooltipY = useMemo(() => {
    if (!activePoint) return 2;
    return Math.max(2, activePoint.y - tooltipHeight - 8);
  }, [activePoint, tooltipHeight]);

  // Out of chart hours check
  const outOfHoursInfo = useMemo(() => {
    const o = chartData.outOfChartHours;
    if (!o) return null;
    if (metricMode === 'sales' && o.sales > 0) {
      return t('chart.outOfHours', { amount: formatCurrency(o.sales) });
    }
    if (metricMode === 'orders' && o.orders > 0) {
      return t('chart.outOfHours', {
        amount: `${o.orders} ${t('units.orders')}`,
      });
    }
    return null;
  }, [chartData.outOfChartHours, metricMode, t]);

  return (
    <section
      className="sales-overview-card"
      data-testid="sales-overview-card"
      aria-labelledby="sales-overview-title"
    >
      {/* 1. Header with Title and Sales / Orders Segmented Toggle */}
      <div className="sales-overview-header">
        <div className="sales-overview-title-group">
          <TrendingUp
            size={18}
            strokeWidth={2.4}
            className="sales-overview-icon"
            aria-hidden="true"
          />
          <h2 id="sales-overview-title" className="sales-overview-title">
            {t('chart.title')}
          </h2>
        </div>

        <ChartMetricToggle mode={metricMode} onChange={onMetricModeChange} />
      </div>

      {/* 2. Interactive SVG Chart Plotting Area */}
      <div className="sales-overview-chart-wrapper">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="sales-overview-svg"
          style={{ direction: 'ltr' }}
          role="img"
          aria-label={`${t('chart.title')} - ${t(`chart.modes.${metricMode}`)}`}
        >
          <defs>
            {/* Area Fill Linear Gradient */}
            <linearGradient id="salesOverviewAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>

            {/* Subtle Drop Shadow for Floating Tooltip */}
            <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          <g className="chart-grid-group" aria-hidden="true">
            {ticks.map((tickVal, i) => {
              const y =
                baselineY - (maxTick > 0 ? (tickVal / maxTick) * plotHeight : 0);
              return (
                <g key={`tick-${tickVal}-${i}`}>
                  <line
                    x1={marginLeft}
                    y1={y}
                    x2={viewBoxWidth - marginRight}
                    y2={y}
                    className="chart-grid-line"
                  />
                  <text
                    x={marginLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="chart-y-axis-label"
                  >
                    {formattedTicks[i]}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Area Fill beneath curve */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#salesOverviewAreaGradient)"
              className="chart-area-fill"
            />
          )}

          {/* Smooth Blue Bezier Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="chart-bezier-line"
            />
          )}

          {/* Active Guide Line (vertical dashed line down to baseline) */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={activePoint.y}
              x2={activePoint.x}
              y2={baselineY}
              className="chart-active-guideline"
            />
          )}

          {/* Circular Data Points */}
          <g className="chart-points-group">
            {pointCoords.map((pt) => {
              const isActive = pt.index === activeIdx;
              return (
                <g key={`point-${pt.bucket.key}-${pt.index}`}>
                  {/* Outer halo for active point */}
                  {isActive && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      className="chart-point-active-halo"
                    />
                  )}
                  {/* Regular Point Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isActive ? 4 : 3.5}
                    className={`chart-data-point ${isActive ? 'active' : ''}`}
                  />
                </g>
              );
            })}
          </g>

          {/* Floating Tooltip Pill */}
          {activePoint && (
            <g
              className="chart-tooltip-group"
              transform={`translate(${tooltipX}, ${tooltipY})`}
              data-testid="chart-active-tooltip"
            >
              <rect
                width={tooltipWidth}
                height={tooltipHeight}
                rx="6"
                className="chart-tooltip-rect"
                filter="url(#tooltipShadow)"
              />
              <circle cx="10" cy="14" r="3" fill="#2563eb" />
              <text x="18" y="17" textAnchor="start" className="chart-tooltip-value">
                {formattedActiveValue}
              </text>
              <text x="18" y="29" textAnchor="start" className="chart-tooltip-time">
                {activeTimeLabel}
              </text>
            </g>
          )}

          {/* Horizontal X-Axis Time Labels */}
          <g className="chart-x-axis-group">
            {pointCoords.map((pt) => (
              <text
                key={`label-${pt.bucket.key}`}
                x={pt.x}
                y={baselineY + 18}
                textAnchor="middle"
                className={`chart-x-axis-label ${pt.index === activeIdx ? 'active' : ''}`}
              >
                {localizeChartLabel(pt.bucket.label, i18n.language)}
              </text>
            ))}
          </g>

          {/* Full-Height Column Hit Targets for Mobile Tap / Hover */}
          <g className="chart-hit-targets" aria-hidden="true">
            {pointCoords.map((pt, i) => {
              const colWidth =
                pointCoords.length > 1
                  ? plotWidth / (pointCoords.length - 1)
                  : plotWidth;
              const targetX = pt.x - colWidth / 2;
              return (
                <rect
                  key={`hit-${pt.bucket.key}-${i}`}
                  x={Math.max(0, targetX)}
                  y={marginTop}
                  width={colWidth}
                  height={plotHeight + 20}
                  fill="transparent"
                  className="chart-hit-rect"
                  onClick={() => setUserSelectedIdx(i)}
                  onMouseEnter={() => setUserSelectedIdx(i)}
                  data-testid={`chart-point-target-${i}`}
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Out of Chart Hours Transparent Notice */}
      {outOfHoursInfo && (
        <div className="chart-out-of-hours-notice" data-testid="chart-out-of-hours">
          {outOfHoursInfo}
        </div>
      )}
    </section>
  );
};
