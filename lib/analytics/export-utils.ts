import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnalyticsExportData, ComparisonPeriod, TemporalMetrics, BenchmarkData } from '@/types/analytics';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeCharts?: boolean;
  includeBenchmarks?: boolean;
  includeInsights?: boolean;
}

export function generateExportData(
  comparisonPeriod: ComparisonPeriod | null,
  temporalMetrics: TemporalMetrics | null,
  benchmarks: Record<string, BenchmarkData> = {},
  chartData: Record<string, any[]> = {}
): AnalyticsExportData {
  const currentPeriod = comparisonPeriod 
    ? `${format(comparisonPeriod.current.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(comparisonPeriod.current.to, 'dd/MM/yyyy', { locale: ptBR })}`
    : 'Período atual';
    
  const comparisonPeriodLabel = comparisonPeriod 
    ? `${format(comparisonPeriod.previous.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(comparisonPeriod.previous.to, 'dd/MM/yyyy', { locale: ptBR })}`
    : undefined;

  return {
    period: currentPeriod,
    comparisonPeriod: comparisonPeriodLabel,
    metrics: temporalMetrics || {},
    benchmarks,
    charts: Object.entries(chartData).map(([title, data]) => ({
      title,
      type: 'chart',
      data
    }))
  };
}

export function exportToCSV(data: AnalyticsExportData): string {
  const headers = ['Métrica', 'Valor Atual', 'Valor Anterior', 'Mudança (%)', 'Tendência'];
  if (data.benchmarks && Object.keys(data.benchmarks).length > 0) {
    headers.push('Benchmark', 'Status Benchmark');
  }
  
  const rows = [headers];
  
  // Add metrics rows
  Object.entries(data.metrics).forEach(([key, comparison]) => {
    if (typeof comparison === 'object' && comparison !== null && 'current' in comparison) {
      const row = [
        translateMetricKey(key),
        comparison.current.toString(),
        comparison.previous.toString(),
        `${comparison.changePercent.toFixed(1)}%`,
        comparison.trend === 'up' ? '↗' : comparison.trend === 'down' ? '↘' : '→'
      ];
      
      const benchmark = data.benchmarks?.[key];
      if (benchmark) {
        row.push(benchmark.value.toString());
        row.push(benchmark.status === 'above' ? 'Acima' : benchmark.status === 'below' ? 'Abaixo' : 'No alvo');
      }
      
      rows.push(row);
    }
  });
  
  return rows.map(row => row.join(',')).join('\n');
}

export function exportToJSON(data: AnalyticsExportData): string {
  return JSON.stringify(data, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateExportFilename(exportFormat: ExportOptions['format'], period: string): string {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
  const sanitizedPeriod = period.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  return `analytics-${sanitizedPeriod}-${timestamp}.${exportFormat}`;
}

export async function exportAnalytics(
  data: AnalyticsExportData,
  options: ExportOptions
): Promise<void> {
  const filename = generateExportFilename(options.format, data.period);
  
  switch (options.format) {
    case 'csv':
      const csvContent = exportToCSV(data);
      downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
      break;
      
    case 'json':
      const jsonContent = exportToJSON(data);
      downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
      break;
      
    case 'excel':
      // This would require a library like SheetJS
      console.warn('Excel export not implemented yet');
      break;
      
    case 'pdf':
      // This would require a library like jsPDF
      console.warn('PDF export not implemented yet');
      break;
      
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

function translateMetricKey(key: string): string {
  const translations: Record<string, string> = {
    totalLeads: 'Total de Leads',
    activeLeads: 'Leads Ativos',
    conversionRate: 'Taxa de Conversão',
    newLeadsWeek: 'Novos Leads (Semana)',
    averageResponseTime: 'Tempo Médio de Resposta',
    leadsBySource: 'Leads por Fonte',
    leadsByStage: 'Leads por Estágio',
  };
  
  return translations[key] || key;
}

export function generateInsights(
  temporalMetrics: TemporalMetrics,
  benchmarks: Record<string, BenchmarkData>
): string[] {
  const insights: string[] = [];
  
  // Generate trend insights
  Object.entries(temporalMetrics).forEach(([key, comparison]) => {
    if (Math.abs(comparison.changePercent) > 10) {
      const metricName = translateMetricKey(key);
      const change = comparison.changePercent.toFixed(1);
      const direction = comparison.trend === 'up' ? 'aumento' : 'queda';
      
      insights.push(
        `${metricName} teve um ${direction} significativo de ${Math.abs(parseFloat(change))}% comparado ao período anterior.`
      );
    }
  });
  
  // Generate benchmark insights
  Object.entries(benchmarks).forEach(([key, benchmark]) => {
    const comparison = temporalMetrics[key];
    if (comparison && benchmark.status !== 'at') {
      const metricName = translateMetricKey(key);
      const status = benchmark.status === 'above' ? 'acima' : 'abaixo';
      const diff = Math.abs(((comparison.current - benchmark.value) / benchmark.value) * 100).toFixed(1);
      
      insights.push(
        `${metricName} está ${diff}% ${status} do ${benchmark.label.toLowerCase()}.`
      );
    }
  });
  
  // Performance insights
  const performanceMetrics = Object.values(temporalMetrics).filter(m => m.trend === 'up').length;
  const totalMetrics = Object.keys(temporalMetrics).length;
  const performancePercentage = (performanceMetrics / totalMetrics) * 100;
  
  if (performancePercentage >= 75) {
    insights.push('🎉 Excelente performance! A maioria das métricas está melhorando.');
  } else if (performancePercentage >= 50) {
    insights.push('📈 Performance positiva com oportunidades de melhoria.');
  } else if (performancePercentage >= 25) {
    insights.push('⚠️ Performance mista - algumas áreas precisam de atenção.');
  } else {
    insights.push('🔄 Várias métricas em declínio - recomenda-se revisão da estratégia.');
  }
  
  return insights;
}