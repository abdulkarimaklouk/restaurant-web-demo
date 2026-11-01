import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import compiled utilities
import {
  resolveDatePreset,
  isTimestampInRange,
  getDaysInMonth,
  generateChartBucketTemplates,
} from './compiled_analytics/features/analytics/utils/dateRangeUtils.js';

import {
  filterQualifiedOrders,
  calculateMetricComparison,
  calculateRawKpis,
  calculateAnalyticsKpiSummary,
  aggregateSalesAndOrders,
  calculateTopSellingProducts,
  calculateOrdersByStatus,
  generateAnalyticsDataSet,
  normalizeProductName,
} from './compiled_analytics/features/analytics/utils/analyticsCalculations.js';

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
  console.log('===============================================================');
  console.log('PHASE 2 AUTOMATED VERIFICATION SUITE: DATA LAYER & CALCULATIONS');
  console.log('===============================================================\n');

  // Reference test date: Wednesday, Nov 4, 2026, 14:30:00 local time
  const testNow = new Date(2026, 10, 4, 14, 30, 0, 0); // Month 10 is November in JS

  // -------------------------------------------------------------------------
  // 1. Today date range boundaries
  // -------------------------------------------------------------------------
  {
    const { currentRange, comparisonRange } = resolveDatePreset('today', testNow);
    const start = new Date(currentRange.start);
    const end = new Date(currentRange.end);
    const isMidStart = start.getHours() === 0 && start.getMinutes() === 0 && start.getDate() === 4;
    const isMidEnd = end.getHours() === 0 && end.getMinutes() === 0 && end.getDate() === 5;
    const isDuration24h = currentRange.end - currentRange.start === 86400000;

    assert(
      isMidStart && isMidEnd && isDuration24h,
      1,
      'Today date range boundaries: starts at local midnight (Nov 4) and ends at start of tomorrow (Nov 5) [start, end) = 24h',
      `start=${start.toISOString()}, end=${end.toISOString()}`
    );
  }

  // -------------------------------------------------------------------------
  // 2. Saturday week start
  // -------------------------------------------------------------------------
  {
    // For Wednesday Nov 4, 2026: Saturday of that week is Oct 31, 2026
    const { currentRange } = resolveDatePreset('week', testNow);
    const weekStart = new Date(currentRange.start);
    const isSaturday = weekStart.getDay() === 6; // 6 = Saturday in JS
    const isOct31 = weekStart.getFullYear() === 2026 && weekStart.getMonth() === 9 && weekStart.getDate() === 31;
    const isMidnight = weekStart.getHours() === 0 && weekStart.getMinutes() === 0;

    assert(
      isSaturday && isOct31 && isMidnight,
      2,
      'Saturday week start: for Wed Nov 4, 2026, the business week starts on Saturday Oct 31, 2026 at 00:00:00 local time',
      `weekStart=${weekStart.toLocaleDateString()} (Day=${weekStart.getDay()})`
    );
  }

  // -------------------------------------------------------------------------
  // 3. Friday week end
  // -------------------------------------------------------------------------
  {
    const { currentRange } = resolveDatePreset('week', testNow);
    const weekEnd = new Date(currentRange.end);
    // End is exclusive boundary at Saturday Nov 7 00:00:00 (encompassing all of Friday Nov 6 up to 23:59:59.999)
    const isNextSaturday = weekEnd.getDay() === 6;
    const isNov7 = weekEnd.getFullYear() === 2026 && weekEnd.getMonth() === 10 && weekEnd.getDate() === 7;
    const isDuration7Days = currentRange.end - currentRange.start === 7 * 86400000;

    assert(
      isNextSaturday && isNov7 && isDuration7Days,
      3,
      'Friday week end: week ends at Friday 23:59:59.999 (exclusive boundary Saturday Nov 7 00:00), total duration = 7 days',
      `weekEnd=${weekEnd.toLocaleDateString()}`
    );
  }

  // -------------------------------------------------------------------------
  // 4. Week transitions across months
  // -------------------------------------------------------------------------
  {
    // The test week started Oct 31 (month 9) and ends Nov 7 (month 10)
    const { currentRange, comparisonRange } = resolveDatePreset('week', testNow);
    const startMonth = new Date(currentRange.start).getMonth();
    const endMonth = new Date(currentRange.end).getMonth();
    const crossMonth = startMonth === 9 && endMonth === 10;
    const compWeekStart = new Date(comparisonRange.start);
    const isCompSat = compWeekStart.getDay() === 6;

    assert(
      crossMonth && isCompSat,
      4,
      'Week transitions across months: correctly bridges Oct 31 to Nov 7 without month-boundary artifacts',
      `startMonth=${startMonth}, endMonth=${endMonth}`
    );
  }

  // -------------------------------------------------------------------------
  // 5. Month and year boundaries
  // -------------------------------------------------------------------------
  {
    // Test on Jan 15, 2027: Previous month is Dec 2026 (year transition)
    const janDate = new Date(2027, 0, 15, 10, 0, 0);
    const { currentRange, comparisonRange } = resolveDatePreset('month', janDate);
    const mStart = new Date(currentRange.start);
    const mEnd = new Date(currentRange.end);
    const compStart = new Date(comparisonRange.start);

    const isJan1 = mStart.getFullYear() === 2027 && mStart.getMonth() === 0 && mStart.getDate() === 1;
    const isFeb1 = mEnd.getFullYear() === 2027 && mEnd.getMonth() === 1 && mEnd.getDate() === 1;
    const isDec2026 = compStart.getFullYear() === 2026 && compStart.getMonth() === 11 && compStart.getDate() === 1;

    // Test leap year: Feb 2024 has 29 days, Feb 2023 has 28 days
    const leapDays = getDaysInMonth(2024, 1);
    const nonLeapDays = getDaysInMonth(2023, 1);
    const isLeapHandled = leapDays === 29 && nonLeapDays === 28;

    assert(
      isJan1 && isFeb1 && isDec2026 && isLeapHandled,
      5,
      'Month and year boundaries: Jan 15 compares to Dec 2026; leap year February has 29 days vs 28 days',
      `compYear=${compStart.getFullYear()}, leap2024=${leapDays}`
    );
  }

  // -------------------------------------------------------------------------
  // 6. Custom range inclusive/exclusive behavior
  // -------------------------------------------------------------------------
  {
    // Custom range: Nov 10, 2026 through Nov 12, 2026
    const customS = new Date(2026, 10, 10);
    const customE = new Date(2026, 10, 12);
    const { currentRange, comparisonRange } = resolveDatePreset('custom', testNow, customS, customE);

    const sDate = new Date(currentRange.start);
    const eDate = new Date(currentRange.end);
    const isStartNov10 = sDate.getDate() === 10 && sDate.getHours() === 0;
    const isEndNov13 = eDate.getDate() === 13 && eDate.getHours() === 0; // Exclusive next-day boundary covering all of Nov 12
    const durationDays = (currentRange.end - currentRange.start) / 86400000;
    const compDurationDays = (comparisonRange.end - comparisonRange.start) / 86400000;
    const isCompImmediatelyPreceding = comparisonRange.end === currentRange.start;

    assert(
      isStartNov10 && isEndNov13 && durationDays === 3 && compDurationDays === 3 && isCompImmediatelyPreceding,
      6,
      'Custom range: start inclusive (Nov 10 00:00), end inclusive with exclusive next-day boundary (Nov 13 00:00), comparison has identical 3-day duration immediately preceding start',
      `durationDays=${durationDays}, compDurationDays=${compDurationDays}`
    );
  }

  // -------------------------------------------------------------------------
  // 7. Correct timezone-local aggregation
  // -------------------------------------------------------------------------
  {
    // Using local getters ensures local calendar alignment
    const { currentRange } = resolveDatePreset('today', testNow);
    const localStart = new Date(currentRange.start);
    const isLocalMidnight =
      localStart.getHours() === 0 &&
      localStart.getMinutes() === 0 &&
      localStart.getSeconds() === 0 &&
      localStart.getMilliseconds() === 0;

    assert(
      isLocalMidnight,
      7,
      'Correct timezone-local aggregation: range boundaries adhere strictly to local calendar midnight without UTC offset skew',
      `localHour=${localStart.getHours()}`
    );
  }

  // -------------------------------------------------------------------------
  // 8. Confirmed versus pending order qualification
  // -------------------------------------------------------------------------
  {
    const mockOrders = [
      { id: '1', paymentStatus: 'confirmed', total: 100, createdAt: testNow.getTime(), items: [] },
      { id: '2', paymentStatus: 'pendingConfirmation', total: 500, createdAt: testNow.getTime(), items: [] },
      { id: '3', paymentStatus: 'confirmed', total: 50, createdAt: testNow.getTime(), items: [] },
      { id: '4', paymentStatus: 'pendingConfirmation', total: 200, createdAt: testNow.getTime(), items: [] },
    ];

    const qualified = filterQualifiedOrders(mockOrders);
    const allAreConfirmed = qualified.every((o) => o.paymentStatus === 'confirmed');
    const countIs2 = qualified.length === 2;
    const totalIs150 = qualified.reduce((s, o) => s + o.total, 0) === 150;

    assert(
      allAreConfirmed && countIs2 && totalIs150,
      8,
      'Confirmed versus pending order qualification: orders with pendingConfirmation are excluded from analytics, preventing revenue inflation',
      `qualifiedCount=${qualified.length}, qualifiedTotal=${qualified.reduce((s, o) => s + o.total, 0)}`
    );
  }

  // -------------------------------------------------------------------------
  // 9. Total Sales calculation
  // -------------------------------------------------------------------------
  {
    const mockOrders = [
      { id: '1', paymentStatus: 'confirmed', total: 120.5, items: [] },
      { id: '2', paymentStatus: 'confirmed', total: 80.25, items: [] },
      { id: '3', paymentStatus: 'confirmed', total: 99.25, items: [] },
    ];
    const kpis = calculateRawKpis(mockOrders);

    assert(
      kpis.totalSales === 300,
      9,
      'Total Sales calculation: accurately sums gross order totals with floating-point precision (120.5 + 80.25 + 99.25 = 300.00)',
      `totalSales=${kpis.totalSales}`
    );
  }

  // -------------------------------------------------------------------------
  // 10. Total Orders calculation
  // -------------------------------------------------------------------------
  {
    const mockOrders = [
      { id: '1', paymentStatus: 'confirmed', total: 10, items: [] },
      { id: '2', paymentStatus: 'confirmed', total: 20, items: [] },
      { id: '3', paymentStatus: 'confirmed', total: 30, items: [] },
      { id: '4', paymentStatus: 'confirmed', total: 40, items: [] },
    ];
    const kpis = calculateRawKpis(mockOrders);

    assert(
      kpis.totalOrders === 4,
      10,
      'Total Orders calculation: accurately counts confirmed orders',
      `totalOrders=${kpis.totalOrders}`
    );
  }

  // -------------------------------------------------------------------------
  // 11. Items Sold calculation
  // -------------------------------------------------------------------------
  {
    const mockOrders = [
      { id: '1', paymentStatus: 'confirmed', total: 100, items: [{ quantity: 3 }, { quantity: 2 }] },
      { id: '2', paymentStatus: 'confirmed', total: 50, items: [{ quantity: 1 }, { quantity: 4 }] },
    ];
    const kpis = calculateRawKpis(mockOrders);

    assert(
      kpis.itemsSold === 10,
      11,
      'Items Sold calculation: accurately sums individual item quantities across all qualified order line items (3 + 2 + 1 + 4 = 10)',
      `itemsSold=${kpis.itemsSold}`
    );
  }

  // -------------------------------------------------------------------------
  // 12. Average Order Value calculation
  // -------------------------------------------------------------------------
  {
    const mockOrders = [
      { id: '1', paymentStatus: 'confirmed', total: 100, items: [] },
      { id: '2', paymentStatus: 'confirmed', total: 200, items: [] },
      { id: '3', paymentStatus: 'confirmed', total: 150, items: [] },
    ];
    const kpis = calculateRawKpis(mockOrders);
    // (100 + 200 + 150) / 3 = 450 / 3 = 150

    assert(
      kpis.averageOrderValue === 150,
      12,
      'Average Order Value calculation: correctly computes Total Sales / Total Orders (450 / 3 = 150.00)',
      `averageOrderValue=${kpis.averageOrderValue}`
    );
  }

  // -------------------------------------------------------------------------
  // 13. Zero-order handling
  // -------------------------------------------------------------------------
  {
    const kpis = calculateRawKpis([]);
    const noNan =
      !isNaN(kpis.totalSales) &&
      !isNaN(kpis.totalOrders) &&
      !isNaN(kpis.itemsSold) &&
      !isNaN(kpis.averageOrderValue);
    const allZero =
      kpis.totalSales === 0 &&
      kpis.totalOrders === 0 &&
      kpis.itemsSold === 0 &&
      kpis.averageOrderValue === 0;

    assert(
      noNan && allZero,
      13,
      'Zero-order handling: safe execution returning 0 with no NaN or Division-by-Zero errors',
      `AOV=${kpis.averageOrderValue}`
    );
  }

  // -------------------------------------------------------------------------
  // 14. Percentage change calculations
  // -------------------------------------------------------------------------
  {
    // Positive growth: prev 100 -> curr 125 (+25.0%)
    const compPos = calculateMetricComparison(125, 100);
    // Negative growth: prev 200 -> curr 150 (-25.0%)
    const compNeg = calculateMetricComparison(150, 200);
    // Neutral: prev 0 -> curr 0 (0%)
    const compNeutral = calculateMetricComparison(0, 0);

    const isPosCorrect = compPos.percentageChange === 25.0 && compPos.status === 'available' && compPos.isPositive;
    const isNegCorrect = compNeg.percentageChange === -25.0 && compNeg.status === 'available' && !compNeg.isPositive;
    const isNeutralCorrect = compNeutral.percentageChange === 0 && compNeutral.status === 'neutral';

    assert(
      isPosCorrect && isNegCorrect && isNeutralCorrect,
      14,
      'Percentage change calculations: accurately computes +25.0% and -25.0% and handles 0 vs 0 as neutral 0%',
      `pos=${compPos.percentageChange}%, neg=${compNeg.percentageChange}%`
    );
  }

  // -------------------------------------------------------------------------
  // 15. Missing comparison-period handling
  // -------------------------------------------------------------------------
  {
    // Case A: Previous is 0, current is 100 -> MUST NOT invent +100%, status must be 'no_prior_data' and percentageChange null
    const compZeroPrior = calculateMetricComparison(100, 0);
    const isZeroPriorSafe = compZeroPrior.status === 'no_prior_data' && compZeroPrior.percentageChange === null;

    // Case B: No comparison period at all (null) -> status 'unavailable'
    const compNull = calculateMetricComparison(100, null, false);
    const isNullSafe = compNull.status === 'unavailable' && compNull.percentageChange === null;

    assert(
      isZeroPriorSafe && isNullSafe,
      15,
      'Missing comparison-period handling: zero prior data returns status no_prior_data with null percentage instead of invented +100%',
      `statusZeroPrior=${compZeroPrior.status}, statusNull=${compNull.status}`
    );
  }

  // -------------------------------------------------------------------------
  // 16. Sales aggregation & out-of-chart-hours tracking
  // -------------------------------------------------------------------------
  {
    const { currentRange } = resolveDatePreset('today', testNow);
    const startDay = new Date(currentRange.start);

    // Deterministic timestamp testing:
    // 1. Order before 10 AM (08:30 AM)
    const time0830 = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), 8, 30, 0).getTime();
    // 2. Order at exact 10:00 AM bucket boundary
    const time1000 = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), 10, 0, 0).getTime();
    // 3. Order inside 10 AM bucket (11:15 AM)
    const time1115 = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), 11, 15, 0).getTime();
    // 4. Order at exact 12:00 PM bucket boundary
    const time1200 = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), 12, 0, 0).getTime();
    // 5. Order inside 2 PM bucket (14:30 PM)
    const time1430 = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), 14, 30, 0).getTime();
    // 6. Order at exact 22:00 (10 PM) bucket boundary
    const time2200 = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), 22, 0, 0).getTime();
    // 7. Order inside 10 PM bucket (22:45 PM)
    const time2245 = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), 22, 45, 0).getTime();
    // 8. Order after chart hours (24:15 / post chart boundary)
    const timePostChart = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() + 1, 0, 15, 0).getTime();

    const mockOrders = [
      { id: '1', paymentStatus: 'confirmed', total: 80, createdAt: time0830, items: [] },     // Before chart
      { id: '2', paymentStatus: 'confirmed', total: 100, createdAt: time1000, items: [] },    // Boundary 10 AM
      { id: '3', paymentStatus: 'confirmed', total: 50, createdAt: time1115, items: [] },     // 10 AM bucket
      { id: '4', paymentStatus: 'confirmed', total: 120, createdAt: time1200, items: [] },    // Boundary 12 PM
      { id: '5', paymentStatus: 'confirmed', total: 200, createdAt: time1430, items: [] },    // 2 PM bucket
      { id: '6', paymentStatus: 'confirmed', total: 90, createdAt: time2200, items: [] },     // Boundary 10 PM
      { id: '7', paymentStatus: 'confirmed', total: 110, createdAt: time2245, items: [] },    // 10 PM bucket
      { id: '8', paymentStatus: 'confirmed', total: 40, createdAt: timePostChart, items: [] }, // After chart
    ];

    const { sales } = aggregateSalesAndOrders(mockOrders, 'today', currentRange);
    const has7Buckets = sales.buckets.length === 7;
    const bucket10AM = sales.buckets.find((b) => b.label === '10 AM');
    const bucket12PM = sales.buckets.find((b) => b.label === '12 PM');
    const bucket2PM = sales.buckets.find((b) => b.label === '2 PM');
    const bucket10PM = sales.buckets.find((b) => b.label === '10 PM');

    // 10 AM bucket strictly represents 10:00-12:00: order 2 (100) + order 3 (50) = 150 (order 1 at 8:30 is NOT included!)
    const is10AMCorrect = bucket10AM?.sales === 150 && bucket10AM?.orders === 2;
    // 12 PM bucket has order 4 (120)
    const is12PMCorrect = bucket12PM?.sales === 120 && bucket12PM?.orders === 1;
    // 2 PM bucket has order 5 (200)
    const is2PMCorrect = bucket2PM?.sales === 200 && bucket2PM?.orders === 1;
    // 10 PM bucket has order 6 (90) + order 7 (110) = 200
    const is10PMCorrect = bucket10PM?.sales === 200 && bucket10PM?.orders === 2;

    // Out of chart hours verification
    const isBeforeChartCorrect = sales.outOfChartHours.beforeChartSales === 80 && sales.outOfChartHours.beforeChartOrders === 1;
    const isAfterChartCorrect = sales.outOfChartHours.afterChartSales === 40 && sales.outOfChartHours.afterChartOrders === 1;
    const isOutOfChartTotalCorrect = sales.outOfChartHours.sales === 120 && sales.outOfChartHours.orders === 2;

    // Conservation equation: displayedBucketTotals + outOfRangeTotals === totalSales
    const displayedSum = sales.buckets.reduce((acc, b) => acc + b.sales, 0);
    const displayedOrdersSum = sales.buckets.reduce((acc, b) => acc + b.orders, 0);
    const isConservationCorrect =
      displayedSum + sales.outOfChartHours.sales === sales.totalSales &&
      displayedOrdersSum + sales.outOfChartHours.orders === sales.totalOrders &&
      sales.totalSales === 790 &&
      sales.totalOrders === 8;

    assert(
      has7Buckets &&
      is10AMCorrect &&
      is12PMCorrect &&
      is2PMCorrect &&
      is10PMCorrect &&
      isBeforeChartCorrect &&
      isAfterChartCorrect &&
      isOutOfChartTotalCorrect &&
      isConservationCorrect,
      16,
      'Sales aggregation: 10 AM strictly covers 10:00-12:00, boundary tests pass, out-of-chart-hours tracked explicitly with full conservation',
      `10AM=${bucket10AM?.sales}, 10PM=${bucket10PM?.sales}, before=${sales.outOfChartHours.beforeChartSales}, after=${sales.outOfChartHours.afterChartSales}, total=${sales.totalSales}`
    );
  }

  // -------------------------------------------------------------------------
  // 17. Orders aggregation
  // -------------------------------------------------------------------------
  {
    const { currentRange } = resolveDatePreset('today', testNow);
    const startDay = new Date(currentRange.start);
    const time1030 = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), 10, 30, 0).getTime();
    const mockOrders = [
      { id: '1', paymentStatus: 'confirmed', total: 100, createdAt: time1030, items: [] },
      { id: '2', paymentStatus: 'confirmed', total: 50, createdAt: time1030, items: [] },
    ];

    const { orders } = aggregateSalesAndOrders(mockOrders, 'today', currentRange);
    const bucket10AM = orders.buckets.find((b) => b.label === '10 AM');
    const bucket12PM = orders.buckets.find((b) => b.label === '12 PM');

    assert(
      bucket10AM?.orders === 2 && bucket12PM?.orders === 0 && orders.totalOrders === 2,
      17,
      'Orders aggregation: counts qualifying orders per time bucket (10 AM = 2, 12 PM = 0, total = 2)',
      `b10AMOrders=${bucket10AM?.orders}`
    );
  }

  // -------------------------------------------------------------------------
  // 18. Top-selling product ranking
  // -------------------------------------------------------------------------
  {
    const mockOrders = [
      {
        id: '1',
        paymentStatus: 'confirmed',
        items: [
          { name: 'Burger', quantity: 5, unitPrice: 50, lineTotal: 250 },
          { name: 'Fries', quantity: 10, unitPrice: 20, lineTotal: 200 },
        ],
      },
      {
        id: '2',
        paymentStatus: 'confirmed',
        items: [
          { name: 'Burger', quantity: 8, unitPrice: 50, lineTotal: 400 },
          { name: 'Cola', quantity: 3, unitPrice: 15, lineTotal: 45 },
        ],
      },
      {
        id: '3',
        paymentStatus: 'confirmed',
        items: [
          { name: 'Fries', quantity: 3, unitPrice: 20, lineTotal: 60 },
          // Tie-breaker test: Salad quantity 3, lineTotal 100 vs Cola quantity 3, lineTotal 45
          { name: 'Salad', quantity: 3, unitPrice: 33.33, lineTotal: 100 },
        ],
      },
    ];

    const ranked = calculateTopSellingProducts(mockOrders);
    // Totals:
    // Burger: 13 units, 650 EGP
    // Fries: 13 units, 260 EGP (tied on quantity with Burger, but Burger wins on revenue!)
    // Salad: 3 units, 100 EGP (tied with Cola on quantity 3, but Salad wins on revenue 100 vs 45)
    // Cola: 3 units, 45 EGP

    const rank0IsBurger = ranked[0].displayName === 'Burger' && ranked[0].totalQuantity === 13;
    const rank1IsFries = ranked[1].displayName === 'Fries' && ranked[1].totalQuantity === 13;
    const rank2IsSalad = ranked[2].displayName === 'Salad' && ranked[2].totalQuantity === 3;
    const rank3IsCola = ranked[3].displayName === 'Cola' && ranked[3].totalQuantity === 3;

    assert(
      rank0IsBurger && rank1IsFries && rank2IsSalad && rank3IsCola,
      18,
      'Top-selling product ranking: sorts by quantity sold descending with revenue as deterministic tiebreaker',
      `rank0=${ranked[0].displayName} (${ranked[0].totalQuantity}), rank1=${ranked[1].displayName} (${ranked[1].totalQuantity})`
    );
  }

  // -------------------------------------------------------------------------
  // 19. Product name normalization
  // -------------------------------------------------------------------------
  {
    const mockOrders = [
      {
        id: '1',
        paymentStatus: 'confirmed',
        items: [
          { name: '  Chicken Shawarma  ', quantity: 2, lineTotal: 100 },
          { name: 'chicken   shawarma', quantity: 3, lineTotal: 150 },
          { name: 'CHICKEN SHAWARMA', quantity: 1, lineTotal: 50 },
        ],
      },
    ];

    const ranked = calculateTopSellingProducts(mockOrders);
    const isSingleGroup = ranked.length === 1;
    const totalQtyIs6 = ranked[0]?.totalQuantity === 6;
    const totalRevIs300 = ranked[0]?.totalRevenue === 300;
    const hasDisplayName = !!ranked[0]?.displayName;

    assert(
      isSingleGroup && totalQtyIs6 && totalRevIs300 && hasDisplayName,
      19,
      'Product name normalization: variations in casing and whitespace merge into a single product group while preserving original display name',
      `groupCount=${ranked.length}, totalQty=${ranked[0]?.totalQuantity}`
    );
  }

  // -------------------------------------------------------------------------
  // 20. Order status distribution
  // -------------------------------------------------------------------------
  {
    const mockOrders = [
      { id: '1', paymentStatus: 'confirmed', operationalStatus: 'delivered' },
      { id: '2', paymentStatus: 'confirmed', operationalStatus: 'delivered' },
      { id: '3', paymentStatus: 'confirmed', operationalStatus: 'ready' },
      { id: '4', paymentStatus: 'confirmed', operationalStatus: 'preparing' },
      { id: '5', paymentStatus: 'confirmed', operationalStatus: 'newOrder' },
      // Excluded pending order:
      { id: '6', paymentStatus: 'pendingConfirmation', operationalStatus: 'newOrder' },
    ];

    const dist = calculateOrdersByStatus(mockOrders);
    // Total confirmed = 5
    // Delivered: 2 (40.0%)
    // Ready: 1 (20.0%)
    // Preparing: 1 (20.0%)
    // New: 1 (20.0%)
    const isTotal5 = dist.totalCount === 5;
    const isDelivered40 = dist.statuses.delivered.percentage === 40.0 && dist.statuses.delivered.count === 2;
    const isReady20 = dist.statuses.ready.percentage === 20.0 && dist.statuses.ready.count === 1;
    const isPercentSum100 =
      dist.statuses.delivered.percentage +
        dist.statuses.ready.percentage +
        dist.statuses.preparing.percentage +
        dist.statuses.newOrder.percentage ===
      100;

    assert(
      isTotal5 && isDelivered40 && isReady20 && isPercentSum100,
      20,
      'Order status distribution: accurately calculates counts and percentages for the 4 operational statuses (Delivered: 40%, Ready: 20%, Preparing: 20%, New: 20%) while excluding pending orders',
      `totalConfirmed=${dist.totalCount}, delivered%=${dist.statuses.delivered.percentage}`
    );
  }

  // -------------------------------------------------------------------------
  // 21. Zero-data chart aggregation
  // -------------------------------------------------------------------------
  {
    const { currentRange } = resolveDatePreset('today', testNow);
    const { sales, orders } = aggregateSalesAndOrders([], 'today', currentRange);

    const has7Buckets = sales.buckets.length === 7;
    const allBucketsZero = sales.buckets.every((b) => b.sales === 0 && b.orders === 0);
    const hasDataIsFalse = sales.hasData === false && orders.hasData === false;

    assert(
      has7Buckets && allBucketsZero && hasDataIsFalse,
      21,
      'Zero-data chart aggregation: empty orders returns clean 7-bucket zero template (10 AM to 10 PM) with hasData: false without crashing or distorting axes',
      `bucketsCount=${sales.buckets.length}, hasData=${sales.hasData}`
    );
  }

  // -------------------------------------------------------------------------
  // 22. Ensuring the original 10 seed orders remain unchanged
  // -------------------------------------------------------------------------
  {
    // Inspect source code of seedOrders.ts
    const seedSource = fs.readFileSync('src/data/seedOrders.ts', 'utf8');

    // Check that it contains all 10 order numbers
    const orderNumbers = ['1041', '1042', '1043', '1044', '1045', '1046', '1047', '1048', '1049', '1050'];
    const allPresent = orderNumbers.every((num) => seedSource.includes(`'${num}'`));

    // Verify orders in getInitialOrders() body
    const initialOrdersBody = seedSource.slice(seedSource.indexOf('getInitialOrders'));
    const buildOrderCalls = (initialOrdersBody.match(/buildOrder\(/g) || []).length;
    const pendingMatches = (initialOrdersBody.match(/'pendingConfirmation'/g) || []).length;
    const confirmedMatches = (initialOrdersBody.match(/'confirmed'/g) || []).length;

    const isTotal10 = buildOrderCalls === 10;
    const isPending2 = pendingMatches === 2;
    const isConfirmed8 = confirmedMatches === 8;

    assert(
      allPresent && isTotal10 && isPending2 && isConfirmed8,
      22,
      'Seed data integrity: the original 10 seed orders remain completely intact and unmodified (10 total orders, exactly 8 confirmed, 2 pending confirmation)',
      `allOrdersFound=${allPresent}, buildOrderCalls=${buildOrderCalls}, confirmedCount=${confirmedMatches}, pendingCount=${pendingMatches}`
    );
  }

  console.log('\n===============================================================');
  const totalPassed = testResults.filter((t) => t.passed).length;
  console.log(`VERIFICATION SUMMARY: ${totalPassed} / ${testResults.length} TESTS PASSED`);
  console.log('===============================================================');

  if (totalPassed === testResults.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
