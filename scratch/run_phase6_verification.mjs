import fs from 'fs';
import path from 'path';

// Import compiled utilities
import {
  generateAnalyticsDataSet,
  calculateRawKpis,
  calculateAnalyticsKpiSummary,
  calculateTopSellingProducts,
  calculateOrdersByStatus,
  filterQualifiedOrders,
} from './compiled_analytics/features/analytics/utils/analyticsCalculations.js';

import { mapProductToMenuItem } from './compiled_analytics/features/analytics/utils/productMappingUtils.js';
import { generateAnalyticsInsights } from './compiled_analytics/features/analytics/utils/insightsGenerator.js';

const testResults = [];

function assert(condition, testNumber, description, details = '') {
  if (condition) {
    testResults.push({ id: testNumber, description, passed: true, details });
    console.log(`[PASS] Test ${testNumber}: ${description}`);
  } else {
    testResults.push({ id: testNumber, description, passed: false, details });
    console.error(`[FAIL] Test ${testNumber}: ${description} -> ${details}`);
  }
}

async function runPhase6Tests() {
  console.log('========================================================================');
  console.log('PHASE 6 AUTOMATED VERIFICATION SUITE: FINAL INTEGRATION & VISUAL QA');
  console.log('========================================================================\n');

  // Load translations
  const enJson = JSON.parse(fs.readFileSync('src/i18n/locales/en/analytics.json', 'utf8'));
  const arJson = JSON.parse(fs.readFileSync('src/i18n/locales/ar/analytics.json', 'utf8'));

  const makeMockT = (localeData) => {
    return (key, options = {}) => {
      const parts = key.split('.');
      let cur = localeData;
      for (const p of parts) {
        if (!cur || cur[p] === undefined) return key;
        cur = cur[p];
      }
      let str = cur;
      for (const [k, v] of Object.entries(options)) {
        str = str.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      }
      return str;
    };
  };

  const tEn = makeMockT(enJson);
  const tAr = makeMockT(arJson);

  // Exact 10 seed orders simulation
  const now = Date.now();
  const seedOrders = [
    {
      id: '1044',
      total: 90,
      createdAt: now - 180 * 60 * 1000,
      paymentStatus: 'pendingConfirmation',
      operationalStatus: 'newOrder',
      items: [{ id: 'm-2', name: 'وجبة دجاج مشوي', quantity: 1, unitPrice: 90, lineTotal: 90 }],
    },
    {
      id: '1045',
      total: 175,
      createdAt: now - 120 * 60 * 1000,
      paymentStatus: 'pendingConfirmation',
      operationalStatus: 'newOrder',
      items: [{ id: 's-1', name: 'شاورما دجاج', quantity: 2, unitPrice: 55, lineTotal: 110 }],
    },
    {
      id: '1046',
      total: 215,
      createdAt: now - 60 * 60 * 1000,
      paymentStatus: 'confirmed',
      operationalStatus: 'newOrder',
      items: [
        { id: 'm-2', name: 'وجبة دجاج مشوي', quantity: 1, unitPrice: 90, lineTotal: 90 },
        { id: 'm-3', name: 'مكرونة بشاميل بالفرن', quantity: 2, unitPrice: 50, lineTotal: 100 },
        { id: 'ds-1', name: 'كيكة الشوكولاتة', quantity: 1, unitPrice: 25, lineTotal: 25 },
      ],
    },
    {
      id: '1047',
      total: 100,
      createdAt: now - 35 * 60 * 1000,
      paymentStatus: 'confirmed',
      operationalStatus: 'newOrder',
      items: [
        { id: 'm-1', name: 'وجبة كشري', quantity: 2, unitPrice: 40, lineTotal: 80 },
        { id: 'd-2', name: 'شاي ساخن', quantity: 2, unitPrice: 10, lineTotal: 20 },
      ],
    },
    {
      id: '1048',
      total: 170,
      createdAt: now - 15 * 60 * 1000,
      paymentStatus: 'confirmed',
      operationalStatus: 'preparing',
      items: [
        { id: 's-1', name: 'شاورما دجاج', quantity: 2, unitPrice: 55, lineTotal: 110 },
        { id: 'd-1', name: 'عصير برتقال طازج', quantity: 2, unitPrice: 30, lineTotal: 60 },
      ],
    },
    {
      id: '1049',
      total: 93,
      createdAt: now - 10 * 60 * 1000,
      paymentStatus: 'confirmed',
      operationalStatus: 'preparing',
      items: [
        { id: 'm-3', name: 'مكرونة بشاميل بالفرن', quantity: 1, unitPrice: 50, lineTotal: 50 },
        { id: 's-4', name: 'بطاطس بالجبنة', quantity: 1, unitPrice: 35, lineTotal: 35 },
        { id: 'd-3', name: 'مياه معدنية', quantity: 1, unitPrice: 8, lineTotal: 8 },
      ],
    },
    {
      id: '1050',
      total: 120,
      createdAt: now - 5 * 60 * 1000,
      paymentStatus: 'confirmed',
      operationalStatus: 'ready',
      items: [
        { id: 'm-2', name: 'وجبة دجاج مشوي', quantity: 1, unitPrice: 90, lineTotal: 90 },
        { id: 'd-1', name: 'عصير برتقال طازج', quantity: 1, unitPrice: 30, lineTotal: 30 },
      ],
    },
    {
      id: '1041',
      total: 60,
      createdAt: now - 90 * 60 * 1000,
      paymentStatus: 'confirmed',
      operationalStatus: 'delivered',
      items: [
        { id: 'm-1', name: 'وجبة كشري', quantity: 1, unitPrice: 40, lineTotal: 40 },
        { id: 'd-2', name: 'شاي ساخن', quantity: 2, unitPrice: 10, lineTotal: 20 },
      ],
    },
    {
      id: '1042',
      total: 48,
      createdAt: now - 80 * 60 * 1000,
      paymentStatus: 'confirmed',
      operationalStatus: 'delivered',
      items: [
        { id: 's-3', name: 'فول وفلافل', quantity: 2, unitPrice: 20, lineTotal: 40 },
        { id: 'd-3', name: 'مياه معدنية', quantity: 1, unitPrice: 8, lineTotal: 8 },
      ],
    },
    {
      id: '1043',
      total: 55,
      createdAt: now - 70 * 60 * 1000,
      paymentStatus: 'confirmed',
      operationalStatus: 'delivered',
      items: [
        { id: 'ds-1', name: 'كيكة الشوكولاتة', quantity: 1, unitPrice: 25, lineTotal: 25 },
        { id: 'd-1', name: 'عصير برتقال طازج', quantity: 1, unitPrice: 30, lineTotal: 30 },
      ],
    },
  ];

  const todayDataSet = generateAnalyticsDataSet(seedOrders, 'today', now);
  const weekDataSet = generateAnalyticsDataSet(seedOrders, 'week', now);
  const monthDataSet = generateAnalyticsDataSet(seedOrders, 'month', now);

  // 1. Preset Switching & KPI Values
  assert(
    todayDataSet.kpis.totalSales === 861 &&
    todayDataSet.kpis.totalOrders === 8 &&
    todayDataSet.kpis.itemsSold === 25 &&
    todayDataSet.kpis.averageOrderValue === 107.63,
    1,
    'Today preset aggregates all 4 KPIs accurately (861 EGP, 8 orders, 25 items, 107.63 AOV)',
    `Sales: ${todayDataSet.kpis.totalSales}, Orders: ${todayDataSet.kpis.totalOrders}, Items: ${todayDataSet.kpis.itemsSold}, AOV: ${todayDataSet.kpis.averageOrderValue}`
  );

  assert(
    weekDataSet.kpis.totalSales === 861 &&
    monthDataSet.kpis.totalSales === 861,
    2,
    'Week and Month presets capture qualifying seed orders consistently',
    `Week Sales: ${weekDataSet.kpis.totalSales}, Month Sales: ${monthDataSet.kpis.totalSales}`
  );

  // 2. Custom Date Range filtering
  const yesterday = new Date(now - 86400000 * 2);
  const customEmptyDataSet = generateAnalyticsDataSet(
    seedOrders,
    'custom',
    now,
    yesterday,
    yesterday
  );
  assert(
    customEmptyDataSet.kpis.totalSales === 0 &&
    customEmptyDataSet.kpis.totalOrders === 0 &&
    customEmptyDataSet.topSellingProducts.length === 0 &&
    customEmptyDataSet.ordersByStatus.totalCount === 0,
    3,
    'Custom date range filtering correctly excludes orders outside custom boundaries',
    `Custom empty sales: ${customEmptyDataSet.kpis.totalSales}, orders: ${customEmptyDataSet.kpis.totalOrders}`
  );

  // 3. Dual Chart Modes: Sales vs Orders
  const salesChart = todayDataSet.chartData.sales;
  const ordersChart = todayDataSet.chartData.orders;
  assert(
    salesChart.buckets.length === 7 &&
    ordersChart.buckets.length === 7 &&
    salesChart.buckets[0].label === '10 AM' &&
    salesChart.buckets[6].label === '10 PM',
    4,
    'Sales and Orders chart modes share identical 7-bucket timeline (10 AM to 10 PM)',
    `Buckets: ${salesChart.buckets.map((b) => b.label).join(', ')}`
  );

  // 4. Strict Financial Conservation
  const displayedSalesSum = salesChart.buckets.reduce((acc, b) => acc + b.sales, 0);
  const totalAccountedSales = Math.round((displayedSalesSum + salesChart.outOfChartHours.sales) * 100) / 100;
  assert(
    totalAccountedSales === todayDataSet.kpis.totalSales,
    5,
    'Chart sales reconcile exactly with Total Sales KPI (displayed + outOfChartHours === totalSales)',
    `Displayed: ${displayedSalesSum}, Out of hours: ${salesChart.outOfChartHours.sales}, KPI: ${todayDataSet.kpis.totalSales}`
  );

  const displayedOrdersSum = ordersChart.buckets.reduce((acc, b) => acc + b.orders, 0);
  const totalAccountedOrders = displayedOrdersSum + ordersChart.outOfChartHours.orders;
  assert(
    totalAccountedOrders === todayDataSet.kpis.totalOrders,
    6,
    'Chart orders reconcile exactly with Total Orders KPI (displayed + outOfChartHours === totalOrders)',
    `Displayed: ${displayedOrdersSum}, Out of hours: ${ordersChart.outOfChartHours.orders}, KPI: ${todayDataSet.kpis.totalOrders}`
  );

  // 5. Cross-Section Consistency: KPI Orders == Donut Total Orders
  assert(
    todayDataSet.kpis.totalOrders === todayDataSet.ordersByStatus.totalCount &&
    todayDataSet.ordersByStatus.totalCount === 8,
    7,
    'KPI Total Orders strictly equals OrdersByStatus totalCount',
    `KPI Orders: ${todayDataSet.kpis.totalOrders}, Donut totalCount: ${todayDataSet.ordersByStatus.totalCount}`
  );

  // 6. Cross-Section Consistency: Top Selling Items sum of all product quantities == KPI Items Sold
  const confirmedOrders = filterQualifiedOrders(seedOrders);
  const allSoldProducts = calculateTopSellingProducts(confirmedOrders, 100);
  const totalQuantityAcrossAllProducts = allSoldProducts.reduce((sum, p) => sum + p.totalQuantity, 0);
  assert(
    totalQuantityAcrossAllProducts === todayDataSet.kpis.itemsSold &&
    todayDataSet.kpis.itemsSold === 25,
    8,
    'Sum of all product quantities in Top Selling aggregation matches KPI Items Sold (25 units)',
    `Top selling total units: ${totalQuantityAcrossAllProducts}, KPI itemsSold: ${todayDataSet.kpis.itemsSold}`
  );

  // 7. Deterministic Top Selling Ranking & Tiebreaker
  assert(
    todayDataSet.topSellingProducts[0].displayName === 'عصير برتقال طازج' &&
    todayDataSet.topSellingProducts[0].totalQuantity === 4 &&
    todayDataSet.topSellingProducts[0].totalRevenue === 120 &&
    todayDataSet.topSellingProducts[1].displayName === 'شاي ساخن' &&
    todayDataSet.topSellingProducts[1].totalQuantity === 4 &&
    todayDataSet.topSellingProducts[1].totalRevenue === 40,
    9,
    'Top selling rankings deterministically break ties by total revenue descending',
    `#1: ${todayDataSet.topSellingProducts[0].displayName} (${todayDataSet.topSellingProducts[0].totalRevenue} EGP), #2: ${todayDataSet.topSellingProducts[1].displayName} (${todayDataSet.topSellingProducts[1].totalRevenue} EGP)`
  );

  // 8. Orders by Status: Exact 1-decimal-place percentages summing to 100.0%
  const stItems = todayDataSet.ordersByStatus.items;
  const stMap = Object.fromEntries(stItems.map((i) => [i.status, i]));
  const sumOfFormattedPct =
    parseFloat(stMap.delivered.percentage.toFixed(1)) +
    parseFloat(stMap.ready.percentage.toFixed(1)) +
    parseFloat(stMap.preparing.percentage.toFixed(1)) +
    parseFloat(stMap.newOrder.percentage.toFixed(1));
  assert(
    stMap.delivered.percentage.toFixed(1) === '37.5' &&
    stMap.ready.percentage.toFixed(1) === '12.5' &&
    stMap.preparing.percentage.toFixed(1) === '25.0' &&
    stMap.newOrder.percentage.toFixed(1) === '25.0' &&
    sumOfFormattedPct.toFixed(1) === '100.0',
    10,
    'Orders by status percentages format to 1 decimal place (37.5%, 12.5%, 25.0%, 25.0%) and sum to 100.0%',
    `Sum: ${sumOfFormattedPct.toFixed(1)}%`
  );

  // 9. Exclusion of pendingConfirmation orders
  const pendingIds = ['1044', '1045'];
  const hasPendingInConfirmed = seedOrders
    .filter((o) => o.paymentStatus === 'confirmed')
    .some((o) => pendingIds.includes(o.id));
  assert(
    hasPendingInConfirmed === false &&
    todayDataSet.kpis.totalSales === 861,
    11,
    'Pending confirmation orders (#1044 and #1045) are completely excluded from financial KPIs',
    `Confirmed sales: ${todayDataSet.kpis.totalSales} EGP (uninflated)`
  );

  // 10. No fabricated values or comparison growth percentages
  assert(
    todayDataSet.kpis.comparisons.totalSales.status === 'no_prior_data' &&
    todayDataSet.kpis.comparisons.totalSales.percentageChange === null,
    12,
    'Prior comparison metrics return status "no_prior_data" with null percentage without fabricating values',
    `Status: ${todayDataSet.kpis.comparisons.totalSales.status}, percentageChange: ${todayDataSet.kpis.comparisons.totalSales.percentageChange}`
  );

  // 11. Cross-Section Consistency: Insights reflect Top Selling #1 item
  const insightEn = generateAnalyticsInsights(todayDataSet, { t: tEn, preset: 'today' });
  const insightAr = generateAnalyticsInsights(todayDataSet, { t: tAr, preset: 'today' });
  assert(
    insightEn.includes(todayDataSet.topSellingProducts[0].displayName) &&
    insightEn.includes(`${todayDataSet.topSellingProducts[0].totalQuantity} units sold`) &&
    insightAr.includes(todayDataSet.topSellingProducts[0].displayName) &&
    insightAr.includes(`${todayDataSet.topSellingProducts[0].totalQuantity} وحدات مباعة`),
    13,
    'Analytics Insights seamlessly reflects top selling product name and unit count',
    `Insight En: ${insightEn}`
  );

  // 12. Empty-Period Behavior
  const emptyDataSet = generateAnalyticsDataSet([], 'today', now);
  const emptyInsight = generateAnalyticsInsights(emptyDataSet, { t: tEn, preset: 'today' });
  assert(
    emptyDataSet.kpis.totalSales === 0 &&
    emptyDataSet.kpis.totalOrders === 0 &&
    emptyDataSet.chartData.sales.hasData === false &&
    emptyDataSet.topSellingProducts.length === 0 &&
    emptyDataSet.ordersByStatus.hasData === false &&
    emptyInsight === 'No order activity recorded for the selected period.',
    14,
    'Empty data period yields clean zero metrics and localized empty state without crashing',
    `Empty insight: ${emptyInsight}`
  );

  // 13. Mobile Viewport Constraints (390 CSS px baseline)
  const pageCss = fs.readFileSync('src/features/analytics/AnalyticsPage.css', 'utf8');
  const chartCss = fs.readFileSync('src/features/analytics/components/SalesOverviewChart.css', 'utf8');
  const perfGridCss = fs.readFileSync('src/features/analytics/AnalyticsPage.css', 'utf8');
  assert(
    perfGridCss.includes('grid-template-columns: repeat(2, 1fr)') &&
    perfGridCss.includes('width: calc(100% - 32px)') &&
    chartCss.includes('width: calc(100% - 32px)'),
    15,
    'Container styles enforce 16px lateral margins (calc(100% - 32px)) preventing mobile horizontal overflow',
    'Width clamping verified'
  );

  // 14. Bottom Navigation Clearance
  assert(
    pageCss.includes('padding-bottom: calc(72px + env(safe-area-inset-bottom, 16px))'),
    16,
    'Scrolling container provides 72px + safe-area bottom navigation clearance',
    'Bottom nav clearance confirmed'
  );

  // 15. Translation Keys Completeness (Arabic & English)
  const requiredKeys = [
    'title',
    'presets.today',
    'presets.week',
    'presets.month',
    'presets.custom',
    'kpis.totalSales',
    'kpis.totalOrders',
    'kpis.itemsSold',
    'kpis.avgOrderValue',
    'chart.title',
    'chart.modes.sales',
    'chart.modes.orders',
    'performance.topSelling.title',
    'performance.ordersStatus.title',
    'performance.insights.title',
  ];
  const missingEn = requiredKeys.filter((k) => tEn(k) === k);
  const missingAr = requiredKeys.filter((k) => tAr(k) === k);
  assert(
    missingEn.length === 0 && missingAr.length === 0,
    17,
    'All required analytics UI translation keys exist in both English and Arabic',
    `Missing En: ${missingEn.length}, Missing Ar: ${missingAr.length}`
  );

  // 16. Dark Theme Color Token System
  const donutCss = fs.readFileSync('src/features/analytics/components/OrdersByStatusDonut.css', 'utf8');
  const topCss = fs.readFileSync('src/features/analytics/components/TopSellingItems.css', 'utf8');
  const insightsCss = fs.readFileSync('src/features/analytics/components/AnalyticsInsights.css', 'utf8');
  assert(
    donutCss.includes('[data-theme="dark"]') &&
    topCss.includes('[data-theme="dark"]') &&
    insightsCss.includes('[data-theme="dark"]') &&
    chartCss.includes('[data-theme="dark"]'),
    18,
    'Comprehensive [data-theme="dark"] selectors are implemented across all Analytics subcomponents',
    'Dark theme styles verified'
  );

  console.log('\n========================================================================');
  const passed = testResults.filter((t) => t.passed).length;
  console.log(`VERIFICATION SUMMARY: ${passed} / ${testResults.length} TESTS PASSED`);
  console.log('========================================================================');

  if (passed !== testResults.length) {
    process.exit(1);
  }
}

runPhase6Tests().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
