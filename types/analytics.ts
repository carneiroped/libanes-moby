export interface TimeSeriesPoint {
  date: string;
  count: number;
  value?: number;
}

export interface ComparisonPeriod {
  id: string;
  label: string;
  current: {
    from: Date;
    to: Date;
  };
  previous: {
    from: Date;
    to: Date;
  };
}

export interface MetricComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface TemporalMetrics {
  totalLeads: MetricComparison;
  activeLeads: MetricComparison;
  conversionRate: MetricComparison;
  newLeadsWeek: MetricComparison;
  [key: string]: MetricComparison;
}

export interface BenchmarkData {
  value: number;
  label: string;
  type: 'goal' | 'industry' | 'previous_best';
  status: 'above' | 'below' | 'at';
}

export interface SparklineData {
  data: Array<{ date: string; value: number }>;
  trend: 'up' | 'down' | 'neutral';
  change: number;
}

export interface ComparisonFilters {
  comparisonType: 'period' | 'year' | 'custom';
  periodType: 'week' | 'month' | 'quarter' | 'year';
  customStart?: Date;
  customEnd?: Date;
  benchmarks: boolean;
  showTrends: boolean;
}

export interface AnalyticsExportData {
  period: string;
  comparisonPeriod?: string;
  metrics: Record<string, any>;
  charts: Array<{
    title: string;
    type: string;
    data: any[];
  }>;
  benchmarks?: Record<string, BenchmarkData>;
}