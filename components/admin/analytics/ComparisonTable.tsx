'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Minus, Download, Calendar } from 'lucide-react';
import { ComparisonPeriod, TemporalMetrics, BenchmarkData } from '@/types/analytics';
import TrendIndicator from './TrendIndicator';
import BenchmarkIndicator from './BenchmarkIndicator';
import SparklineChart from './SparklineChart';
import { formatPercentageChange, formatMetricValue } from '@/lib/analytics/temporal-utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ComparisonTableRow {
  key: string;
  label: string;
  current: number;
  previous: number;
  unit: 'number' | 'percentage' | 'currency' | 'duration';
  sparkline?: Array<{ date: string; value: number }>;
  benchmark?: BenchmarkData;
  isHigherBetter?: boolean;
}

interface ComparisonTableProps {
  comparisonPeriod: ComparisonPeriod;
  temporalMetrics: TemporalMetrics;
  benchmarks?: Record<string, BenchmarkData>;
  sparklines?: Record<string, Array<{ date: string; value: number }>>;
  onExport?: () => void;
  className?: string;
}

export default function ComparisonTable({
  comparisonPeriod,
  temporalMetrics,
  benchmarks = {},
  sparklines = {},
  onExport,
  className,
}: ComparisonTableProps) {
  // Define the metrics to display in the table
  const metricsConfig: Omit<ComparisonTableRow, 'current' | 'previous'>[] = [
    {
      key: 'totalLeads',
      label: 'Total de Leads',
      unit: 'number',
      isHigherBetter: true,
    },
    {
      key: 'activeLeads',
      label: 'Leads Ativos',
      unit: 'number',
      isHigherBetter: true,
    },
    {
      key: 'conversionRate',
      label: 'Taxa de Conversão',
      unit: 'percentage',
      isHigherBetter: true,
    },
    {
      key: 'newLeadsWeek',
      label: 'Novos Leads (Semana)',
      unit: 'number',
      isHigherBetter: true,
    },
  ];

  // Prepare table rows
  const rows: ComparisonTableRow[] = metricsConfig.map(config => {
    const comparison = temporalMetrics[config.key];
    if (!comparison) {
      return {
        ...config,
        current: 0,
        previous: 0,
        sparkline: sparklines[config.key],
        benchmark: benchmarks[config.key],
      };
    }

    return {
      ...config,
      current: comparison.current,
      previous: comparison.previous,
      sparkline: sparklines[config.key],
      benchmark: benchmarks[config.key],
    };
  });

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Comparação Detalhada
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Comparando períodos: {format(comparisonPeriod.current.from, 'dd/MM/yyyy', { locale: ptBR })} - 
              {format(comparisonPeriod.current.to, 'dd/MM/yyyy', { locale: ptBR })} vs {' '}
              {format(comparisonPeriod.previous.from, 'dd/MM/yyyy', { locale: ptBR })} - 
              {format(comparisonPeriod.previous.to, 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Period Headers */}
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Métrica</div>
            <div className="col-span-2 text-center">Período Atual</div>
            <div className="col-span-2 text-center">Período Anterior</div>
            <div className="col-span-2 text-center">Mudança</div>
            <div className="col-span-2 text-center">Tendência</div>
            <div className="col-span-1 text-center">Benchmark</div>
          </div>

          <Separator />

          {/* Metrics Rows */}
          <div className="space-y-2">
            {rows.map((row) => {
              const comparison = temporalMetrics[row.key];
              if (!comparison) return null;

              return (
                <div
                  key={row.key}
                  className="grid grid-cols-12 gap-4 items-center py-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  {/* Metric Label */}
                  <div className="col-span-3">
                    <span className="font-medium">{row.label}</span>
                  </div>

                  {/* Current Value */}
                  <div className="col-span-2 text-center">
                    <span className="font-semibold text-lg">
                      {formatMetricValue(row.current, row.unit)}
                    </span>
                  </div>

                  {/* Previous Value */}
                  <div className="col-span-2 text-center">
                    <span className="text-muted-foreground">
                      {formatMetricValue(row.previous, row.unit)}
                    </span>
                  </div>

                  {/* Change Indicator */}
                  <div className="col-span-2 flex justify-center">
                    <TrendIndicator
                      comparison={comparison}
                      size="sm"
                      showValue={false}
                    />
                  </div>

                  {/* Sparkline */}
                  <div className="col-span-2 flex justify-center">
                    {row.sparkline && row.sparkline.length > 1 ? (
                      <SparklineChart
                        data={{
                          data: row.sparkline,
                          trend: comparison.trend,
                          change: comparison.changePercent,
                        }}
                        width={80}
                        height={24}
                        showTrend={false}
                        showTooltip={true}
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Sem dados
                      </div>
                    )}
                  </div>

                  {/* Benchmark */}
                  <div className="col-span-1 flex justify-center">
                    {row.benchmark ? (
                      <BenchmarkIndicator
                        current={row.current}
                        benchmark={row.benchmark}
                        unit={row.unit}
                        size="sm"
                        showProgress={false}
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground">-</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Summary Row */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-3">Resumo da Comparação</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-muted-foreground">Métricas Melhoradas</div>
                <div className="text-lg font-semibold text-green-600">
                  {Object.values(temporalMetrics).filter(m => m.trend === 'up').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Métricas Piores</div>
                <div className="text-lg font-semibold text-red-600">
                  {Object.values(temporalMetrics).filter(m => m.trend === 'down').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Métricas Estáveis</div>
                <div className="text-lg font-semibold text-gray-600">
                  {Object.values(temporalMetrics).filter(m => m.trend === 'neutral').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Acima do Benchmark</div>
                <div className="text-lg font-semibold text-blue-600">
                  {Object.values(benchmarks).filter(b => b.status === 'above').length}
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Insights Automáticos
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              {Object.entries(temporalMetrics).map(([key, comparison]) => {
                if (Math.abs(comparison.changePercent) > 10) {
                  const metric = metricsConfig.find(m => m.key === key);
                  if (!metric) return null;
                  
                  return (
                    <li key={key}>
                      • <strong>{metric.label}</strong> teve uma {comparison.trend === 'up' ? 'melhoria' : 'queda'} de {' '}
                      <strong>{Math.abs(comparison.changePercent).toFixed(1)}%</strong> em relação ao período anterior
                    </li>
                  );
                }
                return null;
              }).filter(Boolean)}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}