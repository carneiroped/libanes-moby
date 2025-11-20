# Temporal Analytics System

A comprehensive temporal comparison and context system for the Moby CRM Analytics module.

## Overview

The Temporal Analytics System provides powerful time-based comparisons, trend indicators, and contextual insights for all analytics metrics. It enables users to understand performance changes over time and compare against benchmarks and previous periods.

## Components

### Core Components

#### `TemporalComparison`
Main control panel for configuring temporal comparisons.
- Period selection (preset or custom ranges)
- Comparison type (previous period, year-over-year, custom)
- Advanced options (benchmarks, trends, period types)

```typescript
<TemporalComparison
  onComparisonChange={handleComparisonChange}
  currentDateRange={dateRange}
/>
```

#### `TrendIndicator`
Visual indicator showing metric changes with percentage and trend direction.
- Trend arrows (up/down/neutral)
- Percentage changes with colors
- Benchmark status integration
- Multiple sizes (sm, md, lg)

```typescript
<TrendIndicator
  comparison={temporalMetrics.totalLeads}
  benchmark={benchmarks?.totalLeads}
  size="sm"
  showValue={false}
/>
```

#### `SparklineChart`
Mini charts showing metric trends over time.
- Recharts-based line charts
- Trend indicators
- Tooltips with detailed information
- Configurable colors and dimensions

```typescript
<SparklineChart
  data={sparklines.totalLeads}
  width={60}
  height={24}
  showTrend={true}
/>
```

#### `BenchmarkIndicator`
Visual comparison against benchmarks (goals, industry averages, previous bests).
- Multiple benchmark types
- Progress bars
- Status indicators (above/below/at target)
- Tooltips with detailed comparisons

```typescript
<BenchmarkIndicator
  current={temporalMetrics.totalLeads.current}
  benchmark={benchmarks.totalLeads}
  unit="number"
  size="sm"
  showProgress={true}
/>
```

#### `ComparisonTable`
Comprehensive side-by-side comparison table.
- Detailed metric comparisons
- Integrated sparklines and trend indicators
- Benchmark status for each metric
- Export functionality
- Summary statistics

```typescript
<ComparisonTable
  comparisonPeriod={comparisonPeriod}
  temporalMetrics={temporalMetrics}
  benchmarks={benchmarks}
  sparklines={sparklines}
  onExport={handleExportData}
/>
```

### Utility Functions

#### Temporal Utilities (`lib/analytics/temporal-utils.ts`)
- `createComparisonPeriod()` - Generate comparison periods
- `getPresetPeriods()` - Predefined period configurations
- `calculateMetricComparison()` - Compare metrics between periods
- `createSparklineData()` - Process data for sparklines
- `formatPercentageChange()` - Format percentage changes
- `formatMetricValue()` - Format values by type (number, percentage, currency)

#### Export Utilities (`lib/analytics/export-utils.ts`)
- `generateExportData()` - Prepare data for export
- `exportToCSV()` - CSV export functionality
- `exportToJSON()` - JSON export functionality
- `downloadFile()` - File download handling
- `generateInsights()` - Auto-generate insights from data

## Data Types

### Core Types (`types/analytics.ts`)

```typescript
interface MetricComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
}

interface ComparisonPeriod {
  id: string;
  label: string;
  current: { from: Date; to: Date };
  previous: { from: Date; to: Date };
}

interface BenchmarkData {
  value: number;
  label: string;
  type: 'goal' | 'industry' | 'previous_best';
  status: 'above' | 'below' | 'at';
}

interface SparklineData {
  data: number[];
  trend: 'up' | 'down' | 'neutral';
  change: number;
}
```

## Features

### 1. Period Comparison
- **Previous Period**: Compare with immediate previous period
- **Year-over-Year**: Compare with same period last year  
- **Custom Period**: Compare with any custom date range

### 2. Trend Indicators
- Visual trend arrows (↗️↘️↔️)
- Color-coded percentage changes
- Contextual tooltips with detailed information

### 3. Sparkline Charts
- Mini trend visualizations
- 7-14 data points showing recent performance
- Integrated with main metrics

### 4. Benchmark Integration
- Goal benchmarks (user-defined targets)
- Industry benchmarks (industry averages)
- Historical benchmarks (previous best performance)
- Visual progress indicators

### 5. Export Functionality
- CSV export with detailed comparisons
- JSON export for data integration
- Customizable export options
- Automatic insight generation

### 6. Responsive Design
- Mobile-first responsive layout
- Adaptive component sizing
- Touch-friendly interactions
- Accessible design patterns

## Usage Examples

### Basic Integration

```typescript
import { TemporalComparison, TrendIndicator } from '@/components/admin/analytics';
import { useTemporalMetrics } from '@/hooks/useLeadAnalytics';

function MyAnalyticsPage() {
  const [comparisonPeriod, setComparisonPeriod] = useState(null);
  const { data: temporalMetrics } = useTemporalMetrics(comparisonPeriod);
  
  return (
    <div>
      <TemporalComparison 
        onComparisonChange={setComparisonPeriod}
      />
      
      {temporalMetrics && (
        <TrendIndicator 
          comparison={temporalMetrics.totalLeads}
        />
      )}
    </div>
  );
}
```

### Advanced Configuration

```typescript
const filters: ComparisonFilters = {
  comparisonType: 'period',
  periodType: 'month',
  benchmarks: true,
  showTrends: true,
};

<TemporalComparison
  onComparisonChange={(period, filters) => {
    setComparisonPeriod(period);
    setFilters(filters);
  }}
  currentDateRange={dateRange}
/>
```

## API Integration

### Required Backend Endpoints

The system expects these API endpoints:

1. **Temporal Metrics**: `/api/lead-analytics?type=temporal-metrics`
2. **Sparklines**: `/api/lead-analytics?type=sparklines`  
3. **Benchmarks**: `/api/lead-analytics?type=benchmarks`

### Request Parameters

```typescript
// Temporal metrics request
{
  type: 'temporal-metrics',
  currentStart: '2024-01-01T00:00:00Z',
  currentEnd: '2024-01-31T23:59:59Z', 
  previousStart: '2023-12-01T00:00:00Z',
  previousEnd: '2023-12-31T23:59:59Z'
}

// Sparklines request
{
  type: 'sparklines',
  metrics: 'totalLeads,activeLeads,conversionRate',
  period: 'week'
}
```

## Development Notes

### Mock Data
For development and testing, mock data is available in `lib/analytics/mock-data.ts`:

```typescript
import { mockAnalyticsData } from '@/lib/analytics/mock-data';

// Use mock temporal metrics
const temporalMetrics = mockAnalyticsData.temporalMetrics;
const benchmarks = mockAnalyticsData.benchmarks;
const sparklines = mockAnalyticsData.sparklines;
```

### Styling
Components use Tailwind CSS with the project's design system:
- Colors follow trend semantics (green=up, red=down, gray=neutral)
- Consistent spacing and typography
- Dark mode support
- Accessible color contrasts

### Performance
- React Query for data caching and management
- Optimized re-renders with proper memoization
- Lazy loading for large datasets
- Efficient sparkline rendering with Recharts

## Future Enhancements

1. **Advanced Export Formats**
   - Excel export with charts
   - PDF reports with visualizations
   - Scheduled report generation

2. **Enhanced Benchmarking**
   - Machine learning-based forecasts
   - Competitive benchmarking
   - Dynamic goal adjustment

3. **Interactive Features**
   - Drill-down capabilities
   - Interactive sparklines
   - Period selection shortcuts

4. **Mobile Enhancements**
   - Swipe gestures for period navigation
   - Mobile-optimized layouts
   - Touch-friendly interactions

## Contributing

When adding new temporal features:
1. Follow existing type definitions
2. Maintain consistent styling patterns
3. Include comprehensive tooltips
4. Test with mock data first
5. Ensure accessibility compliance
6. Update this documentation