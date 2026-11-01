"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeProductName = normalizeProductName;
exports.filterQualifiedOrders = filterQualifiedOrders;
exports.calculateMetricComparison = calculateMetricComparison;
exports.calculateRawKpis = calculateRawKpis;
exports.calculateAnalyticsKpiSummary = calculateAnalyticsKpiSummary;
exports.aggregateSalesAndOrders = aggregateSalesAndOrders;
exports.calculateTopSellingProducts = calculateTopSellingProducts;
exports.calculateOrdersByStatus = calculateOrdersByStatus;
exports.generateAnalyticsDataSet = generateAnalyticsDataSet;
const dateRangeUtils_1 = require("./dateRangeUtils");
/**
 * Normalizes product name strings for reliable grouping without assuming stable product IDs.
 * Collapses whitespace, removes leading/trailing punctuation, and converts to lowercase.
 */
function normalizeProductName(rawName) {
    if (!rawName)
        return '';
    return rawName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}
/**
 * Filters orders to include ONLY confirmed payments within the specified date range.
 *
 * Business rule: Orders with `paymentStatus === 'pendingConfirmation'` must NEVER
 * contribute to revenue, volume KPIs, or financial charts.
 */
function filterQualifiedOrders(orders, range) {
    return orders.filter((order) => {
        // 1. Must have confirmed payment
        if (order.paymentStatus !== 'confirmed') {
            return false;
        }
        // 2. If date range is specified, createdAt must fall strictly within [start, end)
        if (range && !(0, dateRangeUtils_1.isTimestampInRange)(order.createdAt, range)) {
            return false;
        }
        return true;
    });
}
/**
 * Calculates percentage change and difference between current and previous values.
 *
 * Rules:
 * - Both 0: no change (neutral, 0%).
 * - Previous > 0: actual percentage `((curr - prev) / prev) * 100`.
 * - Previous 0 and current > 0: 'no_prior_data' status with null percentage (NOT invented +100%).
 * - No comparison range: 'unavailable' status with null percentage.
 */
function calculateMetricComparison(currentValue, previousValue, hasComparisonPeriod = true) {
    if (!hasComparisonPeriod || previousValue === null || previousValue === undefined) {
        return {
            current: currentValue,
            previous: 0,
            difference: 0,
            percentageChange: null,
            status: 'unavailable',
            isPositive: false,
        };
    }
    const prev = previousValue;
    const curr = currentValue;
    const difference = Math.round((curr - prev) * 100) / 100;
    if (prev === 0 && curr === 0) {
        return {
            current: curr,
            previous: prev,
            difference: 0,
            percentageChange: 0,
            status: 'neutral',
            isPositive: false,
        };
    }
    if (prev === 0 && curr > 0) {
        return {
            current: curr,
            previous: 0,
            difference: curr,
            percentageChange: null,
            status: 'no_prior_data',
            isPositive: true,
        };
    }
    // Previous has non-zero data
    const rawPercentage = ((curr - prev) / prev) * 100;
    const percentageChange = Math.round(rawPercentage * 10) / 10;
    return {
        current: curr,
        previous: prev,
        difference,
        percentageChange,
        status: 'available',
        isPositive: curr >= prev,
    };
}
/**
 * Calculates raw KPI totals for a list of qualified orders.
 */
function calculateRawKpis(qualifiedOrders) {
    let totalSales = 0;
    let itemsSold = 0;
    for (const order of qualifiedOrders) {
        totalSales += order.total;
        if (Array.isArray(order.items)) {
            for (const item of order.items) {
                itemsSold += item.quantity || 0;
            }
        }
    }
    const totalOrders = qualifiedOrders.length;
    const averageOrderValue = totalOrders > 0 ? Math.round((totalSales / totalOrders) * 100) / 100 : 0;
    return {
        totalSales: Math.round(totalSales * 100) / 100,
        totalOrders,
        itemsSold,
        averageOrderValue,
    };
}
/**
 * Calculates the complete KPI summary with period comparisons for all 4 primary metrics.
 */
function calculateAnalyticsKpiSummary(currentOrders, previousOrders, hasComparisonPeriod = true) {
    const currKpis = calculateRawKpis(currentOrders);
    const prevKpis = previousOrders ? calculateRawKpis(previousOrders) : null;
    return {
        totalSales: currKpis.totalSales,
        totalOrders: currKpis.totalOrders,
        itemsSold: currKpis.itemsSold,
        averageOrderValue: currKpis.averageOrderValue,
        comparisons: {
            totalSales: calculateMetricComparison(currKpis.totalSales, prevKpis?.totalSales, hasComparisonPeriod),
            totalOrders: calculateMetricComparison(currKpis.totalOrders, prevKpis?.totalOrders, hasComparisonPeriod),
            itemsSold: calculateMetricComparison(currKpis.itemsSold, prevKpis?.itemsSold, hasComparisonPeriod),
            averageOrderValue: calculateMetricComparison(currKpis.averageOrderValue, prevKpis?.averageOrderValue, hasComparisonPeriod),
        },
    };
}
/**
 * Aggregates qualified orders into chart-ready time buckets for both Sales and Orders modes.
 */
function aggregateSalesAndOrders(qualifiedOrders, preset, range) {
    const templates = (0, dateRangeUtils_1.generateChartBucketTemplates)(preset, range);
    const salesBuckets = templates.map((t) => ({
        key: t.key,
        label: t.label,
        startTime: t.startTime,
        endTime: t.endTime,
        sales: 0,
        orders: 0,
    }));
    const ordersBuckets = templates.map((t) => ({
        key: t.key,
        label: t.label,
        startTime: t.startTime,
        endTime: t.endTime,
        sales: 0,
        orders: 0,
    }));
    let totalSales = 0;
    let totalOrders = 0;
    for (const order of qualifiedOrders) {
        totalSales += order.total;
        totalOrders += 1;
        // Place into corresponding bucket
        for (let i = 0; i < templates.length; i++) {
            const b = templates[i];
            if (order.createdAt >= b.startTime && order.createdAt < b.endTime) {
                salesBuckets[i].sales += order.total;
                salesBuckets[i].orders += 1;
                ordersBuckets[i].sales += order.total;
                ordersBuckets[i].orders += 1;
                break;
            }
        }
    }
    // Round bucket sales
    let maxSalesVal = 0;
    let maxOrdersVal = 0;
    let peakSalesBucket;
    let peakOrdersBucket;
    for (const b of salesBuckets) {
        b.sales = Math.round(b.sales * 100) / 100;
        if (b.sales > maxSalesVal) {
            maxSalesVal = b.sales;
            peakSalesBucket = b;
        }
        if (b.orders > maxOrdersVal) {
            maxOrdersVal = b.orders;
            peakOrdersBucket = b;
        }
    }
    const hasData = totalOrders > 0;
    return {
        sales: {
            preset,
            metricMode: 'sales',
            buckets: salesBuckets,
            totalSales: Math.round(totalSales * 100) / 100,
            totalOrders,
            hasData,
            maxSalesBucketValue: maxSalesVal,
            maxOrdersBucketValue: maxOrdersVal,
            peakBucket: peakSalesBucket,
        },
        orders: {
            preset,
            metricMode: 'orders',
            buckets: ordersBuckets,
            totalSales: Math.round(totalSales * 100) / 100,
            totalOrders,
            hasData,
            maxSalesBucketValue: maxSalesVal,
            maxOrdersBucketValue: maxOrdersVal,
            peakBucket: peakOrdersBucket,
        },
    };
}
/**
 * Calculates product rankings from confirmed order line items.
 *
 * Uses normalized product names as identity because OrderItem.id is not a verified MenuItem ID.
 * Preserves the original source name for display.
 */
function calculateTopSellingProducts(qualifiedOrders, limit = 5) {
    const productMap = new Map();
    for (const order of qualifiedOrders) {
        if (!Array.isArray(order.items))
            continue;
        const seenInOrder = new Set();
        for (const item of order.items) {
            const norm = normalizeProductName(item.name);
            if (!norm)
                continue;
            let entry = productMap.get(norm);
            if (!entry) {
                entry = {
                    normalizedName: norm,
                    displayName: item.name.trim(),
                    totalQuantity: 0,
                    totalRevenue: 0,
                    orderCount: 0,
                };
                productMap.set(norm, entry);
            }
            entry.totalQuantity += item.quantity || 0;
            entry.totalRevenue += item.lineTotal || (item.quantity || 0) * (item.unitPrice || 0);
            if (!seenInOrder.has(norm)) {
                entry.orderCount += 1;
                seenInOrder.add(norm);
            }
        }
    }
    const result = Array.from(productMap.values());
    // Sort descending by totalQuantity; tiebreaker by totalRevenue descending
    result.sort((a, b) => {
        if (b.totalQuantity !== a.totalQuantity) {
            return b.totalQuantity - a.totalQuantity;
        }
        return b.totalRevenue - a.totalRevenue;
    });
    return result.slice(0, limit);
}
/**
 * Calculates operational status breakdown for confirmed orders.
 *
 * Only includes the 4 confirmed operational statuses:
 * - 'newOrder'
 * - 'preparing'
 * - 'ready'
 * - 'delivered'
 *
 * Orders with 'pendingConfirmation' are excluded from the four-segment donut distribution.
 */
function calculateOrdersByStatus(orders) {
    // Only confirmed orders count toward the operational donut chart
    const confirmed = orders.filter((o) => o.paymentStatus === 'confirmed');
    const counts = {
        newOrder: 0,
        preparing: 0,
        ready: 0,
        delivered: 0,
    };
    for (const o of confirmed) {
        if (counts[o.operationalStatus] !== undefined) {
            counts[o.operationalStatus]++;
        }
    }
    const totalCount = confirmed.length;
    const hasData = totalCount > 0;
    const makeItem = (status, labelKey) => {
        const c = counts[status];
        const percentage = totalCount > 0 ? Math.round((c / totalCount) * 1000) / 10 : 0;
        return {
            status,
            labelKey,
            count: c,
            percentage,
        };
    };
    const statuses = {
        delivered: makeItem('delivered', 'analytics.status.delivered'),
        ready: makeItem('ready', 'analytics.status.ready'),
        preparing: makeItem('preparing', 'analytics.status.preparing'),
        newOrder: makeItem('newOrder', 'analytics.status.newOrder'),
    };
    // Ordered sequence for Donut Chart rendering: Delivered -> Ready -> Preparing -> New
    const items = [
        statuses.delivered,
        statuses.ready,
        statuses.preparing,
        statuses.newOrder,
    ];
    return {
        totalCount,
        hasData,
        statuses,
        items,
    };
}
/**
 * Top-level orchestration function: Processes an array of Order records into a complete,
 * chart-ready analytics data set for the specified preset.
 */
function generateAnalyticsDataSet(allOrders, preset = 'today', nowInput, customStart, customEnd) {
    const { currentRange, comparisonRange } = (0, dateRangeUtils_1.resolveDatePreset)(preset, nowInput, customStart, customEnd);
    const currentQualifiedOrders = filterQualifiedOrders(allOrders, currentRange);
    const comparisonQualifiedOrders = comparisonRange
        ? filterQualifiedOrders(allOrders, comparisonRange)
        : null;
    const kpis = calculateAnalyticsKpiSummary(currentQualifiedOrders, comparisonQualifiedOrders, Boolean(comparisonRange));
    const chartData = aggregateSalesAndOrders(currentQualifiedOrders, preset, currentRange);
    const topSellingProducts = calculateTopSellingProducts(currentQualifiedOrders, 5);
    const ordersByStatus = calculateOrdersByStatus(currentQualifiedOrders);
    return {
        dateRange: currentRange,
        comparisonRange,
        filteredOrders: currentQualifiedOrders,
        kpis,
        chartData,
        topSellingProducts,
        ordersByStatus,
    };
}
