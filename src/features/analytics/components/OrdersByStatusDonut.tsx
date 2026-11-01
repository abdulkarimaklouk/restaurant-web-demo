import React from 'react';
import { useTranslation } from 'react-i18next';
import { ListChecks } from 'lucide-react';
import { OrdersByStatusResult } from '../types';
import { OperationalStatus } from '../../../types/order';
import './OrdersByStatusDonut.css';

interface OrdersByStatusDonutProps {
  ordersByStatus: OrdersByStatusResult;
}

const STATUS_COLORS: Record<OperationalStatus, { light: string; dark: string }> = {
  delivered: { light: '#10b981', dark: '#34d399' },
  ready: { light: '#2563eb', dark: '#3b82f6' },
  preparing: { light: '#f59e0b', dark: '#fbbf24' },
  newOrder: { light: '#8b5cf6', dark: '#a78bfa' },
};

export const OrdersByStatusDonut: React.FC<OrdersByStatusDonutProps> = ({ ordersByStatus }) => {
  const { t } = useTranslation('analytics');

  const { totalCount, items, hasData } = ordersByStatus;
  const radius = 34;
  const circumference = 2 * Math.PI * radius; // ~213.628

  let accumulatedLength = 0;

  const getStatusLabel = (status: OperationalStatus): string => {
    switch (status) {
      case 'delivered':
        return t('performance.ordersStatus.delivered');
      case 'ready':
        return t('performance.ordersStatus.ready');
      case 'preparing':
        return t('performance.ordersStatus.preparing');
      case 'newOrder':
        return t('performance.ordersStatus.new');
      default:
        return status;
    }
  };

  return (
    <article
      className="orders-status-card"
      data-testid="orders-status-card"
      aria-labelledby="orders-status-title"
    >
      <div className="orders-status-header">
        <ListChecks size={16} strokeWidth={2.2} className="orders-status-icon" aria-hidden="true" />
        <h3 id="orders-status-title" className="orders-status-title">
          {t('performance.ordersStatus.title')}
        </h3>
      </div>

      <div className="orders-status-body">
        {/* 1. Custom SVG Donut Chart */}
        <div className="orders-donut-chart-wrap">
          <svg
            viewBox="0 0 100 100"
            className="orders-donut-svg"
            role="img"
            aria-label={`${t('performance.ordersStatus.title')}: ${totalCount} ${t('performance.ordersStatus.orders')}`}
          >
            {/* Empty or Zero Data Baseline Ring */}
            {!hasData || totalCount === 0 ? (
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                className="orders-donut-empty-ring"
                strokeWidth="14"
              />
            ) : (
              /* Operational Status Donut Slices based on exact underlying counts */
              items.map((item) => {
                if (item.count <= 0 || totalCount <= 0) return null;
                const sliceLength = (item.count / totalCount) * circumference;
                const dashOffset = -accumulatedLength;
                accumulatedLength += sliceLength;

                return (
                  <circle
                    key={`slice-${item.status}`}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={STATUS_COLORS[item.status].light}
                    strokeWidth="14"
                    strokeDasharray={`${sliceLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 50 50)"
                    className={`orders-donut-slice slice-${item.status}`}
                    data-testid={`donut-slice-${item.status}`}
                  />
                );
              })
            )}

            {/* Donut Center Count & Label */}
            <text x="50" y="47" textAnchor="middle" className="orders-donut-center-num">
              {totalCount}
            </text>
            <text x="50" y="60" textAnchor="middle" className="orders-donut-center-label">
              {t('performance.ordersStatus.orders')}
            </text>
          </svg>
        </div>

        {/* 2. Status Legend */}
        <div className="orders-status-legend" data-testid="orders-status-legend">
          {items.map((item) => {
            const label = getStatusLabel(item.status);
            const formattedPct = `${item.percentage.toFixed(1)}%`;
            return (
              <div
                key={`legend-${item.status}`}
                className="orders-status-legend-item"
                data-testid={`status-legend-${item.status}`}
              >
                <span
                  className={`status-legend-dot dot-${item.status}`}
                  style={{ backgroundColor: STATUS_COLORS[item.status].light }}
                  aria-hidden="true"
                />
                <span className="status-legend-label" title={`${label} ${item.count} (${formattedPct})`}>
                  {label} <strong className="status-legend-count">{item.count}</strong>{' '}
                  <span className="status-legend-pct">({formattedPct})</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
};
