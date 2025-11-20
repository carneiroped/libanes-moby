import { addDays, addMonths, addYears, subDays, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, differenceInDays } from 'date-fns';
import { ComparisonPeriod, MetricComparison, SparklineData } from '@/types/analytics';

export function createComparisonPeriod(
  type: 'previous' | 'year_over_year' | 'custom',
  currentStart: Date,
  currentEnd: Date,
  customPreviousStart?: Date,
  customPreviousEnd?: Date
): ComparisonPeriod {
  const daysDiff = differenceInDays(currentEnd, currentStart);
  
  let previousStart: Date;
  let previousEnd: Date;
  let label: string;

  switch (type) {
    case 'previous':
      previousEnd = subDays(currentStart, 1);
      previousStart = subDays(previousEnd, daysDiff);
      label = 'Período anterior';
      break;
      
    case 'year_over_year':
      previousStart = subYears(currentStart, 1);
      previousEnd = subYears(currentEnd, 1);
      label = 'Ano anterior';
      break;
      
    case 'custom':
      if (!customPreviousStart || !customPreviousEnd) {
        throw new Error('Custom comparison requires previous period dates');
      }
      previousStart = customPreviousStart;
      previousEnd = customPreviousEnd;
      label = 'Período personalizado';
      break;
      
    default:
      throw new Error('Invalid comparison type');
  }

  return {
    id: type,
    label,
    current: { from: currentStart, to: currentEnd },
    previous: { from: previousStart, to: previousEnd }
  };
}

export function getPresetPeriods(): Array<{
  id: string;
  label: string;
  getCurrentPeriod: () => { from: Date; to: Date };
}> {
  const now = new Date();
  
  return [
    {
      id: 'this_week',
      label: 'Esta semana',
      getCurrentPeriod: () => ({
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 })
      })
    },
    {
      id: 'this_month',
      label: 'Este mês',
      getCurrentPeriod: () => ({
        from: startOfMonth(now),
        to: endOfMonth(now)
      })
    },
    {
      id: 'this_quarter',
      label: 'Este trimestre',
      getCurrentPeriod: () => ({
        from: startOfQuarter(now),
        to: endOfQuarter(now)
      })
    },
    {
      id: 'this_year',
      label: 'Este ano',
      getCurrentPeriod: () => ({
        from: startOfYear(now),
        to: endOfYear(now)
      })
    },
    {
      id: 'last_7_days',
      label: 'Últimos 7 dias',
      getCurrentPeriod: () => ({
        from: subDays(now, 7),
        to: now
      })
    },
    {
      id: 'last_30_days',
      label: 'Últimos 30 dias',
      getCurrentPeriod: () => ({
        from: subDays(now, 30),
        to: now
      })
    },
    {
      id: 'last_90_days',
      label: 'Últimos 90 dias',
      getCurrentPeriod: () => ({
        from: subDays(now, 90),
        to: now
      })
    }
  ];
}

export function calculateMetricComparison(
  currentValue: number,
  previousValue: number
): MetricComparison {
  const change = currentValue - previousValue;
  const changePercent = previousValue === 0 ? 
    (currentValue > 0 ? 100 : 0) : 
    (change / previousValue) * 100;
  
  let trend: 'up' | 'down' | 'neutral';
  if (Math.abs(changePercent) < 1) {
    trend = 'neutral';
  } else {
    trend = change > 0 ? 'up' : 'down';
  }

  return {
    current: currentValue,
    previous: previousValue,
    change,
    changePercent,
    trend
  };
}

export function createSparklineData(
  timeSeries: Array<{ date: string; value: number }>,
  lastNPoints: number = 7
): SparklineData {
  const sortedData = timeSeries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-lastNPoints);
    
  const values = sortedData.map(point => point.value);
  
  if (values.length < 2) {
    return {
      data: sortedData.map(point => ({ date: point.date, value: point.value })),
      trend: 'neutral',
      change: 0
    };
  }

  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const change = ((lastValue - firstValue) / firstValue) * 100;

  let trend: 'up' | 'down' | 'neutral';
  if (Math.abs(change) < 1) {
    trend = 'neutral';
  } else {
    trend = change > 0 ? 'up' : 'down';
  }

  return {
    data: sortedData.map(point => ({ date: point.date, value: point.value })),
    trend,
    change
  };
}

export function formatPercentageChange(change: number): string {
  const abs = Math.abs(change);
  const sign = change > 0 ? '+' : change < 0 ? '-' : '';
  return `${sign}${abs.toFixed(1)}%`;
}

export function formatMetricValue(value: number, type: 'number' | 'percentage' | 'currency' | 'duration'): string {
  switch (type) {
    case 'number':
      return new Intl.NumberFormat('pt-BR').format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    case 'duration':
      if (value < 1) return `${(value * 60).toFixed(0)}min`;
      if (value < 24) return `${value.toFixed(1)}h`;
      return `${(value / 24).toFixed(1)}d`;
    default:
      return value.toString();
  }
}

export function getBenchmarkStatus(
  current: number,
  benchmark: number,
  isHigherBetter: boolean = true
): 'above' | 'below' | 'at' {
  const tolerance = 0.05; // 5% tolerance
  const ratio = current / benchmark;
  
  if (Math.abs(ratio - 1) < tolerance) {
    return 'at';
  }
  
  if (isHigherBetter) {
    return current > benchmark ? 'above' : 'below';
  } else {
    return current < benchmark ? 'above' : 'below';
  }
}