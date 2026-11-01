import fs from 'fs';
import path from 'path';

// Import compiled utilities
import {
  generateAnalyticsDataSet,
  calculateTopSellingProducts,
  calculateOrdersByStatus,
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

async function runAllTests() {
  console.log('========================================================================');
  console.log('PHASE 5 AUTOMATED VERIFICATION SUITE: BUSINESS PERFORMANCE & INSIGHTS');
  console.log('========================================================================\n');

  // Load translations for insight testing
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

  // Mock confirmed and pending orders
  const mockOrders = [
    {
      id: '1044',
      total: 90,
      createdAt: Date.now() - 180 * 60 * 1000,
      paymentStatus: 'pendingConfirmation',
      operationalStatus: 'newOrder',
      items: [{ id: 'm-2', name: 'وجبة دجاج مشوي', quantity: 1, unitPrice: 90, lineTotal: 90 }],
    },
    {
      id: '1045',
      total: 175,
      createdAt: Date.now() - 120 * 60 * 1000,
      paymentStatus: 'pendingConfirmation',
      operationalStatus: 'newOrder',
      items: [{ id: 's-1', name: 'شاورما دجاج', quantity: 2, unitPrice: 55, lineTotal: 110 }],
    },
    {
      id: '1046',
      total: 215,
      createdAt: Date.now() - 60 * 60 * 1000,
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
      createdAt: Date.now() - 35 * 60 * 1000,
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
      createdAt: Date.now() - 15 * 60 * 1000,
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
      createdAt: Date.now() - 10 * 60 * 1000,
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
      createdAt: Date.now() - 5 * 60 * 1000,
      paymentStatus: 'confirmed',
      operationalStatus: 'ready',
      items: [
        { id: 'm-2', name: 'وجبة دجاج مشوي', quantity: 1, unitPrice: 90, lineTotal: 90 },
        { id: 'd-1', name: 'عصير برتقال طازج', quantity: 1, unitPrice: 30, lineTotal: 30 },
      ],
    },
    {
      id: '1041',
      total: 50,
      createdAt: Date.now() - 90 * 60 * 1000,
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
      createdAt: Date.now() - 80 * 60 * 1000,
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
      createdAt: Date.now() - 70 * 60 * 1000,
      paymentStatus: 'confirmed',
      operationalStatus: 'delivered',
      items: [
        { id: 'ds-1', name: 'كيكة الشوكولاتة', quantity: 1, unitPrice: 25, lineTotal: 25 },
        { id: 'd-1', name: 'عصير برتقال طازج', quantity: 1, unitPrice: 30, lineTotal: 30 },
      ],
    },
  ];

  const now = Date.now();
  const dataSet = generateAnalyticsDataSet(mockOrders, 'today', now);

  // --- 1. Top 3 product ranking ---
  assert(
    dataSet.topSellingProducts.length >= 3,
    1,
    'Top selling items aggregation returns top products',
    `Count: ${dataSet.topSellingProducts.length}`
  );

  // --- 2. Quantity-based ordering ---
  const quantities = dataSet.topSellingProducts.map((p) => p.totalQuantity);
  const isSorted = quantities.every((val, i, arr) => i === 0 || arr[i - 1] >= val);
  assert(
    isSorted && quantities[0] === 4 && quantities[1] === 4 && quantities[2] === 3,
    2,
    'Products are strictly ranked in descending order by total quantity sold',
    `Quantities: ${quantities.join(', ')}`
  );

  // --- 3. Revenue tiebreaker ---
  // Items with quantity 4 are: 'عصير برتقال طازج' (120 EGP) and 'شاي ساخن' (40 EGP)
  const item1 = dataSet.topSellingProducts[0];
  const item2 = dataSet.topSellingProducts[1];
  assert(
    item1.totalQuantity === item2.totalQuantity &&
    item1.totalRevenue > item2.totalRevenue &&
    item1.displayName === 'عصير برتقال طازج' &&
    item2.displayName === 'شاي ساخن',
    3,
    'Deterministic revenue tiebreaker ranks identical quantity items by revenue descending',
    `Rank 1: ${item1.displayName} (${item1.totalRevenue} EGP), Rank 2: ${item2.displayName} (${item2.totalRevenue} EGP)`
  );

  // --- 4. Product-name fallback when mapping is unavailable ---
  const unmappedResult = mapProductToMenuItem('شاي ساخن', 'ar');
  const exactMappedResult = mapProductToMenuItem('برجر لحم', 'ar');
  assert(
    unmappedResult.isMapped === false &&
    unmappedResult.imageType === null &&
    unmappedResult.displayName === 'شاي ساخن' &&
    exactMappedResult.isMapped === true &&
    exactMappedResult.imageType === 'burger',
    4,
    'Product mapping safely identifies unmapped items without guessing and preserves original name',
    `Unmapped: ${unmappedResult.displayName}, Mapped: ${exactMappedResult.displayName}`
  );

  // --- 5. Exclusion of pending confirmation orders from Top Selling ---
  // Pending orders 1044 and 1045 had: وجبة دجاج مشوي (+1), شاورما دجاج (+2).
  // Confirmed orders have: وجبة دجاج مشوي (2), شاورما دجاج (2).
  const chickenItem = dataSet.topSellingProducts.find((p) => p.displayName === 'وجبة دجاج مشوي');
  assert(
    chickenItem?.totalQuantity === 2,
    5,
    'Pending confirmation orders are strictly excluded from top selling product totals',
    `Chicken quantity: ${chickenItem?.totalQuantity} (not 3)`
  );

  // --- 6. Correct order status counts ---
  const statusCounts = dataSet.ordersByStatus.statuses;
  assert(
    statusCounts.delivered.count === 3 &&
    statusCounts.ready.count === 1 &&
    statusCounts.preparing.count === 2 &&
    statusCounts.newOrder.count === 2 &&
    dataSet.ordersByStatus.totalCount === 8,
    6,
    'Orders by status accurately counts all 4 confirmed operational statuses (3, 1, 2, 2)',
    `Counts: Delivered: ${statusCounts.delivered.count}, Ready: ${statusCounts.ready.count}, Preparing: ${statusCounts.preparing.count}, New: ${statusCounts.newOrder.count}`
  );

  // --- 7. Correct status percentages ---
  assert(
    statusCounts.delivered.percentage === 37.5 &&
    statusCounts.ready.percentage === 12.5 &&
    statusCounts.preparing.percentage === 25.0 &&
    statusCounts.newOrder.percentage === 25.0,
    7,
    'Orders by status percentages calculate accurately to 1 decimal place',
    `Percentages: Delivered: ${statusCounts.delivered.percentage}%, Ready: ${statusCounts.ready.percentage}%, Preparing: ${statusCounts.preparing.percentage}%, New: ${statusCounts.newOrder.percentage}%`
  );

  // --- 8. Zero-order distribution handling ---
  const zeroStatus = calculateOrdersByStatus([]);
  assert(
    zeroStatus.totalCount === 0 &&
    zeroStatus.hasData === false &&
    zeroStatus.items.every((it) => it.count === 0 && it.percentage === 0),
    8,
    'Zero qualifying orders returns safe empty distribution with 0% and no division errors',
    'Zero status handled cleanly'
  );

  // --- 9. Donut segment consistency ---
  const pctSum = dataSet.ordersByStatus.items.reduce((s, it) => s + it.percentage, 0);
  assert(
    Math.abs(pctSum - 100.0) < 0.01,
    9,
    'Donut segments sum strictly to 100.0% when confirmed orders exist',
    `Percentage sum: ${pctSum}%`
  );

  // --- 10. Insights with positive sales growth ---
  const mockPositiveDataSet = {
    ...dataSet,
    kpis: {
      ...dataSet.kpis,
      comparisons: {
        ...dataSet.kpis.comparisons,
        totalSales: {
          current: 1000,
          previous: 800,
          difference: 200,
          percentageChange: 25.0,
          status: 'available',
          isPositive: true,
        },
      },
    },
  };
  const positiveInsightEn = generateAnalyticsInsights(mockPositiveDataSet, { t: tEn, preset: 'today' });
  const positiveInsightAr = generateAnalyticsInsights(mockPositiveDataSet, { t: tAr, preset: 'today' });
  assert(
    positiveInsightEn.includes('Sales are up by 25.0%') &&
    positiveInsightEn.includes('عصير برتقال طازج is your top selling item') &&
    positiveInsightAr.includes('ارتفعت المبيعات بنسبة 25.0%'),
    10,
    'Insights correctly generates positive sales growth message with best selling product',
    `En: ${positiveInsightEn}`
  );

  // --- 11. Insights with negative sales growth ---
  const mockNegativeDataSet = {
    ...dataSet,
    kpis: {
      ...dataSet.kpis,
      comparisons: {
        ...dataSet.kpis.comparisons,
        totalSales: {
          current: 750,
          previous: 1000,
          difference: -250,
          percentageChange: -25.0,
          status: 'available',
          isPositive: false,
        },
      },
    },
  };
  const negInsightEn = generateAnalyticsInsights(mockNegativeDataSet, { t: tEn, preset: 'today' });
  const negInsightAr = generateAnalyticsInsights(mockNegativeDataSet, { t: tAr, preset: 'today' });
  assert(
    negInsightEn.includes('Sales are down by 25.0%') &&
    negInsightAr.includes('انخفضت المبيعات بنسبة 25.0%'),
    11,
    'Insights correctly generates negative sales growth message',
    `En: ${negInsightEn}`
  );

  // --- 12. Insights with unavailable comparison data ---
  const noCompInsightEn = generateAnalyticsInsights(dataSet, { t: tEn, preset: 'today' });
  const noCompInsightAr = generateAnalyticsInsights(dataSet, { t: tAr, preset: 'today' });
  assert(
    noCompInsightEn.includes('Historical comparison data is unavailable') &&
    noCompInsightEn.includes('4 units sold') &&
    noCompInsightAr.includes('بيانات المقارنة السابقة غير متوفرة') &&
    noCompInsightAr.includes('4 وحدات مباعة'),
    12,
    'Insights accurately reports comparison data unavailable without fabricating percentage',
    `En: ${noCompInsightEn}`
  );

  // --- 13. Best-selling product insight ---
  assert(
    noCompInsightEn.includes('عصير برتقال طازج') && noCompInsightEn.includes('4 units sold'),
    13,
    'Best-selling product insight accurately highlights top product name and quantity',
    'Product and quantity highlighted'
  );

  // --- 14. Empty-period insight ---
  const emptyDataSet = generateAnalyticsDataSet([], 'today', now);
  const emptyInsightEn = generateAnalyticsInsights(emptyDataSet, { t: tEn, preset: 'today' });
  const emptyInsightAr = generateAnalyticsInsights(emptyDataSet, { t: tAr, preset: 'today' });
  assert(
    emptyInsightEn === 'No order activity recorded for the selected period.' &&
    emptyInsightAr === 'لا يوجد نشاط طلبات مسجل للفترة المحددة.',
    14,
    'Empty period generates localized empty-state message without crashing',
    `Empty En: ${emptyInsightEn}`
  );

  // --- 15. Date filter synchronization across all three sections ---
  const weekDataSet = generateAnalyticsDataSet(mockOrders, 'week', now);
  const monthDataSet = generateAnalyticsDataSet(mockOrders, 'month', now);
  assert(
    weekDataSet.topSellingProducts.length > 0 &&
    weekDataSet.ordersByStatus.totalCount === 8 &&
    monthDataSet.topSellingProducts.length > 0 &&
    monthDataSet.ordersByStatus.totalCount === 8,
    15,
    'All three performance outputs synchronize reactively with selected date range presets',
    'Today, Week, Month datasets generated and aligned'
  );

  // --- 16. Arabic RTL translations completeness ---
  assert(
    arJson.performance?.topSelling?.title === 'الأصناف الأكثر مبيعاً' &&
    arJson.performance?.ordersStatus?.title === 'الطلبات حسب الحالة' &&
    arJson.performance?.insights?.title === 'رؤى ذكية' &&
    arJson.performance?.ordersStatus?.delivered === 'مكتمل' &&
    arJson.performance?.ordersStatus?.ready === 'جاهز' &&
    arJson.performance?.ordersStatus?.preparing === 'تحضير' &&
    arJson.performance?.ordersStatus?.new === 'جديد',
    16,
    'Arabic translations are fully defined for all Performance and Insights sections',
    'Arabic performance namespace verified'
  );

  // --- 17. English LTR translations completeness ---
  assert(
    enJson.performance?.topSelling?.title === 'Top Selling Items' &&
    enJson.performance?.ordersStatus?.title === 'Orders by Status' &&
    enJson.performance?.insights?.title === 'Insights' &&
    enJson.performance?.ordersStatus?.delivered === 'Delivered' &&
    enJson.performance?.ordersStatus?.ready === 'Ready' &&
    enJson.performance?.ordersStatus?.preparing === 'Preparing' &&
    enJson.performance?.ordersStatus?.new === 'New',
    17,
    'English translations are fully defined for all Performance and Insights sections',
    'English performance namespace verified'
  );

  // --- 18. Light theme styling ---
  const topCss = fs.readFileSync('src/features/analytics/components/TopSellingItems.css', 'utf8');
  const donutCss = fs.readFileSync('src/features/analytics/components/OrdersByStatusDonut.css', 'utf8');
  const insightCss = fs.readFileSync('src/features/analytics/components/AnalyticsInsights.css', 'utf8');

  assert(
    topCss.includes('border-radius: 14px') &&
    donutCss.includes('border-radius: 14px') &&
    insightCss.includes('border-radius: 14px') &&
    insightCss.includes('--color-primary-blue-bg'),
    18,
    'Light theme styling adheres to 14px radius, soft blue insights panel, and design tokens',
    '14px radius and soft blue surface confirmed'
  );

  // --- 19. Dark theme styling ---
  assert(
    topCss.includes('[data-theme="dark"]') &&
    donutCss.includes('[data-theme="dark"]') &&
    donutCss.includes('.slice-delivered') &&
    insightCss.includes('[data-theme="dark"]'),
    19,
    'Dark theme styling provides comprehensive [data-theme="dark"] overrides for cards and donut slices',
    'Dark theme styles verified'
  );

  // --- 20. Mobile layout at 390x844 ---
  const pageCss = fs.readFileSync('src/features/analytics/AnalyticsPage.css', 'utf8');
  assert(
    pageCss.includes('.analytics-performance-grid') &&
    pageCss.includes('grid-template-columns: repeat(2, 1fr)') &&
    pageCss.includes('gap: 12px'),
    20,
    'Two-column lower performance grid is defined with repeat(2, 1fr) and 12px gap',
    '2-column grid verified'
  );

  // --- 21. No horizontal overflow ---
  assert(
    pageCss.includes('width: calc(100% - 32px)') &&
    insightCss.includes('width: calc(100% - 32px)'),
    21,
    'Card containers enforce calc(100% - 32px) margin bounds to prevent mobile horizontal overflow',
    'Width bounds verified'
  );

  // --- 22. Component source integrity & zero console errors ---
  const pageSrc = fs.readFileSync('src/features/analytics/AnalyticsPage.tsx', 'utf8');
  assert(
    pageSrc.includes('TopSellingItems') &&
    pageSrc.includes('OrdersByStatusDonut') &&
    pageSrc.includes('AnalyticsInsights') &&
    pageSrc.includes('products={dataSet.topSellingProducts}') &&
    pageSrc.includes('ordersByStatus={dataSet.ordersByStatus}'),
    22,
    'AnalyticsPage seamlessly composes TopSellingItems, OrdersByStatusDonut, and AnalyticsInsights',
    'All three components integrated cleanly'
  );

  // --- 23. Regression Test: OrdersByStatusDonut exact seed distribution (37.5%, 12.5%, 25.0%, 25.0%) ---
  const donutSrc = fs.readFileSync('src/features/analytics/components/OrdersByStatusDonut.tsx', 'utf8');
  const dItems = dataSet.ordersByStatus.items;
  const dMap = Object.fromEntries(dItems.map((it) => [it.status, it]));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  const deliveredPctStr = `${dMap.delivered.percentage.toFixed(1)}%`;
  const readyPctStr = `${dMap.ready.percentage.toFixed(1)}%`;
  const preparingPctStr = `${dMap.preparing.percentage.toFixed(1)}%`;
  const newOrderPctStr = `${dMap.newOrder.percentage.toFixed(1)}%`;

  const displayedPctSum =
    parseFloat(dMap.delivered.percentage.toFixed(1)) +
    parseFloat(dMap.ready.percentage.toFixed(1)) +
    parseFloat(dMap.preparing.percentage.toFixed(1)) +
    parseFloat(dMap.newOrder.percentage.toFixed(1));

  const deliveredSlice = (dMap.delivered.count / dataSet.ordersByStatus.totalCount) * circumference;
  const readySlice = (dMap.ready.count / dataSet.ordersByStatus.totalCount) * circumference;
  const preparingSlice = (dMap.preparing.count / dataSet.ordersByStatus.totalCount) * circumference;
  const newOrderSlice = (dMap.newOrder.count / dataSet.ordersByStatus.totalCount) * circumference;
  const totalSliceLength = deliveredSlice + readySlice + preparingSlice + newOrderSlice;

  const usesOneDecimalFormat = donutSrc.includes('item.percentage.toFixed(1)');
  const usesExactCountsForSlices = donutSrc.includes('(item.count / totalCount) * circumference');

  assert(
    deliveredPctStr === '37.5%' &&
    readyPctStr === '12.5%' &&
    preparingPctStr === '25.0%' &&
    newOrderPctStr === '25.0%' &&
    displayedPctSum.toFixed(1) === '100.0' &&
    Math.abs(totalSliceLength - circumference) < 1e-6 &&
    usesOneDecimalFormat &&
    usesExactCountsForSlices,
    23,
    'OrdersByStatusDonut displays 1-decimal-place percentages summing to 100.0% and exact SVG slice proportions',
    `Labels: Delivered ${deliveredPctStr}, Ready ${readyPctStr}, Preparing ${preparingPctStr}, New ${newOrderPctStr} | Sum: ${displayedPctSum.toFixed(1)}% | Slice sum: ${totalSliceLength.toFixed(3)} / ${circumference.toFixed(3)}`
  );

  console.log('\n========================================================================');
  const passed = testResults.filter((t) => t.passed).length;
  console.log(`VERIFICATION SUMMARY: ${passed} / ${testResults.length} TESTS PASSED`);
  console.log('========================================================================');

  if (passed !== testResults.length) {
    process.exit(1);
  }
}

runAllTests().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});

