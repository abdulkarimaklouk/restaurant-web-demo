import { AnalyticsDataSet, AnalyticsDatePreset } from '../types';

export interface InsightTextOptions {
  t: (key: string, options?: Record<string, unknown>) => string;
  preset: AnalyticsDatePreset;
}

/**
 * Generates deterministic business insights based strictly on verified calculations.
 * Never fabricates percentage comparisons when prior data is missing.
 */
export function generateAnalyticsInsights(
  dataSet: AnalyticsDataSet,
  options: InsightTextOptions
): string {
  const { t, preset } = options;

  // 1. Empty period check
  if (!dataSet.ordersByStatus.hasData || dataSet.filteredOrders.length === 0) {
    return t('performance.insights.emptyPeriod');
  }

  const topProduct = dataSet.topSellingProducts.length > 0 ? dataSet.topSellingProducts[0] : null;
  const salesComp = dataSet.kpis.comparisons.totalSales;

  // 2. Comparison label matching active preset
  let periodLabel = t('kpis.vsPriorPeriod');
  if (preset === 'today') periodLabel = t('kpis.vsYesterday');
  else if (preset === 'week') periodLabel = t('kpis.vsLastWeek');
  else if (preset === 'month') periodLabel = t('kpis.vsLastMonth');

  // 3. No prior comparison data handling (seed dataset constraint)
  if (salesComp.status === 'no_prior_data' || salesComp.percentageChange === null) {
    if (topProduct) {
      return t('performance.insights.noComparison', {
        item: topProduct.displayName,
        qty: topProduct.totalQuantity,
      });
    }
    return t('performance.insights.noComparisonNoTop');
  }

  // 4. Comparison data is available
  const pct = Math.abs(salesComp.percentageChange).toFixed(1);
  const itemName = topProduct ? topProduct.displayName : '';

  if (salesComp.difference > 0) {
    return t('performance.insights.growthPositive', {
      pct,
      period: periodLabel,
      item: itemName,
    });
  }

  if (salesComp.difference < 0) {
    return t('performance.insights.growthNegative', {
      pct,
      period: periodLabel,
      item: itemName,
    });
  }

  return t('performance.insights.growthNeutral', {
    period: periodLabel,
    item: itemName,
  });
}

