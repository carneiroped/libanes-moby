'use client';

import { useState, useMemo } from 'react';
import { DateRangePicker } from '@/components/admin/analytics/DateRangePicker';
import { DateRange } from 'react-day-picker';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ConversionFunnel from '@/components/admin/analytics/ConversionFunnel';
import ConversionTrends from '@/components/admin/analytics/ConversionTrends';
import SourceDistribution from '@/components/admin/analytics/SourceDistribution';
import PropertyTypePreference from '@/components/admin/analytics/PropertyTypePreference';
import PropertyHeatmap from '@/components/admin/analytics/PropertyHeatmap';
import AIInsights from '@/components/admin/analytics/AIInsights';
import SalesTimeChart from '@/components/admin/analytics/SalesTimeChart';
import ConversionComparison from '@/components/admin/analytics/ConversionComparison';
import TemporalComparison from '@/components/admin/analytics/TemporalComparison';
import SalesEvolution from '@/components/admin/analytics/SalesEvolution';
import TrendIndicator from '@/components/admin/analytics/TrendIndicator';
import SparklineChart from '@/components/admin/analytics/SparklineChart';
import BenchmarkIndicator from '@/components/admin/analytics/BenchmarkIndicator';
import ComparisonTable from '@/components/admin/analytics/ComparisonTable';
import { Download, Filter, HelpCircle, RefreshCw, Share2, BarChart3, TrendingUp } from 'lucide-react';
import {
  useLeadMetrics,
  useLeadTrends,
  useStageConversions,
  useSourceDistribution,
  usePropertyTypePreference,
  usePropertyConversion,
  useSalesTimeData,
  useConversionComparison,
  useAIInsights,
  useTemporalMetrics,
  useMetricSparklines,
  useBenchmarks,
  useSalesEvolution,
} from '@/hooks/useLeadAnalytics';
import { ComparisonPeriod, ComparisonFilters } from '@/types/analytics';
import { createSparklineData } from '@/lib/analytics/temporal-utils';
import { generateExportData, exportAnalytics } from '@/lib/analytics/export-utils';

export default function AnalyticsPage() {
  const [activeView, setActiveView] = useState<'leads' | 'properties' | 'sales' | 'ai'>('leads');
  const [propertyFilter, setPropertyFilter] = useState<'todos' | 'vendas' | 'locacao'>('todos');
  // Estado do intervalo de datas para o DateRangePicker
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  
  // Temporal comparison state
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod | null>(null);
  const [comparisonFilters, setComparisonFilters] = useState<ComparisonFilters>({
    comparisonType: 'period',
    periodType: 'month',
    benchmarks: true,
    showTrends: true,
  });
  const [comparisonMode, setComparisonMode] = useState<'absolute' | 'comparison'>('absolute');

  // Preparar filtros para APIs
  const dateFilters = {
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString()
  };

  const propertyFilters = {
    ...dateFilters,
    propertyFilter
  };

  // Carregar dados com React Query hooks (COM FILTROS)
  const { data: metrics, isLoading: metricsLoading } = useLeadMetrics(dateFilters);
  const { data: trends, isLoading: trendsLoading } = useLeadTrends('month', dateFilters);
  const { data: stageConversions, isLoading: stageConversionsLoading } = useStageConversions(dateFilters);
  const { data: sourceDistribution, isLoading: sourceDistributionLoading } = useSourceDistribution(dateFilters);
  const { data: propertyTypePreferences, isLoading: propertyTypeLoading } = usePropertyTypePreference(propertyFilters);
  const { data: propertyConversions, isLoading: propertyConversionsLoading } = usePropertyConversion(propertyFilters);
  const { data: salesTimeData, isLoading: salesTimeLoading } = useSalesTimeData(dateFilters);
  const { data: conversionComparison, isLoading: conversionComparisonLoading } = useConversionComparison(dateFilters);
  const { data: salesEvolution, isLoading: salesEvolutionLoading } = useSalesEvolution(dateFilters);
  const { data: aiInsights, isLoading: aiInsightsLoading } = useAIInsights();
  
  // Temporal comparison hooks
  const { data: temporalMetrics, isLoading: temporalMetricsLoading } = useTemporalMetrics(comparisonPeriod || undefined);
  const { data: sparklinesRaw, isLoading: sparklinesLoading } = useMetricSparklines(
    ['totalLeads', 'activeLeads', 'conversionRate', 'newLeadsWeek'],
    comparisonFilters.periodType === 'week' ? 'week' : 'month'
  );
  const { data: benchmarks, isLoading: benchmarksLoading } = useBenchmarks();

  // Transform sparklines to expected format
  const sparklines = useMemo(() => {
    if (!sparklinesRaw) return undefined;
    const transformed: Record<string, Array<{ date: string; value: number }>> = {};
    Object.keys(sparklinesRaw).forEach(key => {
      transformed[key] = sparklinesRaw[key].data;
    });
    return transformed;
  }, [sparklinesRaw]);
  
  // Handlers for temporal comparison
  const handleComparisonChange = (period: ComparisonPeriod | null, filters: ComparisonFilters) => {
    setComparisonPeriod(period);
    setComparisonFilters(filters);
    setComparisonMode(period ? 'comparison' : 'absolute');
  };
  
  const handleExportData = async () => {
    try {
      const exportData = generateExportData(
        comparisonPeriod,
        temporalMetrics || null,
        benchmarks || {},
        {
          trends: trends || [],
          stageConversions: stageConversions || [],
          sourceDistribution: sourceDistribution || [],
        }
      );

      await exportAnalytics(exportData, {
        format: 'csv',
        includeBenchmarks: comparisonFilters.benchmarks,
        includeCharts: true,
        includeInsights: true,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      // You might want to show a toast notification here
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com título, DateRangePicker e filtros */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            {comparisonMode === 'comparison' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Modo Comparação
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
            
            <div className="flex items-center space-x-2">
              <Select
                defaultValue="todos"
                value={propertyFilter}
                onValueChange={(value: any) => setPropertyFilter(value as 'todos' | 'vendas' | 'locacao')}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos imóveis</SelectItem>
                  <SelectItem value="vendas">Apenas vendas</SelectItem>
                  <SelectItem value="locacao">Apenas locação</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Comparison Toggle */}
              <Button 
                variant={comparisonMode === 'comparison' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setComparisonMode(comparisonMode === 'comparison' ? 'absolute' : 'comparison')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Comparar
              </Button>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Temporal Comparison Panel */}
        {comparisonMode === 'comparison' && (
          <TemporalComparison
            onComparisonChange={handleComparisonChange}
            currentDateRange={dateRange}
          />
        )}
      </div>

      {/* Abas principais */}
      <Tabs defaultValue="leads" className="space-y-4" onValueChange={(value: any) => setActiveView(value as 'leads' | 'properties' | 'sales' | 'ai')}>
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="properties">Imóveis</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="ai">Análise de IA</TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* TAB: Leads Analytics */}
        <TabsContent value="leads" className="space-y-4">
          {comparisonMode === 'comparison' && comparisonPeriod && temporalMetrics ? (
            // Comparison mode - show enhanced metrics with trends
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total de Leads with Comparison */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {temporalMetricsLoading ? '...' : temporalMetrics.totalLeads?.current || 0}
                      </div>
                      {sparklinesRaw?.totalLeads && (
                        <SparklineChart
                          data={sparklinesRaw.totalLeads}
                          width={60}
                          height={24}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <TrendIndicator
                        comparison={temporalMetrics.totalLeads}
                        benchmark={benchmarks?.totalLeads}
                        size="sm"
                        showValue={false}
                      />
                      {comparisonFilters.benchmarks && benchmarks?.totalLeads && (
                        <BenchmarkIndicator
                          current={temporalMetrics.totalLeads.current}
                          benchmark={benchmarks.totalLeads}
                          size="sm"
                          showProgress={false}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leads gerados no período
                    </p>
                  </CardContent>
                </Card>

                {/* Taxa de Conversão with Comparison */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {temporalMetricsLoading ? '...' : `${temporalMetrics.conversionRate?.current.toFixed(1) || 0}%`}
                      </div>
                      {sparklinesRaw?.conversionRate && (
                        <SparklineChart
                          data={sparklinesRaw.conversionRate}
                          width={60}
                          height={24}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <TrendIndicator
                        comparison={temporalMetrics.conversionRate}
                        benchmark={benchmarks?.conversionRate}
                        size="sm"
                        showValue={false}
                      />
                      {comparisonFilters.benchmarks && benchmarks?.conversionRate && (
                        <BenchmarkIndicator
                          current={temporalMetrics.conversionRate.current}
                          benchmark={benchmarks.conversionRate}
                          unit="percentage"
                          size="sm"
                          showProgress={false}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leads que avançaram no funil
                    </p>
                  </CardContent>
                </Card>

                {/* Leads Ativos with Comparison */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Leads Ativos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {temporalMetricsLoading ? '...' : temporalMetrics.activeLeads?.current || 0}
                      </div>
                      {sparklinesRaw?.activeLeads && (
                        <SparklineChart
                          data={sparklinesRaw.activeLeads}
                          width={60}
                          height={24}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <TrendIndicator
                        comparison={temporalMetrics.activeLeads}
                        benchmark={benchmarks?.activeLeads}
                        size="sm"
                        showValue={false}
                      />
                      {comparisonFilters.benchmarks && benchmarks?.activeLeads && (
                        <BenchmarkIndicator
                          current={temporalMetrics.activeLeads.current}
                          benchmark={benchmarks.activeLeads}
                          size="sm"
                          showProgress={false}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leads em acompanhamento ativo
                    </p>
                  </CardContent>
                </Card>

                {/* Leads Novos with Comparison */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Leads Novos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {temporalMetricsLoading ? '...' : temporalMetrics.newLeadsWeek?.current || 0}
                      </div>
                      {sparklinesRaw?.newLeadsWeek && (
                        <SparklineChart
                          data={sparklinesRaw.newLeadsWeek}
                          width={60}
                          height={24}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <TrendIndicator
                        comparison={temporalMetrics.newLeadsWeek}
                        benchmark={benchmarks?.newLeadsWeek}
                        size="sm"
                        showValue={false}
                      />
                      {comparisonFilters.benchmarks && benchmarks?.newLeadsWeek && (
                        <BenchmarkIndicator
                          current={temporalMetrics.newLeadsWeek.current}
                          benchmark={benchmarks.newLeadsWeek}
                          size="sm"
                          showProgress={false}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Novos leads nos últimos 7 dias
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Comparison Table */}
              <ComparisonTable
                comparisonPeriod={comparisonPeriod}
                temporalMetrics={temporalMetrics}
                benchmarks={benchmarks}
                sparklines={sparklines}
                onExport={handleExportData}
              />
            </>
          ) : (
            // Absolute mode - show regular metrics
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Total de Leads */}
              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metricsLoading ? '...' : metrics?.totalLeads || 0}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Leads gerados no período
                  </p>
                </CardContent>
              </Card>

              {/* Taxa de Conversão */}
              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metricsLoading ? '...' : `${metrics?.conversionRate.toFixed(1) || 0}%`}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Leads que avançaram no funil
                  </p>
                </CardContent>
              </Card>

              {/* Leads Ativos */}
              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Leads Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metricsLoading ? '...' : metrics?.activeLeads || 0}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Leads em acompanhamento ativo
                  </p>
                </CardContent>
              </Card>

              {/* Leads Novos */}
              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Leads Novos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metricsLoading ? '...' : metrics?.newLeadsWeek || 0}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Novos leads nos últimos 7 dias
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Funil de Conversão</CardTitle>
                <CardDescription>Acompanhamento do funil de vendas</CardDescription>
              </CardHeader>
              <CardContent>
                <ConversionFunnel
                  data={stageConversions || []}
                  loading={stageConversionsLoading}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Origem dos Leads</CardTitle>
                <CardDescription>Distribuição por canal de origem</CardDescription>
              </CardHeader>
              <CardContent>
                <SourceDistribution
                  data={sourceDistribution || []}
                  loading={sourceDistributionLoading}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tendência de Leads</CardTitle>
              <CardDescription>Evolução temporal da captação de leads</CardDescription>
            </CardHeader>
            <CardContent>
              <ConversionTrends
                data={trends || []}
                loading={trendsLoading}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Comparação de Conversão</CardTitle>
                <CardDescription>Comparativo entre períodos</CardDescription>
              </CardHeader>
              <CardContent>
                <ConversionComparison
                  data={conversionComparison || []}
                  loading={conversionComparisonLoading}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tempo até a Venda</CardTitle>
                <CardDescription>Tempo médio do contato até conversão</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesTimeChart
                  data={salesTimeData || []}
                  loading={salesTimeLoading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: Properties Analytics */}
        <TabsContent value="properties" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Preferência por Tipo</CardTitle>
                <CardDescription>Tipos de imóveis mais procurados</CardDescription>
              </CardHeader>
              <CardContent>
                <PropertyTypePreference
                  data={propertyTypePreferences || []}
                  loading={propertyTypeLoading}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Imóvel</CardTitle>
                <CardDescription>Taxa de conversão dos principais imóveis</CardDescription>
              </CardHeader>
              <CardContent>
                <PropertyHeatmap
                  data={propertyConversions || []}
                  loading={propertyConversionsLoading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: Sales Analytics */}
        <TabsContent value="sales" className="space-y-4">
          <SalesEvolution
            data={salesEvolution || []}
            loading={salesEvolutionLoading}
          />
        </TabsContent>

        {/* TAB: AI Analysis */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Insights de IA</CardTitle>
              <CardDescription>Análises automáticas geradas por inteligência artificial</CardDescription>
            </CardHeader>
            <CardContent>
              <AIInsights
                insights={aiInsights || []}
                loading={aiInsightsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}