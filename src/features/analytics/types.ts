import { OperationalStatus, Order } from '../../types/order';

export type AnalyticsDatePreset = 'today' | 'week' | 'month' | 'custom';

export type MetricMode = 'sales' | 'orders';

export interface DateRange {
  start: number; // Epoch ms inclusive
  end: number;   // Epoch ms exclusive
  preset: AnalyticsDatePreset;
  label?: string;
}

export type ComparisonStatus = 'available' | 'unavailable' | 'no_prior_data' | 'neutral';

export interface MetricComparison {
  current: number;
  previous: number;
  difference: number;
  percentageChange: number | null; // null when previous is 0 or comparison unavailable
  status: ComparisonStatus;
  isPositive: boolean;
}

export interface AnalyticsKpiSummary {
  totalSales: number;
  totalOrders: number;
  itemsSold: number;
  averageOrderValue: number;
  comparisons: {
    totalSales: MetricComparison;
    totalOrders: MetricComparison;
    itemsSold: MetricComparison;
    averageOrderValue: MetricComparison;
  };
}

export interface ChartBucket {
  key: string;            // Unique identifier for the bucket (e.g. "2026-11-01T10:00")
  label: string;          // Human-readable axis label (e.g. "10 AM", "Sat")
  startTime: number;      // Epoch ms inclusive
  endTime: number;        // Epoch ms exclusive
  sales: number;          // Total sales in EGP for this bucket
  orders: number;         // Total qualifying order count for this bucket
}

export interface OutOfChartHoursData {
  sales: number;
  orders: number;
  beforeChartSales: number;
  beforeChartOrders: number;
  afterChartSales: number;
  afterChartOrders: number;
}

export interface ChartAggregationResult {
  preset: AnalyticsDatePreset;
  metricMode: MetricMode;
  buckets: ChartBucket[];
  totalSales: number;
  totalOrders: number;
  displayedBucketSales: number;
  displayedBucketOrders: number;
  outOfChartHours: OutOfChartHoursData;
  hasData: boolean;
  maxSalesBucketValue: number;
  maxOrdersBucketValue: number;
  peakBucket?: ChartBucket;
}

export interface TopSellingProduct {
  normalizedName: string; // Trimmed, lowercased key for reliable grouping
  displayName: string;    // Preserved original product name
  totalQuantity: number;  // Units sold
  totalRevenue: number;   // Revenue in EGP
  orderCount: number;     // Number of distinct orders containing this item
}

export interface StatusDistributionItem {
  status: OperationalStatus;
  labelKey: string;
  count: number;
  percentage: number; // 0 to 100 rounded to 1 decimal place
}

export interface OrdersByStatusResult {
  totalCount: number;
  hasData: boolean;
  statuses: Record<OperationalStatus, StatusDistributionItem>;
  items: StatusDistributionItem[];
}

export interface AnalyticsDataSet {
  dateRange: DateRange;
  comparisonRange: DateRange | null;
  filteredOrders: Order[];
  kpis: AnalyticsKpiSummary;
  chartData: {
    sales: ChartAggregationResult;
    orders: ChartAggregationResult;
  };
  topSellingProducts: TopSellingProduct[];
  ordersByStatus: OrdersByStatusResult;
}

