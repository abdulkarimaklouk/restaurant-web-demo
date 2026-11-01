import React from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, ShoppingBag, Utensils, Receipt } from 'lucide-react';
import { AnalyticsKpiSummary, AnalyticsDatePreset } from '../types';
import { formatCurrency } from '../../../utils/formatCurrency';
import { KpiCard } from './KpiCard';
import './KpiCardGrid.css';

interface KpiCardGridProps {
  kpis: AnalyticsKpiSummary;
  preset: AnalyticsDatePreset;
}

export const KpiCardGrid: React.FC<KpiCardGridProps> = ({ kpis, preset }) => {
  const { t } = useTranslation('analytics');

  return (
    <section className="kpi-card-grid" aria-label={t('title')}>
      {/* 1. Total Sales */}
      <KpiCard
        id="total-sales"
        title={t('kpis.totalSales')}
        value={formatCurrency(kpis.totalSales)}
        comparison={kpis.comparisons.totalSales}
        preset={preset}
        theme="green"
        icon={<Coins size={16} strokeWidth={2.2} />}
      />

      {/* 2. Total Orders */}
      <KpiCard
        id="total-orders"
        title={t('kpis.totalOrders')}
        value={kpis.totalOrders.toLocaleString()}
        comparison={kpis.comparisons.totalOrders}
        preset={preset}
        theme="blue"
        icon={<ShoppingBag size={16} strokeWidth={2.2} />}
      />

      {/* 3. Items Sold */}
      <KpiCard
        id="items-sold"
        title={t('kpis.itemsSold')}
        value={kpis.itemsSold.toLocaleString()}
        comparison={kpis.comparisons.itemsSold}
        preset={preset}
        theme="purple"
        icon={<Utensils size={16} strokeWidth={2.2} />}
      />

      {/* 4. Average Order Value */}
      <KpiCard
        id="avg-order-value"
        title={t('kpis.avgOrderValue')}
        value={formatCurrency(kpis.averageOrderValue)}
        comparison={kpis.comparisons.averageOrderValue}
        preset={preset}
        theme="orange"
        icon={<Receipt size={16} strokeWidth={2.2} />}
      />
    </section>
  );
};

